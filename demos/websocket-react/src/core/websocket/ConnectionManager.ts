/**
 * WebSocket 连接管理器
 * 核心连接层，框架无关，负责管理 WebSocket 连接的完整生命周期
 */

import { ConnectionStateMachine, ConnectionState } from './ConnectionStateMachine';
import { ReconnectStrategy, ReconnectOptions } from './ReconnectStrategy';
import { MessageRetryQueue, MessageRetryOptions } from './MessageRetryQueue';

export interface ConnectionManagerOptions {
  /** 重连配置 */
  reconnect?: Partial<ReconnectOptions>;
  /** 消息重试配置 */
  messageRetry?: Partial<MessageRetryOptions>;
  /** 心跳间隔（毫秒），0 表示禁用 */
  heartbeatInterval: number;
  /** 心跳超时（毫秒） */
  heartbeatTimeout: number;
  /** 是否启用心跳 */
  enableHeartbeat: boolean;
  /** 是否启用自动重连 */
  enableAutoReconnect: boolean;
  /** 调试模式 */
  debug: boolean;
}

export interface ConnectionInfo {
  url: string;
  state: ConnectionState;
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  latency: number;
  pendingMessages: number;
  failedMessages: number;
  lastConnectedAt?: number | undefined;
  lastDisconnectedAt?: number | undefined;
  isOnline: boolean;
}

export type MessageHandler = (data: any) => void;
export type EventCallback = (data?: any) => void;

type InternalEvents =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'reconnectFailed'
  | 'message'
  | 'error'
  | 'stateChange'
  | 'latency'
  | 'messageStatus';

const DEFAULT_OPTIONS: ConnectionManagerOptions = {
  heartbeatInterval: 30000,
  heartbeatTimeout: 10000,
  enableHeartbeat: true,
  enableAutoReconnect: true,
  debug: process.env.NODE_ENV === 'development',
};

/**
 * WebSocket 连接管理器类
 */
export class ConnectionManager {
  private ws: WebSocket | null = null;
  private url: string = '';
  private options: ConnectionManagerOptions;
  private stateMachine: ConnectionStateMachine;
  private reconnectStrategy: ReconnectStrategy;
  private messageQueue: MessageRetryQueue;
  private eventListeners: Map<string, Set<EventCallback>> = new Map();

  // 心跳相关
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private lastPingTime = 0;
  private latency = 0;

  // 时间戳
  private lastConnectedAt?: number;
  private lastDisconnectedAt?: number;

  constructor(options: Partial<ConnectionManagerOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.stateMachine = new ConnectionStateMachine();
    this.reconnectStrategy = new ReconnectStrategy(options.reconnect);
    this.messageQueue = new MessageRetryQueue(options.messageRetry);

    // 设置消息队列的发送函数
    this.messageQueue.setSendFunction((message) => this.sendRaw(message));

    // 监听状态变化
    this.stateMachine.onStateChange((newState, oldState, event) => {
      this.emit('stateChange', { newState, oldState, event });
      this.log(`State changed: ${oldState} -> ${newState} (${event})`);
    });

    // 监听消息状态变化
    this.messageQueue.onStatusChange((message) => {
      this.emit('messageStatus', message);
    });
  }

  /**
   * 连接到 WebSocket 服务器
   */
  connect(url: string): void {
    if (this.stateMachine.isConnected() || this.stateMachine.isConnecting()) {
      this.log('Already connected or connecting');
      return;
    }

    this.url = url;
    this.stateMachine.transition('CONNECT');
    this.emit('connecting', { url });

    try {
      this.ws = new WebSocket(url);
      this.setupEventListeners();
    } catch (error) {
      this.log('Connection error:', error);
      this.handleConnectionError(error);
    }
  }

