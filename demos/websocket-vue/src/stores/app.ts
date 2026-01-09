import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AppState } from '@/types'

export const useAppStore = defineStore('app', () => {
  // 状态
  const currentUser = ref<string | null>(null)
  const serverUrl = ref<string>('ws://localhost:8080')
  const isLoading = ref<boolean>(false)
  const globalError = ref<string | null>(null)

  // 计算属性
  const isLoggedIn = computed<boolean>(() => !!currentUser.value)

  const appState = computed<AppState>(() => ({
    currentUser: currentUser.value,
    serverUrl: serverUrl.value,
    isLoggedIn: isLoggedIn.value,
  }))

  // Actions
  const setCurrentUser = (username: string | null): void => {
    currentUser.value = username
  }

  const setServerUrl = (url: string): void => {
    serverUrl.value = url
  }

  const setLoading = (loading: boolean): void => {
    isLoading.value = loading
  }

  const setGlobalError = (error: string | null): void => {
    globalError.value = error
  }

  const clearError = (): void => {
    globalError.value = null
  }

  const reset = (): void => {
    currentUser.value = null
    isLoading.value = false
    globalError.value = null
    // 保留 serverUrl 供下次使用
  }

  return {
    // 状态
    currentUser,
    serverUrl,
    isLoading,
    globalError,
    
    // 计算属性
    isLoggedIn,
    appState,
    
    // Actions
    setCurrentUser,
    setServerUrl,
    setLoading,
    setGlobalError,
    clearError,
    reset,
  }
})
