<template>
  <div class="login-container">
    <div class="login-header">
      <h1 class="login-title">WebSocket 聊天室</h1>
      <p class="login-subtitle">基于 Vue 3 + Pinia + TypeScript 构建</p>
    </div>

    <form class="login-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="username" class="form-label">用户名</label>
        <input
          id="username"
          v-model="formData.username"
          type="text"
          class="form-input"
          placeholder="请输入您的用户名"
          :disabled="loading"
          maxlength="20"
          required
        />
      </div>

      <div class="form-group">
        <label for="serverUrl" class="form-label">服务器地址</label>
        <input
          id="serverUrl"
          v-model="formData.serverUrl"
          type="url"
          class="form-input"
          placeholder="ws://localhost:8080"
          :disabled="loading"
          required
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <button 
        type="submit" 
        class="login-button"
        :disabled="loading || !isFormValid"
      >
        <span v-if="loading" class="loading-spinner"></span>
        {{ loading ? '连接中...' : '加入聊天室' }}
      </button>
    </form>

    <div class="login-footer">
      <div class="features">
        <div class="feature-item">
          <span class="feature-icon">🚀</span>
          <span class="feature-text">实时通信</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">🔒</span>
          <span class="feature-text">安全连接</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">⚡</span>
          <span class="feature-text">高性能</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { LoginFormData, LoginFormProps } from '@/types'

// Props
defineProps<LoginFormProps>()

// Emits
const emit = defineEmits<{
  login: [data: LoginFormData]
}>()

// 表单数据
const formData = reactive<LoginFormData>({
  username: '',
  serverUrl: 'ws://localhost:8080',
})

// 计算属性
const isFormValid = computed<boolean>(() => {
  return formData.username.trim().length >= 2 && 
         formData.serverUrl.trim().length > 0
})

// 处理表单提交
const handleSubmit = (): void => {
  if (isFormValid.value) {
    emit('login', { ...formData })
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 2rem;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.login-form {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background: #fafafa;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.login-button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.login-footer {
  text-align: center;
}

.features {
  display: flex;
  gap: 2rem;
  justify-content: center;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.feature-icon {
  font-size: 1.5rem;
}

.feature-text {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-title {
    font-size: 2rem;
  }
  
  .login-form {
    padding: 1.5rem;
  }
  
  .features {
    gap: 1rem;
  }
}
</style>
