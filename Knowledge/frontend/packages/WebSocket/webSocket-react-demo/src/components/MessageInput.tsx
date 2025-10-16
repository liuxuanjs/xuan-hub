import React, { useState, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

const InputContainer = styled.div`
  padding: 20px;
  background: white;
  border-top: 1px solid #e1e8ed;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 768px) {
    padding: 16px;
    gap: 10px;
  }
`;

const InputRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;

  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const InputWrapper = styled.div`
  flex: 1;
  position: relative;
`;

const TextArea = styled.textarea<{ hasError?: boolean }>`
  width: 100%;
  min-height: 44px;
  max-height: 120px;
  padding: 12px 50px 12px 16px;
  border: 2px solid ${props => props.hasError ? '#f44336' : '#e1e8ed'};
  border-radius: 22px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  transition: all 0.3s ease;
  background: #fafafa;
  line-height: 1.4;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#f44336' : '#667eea'};
    background: white;
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(244, 67, 54, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }

  &::placeholder {
    color: #999;
  }

  &:disabled {
    background: #f5f5f5;
    color: #999;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    font-size: 16px; /* 防止 iOS 缩放 */
    padding: 10px 45px 10px 14px;
  }
`;

const EmojiButton = styled.button`
  position: absolute;
  right: 12px;
  bottom: 8px;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #f0f0f0;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SendButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 22px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  min-width: 80px;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 13px;
    min-width: 70px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  background: #f8f9fa;
  border: 1px solid #e1e8ed;
  border-radius: 16px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  color: #666;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover:not(:disabled) {
    background: #e9ecef;
    transform: translateY(-1px);
    border-color: #ccc;
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 5px 10px;
    font-size: 10px;
  }
`;

const EmojiPanel = styled.div`
  position: absolute;
  bottom: 120px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: fadeInUp 0.3s ease-out;
  max-width: 280px;

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @media (max-width: 768px) {
    left: 20px;
    right: 20px;
    bottom: 100px;
    max-width: none;
  }
`;

const EmojiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(8, 1fr);
    gap: 6px;
  }
`;

const EmojiItem = styled.button`
  padding: 8px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
    transform: scale(1.2);
  }

  &:active {
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    padding: 6px;
    font-size: 18px;
  }
`;

const EmojiPanelTitle = styled.div`
  font-size: 12px;
  color: #666;
  text-align: center;
  margin-bottom: 8px;
  font-weight: 500;
`;

const CharacterCount = styled.div<{ isOverLimit: boolean }>`
  font-size: 11px;
  color: ${props => props.isOverLimit ? '#f44336' : '#666'};
  text-align: right;
  margin-top: 4px;
  opacity: 0.8;
`;

const EMOJIS = [
  '😊', '😂', '🤔', '👍', '❤️', '🎉',
  '🚀', '💡', '🔥', '⚡', '🌟', '🎯',
  '😍', '😎', '🤗', '🙃', '😘', '🥰',
  '👏', '🙌', '✨', '💯', '🎊', '🌈'
];

const MessageInput: React.FC<MessageInputProps> = observer(({ 
  onSendMessage, 
  onTypingChange,
  disabled = false, 
  placeholder = "输入消息...",
  maxLength = 500
}) => {
  const [message, setMessage] = useState('');
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isOverLimit = message.length > maxLength;

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (message.trim() && !disabled && !isOverLimit) {
      onSendMessage(message.trim());
      setMessage('');
      setShowEmojiPanel(false);
      stopTyping();
      // 重新聚焦到输入框
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const startTyping = useCallback((): void => {
    if (!isTyping && onTypingChange) {
      setIsTyping(true);
      onTypingChange(true);
    }

    // 重置停止打字的计时器
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 1000);
  }, [isTyping, onTypingChange]);

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

  const handleEmojiClick = (emoji: string): void => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.substring(0, start) + emoji + message.substring(end);
      setMessage(newMessage);
      
      // 设置光标位置
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    }
    setShowEmojiPanel(false);
  };

  const insertQuickText = (text: string): void => {
    setMessage(prev => prev + text);
    textareaRef.current?.focus();
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const value = e.target.value;
    setMessage(value);
    
    // 触发输入状态
    if (value.trim() && !disabled) {
      startTyping();
    } else {
      stopTyping();
    }
    
    // 自动调整高度
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  };

  // 点击外部关闭表情面板
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      const target = event.target as Element;
      if (showEmojiPanel && 
          !target.closest('.emoji-panel') && 
          !target.closest('.emoji-button')) {
        setShowEmojiPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPanel]);

  // 组件卸载时清理定时器
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <InputContainer>
      <form onSubmit={handleSubmit}>
        <InputRow>
          <InputWrapper>
            <TextArea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              hasError={isOverLimit}
            />
            <EmojiButton
              className="emoji-button"
              type="button"
              onClick={() => setShowEmojiPanel(!showEmojiPanel)}
              disabled={disabled}
            >
              😊
            </EmojiButton>
            {maxLength && (
              <CharacterCount isOverLimit={isOverLimit}>
                {message.length}/{maxLength}
              </CharacterCount>
            )}
          </InputWrapper>
          
          <SendButton 
            type="submit" 
            disabled={disabled || !message.trim() || isOverLimit}
          >
            <span>📤</span>
            发送
          </SendButton>
        </InputRow>
      </form>

      <ActionButtons>
        <ActionButton 
          onClick={() => insertQuickText('👍 ')}
          disabled={disabled}
        >
          <span>👍</span>
          赞同
        </ActionButton>
        <ActionButton 
          onClick={() => insertQuickText('❤️ ')}
          disabled={disabled}
        >
          <span>❤️</span>
          喜欢
        </ActionButton>
        <ActionButton 
          onClick={() => insertQuickText('🤔 ')}
          disabled={disabled}
        >
          <span>🤔</span>
          疑问
        </ActionButton>
        <ActionButton 
          onClick={() => insertQuickText('🎉 ')}
          disabled={disabled}
        >
          <span>🎉</span>
          庆祝
        </ActionButton>
      </ActionButtons>

      {showEmojiPanel && (
        <EmojiPanel className="emoji-panel">
          <EmojiPanelTitle>选择表情</EmojiPanelTitle>
          <EmojiGrid>
            {EMOJIS.map((emoji, index) => (
              <EmojiItem
                key={index}
                onClick={() => handleEmojiClick(emoji)}
              >
                {emoji}
              </EmojiItem>
            ))}
          </EmojiGrid>
        </EmojiPanel>
      )}
    </InputContainer>
  );
});

MessageInput.displayName = 'MessageInput';

export default MessageInput;
