---
aliases: ["Event Loop", "事件循环"]
title: "JavaScript 事件循环"
tags: ["JavaScript", "异步", "事件循环"]
updated: 2025-01-09
---

## 概览

**核心问题**：JS 是单线程的，如何实现异步不阻塞？

**答案**：通过事件循环（Event Loop）机制，把异步任务放入队列，等主线程空闲时再执行。

**执行顺序**：同步代码 → 微任务队列（全部清空）→ 宏任务队列（执行一个）→ 循环

## 核心概念

### 三个关键部分

| 概念 | 作用 | 特点 |
|------|------|------|
| **调用栈** | 执行同步代码的地方 | 后进先出，一次只能执行一个任务 |
| **宏任务队列** | 存放 setTimeout、事件回调等 | 每轮只取一个执行 |
| **微任务队列** | 存放 Promise.then、queueMicrotask | 每轮全部清空 |

### 宏任务 vs 微任务

| 宏任务（Macro Task） | 微任务（Micro Task） |
|---------------------|---------------------|
| setTimeout / setInterval | Promise.then/catch/finally |
| DOM 事件回调 | queueMicrotask() |
| Ajax 回调 | MutationObserver |
| script 标签 | process.nextTick (Node) |

**关键区别**：微任务优先级更高，每轮事件循环会先清空所有微任务，再执行一个宏任务。

## 执行顺序图解

```
┌─────────────────────────────────────┐
│           事件循环流程               │
├─────────────────────────────────────┤
│  1. 执行同步代码（调用栈）            │
│           ↓                         │
│  2. 调用栈空了吗？                   │
│     └─ 否 → 继续执行                 │
│     └─ 是 → 下一步                   │
│           ↓                         │
│  3. 微任务队列有任务吗？              │
│     └─ 是 → 全部执行完               │
│     └─ 否 → 下一步                   │
│           ↓                         │
│  4. 执行一个宏任务                   │
│           ↓                         │
│  5. 回到第2步，循环                  │
└─────────────────────────────────────┘
```

## 经典示例

### 示例1：基础执行顺序

```javascript
console.log('1');           // 同步

setTimeout(() => {
  console.log('2');         // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log('3');         // 微任务
});

console.log('4');           // 同步

// 输出顺序：1, 4, 3, 2
// 解释：同步(1,4) → 微任务(3) → 宏任务(2)
```

### 示例2：嵌套任务

```javascript
console.log('1');

setTimeout(() => {
  console.log('2');
  Promise.resolve().then(() => console.log('3'));
}, 0);

Promise.resolve().then(() => {
  console.log('4');
  Promise.resolve().then(() => console.log('5'));
});

console.log('6');

// 输出：1, 6, 4, 5, 2, 3
// 解释：
// 同步：1, 6
// 第一轮微任务：4（执行时产生新微任务5）, 5
// 第一个宏任务：2（执行时产生微任务3）
// 该宏任务后的微任务：3
```

### 示例3：async/await

```javascript
async function foo() {
  console.log('1');
  await Promise.resolve();  // 后面的代码变成微任务
  console.log('2');
}

console.log('3');
foo();
console.log('4');

// 输出：3, 1, 4, 2
// await 后的代码相当于放入 Promise.then 中
```

## 记忆口诀

```
同步代码先执行，
微任务队列全清空，
宏任务每轮取一个，
循环往复不停歇。
```

## 常见陷阱

### 陷阱1：setTimeout(fn, 0) 不是立即执行

```javascript
setTimeout(() => console.log('timeout'), 0);
console.log('sync');
// 输出：sync, timeout
// 即使延时为0，也要等同步代码执行完
```

### 陷阱2：Promise 构造函数是同步的

```javascript
new Promise((resolve) => {
  console.log('1');  // 同步执行！
  resolve();
}).then(() => {
  console.log('2');  // 微任务
});
console.log('3');

// 输出：1, 3, 2
```

### 陷阱3：return Promise 会多一轮微任务

```javascript
Promise.resolve().then(() => {
  console.log('1');
  return Promise.resolve();  // 多产生一个微任务
}).then(() => {
  console.log('2');
});

Promise.resolve().then(() => {
  console.log('3');
});

// 输出：1, 3, 2（不是 1, 2, 3）
```

## 实际应用

### 避免长任务阻塞

```javascript
// ❌ 长任务会阻塞页面
for (let i = 0; i < 1000000; i++) {
  // 大量计算
}

// ✅ 使用时间分片
function processChunk(items, index = 0) {
  const chunkSize = 1000;
  const end = Math.min(index + chunkSize, items.length);

  for (let i = index; i < end; i++) {
    // 处理单个项目
  }

  if (end < items.length) {
    setTimeout(() => processChunk(items, end), 0);
  }
}
```

### 利用微任务确保 DOM 更新后执行

```javascript
element.textContent = '新内容';

// 确保 DOM 更新后执行
queueMicrotask(() => {
  console.log('DOM 已更新');
});
```

## 相关文档

- [[Chrome DevTools Performance]]
- [[浏览器输入URL后的完整流程解析]]
