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
  messages: EnhancedMessage[];
  currentUser: string;
  onLoadMore?: () => void;
  isLoadingHistory?: boolean;
  hasMoreHistory?: boolean;
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

// ============================================
// 新增类型定义 - 深度重构优化
// ============================================

// 消息状态
export enum MessageStatus {
  PENDING = 'pending',     // 等待发送
  SENDING = 'sending',     // 发送中
  SENT = 'sent',           // 已发送
  DELIVERED = 'delivered', // 已送达
  READ = 'read',           // 已读
  FAILED = 'failed',       // 发送失败
}

// 增强消息接口
export interface EnhancedMessage extends Message {
  /** 消息状态 */
  status?: MessageStatus;
  /** 回复的消息ID */
  replyTo?: string;
  /** 是否已删除 */
  isDeleted?: boolean;
  /** 删除时间 */
  deletedAt?: number;
  /** 是否已同步到服务器 */
  synced?: boolean;
  /** 会话ID */
  conversationId?: string;
  /** 本地消息ID（用于乐观更新） */
  localId?: string;
}

// 连接状态（增强版）
export type ConnectionState =
  | 'DISCONNECTED'   // 未连接
  | 'CONNECTING'     // 连接中
  | 'CONNECTED'      // 已连接
  | 'RECONNECTING'   // 重连中
  | 'DISCONNECTING'  // 断开中
  | 'FAILED';        // 连接失败

// 增强连接信息
export interface EnhancedConnectionInfo extends ConnectionInfo {
  /** 连接状态 */
  state: ConnectionState;
  /** 待发送消息数 */
  pendingMessages: number;
  /** 失败消息数 */
  failedMessages: number;
  /** 网络是否在线 */
  isOnline: boolean;
}

// 存储相关类型
export interface StoredMessage extends EnhancedMessage {
  conversationId: string;
}

export interface MessageSearchResult {
  message: StoredMessage;
  highlights: {
    content?: string;
    username?: string;
  };
}

// 性能监控类型
export interface PerformanceMetrics {
  /** 渲染耗时 */
  renderTime: number;
  /** 消息处理耗时 */
  messageProcessTime: number;
  /** 存储操作耗时 */
  storageTime: number;
  /** 网络延迟 */
  networkLatency: number;
}

// 批处理配置
export interface BatchConfig {
  /** 批处理间隔（毫秒） */
  interval: number;
  /** 最大批处理大小 */
  maxSize: number;
  /** 是否立即处理第一条 */
  immediateFirst: boolean;
}

// 重连配置
export interface ReconnectConfig {
  /** 初始延迟（毫秒） */
  initialDelay: number;
  /** 最大延迟（毫秒） */
  maxDelay: number;
  /** 最大重试次数 */
  maxRetries: number;
  /** 退避乘数 */
  multiplier: number;
  /** 是否启用抖动 */
  jitter: boolean;
}

// 消息持久化配置
export interface StorageConfig {
  /** 是否启用持久化 */
  enabled: boolean;
  /** 最大存储消息数 */
  maxMessages: number;
  /** 消息过期时间（毫秒） */
  messageExpiry: number;
  /** 是否启用自动清理 */
  autoCleanup: boolean;
}

// 类型守卫
export function isChatMessage(msg: WebSocketMessage): msg is ChatMessage {
  return msg.type === 'message';
}

export function isSystemMessage(msg: WebSocketMessage): msg is SystemMessage {
  return msg.type === 'system';
}

export function isUserActionMessage(msg: WebSocketMessage): msg is UserActionMessage {
  return msg.type === 'join' || msg.type === 'leave';
}

export function isPingMessage(msg: any): msg is PingMessage {
  return msg?.type === 'ping' && typeof msg.timestamp === 'number';
}

export function isPongMessage(msg: any): msg is PongMessage {
  return msg?.type === 'pong' && typeof msg.timestamp === 'number';
}

export function isTypingMessage(msg: any): msg is TypingMessage {
  return msg?.type === 'typing' && typeof msg.username === 'string';
}

export function isUserListMessage(msg: any): msg is UserListMessage {
  return msg?.type === 'userList' && Array.isArray(msg.users);
}

export function isErrorMessage(msg: any): msg is ErrorMessage {
  return msg?.type === 'error' && typeof msg.content === 'string';
}
