import { makeAutoObservable, runInAction } from 'mobx';
import { ConnectionManager, ConnectionInfo } from '@/core/websocket';
import type {
  WebSocketReadyState,
  WebSocketOptions,
  ConnectionInfo as LegacyConnectionInfo,
  PingMessage,
  ConnectionState,
} from '@/types';

/**
 * WebSocket Store（重构版）
 * 使用 ConnectionManager 管理连接，提供 MobX 响应式状态
 *
 * 🏆 最佳实践实现：
 * 1. 【连接管理】使用 ConnectionManager + 状态机 + 指数退避重连
 * 2. 【消息处理】消息重试队列 + 批处理 + JSON 序列化
 * 3. 【错误处理】统一错误处理 + 自动恢复 + 用户提示
 * 4. 【性能优化】消息队列 + 心跳检测 + 网络状态检测
 */
export class WebSocketStore {
  // 连接管理器
  private connectionManager: ConnectionManager;

  // 连接 URL
  url: string = '';

  // 连接状态 (兼容旧版)
  readyState: WebSocketReadyState = 'CLOSED';

  // 最后接收的消息
  lastMessage: { data: any; timestamp: number } | null = null;

  // 连接信息 (兼容旧版)
  connectionInfo: LegacyConnectionInfo = {
    url: '',
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 10,
    latency: 0,
    messageQueueLength: 0,
  };

  // 增强连接信息
  enhancedConnectionInfo: ConnectionInfo | null = null;

  // 配置选项
  private options: Required<WebSocketOptions> = {
    reconnectInterval: 1000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000,
    heartbeatTimeout: 10000,
    enableHeartbeat: true,
    enableAutoReconnect: true,
    debug: process.env.NODE_ENV === 'development',
    onOpen: () => {},
    onMessage: () => {},
    onClose: () => {},
    onError: () => {},
  };

  // 事件监听器
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    // 创建连接管理器
    this.connectionManager = new ConnectionManager({
      heartbeatInterval: this.options.heartbeatInterval,
      heartbeatTimeout: this.options.heartbeatTimeout,
      enableHeartbeat: this.options.enableHeartbeat,
      enableAutoReconnect: this.options.enableAutoReconnect,
      debug: this.options.debug,
      reconnect: {
        initialDelay: this.options.reconnectInterval,
        maxRetries: this.options.maxReconnectAttempts,
        maxDelay: 30000,
        multiplier: 1.5,
        jitter: true,
        jitterFactor: 0.3,
      },
      messageRetry: {
        maxRetries: 3,
        retryDelay: 2000,
        maxQueueSize: 100,
        messageExpiry: 5 * 60 * 1000,
      },
    });

    // 设置事件监听
    this.setupConnectionManagerListeners();

