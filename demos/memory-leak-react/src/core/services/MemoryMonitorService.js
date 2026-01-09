/**
 * 内存监控服务
 * 封装 Performance Memory API，提供内存监控能力
 */
export class MemoryMonitorService {
  constructor() {
    this.isSupported = typeof performance !== 'undefined' && 'memory' in performance;
    this.intervalId = null;
    this.observers = [];
  }

  /**
   * 获取当前内存信息
   * @returns {object|null} 内存信息对象
   */
  getMemoryInfo() {
    if (!this.isSupported) return null;

    const memory = performance.memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      limit: memory.jsHeapSizeLimit,
      usedMB: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
      totalMB: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2),
      limitMB: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2),
      usage: memory.usedJSHeapSize / memory.jsHeapSizeLimit
    };
  }

  /**
   * 开始监控
   * @param {function} callback - 回调函数
   * @param {number} interval - 监控间隔（毫秒）
   * @returns {number} 监控ID
   */
  startMonitoring(callback, interval = 2000) {
    if (!this.isSupported) {
      console.warn('Memory API not supported');
      return null;
    }

    // 立即执行一次
    callback(this.getMemoryInfo());

    this.intervalId = setInterval(() => {
      const info = this.getMemoryInfo();
      callback(info);
    }, interval);

    this.observers.push(this.intervalId);
    return this.intervalId;
  }

  /**
   * 停止监控
   * @param {number} id - 监控ID
   */
  stopMonitoring(id) {
    if (id) {
      clearInterval(id);
      this.observers = this.observers.filter(observerId => observerId !== id);
    }
  }

  /**
   * 停止所有监控
   */
  stopAll() {
    this.observers.forEach(id => clearInterval(id));
    this.observers = [];
    this.intervalId = null;
  }

  /**
   * 强制垃圾回收
   * @returns {boolean} 是否成功
   */
  forceGC() {
    if (typeof window !== 'undefined' && window.gc) {
      window.gc();
      return true;
    }
    return false;
  }

  /**
   * 检查是否支持 GC
   * @returns {boolean}
   */
  isGCSupported() {
    return typeof window !== 'undefined' && typeof window.gc === 'function';
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.stopAll();
  }
}

// 单例模式
let instance = null;

export const getMemoryMonitorService = () => {
  if (!instance) {
    instance = new MemoryMonitorService();
  }
  return instance;
};

export default MemoryMonitorService;
