import { createPinia } from 'pinia'

// Stores
export { useAppStore } from './app'
export { useWebSocketStore } from './websocket'
export { useChatStore } from './chat'

// 创建 pinia 实例
export const pinia = createPinia()

export default pinia
