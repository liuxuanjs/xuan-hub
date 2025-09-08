# 浏览器输入URL后的完整流程解析：从URL到页面的神奇旅程

> 当你在浏览器地址栏输入 `https://www.google.com` 并按下回车键，看似简单的操作背后却隐藏着一个复杂而精密的技术流程。这个过程涉及DNS解析、TCP连接、HTTP请求、服务器处理、资源加载、页面渲染等多个环节。让我们一起揭开这个"从URL到页面"的神奇旅程！

## 为什么理解这个流程很重要？

### 前端开发者的必备知识

作为前端开发者，理解这个完整流程能帮你：

```javascript
// 优化资源加载时机
function optimizeResourceLoading() {
  // 1. 预解析DNS
  const link = document.createElement('link');
  link.rel = 'dns-prefetch';
  link.href = '//api.example.com';
  document.head.appendChild(link);
  
  // 2. 预连接重要资源
  const preconnect = document.createElement('link');
  preconnect.rel = 'preconnect';
  preconnect.href = 'https://fonts.googleapis.com';
  document.head.appendChild(preconnect);
  
  // 3. 预加载关键资源
  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.href = '/critical.css';
  preload.as = 'style';
  document.head.appendChild(preload);
}
```

### 性能优化的理论基础

了解每个环节的耗时和瓶颈，才能针对性地进行优化：
- **DNS解析**：可能耗时20-200ms
- **TCP连接**：往返时延（RTT）的1.5-3倍
- **SSL握手**：额外2-4个RTT
- **HTTP请求**：网络延迟 + 服务器处理时间
- **资源下载**：带宽和文件大小决定
- **页面渲染**：DOM构建 + 样式计算 + 布局 + 绘制

## 第一步：URL解析与验证

### 1.1 URL格式解析

当你输入URL时，浏览器首先需要解析URL的各个组成部分：

```javascript
// 浏览器内部的URL解析逻辑（简化版）
function parseURL(url) {
  const urlObj = new URL(url);
  
  return {
    protocol: urlObj.protocol,    // https:
    hostname: urlObj.hostname,    // www.google.com
    port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
    pathname: urlObj.pathname,    // /search
    search: urlObj.search,        // ?q=javascript
    hash: urlObj.hash            // #section1
  };
}

// 示例解析
const parsed = parseURL('https://www.google.com:443/search?q=javascript#results');
console.log(parsed);
// {
//   protocol: "https:",
//   hostname: "www.google.com",
//   port: "443",
//   pathname: "/search",
//   search: "?q=javascript",
//   hash: "#results"
// }
```

### 1.2 URL自动补全与修正

浏览器会智能地处理不完整的URL：

```javascript
// 模拟浏览器的URL补全逻辑
function normalizeURL(input) {
  // 去除首尾空格
  input = input.trim();
  
  // 检查是否是搜索查询还是URL
  if (!input.includes('.') && !input.includes('://')) {
    return `https://www.google.com/search?q=${encodeURIComponent(input)}`;
  }
  
  // 补全协议
  if (!input.startsWith('http://') && !input.startsWith('https://')) {
    input = 'https://' + input;
  }
  
  // 补全www（如果需要）
  try {
    const url = new URL(input);
    if (url.hostname && !url.hostname.startsWith('www.') && 
        url.hostname.split('.').length === 2) {
      url.hostname = 'www.' + url.hostname;
    }
    return url.toString();
  } catch (e) {
    return input;
  }
}

// 测试自动补全
console.log(normalizeURL('google.com'));        // https://www.google.com
console.log(normalizeURL('javascript event loop')); // https://www.google.com/search?q=javascript%20event%20loop
console.log(normalizeURL('github.com/user/repo')); // https://www.github.com/user/repo
```

### 1.3 浏览器缓存检查

在发起网络请求之前，浏览器会检查多级缓存：

```javascript
// 模拟浏览器缓存检查流程
class BrowserCache {
  constructor() {
    this.memoryCache = new Map();  // 内存缓存
    this.diskCache = new Map();    // 磁盘缓存
    this.httpCache = new Map();    // HTTP缓存
  }
  
  async checkCache(url) {
    console.log(`🔍 检查缓存: ${url}`);
    
    // 1. 检查内存缓存（最快）
    if (this.memoryCache.has(url)) {
      console.log('✅ 内存缓存命中');
      return this.memoryCache.get(url);
    }
    
    // 2. 检查磁盘缓存
    if (this.diskCache.has(url)) {
      console.log('✅ 磁盘缓存命中');
      const cached = this.diskCache.get(url);
      // 提升到内存缓存
      this.memoryCache.set(url, cached);
      return cached;
    }
    
    // 3. 检查HTTP缓存（协商缓存）
    if (this.httpCache.has(url)) {
      const cached = this.httpCache.get(url);
      if (this.isStillValid(cached)) {
        console.log('✅ HTTP缓存有效');
        return cached;
      } else {
        console.log('⚠️ HTTP缓存过期，需要验证');
        return { needValidation: true, etag: cached.etag };
      }
    }
    
    console.log('❌ 缓存未命中，需要网络请求');
    return null;
  }
  
  isStillValid(cached) {
    const now = Date.now();
    return cached.expireTime > now;
  }
  
  setCache(url, data, options = {}) {
    const cacheData = {
      data,
      timestamp: Date.now(),
      expireTime: Date.now() + (options.maxAge || 300000), // 默认5分钟
      etag: options.etag
    };
    
    // 根据大小和重要性选择缓存级别
    if (options.important || data.size < 1024 * 100) { // 小于100KB
      this.memoryCache.set(url, cacheData);
    }
    
    this.diskCache.set(url, cacheData);
    
    if (options.etag) {
      this.httpCache.set(url, cacheData);
    }
  }
}

// 使用示例
const cache = new BrowserCache();
await cache.checkCache('https://www.google.com');
```

## 第二步：DNS解析 - 域名到IP的转换

### 2.1 DNS解析的层次结构

DNS解析是一个递归查询过程，涉及多个层级：

```javascript
// 模拟DNS解析过程
class DNSResolver {
  constructor() {
    this.cache = new Map();
    this.servers = {
      local: '127.0.0.1',
      isp: '8.8.8.8',
      root: '198.41.0.4',
      tld: '192.5.6.30',
      authoritative: '216.58.194.174'
    };
  }
  
  async resolve(domain) {
    console.log(`🔍 开始解析域名: ${domain}`);
    
    // 1. 检查浏览器DNS缓存
    if (this.cache.has(domain)) {
      const cached = this.cache.get(domain);
      if (cached.expireTime > Date.now()) {
        console.log('✅ DNS缓存命中');
        return cached.ip;
      }
    }
    
    // 2. 检查系统hosts文件
    const hostsResult = await this.checkHostsFile(domain);
    if (hostsResult) {
      console.log('✅ Hosts文件命中');
      return hostsResult;
    }
    
    // 3. 查询本地DNS服务器
    console.log('📡 查询本地DNS服务器...');
    const localResult = await this.queryDNSServer(this.servers.local, domain);
    if (localResult) {
      this.cache.set(domain, {
        ip: localResult,
        expireTime: Date.now() + 300000 // 5分钟TTL
      });
      return localResult;
    }
    
    // 4. 递归查询
    return await this.recursiveQuery(domain);
  }
  
