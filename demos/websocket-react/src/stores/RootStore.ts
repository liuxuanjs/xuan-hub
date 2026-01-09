import { createContext, useContext } from 'react';
import { AppStore } from './AppStore';
import { WebSocketStore } from './WebSocketStore';
import { ChatStore } from './ChatStore';

/**
 * 根 Store
 * 管理所有子 Store 实例
 */
export class RootStore {
  appStore: AppStore;
  webSocketStore: WebSocketStore;
  chatStore: ChatStore;

  // 存储事件监听器引用，便于清理
  private eventHandlers: Map<string, Function> = new Map();

  constructor() {
    this.appStore = new AppStore();
    this.webSocketStore = new WebSocketStore();
    this.chatStore = new ChatStore();

    // 设置 Store 之间的关联
    this.setupStoreConnections();
  }

  /**
   * 设置 Store 之间的连接
   */
  private setupStoreConnections(): void {
    // 监听 WebSocket 消息，传递给 ChatStore
    const messageHandler = (event: any) => {
      this.chatStore.handleWebSocketMessage(event.data);
    };
    this.webSocketStore.addEventListener('message', messageHandler);
    this.eventHandlers.set('message', messageHandler);

    // 监听连接成功事件
    const connectedHandler = () => {
      if (this.appStore.currentUser) {
        this.chatStore.setCurrentUser(this.appStore.currentUser);

        // 发送用户加入消息
        this.webSocketStore.sendMessage({
          type: 'join',
          username: this.appStore.currentUser,
          timestamp: Date.now(),
        });
      }
    };
    this.webSocketStore.addEventListener('connected', connectedHandler);
    this.eventHandlers.set('connected', connectedHandler);

    // 监听连接断开事件
    const disconnectedHandler = (event: any) => {
      if (event.code !== 1000) {
        this.chatStore.showNotification('连接已断开，正在尝试重连...', 'warning');
      }
    };
    this.webSocketStore.addEventListener('disconnected', disconnectedHandler);
    this.eventHandlers.set('disconnected', disconnectedHandler);

    // 监听重连事件
    const reconnectingHandler = (event: any) => {
      const { attempt, maxAttempts } = event;
      this.chatStore.showNotification(
        `正在重连 (${attempt}/${maxAttempts})...`,
        'info'
      );
    };
    this.webSocketStore.addEventListener('reconnecting', reconnectingHandler);
    this.eventHandlers.set('reconnecting', reconnectingHandler);

    // 监听重连失败事件
    const reconnectFailedHandler = () => {
      this.chatStore.showNotification('重连失败，请手动重新连接', 'error');
    };
    this.webSocketStore.addEventListener('reconnectFailed', reconnectFailedHandler);
    this.eventHandlers.set('reconnectFailed', reconnectFailedHandler);

    // 监听连接错误事件
    const errorHandler = () => {
      this.chatStore.showNotification('连接出现错误', 'error');
    };
    this.webSocketStore.addEventListener('error', errorHandler);
    this.eventHandlers.set('error', errorHandler);

    // 监听延迟更新事件
    const latencyHandler = (event: any) => {
      // 可以在这里处理延迟信息，比如显示网络状态
      console.log('网络延迟:', event.latency, 'ms');
    };
    this.webSocketStore.addEventListener('latency', latencyHandler);
    this.eventHandlers.set('latency', latencyHandler);
  }

  /**
   * 用户登录
   */
  login = async (username: string, serverUrl: string): Promise<void> => {
    try {
      // 登录到应用
      await this.appStore.login({ username, serverUrl });
      
      // 设置聊天用户
      this.chatStore.setCurrentUser(username);
      
      // 连接 WebSocket
      this.webSocketStore.connect(serverUrl, {
        debug: this.appStore.isDevelopment,
        enableHeartbeat: true,
        enableAutoReconnect: true,
        ...this.appStore.config.websocket,
      });
      
    } catch (error) {
      throw error;
    }
  };

  /**
   * 用户登出
   */
  logout = (): void => {
    // 发送用户离开消息
    if (this.appStore.currentUser && this.webSocketStore.isConnected) {
      this.webSocketStore.sendMessage({
        type: 'leave',
        username: this.appStore.currentUser,
        timestamp: Date.now(),
      });
    }
    
    // 断开 WebSocket 连接
    this.webSocketStore.disconnect(1000, '用户主动断开');
    
    // 登出应用
    this.appStore.logout();
    
    // 重置聊天状态
    this.chatStore.reset();
  };

  /**
   * 发送消息
   */
  sendMessage = (content: string): boolean => {
    if (!this.appStore.currentUser) {
      this.chatStore.showNotification('请先登录', 'warning');
      return false;
    }

    if (!this.webSocketStore.isConnected) {
      this.chatStore.showNotification('连接已断开，无法发送消息', 'warning');
      return false;
    }

    return this.webSocketStore.sendMessage({
      type: 'message',
      username: this.appStore.currentUser,
      content: content.trim(),
      timestamp: Date.now(),
    });
  };

  /**
   * 发送输入状态
   */
  sendTyping = (isTyping: boolean): void => {
    if (!this.appStore.currentUser || !this.webSocketStore.isConnected) {
      return;
    }

    this.webSocketStore.sendMessage({
      type: 'typing',
      username: this.appStore.currentUser,
      isTyping,
      timestamp: Date.now(),
    });
  };

  /**
   * 测试连接
   */
  testConnection = (): void => {
    if (!this.webSocketStore.isConnected) {
      this.chatStore.showNotification('当前未连接', 'warning');
      return;
    }

    this.webSocketStore.sendPing();
    this.chatStore.showNotification('已发送心跳包', 'info');
  };

  /**
   * 清空消息
   */
  clearMessages = (): void => {
    this.chatStore.clearMessages();
  };

  /**
   * 获取连接状态文本
   */
  get connectionStatusText(): string {
    if (this.webSocketStore.isConnected) return '已连接';
    if (this.webSocketStore.isConnecting) return '连接中';
    if (this.webSocketStore.connectionInfo.reconnectAttempts > 0) {
      return `重连中 (${this.webSocketStore.connectionInfo.reconnectAttempts})`;
    }
    return '已断开';
  }

  /**
   * 销毁所有 Store
   */
  destroy = (): void => {
    // 清理事件监听器
    this.eventHandlers.forEach((handler, event) => {
      this.webSocketStore.removeEventListener(event, handler);
    });
    this.eventHandlers.clear();

    this.logout();
    this.webSocketStore.destroy();
    this.appStore.reset();
    this.chatStore.reset();
  };
}

// 创建全局 Store 实例
export const rootStore = new RootStore();

// 创建 React Context
export const StoreContext = createContext<RootStore>(rootStore);

// 创建 Hook 来使用 Store
export const useStores = (): RootStore => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStores must be used within a StoreProvider');
  }
  return context;
};

// 创建单独的 Hook 来使用各个 Store
export const useAppStore = (): AppStore => useStores().appStore;
export const useWebSocketStore = (): WebSocketStore => useStores().webSocketStore;
export const useChatStore = (): ChatStore => useStores().chatStore;
