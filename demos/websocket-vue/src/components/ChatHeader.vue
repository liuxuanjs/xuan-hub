<template>
  <header class="chat-header">
    <div class="header-left">
      <div class="room-info">
        <h2 class="room-title">WebSocket 聊天室</h2>
        <div class="connection-status" :class="statusClass">
          <div class="status-indicator"></div>
          <span class="status-text">{{ connectionStatus }}</span>
        </div>
      </div>
    </div>
    
    <div class="header-right">
      <div class="user-info">
        <div class="user-avatar">
          {{ userInitial }}
        </div>
        <div class="user-details">
          <span class="username">{{ user }}</span>
          <span class="user-status">在线</span>
        </div>
      </div>
      
      <button 
        class="disconnect-button"
        @click="$emit('disconnect')"
        title="退出聊天室"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16,17 21,12 16,7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ChatHeaderProps } from '@/types'

// Props
const props = defineProps<ChatHeaderProps>()

// Emits
defineEmits<{
  disconnect: []
}>()

// 计算属性
const userInitial = computed<string>(() => {
  return props.user.charAt(0).toUpperCase()
})

const statusClass = computed<string>(() => {
  return props.isConnected ? 'connected' : 'disconnected'
})
</script>

<style scoped>
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-left {
  flex: 1;
}

.room-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.room-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.9;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.connection-status.connected .status-indicator {
  background: #10b981;
}

.connection-status.disconnected .status-indicator {
  background: #ef4444;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.username {
  font-weight: 600;
  font-size: 0.875rem;
}

.user-status {
  font-size: 0.75rem;
  opacity: 0.8;
}

.disconnect-button {
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.disconnect-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .chat-header {
    padding: 0.75rem 1rem;
  }
  
  .room-title {
    font-size: 1.125rem;
  }
  
  .user-details {
    display: none;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
}
</style>