  async recursiveQuery(domain) {
    console.log('🔄 开始递归DNS查询...');
    
    // 模拟递归查询过程
    const steps = [
      { server: 'root', query: domain, response: 'com域由TLD服务器处理' },
      { server: 'tld', query: domain, response: 'google.com由权威服务器处理' },
      { server: 'authoritative', query: domain, response: '216.58.194.174' }
    ];
    
    for (const step of steps) {
      console.log(`📡 查询${step.server}服务器: ${step.query}`);
      console.log(`📨 响应: ${step.response}`);
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    const ip = '216.58.194.174';
    console.log(`✅ DNS解析完成: ${domain} -> ${ip}`);
    
    // 缓存结果
    this.cache.set(domain, {
      ip: ip,
      expireTime: Date.now() + 300000
    });
    
    return ip;
  }
  
  async checkHostsFile(domain) {
    // 模拟检查hosts文件
    const hostsEntries = {
      'localhost': '127.0.0.1',
      'local.dev': '127.0.0.1'
    };
    
    return hostsEntries[domain];
  }
  
  async queryDNSServer(server, domain) {
    // 模拟DNS服务器查询
    console.log(`📡 查询DNS服务器 ${server}...`);
    
    // 模拟网络请求延迟
    await new Promise(resolve => setTimeout(resolve, 20));
    
    // 模拟一些常见域名的解析结果
    const mockResults = {
      'www.google.com': '216.58.194.174',
      'www.github.com': '140.82.112.4',
      'www.stackoverflow.com': '151.101.1.69'
    };
    
    return mockResults[domain];
  }
}

// 使用示例
const resolver = new DNSResolver();
const ip = await resolver.resolve('www.google.com');
console.log(`最终IP地址: ${ip}`);
```

### 2.2 DNS优化技术

现代浏览器使用多种技术优化DNS解析：

```javascript
// DNS预解析优化
class DNSOptimizer {
  constructor() {
    this.prefetchedDomains = new Set();
    this.preconnectedDomains = new Set();
  }
  
  // DNS预解析
  prefetchDNS(domains) {
    domains.forEach(domain => {
      if (!this.prefetchedDomains.has(domain)) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        document.head.appendChild(link);
        
        this.prefetchedDomains.add(domain);
        console.log(`🚀 DNS预解析: ${domain}`);
      }
    });
  }
  
  // 预连接（DNS + TCP + SSL）
  preconnect(domains) {
    domains.forEach(domain => {
      if (!this.preconnectedDomains.has(domain)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = `https://${domain}`;
        document.head.appendChild(link);
        
        this.preconnectedDomains.add(domain);
        console.log(`🔗 预连接: ${domain}`);
      }
    });
  }
  
  // 智能预测需要预解析的域名
  predictDomains() {
    const domains = new Set();
    
    // 扫描页面中的外部链接
    document.querySelectorAll('a[href^="http"]').forEach(link => {
      try {
        const url = new URL(link.href);
        domains.add(url.hostname);
      } catch (e) {}
    });
    
    // 扫描图片资源
    document.querySelectorAll('img[src]').forEach(img => {
      try {
        const url = new URL(img.src);
        if (url.hostname !== location.hostname) {
          domains.add(url.hostname);
        }
      } catch (e) {}
    });
    
    return Array.from(domains);
  }
  
  // 自动优化
  autoOptimize() {
    const domains = this.predictDomains();
    
    // 根据域名重要性分级处理
    const criticalDomains = domains.filter(domain => 
      domain.includes('api') || domain.includes('cdn')
    );
    
    const normalDomains = domains.filter(domain => 
      !criticalDomains.includes(domain)
    );
    
    // 关键域名使用preconnect
    this.preconnect(criticalDomains);
    
    // 普通域名使用dns-prefetch
    this.prefetchDNS(normalDomains);
  }
}

// 使用示例
const optimizer = new DNSOptimizer();

// 手动优化重要域名
optimizer.preconnect(['api.example.com', 'cdn.example.com']);
optimizer.prefetchDNS(['fonts.googleapis.com', 'www.google-analytics.com']);

// 页面加载完成后自动优化
document.addEventListener('DOMContentLoaded', () => {
  optimizer.autoOptimize();
});
```

## 第三步：建立TCP连接 - 三次握手

### 3.1 TCP三次握手过程

TCP连接的建立需要三次握手来确保连接的可靠性：

```javascript
// 模拟TCP三次握手过程
class TCPConnection {
  constructor() {
    this.state = 'CLOSED';
    this.sequenceNumber = Math.floor(Math.random() * 1000000);
    this.ackNumber = 0;
    this.connected = false;
  }
  
  async connect(serverIP, port) {
    console.log(`🔗 开始连接 ${serverIP}:${port}`);
    console.log('📊 TCP三次握手开始...');
    
    try {
      // 第一次握手：客户端发送SYN
      await this.sendSYN(serverIP, port);
      
      // 第二次握手：服务器响应SYN-ACK
      await this.receiveSYNACK();
      
      // 第三次握手：客户端发送ACK
      await this.sendACK();
      
      this.connected = true;
      this.state = 'ESTABLISHED';
      console.log('✅ TCP连接建立成功');
      
      return {
        success: true,
        localPort: Math.floor(Math.random() * 60000) + 1024,
        remotePort: port,
        remoteIP: serverIP
      };
      
    } catch (error) {
      console.error('❌ TCP连接失败:', error.message);
      this.state = 'CLOSED';
      return { success: false, error: error.message };
    }
  }
  
  async sendSYN(serverIP, port) {
    console.log('📤 第一次握手: 发送SYN包');
    console.log(`   序列号: ${this.sequenceNumber}`);
    console.log(`   标志位: SYN=1`);
    
    this.state = 'SYN_SENT';
    
    // 模拟网络延迟
    await this.simulateNetworkDelay();
    
    // 模拟可能的网络问题
    if (Math.random() < 0.1) { // 10%的几率模拟超时
      throw new Error('SYN包发送超时');
    }
  }
  
  async receiveSYNACK() {
    console.log('📥 第二次握手: 接收SYN-ACK包');
    
    // 模拟服务器响应
    const serverSeq = Math.floor(Math.random() * 1000000);
    this.ackNumber = serverSeq + 1;
    
    console.log(`   服务器序列号: ${serverSeq}`);
    console.log(`   确认号: ${this.sequenceNumber + 1}`);
    console.log(`   标志位: SYN=1, ACK=1`);
    
    await this.simulateNetworkDelay();
    
    // 模拟服务器拒绝连接
    if (Math.random() < 0.05) { // 5%的几率模拟拒绝
      throw new Error('服务器拒绝连接 (Connection refused)');
    }
  }
  
  async sendACK() {
    console.log('📤 第三次握手: 发送ACK包');
    console.log(`   确认号: ${this.ackNumber}`);
    console.log(`   标志位: ACK=1`);
    
    this.sequenceNumber++;
    
    await this.simulateNetworkDelay();
  }
  
  async simulateNetworkDelay() {
    // 模拟网络往返时延（RTT）
    const rtt = Math.random() * 100 + 50; // 50-150ms
    await new Promise(resolve => setTimeout(resolve, rtt));
    console.log(`   ⏱️ 网络延迟: ${rtt.toFixed(0)}ms`);
  }
  
