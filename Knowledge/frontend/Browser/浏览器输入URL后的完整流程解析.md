---
aliases: ["URL 输入流程", "从 URL 到页面", "浏览器加载流程"]
title: "浏览器输入URL后发生了什么"
tags: ["浏览器", "网络", "性能优化"]
updated: 2025-01-09
---

## 概览

从输入 URL 到页面显示，经历以下阶段：

```
URL 解析 → DNS 查询 → TCP 连接 → TLS 握手 → HTTP 请求 → 服务器响应 → 页面渲染
```

**总耗时参考**：500ms - 4s（取决于网络和页面复杂度）

| 阶段 | 耗时 | 可优化点 |
|------|------|----------|
| URL 解析 | 1-5ms | 缓存命中可跳过后续 |
| DNS 查询 | 0-300ms | dns-prefetch |
| TCP 连接 | 50-200ms | preconnect、Keep-Alive |
| TLS 握手 | 100-400ms | TLS 1.3、会话复用 |
| HTTP 请求/响应 | 50-500ms | HTTP/2、压缩、CDN |
| 页面渲染 | 100-2000ms | 关键渲染路径优化 |

## 第一步：URL 解析

### URL 结构

```
https://www.example.com:443/path/page?query=1&name=test#section
  │          │           │     │           │              │
协议      域名         端口   路径       查询参数        锚点
```

### 浏览器做了什么

1. **解析 URL 各部分**：协议、域名、端口、路径等
2. **补全不完整的 URL**：
   - 根据历史记录、书签匹配建议
   - 检查 HSTS 预加载列表决定是否升级为 HTTPS
   - 输入非 URL 文本 → 调用默认搜索引擎
3. **检查缓存**：按以下顺序查找
   - 内存缓存（最快）
   - 磁盘缓存
   - HTTP 缓存（检查是否过期）

如果缓存命中且未过期，直接使用缓存，跳过网络请求。

## 第二步：DNS 查询

### 什么是 DNS

DNS（Domain Name System）负责将域名转换为 IP 地址。

```
www.example.com  →  DNS 查询  →  93.184.216.34
```

### 查询顺序

```
1. 浏览器 DNS 缓存（几分钟到几小时）
   ↓ 未命中
2. 操作系统 DNS 缓存
   ↓ 未命中
3. 本地 hosts 文件
   ↓ 未命中
4. 路由器 DNS 缓存
   ↓ 未命中
5. ISP DNS 服务器
   ↓ 未命中
6. 递归查询（根服务器 → 顶级域服务器 → 权威服务器）
```

### 递归查询过程

以查询 `www.example.com` 为例：

```
本地 DNS 服务器
    ↓ 查询根服务器
根服务器：".com 由这些服务器管理"
    ↓ 查询 .com 服务器
.com 服务器："example.com 由这些服务器管理"
    ↓ 查询 example.com 权威服务器
权威服务器："www.example.com 的 IP 是 93.184.216.34"
```

### 耗时参考

| 情况 | 耗时 |
|------|------|
| 浏览器/系统缓存命中 | 0-1ms |
| 本地 DNS 服务器命中 | 20-50ms |
| 需要递归查询 | 100-300ms |

### 优化方法

```html
<!-- DNS 预解析：提前解析可能用到的域名 -->
<link rel="dns-prefetch" href="//api.example.com">
<link rel="dns-prefetch" href="//cdn.example.com">
<link rel="dns-prefetch" href="//fonts.googleapis.com">
```

**适用场景**：第三方资源域名（CDN、字体、API、统计等）

## 第三步：TCP 连接

### 为什么需要 TCP

TCP 提供可靠的数据传输，确保数据完整、有序地到达。

### 三次握手过程

```
客户端                          服务器
   │                              │
   │ ──── SYN（请求连接）────→    │  第1次：客户端请求建立连接
   │                              │
   │ ←── SYN+ACK（确认）────      │  第2次：服务器同意并请求反向连接
   │                              │
   │ ──── ACK（确认）────→        │  第3次：客户端确认
   │                              │
   │ ═════ 连接建立 ═════════     │
```

**为什么是三次？**
- 第1次：服务器知道客户端能发送
- 第2次：客户端知道服务器能收发
- 第3次：服务器知道客户端能接收

### 耗时

- **理想情况**：1.5 个 RTT（往返时延）
- **实际耗时**：50-200ms（取决于网络距离）

### 连接限制

| HTTP 版本 | 并发连接数 |
|----------|-----------|
| HTTP/1.1 | 每域名 6 个 |
| HTTP/2 | 单连接多路复用 |

### 优化方法

```html
<!-- 预连接：提前完成 DNS + TCP + TLS -->
<link rel="preconnect" href="https://api.example.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```

**Keep-Alive**：复用已建立的连接，避免重复握手

```http
Connection: keep-alive
Keep-Alive: timeout=5, max=100
```

## 第四步：TLS 握手（HTTPS）

### 为什么需要 TLS

