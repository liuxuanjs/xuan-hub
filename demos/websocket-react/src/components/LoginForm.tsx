import React, { useState, useCallback, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import type { LoginFormProps } from '@/types';
import { MessageSquare, Server, User, LogIn, Loader, AlertCircle, Info } from './common/Icons';

// 验证常量
const VALIDATION = {
  USERNAME_MIN: 2,
  USERNAME_MAX: 20,
  USERNAME_INPUT_MAX: 25,
} as const;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const LoginContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100vh;
  background: #1E1F22;
  padding: 24px;
`;

const LoginCard = styled.div`
  width: 100%;
  max-width: 420px;
  background: #2B2D31;
  border-radius: 8px;
  padding: 32px;
  animation: ${slideUp} 0.3s ease;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 8px;

  svg {
    color: #5865F2;
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #F2F3F5;
  text-align: center;
`;

const Subtitle = styled.p`
  color: #B5BAC1;
  font-size: 14px;
  text-align: center;
  margin-bottom: 32px;
  line-height: 1.5;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #B5BAC1;
  text-transform: uppercase;
  letter-spacing: 0.02em;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.span`
  position: absolute;
  left: 12px;
  color: #949BA4;
  display: flex;
  pointer-events: none;
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: #1E1F22;
  border: 1px solid ${props => props.$hasError ? '#ED4245' : 'transparent'};
  border-radius: 4px;
  font-size: 16px;
  color: #F2F3F5;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    border-color: ${props => props.$hasError ? '#ED4245' : '#3F4147'};
  }

  &:focus {
    border-color: ${props => props.$hasError ? '#ED4245' : '#5865F2'};
    box-shadow: 0 0 0 2px ${props => props.$hasError ? 'rgba(237, 66, 69, 0.2)' : 'rgba(88, 101, 242, 0.2)'};
  }

  &::placeholder {
    color: #72767D;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CharCount = styled.span<{ $isOver: boolean }>`
  font-size: 11px;
  color: ${props => props.$isOver ? '#ED4245' : '#949BA4'};
  text-align: right;
  margin-top: 4px;
`;

const ErrorAlert = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  background: rgba(237, 66, 69, 0.1);
  border-radius: 4px;
  color: #F2F3F5;
  font-size: 14px;
  line-height: 1.4;

  svg {
    color: #ED4245;
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: #5865F2;
  color: white;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  margin-top: 8px;
  transition: background 0.15s ease;

  &:hover:not(:disabled) {
    background: #4752C4;
  }

  &:active:not(:disabled) {
    background: #3C45A5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SpinIcon = styled.span`
  display: flex;
  animation: ${spin} 1s linear infinite;
`;

const InfoBox = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: #1E1F22;
  border-radius: 4px;
  border-left: 3px solid #5865F2;
`;

const InfoTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #F2F3F5;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.02em;

  svg {
    color: #5865F2;
  }
`;

const InfoText = styled.p`
  font-size: 13px;
  color: #B5BAC1;
  line-height: 1.5;
  margin: 0;

  & + & {
    margin-top: 4px;
  }
`;

/**
 * 验证 WebSocket URL 格式
 */
const validateWebSocketUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'ws:' || urlObj.protocol === 'wss:';
  } catch {
    return false;
  }
};

/**
 * 登录表单组件
 */
const LoginForm: React.FC<LoginFormProps> = ({ onLogin, loading = false, error }) => {
  const [username, setUsername] = useState('');
  const [serverUrl, setServerUrl] = useState('ws://localhost:8080');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 派生状态
  const isUsernameOverLimit = username.length > VALIDATION.USERNAME_MAX;
  const displayError = error || localError;
  const isDisabled = loading || isSubmitting;

  // 表单验证
  const validateForm = useCallback((): string | null => {
    const trimmedUsername = username.trim();
    const trimmedUrl = serverUrl.trim();

    if (!trimmedUsername) {
      return '请输入用户名';
    }
    if (trimmedUsername.length < VALIDATION.USERNAME_MIN) {
      return `用户名至少需要 ${VALIDATION.USERNAME_MIN} 个字符`;
    }
    if (trimmedUsername.length > VALIDATION.USERNAME_MAX) {
      return `用户名不能超过 ${VALIDATION.USERNAME_MAX} 个字符`;
    }
    if (!trimmedUrl) {
      return '请输入服务器地址';
    }
    if (!validateWebSocketUrl(trimmedUrl)) {
      return '请输入有效的 WebSocket 地址 (ws:// 或 wss://)';
    }
    return null;
  }, [username, serverUrl]);

  // 提交处理
  const handleSubmit = useCallback(async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLocalError('');

    const validationError = validateForm();
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setIsSubmitting(true);
    try {
      await onLogin({
        username: username.trim(),
        serverUrl: serverUrl.trim(),
      });
    } catch {
      // 错误由父组件处理
    } finally {
      setIsSubmitting(false);
    }
  }, [validateForm, onLogin, username, serverUrl]);

  // 输入处理
  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setUsername(e.target.value);
    setLocalError('');
  }, []);

  const handleServerUrlChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    setServerUrl(e.target.value);
    setLocalError('');
  }, []);

  // 字符计数显示
  const charCountDisplay = useMemo(() => (
    <CharCount $isOver={isUsernameOverLimit}>
      {username.length}/{VALIDATION.USERNAME_MAX}
    </CharCount>
  ), [username.length, isUsernameOverLimit]);

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <MessageSquare size={32} />
          <Title>WebSocket Chat</Title>
        </Logo>
        <Subtitle>基于 React + MobX + TypeScript 的实时聊天演示</Subtitle>

        <Form onSubmit={handleSubmit}>
          {displayError && (
            <ErrorAlert>
              <AlertCircle size={18} />
              <span>{displayError}</span>
            </ErrorAlert>
          )}

          <FormGroup>
            <Label htmlFor="username">用户名</Label>
            <InputWrapper>
              <InputIcon><User size={18} /></InputIcon>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="请输入用户名"
                disabled={isDisabled}
                autoComplete="username"
                autoFocus
                $hasError={isUsernameOverLimit}
                maxLength={VALIDATION.USERNAME_INPUT_MAX}
              />
            </InputWrapper>
            {charCountDisplay}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="serverUrl">服务器地址</Label>
            <InputWrapper>
              <InputIcon><Server size={18} /></InputIcon>
              <Input
                id="serverUrl"
                type="text"
                value={serverUrl}
                onChange={handleServerUrlChange}
                placeholder="ws://localhost:8080"
                disabled={isDisabled}
                autoComplete="url"
              />
            </InputWrapper>
          </FormGroup>

          <SubmitButton type="submit" disabled={isDisabled || isUsernameOverLimit}>
            {isDisabled ? (
              <>
                <SpinIcon><Loader size={18} /></SpinIcon>
                连接中...
              </>
            ) : (
              <>
                <LogIn size={18} />
                连接
              </>
            )}
          </SubmitButton>
        </Form>

        <InfoBox>
          <InfoTitle>
            <Info size={14} />
            Demo Info
          </InfoTitle>
          <InfoText>完整的 React + MobX + TypeScript 演示项目</InfoText>
          <InfoText>支持自动重连、心跳检测、消息队列等功能</InfoText>
          <InfoText>启动 WebSocket 服务端以获得完整体验</InfoText>
        </InfoBox>
      </LoginCard>
    </LoginContainer>
  );
};

LoginForm.displayName = 'LoginForm';

export default LoginForm;
