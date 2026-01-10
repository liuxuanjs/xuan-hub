import React, { useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import styled, { keyframes } from 'styled-components';
import type { NotificationContainerProps, Notification, NotificationLevel } from '@/types';
import { Check, AlertCircle, Info, X } from './common/Icons';

/**
 * 根据通知级别获取对应颜色
 */
const getNotificationColor = (type: NotificationLevel): string => {
  switch (type) {
    case 'success': return '#23A55A';
    case 'error': return '#ED4245';
    case 'warning': return '#F0B232';
    case 'info':
    default: return '#5865F2';
  }
};

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const Container = styled.div`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;

  @media (max-width: 768px) {
    left: 16px;
    right: 16px;
    top: 12px;
  }
`;

const NotificationItem = styled.div<{ $type: NotificationLevel }>`
  background: #2B2D31;
  border-radius: 4px;
  padding: 12px 16px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.4);
  border-left: 3px solid ${props => getNotificationColor(props.$type)};
  animation: ${slideIn} 0.2s ease-out;
  max-width: 320px;
  pointer-events: auto;
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition: background 0.1s ease;

  &:hover {
    background: #35373C;
  }

  @media (max-width: 768px) {
    max-width: none;
  }
`;

const IconWrapper = styled.div<{ $type: NotificationLevel }>`
  flex-shrink: 0;
  color: ${props => getNotificationColor(props.$type)};
  display: flex;
`;

const NotificationBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationMessage = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #F2F3F5;
  line-height: 1.4;
  word-break: break-word;
`;

const NotificationTime = styled.div`
  font-size: 11px;
  color: #949BA4;
  margin-top: 4px;
`;

const CloseButton = styled.button`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #949BA4;
  flex-shrink: 0;
  transition: background 0.1s ease, color 0.1s ease;

  &:hover {
    background: #404249;
    color: #F2F3F5;
  }
`;

const ProgressBar = styled.div<{ $type: NotificationLevel; $duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: ${props => getNotificationColor(props.$type)};
  border-radius: 0 0 4px 0;
  animation: progressBar ${props => props.$duration}ms linear;
  transform-origin: left;

  @keyframes progressBar {
    from {
      transform: scaleX(1);
    }
    to {
      transform: scaleX(0);
    }
  }
`;

/**
 * 格式化时间
 */
const formatTime = (timestamp: number): string => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '刚刚';
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)} 分钟前`;
  } else {
    return notificationTime.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
};

/**
 * 获取通知图标
 */
const NotificationIcon: React.FC<{ type: NotificationLevel }> = ({ type }) => {
  switch (type) {
    case 'success':
      return <Check size={18} />;
    case 'error':
      return <AlertCircle size={18} />;
    case 'warning':
      return <AlertCircle size={18} />;
    case 'info':
    default:
      return <Info size={18} />;
  }
};

interface NotificationItemComponentProps {
  notification: Notification;
  onRemove: (id: string) => void;
}

const NotificationItemComponent: React.FC<NotificationItemComponentProps> = observer(({
  notification,
  onRemove
}) => {
  const { id, message, type, duration } = notification;

  const handleClick = useCallback((): void => {
    onRemove(id);
  }, [id, onRemove]);

  const handleCloseClick = useCallback((e: React.MouseEvent): void => {
    e.stopPropagation();
    onRemove(id);
  }, [id, onRemove]);

  return (
    <NotificationItem $type={type} onClick={handleClick}>
      <IconWrapper $type={type}>
        <NotificationIcon type={type} />
      </IconWrapper>

      <NotificationBody>
        <NotificationMessage>{message}</NotificationMessage>
        <NotificationTime>
          {formatTime(notification.timestamp || Date.now())}
        </NotificationTime>
      </NotificationBody>

      <CloseButton onClick={handleCloseClick} aria-label="关闭通知">
        <X size={14} />
      </CloseButton>

      {duration && notification.autoClose && (
        <ProgressBar $type={type} $duration={duration} />
      )}
    </NotificationItem>
  );
});

NotificationItemComponent.displayName = 'NotificationItem';

const NotificationContainer: React.FC<NotificationContainerProps> = observer(({
  notifications,
  onRemove
}) => {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <Container>
      {notifications.map(notification => (
        <NotificationItemComponent
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </Container>
  );
});

NotificationContainer.displayName = 'NotificationContainer';

export default NotificationContainer;
