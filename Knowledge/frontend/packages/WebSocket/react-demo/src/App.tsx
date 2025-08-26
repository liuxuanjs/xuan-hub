import React from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import { useStores } from '@/stores/RootStore';
import LoginForm from '@/components/LoginForm';
import ChatRoom from '@/components/ChatRoom';

const AppContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  height: 80vh;
  min-height: 600px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.6s ease-out;

  @media (max-width: 768px) {
    width: 100%;
    height: 95vh;
    min-height: 500px;
    border-radius: 10px;
    margin: 0;
  }
`;

const App: React.FC = observer(() => {
  const { appStore, login, logout } = useStores();

  // 🏆【错误处理最佳实践】捕获并处理所有可能的错误，提供用户友好的错误提示
  const handleLogin = async (data: { username: string; serverUrl: string }): Promise<void> => {
    try {
      await login(data.username, data.serverUrl);
    } catch (error) {
      console.error('Login failed:', error);
      // 错误已经在 store 中处理
    }
  };

  const handleLogout = (): void => {
    logout();
  };

  return (
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
  );
});

App.displayName = 'App';

export default App;
