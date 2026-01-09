import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import type { ChatSidebarProps } from '@/types';
import { Users, Server, Activity, Clock, Trash2, RefreshCw, User, Circle } from './common/Icons';

/**
 * 格式化延迟显示
 */
const formatLatency = (latency: number): string => {
  if (latency === 0) return '--';
  return `${latency}ms`;
};

/**
 * 格式化 URL 显示（只显示 host）
 */
const formatUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.host;
  } catch {
    return url;
  }
};

/**
 * 根据延迟获取颜色
 */
const getLatencyColor = (latency: number): string => {
  if (latency === 0) return '#949BA4';
  if (latency < 50) return '#23A55A';
  if (latency < 100) return '#F0B232';
  return '#ED4245';
};

const SidebarContainer = styled.aside`
  width: 240px;
  min-width: 240px;
  background: #2B2D31;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Section = styled.div`
  padding: 16px 8px;

  & + & {
    border-top: 1px solid #1E1F22;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  margin-bottom: 8px;
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: #949BA4;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Badge = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: #B5BAC1;
  background: #1E1F22;
  padding: 1px 6px;
  border-radius: 4px;
`;

const UserList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserItem = styled.li<{ $isCurrentUser?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 4px;
  cursor: default;
  transition: background 0.1s ease;

  &:hover {
    background: #35373C;
  }

  ${props => props.$isCurrentUser && `
    background: rgba(88, 101, 242, 0.15);
    &:hover {
      background: rgba(88, 101, 242, 0.2);
    }
  `}
`;

const UserAvatar = styled.div<{ $isCurrentUser?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$isCurrentUser ? '#5865F2' : '#3F4147'};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;

  svg {
    color: ${props => props.$isCurrentUser ? 'white' : '#B5BAC1'};
  }
`;

const OnlineDot = styled.span`
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #23A55A;
  border: 3px solid #2B2D31;
  border-radius: 50%;
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserNameText = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #F2F3F5;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserTag = styled.span`
  font-size: 11px;
  color: #5865F2;
  background: rgba(88, 101, 242, 0.15);
  padding: 2px 6px;
  border-radius: 3px;
`;

const EmptyState = styled.div`
  padding: 12px 8px;
  font-size: 13px;
  color: #949BA4;
  text-align: center;
`;

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px;
  border-radius: 4px;
  background: #1E1F22;
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: #949BA4;
  display: flex;
  align-items: center;
  gap: 6px;

  svg {
    opacity: 0.7;
  }
`;

const InfoValue = styled.span<{ $highlight?: boolean; $color?: string }>`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.$color || (props.$highlight ? '#5865F2' : '#F2F3F5')};
`;

const ActionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #B5BAC1;
  text-align: left;
  transition: background 0.1s ease, color 0.1s ease;

  &:hover {
    background: #35373C;
    color: #F2F3F5;
  }

  &:active {
    background: #3F4147;
  }

  svg {
    flex-shrink: 0;
  }
`;

const ChatSidebar: React.FC<ChatSidebarProps> = observer(({
  users,
  currentUser,
  serverUrl,
  connectionInfo,
  onClearMessages,
  onTestConnection
}) => {
  return (
    <SidebarContainer>
      {/* Online Users */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <Users size={14} />
            在线
          </SectionTitle>
          <Badge>{users.length}</Badge>
        </SectionHeader>

        {users.length === 0 ? (
          <EmptyState>暂无在线用户</EmptyState>
        ) : (
          <UserList>
            {users.map(user => {
              const isCurrentUser = user.username === currentUser;
              return (
                <UserItem key={user.username} $isCurrentUser={isCurrentUser}>
                  <UserAvatar $isCurrentUser={isCurrentUser}>
                    <User size={16} />
                    <OnlineDot />
                  </UserAvatar>
                  <UserInfo>
                    <UserNameText>{user.username}</UserNameText>
                  </UserInfo>
                  {isCurrentUser && <UserTag>我</UserTag>}
                </UserItem>
              );
            })}
          </UserList>
        )}
      </Section>

      {/* Connection Info */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            <Activity size={14} />
            连接状态
          </SectionTitle>
        </SectionHeader>

        <InfoGrid>
          <InfoRow>
            <InfoLabel>
              <Server size={12} />
              服务器
            </InfoLabel>
            <InfoValue title={serverUrl}>
              {formatUrl(serverUrl)}
            </InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>
              <Circle size={12} fill={connectionInfo.isConnected ? '#23A55A' : '#80848E'} />
              状态
            </InfoLabel>
            <InfoValue $highlight={connectionInfo.isConnected}>
              {connectionInfo.isConnected ? '已连接' : connectionInfo.isConnecting ? '连接中' : '已断开'}
            </InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>
              <Activity size={12} />
              延迟
            </InfoLabel>
            <InfoValue $color={getLatencyColor(connectionInfo.latency)}>
              {formatLatency(connectionInfo.latency)}
            </InfoValue>
          </InfoRow>

          {connectionInfo.reconnectAttempts > 0 && (
            <InfoRow>
              <InfoLabel>
                <RefreshCw size={12} />
                重连次数
              </InfoLabel>
              <InfoValue>
                {connectionInfo.reconnectAttempts}/{connectionInfo.maxReconnectAttempts}
              </InfoValue>
            </InfoRow>
          )}

          {connectionInfo.lastConnectedAt && (
            <InfoRow>
              <InfoLabel>
                <Clock size={12} />
                连接时间
              </InfoLabel>
              <InfoValue>
                {new Date(connectionInfo.lastConnectedAt).toLocaleTimeString()}
              </InfoValue>
            </InfoRow>
          )}
        </InfoGrid>
      </Section>

      {/* Quick Actions */}
      <Section>
        <SectionHeader>
          <SectionTitle>
            操作
          </SectionTitle>
        </SectionHeader>

        <ActionList>
          <ActionButton onClick={onTestConnection}>
            <RefreshCw size={16} />
            测试连接
          </ActionButton>
          <ActionButton onClick={onClearMessages}>
            <Trash2 size={16} />
            清空消息
          </ActionButton>
        </ActionList>
      </Section>
    </SidebarContainer>
  );
});

ChatSidebar.displayName = 'ChatSidebar';

export default ChatSidebar;