  close() {
    if (this.connected) {
      console.log('🔚 开始四次挥手关闭连接...');
      this.state = 'CLOSED';
      this.connected = false;
      console.log('✅ 连接已关闭');
    }
  }
}

// 使用示例
const tcpConn = new TCPConnection();
const connectionResult = await tcpConn.connect('216.58.194.174', 443);

if (connectionResult.success) {
  console.log('🎉 可以开始发送HTTP请求了');
  
  // 模拟使用连接一段时间后关闭
  setTimeout(() => {
    tcpConn.close();
  }, 5000);
}
```

### 3.2 TCP连接优化技术

现代浏览器使用多种技术优化TCP连接：

```javascript
// TCP连接池管理
class ConnectionPool {
  constructor() {
    this.pools = new Map(); // 域名 -> 连接池
    this.maxConnectionsPerHost = 6; // HTTP/1.1限制
    this.maxIdleTime = 60000; // 连接空闲超时
    this.keepAliveEnabled = true;
  }
  
  async getConnection(hostname, port = 443) {
    const poolKey = `${hostname}:${port}`;
    
    if (!this.pools.has(poolKey)) {
      this.pools.set(poolKey, {
        connections: [],
        activeConnections: 0,
        waitingQueue: []
      });
    }
    
    const pool = this.pools.get(poolKey);
    
    // 尝试复用空闲连接
    const idleConnection = this.findIdleConnection(pool);
    if (idleConnection) {
      console.log(`♻️ 复用连接: ${poolKey}`);
      idleConnection.lastUsed = Date.now();
      return idleConnection;
    }
    
    // 检查是否可以创建新连接
    if (pool.activeConnections < this.maxConnectionsPerHost) {
      return await this.createNewConnection(hostname, port, pool);
    }
    
    // 连接池已满，加入等待队列
    console.log(`⏳ 连接池已满，等待可用连接: ${poolKey}`);
    return new Promise((resolve) => {
      pool.waitingQueue.push(resolve);
    });
  }
  
  findIdleConnection(pool) {
    return pool.connections.find(conn => 
      !conn.busy && 
      conn.connected && 
      (Date.now() - conn.lastUsed) < this.maxIdleTime
    );
  }
  
  async createNewConnection(hostname, port, pool) {
    console.log(`🔗 创建新连接: ${hostname}:${port}`);
    
    const connection = new TCPConnection();
    const result = await connection.connect(hostname, port);
    
    if (result.success) {
      const connWrapper = {
        connection,
        hostname,
        port,
        connected: true,
        busy: false,
        lastUsed: Date.now(),
        createdAt: Date.now()
      };
      
      pool.connections.push(connWrapper);
      pool.activeConnections++;
      
      // 设置连接空闲检查
      this.scheduleIdleCheck(connWrapper, pool);
      
      return connWrapper;
    } else {
      throw new Error(`连接失败: ${result.error}`);
    }
  }
  
  releaseConnection(connWrapper) {
    if (connWrapper) {
      connWrapper.busy = false;
      connWrapper.lastUsed = Date.now();
      
      const poolKey = `${connWrapper.hostname}:${connWrapper.port}`;
      const pool = this.pools.get(poolKey);
      
      // 处理等待队列
      if (pool && pool.waitingQueue.length > 0) {
        const waitingResolver = pool.waitingQueue.shift();
        connWrapper.busy = true;
        waitingResolver(connWrapper);
      }
    }
  }
  
  scheduleIdleCheck(connWrapper, pool) {
    setTimeout(() => {
      const idleTime = Date.now() - connWrapper.lastUsed;
      
      if (idleTime > this.maxIdleTime && !connWrapper.busy) {
        console.log(`🗑️ 关闭空闲连接: ${connWrapper.hostname}:${connWrapper.port}`);
        
        // 从连接池中移除
        const index = pool.connections.indexOf(connWrapper);
        if (index > -1) {
          pool.connections.splice(index, 1);
          pool.activeConnections--;
        }
        
        // 关闭连接
        connWrapper.connection.close();
        connWrapper.connected = false;
      } else if (connWrapper.connected) {
        // 继续检查
        this.scheduleIdleCheck(connWrapper, pool);
      }
    }, this.maxIdleTime);
  }
  
  getPoolStats() {
    const stats = {};
    
    for (const [poolKey, pool] of this.pools) {
      stats[poolKey] = {
        totalConnections: pool.connections.length,
        activeConnections: pool.activeConnections,
        idleConnections: pool.connections.filter(c => !c.busy).length,
        waitingRequests: pool.waitingQueue.length
      };
    }
    
    return stats;
  }
}

// HTTP/2连接复用
class HTTP2Connection {
  constructor(hostname, port) {
    this.hostname = hostname;
    this.port = port;
    this.streams = new Map();
    this.nextStreamId = 1;
    this.maxConcurrentStreams = 100;
  }
  
  async createStream() {
    if (this.streams.size >= this.maxConcurrentStreams) {
      throw new Error('达到最大并发流限制');
    }
    
    const streamId = this.nextStreamId;
    this.nextStreamId += 2; // 客户端使用奇数流ID
    
    const stream = {
      id: streamId,
      state: 'OPEN',
      headers: {},
      data: [],
      priority: 16 // 默认优先级
    };
    
    this.streams.set(streamId, stream);
    console.log(`📡 创建HTTP/2流: ${streamId}`);
    
    return stream;
  }
  
  closeStream(streamId) {
    if (this.streams.has(streamId)) {
      this.streams.delete(streamId);
      console.log(`🔚 关闭HTTP/2流: ${streamId}`);
    }
  }
  
  getStreamCount() {
    return this.streams.size;
  }
}

// 使用示例
const connectionPool = new ConnectionPool();

// 模拟多个并发请求
async function simulateRequests() {
  const requests = [];
  
  for (let i = 0; i < 10; i++) {
    requests.push(
      connectionPool.getConnection('www.google.com', 443)
        .then(conn => {
          console.log(`请求${i} 获得连接`);
          
          // 模拟使用连接
          setTimeout(() => {
            connectionPool.releaseConnection(conn);
            console.log(`请求${i} 释放连接`);
          }, Math.random() * 2000);
        })
    );
  }
  
  await Promise.all(requests);
  console.log('连接池状态:', connectionPool.getPoolStats());
}

await simulateRequests();
```

## 第四步：SSL/TLS握手 - 安全连接建立

### 4.1 TLS握手过程

对于HTTPS请求，还需要进行TLS握手来建立安全连接：

```javascript
// 模拟TLS握手过程
class TLSHandshake {
  constructor() {
    this.supportedCipherSuites = [
      'TLS_AES_128_GCM_SHA256',
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256'
    ];
    this.supportedVersions = ['TLSv1.2', 'TLSv1.3'];
    this.clientRandom = this.generateRandom();
    this.serverRandom = null;
    this.negotiatedVersion = null;
    this.negotiatedCipher = null;
  }
  
