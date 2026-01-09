import { makeAutoObservable, runInAction } from 'mobx';
import { v4 as uuidv4 } from 'uuid';
import type { 
  Message, 
  User, 
  Notification, 
  ChatMessage,
  SystemMessage,
  UserActionMessage,
  UserListMessage,
  NotificationMessage,
  WebSocketMessage,
  NotificationLevel
} from '@/types';

/**
 * 聊天 Store
 * 管理聊天消息、用户列表、通知等状态
 */
export class ChatStore {
  // 消息列表
  messages: Message[] = [];
  
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

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

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
        // 如果不是 JSON，直接显示文本消息
        this.addMessage('unknown', data, 'message');
        return;
      }
    }

    const message = data as WebSocketMessage;
    
    switch (message.type) {
      case 'message':
        this.handleChatMessage(message);
        break;
        
      case 'join':
        this.handleUserJoin(message);
        break;
        
      case 'leave':
        this.handleUserLeave(message);
        break;
        
      case 'userList':
        this.handleUserList(message);
        break;
        
      case 'notification':
        this.handleNotificationMessage(message);
        break;
        
      case 'system':
        this.handleSystemMessage(message);
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
    this.addMessage(
      message.username,
      message.content,
      'message',
      message.timestamp
    );
  };

  /**
   * 处理用户加入
   */
  private handleUserJoin = (message: UserActionMessage): void => {
    const { username } = message;
    
    // 添加用户到列表
    this.addUser({
      username,
      joinTime: message.timestamp,
      isOnline: true,
    });
    
    // 如果不是当前用户，显示系统消息
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
      this.users = message.users.map(user => ({
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
        this.typingUsers = this.typingUsers.filter(user => user !== username);
      }
    });
    
    // 3秒后自动移除输入状态
    setTimeout(() => {
      runInAction(() => {
        this.typingUsers = this.typingUsers.filter(user => user !== username);
      });
    }, 3000);
  };

  /**
   * 处理错误消息
   */
  private handleErrorMessage = (message: any): void => {
    this.showNotification(message.content, 'error');
  };

  /**
   * 添加消息
   */
  addMessage = (
    username: string, 
    content: string, 
    type: Message['type'] = 'message',
    timestamp = Date.now()
  ): void => {
    const message: Message = {
      id: uuidv4(),
      username,
      content,
      type,
      timestamp,
    };

    runInAction(() => {
      this.messages.push(message);
      
      // 保持消息数量在合理范围内（最多1000条）
      if (this.messages.length > 1000) {
        this.messages = this.messages.slice(-900);
      }
    });

    this.log('添加消息:', message);
  };

  /**
   * 添加系统消息
   */
  addSystemMessage = (content: string): void => {
    this.addMessage('', content, 'system');
  };

  /**
   * 清空消息
   */
  clearMessages = (): void => {
    runInAction(() => {
      this.messages = [];
    });
    
    this.addSystemMessage('消息已清空');
    this.log('消息已清空');
  };

  /**
   * 添加用户
   */
  addUser = (user: User): void => {
    runInAction(() => {
      // 避免重复添加
      const existingIndex = this.users.findIndex(u => u.username === user.username);
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
      this.users = this.users.filter(user => user.username !== username);
      this.typingUsers = this.typingUsers.filter(user => user !== username);
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

    // 自动移除通知
    if (notification.autoClose) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, duration);
    }

    this.log('显示通知:', notification);
  };

  /**
   * 移除通知
   */
  removeNotification = (id: string): void => {
    runInAction(() => {
      this.notifications = this.notifications.filter(n => n.id !== id);
    });
  };

  /**
   * 清空通知
   */
  clearNotifications = (): void => {
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
    return this.users.filter(user => user.isOnline).length;
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
    return this.messages.filter(msg => msg.type === 'system').length;
  }

  /**
   * 获取用户消息数量
   */
  get userMessageCount(): number {
    return this.messages.filter(msg => msg.type === 'message').length;
  }

  /**
   * 获取指定用户的消息
   */
  getMessagesByUser = (username: string): Message[] => {
    return this.messages.filter(msg => msg.username === username);
  };

  /**
   * 搜索消息
   */
  searchMessages = (query: string): Message[] => {
    if (!query.trim()) return [];
    
    const searchTerm = query.toLowerCase();
    return this.messages.filter(msg => 
      msg.content.toLowerCase().includes(searchTerm) ||
      msg.username.toLowerCase().includes(searchTerm)
    );
  };

  /**
   * 获取最近的消息
   */
  getRecentMessages = (count = 50): Message[] => {
    return this.messages.slice(-count);
  };

  /**
   * 检查用户是否在线
   */
  isUserOnline = (username: string): boolean => {
    return this.users.some(user => user.username === username && user.isOnline);
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
  };

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
    });
    
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
    };
  }

  /**
   * 日志输出
   */
  private log = (...args: any[]): void => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[ChatStore]', ...args);
    }
  };
}
