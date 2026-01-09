/**
 * IndexedDB 管理器
 * 封装 IndexedDB 操作，用于消息持久化
 */

import type { Message } from '@/types';

const DB_NAME = 'websocket-chat-db';
const DB_VERSION = 1;

// Store 名称
const STORES = {
  MESSAGES: 'messages',
  SETTINGS: 'settings',
} as const;

export interface IDBMessage extends Message {
  /** 会话ID：'public' 或 'private:{username1}:{username2}' */
  conversationId: string;
  /** 是否已同步到服务器 */
  synced?: boolean;
}

export interface IDBSettings {
  key: string;
  value: any;
  updatedAt: number;
}

export interface QueryOptions {
  conversationId?: string;
  username?: string;
  type?: Message['type'];
  startTime?: number;
  endTime?: number;
  offset?: number;
  limit?: number;
}

/**
 * IndexedDB 管理器类
 */
export class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  /**
   * 初始化数据库
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[IndexedDB] Open error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('[IndexedDB] Database opened successfully');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db, event.oldVersion);
      };
    });

    return this.initPromise;
  }

  /**
   * 创建对象存储
   */
  private createStores(db: IDBDatabase, oldVersion: number): void {
    // 首次创建
    if (oldVersion < 1) {
      // 消息存储
      if (!db.objectStoreNames.contains(STORES.MESSAGES)) {
        const messagesStore = db.createObjectStore(STORES.MESSAGES, { keyPath: 'id' });
        messagesStore.createIndex('timestamp', 'timestamp', { unique: false });
        messagesStore.createIndex('username', 'username', { unique: false });
        messagesStore.createIndex('type', 'type', { unique: false });
        messagesStore.createIndex('conversationId', 'conversationId', { unique: false });
        messagesStore.createIndex('conversationId_timestamp', ['conversationId', 'timestamp'], { unique: false });
      }

      // 设置存储
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    }

    // 未来版本升级在这里添加
    // if (oldVersion < 2) { ... }
  }

  /**
   * 确保数据库已初始化
   */
  private ensureInitialized(): void {
    if (!this.db || !this.isInitialized) {
      throw new Error('IndexedDB not initialized. Call init() first.');
    }
  }

  /**
   * 保存消息
   */
  async saveMessage(message: IDBMessage): Promise<void> {
    await this.init();
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MESSAGES], 'readwrite');
      const store = transaction.objectStore(STORES.MESSAGES);

      const request = store.put(message);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 批量保存消息
   */
  async saveMessages(messages: IDBMessage[]): Promise<void> {
    if (messages.length === 0) return;

    await this.init();
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MESSAGES], 'readwrite');
      const store = transaction.objectStore(STORES.MESSAGES);

      let completed = 0;
      let hasError = false;

      messages.forEach((message) => {
        const request = store.put(message);

        request.onsuccess = () => {
          completed++;
          if (completed === messages.length && !hasError) {
            resolve();
          }
        };

        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(request.error);
          }
        };
      });
    });
  }

  /**
   * 获取消息
   */
  async getMessage(id: string): Promise<IDBMessage | undefined> {
    await this.init();
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MESSAGES], 'readonly');
      const store = transaction.objectStore(STORES.MESSAGES);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 查询消息
   */
  async queryMessages(options: QueryOptions = {}): Promise<IDBMessage[]> {
    await this.init();
    this.ensureInitialized();

    const { conversationId, offset = 0, limit = 50 } = options;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MESSAGES], 'readonly');
      const store = transaction.objectStore(STORES.MESSAGES);

      let request: IDBRequest;

      if (conversationId) {
        const index = store.index('conversationId_timestamp');
        const range = IDBKeyRange.bound(
          [conversationId, 0],
          [conversationId, Date.now()]
        );
        request = index.openCursor(range, 'prev');
      } else {
        const index = store.index('timestamp');
        request = index.openCursor(null, 'prev');
      }

      const results: IDBMessage[] = [];
      let skipped = 0;

      request.onsuccess = () => {
        const cursor = request.result as IDBCursorWithValue;

        if (cursor) {
          if (skipped < offset) {
            skipped++;
            cursor.continue();
          } else if (results.length < limit) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            // 反转结果使其按时间升序
            resolve(results.reverse());
          }
        } else {
          resolve(results.reverse());
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 搜索消息
   */
  async searchMessages(query: string, options: QueryOptions = {}): Promise<IDBMessage[]> {
    await this.init();
    this.ensureInitialized();

    const { conversationId, limit = 50 } = options;
    const searchTerm = query.toLowerCase();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MESSAGES], 'readonly');
      const store = transaction.objectStore(STORES.MESSAGES);

      let request: IDBRequest;

      if (conversationId) {
        const index = store.index('conversationId');
        request = index.getAll(conversationId);
      } else {
        request = store.getAll();
      }

      request.onsuccess = () => {
        const allMessages: IDBMessage[] = request.result;
        const filtered = allMessages
          .filter((msg) =>
            msg.content.toLowerCase().includes(searchTerm) ||
            msg.username.toLowerCase().includes(searchTerm)
          )
          .slice(-limit);

        resolve(filtered);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 删除消息
   */
  async deleteMessage(id: string): Promise<void> {
    await this.init();
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MESSAGES], 'readwrite');
      const store = transaction.objectStore(STORES.MESSAGES);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 清空会话消息
   */
  async clearConversation(conversationId: string): Promise<void> {
    await this.init();
    this.ensureInitialized();

    const messages = await this.queryMessages({ conversationId, limit: 10000 });

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MESSAGES], 'readwrite');
      const store = transaction.objectStore(STORES.MESSAGES);

      let completed = 0;
      let hasError = false;

      if (messages.length === 0) {
        resolve();
        return;
      }

      messages.forEach((message) => {
        const request = store.delete(message.id);

        request.onsuccess = () => {
          completed++;
          if (completed === messages.length && !hasError) {
            resolve();
          }
        };

        request.onerror = () => {
          if (!hasError) {
            hasError = true;
            reject(request.error);
          }
        };
      });
    });
  }

  /**
   * 清空所有消息
   */
  async clearAllMessages(): Promise<void> {
    await this.init();
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MESSAGES], 'readwrite');
      const store = transaction.objectStore(STORES.MESSAGES);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 清理过期消息
   * @param maxAge 最大保留时间（毫秒）
   */
  async cleanupOldMessages(maxAge: number = 30 * 24 * 60 * 60 * 1000): Promise<number> {
    await this.init();
    this.ensureInitialized();

    const cutoff = Date.now() - maxAge;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MESSAGES], 'readwrite');
      const store = transaction.objectStore(STORES.MESSAGES);
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoff);
      const request = index.openCursor(range);

      let deletedCount = 0;

      request.onsuccess = () => {
        const cursor = request.result as IDBCursorWithValue;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`[IndexedDB] Cleaned up ${deletedCount} old messages`);
          resolve(deletedCount);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取消息总数
   */
  async getMessageCount(conversationId?: string): Promise<number> {
    await this.init();
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.MESSAGES], 'readonly');
      const store = transaction.objectStore(STORES.MESSAGES);

      let request: IDBRequest<number>;

      if (conversationId) {
        const index = store.index('conversationId');
        request = index.count(conversationId);
      } else {
        request = store.count();
      }

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 保存设置
   */
  async saveSetting(key: string, value: any): Promise<void> {
    await this.init();
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SETTINGS], 'readwrite');
      const store = transaction.objectStore(STORES.SETTINGS);

      const setting: IDBSettings = {
        key,
        value,
        updatedAt: Date.now(),
      };

      const request = store.put(setting);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 获取设置
   */
  async getSetting<T = any>(key: string): Promise<T | undefined> {
    await this.init();
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SETTINGS], 'readonly');
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.get(key);

      request.onsuccess = () => {
        const result: IDBSettings | undefined = request.result;
        resolve(result?.value);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 删除设置
   */
  async deleteSetting(key: string): Promise<void> {
    await this.init();
    this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SETTINGS], 'readwrite');
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 导出所有数据
   */
  async exportData(): Promise<{ messages: IDBMessage[]; settings: IDBSettings[] }> {
    await this.init();
    this.ensureInitialized();

    const messages = await this.queryMessages({ limit: 100000 });

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORES.SETTINGS], 'readonly');
      const store = transaction.objectStore(STORES.SETTINGS);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve({
          messages,
          settings: request.result,
        });
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * 导入数据
   */
  async importData(data: { messages?: IDBMessage[]; settings?: IDBSettings[] }): Promise<void> {
    await this.init();

    if (data.messages && data.messages.length > 0) {
      await this.saveMessages(data.messages);
    }

    if (data.settings) {
      for (const setting of data.settings) {
        await this.saveSetting(setting.key, setting.value);
      }
    }
  }

  /**
   * 检查是否支持 IndexedDB
   */
  static isSupported(): boolean {
    return typeof window !== 'undefined' && !!window.indexedDB;
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
      this.initPromise = null;
    }
  }

  /**
   * 删除数据库
   */
  static async deleteDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);

      request.onsuccess = () => {
        console.log('[IndexedDB] Database deleted');
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }
}

// 导出单例实例
export const indexedDBManager = new IndexedDBManager();