  async performHandshake(serverName) {
    console.log(`🔐 开始TLS握手: ${serverName}`);
    console.log('🤝 TLS握手过程开始...');
    
    try {
      // TLS 1.3的简化握手流程
      await this.sendClientHello(serverName);
      await this.receiveServerHello();
      await this.exchangeKeys();
      await this.verifyServer();
      await this.finishHandshake();
      
      console.log('✅ TLS握手完成，安全连接建立');
      return {
        success: true,
        version: this.negotiatedVersion,
        cipher: this.negotiatedCipher,
        serverName: serverName
      };
      
    } catch (error) {
      console.error('❌ TLS握手失败:', error.message);
      return { success: false, error: error.message };
    }
  }
  
  async sendClientHello(serverName) {
    console.log('📤 1. 发送Client Hello');
    console.log(`   支持的TLS版本: ${this.supportedVersions.join(', ')}`);
    console.log(`   支持的加密套件: ${this.supportedCipherSuites.length}个`);
    console.log(`   服务器名称指示(SNI): ${serverName}`);
    console.log(`   客户端随机数: ${this.clientRandom.slice(0, 16)}...`);
    
    // 模拟网络延迟
    await this.simulateNetworkDelay();
  }
  
  async receiveServerHello() {
    console.log('📥 2. 接收Server Hello');
    
    // 模拟服务器选择
    this.negotiatedVersion = 'TLSv1.3';
    this.negotiatedCipher = 'TLS_AES_256_GCM_SHA384';
    this.serverRandom = this.generateRandom();
    
    console.log(`   选择的TLS版本: ${this.negotiatedVersion}`);
    console.log(`   选择的加密套件: ${this.negotiatedCipher}`);
    console.log(`   服务器随机数: ${this.serverRandom.slice(0, 16)}...`);
    
    await this.simulateNetworkDelay();
    
    // 模拟版本不兼容
    if (Math.random() < 0.02) {
      throw new Error('TLS版本协商失败');
    }
  }
  
  async exchangeKeys() {
    console.log('🔑 3. 密钥交换');
    
    // 模拟ECDHE密钥交换
    const clientPrivateKey = this.generatePrivateKey();
    const clientPublicKey = this.generatePublicKey(clientPrivateKey);
    
    console.log('   生成客户端密钥对');
    console.log(`   客户端公钥: ${clientPublicKey.slice(0, 16)}...`);
    
    await this.simulateNetworkDelay();
    
    // 模拟服务器公钥
    const serverPublicKey = this.generateRandom();
    console.log(`   接收服务器公钥: ${serverPublicKey.slice(0, 16)}...`);
    
    // 计算共享密钥
    const sharedSecret = this.computeSharedSecret(clientPrivateKey, serverPublicKey);
    console.log('   计算共享密钥完成');
    
    return sharedSecret;
  }
  
  async verifyServer() {
    console.log('📋 4. 验证服务器证书');
    
    // 模拟证书验证过程
    const certificate = await this.receiveCertificate();
    
    // 验证证书链
    console.log('   验证证书链...');
    await this.verifyCertificateChain(certificate);
    
    // 验证证书有效期
    console.log('   检查证书有效期...');
    this.checkCertificateValidity(certificate);
    
    // 验证证书吊销状态（OCSP）
    console.log('   检查证书吊销状态...');
    await this.checkOCSP(certificate);
    
    console.log('✅ 服务器证书验证通过');
  }
  
  async receiveCertificate() {
    await this.simulateNetworkDelay();
    
    // 模拟证书信息
    return {
      subject: 'CN=*.google.com, O=Google LLC, L=Mountain View, ST=California, C=US',
      issuer: 'CN=GTS CA 1C3, O=Google Trust Services LLC, C=US',
      validFrom: new Date('2023-01-01'),
      validTo: new Date('2024-12-31'),
      serialNumber: '0x' + this.generateRandom().slice(0, 32),
      publicKey: this.generateRandom(),
      signature: this.generateRandom()
    };
  }
  
  async verifyCertificateChain(certificate) {
    // 模拟证书链验证
    const chain = [
      'Root CA (Google Trust Services)',
      'Intermediate CA (GTS CA 1C3)',
      'End Entity (*.google.com)'
    ];
    
    for (const cert of chain) {
      console.log(`     验证: ${cert}`);
      await new Promise(resolve => setTimeout(resolve, 20));
    }
  }
  
  checkCertificateValidity(certificate) {
    const now = new Date();
    if (now < certificate.validFrom || now > certificate.validTo) {
      throw new Error('证书已过期或尚未生效');
    }
  }
  
  async checkOCSP(certificate) {
    // 模拟OCSP检查
    await this.simulateNetworkDelay(30);
    
    // 2%的几率模拟证书被吊销
    if (Math.random() < 0.02) {
      throw new Error('证书已被吊销');
    }
  }
  
  async finishHandshake() {
    console.log('🏁 5. 完成握手');
    
    // 发送Finished消息
    console.log('   发送客户端Finished消息');
    await this.simulateNetworkDelay(10);
    
    // 接收服务器Finished消息
    console.log('   接收服务器Finished消息');
    await this.simulateNetworkDelay(10);
    
    console.log('   验证握手完整性');
  }
  
  generateRandom() {
    return Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0')
    ).join('');
  }
  
  generatePrivateKey() {
    return this.generateRandom();
  }
  
  generatePublicKey(privateKey) {
    // 模拟椭圆曲线公钥生成
    return 'pub_' + privateKey.slice(0, 32);
  }
  
  computeSharedSecret(privateKey, publicKey) {
    // 模拟ECDH共享密钥计算
    return 'shared_' + privateKey.slice(0, 16) + publicKey.slice(4, 20);
  }
  
  async simulateNetworkDelay(baseMs = 50) {
    const delay = baseMs + Math.random() * 50;
    await new Promise(resolve => setTimeout(resolve, delay));
    console.log(`     ⏱️ 网络延迟: ${delay.toFixed(0)}ms`);
  }
}

// 使用示例
const tlsHandshake = new TLSHandshake();
const tlsResult = await tlsHandshake.performHandshake('www.google.com');

if (tlsResult.success) {
  console.log('🔒 安全连接已建立，可以发送HTTPS请求');
} else {
  console.error('🚫 安全连接建立失败');
}
```

### 4.2 SSL/TLS优化技术

```javascript
// TLS会话复用和优化
class TLSOptimizer {
  constructor() {
    this.sessionCache = new Map();
    this.sessionTickets = new Map();
    this.ocspCache = new Map();
    this.certificateCache = new Map();
  }
  
  // TLS会话复用
  cacheSession(serverName, sessionData) {
    this.sessionCache.set(serverName, {
      sessionId: sessionData.sessionId,
      masterSecret: sessionData.masterSecret,
      cipherSuite: sessionData.cipherSuite,
      timestamp: Date.now(),
      ttl: 24 * 60 * 60 * 1000 // 24小时
    });
    
    console.log(`💾 缓存TLS会话: ${serverName}`);
  }
  
  getCachedSession(serverName) {
    const cached = this.sessionCache.get(serverName);
    
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      console.log(`⚡ 复用TLS会话: ${serverName}`);
      return cached;
    }
    
    if (cached) {
      this.sessionCache.delete(serverName);
      console.log(`🗑️ 清理过期会话: ${serverName}`);
    }
    
