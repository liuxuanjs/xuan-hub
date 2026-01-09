/**
 * SVG 图标组件库 - Lucide 风格线性图标
 */

import React, { memo } from 'react';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

const defaultProps: IconProps = {
  size: 20,
  color: 'currentColor',
  strokeWidth: 2,
};

// 基础 SVG 包装器
const IconWrapper: React.FC<IconProps & { children: React.ReactNode }> = ({
  size = defaultProps.size,
  color = defaultProps.color,
  className,
  children,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {children}
  </svg>
);

// 消息图标
export const MessageSquare = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </IconWrapper>
));
MessageSquare.displayName = 'MessageSquare';

// 发送图标
export const Send = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </IconWrapper>
));
Send.displayName = 'Send';

// 用户图标
export const User = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </IconWrapper>
));
User.displayName = 'User';

// 多用户图标
export const Users = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </IconWrapper>
));
Users.displayName = 'Users';

// 设置图标
export const Settings = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </IconWrapper>
));
Settings.displayName = 'Settings';

// WiFi 图标
export const Wifi = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </IconWrapper>
));
Wifi.displayName = 'Wifi';

// WiFi 断开图标
export const WifiOff = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </IconWrapper>
));
WifiOff.displayName = 'WifiOff';

// 登出图标
export const LogOut = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </IconWrapper>
));
LogOut.displayName = 'LogOut';

// 登入图标
export const LogIn = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </IconWrapper>
));
LogIn.displayName = 'LogIn';

// 清空/垃圾桶图标
export const Trash2 = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </IconWrapper>
));
Trash2.displayName = 'Trash2';

// 搜索图标
export const Search = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </IconWrapper>
));
Search.displayName = 'Search';

// 活动/脉冲图标
export const Activity = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </IconWrapper>
));
Activity.displayName = 'Activity';

// 服务器图标
export const Server = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
    <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
    <line x1="6" y1="6" x2="6.01" y2="6" />
    <line x1="6" y1="18" x2="6.01" y2="18" />
  </IconWrapper>
));
Server.displayName = 'Server';

// 时钟图标
export const Clock = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </IconWrapper>
));
Clock.displayName = 'Clock';

// 勾选图标
export const Check = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <polyline points="20 6 9 17 4 12" />
  </IconWrapper>
));
Check.displayName = 'Check';

// 双勾选图标
export const CheckCheck = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <path d="M18 6 7 17l-5-5" />
    <path d="m22 10-7.5 7.5L13 16" />
  </IconWrapper>
));
CheckCheck.displayName = 'CheckCheck';

// 警告图标
export const AlertCircle = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </IconWrapper>
));
AlertCircle.displayName = 'AlertCircle';

// 信息图标
export const Info = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </IconWrapper>
));
Info.displayName = 'Info';

// X 关闭图标
export const X = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconWrapper>
));
X.displayName = 'X';

// 加载中图标
export const Loader = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <line x1="12" y1="2" x2="12" y2="6" />
    <line x1="12" y1="18" x2="12" y2="22" />
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
    <line x1="2" y1="12" x2="6" y2="12" />
    <line x1="18" y1="12" x2="22" y2="12" />
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </IconWrapper>
));
Loader.displayName = 'Loader';

// 刷新图标
export const RefreshCw = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </IconWrapper>
));
RefreshCw.displayName = 'RefreshCw';

// 闪电图标
export const Zap = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </IconWrapper>
));
Zap.displayName = 'Zap';

// 图表图标
export const BarChart2 = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </IconWrapper>
));
BarChart2.displayName = 'BarChart2';

// 圆形图标
export const Circle = memo<IconProps & { fill?: string }>((props) => {
  const { fill, ...rest } = props;
  return (
    <IconWrapper {...rest}>
      <circle cx="12" cy="12" r="10" fill={fill || 'none'} />
    </IconWrapper>
  );
});
Circle.displayName = 'Circle';

// 更多图标
export const MoreHorizontal = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="1" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
  </IconWrapper>
));
MoreHorizontal.displayName = 'MoreHorizontal';

// 箭头向上图标
export const ChevronUp = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <polyline points="18 15 12 9 6 15" />
  </IconWrapper>
));
ChevronUp.displayName = 'ChevronUp';

// 箭头向下图标
export const ChevronDown = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <polyline points="6 9 12 15 18 9" />
  </IconWrapper>
));
ChevronDown.displayName = 'ChevronDown';

// 哈希/频道图标
export const Hash = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="4" y1="15" x2="20" y2="15" />
    <line x1="10" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="14" y2="21" />
  </IconWrapper>
));
Hash.displayName = 'Hash';

// 图钉图标
export const Pin = memo<IconProps>((props) => (
  <IconWrapper {...props}>
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
  </IconWrapper>
));
Pin.displayName = 'Pin';

// 导出所有图标
export const Icons = {
  MessageSquare,
  Send,
  User,
  Users,
  Settings,
  Wifi,
  WifiOff,
  LogOut,
  LogIn,
  Trash2,
  Search,
  Activity,
  Server,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  Info,
  X,
  Loader,
  RefreshCw,
  Zap,
  BarChart2,
  Circle,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Hash,
  Pin,
};

export default Icons;
