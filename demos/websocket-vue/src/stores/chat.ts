import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { 
  Message, 
  User, 
  Notification, 
  NotificationLevel,
  WebSocketMessage,
  ChatMessage,
  SystemMessage,
  UserActionMessage,
  UserListMessage,
  ErrorMessage,
  TypingMessage
} from '@/types'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const messages = ref<Message[]>([])
  const users = ref<User[]>([])
  const notifications = ref<Notification[]>([])
  const typingUsers = ref<string[]>([])
  const isTyping = ref<boolean>(false)

  // 计算属性
  const messageCount = computed<number>(() => messages.value.length)
  const userCount = computed<number>(() => users.value.length)
  const hasNotifications = computed<boolean>(() => notifications.value.length > 0)
  const hasTypingUsers = computed<boolean>(() => typingUsers.value.length > 0)

  // 最新消息（用于通知）
  const latestMessage = computed<Message | null>(() => {
    return messages.value.length > 0 ? messages.value[messages.value.length - 1] : null
  })

  // Actions - 消息管理
  const addMessage = (messageData: Omit<Message, 'id'>): Message => {
    const message: Message = {
      id: uuidv4(),
      ...messageData,
    }
    
    messages.value.push(message)
    
    // 限制消息数量，避免内存泄漏
    if (messages.value.length > 1000) {
      messages.value = messages.value.slice(-500)
    }
    
    return message
  }

  const addChatMessage = (username: string, content: string): Message => {
    return addMessage({
      type: 'message',
      username,
      content,
      timestamp: Date.now(),
    })
  }

  const addSystemMessage = (content: string): Message => {
    return addMessage({
      type: 'system',
      username: '',
      content,
      timestamp: Date.now(),
    })
  }

  const addUserActionMessage = (type: 'join' | 'leave', username: string): Message => {
    const content = type === 'join' ? `${username} 加入了聊天室` : `${username} 离开了聊天室`
    return addMessage({
      type,
      username,
      content,
      timestamp: Date.now(),
    })
  }

  const clearMessages = (): void => {
    messages.value = []
  }

  // Actions - 用户管理
  const setUsers = (userList: User[]): void => {
    users.value = [...userList]
  }

  const addUser = (user: User): void => {
    const existingIndex = users.value.findIndex(u => u.username === user.username)
    if (existingIndex === -1) {
      users.value.push(user)
    } else {
      users.value[existingIndex] = user
    }
  }

  const removeUser = (username: string): void => {
    const index = users.value.findIndex(u => u.username === username)
    if (index > -1) {
      users.value.splice(index, 1)
    }
  }

  const updateUserLastSeen = (username: string): void => {
    const user = users.value.find(u => u.username === username)
    if (user) {
      user.lastSeen = Date.now()
    }
  }

  const clearUsers = (): void => {
    users.value = []
  }

  // Actions - 通知管理
  const addNotification = (
    message: string, 
    type: NotificationLevel = 'info', 
    duration: number = 5000
  ): Notification => {
    const notification: Notification = {
      id: uuidv4(),
      message,
      type,
      duration,
      timestamp: Date.now(),
      autoClose: duration > 0,
    }
    
    notifications.value.push(notification)
    
    // 自动移除通知
    if (notification.autoClose) {
      setTimeout(() => {
        removeNotification(notification.id)
      }, duration)
    }
    
    return notification
  }

  const removeNotification = (id: string): void => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index > -1) {
      notifications.value.splice(index, 1)
    }
  }

  const clearNotifications = (): void => {
    notifications.value = []
  }

  // Actions - 输入状态管理
  const setTyping = (typing: boolean): void => {
    isTyping.value = typing
  }

  const addTypingUser = (username: string): void => {
    if (!typingUsers.value.includes(username)) {
      typingUsers.value.push(username)
    }
    
    // 5秒后自动移除
    setTimeout(() => {
      removeTypingUser(username)
    }, 5000)
  }

  const removeTypingUser = (username: string): void => {
    const index = typingUsers.value.indexOf(username)
    if (index > -1) {
      typingUsers.value.splice(index, 1)
    }
  }

  const clearTypingUsers = (): void => {
    typingUsers.value = []
  }

  // Actions - WebSocket 消息处理
  const handleWebSocketMessage = (data: WebSocketMessage): void => {
    try {
      switch (data.type) {
        case 'message':
          handleChatMessage(data as ChatMessage)
          break
        case 'system':
          handleSystemMessage(data as SystemMessage)
          break
        case 'join':
        case 'leave':
          handleUserActionMessage(data as UserActionMessage)
          break
        case 'userList':
          handleUserListMessage(data as UserListMessage)
          break
        case 'error':
          handleErrorMessage(data as ErrorMessage)
          break
        case 'typing':
          handleTypingMessage(data as TypingMessage)
          break
        default:
          // eslint-disable-next-line no-console
          console.warn('未知的消息类型:', data)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('处理 WebSocket 消息失败:', error)
      addNotification('消息处理失败', 'error')
    }
  }

  const handleChatMessage = (message: ChatMessage): void => {
    addMessage({
      type: message.type,
      username: message.username,
      content: message.content,
      timestamp: message.timestamp,
    })
  }

  const handleSystemMessage = (message: SystemMessage): void => {
    addSystemMessage(message.content)
  }

  const handleUserActionMessage = (message: UserActionMessage): void => {
    addUserActionMessage(message.type, message.username)
    
    if (message.type === 'join') {
      addUser({
        username: message.username,
        joinTime: message.timestamp,
        isOnline: true,
      })
      addNotification(`${message.username} 加入了聊天室`, 'info', 3000)
    } else if (message.type === 'leave') {
      removeUser(message.username)
      addNotification(`${message.username} 离开了聊天室`, 'info', 3000)
    }
  }

  const handleUserListMessage = (message: UserListMessage): void => {
    setUsers(message.users)
  }

  const handleErrorMessage = (message: ErrorMessage): void => {
    addNotification(message.content, 'error', 8000)
  }

  const handleTypingMessage = (message: TypingMessage): void => {
    if (message.isTyping) {
      addTypingUser(message.username)
    } else {
      removeTypingUser(message.username)
    }
  }

  // Actions - 数据重置
  const reset = (): void => {
    clearMessages()
    clearUsers()
    clearNotifications()
    clearTypingUsers()
    setTyping(false)
  }

  // 辅助方法
  const getMessagesByUser = (username: string): Message[] => {
    return messages.value.filter(msg => msg.username === username)
  }

  const getMessagesInTimeRange = (startTime: number, endTime: number): Message[] => {
    return messages.value.filter(msg => 
      msg.timestamp >= startTime && msg.timestamp <= endTime
    )
  }

  const findUser = (username: string): User | undefined => {
    return users.value.find(user => user.username === username)
  }

  const isUserOnline = (username: string): boolean => {
    const user = findUser(username)
    return user ? user.isOnline : false
  }

  return {
    // 状态
    messages,
    users,
    notifications,
    typingUsers,
    isTyping,
    
    // 计算属性
    messageCount,
    userCount,
    hasNotifications,
    hasTypingUsers,
    latestMessage,
    
    // Actions - 消息管理
    addMessage,
    addChatMessage,
    addSystemMessage,
    addUserActionMessage,
    clearMessages,
    
    // Actions - 用户管理
    setUsers,
    addUser,
    removeUser,
    updateUserLastSeen,
    clearUsers,
    
    // Actions - 通知管理
    addNotification,
    removeNotification,
    clearNotifications,
    
    // Actions - 输入状态管理
    setTyping,
    addTypingUser,
    removeTypingUser,
    clearTypingUsers,
    
    // Actions - WebSocket 消息处理
    handleWebSocketMessage,
    
    // Actions - 数据重置
    reset,
    
    // 辅助方法
    getMessagesByUser,
    getMessagesInTimeRange,
    findUser,
    isUserOnline,
  }
})
