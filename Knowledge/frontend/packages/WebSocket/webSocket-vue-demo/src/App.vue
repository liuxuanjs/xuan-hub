<template>
  <div class="app-container">
    <ChatRoom 
      v-if="appStore.isLoggedIn && appStore.currentUser" 
      :user="appStore.currentUser" 
      :server-url="appStore.serverUrl"
      @logout="handleLogout"
    />
    <LoginForm 
      v-else
      :loading="appStore.isLoading"
      :error="appStore.globalError"
      @login="handleLogin"
    />
  </div>
</template>

<script setup lang="ts">
import { useWebSocketChat } from '@/composables/useWebSocketChat'
import LoginForm from '@/components/LoginForm.vue'
import ChatRoom from '@/components/ChatRoom.vue'
import type { LoginFormData } from '@/types'

const { appStore, login, logout } = useWebSocketChat()

// 处理登录
const handleLogin = async (data: LoginFormData): Promise<void> => {
  try {
    await login(data)
  } catch (_error) {
    // 错误已经在 composable 中处理
  }
}

// 处理登出
const handleLogout = (): void => {
  logout()
}
</script>

<style scoped>
.app-container {
  width: 100%;
  max-width: 1200px;
  height: 80vh;
  min-height: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.6s ease-out;
}

@media (max-width: 768px) {
  .app-container {
    width: 100%;
    height: 95vh;
    min-height: 500px;
    border-radius: 10px;
    margin: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
