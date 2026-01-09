<template>
  <aside class="chat-sidebar">
    <div class="sidebar-header">
      <h3 class="sidebar-title">在线用户</h3>
      <div class="user-count">{{ users.length }}</div>
    </div>
    
    <div class="user-list">
      <div 
        v-for="user in users" 
        :key="user.username"
        class="user-item"
        :class="{ 'current-user': user.username === currentUser }"
      >
        <div class="user-avatar">
          {{ user.username.charAt(0).toUpperCase() }}
        </div>
        <div class="user-info">
          <div class="user-name">
            {{ user.username }}
            <span v-if="user.username === currentUser" class="you-label">(你)</span>
          </div>
          <div class="user-status">
            <div class="status-indicator online"></div>
            <span class="status-text">
              {{ formatJoinTime(user.joinTime) }}
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="!users.length" class="empty-users">
        <div class="empty-icon">👥</div>
        <div class="empty-text">还没有其他用户</div>
      </div>
    </div>
    
    <div class="sidebar-footer">
      <div class="connection-info">
        <div class="info-header">连接信息</div>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">服务器:</span>
            <span class="info-value">{{ formatServerUrl(serverUrl) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">状态:</span>
            <span class="info-value" :class="connectionStatusClass">
              {{ connectionStatusText }}
            </span>
          </div>
          <div v-if="connectionInfo.isConnected" class="info-item">
            <span class="info-label">延迟:</span>
            <span class="info-value">{{ connectionInfo.latency }}ms</span>
          </div>
          <div v-if="connectionInfo.messageQueueLength > 0" class="info-item">
            <span class="info-label">队列:</span>
            <span class="info-value">{{ connectionInfo.messageQueueLength }} 条消息</span>
          </div>
        </div>
      </div>
      
      <div class="sidebar-actions">
        <button 
          class="action-button secondary"
          @click="$emit('clearMessages')"
          title="清空消息"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          清空消息
        </button>
        
        <button 
          class="action-button primary"
          @click="$emit('testConnection')"
          :disabled="!connectionInfo.isConnected"
          title="测试连接"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
          测试连接
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatSidebarProps } from '@/types'

// Props
const props = defineProps<ChatSidebarProps>()

// Emits
defineEmits<{
  clearMessages: []
  testConnection: []
}>()

// 计算属性
const connectionStatusClass = computed(() => {
  return props.connectionInfo.isConnected ? 'connected' : 'disconnected'
})

const connectionStatusText = computed(() => {
  if (props.connectionInfo.isConnecting) return '连接中...'
  if (props.connectionInfo.isConnected) return '已连接'
  return '未连接'
})

// 格式化服务器地址
const formatServerUrl = (url: string): string => {
  try {
    const urlObj = new URL(url)
    return `${urlObj.host}`
  } catch {
    return url
  }
}

// 格式化加入时间
const formatJoinTime = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  
  if (diff < 60000) { // 1分钟内
    return '刚刚加入'
  } else if (diff < 3600000) { // 1小时内
    const minutes = Math.floor(diff / 60000)
    return `${minutes}分钟前加入`
  } else if (diff < 86400000) { // 1天内
    const hours = Math.floor(diff / 3600000)
    return `${hours}小时前加入`
  } else {
    const days = Math.floor(diff / 86400000)
    return `${days}天前加入`
  }
}

</script>

<style scoped>
.chat-sidebar {
  width: 280px;
  background: #f8fafc;
  border-left: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
}

.sidebar-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0;
}

.user-count {
  background: #667eea;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.user-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  transition: background-color 0.2s ease;
}

.user-item:hover {
  background: rgba(102, 126, 234, 0.05);
}

.user-item.current-user {
  background: rgba(102, 126, 234, 0.1);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.current-user .user-avatar {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.you-label {
  font-size: 0.75rem;
  color: #10b981;
  font-weight: 500;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.125rem;
}

.status-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-indicator.online {
  background: #10b981;
}

.status-text {
  font-size: 0.75rem;
  color: #6b7280;
}

.empty-users {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  color: #9ca3af;
  text-align: center;
}

.empty-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  opacity: 0.5;
}

.empty-text {
  font-size: 0.875rem;
}

.sidebar-footer {
  border-top: 1px solid #e5e7eb;
  background: white;
}

.connection-info {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.info-header {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.info-label {
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  color: #374151;
  font-weight: 600;
  text-align: right;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.info-value.connected {
  color: #10b981;
}

.info-value.disconnected {
  color: #ef4444;
}

.sidebar-actions {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button.primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-button.primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.action-button.secondary {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.action-button.secondary:hover {
  background: #e5e7eb;
  color: #374151;
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 滚动条样式 */
.user-list::-webkit-scrollbar {
  width: 4px;
}

.user-list::-webkit-scrollbar-track {
  background: transparent;
}

.user-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

.user-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .chat-sidebar {
    width: 100%;
    max-height: 40vh;
    border-left: none;
    border-top: 1px solid #e5e7eb;
  }
  
  .sidebar-actions {
    flex-direction: row;
  }
  
  .action-button {
    flex: 1;
    padding: 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