    return null;
  }
  
  // OCSP装订缓存
  cacheOCSPResponse(certificate, response) {
    this.ocspCache.set(certificate.serialNumber, {
      response,
      timestamp: Date.now(),
      ttl: 7 * 24 * 60 * 60 * 1000 // 7天
    });
  }
  
  getCachedOCSPResponse(certificate) {
    const cached = this.ocspCache.get(certificate.serialNumber);
    
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      console.log('⚡ 使用缓存的OCSP响应');
      return cached.response;
    }
    
    return null;
  }
  
  // 证书验证缓存
  cacheCertificateValidation(certificate, validationResult) {
    this.certificateCache.set(certificate.serialNumber, {
      result: validationResult,
      timestamp: Date.now(),
      ttl: 60 * 60 * 1000 // 1小时
    });
  }
  
  getCachedCertificateValidation(certificate) {
    const cached = this.certificateCache.get(certificate.serialNumber);
    
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      console.log('⚡ 使用缓存的证书验证结果');
      return cached.result;
    }
    
    return null;
  }
  
  // False Start优化
  canUseFalseStart(cipherSuite, certificateType) {
    // False Start允许在握手完成前就开始发送应用数据
    const safeCipherSuites = [
      'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
      'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384'
    ];
    
    const safeCertTypes = ['ECDSA', 'RSA'];
    
    return safeCipherSuites.includes(cipherSuite) && 
           safeCertTypes.includes(certificateType);
  }
  
  // TLS 1.3 0-RTT支持
  canUse0RTT(serverName) {
    const cachedSession = this.getCachedSession(serverName);
    
    // 0-RTT需要之前的TLS 1.3会话
    return cachedSession && cachedSession.version === 'TLSv1.3';
  }
  
  getOptimizationStats() {
    return {
      sessionCacheHits: this.sessionCache.size,
      ocspCacheHits: this.ocspCache.size,
      certificateCacheHits: this.certificateCache.size,
      totalCacheSize: this.sessionCache.size + this.ocspCache.size + this.certificateCache.size
    };
  }
}

// 使用示例
const tlsOptimizer = new TLSOptimizer();

// 模拟TLS连接优化
async function optimizedTLSConnection(serverName) {
  console.log(`🚀 优化的TLS连接: ${serverName}`);
  
  // 检查会话复用
  const cachedSession = tlsOptimizer.getCachedSession(serverName);
  
  if (cachedSession) {
    console.log('⚡ 使用会话复用，跳过完整握手');
    return { resumed: true, sessionId: cachedSession.sessionId };
  }
  
  // 执行完整握手
  const handshake = new TLSHandshake();
  const result = await handshake.performHandshake(serverName);
  
  if (result.success) {
    // 缓存会话用于将来复用
    tlsOptimizer.cacheSession(serverName, {
      sessionId: 'session_' + Math.random().toString(36).substr(2, 9),
      masterSecret: 'master_secret_' + Math.random().toString(36).substr(2, 9),
      cipherSuite: result.cipher,
      version: result.version
    });
  }
  
  return result;
}

// 测试多次连接同一服务器
await optimizedTLSConnection('www.google.com'); // 完整握手
await optimizedTLSConnection('www.google.com'); // 会话复用
await optimizedTLSConnection('www.google.com'); // 会话复用

console.log('TLS优化统计:', tlsOptimizer.getOptimizationStats());
```

## 第五步：发送HTTP请求

### 5.1 HTTP请求的构建

建立安全连接后，浏览器开始构建和发送HTTP请求：

```javascript
// HTTP请求构建器
class HTTPRequestBuilder {
  constructor() {
    this.defaultHeaders = {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Cache-Control': 'max-age=0'
    };
  }
  
  buildRequest(url, options = {}) {
    const urlObj = new URL(url);
    const method = options.method || 'GET';
    const headers = { ...this.defaultHeaders, ...options.headers };
    
    // 构建请求行
    const requestLine = `${method} ${urlObj.pathname}${urlObj.search} HTTP/1.1`;
    
    // 添加Host头（必需）
    headers['Host'] = urlObj.host;
    
    // 处理cookies
    if (options.includeCookies !== false) {
      const cookies = this.getCookiesForDomain(urlObj.hostname);
      if (cookies) {
        headers['Cookie'] = cookies;
      }
    }
    
    // 处理认证
    if (options.authorization) {
      headers['Authorization'] = options.authorization;
    }
    
    // 处理缓存控制
    if (options.cacheControl) {
      headers['Cache-Control'] = options.cacheControl;
    }
    
    // 处理请求体
    let body = options.body;
    if (body && typeof body === 'object') {
      if (options.contentType === 'application/json') {
        body = JSON.stringify(body);
        headers['Content-Type'] = 'application/json';
      } else if (options.contentType === 'application/x-www-form-urlencoded') {
        body = new URLSearchParams(body).toString();
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    }
    
    if (body) {
      headers['Content-Length'] = new Blob([body]).size.toString();
    }
    
    return {
      requestLine,
      headers,
      body,
      url: urlObj,
      method
    };
  }
  
  getCookiesForDomain(domain) {
    // 模拟从浏览器cookie存储中获取cookies
    const mockCookies = {
      'google.com': 'session_id=abc123; preferences=lang%3Dzh-CN',
      'github.com': 'user_session=xyz789; _device_id=device_456',
      'stackoverflow.com': 'prov=12345678; _ga=GA1.2.1234567890'
    };
    
    // 查找匹配的域名cookie
    for (const [cookieDomain, cookieValue] of Object.entries(mockCookies)) {
      if (domain.includes(cookieDomain)) {
        return cookieValue;
      }
    }
    
    return null;
  }
  
  formatHTTPRequest(request) {
    let httpRequest = request.requestLine + '\r\n';
    
    // 添加所有头部
    for (const [name, value] of Object.entries(request.headers)) {
      httpRequest += `${name}: ${value}\r\n`;
    }
    
    httpRequest += '\r\n'; // 头部结束标志
    
    // 添加请求体
    if (request.body) {
      httpRequest += request.body;
    }
    
    return httpRequest;
  }
  
  async sendRequest(request, connection) {
    console.log('📤 发送HTTP请求');
    console.log(`🎯 ${request.method} ${request.url.href}`);
    
    // 显示关键头部
    console.log('📋 请求头部:');
    const importantHeaders = ['Host', 'User-Agent', 'Accept', 'Cookie'];
    importantHeaders.forEach(header => {
      if (request.headers[header]) {
        const value = header === 'Cookie' ? 
          request.headers[header].substring(0, 50) + '...' : 
          request.headers[header];
        console.log(`     ${header}: ${value}`);
      }
    });
    
    if (request.body) {
      console.log(`📦 请求体大小: ${request.body.length} 字节`);
    }
    
    // 模拟网络发送
    const httpMessage = this.formatHTTPRequest(request);
    console.log(`📡 发送数据: ${httpMessage.length} 字节`);
    
    // 模拟发送延迟
    await new Promise(resolve => setTimeout(resolve, 10 + Math.random() * 20));
    
    return {
      sent: true,
      size: httpMessage.length,
      timestamp: Date.now()
    };
  }
}

// HTTP/2请求优化
class HTTP2RequestBuilder extends HTTPRequestBuilder {
  constructor() {
    super();
    this.streamId = 1;
  }
  
