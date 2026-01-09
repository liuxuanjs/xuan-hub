/**
 * 内存快照服务
 * 提供快照拍摄和对比功能
 */
export class SnapshotService {
  constructor() {
    this.snapshots = new Map();
  }

  /**
   * 检查是否支持内存 API
   * @returns {boolean}
   */
  isSupported() {
    return typeof performance !== 'undefined' && 'memory' in performance;
  }

  /**
   * 拍摄快照
   * @param {string} label - 快照标签
   * @returns {object|null} 快照对象
   */
  takeSnapshot(label = '') {
    if (!this.isSupported()) return null;

    const memory = performance.memory;
    const snapshot = {
      id: `snapshot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      label: label || `快照 ${this.snapshots.size + 1}`,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString('zh-CN'),
      memory: {
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit
      },
      usedMB: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2),
      totalMB: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2)
    };

    this.snapshots.set(snapshot.id, snapshot);
    return snapshot;
  }

  /**
   * 获取所有快照
   * @returns {Array} 快照数组
   */
  getAllSnapshots() {
    return Array.from(this.snapshots.values());
  }

  /**
   * 获取单个快照
   * @param {string} id - 快照ID
   * @returns {object|null}
   */
  getSnapshot(id) {
    return this.snapshots.get(id) || null;
  }

  /**
   * 删除快照
   * @param {string} id - 快照ID
   */
  deleteSnapshot(id) {
    this.snapshots.delete(id);
  }

  /**
   * 对比两个快照
   * @param {string} id1 - 第一个快照ID
   * @param {string} id2 - 第二个快照ID
   * @returns {object|null} 对比结果
   */
  compare(id1, id2) {
    const snapshot1 = this.snapshots.get(id1);
    const snapshot2 = this.snapshots.get(id2);

    if (!snapshot1 || !snapshot2) return null;

    const usedDiff = snapshot2.memory.used - snapshot1.memory.used;
    const totalDiff = snapshot2.memory.total - snapshot1.memory.total;
    const timeDiff = snapshot2.timestamp - snapshot1.timestamp;

    return {
      snapshot1: {
        id: snapshot1.id,
        label: snapshot1.label,
        usedMB: snapshot1.usedMB,
        time: snapshot1.formattedTime
      },
      snapshot2: {
        id: snapshot2.id,
        label: snapshot2.label,
        usedMB: snapshot2.usedMB,
        time: snapshot2.formattedTime
      },
      diff: {
        usedBytes: usedDiff,
        usedMB: (usedDiff / 1024 / 1024).toFixed(2),
        totalBytes: totalDiff,
        totalMB: (totalDiff / 1024 / 1024).toFixed(2),
        timeMs: timeDiff,
        timeFormatted: this._formatDuration(timeDiff),
        percentageChange: snapshot1.memory.used > 0
          ? ((usedDiff / snapshot1.memory.used) * 100).toFixed(2)
          : 0,
        isIncrease: usedDiff > 0,
        growthRate: timeDiff > 0
          ? ((usedDiff / timeDiff) * 1000 / 1024).toFixed(2) // KB/s
          : 0
      }
    };
  }

  /**
   * 清空所有快照
   */
  clearAll() {
    this.snapshots.clear();
  }

  /**
   * 格式化时间间隔
   * @private
   */
  _formatDuration(ms) {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  }
}

// 单例模式
let instance = null;

export const getSnapshotService = () => {
  if (!instance) {
    instance = new SnapshotService();
  }
  return instance;
};

export default SnapshotService;
