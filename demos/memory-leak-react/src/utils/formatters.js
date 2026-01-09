/**
 * 内存大小格式化
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数
 * @returns {string} 格式化后的字符串
 */
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * 内存大小格式化为 MB
 * @param {number} bytes - 字节数
 * @param {number} decimals - 小数位数
 * @returns {string} MB 格式
 */
export const formatMB = (bytes, decimals = 2) => {
  return (bytes / 1024 / 1024).toFixed(decimals);
};

/**
 * 百分比格式化
 * @param {number} value - 0-1 之间的值
 * @param {number} decimals - 小数位数
 * @returns {string} 百分比字符串
 */
export const formatPercentage = (value, decimals = 1) => {
  return (value * 100).toFixed(decimals) + '%';
};

/**
 * 时间戳格式化
 * @param {Date|number} date - 日期对象或时间戳
 * @returns {string} 时间字符串
 */
export const formatTime = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * 时长格式化
 * @param {number} ms - 毫秒数
 * @returns {string} 格式化后的时长
 */
export const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}min`;
};

/**
 * 数字格式化（添加千分位）
 * @param {number} num - 数字
 * @returns {string} 格式化后的数字
 */
export const formatNumber = (num) => {
  return num.toLocaleString('zh-CN');
};
