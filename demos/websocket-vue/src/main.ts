import { createApp } from 'vue'
import { pinia } from '@/stores'
import App from './App.vue'

// 创建应用实例
const app = createApp(App)

// 使用 Pinia
app.use(pinia)

// 开发模式下暴露 stores 到全局
if (import.meta.env.DEV) {
  import('@/stores').then(({ useAppStore, useWebSocketStore, useChatStore }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).stores = {
      appStore: useAppStore(),
      webSocketStore: useWebSocketStore(),
      chatStore: useChatStore(),
    }
  })
}

// 挂载应用
app.mount('#app')
