/**
 * 消息批处理器
 * 用于高并发消息场景的性能优化
 */

export interface BatcherOptions {
  /** 批处理间隔（毫秒） */
  interval: number;
  /** 最大批处理大小 */
  maxBatchSize: number;
  /** 是否立即执行第一条消息 */
  immediateFirst: boolean;
}

export type BatchCallback<T> = (items: T[]) => void;

const DEFAULT_OPTIONS: BatcherOptions = {
  interval: 50,       // 50ms
  maxBatchSize: 100,  // 最多100条消息
  immediateFirst: true,
};

/**
 * 消息批处理器类
 */
export class MessageBatcher<T> {
  private options: BatcherOptions;
  private buffer: T[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private callback: BatchCallback<T>;
  private isFirstMessage = true;

  constructor(callback: BatchCallback<T>, options: Partial<BatcherOptions> = {}) {
    this.callback = callback;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * 添加消息到批处理队列
   */
  add(item: T): void {
    this.buffer.push(item);

    // 如果是第一条消息且启用了立即执行
    if (this.isFirstMessage && this.options.immediateFirst) {
      this.isFirstMessage = false;
      this.flush();
      return;
    }

    // 如果达到最大批处理大小，立即执行
    if (this.buffer.length >= this.options.maxBatchSize) {
      this.flush();
      return;
    }

    // 安排延迟执行
    this.scheduleFlush();
  }

  /**
   * 批量添加消息
   */
  addBatch(items: T[]): void {
    this.buffer.push(...items);

    // 如果达到最大批处理大小，立即执行
    if (this.buffer.length >= this.options.maxBatchSize) {
      this.flush();
      return;
    }

    this.scheduleFlush();
  }

  /**
   * 安排延迟执行
   */
  private scheduleFlush(): void {
    if (this.timer) return;

    this.timer = setTimeout(() => {
      this.flush();
    }, this.options.interval);
  }

  /**
   * 立即执行批处理
   */
  flush(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.buffer.length === 0) return;

    const items = this.buffer;
    this.buffer = [];

    try {
      this.callback(items);
    } catch (error) {
      console.error('[MessageBatcher] Callback error:', error);
    }
  }

  /**
   * 获取当前缓冲区大小
   */
  size(): number {
    return this.buffer.length;
  }

  /**
   * 清空缓冲区
   */
  clear(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.buffer = [];
  }

  /**
   * 重置批处理器
   */
  reset(): void {
    this.clear();
    this.isFirstMessage = true;
  }

  /**
   * 更新配置
   */
  updateOptions(options: Partial<BatcherOptions>): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * 销毁批处理器
   */
  destroy(): void {
    this.clear();
  }
}