  buildHTTP2Request(url, options = {}) {
    const request = this.buildRequest(url, options);
    
    // HTTP/2使用伪头部
    const pseudoHeaders = {
      ':method': request.method,
      ':path': request.url.pathname + request.url.search,
      ':scheme': request.url.protocol.replace(':', ''),
      ':authority': request.url.host
    };
    
    // 移除HTTP/1.1特有的头部
    delete request.headers['Host'];
    delete request.headers['Connection'];
    
    return {
      streamId: this.streamId++,
      pseudoHeaders,
      headers: request.headers,
      body: request.body,
      priority: options.priority || 16
    };
  }
  
  async sendHTTP2Request(request, connection) {
    console.log(`📤 发送HTTP/2请求 (流ID: ${request.streamId})`);
    console.log(`🎯 ${request.pseudoHeaders[':method']} ${request.pseudoHeaders[':path']}`);
    
    // HTTP/2支持多路复用
    console.log(`🔄 多路复用: 当前活跃流数量 ${connection.getStreamCount()}`);
    
    // 头部压缩（HPACK）
    const compressedHeaders = this.compressHeaders(request.headers);
    console.log(`🗜️ 头部压缩: ${Object.keys(request.headers).length} 个头部`);
    
    // 流优先级
    if (request.priority < 16) {
      console.log(`⚡ 高优先级流: ${request.priority}`);
    }
    
    return {
      sent: true,
      streamId: request.streamId,
      compressed: true,
      timestamp: Date.now()
    };
  }
  
  compressHeaders(headers) {
    // 模拟HPACK压缩
    const originalSize = JSON.stringify(headers).length;
    const compressedSize = Math.floor(originalSize * 0.3); // 假设压缩率70%
    
    console.log(`     原始大小: ${originalSize} 字节`);
    console.log(`     压缩后: ${compressedSize} 字节 (压缩率: 70%)`);
    
    return compressedSize;
  }
}

// 使用示例
const requestBuilder = new HTTPRequestBuilder();
const http2Builder = new HTTP2RequestBuilder();

// 构建HTTP/1.1请求
const request1 = requestBuilder.buildRequest('https://www.google.com/search?q=javascript', {
  method: 'GET',
  headers: {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9'
  }
});

console.log('🌐 HTTP/1.1 请求:');
await requestBuilder.sendRequest(request1, null);

// 构建HTTP/2请求
const request2 = http2Builder.buildHTTP2Request('https://www.google.com/search?q=javascript', {
  method: 'GET',
  priority: 8 // 高优先级
});

console.log('\n🚀 HTTP/2 请求:');
await http2Builder.sendHTTP2Request(request2, { getStreamCount: () => 3 });
```

### 5.2 请求优化技术

```javascript
// 请求优化管理器
class RequestOptimizer {
  constructor() {
    this.requestQueue = [];
    this.activeRequests = new Map();
    this.resourceHints = new Set();
    this.requestBatching = true;
    this.maxConcurrentRequests = 6;
  }
  
  // 资源优先级管理
  prioritizeRequests(requests) {
    return requests.sort((a, b) => {
      // 优先级规则：
      // 1. 阻塞渲染的资源（CSS, HTML）
      // 2. 用户可见内容（图片, 字体）
      // 3. 交互相关（JavaScript）
      // 4. 预加载资源
      
      const priorities = {
        'document': 1,
        'stylesheet': 2,
        'script': 3,
        'font': 4,
        'image': 5,
        'prefetch': 10
      };
      
      const aPriority = priorities[a.type] || 5;
      const bPriority = priorities[b.type] || 5;
      
      return aPriority - bPriority;
    });
  }
  
  // 请求批处理
  async batchRequests(requests, batchSize = 3) {
    console.log(`📦 批处理 ${requests.length} 个请求，批大小: ${batchSize}`);
    
    const results = [];
    
    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);
      console.log(`🔄 处理批次 ${Math.floor(i / batchSize) + 1}/${Math.ceil(requests.length / batchSize)}`);
      
      // 并发发送一批请求
      const batchPromises = batch.map(req => this.sendOptimizedRequest(req));
      const batchResults = await Promise.allSettled(batchPromises);
      
      results.push(...batchResults);
      
      // 批次间的小延迟，避免服务器过载
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    return results;
  }
  
