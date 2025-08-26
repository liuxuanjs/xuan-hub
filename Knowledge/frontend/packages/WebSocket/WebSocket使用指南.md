# WebSocket 使用指南

## 目录
- [基础概念](#基础概念)
- [基本使用方法](#基本使用方法)
- [最佳实践](#最佳实践)
- [注意事项](#注意事项)
- [常见问题](#常见问题)
- [实战案例](#实战案例)

## 基础概念

WebSocket 是一种网络通信协议，提供了在单个 TCP 连接上进行全双工通信的能力。它允许服务器主动向客户端推送数据，而不需要客户端发起请求。

### 特点
- **全双工通信**：客户端和服务器可以同时发送和接收数据
- **持久连接**：一旦建立连接，保持持续连接状态
- **低延迟**：减少了 HTTP 协议的开销
- **实时性**：适合实时应用场景

### 应用场景
- 实时聊天系统
- 在线游戏
- 股票交易系统
- 实时协作编辑
- 直播弹幕
- 系统监控面板

## 基本使用方法

### 1. 创建 WebSocket 连接

```javascript
// 创建 WebSocket 连接
const ws = new WebSocket('ws://localhost:8080');

// 或者使用安全连接
const wss = new WebSocket('wss://secure-server.com/socket');
```

### 2. 监听连接事件

```javascript
// 连接打开时触发
ws.onopen = function(event) {
    console.log('WebSocket 连接已打开');
    // 可以在此发送初始化消息
    ws.send('Hello Server!');
};

// 接收到消息时触发
ws.onmessage = function(event) {
    console.log('收到消息:', event.data);
    
    // 如果是 JSON 数据，需要解析
    try {
        const data = JSON.parse(event.data);
        console.log('解析后的数据:', data);
    } catch (e) {
        console.log('非 JSON 数据:', event.data);
    }
};

// 连接关闭时触发
ws.onclose = function(event) {
    console.log('WebSocket 连接已关闭');
    console.log('关闭代码:', event.code);
    console.log('关闭原因:', event.reason);
};

// 发生错误时触发
ws.onerror = function(error) {
    console.error('WebSocket 错误:', error);
};
```

### 3. 发送消息

```javascript
// 确保连接已打开
if (ws.readyState === WebSocket.OPEN) {
    // 发送文本消息
    ws.send('Hello Server!');
    
    // 发送 JSON 数据
    ws.send(JSON.stringify({
        type: 'message',
        content: 'Hello from client',
        timestamp: Date.now()
    }));
    
    // 发送二进制数据
    const buffer = new ArrayBuffer(16);
    ws.send(buffer);
}
```

### 4. 关闭连接

```javascript
// 正常关闭连接
ws.close();

// 带状态码和原因的关闭
ws.close(1000, '正常关闭');
```

## 最佳实践

### 1. 连接管理
- 实现自动重连机制
- 设置合理的重连间隔和最大重试次数
- 在页面卸载时正确关闭连接

### 2. 消息处理
- 使用 JSON 格式传输结构化数据
- 实现消息类型分发机制
- 对大消息进行分片处理

### 3. 错误处理
- 捕获并处理所有可能的错误
- 提供用户友好的错误提示
- 记录错误日志便于调试

### 4. 性能优化
- 实现消息队列避免消息丢失
- 使用心跳检测保持连接活跃
- 避免频繁发送小消息

### 5. 安全考虑
- 使用 WSS (WebSocket Secure) 进行加密传输
- 实现身份验证和授权
- 验证接收到的数据格式

## 注意事项

### 1. 浏览器兼容性
- 检查目标浏览器的 WebSocket 支持情况
- 考虑使用 Socket.IO 作为 fallback 方案

### 2. 网络环境
- 某些代理服务器可能不支持 WebSocket
- 移动网络可能导致频繁断连
- 需要处理网络切换的情况

### 3. 服务器限制
- 注意服务器的连接数限制
- 考虑消息大小限制
- 处理服务器维护时的连接中断

### 4. 内存管理
- 及时清理事件监听器
- 避免内存泄漏
- 合理管理消息缓存

### 5. 调试技巧
```javascript
// 开发环境下的调试
if (process.env.NODE_ENV === 'development') {
    ws.addEventListener('open', () => console.log('WebSocket opened'));
    ws.addEventListener('close', () => console.log('WebSocket closed'));
    ws.addEventListener('error', (error) => console.error('WebSocket error:', error));
    ws.addEventListener('message', (event) => console.log('WebSocket message:', event.data));
}
```

## 常见问题

### Q1: WebSocket 连接频繁断开怎么办？
**A:** 实现心跳检测机制，定期发送 ping/pong 消息保持连接活跃。

### Q2: 如何处理大量并发连接？
**A:** 在服务端实现连接池管理，客户端实现连接复用。

### Q3: WebSocket 在移动设备上不稳定？
**A:** 监听网络状态变化，在网络恢复时自动重连。

### Q4: 如何确保消息的可靠传递？
**A:** 实现消息确认机制和重发机制。

### Q5: WebSocket 和 HTTP 轮询的选择？
**A:** 实时性要求高的场景选择 WebSocket，简单的状态更新可以考虑 HTTP 轮询。

## 实战案例

### 案例1: 实时聊天室

```javascript
class ChatRoom {
    constructor(url, username) {
        this.url = url;
        this.username = username;
        this.ws = null;
        this.messageContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        
        this.init();
    }
    
    init() {
        this.connect();
        this.setupUI();
    }
    
    connect() {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
            console.log('已连接到聊天室');
            this.showSystemMessage('已连接到聊天室');
            
            // 发送用户加入消息
            this.send({
                type: 'join',
                username: this.username
            });
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
        };
        
        this.ws.onclose = () => {
            this.showSystemMessage('连接已断开');
        };
        
        this.ws.onerror = (error) => {
            this.showSystemMessage('连接错误');
        };
    }
    
    handleMessage(data) {
        switch (data.type) {
            case 'message':
                this.showUserMessage(data.username, data.content, data.timestamp);
                break;
            case 'join':
                this.showSystemMessage(`${data.username} 加入了聊天室`);
                break;
            case 'leave':
                this.showSystemMessage(`${data.username} 离开了聊天室`);
                break;
            case 'userList':
                this.updateUserList(data.users);
                break;
        }
    }
    
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
    
    sendMessage() {
        const content = this.messageInput.value.trim();
        if (content) {
            this.send({
                type: 'message',
                username: this.username,
                content: content,
                timestamp: Date.now()
            });
            this.messageInput.value = '';
        }
    }
    
    showUserMessage(username, content, timestamp) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message user-message';
        messageEl.innerHTML = `
            <span class="username">${username}:</span>
            <span class="content">${content}</span>
            <span class="timestamp">${new Date(timestamp).toLocaleTimeString()}</span>
        `;
        this.messageContainer.appendChild(messageEl);
        this.scrollToBottom();
    }
    
    showSystemMessage(content) {
        const messageEl = document.createElement('div');
        messageEl.className = 'message system-message';
        messageEl.textContent = content;
        this.messageContainer.appendChild(messageEl);
        this.scrollToBottom();
    }
    
    scrollToBottom() {
        this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
    
    setupUI() {
        this.sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
        
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }
}

// 使用
const chatRoom = new ChatRoom('ws://localhost:8080/chat', 'User123');
```

### 案例2: 实时数据监控

```javascript
class DataMonitor {
    constructor(url) {
        this.url = url;
        this.ws = null;
        this.charts = {};
        this.dataBuffer = [];
        
        this.connect();
    }
    
    connect() {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
            console.log('监控连接已建立');
            
            // 订阅数据流
            this.send({
                type: 'subscribe',
                topics: ['cpu', 'memory', 'network']
            });
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.updateMonitorData(data);
        };
    }
    
    updateMonitorData(data) {
        switch (data.type) {
            case 'cpu':
                this.updateChart('cpu', data.value);
                break;
            case 'memory':
                this.updateChart('memory', data.value);
                break;
            case 'network':
                this.updateChart('network', data.value);
                break;
        }
    }
    
    updateChart(type, value) {
        // 更新图表数据
        if (!this.charts[type]) {
            this.charts[type] = this.createChart(type);
        }
        
        const chart = this.charts[type];
        chart.data.datasets[0].data.push({
            x: new Date(),
            y: value
        });
        
        // 保持数据点数量不超过100个
        if (chart.data.datasets[0].data.length > 100) {
            chart.data.datasets[0].data.shift();
        }
        
        chart.update('none');
    }
    
    send(data) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(data));
        }
    }
}
```

### 案例3: 多人协作编辑器

```javascript
class CollaborativeEditor {
    constructor(documentId, url) {
        this.documentId = documentId;
        this.url = url;
        this.ws = null;
        this.editor = null;
        this.isLocalChange = false;
        this.operationQueue = [];
        
        this.init();
    }
    
    init() {
        this.initEditor();
        this.connect();
    }
    
    connect() {
        this.ws = new WebSocket(`${this.url}?doc=${this.documentId}`);
        
        this.ws.onopen = () => {
            console.log('编辑器已连接');
            
            // 请求文档内容
            this.send({
                type: 'requestDocument',
                documentId: this.documentId
            });
        };
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleOperation(data);
        };
    }
    
    handleOperation(operation) {
        switch (operation.type) {
            case 'documentContent':
                this.setEditorContent(operation.content);
                break;
            case 'insert':
                this.applyInsert(operation);
                break;
            case 'delete':
                this.applyDelete(operation);
                break;
            case 'userJoined':
                this.showUserJoined(operation.user);
                break;
            case 'userLeft':
                this.showUserLeft(operation.user);
                break;
        }
    }
    
    onTextChange(changes) {
        if (this.isLocalChange) {
            return;
        }
        
        changes.forEach(change => {
            const operation = {
                type: change.type,
                position: change.from,
                content: change.text,
                documentId: this.documentId,
                timestamp: Date.now()
            };
            
            this.send(operation);
        });
    }
    
    applyInsert(operation) {
        this.isLocalChange = true;
        // 在指定位置插入文本
        this.editor.replaceRange(
            operation.content,
            operation.position
        );
        this.isLocalChange = false;
    }
    
    applyDelete(operation) {
        this.isLocalChange = true;
        // 删除指定范围的文本
        this.editor.replaceRange(
            '',
            operation.from,
            operation.to
        );
        this.isLocalChange = false;
    }
}
```

这份指南涵盖了 WebSocket 的基础使用方法、高级特性、最佳实践和实际案例，希望能帮助您更好地理解和使用 WebSocket 技术。
