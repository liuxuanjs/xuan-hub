import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { useStores } from '@/stores/RootStore';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import LoginForm from '@/components/LoginForm';
import ChatRoom from '@/components/ChatRoom';

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1E1F22;
  overflow: hidden;
`;

const App: React.FC = observer(() => {
  const { appStore, login, logout } = useStores();

  const handleLogin = async (data: { username: string; serverUrl: string }): Promise<void> => {
    try {
      await login(data.username, data.serverUrl);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = (): void => {
    logout();
  };

  return (
    <ErrorBoundary>
      <AppContainer>
        {appStore.isLoggedIn && appStore.currentUser ? (
          <ChatRoom
            user={appStore.currentUser}
            serverUrl={appStore.serverUrl}
            onLogout={handleLogout}
          />
        ) : (
          <LoginForm
            onLogin={handleLogin}
            loading={appStore.isLoading}
            error={appStore.globalError}
          />
        )}
      </AppContainer>
    </ErrorBoundary>
  );
});

App.displayName = 'App';

export default App;