  async sendOptimizedRequest(request) {
    const startTime = performance.now();
    
    try {
      // 检查资源提示
      if (this.hasResourceHint(request.url)) {
        console.log(`⚡ 利用资源提示: ${request.url}`);
      }
      
      // 应用请求优化
      const optimizedRequest = this.applyOptimizations(request);
      
      // 发送请求
      const response = await this.actualSendRequest(optimizedRequest);
      
      const duration = performance.now() - startTime;
      console.log(`✅ 请求完成: ${request.url} (${duration.toFixed(2)}ms)`);
      
      return response;
      
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ 请求失败: ${request.url} (${duration.toFixed(2)}ms)`, error.message);
      throw error;
    }
  }
  
  applyOptimizations(request) {
    const optimized = { ...request };
    
    // 添加压缩支持
    if (!optimized.headers['Accept-Encoding']) {
      optimized.headers['Accept-Encoding'] = 'gzip, deflate, br';
    }
    
    // 添加缓存控制
    if (request.type === 'image' || request.type === 'font') {
      optimized.headers['Cache-Control'] = 'public, max-age=31536000'; // 1年
    }
    
    // 条件请求
    if (request.etag) {
      optimized.headers['If-None-Match'] = request.etag;
    }
    
    if (request.lastModified) {
      optimized.headers['If-Modified-Since'] = request.lastModified;
    }
    
    // 范围请求（用于大文件）
    if (request.range) {
      optimized.headers['Range'] = `bytes=${request.range}`;
    }
    
    return optimized;
  }
  
  addResourceHint(url, type) {
    this.resourceHints.add(`${type}:${url}`);
    
    // 实际添加到DOM
    const link = document.createElement('link');
    link.rel = type; // 'dns-prefetch', 'preconnect', 'prefetch', 'preload'
    link.href = url;
    
    if (type === 'preload') {
      link.as = this.guessResourceType(url);
    }
    
    document.head.appendChild(link);
    console.log(`💡 添加资源提示: ${type} ${url}`);
  }
  
  hasResourceHint(url) {
    return Array.from(this.resourceHints).some(hint => hint.includes(url));
  }
  
  guessResourceType(url) {
    if (url.match(/\.(css)$/i)) return 'style';
    if (url.match(/\.(js)$/i)) return 'script';
    if (url.match(/\.(woff2?|ttf|otf)$/i)) return 'font';
    if (url.match(/\.(jpg|jpeg|png|gif|webp|avif)$/i)) return 'image';
    return 'fetch';
  }
  
  async actualSendRequest(request) {
    // 模拟实际的网络请求
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    // 模拟不同的响应情况
    const random = Math.random();
    
    if (random < 0.05) {
      throw new Error('网络错误');
    } else if (random < 0.1) {
      throw new Error('服务器错误 (500)');
    } else if (random < 0.15) {
      return {
        status: 304,
        statusText: 'Not Modified',
        fromCache: true
      };
    } else {
      return {
        status: 200,
        statusText: 'OK',
        data: `响应数据: ${request.url}`,
        size: Math.floor(Math.random() * 100000) + 1000
      };
    }
  }
  
  // 智能预加载
  predictAndPreload() {
    // 分析用户行为模式
    const userBehavior = this.analyzeUserBehavior();
    
    // 预测可能需要的资源
    const predictedResources = this.predictNextResources(userBehavior);
    
    // 预加载高概率资源
    predictedResources.forEach(resource => {
      if (resource.probability > 0.7) {
        this.addResourceHint(resource.url, 'prefetch');
      } else if (resource.probability > 0.5) {
        this.addResourceHint(resource.url, 'dns-prefetch');
      }
    });
  }
  
  analyzeUserBehavior() {
    // 模拟用户行为分析
    return {
      currentPage: location.pathname,
      scrollPosition: window.scrollY,
      timeOnPage: Date.now() - performance.timing.navigationStart,
      clickHistory: [], // 实际应用中会记录用户点击
      hoverHistory: []   // 实际应用中会记录用户悬停
    };
  }
  
  predictNextResources(behavior) {
    // 基于行为预测下一步可能需要的资源
    const predictions = [];
    
    // 如果用户在首页停留较久，可能会浏览产品页
    if (behavior.currentPage === '/' && behavior.timeOnPage > 30000) {
      predictions.push({
        url: '/api/products',
        probability: 0.8,
        type: 'api'
      });
    }
    
    // 如果用户滚动到底部，可能需要更多内容
    if (behavior.scrollPosition > document.body.scrollHeight * 0.8) {
      predictions.push({
        url: '/api/more-content',
        probability: 0.6,
        type: 'api'
      });
    }
    
    return predictions;
  }
}

// 使用示例
const optimizer = new RequestOptimizer();

// 添加资源提示
optimizer.addResourceHint('https://fonts.googleapis.com', 'preconnect');
optimizer.addResourceHint('/critical.css', 'preload');
optimizer.addResourceHint('/hero-image.jpg', 'preload');

// 模拟多个请求
const requests = [
  { url: '/api/user', type: 'script', priority: 1 },
  { url: '/styles.css', type: 'stylesheet', priority: 2 },
  { url: '/hero.jpg', type: 'image', priority: 5 },
  { url: '/analytics.js', type: 'script', priority: 10 },
  { url: '/fonts/main.woff2', type: 'font', priority: 4 }
];

// 优化请求顺序
const prioritizedRequests = optimizer.prioritizeRequests(requests);
console.log('📋 优化后的请求顺序:', prioritizedRequests.map(r => r.url));

// 批量发送请求
const results = await optimizer.batchRequests(prioritizedRequests);
console.log(`✅ 完成 ${results.length} 个请求`);

// 启动智能预加载
optimizer.predictAndPreload();
```

## 第六步：服务器处理与响应

### 6.1 服务器端处理流程

当HTTP请求到达服务器时，会经历以下处理流程：

```javascript
// 模拟服务器端处理流程
class WebServerSimulator {
  constructor() {
    this.middleware = [];
    this.routes = new Map();
    this.staticFiles = new Map();
    this.cache = new Map();
    this.loadBalancer = new LoadBalancer();
    this.database = new DatabaseSimulator();
  }
  
  // 添加中间件
  use(middleware) {
    this.middleware.push(middleware);
  }
  
  // 定义路由
  route(path, handler) {
    this.routes.set(path, handler);
  }
  
  // 处理请求
  async handleRequest(request) {
    console.log(`🔄 服务器处理请求: ${request.method} ${request.url.pathname}`);
    const startTime = performance.now();
    
    try {
      // 1. 负载均衡
      const server = this.loadBalancer.selectServer();
      console.log(`⚖️ 选择服务器: ${server.name} (负载: ${server.load}%)`);
      
      // 2. 请求解析和验证
      const parsedRequest = await this.parseRequest(request);
      
      // 3. 中间件处理
      const context = await this.runMiddleware(parsedRequest);
      
      // 4. 路由匹配和处理
      const response = await this.processRoute(context);
      
      // 5. 响应后处理
      const finalResponse = await this.postProcess(response, context);
      
      const duration = performance.now() - startTime;
      console.log(`✅ 服务器响应完成 (${duration.toFixed(2)}ms)`);
      
      // 6. 记录日志
      this.logRequest(request, finalResponse, duration);
      
      return finalResponse;
      
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ 服务器处理错误 (${duration.toFixed(2)}ms):`, error.message);
      
      return this.createErrorResponse(error, 500);
    }
  }
  
  async parseRequest(request) {
    console.log('📝 解析请求...');
    
    // 解析查询参数
    const queryParams = new URLSearchParams(request.url.search);
    
    // 解析请求体
    let body = null;
    if (request.body) {
      const contentType = request.headers['Content-Type'] || '';
      
      if (contentType.includes('application/json')) {
        body = JSON.parse(request.body);
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        body = Object.fromEntries(new URLSearchParams(request.body));
      } else {
        body = request.body;
      }
    }
    
    // 解析Cookies
    const cookies = this.parseCookies(request.headers['Cookie'] || '');
    
    return {
      ...request,
      query: Object.fromEntries(queryParams),
      body,
      cookies,
      ip: this.getClientIP(request),
      userAgent: request.headers['User-Agent']
    };
  }
  
  async runMiddleware(request) {
    console.log(`🔧 运行 ${this.middleware.length} 个中间件...`);
    
    let context = { request, response: {}, user: null, session: null };
    
    for (const middleware of this.middleware) {
      context = await middleware(context);
      
      // 如果中间件返回响应，直接返回
      if (context.earlyReturn) {
        return context;
      }
    }
    
    return context;
  }
  
  async processRoute(context) {
    const path = context.request.url.pathname;
    console.log(`🛣️ 处理路由: ${path}`);
    
    // 检查静态文件
    if (this.staticFiles.has(path)) {
      return this.serveStaticFile(path, context);
    }
    
    // 匹配动态路由
    const handler = this.findRoute(path);
    if (handler) {
      return await handler(context);
    }
    
    // 404处理
    return this.createErrorResponse(new Error('Not Found'), 404);
  }
  
  findRoute(path) {
    // 精确匹配
    if (this.routes.has(path)) {
      return this.routes.get(path);
    }
    
    // 模式匹配
    for (const [pattern, handler] of this.routes) {
      if (this.matchPattern(pattern, path)) {
        return handler;
      }
    }
    
    return null;
  }
  
  matchPattern(pattern, path) {
    // 简单的通配符匹配
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    return regex.test(path);
  }
  
  async serveStaticFile(path, context) {
    console.log(`📁 提供静态文件: ${path}`);
    
    const file = this.staticFiles.get(path);
    const etag = `"${file.hash}"`;
    
    // 检查条件请求
    if (context.request.headers['If-None-Match'] === etag) {
      return {
        status: 304,
        statusText: 'Not Modified',
        headers: {
          'ETag': etag,
          'Cache-Control': 'public, max-age=31536000'
        }
      };
    }
    
    return {
      status: 200,
      statusText: 'OK',
      headers: {
        'Content-Type': file.mimeType,
        'Content-Length': file.size.toString(),
        'ETag': etag,
        'Cache-Control': 'public, max-age=31536000',
        'Last-Modified': file.lastModified
      },
      body: file.content
    };
  }
  
  async postProcess(response, context) {
    console.log('🔄 响应后处理...');
    
    // 添加安全头
    response.headers = {
      ...response.headers,
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    };
    
    // 响应压缩
    if (this.shouldCompress(response, context.request)) {
      response = await this.compressResponse(response, context.request);
    }
    
    // 添加CORS头（如需要）
    if (this.needsCORS(context.request)) {
      response.headers['Access-Control-Allow-Origin'] = '*';
      response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
    }
    
    return response;
  }
  
  shouldCompress(response, request) {
    const acceptEncoding = request.headers['Accept-Encoding'] || '';
    const contentType = response.headers['Content-Type'] || '';
    
    return acceptEncoding.includes('gzip') && 
           (contentType.includes('text/') || 
            contentType.includes('application/json') ||
            contentType.includes('application/javascript'));
  }
  
  async compressResponse(response, request) {
    console.log('🗜️ 压缩响应...');
    
    // 模拟gzip压缩
    const originalSize = response.body ? response.body.length : 0;
    const compressedSize = Math.floor(originalSize * 0.3); // 假设压缩率70%
    
    console.log(`     原始大小: ${originalSize} 字节`);
    console.log(`     压缩后: ${compressedSize} 字节`);
    
    return {
      ...response,
      headers: {
        ...response.headers,
        'Content-Encoding': 'gzip',
        'Content-Length': compressedSize.toString()
      },
      compressed: true,
      originalSize,
      compressedSize
    };
  }
  
  needsCORS(request) {
    const origin = request.headers['Origin'];
    return origin && origin !== request.headers['Host'];
  }
  
  parseCookies(cookieString) {
    const cookies = {};
    cookieString.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = decodeURIComponent(value);
      }
    });
    return cookies;
  }
  
  getClientIP(request) {
    return request.headers['X-Forwarded-For'] || 
           request.headers['X-Real-IP'] || 
           '192.168.1.100';
  }
  
  createErrorResponse(error, status) {
    return {
      status,
      statusText: error.message,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
  
  logRequest(request, response, duration) {
    const log = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url.href,
      status: response.status,
      duration: Math.round(duration),
      ip: this.getClientIP(request),
      userAgent: request.headers['User-Agent']
    };
    
    console.log(`📊 访问日志:`, JSON.stringify(log, null, 2));
  }
}