  /**
   * 断开连接
   * @param code 关闭码
   * @param reason 关闭原因
   * @param disableReconnect 是否禁用自动重连（默认 true）
   */
  disconnect(code = 1000, reason = '主动断开', disableReconnect = true): void {
    // 临时禁用重连
    if (disableReconnect) {
      this.options.enableAutoReconnect = false;
    }
    this.reconnectStrategy.cancelReconnect();
    this.stopHeartbeat();

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.stateMachine.transition('DISCONNECT');
      this.ws.close(code, reason);
    } else {
      this.stateMachine.transition('DISCONNECT');
      this.cleanup();
    }
  }

  /**
   * 发送消息（带重试队列支持）
   */
  send(data: any, messageId?: string): string {
    const id = messageId || this.generateMessageId();
    const message = typeof data === 'string' ? data : JSON.stringify(data);

    if (this.stateMachine.isConnected()) {
      const success = this.sendRaw(message);
      if (!success) {
        this.messageQueue.enqueue(id, message);
      }
    } else {
      this.messageQueue.enqueue(id, message);
      this.log('Message queued:', id);
    }

    return id;
  }

  /**
   * 原始发送（不经过队列）
   */
  private sendRaw(message: string): boolean {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      this.ws.send(message);
      return true;
    } catch (error) {
      this.log('Send error:', error);
      return false;
    }
  }

  /**
   * 发送心跳
   */
  sendPing(): void {
    if (!this.stateMachine.isConnected()) return;

    this.lastPingTime = Date.now();
    const pingMessage = JSON.stringify({
      type: 'ping',
      timestamp: this.lastPingTime,
    });

    this.sendRaw(pingMessage);

    // 设置心跳超时
    this.heartbeatTimeoutTimer = setTimeout(() => {
      this.log('Heartbeat timeout');
      this.ws?.close(4000, '心跳超时');
    }, this.options.heartbeatTimeout);
  }

  /**
   * 处理心跳响应
   */
  handlePong(timestamp: number): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }

    if (timestamp === this.lastPingTime) {
      this.latency = Date.now() - this.lastPingTime;
      this.emit('latency', { latency: this.latency });
    }
  }

  /**
   * 设置 WebSocket 事件监听器
   */
  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      this.log('Connection opened');
      this.stateMachine.transition('CONNECTED');
      this.lastConnectedAt = Date.now();
      this.reconnectStrategy.reset();

      this.startHeartbeat();
      this.flushMessageQueue();

      this.emit('connected', { url: this.url });
    };

    this.ws.onmessage = (event) => {
      try {
        let data = event.data;

        // 尝试解析 JSON
        try {
          data = JSON.parse(event.data);
        } catch {
          // 保持原始数据
        }

        // 处理心跳响应
        if (data?.type === 'pong') {
          this.handlePong(data.timestamp);
          return;
        }

        this.emit('message', { data, raw: event.data });
      } catch (error) {
        this.log('Message processing error:', error);
        this.emit('error', { error, type: 'message' });
      }
    };

    this.ws.onclose = (event) => {
      this.log(`Connection closed: ${event.code} - ${event.reason}`);
      this.lastDisconnectedAt = Date.now();
      this.stopHeartbeat();

      const wasConnected = this.stateMachine.isConnected();

      if (event.code === 1000) {
        // 正常关闭
        this.stateMachine.transition('DISCONNECTED');
        this.emit('disconnected', { code: event.code, reason: event.reason, clean: true });
      } else {
        // 异常关闭
        this.stateMachine.transition('DISCONNECTED');
        this.emit('disconnected', { code: event.code, reason: event.reason, clean: false });

        // 尝试重连
        if (wasConnected && this.options.enableAutoReconnect) {
          this.attemptReconnect();
        }
      }

      this.cleanup();
    };

    this.ws.onerror = (error) => {
      this.log('WebSocket error:', error);
      this.emit('error', { error, type: 'connection' });
    };
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    if (!this.options.enableAutoReconnect) {
      return;
    }

    this.stateMachine.transition('RECONNECT');

    const scheduled = this.reconnectStrategy.scheduleReconnect(() => {
      this.emit('reconnecting', {
        attempt: this.reconnectStrategy.getRetryCount(),
        maxAttempts: this.reconnectStrategy.getMaxRetries(),
      });

      // 重置状态机以便重新连接
      this.stateMachine.transition('CONNECT');
      this.connect(this.url);
    });

    if (!scheduled) {
      this.stateMachine.transition('RETRY_EXHAUSTED');
      this.emit('reconnectFailed', {
        attempts: this.reconnectStrategy.getRetryCount(),
        maxAttempts: this.reconnectStrategy.getMaxRetries(),
      });
    }
  }

  /**
   * 处理连接错误
   */
  private handleConnectionError(error: any): void {
    this.stateMachine.transition('ERROR');
    this.emit('error', { error, type: 'connection' });

    if (this.options.enableAutoReconnect) {
      this.attemptReconnect();
    }
  }

  /**
   * 启动心跳检测
   */
  private startHeartbeat(): void {
    if (!this.options.enableHeartbeat || this.options.heartbeatInterval <= 0) {
      return;
    }

    this.stopHeartbeat();

    this.heartbeatTimer = setInterval(() => {
      this.sendPing();
    }, this.options.heartbeatInterval);

    this.log('Heartbeat started');
  }

  /**
   * 停止心跳检测
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  /**
   * 发送队列中的消息
   */
  private async flushMessageQueue(): Promise<void> {
    const result = await this.messageQueue.flushAll();
    if (result.success > 0 || result.failed > 0) {
      this.log(`Flushed queue: ${result.success} sent, ${result.failed} failed`);
    }
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    this.ws = null;
  }

  /**
   * 生成消息 ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * 获取连接信息
   */
  getConnectionInfo(): ConnectionInfo {
    return {
      url: this.url,
      state: this.stateMachine.getState(),
      isConnected: this.stateMachine.isConnected(),
      isConnecting: this.stateMachine.isConnecting(),
      reconnectAttempts: this.reconnectStrategy.getRetryCount(),
      maxReconnectAttempts: this.reconnectStrategy.getMaxRetries(),
      latency: this.latency,
      pendingMessages: this.messageQueue.getPendingCount(),
      failedMessages: this.messageQueue.getFailedCount(),
      lastConnectedAt: this.lastConnectedAt,
      lastDisconnectedAt: this.lastDisconnectedAt,
      isOnline: this.reconnectStrategy.isNetworkOnline(),
    };
  }

  /**
   * 获取状态机
   */
  getStateMachine(): ConnectionStateMachine {
    return this.stateMachine;
  }

  /**
   * 获取消息队列
   */
  getMessageQueue(): MessageRetryQueue {
    return this.messageQueue;
  }

  /**
   * 添加事件监听器
   */
  on(event: InternalEvents, callback: EventCallback): () => void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  /**
   * 移除事件监听器
   */
  off(event: InternalEvents, callback: EventCallback): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  /**
   * 触发事件
   */
  private emit(event: InternalEvents, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          this.log(`Event listener error [${event}]:`, error);
        }
      });
    }
  }

  /**
   * 日志输出
   */
  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log('[ConnectionManager]', ...args);
    }
  }

  /**
   * 更新配置
   */
  updateOptions(options: Partial<ConnectionManagerOptions>): void {
    this.options = { ...this.options, ...options };

    if (options.reconnect) {
      this.reconnectStrategy.updateOptions(options.reconnect);
    }
  }

  /**
   * 是否已连接
   */
  isConnected(): boolean {
    return this.stateMachine.isConnected();
  }

  /**
   * 是否正在连接
   */
  isConnecting(): boolean {
    return this.stateMachine.isConnecting();
  }

  /**
   * 销毁管理器
   */
  destroy(): void {
    this.disconnect(1000, '销毁连接');
    this.stopHeartbeat();
    this.stateMachine.destroy();
    this.reconnectStrategy.destroy();
    this.messageQueue.destroy();
    this.eventListeners.clear();

    this.log('ConnectionManager destroyed');
  }
}
