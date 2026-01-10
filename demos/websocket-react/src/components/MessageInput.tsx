import React, { useState, useRef, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { Send } from './common/Icons';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const InputContainer = styled.div`
  padding: 0 16px 24px;
  background: #313338;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: flex-end;
  background: #383A40;
  border-radius: 8px;
  padding: 0 4px 0 16px;
`;

const TextArea = styled.textarea<{ $hasError?: boolean }>`
  flex: 1;
  min-height: 44px;
  max-height: 200px;
  padding: 12px 0;
  background: transparent;
  border: none;
  font-size: 14px;
  line-height: 1.4;
  color: #F2F3F5;
  resize: none;
  outline: none;

  &::placeholder {
    color: #72767D;
  }

  &:disabled {
    color: #72767D;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  width: 40px;
  height: 40px;
  margin: 2px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #949BA4;
  transition: color 0.1s ease, background 0.1s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    color: #F2F3F5;
    background: #404249;
  }

  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  &.active {
    color: #5865F2;

    &:hover:not(:disabled) {
      color: #7983F5;
    }
  }
`;

const HintText = styled.div`
  padding: 8px 16px 0;
  font-size: 11px;
  color: #72767D;
`;

const CharCount = styled.span<{ $isOver?: boolean }>`
  float: right;
  color: ${props => props.$isOver ? '#ED4245' : '#72767D'};
`;

const MessageInput: React.FC<MessageInputProps> = observer(({
  onSendMessage,
  onTypingChange,
  disabled = false,
  placeholder = '输入消息...',
  maxLength = 500
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOverLimit = message.length > maxLength;
  const canSend = message.trim().length > 0 && !disabled && !isOverLimit;

  // 停止输入状态（先定义，被其他函数依赖）
  const stopTyping = useCallback((): void => {
    if (isTyping && onTypingChange) {
      setIsTyping(false);
      onTypingChange(false);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [isTyping, onTypingChange]);

  // 开始输入状态（依赖 stopTyping）
  const startTyping = useCallback((): void => {
    if (!isTyping && onTypingChange) {
      setIsTyping(true);
      onTypingChange(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  }, [isTyping, onTypingChange, stopTyping]);

  // 提交消息（依赖 stopTyping）
  const handleSubmit = useCallback((e?: React.FormEvent): void => {
    e?.preventDefault();
    if (canSend) {
      onSendMessage(message.trim());
      setMessage('');
      stopTyping();

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }
  }, [canSend, message, onSendMessage, stopTyping]);

  // 处理键盘事件（依赖 handleSubmit）
  const handleKeyDown = useCallback((e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // 处理输入变化（依赖 startTyping, stopTyping）
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim() && !disabled) {
      startTyping();
    } else {
      stopTyping();
    }

    // Auto-resize
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, [disabled, startTyping, stopTyping]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <InputContainer>
      <form onSubmit={handleSubmit}>
        <InputWrapper>
          <TextArea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            $hasError={isOverLimit}
            rows={1}
          />
          <SendButton
            type="submit"
            disabled={!canSend}
            className={canSend ? 'active' : ''}
            title="发送消息"
          >
            <Send size={20} />
          </SendButton>
        </InputWrapper>
      </form>

      {maxLength && (
        <HintText>
          按 Enter 发送，Shift+Enter 换行
          <CharCount $isOver={isOverLimit}>
            {message.length}/{maxLength}
          </CharCount>
        </HintText>
      )}
    </InputContainer>
  );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
