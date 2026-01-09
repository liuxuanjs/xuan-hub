---
aliases: ["Web Worker", "Service Worker", "多线程"]
title: "Web Worker与多线程"
tags: ["浏览器", "多线程", "性能", "面试"]
updated: 2025-01-09
---

## 核心概念

**JS 单线程的问题**：复杂计算会阻塞 UI，导致页面卡顿。

**Web Worker**：在后台线程执行脚本，不阻塞主线程。

## Worker 类型对比

| 类型 | 作用域 | 生命周期 | 主要用途 |
|------|--------|---------|---------|
| **Dedicated Worker** | 单页面 | 页面关闭销毁 | 复杂计算 |
| **Shared Worker** | 多页面共享 | 所有连接关闭销毁 | 跨页面通信 |
| **Service Worker** | 全站点 | 独立于页面 | 离线缓存、推送 |

---

## Dedicated Worker（专用 Worker）

### 基本用法

```javascript
// main.js（主线程）
const worker = new Worker('worker.js');

// 发送消息
worker.postMessage({ type: 'calculate', data: [1, 2, 3, 4, 5] });

// 接收消息
worker.onmessage = (e) => {
  console.log('结果:', e.data);
};

// 错误处理
worker.onerror = (e) => {
  console.error('Worker 错误:', e.message);
};

// 终止 Worker
worker.terminate();
```

```javascript
// worker.js（Worker 线程）
self.onmessage = (e) => {
  const { type, data } = e.data;

  if (type === 'calculate') {
    // 复杂计算
    const result = data.reduce((sum, n) => sum + n, 0);
    self.postMessage(result);
  }
};
```

### 内联 Worker

```javascript
// 不需要单独文件
const workerCode = `
  self.onmessage = (e) => {
    const result = e.data * 2;
    self.postMessage(result);
  };
`;

const blob = new Blob([workerCode], { type: 'application/javascript' });
const worker = new Worker(URL.createObjectURL(blob));
```

### 数据传输

#### 结构化克隆（默认）

```javascript
// 数据会被复制
worker.postMessage({ arr: [1, 2, 3], obj: { a: 1 } });
```

**支持的类型**：基本类型、Array、Object、Date、Blob、ArrayBuffer、Map、Set

**不支持**：Function、DOM 节点、Error（部分浏览器）

#### Transferable Objects（转移所有权）

```javascript
// 大数据零拷贝传输
const buffer = new ArrayBuffer(1024 * 1024);  // 1MB

// 转移后，主线程无法再访问 buffer
worker.postMessage(buffer, [buffer]);

console.log(buffer.byteLength);  // 0（已转移）
```

**适用类型**：`ArrayBuffer`、`MessagePort`、`ImageBitmap`、`OffscreenCanvas`

### Worker 的限制

| 能做 | 不能做 |
|------|--------|
| 发起 AJAX/Fetch | 访问 DOM |
| 使用 WebSocket | 使用 window 对象 |
| 使用 IndexedDB | 使用 document |
| 使用 setTimeout/setInterval | 操作 UI |
| importScripts() 加载脚本 | 使用 localStorage |

---

## Shared Worker（共享 Worker）

### 特点

- 多个页面（同源）共享同一个 Worker 实例
- 适合跨标签页通信、共享状态

### 使用方法

```javascript
// page1.js 和 page2.js
const worker = new SharedWorker('shared-worker.js');

// 通过 port 通信
worker.port.start();  // 必须调用

worker.port.postMessage('Hello from page');

worker.port.onmessage = (e) => {
  console.log('收到:', e.data);
};
```

```javascript
// shared-worker.js
const connections = [];

self.onconnect = (e) => {
  const port = e.ports[0];
  connections.push(port);

  port.onmessage = (event) => {
    // 广播给所有连接
    connections.forEach(p => {
      p.postMessage(`广播: ${event.data}`);
    });
  };

  port.start();
};
```

### 调试

Chrome DevTools：`chrome://inspect/#workers`

---

## Service Worker

### 特点

- 独立于页面运行（页面关闭后仍可运行）
- 可拦截网络请求
- 支持推送通知
- 只能在 HTTPS 下使用

### 生命周期

```
注册 → 安装(installing) → 等待(waiting) → 激活(activated) → 运行
                                    │
                                    ↓
                              旧 SW 被替换
```

### 基本用法

