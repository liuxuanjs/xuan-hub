import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { useStores } from '@/stores/RootStore';
import type { ChatRoomProps } from '@/types';
import ChatHeader from './ChatHeader';
import ChatSidebar from './ChatSidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import NotificationContainer from './NotificationContainer';

const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

const ChatMain = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const ChatRoom: React.FC<ChatRoomProps> = observer(({ user, serverUrl, onLogout }) => {
  const { 
    chatStore, 
    webSocketStore, 
    sendMessage, 
    sendTyping,
    testConnection, 
    clearMessages,
    connectionStatusText 
  } = useStores();

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      // 组件卸载时不需要特殊清理，因为在 logout 时已经处理
    };
  }, []);

  // 发送聊天消息
  const handleSendMessage = (content: string): void => {
    if (!content.trim()) return;
    sendMessage(content);
  };

  // 处理输入状态
  const handleTypingChange = (isTyping: boolean): void => {
    chatStore.setTyping(isTyping);
    sendTyping(isTyping);
  };

  // 断开连接
  const handleDisconnect = (): void => {
    onLogout();
  };

  // 测试连接
  const handleTestConnection = (): void => {
    testConnection();
  };

  // 清空消息
  const handleClearMessages = (): void => {
    clearMessages();
  };

  // 移除通知
  const handleRemoveNotification = (id: string): void => {
    chatStore.removeNotification(id);
  };

  return (
    <ChatContainer>
      <ChatHeader
        user={user}
        connectionStatus={connectionStatusText}
        isConnected={webSocketStore.isConnected}
        onDisconnect={handleDisconnect}
      />
      
      <ChatMain>
        <ChatSidebar
          users={chatStore.users}
          currentUser={user}
          serverUrl={serverUrl}
          connectionInfo={webSocketStore.getConnectionInfo()}
          onClearMessages={handleClearMessages}
          onTestConnection={handleTestConnection}
        />
        
        <ChatArea>
          <MessageList
            messages={chatStore.messages}
            currentUser={user}
          />
          
          <MessageInput
            onSendMessage={handleSendMessage}
            onTypingChange={handleTypingChange}
            disabled={!webSocketStore.isConnected}
            placeholder={
              webSocketStore.isConnected 
                ? "输入消息..." 
                : webSocketStore.isConnecting 
                  ? "连接中..." 
                  : "未连接"
            }
            maxLength={500}
          />
        </ChatArea>
      </ChatMain>

      <NotificationContainer
        notifications={chatStore.notifications}
        onRemove={handleRemoveNotification}
      />
    </ChatContainer>
  );
});

ChatRoom.displayName = 'ChatRoom';

export default ChatRoom;
