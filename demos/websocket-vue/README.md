# WebSocket Vue 聊天室 (Pinia + TypeScript)

基于 **Vue 3 + Pinia + TypeScript + Vite** 构建的现代化 WebSocket 聊天应用，展示了生产级实时通信应用的完整实现。

## 🚀 快速开始

### 一键启动（推荐）

```bash
# 进入项目目录
cd Knowledge/frontend/packages/WebSocket/webSocket-vue-demo

# 安装依赖
pnpm install

# 同时启动前端和 WebSocket 服务器
pnpm run dev:full
```

**访问地址**：
- 前端：`http://localhost:3000`
- WebSocket 服务器：`ws://localhost:8080`

### 分步启动

```bash
# 终端1：启动 WebSocket 服务器
pnpm run server

# 终端2：启动前端开发服务器
pnpm run dev
```

## 📋 完整命令列表

```bash
# 开发相关
pnpm run dev         # 启动前端开发服务器
pnpm run dev:open    # 启动前端并自动打开浏览器
pnpm run build       # 生产构建
pnpm run preview     # 预览生产构建
pnpm run clean       # 清理构建文件

# 服务器相关
pnpm run server      # 启动 WebSocket 服务器
pnpm run server:dev  # 启动服务器（自动重启）
pnpm run dev:full    # 同时启动前端和服务器

# 代码质量
pnpm run type-check  # TypeScript 类型检查
pnpm run lint        # ESLint 检查
pnpm run lint:fix    # 自动修复代码格式
```

## 🏗️ 项目架构

### 目录结构

```
webSocket-vue-demo/
├── src/
│   ├── components/             # Vue 组件
│   │   ├── App.vue             # 主应用组件
│   │   ├── LoginForm.vue       # 登录表单
│   │   ├── ChatRoom.vue        # 聊天室主组件
│   │   ├── ChatHeader.vue      # 聊天室头部
│   │   ├── ChatSidebar.vue     # 侧边栏（用户列表/连接状态）
│   │   ├── MessageList.vue     # 消息列表
│   │   ├── MessageInput.vue    # 消息输入框
│   │   └── NotificationContainer.vue # 通知容器
│   ├── stores/                 # Pinia 状态管理
│   │   ├── app.ts              # 应用主 Store
│   │   ├── websocket.ts        # WebSocket 连接 Store
│   │   ├── chat.ts             # 聊天数据 Store
│   │   └── index.ts            # Store 导出
│   ├── composables/            # 组合式函数
│   │   └── useWebSocketChat.ts # WebSocket 聊天逻辑
│   ├── types/
│   │   └── index.ts            # TypeScript 类型定义
│   └── main.ts                 # 应用入口
├── public/
│   └── vite.svg                # 网站图标
├── server-example.js           # WebSocket 服务器实现
├── vite.config.ts              # Vite 配置
├── tsconfig.json               # TypeScript 配置
├── eslint.config.js            # ESLint 配置
├── index.html                  # HTML 模板
└── package.json                # 项目依赖
```

### 技术栈

**核心技术**：
- **Vue 3** - 使用 Composition API 和最新特性
- **Pinia** - 新一代状态管理库
- **TypeScript** - 强类型语言支持
- **Vite** - 极速的构建工具

**开发工具**：
- **ESLint + Vue ESLint** - 代码检查工具
- **Vue Styled Components** - CSS-in-JS 解决方案（可选）
- **Vite Dev Server** - 开发服务器 + 热更新

## ✨ 功能特性

### 🔧 技术特性

- **强类型支持** - TypeScript 提供完整的类型检查和智能提示
- **响应式状态管理** - Pinia 提供直观的状态管理体验
- **组合式架构** - 清晰的 Store 和 Composable 分层设计
- **极速开发体验** - Vite 提供毫秒级热更新

### 🚀 聊天功能

- **实时聊天** - 多用户实时消息收发
- **用户管理** - 用户加入/离开通知，在线用户列表
- **消息类型** - 支持文本消息、系统通知、表情
- **输入体验** - Enter 发送，Shift+Enter 换行，字符计数

### 🛡️ 连接管理

- **自动重连** - 智能重连机制，指数退避算法
- **心跳检测** - 实时监控连接状态和网络延迟
- **消息队列** - 离线消息缓存，重连后自动发送
- **状态追踪** - 完整的连接状态管理和错误处理

### 🎨 用户体验

- **现代化 UI** - 渐变色彩和流畅动画
- **响应式设计** - 适配桌面端和移动端
- **实时通知** - 多种类型的用户反馈
- **加载状态** - 优雅的加载和过渡效果

## 🔧 WebSocket 服务器

### 内置服务器特性

项目包含一个功能完整的 WebSocket 服务器 (`server-example.js`)：

**核心功能**：
- 多用户聊天支持
- 用户连接管理
- 消息广播
- 心跳检测 (ping/pong)
- 连接统计

**高级特性**：
- 连接池管理
- 优雅关闭
- 错误处理和日志
- WebSocket 压缩
- 内存管理

### 服务器配置

```javascript
// 默认配置
{
  port: 8080,
  path: '/',
  compression: true,
  heartbeatInterval: 30000,
  maxConnections: 1000
}
```

### 支持的消息协议

```typescript
// 用户加入
{ type: 'join', username: '用户名', timestamp: 1234567890 }

// 聊天消息
{ type: 'message', username: '发送者', content: '消息内容', timestamp: 1234567890 }

// 心跳检测
{ type: 'ping', timestamp: 1234567890 }
{ type: 'pong', timestamp: 1234567890 }

// 用户列表
{ type: 'userList', users: ['user1', 'user2'], count: 2 }
```

