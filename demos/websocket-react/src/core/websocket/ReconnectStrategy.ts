/**
 * 重连策略
 * 实现指数退避算法和网络状态检测
 */

export interface ReconnectOptions {
  /** 初始重连延迟（毫秒） */
  initialDelay: number;
  /** 最大重连延迟（毫秒） */
  maxDelay: number;
  /** 最大重试次数，0 表示无限重试 */
  maxRetries: number;
  /** 退避乘数 */
  multiplier: number;
  /** 是否添加随机抖动 */
  jitter: boolean;
  /** 抖动因子 (0-1) */
  jitterFactor: number;
}

export interface ReconnectState {
  /** 当前重试次数 */
  retryCount: number;
  /** 下一次重连延迟 */
  nextDelay: number;
  /** 是否可以继续重试 */
  canRetry: boolean;
  /** 最后一次重连时间 */
  lastRetryTime: number | null;
}

const DEFAULT_OPTIONS: ReconnectOptions = {
  initialDelay: 1000,    // 1秒
  maxDelay: 30000,       // 30秒
  maxRetries: 10,        // 最多重试10次
  multiplier: 1.5,       // 每次延迟增加1.5倍
  jitter: true,          // 启用抖动
  jitterFactor: 0.3,     // 30%的抖动
};

/**
 * 重连策略类
 */
export class ReconnectStrategy {
  private options: ReconnectOptions;
  private retryCount = 0;
  private currentDelay: number;
  private lastRetryTime: number | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isOnline: boolean;
  private onlineListener: (() => void) | null = null;
  private offlineListener: (() => void) | null = null;
  private pendingOnlineCallback: (() => void) | null = null;

  constructor(options: Partial<ReconnectOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.currentDelay = this.options.initialDelay;
    // SSR 安全检查
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.setupNetworkListeners();
  }

  /**
   * 设置网络状态监听
   */
  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      this.onlineListener = () => {
        this.isOnline = true;
        console.log('[ReconnectStrategy] Network online');
      };

      this.offlineListener = () => {
        this.isOnline = false;
        console.log('[ReconnectStrategy] Network offline');
      };

      window.addEventListener('online', this.onlineListener);
      window.addEventListener('offline', this.offlineListener);
    }
  }

  /**
   * 获取下一次重连延迟
   */
  getNextDelay(): number {
    let delay = this.currentDelay;

    // 添加抖动
    if (this.options.jitter) {
      const jitterRange = delay * this.options.jitterFactor;
      const jitter = Math.random() * jitterRange * 2 - jitterRange;
      delay = Math.round(delay + jitter);
    }

    return Math.max(this.options.initialDelay, Math.min(delay, this.options.maxDelay));
  }

  /**
   * 安排下一次重连
   * @param callback 重连回调函数
   * @returns 是否成功安排重连
   */
  scheduleReconnect(callback: () => void): boolean {
    // 检查是否可以重试
    if (!this.canRetry()) {
      console.log('[ReconnectStrategy] Max retries reached, cannot schedule reconnect');
      return false;
    }

    // 取消之前的定时器
    this.cancelReconnect();

    const delay = this.getNextDelay();
    console.log(`[ReconnectStrategy] Scheduling reconnect in ${delay}ms (attempt ${this.retryCount + 1})`);

    this.reconnectTimer = setTimeout(() => {
      // 检查网络状态
      if (!this.isOnline) {
        console.log('[ReconnectStrategy] Network offline, waiting...');
        // 清除之前的等待回调
        this.clearPendingOnlineCallback();

        // 等待网络恢复后再重连
        this.pendingOnlineCallback = () => {
          this.clearPendingOnlineCallback();
          callback();
        };
        window.addEventListener('online', this.pendingOnlineCallback);
        return;
      }

      this.retryCount++;
      this.lastRetryTime = Date.now();

      // 增加延迟
      this.currentDelay = Math.min(
        this.currentDelay * this.options.multiplier,
        this.options.maxDelay
      );

      callback();
    }, delay);

    return true;
  }

  /**
   * 取消安排的重连
   */
  cancelReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.clearPendingOnlineCallback();
  }

  /**
   * 清除等待网络恢复的回调
   */
  private clearPendingOnlineCallback(): void {
    if (this.pendingOnlineCallback && typeof window !== 'undefined') {
      window.removeEventListener('online', this.pendingOnlineCallback);
      this.pendingOnlineCallback = null;
    }
  }

  /**
   * 检查是否可以继续重试
   */
  canRetry(): boolean {
    if (this.options.maxRetries === 0) {
      return true; // 无限重试
    }
    return this.retryCount < this.options.maxRetries;
  }

  /**
   * 连接成功后重置策略
   */
  reset(): void {
    this.retryCount = 0;
    this.currentDelay = this.options.initialDelay;
    this.lastRetryTime = null;
    this.cancelReconnect();
  }

  /**
   * 获取当前重连状态
   */
  getState(): ReconnectState {
    return {
      retryCount: this.retryCount,
      nextDelay: this.getNextDelay(),
      canRetry: this.canRetry(),
      lastRetryTime: this.lastRetryTime,
    };
  }

  /**
   * 获取重试次数
   */
  getRetryCount(): number {
    return this.retryCount;
  }

  /**
   * 获取最大重试次数
   */
  getMaxRetries(): number {
    return this.options.maxRetries;
  }

  /**
   * 检查网络是否在线
   */
  isNetworkOnline(): boolean {
    return this.isOnline;
  }

  /**
   * 更新配置
   */
  updateOptions(options: Partial<ReconnectOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * 销毁策略，清理资源
   */
  destroy(): void {
    this.cancelReconnect();

    if (typeof window !== 'undefined') {
      if (this.onlineListener) {
        window.removeEventListener('online', this.onlineListener);
      }
      if (this.offlineListener) {
        window.removeEventListener('offline', this.offlineListener);
      }
    }
  }
}
