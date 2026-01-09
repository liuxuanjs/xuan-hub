/**
 * 日志管理工具
 * 提供统一的日志格式和管理
 */

/**
 * 创建带时间戳的日志条目
 * @param {string} message - 日志消息
 * @param {string} type - 日志类型
 * @returns {object} 日志对象
 */
export const createLogEntry = (message, type = 'info') => {
  return {
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    timestamp: new Date(),
    message,
    type, // 'info' | 'warning' | 'error' | 'success'
    formattedTime: new Date().toLocaleTimeString('zh-CN')
  };
};

/**
 * 日志类型前缀图标
 */
export const LOG_ICONS = {
  info: 'ℹ️',
  warning: '⚠️',
  error: '❌',
  success: '✅',
  memory: '📊',
  gc: '🗑️',
  leak: '💧',
  fix: '🔧'
};

/**
 * 格式化日志消息
 * @param {object} log - 日志对象
 * @returns {string} 格式化后的日志字符串
 */
export const formatLog = (log) => {
  const icon = LOG_ICONS[log.type] || '';
  return `[${log.formattedTime}] ${icon} ${log.message}`;
};

/**
 * 日志管理类
 */
export class LogManager {
  constructor(maxLogs = 100) {
    this.logs = [];
    this.maxLogs = maxLogs;
    this.listeners = new Set();
  }

  add(message, type = 'info') {
    const log = createLogEntry(message, type);
    this.logs.push(log);

    // 保持日志数量在限制内
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // 通知监听者
    this.listeners.forEach(listener => listener(this.logs));

    return log;
  }

  clear() {
    this.logs = [];
    this.listeners.forEach(listener => listener(this.logs));
  }

  getLogs() {
    return [...this.logs];
  }

  getRecentLogs(count = 20) {
    return this.logs.slice(-count);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
