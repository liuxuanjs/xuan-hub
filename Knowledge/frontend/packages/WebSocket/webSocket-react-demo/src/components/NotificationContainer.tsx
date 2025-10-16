import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import type { NotificationContainerProps, Notification, NotificationLevel } from '@/types';

const Container = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;

  @media (max-width: 768px) {
    left: 20px;
    right: 20px;
    top: 10px;
  }
`;

interface NotificationProps {
  type: NotificationLevel;
}

const NotificationItem = styled.div<NotificationProps>`
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#667eea';
    }
  }};
  animation: slideInRight 0.3s ease-out;
  max-width: 350px;
  pointer-events: auto;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100%);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @media (max-width: 768px) {
    max-width: none;
    margin: 0;
  }
`;

const NotificationContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const NotificationIcon = styled.div`
  font-size: 18px;
  flex-shrink: 0;
  margin-top: 1px;
`;

const NotificationBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const NotificationMessage = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  line-height: 1.4;
  word-break: break-word;
`;

const NotificationTime = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 4px;
  opacity: 0.8;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #999;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f0f0;
    color: #666;
  }

  &:active {
    transform: scale(0.95);
  }
`;

interface ProgressBarProps {
  type: NotificationLevel;
  duration: number;
}

const ProgressBar = styled.div<ProgressBarProps>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: ${props => {
    switch (props.type) {
      case 'success': return '#4caf50';
      case 'error': return '#f44336';
      case 'warning': return '#ff9800';
      case 'info': return '#2196f3';
      default: return '#667eea';
    }
  }};
  border-radius: 0 0 12px 12px;
  animation: progressBar ${props => props.duration}ms linear;
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

const getNotificationIcon = (type: NotificationLevel): string => {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
    default: return '📢';
  }
};

const formatTime = (timestamp: number): string => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - notificationTime.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '刚刚';
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}分钟前`;
  } else {
    return notificationTime.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
  const [_currentTime, setCurrentTime] = React.useState(Date.now());

  // 更新时间显示
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 30000); // 每30秒更新一次

    return () => clearInterval(timer);
  }, []);

  const handleClick = (): void => {
    onRemove(id);
  };

  const handleCloseClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onRemove(id);
  };

  return (
    <NotificationItem type={type} onClick={handleClick}>
      <NotificationContent>
        <NotificationIcon>
          {getNotificationIcon(type)}
        </NotificationIcon>
        <NotificationBody>
          <NotificationMessage>{message}</NotificationMessage>
          <NotificationTime>
            {formatTime(notification.timestamp || Date.now())}
          </NotificationTime>
        </NotificationBody>
      </NotificationContent>
      
      <CloseButton onClick={handleCloseClick}>
        ×
      </CloseButton>
      
      {duration && notification.autoClose && (
        <ProgressBar type={type} duration={duration} />
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
