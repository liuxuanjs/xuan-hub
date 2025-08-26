import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import type { ChatHeaderProps } from '@/types';

const HeaderContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 16px;
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 18px;
    justify-content: center;
  }
`;

const ConnectionStatus = styled.div`
  font-size: 13px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

interface StatusIndicatorProps {
  isConnected: boolean;
  status: string;
}

const StatusIndicator = styled.span<StatusIndicatorProps>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => {
    if (props.isConnected) return '#4caf50';
    if (props.status.includes('连接中') || props.status.includes('重连')) return '#ff9800';
    return '#f44336';
  }};
  
  ${props => props.isConnected && `
    animation: pulse 2s infinite;
    
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(1.2);
        opacity: 0.7;
      }
    }
  `}
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;

  @media (max-width: 768px) {
    align-items: center;
  }
`;

const UserName = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const UserLabel = styled.span`
  font-size: 12px;
  opacity: 0.8;
`;

const DisconnectButton = styled.button`
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

const TechBadge = styled.div`
  font-size: 10px;
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  margin-top: 2px;
`;

const ChatHeader: React.FC<ChatHeaderProps> = observer(({ 
  user, 
  connectionStatus, 
  isConnected, 
  onDisconnect 
}) => {
  return (
    <HeaderContainer>
      <HeaderLeft>
        <Title>
          <span>🚀</span>
          WebSocket 聊天室
        </Title>
        <ConnectionStatus>
          <StatusIndicator 
            isConnected={isConnected} 
            status={connectionStatus}
          />
          {connectionStatus}
        </ConnectionStatus>
      </HeaderLeft>

      <HeaderRight>
        <UserInfo>
          <UserName>{user}</UserName>
          <UserLabel>当前用户</UserLabel>
          <TechBadge>MobX + TypeScript</TechBadge>
        </UserInfo>
        
        <DisconnectButton onClick={onDisconnect}>
          断开连接
        </DisconnectButton>
      </HeaderRight>
    </HeaderContainer>
  );
});

ChatHeader.displayName = 'ChatHeader';

export default ChatHeader;
