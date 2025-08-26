import { makeAutoObservable, runInAction } from 'mobx';
import type { 
  WebSocketReadyState, 
  WebSocketOptions, 
  ConnectionInfo,
  PingMessage,
  PongMessage 
} from '@/types';

/**
 * WebSocket Store
 * 使用 MobX 管理 WebSocket 连接状态和消息
 * 
 * 🏆 最佳实践实现：
 * 1. 【连接管理】自动重连机制、合理的重连间隔和最大重试次数
 * 2. 【消息处理】JSON 格式传输、消息类型分发机制
 * 3. 【错误处理】捕获所有错误、用户友好提示、错误日志
 * 4. 【性能优化】消息队列、心跳检测、避免频繁小消息
 */
export class WebSocketStore {
  // WebSocket 实例
  private ws: WebSocket | null = null;
  
  // 连接URL
  url: string = '';
  
  // 连接状态
  readyState: WebSocketReadyState = 'CLOSED';
  
  // 最后接收的消息
  lastMessage: { data: any; timestamp: number } | null = null;
  
  // 连接信息
  connectionInfo: ConnectionInfo = {
    url: '',
    isConnected: false,
    isConnecting: false,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    latency: 0,
    messageQueueLength: 0,
  };
  
  // 配置选项
  private options: Required<WebSocketOptions> = {
    reconnectInterval: 3000, // 3秒重连间隔
    maxReconnectAttempts: 5, // 5次最大的重连次数
    heartbeatInterval: 30000, // 30秒心跳间隔
    heartbeatTimeout: 10000, // 10秒心跳超时
    enableHeartbeat: true, // 启用心跳检测
    enableAutoReconnect: true, // 启用自动重连
    debug: true, // 启用调试模式
    onOpen: () => {}, // 连接建立回调
    onMessage: () => {}, // 消息接收回调
    onClose: () => {}, // 连接关闭回调
    onError: () => {}, // 错误回调
  };
  
  // 重连相关 - 🏆【连接管理最佳实践】
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  
  // 心跳相关 - 🏆【性能优化最佳实践】保持连接活跃
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private heartbeatTimeoutTimer: NodeJS.Timeout | null = null;
  private lastPingTime = 0;
  
  // 消息队列 - 🏆【性能优化最佳实践】避免消息丢失
  private messageQueue: string[] = [];
  
  // 事件监听器 - 🏆【消息处理最佳实践】消息类型分发机制
  private eventListeners: Map<string, Set<Function>> = new Map();

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  /**
   * 连接 WebSocket
   * 🏆【连接管理最佳实践】在页面卸载时正确关闭连接
   */
  connect = (url: string, options: Partial<WebSocketOptions> = {}): void => {
    if (this.isConnecting || this.isConnected) {
      this.log('已经连接或正在连接中');
      return;
    }

    this.url = url;
    this.options = { ...this.options, ...options };
    
    this.setConnecting(true);
    
    try {
      this.log(`正在连接到: ${url}`);
      this.ws = new WebSocket(url);
      
      this.setupEventListeners();
      this.emit('connecting', { url });
      
    } catch (error) {
      this.log('连接失败:', error);
      this.setConnecting(false);
      this.handleError(error);
    }
  };

  /**
   * 断开连接
   */
  disconnect = (code = 1000, reason = '正常关闭'): void => {
    this.options.enableAutoReconnect = false;
    this.clearTimers();
    
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.close(code, reason);
    }
    
