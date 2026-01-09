/**
 * 消息状态指示器组件
 * 显示消息的发送状态：等待、发送中、已发送、已送达、已读、失败
 */

import React, { memo } from 'react';
import styled, { keyframes } from 'styled-components';
import { MessageStatus } from '@/types';

interface MessageStatusIndicatorProps {
  status?: MessageStatus;
  size?: 'small' | 'medium';
}

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const StatusContainer = styled.span<{ size: 'small' | 'medium' }>`
  display: inline-flex;
  align-items: center;
  margin-left: 4px;
  font-size: ${(props) => (props.size === 'small' ? '10px' : '12px')};
`;

const StatusIcon = styled.span<{ color: string }>`
  color: ${(props) => props.color};
  display: inline-flex;
  align-items: center;
`;

const SpinningIcon = styled(StatusIcon)`
  animation: ${spin} 1s linear infinite;
`;

const CheckIcon: React.FC<{ double?: boolean; color: string }> = ({ double, color }) => (
  <StatusIcon color={color}>
    {double ? (
      <svg width="16" height="12" viewBox="0 0 16 12" fill="none">
        <path
          d="M1 6L4 9L9 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6 6L9 9L15 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2 6L5 9L10 3"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </StatusIcon>
);

const ClockIcon: React.FC<{ color: string }> = ({ color }) => (
  <StatusIcon color={color}>
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 3V6L8 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  </StatusIcon>
);

const LoadingIcon: React.FC<{ color: string }> = ({ color }) => (
  <SpinningIcon color={color}>
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" strokeDasharray="20" strokeDashoffset="5" />
    </svg>
  </SpinningIcon>
);

const ErrorIcon: React.FC<{ color: string }> = ({ color }) => (
  <StatusIcon color={color}>
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 3V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="6" cy="8.5" r="0.75" fill="currentColor" />
    </svg>
  </StatusIcon>
);

/**
 * 消息状态指示器
 */
const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = memo(
  ({ status, size = 'small' }) => {
    if (!status) return null;

    const renderIcon = () => {
      switch (status) {
        case MessageStatus.PENDING:
          return <ClockIcon color="rgba(255, 255, 255, 0.6)" />;
        case MessageStatus.SENDING:
          return <LoadingIcon color="rgba(255, 255, 255, 0.8)" />;
        case MessageStatus.SENT:
          return <CheckIcon color="rgba(255, 255, 255, 0.8)" />;
        case MessageStatus.DELIVERED:
          return <CheckIcon double color="rgba(255, 255, 255, 0.8)" />;
        case MessageStatus.READ:
          return <CheckIcon double color="#4FC3F7" />;
        case MessageStatus.FAILED:
          return <ErrorIcon color="#FF5252" />;
        default:
          return null;
      }
    };

    return <StatusContainer size={size}>{renderIcon()}</StatusContainer>;
  }
);

MessageStatusIndicator.displayName = 'MessageStatusIndicator';

export default MessageStatusIndicator;
