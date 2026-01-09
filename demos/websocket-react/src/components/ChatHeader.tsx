import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import type { ChatHeaderProps } from '@/types';
import { Hash, Wifi, WifiOff, LogOut, User, Circle } from './common/Icons';

/**
 * 获取连接状态
 */
const getConnectionStatus = (
  isConnected: boolean,
  connectionStatus: string
): 'online' | 'connecting' | 'offline' => {
  if (isConnected) return 'online';
  if (connectionStatus.includes('连接中') || connectionStatus.includes('重连')) return 'connecting';
  return 'offline';
};

const HeaderContainer = styled.header`
  height: 48px;
  min-height: 48px;
  background: #313338;
  border-bottom: 1px solid #1E1F22;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChannelIcon = styled.span`
  color: #949BA4;
  display: flex;
`;

const ChannelName = styled.h1`
  font-size: 16px;
  font-weight: 600;
  color: #F2F3F5;
  margin: 0;
`;

const Divider = styled.div`
  width: 1px;
  height: 24px;
  background: #3F4147;
  margin: 0 12px;
`;

const StatusBadge = styled.div<{ $status: 'online' | 'connecting' | 'offline' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${props => {
    switch (props.$status) {
      case 'online': return '#23A55A';
      case 'connecting': return '#F0B232';
      default: return '#949BA4';
    }
  }};
`;

const StatusDot = styled.span<{ $status: 'online' | 'connecting' | 'offline' }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'online': return '#23A55A';
      case 'connecting': return '#F0B232';
      default: return '#80848E';
    }
  }};

  ${props => props.$status === 'connecting' && `
    animation: pulse 1.5s ease-in-out infinite;

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `}
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const UserBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  background: #2B2D31;
  border-radius: 4px;
`;

const UserAvatar = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #5865F2;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    color: white;
  }
`;

const UserName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #F2F3F5;
`;

const OnlineIndicator = styled.span`
  color: #23A55A;
  display: flex;
`;

const IconButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #B5BAC1;
  transition: background 0.1s ease, color 0.1s ease;

  &:hover {
    background: #383A40;
    color: #F2F3F5;
  }

  &:active {
    background: #404249;
  }
`;

const DisconnectButton = styled(IconButton)`
  &:hover {
    color: #ED4245;
  }
`;

const ChatHeader: React.FC<ChatHeaderProps> = observer(({
  user,
  connectionStatus,
  isConnected,
  onDisconnect
}) => {
  const status = getConnectionStatus(isConnected, connectionStatus);

  return (
    <HeaderContainer>
      <HeaderLeft>
        <ChannelIcon>
          <Hash size={20} />
        </ChannelIcon>
        <ChannelName>公共频道</ChannelName>

        <Divider />

        <StatusBadge $status={status}>
          {status === 'online' ? <Wifi size={14} /> : status === 'connecting' ? <WifiOff size={14} /> : <WifiOff size={14} />}
          <StatusDot $status={status} />
          <span>{connectionStatus}</span>
        </StatusBadge>
      </HeaderLeft>

      <HeaderRight>
        <UserBadge>
          <UserAvatar>
            <User size={14} />
          </UserAvatar>
          <UserName>{user}</UserName>
          {isConnected && (
            <OnlineIndicator>
              <Circle size={8} fill="#23A55A" />
            </OnlineIndicator>
          )}
        </UserBadge>

        <DisconnectButton onClick={onDisconnect} title="断开连接" aria-label="断开连接">
          <LogOut size={18} />
        </DisconnectButton>
      </HeaderRight>
    </HeaderContainer>
  );
});

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