    this.reset();
  };

  /**
   * 发送消息
   * 🏆【消息处理最佳实践】使用 JSON 格式传输结构化数据
   * 🏆【性能优化最佳实践】消息队列避免消息丢失
   */
  sendMessage = (data: any): boolean => {
    const message = typeof data === 'string' ? data : JSON.stringify(data);
    
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(message);
      this.log('发送消息:', data);
      return true;
    } else {
      // 连接未就绪时，将消息加入队列
      this.messageQueue.push(message);
      runInAction(() => {
        this.connectionInfo.messageQueueLength = this.messageQueue.length;
      });
      this.log('消息已加入队列:', data);
      return false;
    }
  };

  /**
   * 发送心跳
   */
  sendPing = (): void => {
    if (!this.isConnected) return;
    
    this.lastPingTime = Date.now();
    const pingMessage: PingMessage = {
      type: 'ping',
      timestamp: this.lastPingTime,
    };
    
    this.sendMessage(pingMessage);
    
    // 设置心跳超时定时器
    this.heartbeatTimeoutTimer = setTimeout(() => {
      this.log('心跳超时，准备重连');
      this.ws?.close(4000, '心跳超时');
    }, this.options.heartbeatTimeout);
  };

  /**
   * 处理心跳响应
   */
  private handlePong = (message: PongMessage): void => {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
    
    // 计算延迟
    if (message.timestamp === this.lastPingTime) {
      const latency = Date.now() - this.lastPingTime;
      runInAction(() => {
        this.connectionInfo.latency = latency;
      });
      this.log(`延迟: ${latency}ms`);
      this.emit('latency', { latency });
    }
  };

  /**
   * 设置 WebSocket 事件监听器
   */
  private setupEventListeners = (): void => {
    if (!this.ws) return;

    this.ws.onopen = (event) => {
      this.log('WebSocket 连接已建立');
      this.setConnected(true);
      this.reconnectAttempts = 0;
      
      runInAction(() => {
        this.connectionInfo.reconnectAttempts = 0;
        this.connectionInfo.lastConnectedAt = Date.now();
      });

      this.startHeartbeat();
      this.sendQueuedMessages();
      
      this.options.onOpen(event);
      this.emit('connected', { url: this.url, event });
    };

    this.ws.onmessage = (event) => {
      try {
        let data: any;
        
        // 🏆【消息处理最佳实践】使用 JSON 格式传输结构化数据
        try {
          data = JSON.parse(event.data);
        } catch {
          data = event.data;
        }
        
        this.log('收到消息:', data);
        
        // 处理心跳响应
        if (data?.type === 'pong') {
          this.handlePong(data);
          return;
        }
        
        runInAction(() => {
          this.lastMessage = { data, timestamp: Date.now() };
        });
        
        this.options.onMessage(event);
        this.emit('message', { data, raw: event.data, event });
        
      } catch (error) {
        // 🏆【错误处理最佳实践】捕获并处理所有可能的错误
        this.log('消息处理错误:', error);
        this.emit('messageError', { error, event });
      }
    };

    this.ws.onclose = (event) => {
      this.log(`WebSocket 连接已关闭: ${event.code} - ${event.reason}`);
      
      this.setConnected(false);
      this.stopHeartbeat();
      
      runInAction(() => {
        this.connectionInfo.lastDisconnectedAt = Date.now();
      });
      
      this.options.onClose(event);
      this.emit('disconnected', { 
        code: event.code,
        reason: event.reason,
        wasClean: event.wasClean,
        event 
      });
      
      // 如果不是正常关闭且启用了自动重连，则尝试重连
      if (event.code !== 1000 && this.options.enableAutoReconnect) {
        this.reconnect();
      }
    };

    this.ws.onerror = (error) => {
      this.log('WebSocket 错误:', error);
      this.setConnecting(false);
      
      this.options.onError(error);
      this.emit('error', { error });
    };
  };

  /**
   * 启动心跳检测
   */
  private startHeartbeat = (): void => {
    if (!this.options.enableHeartbeat) return;
    
    this.heartbeatTimer = setInterval(() => {
      this.sendPing();
    }, this.options.heartbeatInterval);
    
    this.log('心跳检测已启动');
  };

  /**
   * 停止心跳检测
   */
  private stopHeartbeat = (): void => {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
    
    this.log('心跳检测已停止');
  };

  /**
   * 自动重连
   * 🏆【连接管理最佳实践】设置合理的重连间隔和最大重试次数
   */
  private reconnect = (): void => {
    if (!this.options.enableAutoReconnect) {
      this.log('自动重连已禁用');
      return;
    }
    
    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      this.log('已达到最大重连次数');
      this.emit('reconnectFailed', {
        attempts: this.reconnectAttempts,
        maxAttempts: this.options.maxReconnectAttempts,
      });
      return;
    }
    
    this.reconnectAttempts++;
    this.log(`准备第 ${this.reconnectAttempts} 次重连...`);
    
    runInAction(() => {
      this.connectionInfo.reconnectAttempts = this.reconnectAttempts;
    });
    
    this.reconnectTimer = setTimeout(() => {
      this.emit('reconnecting', {
        attempt: this.reconnectAttempts,
        maxAttempts: this.options.maxReconnectAttempts,
      });
      
      this.setConnecting(false);
      this.connect(this.url, this.options);
    }, this.options.reconnectInterval);
  };

  /**
   * 发送队列中的消息
   */
  private sendQueuedMessages = (): void => {
    const queueLength = this.messageQueue.length;
    
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(message);
      }
    }
    
    runInAction(() => {
      this.connectionInfo.messageQueueLength = this.messageQueue.length;
    });
    
    if (queueLength > 0) {
      this.log(`发送了 ${queueLength} 条队列消息`);
    }
  };

  /**
   * 清理定时器
   */
  private clearTimers = (): void => {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.stopHeartbeat();
  };

  /**
   * 重置状态
   */
  private reset = (): void => {
    runInAction(() => {
      this.readyState = 'CLOSED';
      this.connectionInfo.isConnected = false;
      this.connectionInfo.isConnecting = false;
      this.connectionInfo.messageQueueLength = 0;
      this.lastMessage = null;
    });
    
    this.ws = null;
    this.lastPingTime = 0;
    this.reconnectAttempts = 0;
    this.messageQueue = [];
  };

  /**
   * 设置连接中状态
   */
  private setConnecting = (connecting: boolean): void => {
    runInAction(() => {
      this.readyState = connecting ? 'CONNECTING' : 'CLOSED';
      this.connectionInfo.isConnecting = connecting;
      this.connectionInfo.url = this.url;
    });
  };

  /**
   * 设置连接状态
   */
  private setConnected = (connected: boolean): void => {
    runInAction(() => {
      this.readyState = connected ? 'OPEN' : 'CLOSED';
      this.connectionInfo.isConnected = connected;
      this.connectionInfo.isConnecting = false;
      this.connectionInfo.url = this.url;
    });
  };

  /**
   * 处理错误
   */
  private handleError = (error: any): void => {
    this.log('WebSocket 错误:', error);
    this.emit('error', { error });
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
  getConnectionInfo = (): ConnectionInfo => {
    return { ...this.connectionInfo };
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
      listeners.forEach(listener => {
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
    this.disconnect();
    this.clearTimers();
    this.messageQueue = [];
    this.eventListeners.clear();
    
    this.log('WebSocketStore 已销毁');
  };
}
