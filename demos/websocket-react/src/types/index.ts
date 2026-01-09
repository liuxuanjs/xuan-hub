/**
 * 全局类型定义
 */

// WebSocket 连接状态
export type WebSocketReadyState = 'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED';

// 消息类型
export type MessageType = 'message' | 'system' | 'join' | 'leave' | 'ping' | 'pong' | 'typing' | 'notification' | 'userList' | 'error' | 'other';

// 消息接口
export interface Message {
  id: string;
  type: MessageType;
  username: string;
  content: string;
  timestamp: number;
}

// 聊天消息
export interface ChatMessage extends Message {
  type: 'message';
}

// 系统消息
export interface SystemMessage extends Message {
  type: 'system';
  username: '';
}

// 用户加入/离开消息
export interface UserActionMessage extends Message {
  type: 'join' | 'leave';
}

// 通知消息
export interface NotificationMessage extends Message {
  type: 'notification';
  level: NotificationLevel;
}

// 心跳消息
export interface PingMessage {
  type: 'ping';
  timestamp: number;
}

export interface PongMessage {
  type: 'pong';
  timestamp: number;
}

// 输入状态消息
export interface TypingMessage {
  type: 'typing';
  username: string;
  isTyping: boolean;
  timestamp: number;
}

// 用户列表消息
export interface UserListMessage {
  type: 'userList';
  users: User[];
  count: number;
}

// 错误消息
export interface ErrorMessage {
  type: 'error';
  content: string;
  timestamp: number;
}

// WebSocket 消息联合类型
export type WebSocketMessage = 
  | ChatMessage 
  | SystemMessage 
  | UserActionMessage 
  | NotificationMessage
  | PingMessage
  | PongMessage
  | TypingMessage
  | UserListMessage
  | ErrorMessage;

// 用户接口
export interface User {
  username: string;
  joinTime: number;
  isOnline: boolean;
  lastSeen?: number;
}

// 连接信息
export interface ConnectionInfo {
  url: string;
  isConnected: boolean;
  isConnecting: boolean;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  latency: number;
  messageQueueLength: number;
  lastConnectedAt?: number;
  lastDisconnectedAt?: number;
}

// WebSocket 配置选项
export interface WebSocketOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  heartbeatTimeout?: number;
  enableHeartbeat?: boolean;
  enableAutoReconnect?: boolean;
  debug?: boolean;
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (error: Event) => void;
}

// 通知级别
export type NotificationLevel = 'success' | 'error' | 'warning' | 'info';

// 通知接口
export interface Notification {
  id: string;
  message: string;
  type: NotificationLevel;
  duration: number;
  timestamp: number;
  autoClose?: boolean;
}

// 登录表单数据
export interface LoginFormData {
  username: string;
  serverUrl: string;
}

// 应用状态
export interface AppState {
  currentUser: string | null;
  serverUrl: string;
  isLoggedIn: boolean;
}

// 聊天室状态
export interface ChatRoomState {
  messages: Message[];
  users: User[];
  connectionInfo: ConnectionInfo;
  notifications: Notification[];
  isTyping: boolean;
  typingUsers: string[];
}

// 组件 Props 类型
export interface LoginFormProps {
  onLogin: (data: LoginFormData) => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export interface ChatRoomProps {
  user: string;
  serverUrl: string;
  onLogout: () => void;
}

export interface ChatHeaderProps {
  user: string;
  connectionStatus: string;
  isConnected: boolean;
  onDisconnect: () => void;
}

export interface ChatSidebarProps {
  users: User[];
  currentUser: string;
  serverUrl: string;
  connectionInfo: ConnectionInfo;
  onClearMessages: () => void;
  onTestConnection: () => void;
}

export interface MessageListProps {
  messages: Message[];
  currentUser: string;
}

export interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export interface NotificationContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

// 事件处理器类型
export type EventHandler<T = void> = (data: T) => void;
export type AsyncEventHandler<T = void> = (data: T) => Promise<void>;

// 主题接口
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
}

// 样式化组件 Props
export interface StyledComponentProps {
  theme?: Theme;
}

// 工具类型
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// 错误类型
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

// 配置类型
export interface AppConfig {
  websocket: {
    defaultUrl: string;
    reconnectInterval: number;
    maxReconnectAttempts: number;
    heartbeatInterval: number;
    heartbeatTimeout: number;
  };
  ui: {
    messageMaxLength: number;
    usernameMaxLength: number;
    notificationDuration: number;
  };
  development: {
    enableDevTools: boolean;
    enableLogging: boolean;
  };
}

// 环境变量
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  WEBSOCKET_URL?: string;
  DEBUG?: boolean;
}
