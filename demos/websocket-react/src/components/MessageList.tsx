import React, { useEffect, useRef, forwardRef, useCallback, memo } from 'react';
import { observer } from 'mobx-react-lite';
import styled, { keyframes } from 'styled-components';
import type { EnhancedMessage, MessageStatus as MessageStatusType } from '@/types';
import { MessageStatus } from '@/types';
import { User, Check, CheckCheck, Clock, AlertCircle, Loader, RefreshCw, MessageSquare } from './common/Icons';

interface MessageListProps {
  messages: EnhancedMessage[];
  currentUser: string;
  onLoadMore?: () => void;
  onRetry?: (messageId: string) => void;
  isLoadingHistory?: boolean;
  hasMoreHistory?: boolean;
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const MessageContainer = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: #313338;
  display: flex;
  flex-direction: column;
`;

const LoadMoreButton = styled.button`
  align-self: center;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  margin-bottom: 16px;
  background: #2B2D31;
  border-radius: 4px;
  font-size: 12px;
  color: #B5BAC1;
  transition: background 0.1s ease, color 0.1s ease;

  &:hover:not(:disabled) {
    background: #35373C;
    color: #F2F3F5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SpinIcon = styled.span`
  display: flex;
  animation: ${spin} 1s linear infinite;
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #949BA4;
  text-align: center;
`;

const EmptyIcon = styled.div`
  width: 64px;
  height: 64px;
  background: #2B2D31;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  svg {
    color: #5865F2;
  }
`;

const EmptyTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #F2F3F5;
  margin-bottom: 8px;
`;

const EmptyText = styled.p`
  font-size: 14px;
  line-height: 1.5;
  max-width: 300px;
`;

const MessagesWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

// Message Group (same user, within 7 min)
const MessageGroup = styled.div`
  padding: 2px 16px;
  margin: 0 -16px;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  & + & {
    margin-top: 16px;
  }
`;

const MessageGroupHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const Avatar = styled.div<{ $isOwn?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$isOwn ? '#5865F2' : '#3F4147'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    color: ${props => props.$isOwn ? 'white' : '#B5BAC1'};
  }
`;

const MessageMeta = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
`;

const AuthorName = styled.span<{ $isOwn?: boolean }>`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.$isOwn ? '#5865F2' : '#F2F3F5'};
`;

const Timestamp = styled.span`
  font-size: 11px;
  color: #949BA4;
`;

const MessageContent = styled.div<{ $status?: MessageStatusType }>`
  font-size: 14px;
  line-height: 1.4;
  color: #DBDEE1;
  padding-left: 48px;
  word-wrap: break-word;
  white-space: pre-wrap;
  animation: ${fadeIn} 0.15s ease;

  ${props => props.$status === MessageStatus.FAILED && `
    opacity: 0.6;
  `}
`;

const MessageRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 2px 0;
`;

const MessageFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 48px;
  margin-top: 4px;
`;

const StatusIndicator = styled.span<{ $status: MessageStatusType }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: ${props => {
    switch (props.$status) {
      case MessageStatus.FAILED: return '#ED4245';
      case MessageStatus.READ: return '#00A8FC';
      case MessageStatus.DELIVERED:
      case MessageStatus.SENT: return '#23A55A';
      default: return '#949BA4';
    }
  }};
`;

const RetryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #ED4245;
  padding: 2px 6px;
  border-radius: 3px;

  &:hover {
    background: rgba(237, 66, 69, 0.1);
  }
`;

// System message
const SystemMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  margin: 8px 0;
`;

const SystemText = styled.span`
  font-size: 12px;
  color: #949BA4;
  background: #2B2D31;
  padding: 4px 12px;
  border-radius: 4px;
`;

/**
 * 格式化时间戳
 */
const formatTime = (ts: number): string => {
  const date = new Date(ts);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const timeStr = date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (messageDate.getTime() === today.getTime()) {
    return `今天 ${timeStr}`;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (messageDate.getTime() === yesterday.getTime()) {
    return `昨天 ${timeStr}`;
  }

  return `${date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} ${timeStr}`;
};

/**
 * 判断消息是否需要显示头部（用户名、头像）
 */
const shouldShowHeader = (message: EnhancedMessage, prevMessage?: EnhancedMessage): boolean => {
  if (!prevMessage) return true;
  if (message.type === 'system' || prevMessage.type === 'system') return true;
  if (message.username !== prevMessage.username) return true;
  // 7 minute threshold for grouping
  return message.timestamp - prevMessage.timestamp > 7 * 60 * 1000;
};

/**
 * Status Icon Component
 */
const StatusIcon: React.FC<{ status?: MessageStatusType }> = ({ status }) => {
  if (!status) return null;

  switch (status) {
    case MessageStatus.PENDING:
      return <Clock size={12} />;
    case MessageStatus.SENDING:
      return <SpinIcon><Loader size={12} /></SpinIcon>;
    case MessageStatus.SENT:
      return <Check size={12} />;
    case MessageStatus.DELIVERED:
    case MessageStatus.READ:
      return <CheckCheck size={12} />;
    case MessageStatus.FAILED:
      return <AlertCircle size={12} />;
    default:
      return null;
  }
};

/**
 * Single Message Item Component
 */
interface MessageItemProps {
  message: EnhancedMessage;
  currentUser: string;
  showHeader: boolean;
  onRetry?: (messageId: string) => void;
}

const MessageItem = memo<MessageItemProps>(({ message, currentUser, showHeader, onRetry }) => {
  const { id, username, content, type, timestamp, status } = message;
  const isOwnMessage = username === currentUser;

  const handleRetry = useCallback(() => {
    onRetry?.(id);
  }, [id, onRetry]);

  if (type === 'system') {
    return (
      <SystemMessage>
        <SystemText>{content}</SystemText>
      </SystemMessage>
    );
  }

  return (
    <MessageGroup>
      {showHeader && (
        <MessageGroupHeader>
          <Avatar $isOwn={isOwnMessage}>
            <User size={20} />
          </Avatar>
          <MessageMeta>
            <AuthorName $isOwn={isOwnMessage}>{username}</AuthorName>
            <Timestamp>{formatTime(timestamp)}</Timestamp>
          </MessageMeta>
        </MessageGroupHeader>
      )}

      <MessageRow>
        <MessageContent $status={status}>{content}</MessageContent>
      </MessageRow>

      {isOwnMessage && status && (
        <MessageFooter>
          <StatusIndicator $status={status}>
            <StatusIcon status={status} />
            {status === MessageStatus.FAILED && '发送失败'}
          </StatusIndicator>
          {status === MessageStatus.FAILED && (
            <RetryButton onClick={handleRetry} aria-label="重新发送消息">
              <RefreshCw size={10} />
              重试
            </RetryButton>
          )}
        </MessageFooter>
      )}
    </MessageGroup>
  );
});

MessageItem.displayName = 'MessageItem';

/**
 * Message List Component
 */
const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, currentUser, onLoadMore, onRetry, isLoadingHistory, hasMoreHistory = true }, _ref) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const prevMessagesLengthRef = useRef(messages.length);

    const scrollToBottom = useCallback((): void => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, []);

    useEffect(() => {
      if (messages.length > prevMessagesLengthRef.current) {
        const isLoadingMore = prevMessagesLengthRef.current === 0 && messages.length > 1;
        if (!isLoadingMore) {
          scrollToBottom();
        }
      }
      prevMessagesLengthRef.current = messages.length;
    }, [messages.length, scrollToBottom]);

    const handleScroll = useCallback(() => {
      if (!containerRef.current || !onLoadMore || isLoadingHistory || !hasMoreHistory) return;

      const { scrollTop } = containerRef.current;
      if (scrollTop < 50) {
        onLoadMore();
      }
    }, [onLoadMore, isLoadingHistory, hasMoreHistory]);

    return (
      <MessageContainer ref={containerRef} onScroll={handleScroll}>
        {hasMoreHistory && messages.length > 0 && (
          <LoadMoreButton onClick={onLoadMore} disabled={isLoadingHistory}>
            {isLoadingHistory ? (
              <>
                <SpinIcon><Loader size={12} /></SpinIcon>
                加载中...
              </>
            ) : (
              '加载更多消息'
            )}
          </LoadMoreButton>
        )}

        {messages.length === 0 ? (
          <EmptyState>
            <EmptyIcon>
              <MessageSquare size={28} />
            </EmptyIcon>
            <EmptyTitle>欢迎来到 WebSocket 聊天室</EmptyTitle>
            <EmptyText>
              这是一个基于 React + MobX + TypeScript 的实时聊天演示，
              开始聊天吧！
            </EmptyText>
          </EmptyState>
        ) : (
          <MessagesWrapper>
            {messages.map((message, index) => (
              <MessageItem
                key={message.id}
                message={message}
                currentUser={currentUser}
                showHeader={shouldShowHeader(message, messages[index - 1])}
                onRetry={onRetry}
              />
            ))}
          </MessagesWrapper>
        )}
        <div ref={messagesEndRef} />
      </MessageContainer>
    );
  }
);

MessageList.displayName = 'MessageList';

export default observer(MessageList);
