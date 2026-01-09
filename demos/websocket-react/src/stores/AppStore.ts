import { makeAutoObservable, runInAction } from 'mobx';
import type { LoginFormData, AppState, AppConfig } from '@/types';

/**
 * 应用主 Store
 * 管理全局应用状态、用户登录状态等
 */
export class AppStore {
  // 当前用户
  currentUser: string | null = null;
  
  // 服务器地址
  serverUrl: string = 'ws://localhost:8080';
  
  // 登录状态
  isLoggedIn: boolean = false;
  
  // 加载状态
  isLoading: boolean = false;
  
  // 全局错误
  globalError: string | null = null;
  
  // 应用配置
  config: AppConfig = {
    websocket: {
      defaultUrl: 'ws://localhost:8080',
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      heartbeatTimeout: 10000,
    },
    ui: {
      messageMaxLength: 500,
      usernameMaxLength: 20,
      notificationDuration: 3000,
    },
    development: {
      enableDevTools: process.env.NODE_ENV === 'development',
      enableLogging: process.env.NODE_ENV === 'development',
    },
  };

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
    this.loadFromStorage();
  }

  /**
   * 从本地存储加载数据
   */
  private loadFromStorage(): void {
    try {
      const savedUser = localStorage.getItem('websocket-chat-user');
      const savedServerUrl = localStorage.getItem('websocket-chat-server-url');
      
      if (savedUser) {
        this.currentUser = savedUser;
      }
      
      if (savedServerUrl) {
        this.serverUrl = savedServerUrl;
      }
    } catch (error) {
      this.log('从本地存储加载数据失败:', error);
    }
  }

  /**
   * 保存数据到本地存储
   */
  private saveToStorage(): void {
    try {
      if (this.currentUser) {
        localStorage.setItem('websocket-chat-user', this.currentUser);
      }
      localStorage.setItem('websocket-chat-server-url', this.serverUrl);
    } catch (error) {
      this.log('保存数据到本地存储失败:', error);
    }
  }

  /**
   * 用户登录
   */
  login = async (data: LoginFormData): Promise<void> => {
    this.setLoading(true);
    this.clearError();

    try {
      // 验证输入数据
      this.validateLoginData(data);
      
      // 模拟登录延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      runInAction(() => {
        this.currentUser = data.username.trim();
        this.serverUrl = data.serverUrl.trim();
        this.isLoggedIn = true;
      });
      
      this.saveToStorage();
      this.log('用户登录成功:', this.currentUser);
      
    } catch (error) {
      this.setError(error instanceof Error ? error.message : '登录失败');
      throw error;
    } finally {
      this.setLoading(false);
    }
  };

  /**
   * 用户登出
   */
  logout = (): void => {
    runInAction(() => {
      this.currentUser = null;
      this.isLoggedIn = false;
      this.globalError = null;
    });
    
    try {
      localStorage.removeItem('websocket-chat-user');
    } catch (error) {
      this.log('清理本地存储失败:', error);
    }
    
    this.log('用户登出');
  };

  /**
   * 设置加载状态
   */
  setLoading = (loading: boolean): void => {
    this.isLoading = loading;
  };

  /**
   * 设置错误信息
   */
  setError = (error: string | null): void => {
    this.globalError = error;
  };

  /**
   * 清除错误信息
   */
  clearError = (): void => {
    this.globalError = null;
  };

  /**
   * 更新服务器地址
   */
  updateServerUrl = (url: string): void => {
    this.serverUrl = url;
    this.saveToStorage();
  };

  /**
   * 验证登录数据
   */
  private validateLoginData(data: LoginFormData): void {
    const { username, serverUrl } = data;

    // 验证用户名
    if (!username || typeof username !== 'string') {
      throw new Error('用户名不能为空');
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2) {
      throw new Error('用户名至少需要2个字符');
    }

    if (trimmedUsername.length > this.config.ui.usernameMaxLength) {
      throw new Error(`用户名不能超过${this.config.ui.usernameMaxLength}个字符`);
    }

    // 验证服务器地址
    if (!serverUrl || typeof serverUrl !== 'string') {
      throw new Error('服务器地址不能为空');
    }

    if (!this.isValidWebSocketUrl(serverUrl.trim())) {
      throw new Error('请输入有效的 WebSocket 地址 (ws:// 或 wss://)');
    }
  }

  /**
   * 验证 WebSocket URL
   */
  private isValidWebSocketUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'ws:' || urlObj.protocol === 'wss:';
    } catch {
      return false;
    }
  }

  /**
   * 获取应用状态
   */
  get appState(): AppState {
    return {
      currentUser: this.currentUser,
      serverUrl: this.serverUrl,
      isLoggedIn: this.isLoggedIn,
    };
  }

  /**
   * 是否处于开发模式
   */
  get isDevelopment(): boolean {
    return this.config.development.enableDevTools;
  }

  /**
   * 是否启用日志
   */
  get isLoggingEnabled(): boolean {
    return this.config.development.enableLogging;
  }

  /**
   * 日志输出
   */
  private log(...args: any[]): void {
    if (this.isLoggingEnabled) {
      console.log('[AppStore]', ...args);
    }
  }

  /**
   * 重置应用状态
   */
  reset = (): void => {
    runInAction(() => {
      this.currentUser = null;
      this.serverUrl = this.config.websocket.defaultUrl;
      this.isLoggedIn = false;
      this.isLoading = false;
      this.globalError = null;
    });
    
    try {
      localStorage.clear();
    } catch (error) {
      this.log('清理本地存储失败:', error);
    }
    
    this.log('应用状态已重置');
  };

  /**
   * 更新配置
   */
  updateConfig = (newConfig: Partial<AppConfig>): void => {
    this.config = { ...this.config, ...newConfig };
    this.log('配置已更新:', newConfig);
  };
}
