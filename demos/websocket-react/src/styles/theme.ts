/**
 * 主题配置 - 极简现代深色风格
 * 类似 Slack/Discord 设计语言
 */

export const theme = {
  // 主色调
  colors: {
    // 品牌色
    primary: '#5865F2',       // Discord 风格蓝紫色
    primaryHover: '#4752C4',
    primaryLight: 'rgba(88, 101, 242, 0.15)',

    // 成功/在线
    success: '#23A55A',
    successLight: 'rgba(35, 165, 90, 0.15)',

    // 警告
    warning: '#F0B232',
    warningLight: 'rgba(240, 178, 50, 0.15)',

    // 错误/离线
    error: '#ED4245',
    errorLight: 'rgba(237, 66, 69, 0.15)',

    // 信息
    info: '#00A8FC',
    infoLight: 'rgba(0, 168, 252, 0.15)',

    // 背景色 (深色系)
    bgPrimary: '#1E1F22',     // 主背景
    bgSecondary: '#2B2D31',   // 次级背景
    bgTertiary: '#313338',    // 三级背景
    bgModifier: '#383A40',    // 悬浮态
    bgAccent: '#404249',      // 强调背景

    // 文字色
    textPrimary: '#F2F3F5',   // 主要文字
    textSecondary: '#B5BAC1', // 次要文字
    textMuted: '#949BA4',     // 弱化文字
    textLink: '#00A8FC',      // 链接

    // 边框
    border: '#3F4147',
    borderLight: '#4E5058',

    // 特殊
    white: '#FFFFFF',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.85)',
  },

  // 圆角
  radius: {
    xs: '3px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  // 阴影
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.3)',
    lg: '0 8px 16px rgba(0, 0, 0, 0.4)',
    xl: '0 12px 24px rgba(0, 0, 0, 0.5)',
  },

  // 间距
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },

  // 字体
  fonts: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
    mono: "'SF Mono', 'Fira Code', 'Consolas', monospace",
  },

  // 字号
  fontSizes: {
    xs: '11px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
  },

  // 行高
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // 动画
  transitions: {
    fast: '0.1s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
  },

  // 断点
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

export type Theme = typeof theme;
export default theme;
