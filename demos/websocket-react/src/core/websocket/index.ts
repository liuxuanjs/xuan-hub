/**
 * WebSocket 核心模块导出
 */

export { ConnectionManager } from './ConnectionManager';
export type {
  ConnectionManagerOptions,
  ConnectionInfo,
  MessageHandler,
  EventCallback,
} from './ConnectionManager';

export { ConnectionStateMachine } from './ConnectionStateMachine';
export type {
  ConnectionState,
  ConnectionEvent,
  StateTransition,
  StateChangeCallback,
} from './ConnectionStateMachine';

export { ReconnectStrategy } from './ReconnectStrategy';
export type {
  ReconnectOptions,
  ReconnectState,
} from './ReconnectStrategy';

export { MessageRetryQueue } from './MessageRetryQueue';
export type {
  QueuedMessage,
  MessageRetryOptions,
  SendFunction,
  MessageStatusCallback,
} from './MessageRetryQueue';
