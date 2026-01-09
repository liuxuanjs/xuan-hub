/**
 * 全局错误处理器
 * 统一错误处理和用户友好提示
 */

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface AppError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  details?: any;
  timestamp: number;
  recoverable: boolean;
  action?: string;
}

export type ErrorCallback = (error: AppError) => void;

// 错误码映射
const ERROR_MESSAGES: Record<string, { message: string; severity: ErrorSeverity; recoverable: boolean }> = {
  // 网络错误
  NETWORK_OFFLINE: { message: '网络已断开', severity: 'warning', recoverable: true },
  NETWORK_TIMEOUT: { message: '网络请求超时', severity: 'warning', recoverable: true },

  // WebSocket 错误
  WS_CONNECTION_FAILED: { message: '无法连接到服务器', severity: 'error', recoverable: true },
  WS_CONNECTION_LOST: { message: '与服务器的连接已断开', severity: 'warning', recoverable: true },
  WS_HEARTBEAT_TIMEOUT: { message: '心跳检测超时', severity: 'warning', recoverable: true },
  WS_RECONNECT_FAILED: { message: '重连失败，请检查网络后重试', severity: 'error', recoverable: true },
  WS_SEND_FAILED: { message: '消息发送失败', severity: 'warning', recoverable: true },

  // 数据错误
  DATA_PARSE_ERROR: { message: '数据解析失败', severity: 'warning', recoverable: true },
  DATA_VALIDATION_ERROR: { message: '数据验证失败', severity: 'warning', recoverable: true },

  // 存储错误
  STORAGE_NOT_SUPPORTED: { message: '浏览器不支持本地存储', severity: 'warning', recoverable: false },
  STORAGE_QUOTA_EXCEEDED: { message: '存储空间已满', severity: 'warning', recoverable: true },
  STORAGE_READ_ERROR: { message: '读取本地数据失败', severity: 'warning', recoverable: true },
  STORAGE_WRITE_ERROR: { message: '保存本地数据失败', severity: 'warning', recoverable: true },

  // 用户操作错误
  USER_INPUT_INVALID: { message: '输入内容无效', severity: 'warning', recoverable: true },
  USER_NOT_AUTHENTICATED: { message: '请先登录', severity: 'info', recoverable: true },

  // 未知错误
  UNKNOWN_ERROR: { message: '发生未知错误', severity: 'error', recoverable: true },
};

/**
 * 全局错误处理器类
 */
export class ErrorHandler {
  private listeners: Set<ErrorCallback> = new Set();
  private errorHistory: AppError[] = [];
  private maxHistoryLength = 50;

  /**
   * 创建错误对象
   */
  createError(code: string, details?: any, customMessage?: string): AppError {
    const errorConfig = ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;

    return {
      code,
      message: customMessage || errorConfig.message,
      severity: errorConfig.severity,
      details,
      timestamp: Date.now(),
      recoverable: errorConfig.recoverable,
    };
  }

  /**
   * 处理错误
   */
  handle(code: string, details?: any, customMessage?: string): AppError {
    const error = this.createError(code, details, customMessage);
    this.recordError(error);
    this.notifyListeners(error);
    this.logError(error);
    return error;
  }

  /**
   * 从 Error 对象处理错误
   */
  handleError(error: Error, code = 'UNKNOWN_ERROR'): AppError {
    return this.handle(code, { originalError: error.message, stack: error.stack });
  }

  /**
   * 从 WebSocket 事件处理错误
   */
  handleWebSocketError(event: Event | CloseEvent, code?: string): AppError {
    let errorCode = code || 'WS_CONNECTION_FAILED';

    if ('code' in event) {
      const closeEvent = event as CloseEvent;
      switch (closeEvent.code) {
        case 1006:
          errorCode = 'WS_CONNECTION_LOST';
          break;
        case 4000:
          errorCode = 'WS_HEARTBEAT_TIMEOUT';
          break;
        case 4001:
          errorCode = 'WS_CONNECTION_FAILED';
          break;
        default:
          errorCode = 'WS_CONNECTION_LOST';
      }
    }

    return this.handle(errorCode, { event });
  }

  /**
   * 添加错误监听器
   */
  onError(callback: ErrorCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * 移除错误监听器
   */
  removeListener(callback: ErrorCallback): void {
    this.listeners.delete(callback);
  }

  /**
   * 获取错误历史
   */
  getErrorHistory(): AppError[] {
    return [...this.errorHistory];
  }

  /**
   * 清空错误历史
   */
  clearHistory(): void {
    this.errorHistory = [];
  }

  /**
   * 获取指定错误码的错误信息
   */
  getErrorMessage(code: string): string {
    return ERROR_MESSAGES[code]?.message || ERROR_MESSAGES.UNKNOWN_ERROR.message;
  }

  /**
   * 记录错误
   */
  private recordError(error: AppError): void {
    this.errorHistory.push(error);

    // 限制历史记录长度
    if (this.errorHistory.length > this.maxHistoryLength) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistoryLength);
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(error: AppError): void {
    this.listeners.forEach((callback) => {
      try {
        callback(error);
      } catch (e) {
        console.error('[ErrorHandler] Listener error:', e);
      }
    });
  }

  /**
   * 记录错误日志
   */
  private logError(error: AppError): void {
    const logMethod =
      error.severity === 'critical' || error.severity === 'error'
        ? console.error
        : error.severity === 'warning'
        ? console.warn
        : console.log;

    logMethod(`[ErrorHandler] ${error.code}: ${error.message}`, error.details);
  }

  /**
   * 销毁处理器
   */
  destroy(): void {
    this.listeners.clear();
    this.errorHistory = [];
  }
}

// 导出单例
export const errorHandler = new ErrorHandler();
