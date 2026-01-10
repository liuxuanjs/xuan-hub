/**
 * 消息重试队列
 * 管理发送失败的消息，支持自动重试
 */

export interface QueuedMessage<T = any> {
  /** 消息唯一ID */
  id: string;
  /** 消息数据 */
  data: T;
  /** 添加时间 */
  timestamp: number;
  /** 重试次数 */
  retryCount: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 状态 */
  status: 'pending' | 'sending' | 'sent' | 'failed';
  /** 错误信息 */
  error?: string;
}

export interface MessageRetryOptions {
  /** 最大重试次数 */
  maxRetries: number;
  /** 重试延迟（毫秒） */
  retryDelay: number;
  /** 队列最大长度 */
  maxQueueSize: number;
  /** 消息过期时间（毫秒），0 表示不过期 */
  messageExpiry: number;
}

export type SendFunction<T = any> = (message: T) => boolean;
export type MessageStatusCallback<T = any> = (message: QueuedMessage<T>) => void;

const DEFAULT_OPTIONS: MessageRetryOptions = {
  maxRetries: 3,
  retryDelay: 2000,
  maxQueueSize: 100,
  messageExpiry: 5 * 60 * 1000, // 5分钟
};

/**
 * 消息重试队列类
 */
export class MessageRetryQueue<T = any> {
  private queue: Map<string, QueuedMessage<T>> = new Map();
  private options: MessageRetryOptions;
  private retryTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private sendFunction: SendFunction<T> | null = null;
  private statusCallbacks: Set<MessageStatusCallback<T>> = new Set();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  // 状态计数器，避免频繁遍历
  private pendingCount = 0;
  private failedCount = 0;

  constructor(options: Partial<MessageRetryOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.startCleanupTimer();
  }

  /**
   * 设置发送函数
   */
  setSendFunction(fn: SendFunction<T>): void {
    this.sendFunction = fn;
  }

  /**
   * 添加状态变更回调
   */
  onStatusChange(callback: MessageStatusCallback<T>): () => void {
    this.statusCallbacks.add(callback);
    return () => this.statusCallbacks.delete(callback);
  }

  /**
   * 添加消息到队列
   */
  enqueue(id: string, data: T): QueuedMessage<T> {
    // 检查队列大小
    if (this.queue.size >= this.options.maxQueueSize) {
      // 移除最旧的消息并通知
      const oldestKey = this.queue.keys().next().value;
      if (oldestKey) {
        const oldestMessage = this.queue.get(oldestKey);
        if (oldestMessage) {
          oldestMessage.status = 'failed';
          oldestMessage.error = '队列已满，消息被丢弃';
          this.notifyStatusChange(oldestMessage);
        }
        this.remove(oldestKey);
        console.warn(`[MessageRetryQueue] Queue full, dropped message: ${oldestKey}`);
      }
    }

    const message: QueuedMessage<T> = {
      id,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.options.maxRetries,
      status: 'pending',
    };

    this.queue.set(id, message);
    this.pendingCount++;
    this.notifyStatusChange(message);

    return message;
  }

  /**
   * 尝试发送消息
   */
  async trySend(id: string): Promise<boolean> {
    const message = this.queue.get(id);
    if (!message || !this.sendFunction) {
      return false;
    }

    if (message.status === 'sending') {
      return false; // 正在发送中
    }

    // 更新计数器
    if (message.status === 'pending') {
      this.pendingCount--;
    }

    message.status = 'sending';
    this.notifyStatusChange(message);

    try {
      const success = this.sendFunction(message.data);

      if (success) {
        message.status = 'sent';
        this.notifyStatusChange(message);
        this.remove(id);
        return true;
      } else {
        return this.handleSendFailure(message);
      }
    } catch (error) {
      message.error = error instanceof Error ? error.message : '发送失败';
      return this.handleSendFailure(message);
    }
  }

  /**
   * 处理发送失败
   */
  private handleSendFailure(message: QueuedMessage<T>): boolean {
    message.retryCount++;

    if (message.retryCount >= message.maxRetries) {
      message.status = 'failed';
      this.failedCount++;
      this.notifyStatusChange(message);
      console.log(`[MessageRetryQueue] Message ${message.id} failed after ${message.retryCount} retries`);
      return false;
    }

    message.status = 'pending';
    this.pendingCount++;
    this.notifyStatusChange(message);
    this.scheduleRetry(message.id);
    return false;
  }

