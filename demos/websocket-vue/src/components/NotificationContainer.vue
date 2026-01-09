<template>
  <div class="notification-container">
    <TransitionGroup name="notification" tag="div" class="notification-list">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="getNotificationClass(notification)"
      >
        <div class="notification-icon">
          {{ getNotificationIcon(notification.type) }}
        </div>
        
        <div class="notification-content">
          <div class="notification-message">
            {{ notification.message }}
          </div>
          <div class="notification-time">
            {{ formatTime(notification.timestamp) }}
          </div>
        </div>
        
        <button 
          class="notification-close"
          @click="$emit('remove', notification.id)"
          title="关闭"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import type { Notification, NotificationLevel, NotificationContainerProps } from '@/types'

// Props
defineProps<NotificationContainerProps>()

// Emits
defineEmits<{
  remove: [id: string]
}>()

// 获取通知样式类
const getNotificationClass = (notification: Notification): string[] => {
  return ['notification-item', `notification-${notification.type}`]
}

// 获取通知图标
const getNotificationIcon = (type: NotificationLevel): string => {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }
  return icons[type] || icons.info
}

// 格式化时间
const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  pointer-events: none;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 400px;
}

.notification {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  min-width: 320px;
  pointer-events: auto;
  backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
}

.notification::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  transition: background-color 0.2s ease;
}

.notification-success::before {
  background: #10b981;
}

.notification-error::before {
  background: #ef4444;
}

.notification-warning::before {
  background: #f59e0b;
}

.notification-info::before {
  background: #3b82f6;
}

.notification-icon {
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  line-height: 1.4;
  margin-bottom: 0.25rem;
  word-break: break-word;
}

.notification-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.notification-close {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: -0.25rem;
  margin-right: -0.25rem;
}

.notification-close:hover {
  background: #f3f4f6;
  color: #6b7280;
}

/* 动画效果 */
.notification-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.notification-leave-active {
  transition: all 0.3s cubic-bezier(0.7, 0, 0.84, 0);
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.notification-move {
  transition: transform 0.3s ease;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
  }
  
  .notification-list {
    max-width: none;
  }
  
  .notification {
    min-width: auto;
    padding: 0.875rem;
  }
  
  .notification-message {
    font-size: 0.8125rem;
  }
}

/* 高度适配 */
@media (max-height: 600px) {
  .notification-container {
    top: 10px;
  }
  
  .notification {
    padding: 0.75rem;
  }
}

/* 暗色模式支持 */
@media (prefers-color-scheme: dark) {
  .notification {
    background: rgba(31, 41, 55, 0.95);
    border-color: #374151;
    color: #f9fafb;
  }
  
  .notification-message {
    color: #f9fafb;
  }
  
  .notification-time {
    color: #9ca3af;
  }
  
  .notification-close {
    color: #6b7280;
  }
  
  .notification-close:hover {
    background: #374151;
    color: #9ca3af;
  }
}

/* 减少动画的可访问性设置 */
@media (prefers-reduced-motion: reduce) {
  .notification-enter-active,
  .notification-leave-active,
  .notification-move {
    transition: none;
  }
}
</style>