## 🎯 核心实现

### Pinia 状态管理

```typescript
// 响应式数据流
AppStore → 用户状态、配置
WebSocketStore → 连接管理、消息发送
ChatStore → 聊天数据、通知

// 组合式 API 使用
const { appStore, webSocketStore, chatStore } = useWebSocketChat()
```

### WebSocket 最佳实践实现

| 最佳实践 | 实现位置 | 说明 |
|----------|----------|------|
| 自动重连 | `websocket.ts:scheduleReconnect` | 指数退避算法，最大重试次数 |
| 心跳检测 | `websocket.ts:sendPing` | 30秒间隔，超时检测 |
| 消息队列 | `websocket.ts:messageQueue` | 离线消息缓存 |
| 错误处理 | `websocket.ts:handleError` | 完整错误捕获和用户提示 |
| 事件分发 | `websocket.ts:onMessage` | 类型化事件系统 |
| 类型安全 | `types/index.ts` | 完整 TypeScript 类型定义 |

### TypeScript 类型系统

```typescript
// 完整的类型定义
interface Message {
  id: string;
  type: MessageType;
  username: string;
  content: string;
  timestamp: number;
}

interface WebSocketOptions {
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  enableHeartbeat?: boolean;
}
```

### Vue 3 组合式 API

```vue
<script setup lang="ts">
import { useWebSocketChat } from '@/composables/useWebSocketChat'

// 使用组合式函数
const { 
  appStore, 
  webSocketStore, 
  chatStore, 
  sendMessage, 
  login, 
  logout 
} = useWebSocketChat()

// 响应式状态
const isConnected = computed(() => webSocketStore.isConnected)
const messages = computed(() => chatStore.messages)
</script>
```

## 🔍 开发和调试

### 类型检查

```bash
# TypeScript 编译检查
pnpm run type-check

# 监听模式
npx vue-tsc --noEmit --watch
```

### 代码质量

```bash
# ESLint 检查
pnpm run lint

# 自动修复格式问题
pnpm run lint:fix
```

### Pinia 调试

开发模式下可以在浏览器控制台访问：

```javascript
// 全局 stores 访问
window.stores

// 查看具体数据
window.stores.chatStore.messages
window.stores.webSocketStore.connectionInfo
window.stores.appStore.currentUser
```

### 浏览器调试

- **Network 面板** → WS → 查看 WebSocket 帧数据
- **Console** → 查看连接日志和错误信息
- **Performance** → 分析渲染性能
- **Vue DevTools** → 组件状态调试

## 🚀 部署指南

### 开发环境

```bash
# 使用内置脚本
pnpm run dev:full

# 或手动启动
pnpm run server    # 终端1
pnpm run dev       # 终端2
```

### 生产构建

```bash
# 构建前端
pnpm run build

# 预览构建结果
pnpm run preview

# 生产文件在 dist/ 目录
```

### Docker 部署

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000 8080
CMD ["npm", "run", "dev:full"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  websocket-chat:
    build: .
    ports:
      - "3000:3000"
      - "8080:8080"
    environment:
      - NODE_ENV=production
```

### Nginx 代理

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # 前端静态文件
    location / {
        root /var/www/html/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # WebSocket 代理
    location /ws {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

## 🔧 故障排查

### 常见问题

| 问题现象 | 可能原因 | 解决方案 |
|----------|----------|----------|
| 连接失败 | 服务器未启动 | 运行 `pnpm run server` |
| 端口被占用 | 8080 或 3000 端口占用 | `lsof -i :8080` 查看并杀死进程 |
| 依赖安装失败 | 网络或缓存问题 | 清理 `node_modules` 重新安装 |
| TypeScript 错误 | 类型定义问题 | 运行 `pnpm run type-check` |
| 热更新失败 | 文件监听问题 | 重启开发服务器 |

### 调试工具

```bash
# 检查端口占用
lsof -i :8080
lsof -i :3000

# WebSocket 客户端测试
npx wscat -c ws://localhost:8080

# 网络连接测试
curl -v -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     http://localhost:8080
```

## 📚 学习资源

### 相关文档

- [WebSocket 基础知识卡](../WebSocket使用指南.md) - WebSocket 协议基础
- [Vue 3 官方文档](https://cn.vuejs.org/) - Vue 3 核心特性
- [Pinia 官方文档](https://pinia.vuejs.org/zh/) - 状态管理
- [Vite 官方文档](https://cn.vitejs.dev/) - 构建工具
- [TypeScript 官方文档](https://www.typescriptlang.org/) - 类型系统

### 扩展阅读

- WebSocket 协议规范 (RFC 6455)
- Vue 3 Composition API 最佳实践
- Pinia 与 Vuex 的区别和优势
- TypeScript 高级类型使用

## 🤝 贡献指南

### 开发规范

1. **代码风格** - 遵循 ESLint 和 TypeScript 规范
2. **类型安全** - 避免使用 `any`，提供完整类型定义
3. **组件设计** - 单一职责，清晰的 Props 接口
4. **错误处理** - 完善的错误边界和用户反馈

### Git 工作流

1. Fork 项目并创建功能分支
2. 确保代码通过所有检查：`pnpm run lint && pnpm run type-check`
3. 编写清晰的提交信息
4. 提交 Pull Request

## 📄 许可证

MIT License

---

## 🎉 开始体验

1. 运行 `pnpm run dev:full` 启动完整环境
2. 打开多个浏览器标签页测试多用户聊天
3. 尝试断网重连功能
4. 查看开发者工具中的 WebSocket 连接详情
5. 修改代码体验热更新

**祝您使用愉快！** 🚀
