import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import type { ChatSidebarProps } from '@/types';

const SidebarContainer = styled.div`
  width: 280px;
  background: #f8f9fa;
  border-right: 1px solid #e1e8ed;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  overflow-y: auto;

  @media (max-width: 768px) {
    width: 100%;
    max-height: 200px;
    border-right: none;
    border-bottom: 1px solid #e1e8ed;
    padding: 16px;
    gap: 16px;
  }
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h4`
  color: #333;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const UserList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

interface UserItemProps {
  isCurrentUser: boolean;
}

const UserItem = styled.li<UserItemProps>`
  padding: 10px 12px;
  background: white;
  border-radius: 8px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }

  ${props => props.isCurrentUser && `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  `}
`;

const UserStatus = styled.span`
  width: 8px;
  height: 8px;
  background: #4caf50;
  border-radius: 50%;
  flex-shrink: 0;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.8;
    }
  }
`;

const UserName = styled.span`
  flex: 1;
  font-weight: 500;
`;

const UserLabel = styled.span`
  font-size: 11px;
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 8px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  font-size: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const InfoLabel = styled.span`
  color: #666;
  font-weight: 500;
`;

interface InfoValueProps {
  highlight?: boolean;
}

const InfoValue = styled.span<InfoValueProps>`
  font-weight: 600;
  color: #333;
  
  ${props => props.highlight && `
    color: #667eea;
  `}
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 10px 12px;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: #333;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  &:hover {
    background: #f0f0f0;
    transform: translateY(-1px);
    border-color: #ccc;
  }

  &:active {
    transform: translateY(0);
  }
`;

const Badge = styled.span`
  background: #667eea;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  min-width: 16px;
  text-align: center;
`;

const EmptyState = styled.div`
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  font-size: 13px;
`;

const ChatSidebar: React.FC<ChatSidebarProps> = observer(({ 
  users, 
  currentUser, 
  serverUrl, 
  connectionInfo, 
  onClearMessages,
  onTestConnection 
}) => {
  const formatLatency = (latency: number): string => {
    if (latency === 0) return '--';
    return `${latency}ms`;
  };

  const formatUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return `${urlObj.hostname}:${urlObj.port || (urlObj.protocol === 'wss:' ? '443' : '80')}`;
    } catch {
      return url;
    }
  };

  const getLatencyColor = (latency: number): string => {
    if (latency === 0) return '#666';
    if (latency < 50) return '#4caf50';
    if (latency < 100) return '#ff9800';
    return '#f44336';
  };

  return (
    <SidebarContainer>
      <Section>
        <SectionTitle>
          <span>👥</span>
          在线用户
          <Badge>{users.length}</Badge>
        </SectionTitle>
        <UserList>
          {users.length === 0 ? (
            <EmptyState>暂无在线用户</EmptyState>
          ) : (
            users.map(user => (
              <UserItem key={user.username} isCurrentUser={user.username === currentUser}>
                <UserStatus />
                <UserName>{user.username}</UserName>
                {user.username === currentUser && <UserLabel>我</UserLabel>}
              </UserItem>
            ))
          )}
        </UserList>
      </Section>

      <Section>
        <SectionTitle>
          <span>📊</span>
          连接信息
        </SectionTitle>
        <InfoGrid>
          <InfoItem>
            <InfoLabel>服务器</InfoLabel>
            <InfoValue title={serverUrl}>
              {formatUrl(serverUrl)}
            </InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>状态</InfoLabel>
            <InfoValue highlight={connectionInfo.isConnected}>
              {connectionInfo.isConnected ? '已连接' : connectionInfo.isConnecting ? '连接中' : '已断开'}
            </InfoValue>
          </InfoItem>
          <InfoItem>
            <InfoLabel>延迟</InfoLabel>
            <InfoValue style={{ color: getLatencyColor(connectionInfo.latency) }}>
              {formatLatency(connectionInfo.latency)}
            </InfoValue>
          </InfoItem>
          {connectionInfo.reconnectAttempts > 0 && (
            <InfoItem>
              <InfoLabel>重连次数</InfoLabel>
              <InfoValue>
                {connectionInfo.reconnectAttempts}/{connectionInfo.maxReconnectAttempts}
              </InfoValue>
            </InfoItem>
          )}
          {connectionInfo.messageQueueLength > 0 && (
            <InfoItem>
              <InfoLabel>队列消息</InfoLabel>
              <InfoValue>
                {connectionInfo.messageQueueLength}
              </InfoValue>
            </InfoItem>
          )}
          {connectionInfo.lastConnectedAt && (
            <InfoItem>
              <InfoLabel>连接时间</InfoLabel>
              <InfoValue>
                {new Date(connectionInfo.lastConnectedAt).toLocaleTimeString()}
              </InfoValue>
            </InfoItem>
          )}
        </InfoGrid>
      </Section>

      <Section>
        <SectionTitle>
          <span>⚡</span>
          快捷操作
        </SectionTitle>
        <ActionButtons>
          <ActionButton onClick={onTestConnection}>
            <span>🔍</span>
            测试连接
          </ActionButton>
          <ActionButton onClick={onClearMessages}>
            <span>🗑️</span>
            清空消息
          </ActionButton>
        </ActionButtons>
      </Section>
    </SidebarContainer>
  );
});

ChatSidebar.displayName = 'ChatSidebar';

export default ChatSidebar;