```javascript
// main.js（注册）
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(reg => console.log('SW 注册成功'))
    .catch(err => console.error('SW 注册失败', err));
}
```

```javascript
// sw.js
const CACHE_NAME = 'v1';
const URLS_TO_CACHE = ['/', '/index.html', '/styles.css', '/app.js'];

// 安装：缓存资源
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .then(() => self.skipWaiting())  // 跳过等待，立即激活
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())  // 接管所有页面
  );
});

// 拦截请求
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
  );
});
```

### 缓存策略

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| **Cache First** | 优先缓存，没有再请求 | 静态资源 |
| **Network First** | 优先网络，失败用缓存 | API 数据 |
| **Stale While Revalidate** | 返回缓存同时更新 | 不敏感内容 |

```javascript
// Network First 示例
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // 请求成功，更新缓存
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))  // 网络失败，用缓存
  );
});
```

### 更新机制

```javascript
// 检测更新
navigator.serviceWorker.register('/sw.js').then(reg => {
  reg.addEventListener('updatefound', () => {
    const newWorker = reg.installing;
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // 新版本已安装，提示用户刷新
        showUpdateNotification();
      }
    });
  });
});

// 强制更新
navigator.serviceWorker.ready.then(reg => reg.update());
```

---

## Worklet

### 特点

- 轻量级 Worker，用于渲染管线
- 运行在渲染引擎内部

### 类型

| 类型 | 用途 |
|------|------|
| **Paint Worklet** | 自定义 CSS 绘制 |
| **Animation Worklet** | 高性能动画 |
| **Audio Worklet** | 音频处理 |
| **Layout Worklet** | 自定义布局（实验性） |

```javascript
// Paint Worklet 示例
// main.js
CSS.paintWorklet.addModule('paint-worklet.js');

// paint-worklet.js
registerPaint('myPaint', class {
  paint(ctx, size) {
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, size.width, size.height);
  }
});
```

```css
/* 使用 */
.element {
  background: paint(myPaint);
}
```

---

## 实际应用场景

### 1. 大数据计算

```javascript
// 主线程
const worker = new Worker('calc-worker.js');
worker.postMessage({ data: hugeArray });

worker.onmessage = (e) => {
  renderChart(e.data);  // UI 不会卡顿
};
```

### 2. 图片处理

```javascript
// worker.js
self.onmessage = async (e) => {
  const imageData = e.data;

  // 图片滤镜处理
  for (let i = 0; i < imageData.data.length; i += 4) {
    const gray = imageData.data[i] * 0.3 +
                 imageData.data[i + 1] * 0.59 +
                 imageData.data[i + 2] * 0.11;
    imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = gray;
  }

  self.postMessage(imageData, [imageData.data.buffer]);
};
```

### 3. PWA 离线应用

```javascript
// sw.js
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).catch(() => caches.match('/offline.html'))
    );
  }
});
```

---

## 常见面试题

### Q1：Web Worker 和 Service Worker 的区别？

| 对比项 | Web Worker | Service Worker |
|--------|------------|----------------|
| 生命周期 | 页面关闭销毁 | 独立于页面 |
| 主要用途 | 复杂计算 | 离线缓存、推送 |
| 能否访问 DOM | ❌ | ❌ |
| 能否拦截请求 | ❌ | ✅ |
| HTTPS 要求 | 否 | 是 |

### Q2：Worker 如何与主线程通信？

- **postMessage** + **onmessage** 事件
- 数据通过**结构化克隆**复制
- 大数据可用 **Transferable Objects** 零拷贝传输

### Q3：为什么 Worker 不能操作 DOM？

- DOM 操作必须是同步的（防止竞态）
- 多线程操作 DOM 会导致状态不一致
- Worker 设计目标是纯计算，不涉及 UI

### Q4：Service Worker 的缓存策略有哪些？

| 策略 | 特点 |
|------|------|
| Cache First | 优先缓存，适合静态资源 |
| Network First | 优先网络，适合 API |
| Stale While Revalidate | 先返回缓存，后台更新 |

### Q5：如何检测 Service Worker 更新？

监听 `updatefound` 事件，当新 Worker 安装完成且有旧 Worker 运行时，提示用户刷新。

## 相关文档

- [[浏览器多进程架构]]
- [[JavaScript事件循环深度解析：Event Loop全攻略]]
- [[前端缓存]]
