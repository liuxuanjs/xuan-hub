<template>
  <div class="message-list" ref="messageListRef">
    <div class="messages-container">
      <div 
        v-for="message in messages" 
        :key="message.id"
        class="message-wrapper"
        :class="getMessageClass(message)"
      >
        <div class="message-content">
          <div v-if="showUsername(message)" class="message-username">
            {{ message.username }}
          </div>
          
          <div class="message-text">
            {{ message.content }}
          </div>
          
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>
      
      <div v-if="!messages.length" class="empty-state">
        <div class="empty-icon">💬</div>
        <div class="empty-title">还没有消息</div>
        <div class="empty-description">发送第一条消息开始聊天吧！</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import type { Message, MessageListProps } from '@/types'

// Props
const props = defineProps<MessageListProps>()

// 引用
const messageListRef = ref<HTMLElement>()

// 滚动到底部
const scrollToBottom = async (): Promise<void> => {
  await nextTick()
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

// 监听消息变化，自动滚动到底部
watch(
  () => props.messages,
  () => {
    scrollToBottom()
  },
  { deep: true }
)

// 获取消息样式类
const getMessageClass = (message: Message): string[] => {
  const classes = ['message']
  
  if (message.username === props.currentUser) {
    classes.push('message-own')
  } else {
    classes.push('message-other')
  }
  
  if (message.type === 'system') {
    classes.push('message-system')
  } else if (message.type === 'join' || message.type === 'leave') {
    classes.push('message-action')
  }
  
  return classes
}

// 是否显示用户名
const showUsername = (message: Message): boolean => {
  return message.type === 'message' && message.username !== props.currentUser
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
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #f8fafc;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 100%;
}

.message-wrapper {
  display: flex;
  max-width: 70%;
}

.message-wrapper.message-own {
  align-self: flex-end;
  justify-content: flex-end;
}

.message-wrapper.message-other {
  align-self: flex-start;
  justify-content: flex-start;
}

.message-wrapper.message-system,
.message-wrapper.message-action {
  align-self: center;
  max-width: 80%;
  justify-content: center;
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: 16px;
  position: relative;
  word-wrap: break-word;
  max-width: 100%;
}

.message-own .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.message-other .message-content {
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
  border-bottom-left-radius: 4px;
}

.message-system .message-content,
.message-action .message-content {
  background: #f3f4f6;
  color: #6b7280;
  text-align: center;
  border-radius: 20px;
  font-size: 0.875rem;
  font-style: italic;
}

.message-username {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  opacity: 0.8;
}

.message-text {
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;
}

.message-time {
  font-size: 0.625rem;
  margin-top: 0.25rem;
  opacity: 0.7;
  text-align: right;
}

.message-own .message-time {
  text-align: left;
}

.message-system .message-time,
.message-action .message-time {
  text-align: center;
  margin-top: 0.125rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-description {
  font-size: 0.875rem;
  opacity: 0.8;
}

/* 滚动条样式 */
.message-list::-webkit-scrollbar {
  width: 6px;
}

.message-list::-webkit-scrollbar-track {
  background: transparent;
}

.message-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.message-list::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

@media (max-width: 768px) {
  .message-list {
    padding: 0.75rem;
  }
  
  .message-wrapper {
    max-width: 85%;
  }
  
  .message-content {
    padding: 0.625rem 0.875rem;
  }
  
  .message-text {
    font-size: 0.875rem;
  }
}
</style>
