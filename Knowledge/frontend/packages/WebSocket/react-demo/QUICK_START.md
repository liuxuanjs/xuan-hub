# 🚀 快速启动指南

## 📦 安装依赖

```bash
pnpm install
# 或
npm install
```

## 🎯 启动方式

### 1. 一键启动（推荐）

```bash
# 同时启动前端和 WebSocket 服务器
pnpm run dev:full
```

会自动启动：
- **前端**: `http://localhost:3000`
- **WebSocket 服务器**: `ws://localhost:8080`
- **自动打开浏览器**

### 2. 分步启动

#### 步骤 1: 启动 WebSocket 服务器

```bash
# 终端 1
pnpm run server
```

看到以下输出表示服务器启动成功：
```
[2024-01-20T10:30:00.000Z] [INFO] WebSocket 服务器启动成功 { 地址: 'ws://0.0.0.0:8080', 进程ID: 12345, Node版本: 'v18.17.0' }
```

#### 步骤 2: 启动前端开发服务器

```bash
# 终端 2
pnpm run dev
```

浏览器会自动打开 `http://localhost:3000`

## 🎮 使用指南

### 1. 登录聊天室

1. 输入用户名（2-20个字符）
2. 确认服务器地址为 `ws://localhost:8080`
3. 点击"连接聊天室"

### 2. 开始聊天

- 在输入框中输入消息
- 按 `Enter` 发送，`Shift + Enter` 换行
- 点击 😊 按钮选择表情
- 使用快捷按钮发送表情

### 3. 查看连接信息

- 右侧边栏显示在线用户
- 查看连接状态和网络延迟
- 使用"测试连接"检查网络

## 🛠️ 开发调试

### TypeScript 类型检查

```bash
pnpm run type-check
```

### 代码格式检查

```bash
pnpm run lint
```

### 服务器开发模式

```bash
# 自动重启服务器
pnpm run server:dev
```

## 🔧 故障排除

### 问题 1: 连接失败

**现象**: 前端显示"连接失败"或"未连接"

**解决方案**:
1. 确认 WebSocket 服务器正在运行
2. 检查服务器地址是否为 `ws://localhost:8080`
3. 查看服务器终端是否有错误信息

### 问题 2: 端口被占用

**现象**: 服务器启动失败，提示端口被占用

**解决方案**:
```bash
# 查看 8080 端口占用
lsof -i :8080

# 杀死占用进程
kill -9 <PID>
```

### 问题 3: 依赖安装失败

**解决方案**:
```bash
# 清理缓存重新安装
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 📁 项目结构

```
react-demo/
├── src/                    # 前端源码
│   ├── components/         # React 组件
│   ├── stores/            # MobX 状态管理
│   └── types/             # TypeScript 类型
├── server-example.js      # WebSocket 服务器
├── package.json           # 项目配置
└── README.md              # 详细文档
```

## ⚡ 快捷命令

```bash
pnpm run dev:full     # 一键启动全套环境
pnpm run server       # 仅启动服务器
pnpm run dev          # 仅启动前端
pnpm run type-check   # TypeScript 检查
pnpm run build        # 生产构建
```

## 🎉 开始体验

现在您可以：
1. 打开多个浏览器标签页
2. 使用不同用户名登录
3. 体验多人实时聊天
4. 测试断线重连功能
5. 查看连接状态和延迟信息

**祝您使用愉快！** 🚀
