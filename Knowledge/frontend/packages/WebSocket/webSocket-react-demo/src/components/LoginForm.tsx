import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';
import type { LoginFormProps } from '@/types';

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 40px;
  text-align: center;
  animation: slideUp 0.6s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const Title = styled.h1`
  color: #667eea;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
  margin-bottom: 40px;
  line-height: 1.5;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 14px 16px;
  border: 2px solid ${props => props.hasError ? '#f44336' : '#e1e8ed'};
  border-radius: 12px;
  font-size: 16px;
  transition: all 0.3s ease;
  background: #fafafa;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#f44336' : '#667eea'};
    background: white;
    box-shadow: 0 0 0 3px ${props => props.hasError ? 'rgba(244, 67, 54, 0.1)' : 'rgba(102, 126, 234, 0.1)'};
  }

  &::placeholder {
    color: #999;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ConnectButton = styled.button`
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c53030;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  border: 1px solid #fed7d7;
  text-align: left;
  animation: fadeIn 0.3s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DemoNotice = styled.div`
  margin-top: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  border-left: 4px solid #667eea;
  text-align: left;

  h4 {
    color: #667eea;
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  p {
    font-size: 13px;
    color: #666;
    line-height: 1.4;
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .icon {
    font-size: 16px;
  }
`;

const CharacterCount = styled.div<{ isOverLimit: boolean }>`
  font-size: 12px;
  color: ${props => props.isOverLimit ? '#f44336' : '#666'};
  text-align: right;
  margin-top: 4px;
`;

const LoginForm: React.FC<LoginFormProps> = observer(({ onLogin, loading = false, error }) => {
  const [username, setUsername] = useState('');
  const [serverUrl, setServerUrl] = useState('ws://localhost:8080');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxUsernameLength = 20;
  const isUsernameOverLimit = username.length > maxUsernameLength;
  const displayError = error || localError;

  const validateWebSocketUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'ws:' || urlObj.protocol === 'wss:';
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLocalError('');

    // 前端验证
    if (!username.trim()) {
      setLocalError('请输入用户名');
      return;
    }

    if (username.trim().length < 2) {
      setLocalError('用户名至少需要2个字符');
      return;
    }

    if (isUsernameOverLimit) {
      setLocalError(`用户名不能超过${maxUsernameLength}个字符`);
      return;
    }

    if (!serverUrl.trim()) {
      setLocalError('请输入服务器地址');
      return;
    }

    if (!validateWebSocketUrl(serverUrl.trim())) {
      setLocalError('请输入有效的 WebSocket 地址 (ws:// 或 wss://)');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onLogin({ username: username.trim(), serverUrl: serverUrl.trim() });
    } catch (err) {
      // 错误已在上层处理
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setUsername(value);
    setLocalError('');
  };

  const handleServerUrlChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setServerUrl(e.target.value);
    setLocalError('');
  };

  const isDisabled = loading || isSubmitting;

  return (
    <LoginContainer>
      <LoginBox>
        <Title>🚀 WebSocket 聊天室</Title>
        <Subtitle>基于 React + MobX + TypeScript 的实时通信演示</Subtitle>

        <form onSubmit={handleSubmit}>
          {displayError && <ErrorMessage>{displayError}</ErrorMessage>}
          
          <FormGroup>
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              placeholder="请输入您的用户名"
              disabled={isDisabled}
              autoComplete="username"
              autoFocus
              hasError={isUsernameOverLimit}
              maxLength={maxUsernameLength + 5} // 允许稍微超过限制以显示错误
            />
            <CharacterCount isOverLimit={isUsernameOverLimit}>
              {username.length}/{maxUsernameLength}
            </CharacterCount>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="serverUrl">服务器地址</Label>
            <Input
              id="serverUrl"
              type="text"
              value={serverUrl}
              onChange={handleServerUrlChange}
              placeholder="WebSocket服务器地址"
              disabled={isDisabled}
              autoComplete="url"
            />
          </FormGroup>

          <ConnectButton type="submit" disabled={isDisabled || isUsernameOverLimit}>
            {isDisabled && <LoadingSpinner />}
            {isDisabled ? '连接中...' : '连接聊天室'}
          </ConnectButton>
        </form>

        <DemoNotice>
          <h4>
            <span className="icon">💡</span>
            演示说明
          </h4>
          <p>这是一个完整的 React + MobX + TypeScript 演示项目</p>
          <p>包含自动重连、心跳检测、消息队列等功能</p>
          <p>如需完整体验，请启动 WebSocket 服务器</p>
          <p>没有服务器时也可以体验前端界面功能</p>
        </DemoNotice>
      </LoginBox>
    </LoginContainer>
  );
});

LoginForm.displayName = 'LoginForm';

export default LoginForm;
