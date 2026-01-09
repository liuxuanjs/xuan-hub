/**
 * 连接状态机
 * 管理 WebSocket 连接的生命周期状态转换
 */

export type ConnectionState =
  | 'DISCONNECTED'  // 未连接
  | 'CONNECTING'    // 连接中
  | 'CONNECTED'     // 已连接
  | 'RECONNECTING'  // 重连中
  | 'DISCONNECTING' // 断开中
  | 'FAILED';       // 连接失败

export type ConnectionEvent =
  | 'CONNECT'       // 发起连接
  | 'CONNECTED'     // 连接成功
  | 'DISCONNECT'    // 主动断开
  | 'DISCONNECTED'  // 被动断开
  | 'ERROR'         // 连接错误
  | 'RECONNECT'     // 发起重连
  | 'RETRY_EXHAUSTED'; // 重试次数耗尽

export interface StateTransition {
  from: ConnectionState;
  event: ConnectionEvent;
  to: ConnectionState;
}

// 状态转换规则
const STATE_TRANSITIONS: StateTransition[] = [
  // 从断开状态
  { from: 'DISCONNECTED', event: 'CONNECT', to: 'CONNECTING' },

  // 从连接中状态
  { from: 'CONNECTING', event: 'CONNECTED', to: 'CONNECTED' },
  { from: 'CONNECTING', event: 'ERROR', to: 'RECONNECTING' },
  { from: 'CONNECTING', event: 'DISCONNECT', to: 'DISCONNECTED' },

  // 从已连接状态
  { from: 'CONNECTED', event: 'DISCONNECT', to: 'DISCONNECTING' },
  { from: 'CONNECTED', event: 'DISCONNECTED', to: 'RECONNECTING' },
  { from: 'CONNECTED', event: 'ERROR', to: 'RECONNECTING' },

  // 从重连中状态
  { from: 'RECONNECTING', event: 'CONNECT', to: 'CONNECTING' },
  { from: 'RECONNECTING', event: 'CONNECTED', to: 'CONNECTED' },
  { from: 'RECONNECTING', event: 'DISCONNECT', to: 'DISCONNECTED' },
  { from: 'RECONNECTING', event: 'RETRY_EXHAUSTED', to: 'FAILED' },

  // 从断开中状态
  { from: 'DISCONNECTING', event: 'DISCONNECTED', to: 'DISCONNECTED' },

  // 从失败状态
  { from: 'FAILED', event: 'CONNECT', to: 'CONNECTING' },
  { from: 'FAILED', event: 'DISCONNECT', to: 'DISCONNECTED' },
];

export type StateChangeCallback = (
  newState: ConnectionState,
  oldState: ConnectionState,
  event: ConnectionEvent
) => void;

/**
 * 连接状态机类
 */
export class ConnectionStateMachine {
  private currentState: ConnectionState = 'DISCONNECTED';
  private listeners: Set<StateChangeCallback> = new Set();
  private stateHistory: Array<{ state: ConnectionState; timestamp: number; event?: ConnectionEvent }> = [];
  private maxHistoryLength = 50;

  constructor(initialState: ConnectionState = 'DISCONNECTED') {
    this.currentState = initialState;
    this.recordState(initialState);
  }

  /**
   * 获取当前状态
   */
  getState(): ConnectionState {
    return this.currentState;
  }

  /**
   * 尝试触发事件进行状态转换
   * @returns 是否转换成功
   */
  transition(event: ConnectionEvent): boolean {
    const transition = STATE_TRANSITIONS.find(
      t => t.from === this.currentState && t.event === event
    );

    if (!transition) {
      console.warn(
        `[StateMachine] Invalid transition: ${this.currentState} + ${event}`
      );
      return false;
    }

    const oldState = this.currentState;
    this.currentState = transition.to;
    this.recordState(transition.to, event);

    // 通知监听器
    this.listeners.forEach(listener => {
      try {
        listener(this.currentState, oldState, event);
      } catch (error) {
        console.error('[StateMachine] Listener error:', error);
      }
    });

    return true;
  }

  /**
   * 检查是否可以进行某个状态转换
   */
  canTransition(event: ConnectionEvent): boolean {
    return STATE_TRANSITIONS.some(
      t => t.from === this.currentState && t.event === event
    );
  }

  /**
   * 添加状态变更监听器
   */
  onStateChange(callback: StateChangeCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * 移除状态变更监听器
   */
  removeListener(callback: StateChangeCallback): void {
    this.listeners.delete(callback);
  }

  /**
   * 获取状态历史
   */
  getHistory(): Array<{ state: ConnectionState; timestamp: number; event?: ConnectionEvent }> {
    return [...this.stateHistory];
  }

  /**
   * 重置状态机
   */
  reset(): void {
    const oldState = this.currentState;
    this.currentState = 'DISCONNECTED';
    this.stateHistory = [];
    this.recordState('DISCONNECTED');

    if (oldState !== 'DISCONNECTED') {
      this.listeners.forEach(listener => {
        try {
          listener('DISCONNECTED', oldState, 'DISCONNECT');
        } catch (error) {
          console.error('[StateMachine] Listener error:', error);
        }
      });
    }
  }

  /**
   * 销毁状态机
   */
  destroy(): void {
    this.listeners.clear();
    this.stateHistory = [];
  }

  /**
   * 是否处于可用状态
   */
  isConnected(): boolean {
    return this.currentState === 'CONNECTED';
  }

  /**
   * 是否处于尝试连接状态
   */
  isConnecting(): boolean {
    return this.currentState === 'CONNECTING' || this.currentState === 'RECONNECTING';
  }

  /**
   * 是否处于断开状态
   */
  isDisconnected(): boolean {
    return this.currentState === 'DISCONNECTED' || this.currentState === 'FAILED';
  }

  /**
   * 记录状态
   */
  private recordState(state: ConnectionState, event?: ConnectionEvent): void {
    this.stateHistory.push({
      state,
      timestamp: Date.now(),
      event,
    });

    // 限制历史记录长度
    if (this.stateHistory.length > this.maxHistoryLength) {
      this.stateHistory = this.stateHistory.slice(-this.maxHistoryLength);
    }
  }
}
