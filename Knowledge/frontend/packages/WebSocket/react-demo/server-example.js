/**
 * WebSocket 服务器示例
 * 支持多用户聊天、心跳检测、用户管理等功能
 */

const WebSocket = require('ws');
const http = require('http');
const url = require('url');

// 创建 HTTP 服务器
const server = http.createServer();

// 创建 WebSocket 服务器
const wss = new WebSocket.Server({ 
  server,
  path: '/',
  perMessageDeflate: {
    // 启用压缩
    zlibDeflateOptions: {
      threshold: 1024,
      concurrencyLimit: 10,
    },
  },
});

// 连接管理
const clients = new Map(); // ws -> {username, joinTime, lastPing}
const rooms = new Map();   // roomId -> Set(clients)

// 统计信息
let totalConnections = 0;
let totalMessages = 0;

// 工具函数
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${level}] ${message}`, data ? data : '');
};

const broadcast = (data, exclude = null) => {
  const message = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const broadcastToRoom = (roomId, data, exclude = null) => {
  const room = rooms.get(roomId);
  if (!room) return;

  const message = JSON.stringify(data);
  room.forEach((client) => {
    if (client !== exclude && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
};

const sendToClient = (client, data) => {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(data));
  }
};

const getUserList = () => {
  return Array.from(clients.values()).map(info => ({
    username: info.username,
    joinTime: info.joinTime,
    isOnline: true,
  }));
};

const cleanupClient = (ws) => {
  const clientInfo = clients.get(ws);
  if (clientInfo) {
    const { username } = clientInfo;
    
    // 从客户端列表中移除
    clients.delete(ws);
    
    // 通知其他用户
    broadcast({
      type: 'leave',
      username: username,
      timestamp: Date.now(),
    }, ws);
    
    // 发送更新的用户列表
    broadcast({
      type: 'userList',
      users: getUserList(),
      count: clients.size,
    });
    
    log('INFO', `用户离开: ${username}, 当前在线: ${clients.size}`);
  }
};

// WebSocket 连接处理
wss.on('connection', (ws, request) => {
  totalConnections++;
  const clientIP = request.socket.remoteAddress;
  
  log('INFO', `新连接建立 #${totalConnections}`, { ip: clientIP });
  
  // 发送欢迎消息
  sendToClient(ws, {
    type: 'system',
    content: '欢迎来到 WebSocket 聊天室！',
    timestamp: Date.now(),
  });

  // 消息处理
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      totalMessages++;
      
      log('DEBUG', `收到消息 [${data.type}]`, { from: clients.get(ws)?.username || 'unknown' });
      
      switch (data.type) {
        case 'join':
          handleJoin(ws, data);
          break;
          
        case 'message':
          handleMessage(ws, data);
          break;
          
        case 'ping':
          handlePing(ws, data);
          break;
          
        case 'typing':
          handleTyping(ws, data);
          break;
          
        case 'privateMessage':
          handlePrivateMessage(ws, data);
          break;
          
        default:
          log('WARN', '未知消息类型', { type: data.type });
          sendToClient(ws, {
            type: 'error',
            content: '未知的消息类型',
            timestamp: Date.now(),
          });
      }
    } catch (error) {
      log('ERROR', '消息解析失败', { error: error.message });
      sendToClient(ws, {
        type: 'error',
        content: '消息格式错误',
        timestamp: Date.now(),
      });
    }
  });

  // 连接关闭处理
  ws.on('close', (code, reason) => {
    log('INFO', `连接关闭`, { code, reason: reason.toString() });
    cleanupClient(ws);
  });

  // 错误处理
  ws.on('error', (error) => {
    log('ERROR', 'WebSocket 错误', { error: error.message });
    cleanupClient(ws);
  });

  // 连接超时处理（30秒无活动自动断开）
  const timeoutId = setTimeout(() => {
    if (ws.readyState === WebSocket.OPEN) {
      log('WARN', '连接超时，主动断开');
      ws.close(4001, '连接超时');
    }
  }, 30000);

  ws.on('close', () => {
    clearTimeout(timeoutId);
  });
});