    makeAutoObservable(this, {
      // 排除私有字段
      connectionManager: false,
      options: false,
      eventListeners: false,
      // 排除私有方法
      setupConnectionManagerListeners: false,
      mapStateToReadyState: false,
      updateConnectionInfo: false,
      emit: false,
      log: false,
    }, { autoBind: true });
  }

  /**
   * 设置连接管理器的事件监听
   */
  private setupConnectionManagerListeners(): void {
    // 状态变化
    this.connectionManager.on('stateChange', ({ newState }) => {
      runInAction(() => {
        this.readyState = this.mapStateToReadyState(newState);
        this.updateConnectionInfo();
      });
    });

    // 连接成功
    this.connectionManager.on('connected', () => {
      runInAction(() => {
        this.readyState = 'OPEN';
        this.connectionInfo.isConnected = true;
        this.connectionInfo.isConnecting = false;
        this.connectionInfo.reconnectAttempts = 0;
        this.connectionInfo.lastConnectedAt = Date.now();
        this.updateConnectionInfo();
      });

      this.options.onOpen(new Event('open'));
      this.emit('connected', { url: this.url });
    });

    // 断开连接
    this.connectionManager.on('disconnected', ({ code, reason, clean }) => {
      runInAction(() => {
        this.readyState = 'CLOSED';
        this.connectionInfo.isConnected = false;
        this.connectionInfo.isConnecting = false;
        this.connectionInfo.lastDisconnectedAt = Date.now();
        this.updateConnectionInfo();
      });

      const closeEvent = new CloseEvent('close', { code, reason, wasClean: clean });
      this.options.onClose(closeEvent);
      this.emit('disconnected', { code, reason, wasClean: clean });
    });

    // 消息接收
    this.connectionManager.on('message', ({ data, raw }) => {
      runInAction(() => {
        this.lastMessage = { data, timestamp: Date.now() };
      });

      const messageEvent = new MessageEvent('message', { data: raw });
      this.options.onMessage(messageEvent);
      this.emit('message', { data, raw });
    });

    // 错误
    this.connectionManager.on('error', ({ error }) => {
      this.options.onError(error);
      this.emit('error', { error });
    });

    // 重连中
    this.connectionManager.on('reconnecting', ({ attempt, maxAttempts }) => {
      runInAction(() => {
        this.readyState = 'CONNECTING';
        this.connectionInfo.isConnecting = true;
        this.connectionInfo.reconnectAttempts = attempt;
        this.connectionInfo.maxReconnectAttempts = maxAttempts;
        this.updateConnectionInfo();
      });

      this.emit('reconnecting', { attempt, maxAttempts });
    });

    // 重连失败
    this.connectionManager.on('reconnectFailed', ({ attempts, maxAttempts }) => {
      runInAction(() => {
        this.readyState = 'CLOSED';
        this.connectionInfo.isConnecting = false;
        this.updateConnectionInfo();
      });

      this.emit('reconnectFailed', { attempts, maxAttempts });
    });

    // 延迟更新
    this.connectionManager.on('latency', ({ latency }) => {
      runInAction(() => {
        this.connectionInfo.latency = latency;
        this.updateConnectionInfo();
      });

      this.emit('latency', { latency });
    });

    // 消息状态更新
    this.connectionManager.on('messageStatus', (message) => {
      runInAction(() => {
        const info = this.connectionManager.getConnectionInfo();
        this.connectionInfo.messageQueueLength = info.pendingMessages;
        this.updateConnectionInfo();
      });

      this.emit('messageStatus', message);
    });
  }

  /**
   * 映射状态到旧版 ReadyState
   */
  private mapStateToReadyState(state: ConnectionState): WebSocketReadyState {
    switch (state) {
      case 'CONNECTED':
        return 'OPEN';
      case 'CONNECTING':
      case 'RECONNECTING':
        return 'CONNECTING';
      case 'DISCONNECTING':
        return 'CLOSING';
      default:
        return 'CLOSED';
    }
  }

  /**
   * 更新连接信息
   */
  private updateConnectionInfo(): void {
    const info = this.connectionManager.getConnectionInfo();
    this.enhancedConnectionInfo = info;

    this.connectionInfo.url = info.url;
    this.connectionInfo.isConnected = info.isConnected;
    this.connectionInfo.isConnecting = info.isConnecting;
    this.connectionInfo.reconnectAttempts = info.reconnectAttempts;
    this.connectionInfo.maxReconnectAttempts = info.maxReconnectAttempts;
    this.connectionInfo.latency = info.latency;
    this.connectionInfo.messageQueueLength = info.pendingMessages;
    this.connectionInfo.lastConnectedAt = info.lastConnectedAt;
    this.connectionInfo.lastDisconnectedAt = info.lastDisconnectedAt;
  }

  /**
   * 连接 WebSocket
   */
  connect = (url: string, options: Partial<WebSocketOptions> = {}): void => {
    if (this.connectionManager.isConnected() || this.connectionManager.isConnecting()) {
      this.log('已经连接或正在连接中');
      return;
    }

    this.url = url;
    this.options = { ...this.options, ...options };

    // 更新连接管理器配置
    this.connectionManager.updateOptions({
      heartbeatInterval: this.options.heartbeatInterval,
      heartbeatTimeout: this.options.heartbeatTimeout,
      enableHeartbeat: this.options.enableHeartbeat,
      enableAutoReconnect: this.options.enableAutoReconnect,
      debug: this.options.debug,
    });

    runInAction(() => {
      this.connectionInfo.url = url;
    });

    this.emit('connecting', { url });
    this.connectionManager.connect(url);
  };

  /**
   * 断开连接
   */
  disconnect = (code = 1000, reason = '正常关闭'): void => {
    this.connectionManager.disconnect(code, reason);
  };

  /**
   * 发送消息
   */
  sendMessage = (data: any): boolean => {
    const messageId = this.connectionManager.send(data);
    const success = this.connectionManager.isConnected();

    this.log(success ? '发送消息:' : '消息已加入队列:', data);
    return success;
  };

  /**
   * 发送心跳
   */
  sendPing = (): void => {
    if (!this.isConnected) return;
    this.connectionManager.sendPing();
  };

  // 计算属性
  get isConnected(): boolean {
    return this.readyState === 'OPEN';
  }

  get isConnecting(): boolean {
    return this.readyState === 'CONNECTING';
  }

  get isClosed(): boolean {
    return this.readyState === 'CLOSED';
  }

  /**
   * 获取连接信息
   */
  getConnectionInfo = (): LegacyConnectionInfo => {
    return { ...this.connectionInfo };
  };

  /**
   * 获取增强连接信息
   */
  getEnhancedConnectionInfo = (): ConnectionInfo | null => {
    return this.enhancedConnectionInfo;
  };

  /**
   * 获取连接管理器（用于高级操作）
   */
  getConnectionManager = (): ConnectionManager => {
    return this.connectionManager;
  };

  /**
   * 事件监听
   */
  addEventListener = (event: string, listener: Function): void => {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  };

  /**
   * 移除事件监听
   */
  removeEventListener = (event: string, listener: Function): void => {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  };

  /**
   * 触发事件
   */
  private emit = (event: string, data?: any): void => {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(data);
        } catch (error) {
          this.log(`事件监听器错误 [${event}]:`, error);
        }
      });
    }
  };

  /**
   * 日志输出
   */
  private log = (...args: any[]): void => {
    if (this.options.debug) {
      console.log('[WebSocketStore]', ...args);
    }
  };

  /**
   * 销毁实例
   */
  destroy = (): void => {
    this.connectionManager.destroy();
    this.eventListeners.clear();
    this.log('WebSocketStore 已销毁');
  };
}
