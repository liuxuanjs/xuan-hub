---
aliases: ["WebSocket基础", "WS速查", "WebSocket API"]
title: "WebSocket 基础命令"
tags: ["WebSocket", "实时通信", "前端", "API"]
updated: 2025-09-22
---

## 定义

WebSocket 是全双工通信协议，在单个 TCP 连接上实现客户端与服务器的实时双向数据交换。

## 核心要点

- **协议升级**：通过 HTTP Upgrade 机制从 HTTP 切换到 WebSocket
- **全双工通信**：客户端和服务器可同时发送接收数据，无需轮询
- **持久连接**：建立后保持连接状态，适合实时场景（聊天、游戏、监控）
- **状态管理**：连接有 CONNECTING、OPEN、CLOSING、CLOSED 四种状态

## 示例

```javascript
// 创建连接
const ws = new WebSocket('ws://localhost:8080');

// 事件处理
ws.onopen = () => console.log('连接已建立');
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('收到消息:', data);
};
ws.onclose = () => console.log('连接已关闭');
ws.onerror = (error) => console.error('连接错误:', error);

// 发送消息
if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({type: 'message', content: 'Hello'}));
}

// 关闭连接
ws.close(1000, 'Normal closure');
```

## 速查

- **创建连接**：`new WebSocket('ws://localhost:8080')`
- **发送消息**：`ws.send(JSON.stringify(data))`
- **关闭连接**：`ws.close(1000, 'reason')`
- **连接状态**：`ws.readyState === WebSocket.OPEN`
- **事件监听**：`onopen`, `onmessage`, `onclose`, `onerror`

## 常见错误

| 症状 | 可能原因 | 解决方案 |
|------|----------|----------|
| 连接失败 | 服务器未启动 | 检查 `ws://` 协议和端口 |
| 频繁断开 | 网络不稳定 | 实现心跳检测和自动重连 |
| 消息丢失 | 未检查连接状态 | 发送前检查 `readyState` |
| 跨域错误 | Origin 策略限制 | 服务器配置 CORS 或使用 WSS |

## 相关

- [[Knowledge/frontend/packages/WebSocket/webSocket-react-demo/README]] - React WebSocket 聊天室实战项目