TLS 提供加密传输，防止数据被窃听或篡改。

### 握手过程（简化版）

```
客户端                          服务器
   │                              │
   │ ── Client Hello ──→          │  发送支持的加密方式
   │                              │
   │ ←── Server Hello ──          │  选择加密方式 + 证书
   │                              │
   │ ── 密钥交换 + Finished ──→   │  生成会话密钥
   │                              │
   │ ═════ 加密通道建立 ═════     │
```

### TLS 版本对比

| 版本 | 握手次数 | 特点 |
|------|---------|------|
| TLS 1.2 | 2 RTT | 广泛支持 |
| TLS 1.3 | 1 RTT | 更快更安全，支持 0-RTT 恢复 |
| QUIC (HTTP/3) | 0-1 RTT | 首次 1 RTT，重连 0 RTT |

**HTTP/3 的优势**：基于 QUIC 协议，将 TLS 握手与连接建立合并，首次连接只需 1 RTT，重连时可实现 0-RTT（利用之前的会话票据直接发送数据）。

### 证书验证

浏览器会验证服务器证书：
1. 证书是否由受信任的 CA 签发
2. 证书是否在有效期内
3. 证书域名是否匹配
4. 证书是否被吊销

### 优化方法

- **升级 TLS 1.3**：握手更快
- **会话复用**：重用之前的会话，跳过完整握手
- **OCSP Stapling**：服务器预取证书状态，减少验证时间

## 第五步：HTTP 请求与响应

### 请求报文结构

```http
GET /path/page?query=1 HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...
Accept: text/html,application/xhtml+xml,application/xml;q=0.9
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,en;q=0.8
Cookie: session_id=abc123
Connection: keep-alive
```

### 响应报文结构

```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=UTF-8
Content-Length: 1234
Content-Encoding: gzip
Cache-Control: no-cache
ETag: "abc123"
Date: Mon, 09 Jan 2025 10:00:00 GMT

<!DOCTYPE html>
<html>...
```

### HTTP 版本对比

| 特性 | HTTP/1.1 | HTTP/2 | HTTP/3 |
|------|----------|--------|--------|
| 连接复用 | Keep-Alive | 多路复用 | 多路复用 |
| 头部压缩 | ❌ | HPACK | QPACK |
| 服务器推送 | ❌ | ✅ | ✅ |
| 队头阻塞 | 有 | TCP层有 | 无 |
| 传输协议 | TCP | TCP | QUIC (UDP) |

### 常见状态码

| 状态码 | 含义 |
|-------|------|
| 200 | 成功 |
| 301/302 | 重定向 |
| 304 | 资源未修改（使用缓存）|
| 404 | 资源不存在 |
| 500 | 服务器错误 |

### 优化方法

```html
<!-- 预加载关键资源 -->
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/main.js" as="script">
<link rel="preload" href="/hero.jpg" as="image">

<!-- 预取后续页面资源 -->
<link rel="prefetch" href="/next-page.js">
```

**服务端优化**：
- 开启 Gzip/Brotli 压缩
- 使用 CDN 加速
- 合理设置缓存头

## 第六步：页面渲染

### 渲染流程

```
        HTML
          ↓
      HTML 解析器
          ↓
       DOM 树  ←────────────┐
          ↓                 │
          ├── 遇到 CSS ──→ CSSOM 树
          │                 │
          ├── 遇到 JS ──→ 暂停解析，执行 JS
          │                 │
          ↓                 │
    DOM + CSSOM ────────────┘
          ↓
       渲染树（只包含可见元素）
          ↓
      布局（Layout）
          ↓
      绘制（Paint）
          ↓
      合成（Composite）
          ↓
       页面显示
```

### 关键概念

**DOM 树**：HTML 的结构化表示

```html
<html>
  <body>
    <div>Hello</div>
  </body>
</html>
```

**CSSOM 树**：CSS 的结构化表示，包含样式计算结果

**渲染树**：DOM + CSSOM 的结合，只包含需要显示的内容

### 阻塞行为

| 资源 | 阻塞 HTML 解析 | 阻塞渲染 |
|------|---------------|---------|
| CSS | ❌ | ✅ |
| 普通 JS | ✅ | ✅ |
| async JS | ❌ | ❌ |
| defer JS | ❌ | ❌ |

**CSS 阻塞渲染**：浏览器必须等 CSSOM 构建完成才能渲染，避免样式闪烁

**JS 阻塞解析**：JS 可能修改 DOM，所以要等 JS 执行完

### script 加载方式对比

```html
<!-- 阻塞解析，立即执行 -->
<script src="app.js"></script>

<!-- 不阻塞解析，下载完立即执行（顺序不保证）-->
<script src="app.js" async></script>

<!-- 不阻塞解析，DOM 解析完后按顺序执行 -->
<script src="app.js" defer></script>
```

