# 快速启动指南

## 🚀 一键启动

```bash
# 1. 进入项目目录
cd Knowledge/frontend/packages/WebSocket/webSocket-vue-demo

# 2. 安装依赖（首次运行）
pnpm install

# 3. 同时启动前端和服务器
pnpm run dev:full
```

## 📋 分步启动

```bash
# 终端 1：启动 WebSocket 服务器
pnpm run server

# 终端 2：启动前端开发服务器
pnpm run dev
```

## 🌐 访问地址

- **前端界面**: http://localhost:3000
- **WebSocket 服务器**: ws://localhost:8080

## ✅ 验证功能

1. 打开 http://localhost:3000
2. 输入用户名和服务器地址 `ws://localhost:8080`
3. 点击"加入聊天室"
4. 打开多个浏览器标签页测试多用户聊天
5. 测试断网重连功能

## 🔧 常见问题

### 端口被占用
```bash
# 检查端口占用
lsof -i :3000
lsof -i :8080

# 杀死占用进程
kill -9 <PID>
```

### 依赖安装失败
```bash
# 清理缓存重新安装
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### TypeScript 错误
当前项目使用简化配置，如需完整 TypeScript 检查：
```bash
# 更新 vue-tsc 版本
pnpm add -D vue-tsc@latest

# 或者跳过类型检查构建
pnpm run build:dev
```

## 🎯 核心特性验证

- ✅ 实时聊天消息
- ✅ 用户加入/离开通知
- ✅ 在线用户列表
- ✅ 输入状态显示
- ✅ 连接状态监控
- ✅ 自动重连机制
- ✅ 心跳检测
- ✅ 消息队列
- ✅ 响应式设计

享受使用吧！🎉
