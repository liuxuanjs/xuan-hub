import React, { useEffect, useRef, forwardRef } from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import type { MessageListProps, Message } from '@/types';

const MessageContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(to bottom, #fafafa 0%, #f0f2f5 100%);
  display: flex;
  flex-direction: column;
  gap: 12px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #999;
  }

  @media (max-width: 768px) {
    padding: 16px;
    gap: 10px;
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  animation: fadeIn 0.6s ease-out;

  h3 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #333;
  }

  p {
    font-size: 14px;
    line-height: 1.5;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

interface MessageProps {
  type: Message['type'];
}

const MessageBubble = styled.div<MessageProps>`
  max-width: 75%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  word-break: break-word;
  animation: messageSlideIn 0.3s ease-out;
  line-height: 1.4;
  position: relative;

  @keyframes messageSlideIn {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  ${props => {
    switch (props.type) {
      case 'message':
        return `
          align-self: flex-end;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-bottom-right-radius: 6px;
          margin-left: auto;
        `;
      default:
        return `
          align-self: flex-start;
          background: white;
          color: #333;
          border: 1px solid #e1e8ed;
          border-bottom-left-radius: 6px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        `;
    }
  }}

  ${props => props.type === 'system' && `
    align-self: center;
    background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
    color: #856404;
    text-align: center;
    max-width: 90%;
    font-size: 13px;
    border-radius: 12px;
    border: 1px solid #ffd93d;
  `}

  @media (max-width: 768px) {
    max-width: 85%;
    padding: 10px 14px;
    font-size: 14px;
  }
`;

const OtherMessageBubble = styled(MessageBubble)`
  align-self: flex-start;
  background: white;
  color: #333;
  border: 1px solid #e1e8ed;
  border-bottom-left-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const MessageHeader = styled.div`
  font-size: 11px;
  opacity: 0.8;
  margin-bottom: 4px;
  font-weight: 600;
  letter-spacing: 0.3px;
`;

const MessageContent = styled.div`
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

interface MessageTimeProps {
  type: Message['type'];
}

const MessageTime = styled.div<MessageTimeProps>`
  font-size: 10px;
  opacity: 0.6;
  margin-top: 6px;
  text-align: right;

  ${props => props.type !== 'message' && `
    text-align: left;
  `}

  ${props => props.type === 'system' && `
    text-align: center;
  `}
`;

const MessageList = forwardRef<HTMLDivElement, MessageListProps>(({ messages, currentUser }, _ref) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      // 今天的消息只显示时间
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      // 其他日期显示日期和时间
      return date.toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const escapeHtml = (text: string): string => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  const renderMessage = (message: Message): React.ReactElement => {
    const { id, username, content, type, timestamp } = message;

    if (type === 'system') {
      return (
        <MessageBubble key={id} type={type}>
          <MessageContent>{escapeHtml(content)}</MessageContent>
          <MessageTime type={type}>
            {formatTime(timestamp)}
          </MessageTime>
        </MessageBubble>
      );
    }

    const isOwnMessage = username === currentUser;
    const MessageComponent = isOwnMessage ? MessageBubble : OtherMessageBubble;

    return (
      <MessageComponent key={id} type={isOwnMessage ? 'message' : 'other'}>
        {!isOwnMessage && (
          <MessageHeader>{escapeHtml(username)}</MessageHeader>
        )}
        <MessageContent>{escapeHtml(content)}</MessageContent>
        <MessageTime type={isOwnMessage ? 'message' : 'other'}>
          {formatTime(timestamp)}
        </MessageTime>
      </MessageComponent>
    );
  };

  return (
    <MessageContainer ref={containerRef}>
      {messages.length === 0 ? (
        <WelcomeMessage>
          <h3>🎉 欢迎来到 WebSocket 聊天室！</h3>
          <p>这是一个基于 React + MobX + TypeScript 的实时聊天演示</p>
          <p>支持自动重连、心跳检测、消息队列等高级功能</p>
          <p>开始聊天吧～</p>
        </WelcomeMessage>
      ) : (
        messages.map(renderMessage)
      )}
      <div ref={messagesEndRef} />
    </MessageContainer>
  );
});

MessageList.displayName = 'MessageList';

export default observer(MessageList);
