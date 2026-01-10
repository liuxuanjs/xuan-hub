import { makeAutoObservable, runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import { indexedDBManager, IDBMessage } from '@/core/storage';
import { MessageBatcher } from '@/utils/MessageBatcher';
import {
  MessageStatus,
  type Message,
  type User,
  type Notification,
  type ChatMessage,
  type SystemMessage,
  type UserActionMessage,
  type UserListMessage,
  type NotificationMessage,
  type WebSocketMessage,
  type NotificationLevel,
  type EnhancedMessage,
} from '@/types';

// 默认会话 ID
const PUBLIC_CONVERSATION_ID = 'public';

// 存储配置
const STORAGE_CONFIG = {
  enabled: true,
  maxMessages: 1000,
  messageExpiry: 7 * 24 * 60 * 60 * 1000, // 7天
  autoCleanup: true,
};

/**
 * 聊天 Store（重构版）
 * 管理聊天消息、用户列表、通知等状态
 * 集成消息持久化和批处理功能
 */
export class ChatStore {
  // 消息列表
  messages: EnhancedMessage[] = [];

  // 用户列表
  users: User[] = [];

  // 通知列表
  notifications: Notification[] = [];

  // 输入状态
  isTyping = false;

  // 正在输入的用户列表
  typingUsers: string[] = [];

  // 当前用户
  currentUser: string | null = null;

  // 消息加载状态
  isLoadingHistory = false;

  // 是否有更多历史消息
  hasMoreHistory = true;

  // 存储是否已初始化
  private storageInitialized = false;

  // 消息批处理器
  private messageBatcher: MessageBatcher<EnhancedMessage>;

  // 存储启用状态
  private storageEnabled = STORAGE_CONFIG.enabled;

  // 定时器追踪 - 用于清理
  private typingTimeouts = new Map<string, NodeJS.Timeout>();
  private notificationTimeouts = new Map<string, NodeJS.Timeout>();

  constructor() {
    // 初始化消息批处理器
    this.messageBatcher = new MessageBatcher<EnhancedMessage>(
      (messages) => this.batchAddMessages(messages),
      {
        interval: 50,
        maxBatchSize: 50,
        immediateFirst: true,
      }
    );

    makeAutoObservable(this, {}, { autoBind: true });

    // 初始化存储
    this.initStorage();
  }

  /**
   * 初始化存储
   */
  private async initStorage(): Promise<void> {
    if (!this.storageEnabled) return;

    try {
      await indexedDBManager.init();
      this.storageInitialized = true;
      this.log('存储初始化成功');

      // 自动清理过期消息
      if (STORAGE_CONFIG.autoCleanup) {
        const deleted = await indexedDBManager.cleanupOldMessages(STORAGE_CONFIG.messageExpiry);
        if (deleted > 0) {
          this.log(`清理了 ${deleted} 条过期消息`);
        }
      }
    } catch (error) {
      this.log('存储初始化失败:', error);
      this.storageEnabled = false;
    }
  }

  /**
   * 加载历史消息
   */
  loadHistory = async (limit = 50): Promise<void> => {
    if (!this.storageInitialized || !this.storageEnabled) return;
    if (this.isLoadingHistory) return;

    runInAction(() => {
      this.isLoadingHistory = true;
    });

    try {
      const offset = this.messages.length;
      const storedMessages = await indexedDBManager.queryMessages({
        conversationId: PUBLIC_CONVERSATION_ID,
        offset,
        limit,
      });

      runInAction(() => {
        if (storedMessages.length < limit) {
          this.hasMoreHistory = false;
        }

        // 将存储的消息添加到开头
        const newMessages = storedMessages.map((msg) => ({
          ...msg,
          synced: true,
        }));

        this.messages = [...newMessages, ...this.messages];
        this.log(`加载了 ${storedMessages.length} 条历史消息`);
      });
    } catch (error) {
      this.log('加载历史消息失败:', error);
    } finally {
      runInAction(() => {
        this.isLoadingHistory = false;
      });
    }
  };

  /**
   * 搜索消息
   */
  searchMessages = async (query: string): Promise<EnhancedMessage[]> => {
    if (!this.storageInitialized || !this.storageEnabled || !query.trim()) {
      // 如果存储不可用，使用内存搜索
      const searchTerm = query.toLowerCase();
      return this.messages.filter(
        (msg) =>
          msg.content.toLowerCase().includes(searchTerm) ||
          msg.username.toLowerCase().includes(searchTerm)
      );
    }

    try {
      const results = await indexedDBManager.searchMessages(query, {
        conversationId: PUBLIC_CONVERSATION_ID,
        limit: 50,
      });
      return results as EnhancedMessage[];
    } catch (error) {
      this.log('搜索消息失败:', error);
      return [];
    }
  };

  /**
   * 设置当前用户
   */
  setCurrentUser = (username: string): void => {
    this.currentUser = username;
    this.log('当前用户设置为:', username);
  };

  /**
   * 处理 WebSocket 消息
   */
  handleWebSocketMessage = (data: any): void => {
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch {
        this.addMessage('unknown', data, 'message');
        return;
      }
    }

    const message = data as WebSocketMessage;

    switch (message.type) {
      case 'message':
        this.handleChatMessage(message as ChatMessage);
        break;

      case 'join':
        this.handleUserJoin(message as UserActionMessage);
        break;

      case 'leave':
        this.handleUserLeave(message as UserActionMessage);
        break;

      case 'userList':
        this.handleUserList(message as UserListMessage);
        break;

      case 'notification':
        this.handleNotificationMessage(message as NotificationMessage);
        break;

      case 'system':
        this.handleSystemMessage(message as SystemMessage);
        break;

      case 'typing':
        this.handleTypingMessage(message);
        break;

      case 'error':
        this.handleErrorMessage(message);
        break;

      default:
        this.log('未知消息类型:', message);
    }
  };

  /**
   * 处理聊天消息
   */
  private handleChatMessage = (message: ChatMessage): void => {
    this.addMessage(message.username, message.content, 'message', message.timestamp);
  };

  /**
   * 处理用户加入
   */
  private handleUserJoin = (message: UserActionMessage): void => {
    const { username } = message;

    this.addUser({
      username,
      joinTime: message.timestamp,
      isOnline: true,
    });

    if (username !== this.currentUser) {
      this.addSystemMessage(`${username} 加入了聊天室`);
    }
  };

  /**
   * 处理用户离开
   */
  private handleUserLeave = (message: UserActionMessage): void => {
    const { username } = message;
    this.removeUser(username);
    this.addSystemMessage(`${username} 离开了聊天室`);
  };

  /**
   * 处理用户列表
   */
  private handleUserList = (message: UserListMessage): void => {
    runInAction(() => {
      this.users = message.users.map((user) => ({
        ...user,
        isOnline: true,
      }));
    });
  };

  /**
   * 处理通知消息
   */
  private handleNotificationMessage = (message: NotificationMessage): void => {
    this.showNotification(message.content, message.level);
  };

  /**
   * 处理系统消息
   */
  private handleSystemMessage = (message: SystemMessage): void => {
    this.addSystemMessage(message.content);
  };

  /**
   * 处理输入状态消息
   */
  private handleTypingMessage = (message: any): void => {
    const { username, isTyping } = message;

    if (username === this.currentUser) return;

    runInAction(() => {
      if (isTyping) {
        if (!this.typingUsers.includes(username)) {
          this.typingUsers.push(username);
        }
      } else {
        this.typingUsers = this.typingUsers.filter((user) => user !== username);
      }
    });

    // 清除之前的定时器
    const existingTimeout = this.typingTimeouts.get(username);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // 3秒后自动移除输入状态
    const timeout = setTimeout(() => {
      runInAction(() => {
        this.typingUsers = this.typingUsers.filter((user) => user !== username);
      });
      this.typingTimeouts.delete(username);
    }, 3000);

    this.typingTimeouts.set(username, timeout);
  };

  /**
   * 处理错误消息
   */
  private handleErrorMessage = (message: any): void => {
    this.showNotification(message.content, 'error');
  };

  /**
   * 添加消息（使用批处理）
   */
  addMessage = (
    username: string,
    content: string,
    type: Message['type'] = 'message',
    timestamp = Date.now(),
    status: MessageStatus = MessageStatus.SENT
  ): string => {
    const message: EnhancedMessage = {
      id: uuidv4(),
      username,
      content,
      type,
      timestamp,
      status,
      conversationId: PUBLIC_CONVERSATION_ID,
      synced: false,
    };

    // 使用批处理器
    this.messageBatcher.add(message);

    return message.id;
  };

  /**
   * 批量添加消息
   */
  private batchAddMessages = async (messages: EnhancedMessage[]): Promise<void> => {
    runInAction(() => {
      this.messages.push(...messages);

      // 保持消息数量在合理范围内
      if (this.messages.length > STORAGE_CONFIG.maxMessages) {
        this.messages = this.messages.slice(-STORAGE_CONFIG.maxMessages);
      }
    });

    // 异步保存到存储
    if (this.storageInitialized && this.storageEnabled) {
      try {
        const idbMessages: IDBMessage[] = messages.map((msg) => ({
          ...msg,
          conversationId: PUBLIC_CONVERSATION_ID,
          synced: true,
        }));

        await indexedDBManager.saveMessages(idbMessages);
      } catch (error) {
        this.log('保存消息到存储失败:', error);
      }
    }

    this.log(`批量添加了 ${messages.length} 条消息`);
  };

  /**
   * 添加系统消息
   */
  addSystemMessage = (content: string): string => {
    return this.addMessage('', content, 'system');
  };

  /**
   * 更新消息状态
   */
  updateMessageStatus = (messageId: string, status: MessageStatus): void => {
    runInAction(() => {
      const message = this.messages.find((m) => m.id === messageId);
      if (message) {
        message.status = status;
      }
    });
  };

  /**
   * 清空消息
   */
  clearMessages = async (): Promise<void> => {
    runInAction(() => {
      this.messages = [];
    });

    // 清空存储
    if (this.storageInitialized && this.storageEnabled) {
      try {
        await indexedDBManager.clearConversation(PUBLIC_CONVERSATION_ID);
      } catch (error) {
        this.log('清空存储消息失败:', error);
      }
    }

    this.addSystemMessage('消息已清空');
    this.log('消息已清空');
  };

  /**
   * 添加用户
   */
  addUser = (user: User): void => {
    runInAction(() => {
      const existingIndex = this.users.findIndex((u) => u.username === user.username);
      if (existingIndex >= 0) {
        this.users[existingIndex] = user;
      } else {
        this.users.push(user);
      }
    });
  };

  /**
   * 移除用户
   */
  removeUser = (username: string): void => {
    runInAction(() => {
      this.users = this.users.filter((user) => user.username !== username);
      this.typingUsers = this.typingUsers.filter((user) => user !== username);
    });
  };

  /**
   * 显示通知
   */
  showNotification = (
    message: string,
    type: NotificationLevel = 'info',
    duration = 3000
  ): void => {
    const notification: Notification = {
      id: uuidv4(),
      message,
      type,
      duration,
      timestamp: Date.now(),
      autoClose: true,
    };

    runInAction(() => {
      this.notifications.push(notification);
    });

    if (notification.autoClose) {
      const timeout = setTimeout(() => {
        this.removeNotification(notification.id);
        this.notificationTimeouts.delete(notification.id);
      }, duration);

      this.notificationTimeouts.set(notification.id, timeout);
    }

    this.log('显示通知:', notification);
  };

  /**
   * 移除通知
   */
  removeNotification = (id: string): void => {
    // 清除定时器
    const timeout = this.notificationTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.notificationTimeouts.delete(id);
    }

    runInAction(() => {
      this.notifications = this.notifications.filter((n) => n.id !== id);
    });
  };

  /**
   * 清空通知
   */
  clearNotifications = (): void => {
    // 清除所有通知定时器
    this.notificationTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.notificationTimeouts.clear();

    runInAction(() => {
      this.notifications = [];
    });
  };

  /**
   * 设置输入状态
   */
  setTyping = (isTyping: boolean): void => {
    this.isTyping = isTyping;
  };

  /**
   * 获取在线用户数量
   */
  get onlineUserCount(): number {
    return this.users.filter((user) => user.isOnline).length;
  }

  /**
   * 获取总消息数量
   */
  get messageCount(): number {
    return this.messages.length;
  }

  /**
   * 获取系统消息数量
   */
  get systemMessageCount(): number {
    return this.messages.filter((msg) => msg.type === 'system').length;
  }

  /**
   * 获取用户消息数量
   */
  get userMessageCount(): number {
    return this.messages.filter((msg) => msg.type === 'message').length;
  }

  /**
   * 获取指定用户的消息
   */
  getMessagesByUser = (username: string): EnhancedMessage[] => {
    return this.messages.filter((msg) => msg.username === username);
  };

  /**
   * 获取最近的消息
   */
  getRecentMessages = (count = 50): EnhancedMessage[] => {
    return this.messages.slice(-count);
  };

  /**
   * 检查用户是否在线
   */
  isUserOnline = (username: string): boolean => {
    return this.users.some((user) => user.username === username && user.isOnline);
  };

  /**
   * 获取输入状态文本
   */
  get typingStatusText(): string {
    if (this.typingUsers.length === 0) return '';

    if (this.typingUsers.length === 1) {
      return `${this.typingUsers[0]} 正在输入...`;
    } else if (this.typingUsers.length === 2) {
      return `${this.typingUsers.join(' 和 ')} 正在输入...`;
    } else {
      return `${this.typingUsers.slice(0, 2).join(', ')} 等 ${this.typingUsers.length} 人正在输入...`;
    }
  }

  /**
   * 重置聊天状态
   */
  reset = (): void => {
    runInAction(() => {
      this.messages = [];
      this.users = [];
      this.notifications = [];
      this.isTyping = false;
      this.typingUsers = [];
      this.currentUser = null;
      this.hasMoreHistory = true;
    });

    this.messageBatcher.reset();
    this.log('聊天状态已重置');
  };

  /**
   * 获取聊天统计信息
   */
  get chatStats() {
    return {
      totalMessages: this.messageCount,
      userMessages: this.userMessageCount,
      systemMessages: this.systemMessageCount,
      onlineUsers: this.onlineUserCount,
      totalUsers: this.users.length,
      notifications: this.notifications.length,
      typingUsers: this.typingUsers.length,
      storageEnabled: this.storageEnabled,
      storageInitialized: this.storageInitialized,
    };
  }

  /**
   * 导出消息历史
   */
  exportMessages = async (): Promise<string> => {
    const data = {
      exportedAt: new Date().toISOString(),
      messages: this.messages,
      users: this.users,
    };
    return JSON.stringify(data, null, 2);
  };

  /**
   * 日志输出
   */
  private log = (...args: any[]): void => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ChatStore]', ...args);
    }
  };

  /**
   * 销毁 Store
   */
  destroy = (): void => {
    // 清除所有定时器
    this.typingTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.typingTimeouts.clear();
    this.notificationTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.notificationTimeouts.clear();

    this.messageBatcher.destroy();
    this.reset();
    this.log('ChatStore 已销毁');
  };
}