  /**
   * 安排消息重试
   */
  private scheduleRetry(id: string): void {
    // 取消之前的重试定时器
    const existingTimer = this.retryTimers.get(id);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const timer = setTimeout(() => {
      this.retryTimers.delete(id);
      this.trySend(id);
    }, this.options.retryDelay);

    this.retryTimers.set(id, timer);
  }

  /**
   * 发送所有待发送的消息
   */
  async flushAll(): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    const pending = Array.from(this.queue.values()).filter(
      m => m.status === 'pending'
    );

    for (const message of pending) {
      const result = await this.trySend(message.id);
      if (result) {
        success++;
      } else if (message.status === 'failed') {
        failed++;
      }
    }

    return { success, failed };
  }

  /**
   * 移除消息
   */
  remove(id: string): boolean {
    const timer = this.retryTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.retryTimers.delete(id);
    }

    // 更新计数器
    const message = this.queue.get(id);
    if (message) {
      if (message.status === 'pending' || message.status === 'sending') {
        this.pendingCount = Math.max(0, this.pendingCount - 1);
      } else if (message.status === 'failed') {
        this.failedCount = Math.max(0, this.failedCount - 1);
      }
    }

    return this.queue.delete(id);
  }

  /**
   * 获取消息
   */
  get(id: string): QueuedMessage<T> | undefined {
    return this.queue.get(id);
  }

  /**
   * 获取所有消息
   */
  getAll(): QueuedMessage<T>[] {
    return Array.from(this.queue.values());
  }

  /**
   * 获取待发送消息数量（使用计数器，O(1) 复杂度）
   */
  getPendingCount(): number {
    return this.pendingCount;
  }

  /**
   * 获取失败消息数量（使用计数器，O(1) 复杂度）
   */
  getFailedCount(): number {
    return this.failedCount;
  }

  /**
   * 获取队列大小
   */
  size(): number {
    return this.queue.size;
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.retryTimers.forEach(timer => clearTimeout(timer));
    this.retryTimers.clear();
    this.queue.clear();
    this.pendingCount = 0;
    this.failedCount = 0;
  }

  /**
   * 标记所有消息为待发送
   */
  markAllPending(): void {
    // 重置计数器
    this.pendingCount = 0;
    this.failedCount = 0;

    this.queue.forEach(message => {
      if (message.status !== 'sent') {
        message.status = 'pending';
        message.retryCount = 0;
        this.pendingCount++;
        this.notifyStatusChange(message);
      }
    });
  }

  /**
   * 通知状态变更
   */
  private notifyStatusChange(message: QueuedMessage<T>): void {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('[MessageRetryQueue] Status callback error:', error);
      }
    });
  }

  /**
   * 启动清理定时器
   */
  private startCleanupTimer(): void {
    if (this.options.messageExpiry > 0) {
      this.cleanupTimer = setInterval(() => {
        this.cleanupExpiredMessages();
      }, 60000); // 每分钟检查一次
    }
  }

  /**
   * 清理过期消息
   */
  private cleanupExpiredMessages(): void {
    if (this.options.messageExpiry === 0) return;

    const now = Date.now();
    const expired: string[] = [];

    this.queue.forEach((message, id) => {
      if (now - message.timestamp > this.options.messageExpiry) {
        expired.push(id);
      }
    });

    expired.forEach(id => {
      const message = this.queue.get(id);
      if (message) {
        // 更新计数器
        if (message.status === 'pending' || message.status === 'sending') {
          this.pendingCount = Math.max(0, this.pendingCount - 1);
        }
        this.failedCount++;

        message.status = 'failed';
        message.error = '消息已过期';
        this.notifyStatusChange(message);

        // 直接删除，避免 remove 再次更新计数器
        const timer = this.retryTimers.get(id);
        if (timer) {
          clearTimeout(timer);
          this.retryTimers.delete(id);
        }
        this.queue.delete(id);
        this.failedCount--; // 删除后减少失败计数
      }
    });

    if (expired.length > 0) {
      console.log(`[MessageRetryQueue] Cleaned up ${expired.length} expired messages`);
    }
  }

  /**
   * 销毁队列
   */
  destroy(): void {
    this.clear();
    this.statusCallbacks.clear();

    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}