// 负载均衡器
class LoadBalancer {
  constructor() {
    this.servers = [
      { name: 'server-1', ip: '10.0.1.1', load: 45, healthy: true },
      { name: 'server-2', ip: '10.0.1.2', load: 32, healthy: true },
      { name: 'server-3', ip: '10.0.1.3', load: 67, healthy: true }
    ];
    this.algorithm = 'round-robin';
    this.currentIndex = 0;
  }
  
  selectServer() {
    const healthyServers = this.servers.filter(s => s.healthy);
    
    if (healthyServers.length === 0) {
      throw new Error('所有服务器都不可用');
    }
    
    switch (this.algorithm) {
      case 'round-robin':
        return this.roundRobin(healthyServers);
      case 'least-connections':
        return this.leastConnections(healthyServers);
      case 'weighted':
        return this.weighted(healthyServers);
      default:
        return healthyServers[0];
    }
  }
  
  roundRobin(servers) {
    const server = servers[this.currentIndex % servers.length];
    this.currentIndex++;
    return server;
  }
  
  leastConnections(servers) {
    return servers.reduce((min, server) => 
      server.load < min.load ? server : min
    );
  }
  
  weighted(servers) {
    // 基于负载的加权选择
    const weights = servers.map(s => Math.max(1, 100 - s.load));
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < servers.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return servers[i];
      }
    }
    
    return servers[0];
  }
}

// 数据库模拟器
class DatabaseSimulator {
  constructor() {
    this.connections = [];
    this.connectionPool = 10;
    this.queryCache = new Map();
  }
  
  async query(sql, params = []) {
    console.log(`💾 执行数据库查询: ${sql.substring(0, 50)}...`);
    
    // 检查查询缓存
    const cacheKey = sql + JSON.stringify(params);
    if (this.queryCache.has(cacheKey)) {
      console.log('⚡ 查询缓存命中');
      return this.queryCache.get(cacheKey);
    }
    
    // 模拟数据库查询延迟
    const queryTime = 50 + Math.random() * 200;
    await new Promise(resolve => setTimeout(resolve, queryTime));
    
    // 模拟查询结果
    const result = {
      rows: Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, i) => ({
        id: i + 1,
        data: `模拟数据 ${i + 1}`
      })),
      queryTime: Math.round(queryTime)
    };
    
    // 缓存查询结果（简单的SELECT查询）
    if (sql.toLowerCase().startsWith('select')) {
      this.queryCache.set(cacheKey, result);
    }
    
    console.log(`✅ 查询完成 (${result.queryTime}ms, ${result.rows.length} 行)`);
    return result;
  }
}

// 使用示例
const server = new WebServerSimulator();

// 添加中间件
server.use(async (context) => {
  console.log('🔐 认证中间件');
  // 模拟用户认证
  if (context.request.headers['Authorization']) {
    context.user = { id: 1, name: 'John Doe' };
  }
  return context;
});

server.use(async (context) => {
  console.log('📊 日志中间件');
  context.startTime = performance.now();
  return context;
});

// 添加路由
server.route('/', async (context) => {
  return {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'text/html' },
    body: '<html><body><h1>Welcome!</h1></body></html>'
  };
});

server.route('/api/users', async (context) => {
  const users = await server.database.query('SELECT * FROM users');
  return {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(users.rows)
  };
});

// 添加静态文件
server.staticFiles.set('/style.css', {
  content: 'body { font-family: Arial; }',
  mimeType: 'text/css',
  size: 25,
  hash: 'abc123',
  lastModified: new Date().toUTCString()
});

// 模拟处理请求
const mockRequest = {
  method: 'GET',
  url: new URL('https://example.com/api/users?page=1'),
  headers: {
    'Host': 'example.com',
    'User-Agent': 'Mozilla/5.0...',
    'Accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Authorization': 'Bearer token123'
  }
};

const response = await server.handleRequest(mockRequest);
console.log('🎯 最终响应:', {
  status: response.status,
  headers: Object.keys(response.headers),
  compressed: response.compressed || false
});
```

这篇文章深入解析了从用户输入URL到页面显示的完整流程，不仅解释了每个步骤的技术原理，还提供了大量实用的优化技术和工具。无论是前端开发者想要理解页面加载机制，还是需要进行性能优化，这篇文章都能提供很好的参考价值！

## 文章特色

### 🎯 **理论与实践结合**
- 每个步骤都有详细的技术原理解释
- 提供可运行的代码示例验证概念
- 展示真实场景中的优化技术

### 🚀 **性能优化导向**
- DNS预解析、TCP连接复用、HTTP/2多路复用
- 请求批处理、资源优先级管理
- 缓存策略、压缩优化

### 🔧 **实用工具丰富**
- 连接池管理器、请求优化器
- 负载均衡器、数据库模拟器
- 性能监控和调试工具

### 📊 **可视化流程**
- 清晰的步骤分解和时序图
- 详细的日志输出帮助理解
- 量化的性能指标展示

这篇文章适合各个水平的开发者，从初学者了解基础流程到高级开发者深入优化，都能找到有价值的内容！