| 方式 | 下载时机 | 执行时机 | 执行顺序 |
|------|---------|---------|---------|
| 普通 | 阻塞 | 立即 | 按出现顺序 |
| async | 并行 | 下载完立即 | 不保证 |
| defer | 并行 | DOM 解析后 | 按出现顺序 |

### 重排与重绘

**重排（Reflow）**：元素尺寸、位置变化，需要重新计算布局
**重绘（Repaint）**：元素外观变化（颜色等），不影响布局

```javascript
// ❌ 触发多次重排
element.style.width = '100px';
element.style.height = '100px';
element.style.margin = '10px';

// ✅ 批量修改，只触发一次重排
element.style.cssText = 'width:100px;height:100px;margin:10px';

// ✅ 使用 class 批量修改
element.className = 'new-style';

// ✅ 使用 transform 不触发重排（走合成层）
element.style.transform = 'translateX(100px)';

// ✅ 使用 requestAnimationFrame 合并多次 DOM 操作
requestAnimationFrame(() => {
  element.style.transform = 'translateX(100px)';
  element.style.opacity = '0.5';
});
```

```css
/* ✅ 使用 will-change 提前告知浏览器优化 */
.animated-element {
  will-change: transform, opacity;  /* 动画结束后移除 */
}
```

**触发重排的常见操作**：
- 读取布局属性：`offsetTop`、`scrollTop`、`clientWidth`、`getComputedStyle()`
- 修改几何属性：`width`、`height`、`margin`、`padding`
- DOM 结构变化：添加/删除节点

**优化技巧**：读写分离，先批量读取布局属性，再批量写入样式。

### 优化方法

```html
<!-- CSS 放头部，尽早加载 -->
<head>
  <link rel="stylesheet" href="style.css">
  <!-- 内联关键 CSS -->
  <style>
    .hero { /* 首屏关键样式 */ }
  </style>
</head>

<body>
  <!-- 内容 -->

  <!-- JS 放底部或使用 defer -->
  <script src="app.js" defer></script>
</body>
```

**图片优化**：

```html
<!-- 懒加载 -->
<img src="image.jpg" loading="lazy" alt="描述">

<!-- 响应式图片 -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="描述">
</picture>
```

## 性能监控

### 核心 Web 指标

| 指标 | 全称 | 含义 | 优秀标准 |
|------|------|------|----------|
| **LCP** | Largest Contentful Paint | 最大内容绘制完成 | < 2.5s |
| **INP** | Interaction to Next Paint | 交互响应延迟（全程） | < 200ms |
| **CLS** | Cumulative Layout Shift | 累计布局偏移（页面抖动） | < 0.1 |

> **注**：INP 于 2024 年 3 月正式替代 FID，衡量整个页面生命周期内的交互响应性，而非仅首次交互。

**其他常用指标**：

| 指标 | 含义 | 优秀标准 |
|------|------|----------|
| **FCP** | 首次内容绘制（文字/图片出现） | < 1.8s |
| **TTFB** | 首字节到达时间 | < 800ms |

### Performance API

```javascript
// 获取页面加载各阶段耗时
window.addEventListener('load', () => {
  const timing = performance.getEntriesByType('navigation')[0];

  console.log('DNS 查询:', timing.domainLookupEnd - timing.domainLookupStart, 'ms');
  console.log('TCP 连接:', timing.connectEnd - timing.connectStart, 'ms');
  console.log('TLS 握手:', timing.connectEnd - timing.secureConnectionStart, 'ms');
  console.log('首字节时间(TTFB):', timing.responseStart - timing.requestStart, 'ms');
  console.log('DOM 解析:', timing.domInteractive - timing.responseEnd, 'ms');
  console.log('页面加载:', timing.loadEventEnd - timing.startTime, 'ms');
});
```

### 命令行验证

```bash
# DNS 解析
dig example.com

# TLS 握手信息
openssl s_client -connect example.com:443 -servername example.com

# HTTP 响应头和 TTFB
curl -I -w "TTFB: %{time_starttransfer}s\n" https://example.com

# 网络路径
traceroute example.com
```

## 优化清单

### 网络层面

- [ ] DNS 预解析关键域名
- [ ] 预连接重要资源
- [ ] 启用 HTTP/2 或 HTTP/3
- [ ] 开启 Gzip/Brotli 压缩
- [ ] 使用 CDN 加速静态资源
- [ ] 升级 TLS 1.3

### 资源层面

- [ ] 静态资源使用强缓存 + 文件名哈希
- [ ] 预加载首屏关键资源
- [ ] 图片使用懒加载
- [ ] 使用现代图片格式（WebP/AVIF）
- [ ] 代码分割，按需加载

### 渲染层面

- [ ] CSS 放头部，JS 放底部或 defer
- [ ] 内联关键 CSS
- [ ] 减少 DOM 节点数量
- [ ] 避免频繁重排重绘
- [ ] 使用 transform 替代位置属性

## 相关文档

- [[前端缓存]]
- [[Chrome DevTools Performance]]
- [[JavaScript事件循环深度解析：Event Loop全攻略]]
