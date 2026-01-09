import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import { v4 as uuidv4 } from 'uuid' // 暂时不使用
import type { 
  WebSocketOptions, 
  ConnectionInfo, 
  WebSocketMessage,
  WebSocketReadyState,
  PingMessage,
  PongMessage 
} from '@/types'

export const useWebSocketStore = defineStore('websocket', () => {
  // 状态
  const socket = ref<WebSocket | null>(null)
  const connectionInfo = ref<ConnectionInfo>({
    url: '',
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    latency: 0,
    messageQueueLength: 0,
  })
  
  const messageQueue = ref<string[]>([])
  const options = ref<WebSocketOptions>({
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
    heartbeatInterval: 30000,
    heartbeatTimeout: 5000,
    enableHeartbeat: true,
    enableAutoReconnect: true,
    debug: true,
  })
  
  // 内部状态
  let reconnectTimer: number | null = null
  let heartbeatTimer: number | null = null
  let heartbeatTimeoutTimer: number | null = null
  let lastPingTimestamp = 0

  // 计算属性
  const readyState = computed<WebSocketReadyState>(() => {
    if (!socket.value) return 'CLOSED'
    
    switch (socket.value.readyState) {
      case WebSocket.CONNECTING:
        return 'CONNECTING'
      case WebSocket.OPEN:
        return 'OPEN'
      case WebSocket.CLOSING:
        return 'CLOSING'
      case WebSocket.CLOSED:
      default:
        return 'CLOSED'
    }
  })

  const isConnected = computed<boolean>(() => readyState.value === 'OPEN')
  const isConnecting = computed<boolean>(() => readyState.value === 'CONNECTING')

  // 事件回调
  const onOpenCallbacks = ref<((_event: Event) => void)[]>([])
  const onMessageCallbacks = ref<((_event: MessageEvent) => void)[]>([])
  const onCloseCallbacks = ref<((_event: CloseEvent) => void)[]>([])
  const onErrorCallbacks = ref<((_error: Event) => void)[]>([])

  // Actions
  const connect = async (url: string, connectOptions?: Partial<WebSocketOptions>): Promise<void> => {
    if (socket.value && isConnected.value) {
      // eslint-disable-next-line no-console
      console.warn('WebSocket 已连接')
      return
    }

    // 更新配置
    if (connectOptions) {
      Object.assign(options.value, connectOptions)
    }

    // 更新连接信息
    connectionInfo.value.url = url
    connectionInfo.value.isConnecting = true
    connectionInfo.value.isConnected = false

    try {
      // eslint-disable-next-line no-console
      log('尝试连接到:', url)
      
      socket.value = new WebSocket(url)
      
      // 设置事件监听器
      socket.value.onopen = handleOpen
      socket.value.onmessage = handleMessage
      socket.value.onclose = handleClose
      socket.value.onerror = handleError

    } catch (error) {
      // eslint-disable-next-line no-console
      log('连接失败:', error)
      connectionInfo.value.isConnecting = false
      throw error
    }
  }

  const disconnect = (): void => {
    // eslint-disable-next-line no-console
    log('主动断开连接')
    
    // 清理定时器
    clearTimers()
    
    // 关闭连接
    if (socket.value) {
      socket.value.close(1000, '用户主动断开')
    }
    
    // 重置状态
    resetConnectionState()
  }

  const send = (data: WebSocketMessage | string): boolean => {
    const message = typeof data === 'string' ? data : JSON.stringify(data)
    
    if (isConnected.value && socket.value) {
      try {
        socket.value.send(message)
        log('发送消息:', data)
        return true
      } catch (error) {
        log('发送消息失败:', error)
        // 添加到队列等待重连后发送
        messageQueue.value.push(message)
        updateMessageQueueLength()
        return false
      }
    } else {
      log('连接未就绪，消息已加入队列:', data)
      messageQueue.value.push(message)
      updateMessageQueueLength()
      return false
    }
  }

  const sendPing = (): void => {
    if (!options.value.enableHeartbeat) return
    
    lastPingTimestamp = Date.now()
    const pingMessage: PingMessage = {
      type: 'ping',
      timestamp: lastPingTimestamp,
    }
    
    if (send(pingMessage)) {
      log('发送心跳')
      startHeartbeatTimeout()
    }
  }

  // 事件监听器管理
  const onOpen = (callback: (_event: Event) => void): void => {
    onOpenCallbacks.value.push(callback)
  }

  const onMessage = (callback: (_event: MessageEvent) => void): void => {
    onMessageCallbacks.value.push(callback)
  }

  const onClose = (callback: (_event: CloseEvent) => void): void => {
    onCloseCallbacks.value.push(callback)
  }

  const onError = (callback: (_error: Event) => void): void => {
    onErrorCallbacks.value.push(callback)
  }

  const removeListener = (type: 'open' | 'message' | 'close' | 'error', callback: Function): void => {
    const callbacks = {
      open: onOpenCallbacks.value,
      message: onMessageCallbacks.value,
      close: onCloseCallbacks.value,
      error: onErrorCallbacks.value,
    }[type]
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const index = callbacks.indexOf(callback as any)
    if (index > -1) {
      callbacks.splice(index, 1)
    }
  }

  // 内部方法
  const handleOpen = (event: Event): void => {
    // eslint-disable-next-line no-console
    log('WebSocket 连接已建立')
    
    connectionInfo.value.isConnected = true
    connectionInfo.value.isConnecting = false
    connectionInfo.value.reconnectAttempts = 0
    connectionInfo.value.lastConnectedAt = Date.now()
    
    // 发送队列中的消息
    flushMessageQueue()
    
    // 启动心跳
    if (options.value.enableHeartbeat) {
      startHeartbeat()
    }
    
    // 调用回调
    onOpenCallbacks.value.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('onOpen 回调执行失败:', error)
      }
    })
    
    if (options.value.onOpen) {
      options.value.onOpen(event)
    }
  }

  const handleMessage = (event: MessageEvent): void => {
    try {
      const data = JSON.parse(event.data)
      // eslint-disable-next-line no-console
      log('收到消息:', data)
      
      // 处理 pong 消息
      if (data.type === 'pong') {
        handlePong(data as PongMessage)
        return
      }
      
      // 调用回调
      onMessageCallbacks.value.forEach(callback => {
        try {
          callback(event)
        } catch (error) {
          console.error('onMessage 回调执行失败:', error)
        }
      })
      
      if (options.value.onMessage) {
        options.value.onMessage(event)
      }
      
    } catch (error) {
      // eslint-disable-next-line no-console
      log('消息解析失败:', error)
    }
  }

  const handleClose = (event: CloseEvent): void => {
    // eslint-disable-next-line no-console
    log('WebSocket 连接已关闭', { code: event.code, reason: event.reason })
    
    connectionInfo.value.isConnected = false
    connectionInfo.value.isConnecting = false
    connectionInfo.value.lastDisconnectedAt = Date.now()
    
    // 清理定时器
    clearTimers()
    
    // 调用回调
    onCloseCallbacks.value.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('onClose 回调执行失败:', error)
      }
    })
    
    if (options.value.onClose) {
      options.value.onClose(event)
    }
    
    // 自动重连
    if (options.value.enableAutoReconnect && event.code !== 1000) {
      scheduleReconnect()
    }
  }

  const handleError = (event: Event): void => {
    // eslint-disable-next-line no-console
    log('WebSocket 错误:', event)
    
    // 调用回调
    onErrorCallbacks.value.forEach(callback => {
      try {
        callback(event)
      } catch (error) {
        console.error('onError 回调执行失败:', error)
      }
    })
    
    if (options.value.onError) {
      options.value.onError(event)
    }
  }

  const handlePong = (pongMessage: PongMessage): void => {
    if (pongMessage.timestamp === lastPingTimestamp) {
      const latency = Date.now() - lastPingTimestamp
      connectionInfo.value.latency = latency
      log(`心跳响应，延迟: ${latency}ms`)
    }
    
    // 清除心跳超时
    if (heartbeatTimeoutTimer) {
      clearTimeout(heartbeatTimeoutTimer)
      heartbeatTimeoutTimer = null
    }
  }

  const scheduleReconnect = (): void => {
    if (connectionInfo.value.reconnectAttempts >= connectionInfo.value.maxReconnectAttempts) {
      log('达到最大重连次数，停止重连')
      return
    }
    
    const delay = Math.min(
      options.value.reconnectInterval! * Math.pow(2, connectionInfo.value.reconnectAttempts),
      30000
    )
    
    log(`${delay}ms 后尝试重连 (${connectionInfo.value.reconnectAttempts + 1}/${connectionInfo.value.maxReconnectAttempts})`)
    
    reconnectTimer = window.setTimeout(() => {
      connectionInfo.value.reconnectAttempts++
      connect(connectionInfo.value.url)
    }, delay)
  }

  const flushMessageQueue = (): void => {
    if (messageQueue.value.length > 0) {
      log(`发送队列中的 ${messageQueue.value.length} 条消息`)
      
      const messages = [...messageQueue.value]
      messageQueue.value = []
      updateMessageQueueLength()
      
      messages.forEach(message => {
        if (socket.value && isConnected.value) {
          socket.value.send(message)
        }
      })
    }
  }

  const startHeartbeat = (): void => {
    if (!options.value.enableHeartbeat) return
    
    heartbeatTimer = window.setInterval(() => {
      sendPing()
    }, options.value.heartbeatInterval!)
  }

  const startHeartbeatTimeout = (): void => {
    heartbeatTimeoutTimer = window.setTimeout(() => {
      log('心跳超时，主动断开连接')
      if (socket.value) {
        socket.value.close(4001, '心跳超时')
      }
    }, options.value.heartbeatTimeout!)
  }

  const clearTimers = (): void => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }
    
    if (heartbeatTimeoutTimer) {
      clearTimeout(heartbeatTimeoutTimer)
      heartbeatTimeoutTimer = null
    }
  }

  const resetConnectionState = (): void => {
    connectionInfo.value.isConnected = false
    connectionInfo.value.isConnecting = false
    connectionInfo.value.reconnectAttempts = 0
    messageQueue.value = []
    updateMessageQueueLength()
  }

  const updateMessageQueueLength = (): void => {
    connectionInfo.value.messageQueueLength = messageQueue.value.length
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const log = (message: string, data?: any): void => {
    if (options.value.debug) {
      // eslint-disable-next-line no-console
      console.log(`[WebSocket] ${message}`, data || '')
    }
  }

  // 清理方法
  const destroy = (): void => {
    disconnect()
    onOpenCallbacks.value = []
    onMessageCallbacks.value = []
    onCloseCallbacks.value = []
    onErrorCallbacks.value = []
  }

  return {
    // 状态
    socket,
    connectionInfo,
    options,
    
    // 计算属性
    readyState,
    isConnected,
    isConnecting,
    
    // Actions
    connect,
    disconnect,
    send,
    sendPing,
    
    // 事件监听器
    onOpen,
    onMessage,
    onClose,
    onError,
    removeListener,
    
    // 清理
    destroy,
  }
})
