/**
 * WebSocket React Hook
 * 提供声明式的 WebSocket 连接管理
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ConnectionManager,
  ConnectionManagerOptions,
  ConnectionInfo,
  ConnectionState,
} from '@/core/websocket';

export interface UseWebSocketOptions extends Partial<ConnectionManagerOptions> {
  /** 是否自动连接 */
  autoConnect?: boolean;
  /** 连接 URL */
  url?: string;
  /** 连接成功回调 */
  onConnected?: () => void;
  /** 断开连接回调 */
  onDisconnected?: (code?: number, reason?: string) => void;
  /** 消息接收回调 */
  onMessage?: (data: any) => void;
  /** 错误回调 */
  onError?: (error: any) => void;
  /** 重连中回调 */
  onReconnecting?: (attempt: number, maxAttempts: number) => void;
  /** 重连失败回调 */
  onReconnectFailed?: () => void;
  /** 延迟更新回调 */
  onLatencyUpdate?: (latency: number) => void;
}

export interface UseWebSocketReturn {
  /** 连接状态 */
  state: ConnectionState;
  /** 是否已连接 */
  isConnected: boolean;
  /** 是否正在连接 */
  isConnecting: boolean;
  /** 连接信息 */
  connectionInfo: ConnectionInfo | null;
  /** 网络延迟 */
  latency: number;
  /** 连接方法 */
  connect: (url: string) => void;
  /** 断开连接方法 */
  disconnect: () => void;
  /** 发送消息方法 */
  send: (data: any, messageId?: string) => string;
  /** 发送心跳 */
  sendPing: () => void;
  /** 获取连接管理器 */
  getManager: () => ConnectionManager | null;
}

/**
 * WebSocket Hook
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = false,
    url,
    onConnected,
    onDisconnected,
    onMessage,
    onError,
    onReconnecting,
    onReconnectFailed,
    onLatencyUpdate,
    ...managerOptions
  } = options;

  const [state, setState] = useState<ConnectionState>('DISCONNECTED');
  const [connectionInfo, setConnectionInfo] = useState<ConnectionInfo | null>(null);
  const [latency, setLatency] = useState(0);

  const managerRef = useRef<ConnectionManager | null>(null);
  const callbacksRef = useRef({
    onConnected,
    onDisconnected,
    onMessage,
    onError,
    onReconnecting,
    onReconnectFailed,
    onLatencyUpdate,
  });

  // 更新回调引用
  useEffect(() => {
    callbacksRef.current = {
      onConnected,
      onDisconnected,
      onMessage,
      onError,
      onReconnecting,
      onReconnectFailed,
      onLatencyUpdate,
    };
  }, [onConnected, onDisconnected, onMessage, onError, onReconnecting, onReconnectFailed, onLatencyUpdate]);

  // 初始化连接管理器
  useEffect(() => {
    const manager = new ConnectionManager(managerOptions);
    managerRef.current = manager;

    // 监听状态变化
    manager.on('stateChange', ({ newState }) => {
      setState(newState);
      setConnectionInfo(manager.getConnectionInfo());
    });

    // 监听连接成功
    manager.on('connected', () => {
      setConnectionInfo(manager.getConnectionInfo());
      callbacksRef.current.onConnected?.();
    });

    // 监听断开连接
    manager.on('disconnected', ({ code, reason }) => {
      setConnectionInfo(manager.getConnectionInfo());
      callbacksRef.current.onDisconnected?.(code, reason);
    });

    // 监听消息
    manager.on('message', ({ data }) => {
      callbacksRef.current.onMessage?.(data);
    });

    // 监听错误
    manager.on('error', ({ error }) => {
      callbacksRef.current.onError?.(error);
    });

    // 监听重连中
    manager.on('reconnecting', ({ attempt, maxAttempts }) => {
      setConnectionInfo(manager.getConnectionInfo());
      callbacksRef.current.onReconnecting?.(attempt, maxAttempts);
    });

    // 监听重连失败
    manager.on('reconnectFailed', () => {
      setConnectionInfo(manager.getConnectionInfo());
      callbacksRef.current.onReconnectFailed?.();
    });

    // 监听延迟更新
    manager.on('latency', ({ latency: lat }) => {
      setLatency(lat);
      callbacksRef.current.onLatencyUpdate?.(lat);
    });

    // 自动连接
    if (autoConnect && url) {
      manager.connect(url);
    }

    // 清理
    return () => {
      manager.destroy();
      managerRef.current = null;
    };
  }, []); // 只在挂载时初始化一次

  // 连接方法
  const connect = useCallback((connectUrl: string) => {
    managerRef.current?.connect(connectUrl);
  }, []);

  // 断开连接方法
  const disconnect = useCallback(() => {
    managerRef.current?.disconnect();
  }, []);

  // 发送消息方法
  const send = useCallback((data: any, messageId?: string) => {
    return managerRef.current?.send(data, messageId) || '';
  }, []);

  // 发送心跳方法
  const sendPing = useCallback(() => {
    managerRef.current?.sendPing();
  }, []);

  // 获取管理器
  const getManager = useCallback(() => {
    return managerRef.current;
  }, []);

  return {
    state,
    isConnected: state === 'CONNECTED',
    isConnecting: state === 'CONNECTING' || state === 'RECONNECTING',
    connectionInfo,
    latency,
    connect,
    disconnect,
    send,
    sendPing,
    getManager,
  };
}
