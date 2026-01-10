import React, { useCallback } from 'react';
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
  background: #313338;
`;

const ChatMain = styled.div`
  flex: 1;
  display: flex;
  min-height: 0;
`;

const ChatArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
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

  const handleLoadMore = useCallback((): void => {
    chatStore.loadHistory();
  }, [chatStore]);

  const handleSendMessage = useCallback((content: string): void => {
    if (!content.trim()) return;
    sendMessage(content);
  }, [sendMessage]);

  const handleTypingChange = useCallback((isTyping: boolean): void => {
    chatStore.setTyping(isTyping);
    sendTyping(isTyping);
  }, [chatStore, sendTyping]);

  const handleDisconnect = useCallback((): void => {
    onLogout();
  }, [onLogout]);

  const handleTestConnection = useCallback((): void => {
    testConnection();
  }, [testConnection]);

  const handleClearMessages = useCallback((): void => {
    clearMessages();
  }, [clearMessages]);

  const handleRemoveNotification = useCallback((id: string): void => {
    chatStore.removeNotification(id);
  }, [chatStore]);

  const handleRetryMessage = useCallback((_messageId: string): void => {
    // TODO: 实现消息重试逻辑
    chatStore.showNotification('消息重试功能开发中', 'info');
  }, [chatStore]);

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
            onLoadMore={handleLoadMore}
            onRetry={handleRetryMessage}
            isLoadingHistory={chatStore.isLoadingHistory}
            hasMoreHistory={chatStore.hasMoreHistory}
          />

          <MessageInput
            onSendMessage={handleSendMessage}
            onTypingChange={handleTypingChange}
            disabled={!webSocketStore.isConnected}
            placeholder={
              webSocketStore.isConnected
                ? '输入消息...'
                : webSocketStore.isConnecting
                  ? '连接中...'
                  : '未连接'
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
