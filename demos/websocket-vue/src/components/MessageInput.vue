<template>
  <div class="message-input-container">
    <div class="input-wrapper">
      <textarea
        ref="textareaRef"
        v-model="messageText"
        class="message-textarea"
        :placeholder="placeholder"
        :disabled="disabled"
        @keydown="handleKeyDown"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        rows="1"
        maxlength="500"
      ></textarea>
      
      <div class="input-actions">
        <div class="char-counter" :class="{ warning: isNearLimit, error: isOverLimit }">
          {{ messageText.length }}/500
        </div>
        
        <button 
          class="send-button"
          :disabled="!canSend"
          @click="handleSend"
          title="发送消息 (Enter)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22,2 15,22 11,13 2,9"></polygon>
          </svg>
        </button>
      </div>
    </div>
    
    <div class="input-help">
      <span class="help-text">
        <kbd>Enter</kbd> 发送 • <kbd>Shift + Enter</kbd> 换行
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import type { MessageInputProps } from '@/types'

// Props
const props = withDefaults(defineProps<MessageInputProps>(), {
  disabled: false,
  placeholder: '输入消息...',
})

// Emits
const emit = defineEmits<{
  sendMessage: [content: string]
  typing: [isTyping: boolean]
}>()

// 引用
const textareaRef = ref<HTMLTextAreaElement>()

// 状态
const messageText = ref<string>('')
const isFocused = ref<boolean>(false)
const typingTimer = ref<number | null>(null)
const isTypingEmitted = ref<boolean>(false)

// 计算属性
const canSend = computed<boolean>(() => {
  return !props.disabled && messageText.value.trim().length > 0 && !isOverLimit.value
})

const isNearLimit = computed<boolean>(() => {
  return messageText.value.length >= 400
})

const isOverLimit = computed<boolean>(() => {
  return messageText.value.length > 500
})

// 自动调整 textarea 高度
const adjustTextareaHeight = async (): Promise<void> => {
  await nextTick()
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto'
    const scrollHeight = textareaRef.value.scrollHeight
    const maxHeight = 120 // 最大高度
    textareaRef.value.style.height = Math.min(scrollHeight, maxHeight) + 'px'
  }
}

// 处理键盘事件
const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    handleSend()
  }
}

// 处理输入事件
const handleInput = (): void => {
  adjustTextareaHeight()
  handleTypingStatus()
}

// 处理焦点事件
const handleFocus = (): void => {
  isFocused.value = true
}

const handleBlur = (): void => {
  isFocused.value = false
  
  // 停止输入状态
  if (isTypingEmitted.value) {
    emit('typing', false)
    isTypingEmitted.value = false
  }
  
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
    typingTimer.value = null
  }
}

// 处理输入状态
const handleTypingStatus = (): void => {
  if (props.disabled) return
  
  // 发送正在输入状态
  if (!isTypingEmitted.value && messageText.value.trim().length > 0) {
    emit('typing', true)
    isTypingEmitted.value = true
  }
  
  // 清除之前的定时器
  if (typingTimer.value) {
    clearTimeout(typingTimer.value)
  }
  
  // 3秒后停止输入状态
  typingTimer.value = window.setTimeout(() => {
    if (isTypingEmitted.value) {
      emit('typing', false)
      isTypingEmitted.value = false
    }
  }, 3000)
}

// 发送消息
const handleSend = (): void => {
  if (!canSend.value) return
  
  const content = messageText.value.trim()
  if (content) {
    emit('sendMessage', content)
    messageText.value = ''
    
    // 停止输入状态
    if (isTypingEmitted.value) {
      emit('typing', false)
      isTypingEmitted.value = false
    }
    
    if (typingTimer.value) {
      clearTimeout(typingTimer.value)
      typingTimer.value = null
    }
    
    // 重置 textarea 高度
    adjustTextareaHeight()
    
    // 重新聚焦
    if (textareaRef.value) {
      textareaRef.value.focus()
    }
  }
}
</script>

<style scoped>
.message-input-container {
  padding: 1rem;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  transition: border-color 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: #667eea;
  background: white;
}

.message-textarea {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-size: 1rem;
  line-height: 1.5;
  min-height: 24px;
  max-height: 120px;
  font-family: inherit;
}

.message-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.message-textarea::placeholder {
  color: #9ca3af;
}

.input-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.char-counter {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  transition: color 0.2s ease;
}

.char-counter.warning {
  color: #f59e0b;
}

.char-counter.error {
  color: #ef4444;
}

.send-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.send-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.input-help {
  margin-top: 0.5rem;
  text-align: center;
}

.help-text {
  font-size: 0.75rem;
  color: #9ca3af;
}

.help-text kbd {
  display: inline-block;
  padding: 0.125rem 0.25rem;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.625rem;
  font-weight: 600;
  color: #374151;
}

@media (max-width: 768px) {
  .message-input-container {
    padding: 0.75rem;
  }
  
  .input-wrapper {
    padding: 0.625rem;
  }
  
  .send-button {
    width: 36px;
    height: 36px;
  }
  
  .help-text {
    display: none;
  }
}
</style>
