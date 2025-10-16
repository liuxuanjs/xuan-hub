<template>
  <div class="chat-room">
    <ChatHeader 
      :user="user"
      :connection-status="connectionStatus"
      :is-connected="webSocketStore.isConnected"
      @disconnect="$emit('logout')"
    />
    
    <div class="chat-body">
      <div class="chat-main">
        <MessageList 
          :messages="chatStore.messages"
          :current-user="user"
        />
        
        <MessageInput 
          :disabled="!webSocketStore.isConnected"
          :placeholder="inputPlaceholder"
          @send-message="handleSendMessage"
          @typing="handleTyping"
        />
      </div>
      
      <ChatSidebar 
        :users="chatStore.users"
        :current-user="user"
        :server-url="serverUrl"
        :connection-info="webSocketStore.connectionInfo"
        @clear-messages="handleClearMessages"
        @test-connection="handleTestConnection"
      />
    </div>
    
    <NotificationContainer 
      :notifications="chatStore.notifications"
      @remove="handleRemoveNotification"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWebSocketChat } from '@/composables/useWebSocketChat'
import ChatHeader from './ChatHeader.vue'
import MessageList from './MessageList.vue'
import MessageInput from './MessageInput.vue'
import ChatSidebar from './ChatSidebar.vue'
import NotificationContainer from './NotificationContainer.vue'
import type { ChatRoomProps } from '@/types'

// Props
defineProps<ChatRoomProps>()

// Emits
defineEmits<{
  logout: []
}>()

// 使用组合式函数
const { 
  webSocketStore, 
  chatStore, 
  sendMessage, 
  sendTypingStatus, 
  clearMessages, 
  testConnection 
} = useWebSocketChat()

// 计算属性
const connectionStatus = computed<string>(() => {
  if (webSocketStore.isConnecting) return '连接中...'
  if (webSocketStore.isConnected) return '已连接'
  return '未连接'
})

const inputPlaceholder = computed<string>(() => {
  if (!webSocketStore.isConnected) return '连接断开，无法发送消息...'
  if (chatStore.hasTypingUsers) {
    const users = chatStore.typingUsers.join(', ')
    return `${users} 正在输入...`
  }
  return '输入消息...'
})

// 事件处理
const handleSendMessage = (content: string): void => {
  sendMessage(content)
}

const handleTyping = (isTyping: boolean): void => {
  sendTypingStatus(isTyping)
}

const handleClearMessages = (): void => {
  clearMessages()
}

const handleTestConnection = (): void => {
  testConnection()
}

const handleRemoveNotification = (id: string): void => {
  chatStore.removeNotification(id)
}
</script>

<style scoped>
.chat-room {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.chat-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

@media (max-width: 768px) {
  .chat-body {
    flex-direction: column;
  }
}
</style>