// 处理用户加入
const handleJoin = (ws, data) => {
  const { username } = data;
  
  // 验证用户名
  if (!username || typeof username !== 'string') {
    sendToClient(ws, {
      type: 'error',
      content: '用户名无效',
      timestamp: Date.now(),
    });
    return;
  }
  
  if (username.length < 2 || username.length > 20) {
    sendToClient(ws, {
      type: 'error',
      content: '用户名长度必须在2-20个字符之间',
      timestamp: Date.now(),
    });
    return;
  }
  
  // 检查用户名是否已存在
  const existingUser = Array.from(clients.values()).find(info => info.username === username);
  if (existingUser) {
    sendToClient(ws, {
      type: 'error',
      content: '用户名已被使用，请选择其他用户名',
      timestamp: Date.now(),
    });
    return;
  }
  
  // 添加到客户端列表
  clients.set(ws, {
    username: username.trim(),
    joinTime: Date.now(),
    lastPing: Date.now(),
  });
  
  // 通知其他用户
  broadcast({
    type: 'join',
    username: username.trim(),
    timestamp: Date.now(),
  }, ws);
  
  // 发送用户列表给新用户
  sendToClient(ws, {
    type: 'userList',
    users: getUserList(),
    count: clients.size,
  });
  
  // 发送更新的用户列表给所有用户
  broadcast({
    type: 'userList',
    users: getUserList(),
    count: clients.size,
  });
  
  // 发送服务器统计信息
  sendToClient(ws, {
    type: 'serverStats',
    totalConnections,
    totalMessages,
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
  
  log('INFO', `用户加入: ${username}, 当前在线: ${clients.size}`);
};

// 处理聊天消息
const handleMessage = (ws, data) => {
  const clientInfo = clients.get(ws);
  if (!clientInfo) {
    sendToClient(ws, {
      type: 'error',
      content: '请先加入聊天室',
      timestamp: Date.now(),
    });
    return;
  }
  
  const { content } = data;
  
  // 验证消息内容
  if (!content || typeof content !== 'string') {
    sendToClient(ws, {
      type: 'error',
      content: '消息内容无效',
      timestamp: Date.now(),
    });
    return;
  }
  
  if (content.length > 500) {
    sendToClient(ws, {
      type: 'error',
      content: '消息长度不能超过500个字符',
      timestamp: Date.now(),
    });
    return;
  }
  
  // 简单的内容过滤（可以扩展为更复杂的过滤逻辑）
  const filteredContent = content.trim();
  if (!filteredContent) {
    return;
  }
  
  // 广播消息
  const messageData = {
    type: 'message',
    username: clientInfo.username,
    content: filteredContent,
    timestamp: Date.now(),
  };
  
  broadcast(messageData);
  
  log('INFO', `消息发送: ${clientInfo.username} -> ${filteredContent.substring(0, 50)}`);
};

// 处理心跳
const handlePing = (ws, data) => {
  const clientInfo = clients.get(ws);
  if (clientInfo) {
    clientInfo.lastPing = Date.now();
  }
  
  // 发送 pong 响应
  sendToClient(ws, {
    type: 'pong',
    timestamp: data.timestamp,
  });
};

// 处理输入状态
const handleTyping = (ws, data) => {
  const clientInfo = clients.get(ws);
  if (!clientInfo) return;
  
  // 广播输入状态给其他用户
  broadcast({
    type: 'typing',
    username: clientInfo.username,
    isTyping: data.isTyping,
    timestamp: Date.now(),
  }, ws);
};

// 处理私聊消息
const handlePrivateMessage = (ws, data) => {
  const clientInfo = clients.get(ws);
  if (!clientInfo) return;
  
  const { targetUsername, content } = data;
  
  // 查找目标用户
  let targetClient = null;
  for (const [client, info] of clients.entries()) {
    if (info.username === targetUsername) {
      targetClient = client;
      break;
    }
  }
  
  if (!targetClient) {
    sendToClient(ws, {
      type: 'error',
      content: `用户 ${targetUsername} 不在线`,
      timestamp: Date.now(),
    });
    return;
  }
  
  // 发送私聊消息
  const messageData = {
    type: 'privateMessage',
    from: clientInfo.username,
    to: targetUsername,
    content: content,
    timestamp: Date.now(),
  };
  
  sendToClient(targetClient, messageData);
  sendToClient(ws, { ...messageData, type: 'privateMessageSent' });
  
  log('INFO', `私聊消息: ${clientInfo.username} -> ${targetUsername}`);
};

// 心跳检测（每30秒检查一次）
setInterval(() => {
  const now = Date.now();
  const timeout = 60000; // 60秒超时
  
  clients.forEach((clientInfo, ws) => {
    if (now - clientInfo.lastPing > timeout) {
      log('WARN', `客户端心跳超时: ${clientInfo.username}`);
      ws.close(4002, '心跳超时');
    }
  });
}, 30000);

// 服务器统计（每5分钟输出一次）
setInterval(() => {
  log('INFO', '服务器状态', {
    连接数: clients.size,
    总连接数: totalConnections,
    总消息数: totalMessages,
    运行时间: `${Math.floor(process.uptime() / 60)} 分钟`,
    内存使用: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
  });
}, 5 * 60 * 1000);

// 优雅关闭
const gracefulShutdown = (signal) => {
  log('INFO', `收到 ${signal} 信号，开始优雅关闭...`);
  
  // 通知所有客户端服务器即将关闭
  broadcast({
    type: 'system',
    content: '服务器即将重启，请稍后重新连接',
    timestamp: Date.now(),
  });
  
  // 等待2秒后关闭所有连接
  setTimeout(() => {
    wss.clients.forEach((ws) => {
      ws.close(1001, '服务器重启');
    });
    
    server.close(() => {
      log('INFO', '服务器已关闭');
      process.exit(0);
    });
  }, 2000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// 启动服务器
const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

server.listen(PORT, HOST, () => {
  log('INFO', `WebSocket 服务器启动成功`, {
    地址: `ws://${HOST}:${PORT}`,
    进程ID: process.pid,
    Node版本: process.version,
  });
});

// 错误处理
server.on('error', (error) => {
  log('ERROR', '服务器错误', { error: error.message });
});

wss.on('error', (error) => {
  log('ERROR', 'WebSocket 服务器错误', { error: error.message });
});

// 导出模块（用于测试）
if (require.main !== module) {
  module.exports = { server, wss };
}
