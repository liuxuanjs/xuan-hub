/**
 * React 错误边界组件
 * 捕获子组件中的 JavaScript 错误，显示友好的错误界面
 */

import React from 'react';
import styled from 'styled-components';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** 自定义错误渲染 */
  fallback?: React.ReactNode | ((error: Error, reset: () => void) => React.ReactNode);
  /** 错误回调 */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  min-height: 200px;
  background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%);
  border-radius: 12px;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const ErrorTitle = styled.h3`
  color: #c53030;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const ErrorMessage = styled.p`
  color: #742a2a;
  font-size: 14px;
  margin: 0 0 24px 0;
  max-width: 400px;
  line-height: 1.5;
`;

const RetryButton = styled.button`
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ErrorDetails = styled.details`
  margin-top: 16px;
  text-align: left;
  max-width: 100%;
  overflow: hidden;

  summary {
    cursor: pointer;
    color: #742a2a;
    font-size: 12px;
    margin-bottom: 8px;
  }

  pre {
    background: rgba(0, 0, 0, 0.05);
    padding: 12px;
    border-radius: 8px;
    font-size: 11px;
    overflow-x: auto;
    max-height: 200px;
    overflow-y: auto;
    margin: 0;
    color: #742a2a;
  }
`;

/**
 * 默认错误界面
 */
const DefaultFallback: React.FC<{ error: Error; reset: () => void }> = ({
  error,
  reset,
}) => (
  <ErrorContainer>
    <ErrorIcon>😢</ErrorIcon>
    <ErrorTitle>出错了</ErrorTitle>
    <ErrorMessage>
      应用程序遇到了一个问题。请尝试刷新页面或点击下方按钮重试。
    </ErrorMessage>
    <RetryButton onClick={reset}>重试</RetryButton>
    {process.env.NODE_ENV === 'development' && (
      <ErrorDetails>
        <summary>错误详情（开发模式）</summary>
        <pre>{error.message}</pre>
        <pre>{error.stack}</pre>
      </ErrorDetails>
    )}
  </ErrorContainer>
);

/**
 * 错误边界类组件
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError && this.state.error) {
      const { fallback } = this.props;

      if (typeof fallback === 'function') {
        return fallback(this.state.error, this.reset);
      }

      if (fallback) {
        return fallback;
      }

      return <DefaultFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}

/**
 * 高阶组件：为组件添加错误边界
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name || 'Component'
  })`;

  return WrappedComponent;
}
