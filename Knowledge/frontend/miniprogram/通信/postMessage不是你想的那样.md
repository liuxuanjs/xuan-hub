---
aliases: ["postMessage坑点", "WebView消息传递"]
title: "postMessage 不是你想的那样"
tags: ["微信小程序", "WebView", "postMessage", "踩坑"]
updated: 2026-01-10
---

## 两种 postMessage

在小程序 + H5 + iframe 的架构里，有两种 `postMessage`，别搞混了：

| 类型 | 用途 | 特点 |
|------|------|------|
| `wx.miniProgram.postMessage` | H5 → 小程序 | **不是实时的** |
| `window.postMessage` | iframe ↔ 父页面 | 实时的 |

## 坑点1：wx.miniProgram.postMessage 不是实时的

很多人以为 H5 调用 `wx.miniProgram.postMessage` 后，小程序能立刻收到。

**实际上，小程序只在这几个时机才能收到消息：**
- 用户点击返回
- WebView 组件销毁
- 用户触发分享

这是官方文档明确说的，但很容易忽略。

### 这意味着什么

```typescript
// H5 发消息
wx.miniProgram.postMessage({
  data: { action: 'UPDATE_CART', count: 5 },
});

// 你以为小程序能立刻收到？不能。
```

**所以它只适合做这些事：**
- 分享信息（用户分享时才需要拿到）
- 页面退出时的状态同步

**不适合做这些事：**
- 实时通知小程序更新 UI
- 双向通信

### 那需要实时通信怎么办

跳转到小程序原生页面：

```typescript
// 用 navigateTo 代替 postMessage
wx.miniProgram.navigateTo({
  url: `/page/xxx/index?data=${encodeURIComponent(JSON.stringify(data))}`,
});
```

## 坑点2：消息是累积的

小程序 `onMessage` 收到的 `detail.data` 是一个**数组**，包含了所有历史消息，不是单条。

```tsx
// 小程序端
const onWebViewMessage = (e) => {
  console.log(e.detail.data);
  // 输出: [msg1, msg2, msg3, ...]  不是单条消息
};
```

**正确做法：取最后一条**

```tsx
const onWebViewMessage = (e) => {
  const messages = e.detail.data || [];
  const lastMessage = messages[messages.length - 1];  // 取最新的

  if (lastMessage?.type === 'share') {
    shareInfoRef.current = lastMessage.data;
  }
};
```

## 坑点3：iframe 内不能直接调 wx.miniProgram

如果 H5 页面是在 iframe 里，`wx.miniProgram.postMessage` 会失效或行为异常。

**必须先传给父页面，父页面再调用：**

```typescript
// iframe 内
window.parent.postMessage({
  type: 'SHARE_INFO',
  data: shareConfig,
}, '*');

// 父页面
window.addEventListener('message', (event) => {
  if (event.data?.type === 'SHARE_INFO') {
    // 父页面才能调用
    wx.miniProgram.postMessage({
      data: { type: 'share', data: event.data.data },
    });
  }
});
```

## 坑点4：window.postMessage 的 origin 安全

`window.postMessage` 的第二个参数是 `targetOrigin`，指定接收方的源。

**开发时图省事用 `*`：**
```typescript
window.parent.postMessage(data, '*');  // 任何源都能收到
```

**生产环境要指定具体域名：**
```typescript
window.parent.postMessage(data, 'https://your-domain.com');
```

**接收方也要校验来源：**
```typescript
window.addEventListener('message', (event) => {
  if (event.origin !== 'https://allowed-domain.com') {
    return;  // 忽略不信任的来源
  }
  // 处理消息
});
```

## 我们项目里的消息流

以分享为例，看看消息要经过多少层：

```
┌─────────────────────────────────────────────────────────────┐
│  iframe 直播间页面 (liveDomain)                              │
│  ↓ window.parent.postMessage({ type: 'LIVE_READY_SHARE' })  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  H5 父页面 /scene (authDomain)                               │
│  监听 message 事件                                           │
│  ↓ wx.miniProgram.postMessage({ data: shareConfig })        │
└─────────────────────────────────────────────────────────────┘
                              ↓
                    （等待用户触发分享）
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  小程序 WebView 页面                                         │
│  onMessage 收到消息，更新 shareInfoRef                       │
│  用户点分享时，useShareAppMessage 返回 shareInfoRef          │
└─────────────────────────────────────────────────────────────┘
```

**这就是为什么分享信息要提前发送**——因为中间有"等待用户触发分享"这个不确定的时间点。

## 调试技巧

### 1. 在 H5 里确认消息发出去了

```typescript
wx.miniProgram.postMessage({ data: { test: 1 } });
console.log('消息已发送');  // 这只能说明调用了，不能说明小程序收到了
```

### 2. 在小程序里确认收到了

```tsx
const onWebViewMessage = (e) => {
  console.log('[WebView消息]', JSON.stringify(e.detail.data));
};
```

但记住，这个 log 只会在后退/销毁/分享时才打印。

### 3. iframe 消息调试

```typescript
// 发送方
window.parent.postMessage({ type: 'TEST', data: 'hello' }, '*');
console.log('已发送给父页面');

// 接收方
window.addEventListener('message', (event) => {
  console.log('[收到消息]', event.origin, event.data);
});
```

## 总结

| 场景 | 方案 |
|------|------|
| H5 → 小程序（非实时） | `wx.miniProgram.postMessage` |
| H5 → 小程序（实时） | `wx.miniProgram.navigateTo` |
| iframe → 父页面 | `window.parent.postMessage` |
| 父页面 → iframe | `iframe.contentWindow.postMessage` |

不同的通信需求，用不同的方案，别指望一个 API 解决所有问题。
