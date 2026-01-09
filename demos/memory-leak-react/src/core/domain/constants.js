/**
 * 泄漏状态常量
 */
export const LEAK_STATUS = {
  NORMAL: 'normal',
  ACTIVE: 'active'
};

/**
 * 难度级别
 */
export const DIFFICULTY_LEVELS = {
  BEGINNER: '初级',
  INTERMEDIATE: '中级',
  ADVANCED: '高级',
  TOOL: '工具'
};

/**
 * 难度级别对应的颜色
 */
export const DIFFICULTY_COLORS = {
  [DIFFICULTY_LEVELS.BEGINNER]: '#10b981',
  [DIFFICULTY_LEVELS.INTERMEDIATE]: '#f59e0b',
  [DIFFICULTY_LEVELS.ADVANCED]: '#ef4444',
  [DIFFICULTY_LEVELS.TOOL]: '#6366f1'
};

/**
 * 场景类型
 */
export const SCENARIO_TYPES = {
  GLOBAL: 'global',
  EVENT: 'event',
  TIMER: 'timer',
  CLOSURE: 'closure',
  DOM: 'dom',
  MEMORY_MONITOR: 'memory-monitor'
};

/**
 * 默认监控间隔（毫秒）
 */
export const DEFAULT_MONITOR_INTERVAL = 2000;

/**
 * 最大日志条数
 */
export const MAX_LOG_ENTRIES = 50;

/**
 * 内存阈值告警配置
 */
export const MEMORY_THRESHOLDS = {
  WARNING: 0.6,  // 60%
  DANGER: 0.8    // 80%
};
