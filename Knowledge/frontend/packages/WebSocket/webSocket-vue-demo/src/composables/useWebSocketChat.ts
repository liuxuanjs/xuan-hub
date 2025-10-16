import { onMounted, onUnmounted } from 'vue'
import { useAppStore, useWebSocketStore, useChatStore } from '@/stores'
import type { LoginFormData } from '@/types'

export function useWebSocketChat() {
  const appStore = useAppStore()
  const webSocketStore = useWebSocketStore()
  const chatStore = useChatStore()

  // 登录方法
  const login = async (data: LoginFormData): Promise<void> => {
    try {
      appStore.setLoading(true)
      appStore.clearError()

      // 验证输入
      if (!data.username.trim()) {
        throw new Error('用户名不能为空')
      }
      
      if (!data.serverUrl.trim()) {
        throw new Error('服务器地址不能为空')
      }

      // 设置应用状态
      appStore.setCurrentUser(data.username.trim())
      appStore.setServerUrl(data.serverUrl.trim())

      // 连接 WebSocket
      await webSocketStore.connect(data.serverUrl.trim())

      // 等待连接建立
      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('连接超时'))
        }, 10000)

        const handleOpen = () => {
          clearTimeout(timeout)
          webSocketStore.removeListener('open', handleOpen)
          webSocketStore.removeListener('error', handleError)
          
          // 发送加入消息
          webSocketStore.send(JSON.stringify({
            type: 'join',
            username: data.username.trim(),
            timestamp: Date.now(),
          }))
          
          resolve()
        }

        const handleError = (_error: Event) => {
          clearTimeout(timeout)
          webSocketStore.removeListener('open', handleOpen)
          webSocketStore.removeListener('error', handleError)
          reject(new Error('连接失败'))
        }

        webSocketStore.onOpen(handleOpen)
        webSocketStore.onError(handleError)
      })

    } catch (error) {
      const message = error instanceof Error ? error.message : '登录失败'
      appStore.setGlobalError(message)
      chatStore.addNotification(message, 'error')
      throw error
    } finally {
      appStore.setLoading(false)
    }
  }

  // 登出方法
  const logout = (): void => {
    try {
      // 断开 WebSocket 连接
      webSocketStore.disconnect()
      
      // 重置所有状态
      appStore.reset()
      chatStore.reset()
      
      chatStore.addNotification('已退出聊天室', 'info', 3000)
    } catch (_error) {
      // 忽略登出错误
    }
  }

  // 发送消息
  const sendMessage = (content: string): void => {
    if (!appStore.currentUser) {
      chatStore.addNotification('请先登录', 'warning')
      return
    }

    if (!content.trim()) {
      chatStore.addNotification('消息内容不能为空', 'warning')
      return
    }

    if (content.length > 500) {
      chatStore.addNotification('消息长度不能超过500个字符', 'warning')
      return
    }

    const success = webSocketStore.send(JSON.stringify({
      type: 'message',
      username: appStore.currentUser,
      content: content.trim(),
      timestamp: Date.now(),
    }))

    if (!success) {
      chatStore.addNotification('消息发送失败，已加入发送队列', 'warning')
    }
  }

  // 发送输入状态
  const sendTypingStatus = (isTyping: boolean): void => {
    if (!appStore.currentUser) return

    webSocketStore.send(JSON.stringify({
      type: 'typing',
      username: appStore.currentUser,
      isTyping,
      timestamp: Date.now(),
    }))
  }

  // 清空消息
  const clearMessages = (): void => {
    chatStore.clearMessages()
    chatStore.addNotification('消息已清空', 'info', 2000)
  }

  // 测试连接
  const testConnection = (): void => {
    if (webSocketStore.isConnected) {
      webSocketStore.sendPing()
      chatStore.addNotification('正在测试连接...', 'info', 3000)
    } else {
      chatStore.addNotification('连接未建立', 'warning')
    }
  }

  // 设置 WebSocket 事件监听
  const setupWebSocketListeners = (): void => {
    // 监听消息
    webSocketStore.onMessage((event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data)
        chatStore.handleWebSocketMessage(data)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('解析 WebSocket 消息失败:', error)
        chatStore.addNotification('收到无效消息', 'error')
      }
    })

    // 监听连接打开
    webSocketStore.onOpen((_event: Event) => {
      chatStore.addNotification('连接已建立', 'success', 3000)
    })

    // 监听连接关闭
    webSocketStore.onClose((event: CloseEvent) => {
      if (event.code !== 1000) {
        chatStore.addNotification('连接已断开', 'warning', 5000)
      }
    })

    // 监听连接错误
    webSocketStore.onError((_error: Event) => {
      chatStore.addNotification('连接发生错误', 'error', 8000)
    })
  }

  // 初始化
  onMounted(() => {
    setupWebSocketListeners()
  })

  // 清理
  onUnmounted(() => {
    webSocketStore.destroy()
  })

  return {
    // Store 状态
    appStore,
    webSocketStore,
    chatStore,
    
    // 方法
    login,
    logout,
    sendMessage,
    sendTypingStatus,
    clearMessages,
    testConnection,
  }
}
