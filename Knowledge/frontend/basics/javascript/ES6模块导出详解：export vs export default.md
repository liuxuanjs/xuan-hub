---
aliases: ["export", "export default", "ES6导出", "模块导出"]
title: "ES6 模块导出：export vs export default"
tags: ["JavaScript", "ES6", "模块化", "import", "export"]
updated: 2026-01-09
---

## 概述

ES6 模块系统提供两种导出方式：**命名导出（Named Export）** 和 **默认导出（Default Export）**。两者互补，分别适用于不同场景。

## 核心区别

| 特性 | export（命名导出） | export default（默认导出） |
|------|--------|---------------|
| **导出数量** | 可以多个 | 每个模块只能有一个 |
| **导入语法** | `import { name }` | `import name` |
| **名称要求** | 必须使用确切名称 | 可以任意命名 |
| **Tree Shaking** | 支持 | 不支持 |
| **重命名** | 导入时用 `as` | 导入时直接命名 |

## 命名导出

### 语法示例

```javascript
// math.js
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export class Calculator { /* ... */ }

// 批量导出
const subtract = (a, b) => a - b;
const divide = (a, b) => a / b;
export { subtract, divide };

// 重命名导出
export { complexFunction as calculate };
```

### 导入方式

```javascript
// 具名导入
import { PI, add, Calculator } from './math.js';

// 重命名导入
import { add as sum } from './math.js';

// 导入所有
import * as MathUtils from './math.js';
MathUtils.add(2, 3); // 5

// 部分导入（Tree Shaking 友好）
import { add } from './math.js';
```

## 默认导出

### 语法示例

```javascript
// User.js
export default class User {
  constructor(name) { this.name = name; }
}

// 或分开写
class User { /* ... */ }
export default User;

// 默认导出函数
export default function createUser(name) { return new User(name); }

// 默认导出对象
export default { apiUrl: 'https://api.example.com', timeout: 5000 };
```

### 导入方式

```javascript
// 可以自由命名
import User from './User.js';
import MyUser from './User.js';    // 名字可以不同
import AnyName from './User.js';   // 完全自定义
```

## 混合导出

一个模块可以同时使用两种导出方式：

```javascript
// api.js
export default class ApiClient {
  constructor(config) { this.config = config; }
  async get(url) { /* ... */ }
}

export const HTTP_STATUS = { OK: 200, NOT_FOUND: 404 };
export function createAuthHeader(token) {
  return { 'Authorization': `Bearer ${token}` };
}
```

```javascript
// 混合导入
import ApiClient, { HTTP_STATUS, createAuthHeader } from './api.js';
```

## 模块绑定机制

ES6 模块导出的是**活动绑定（Live Binding）**，不是值的拷贝。

### 基本类型：只读快照

```javascript
// counter.js
export let count = 0;
export function increment() { count++; }
export function getCount() { return count; }
```

```javascript
// main.js
import { count, increment, getCount } from './counter.js';

console.log(count);      // 0
increment();
console.log(count);      // 仍然是 0（基本类型不自动更新）
console.log(getCount()); // 1（通过函数可获取最新值）

// count++; // ❌ 报错：只读绑定
```

### 引用类型：实时反映

```javascript
// config.js
export const config = { apiUrl: 'https://api.example.com' };
export function updateUrl(url) { config.apiUrl = url; }
```

```javascript
// main.js
import { config, updateUrl } from './config.js';

console.log(config.apiUrl); // https://api.example.com

updateUrl('https://new-api.com');
console.log(config.apiUrl); // https://new-api.com（实时更新）

config.apiUrl = 'https://another.com'; // ✅ 可以修改属性
// config = {}; // ❌ 不能重新赋值
```

## 应用场景

### 命名导出：工具函数库

```javascript
// utils.js
export function debounce(fn, wait) { /* ... */ }
export function throttle(fn, limit) { /* ... */ }
export function deepClone(obj) { /* ... */ }

// 使用：按需导入，支持 Tree Shaking
import { debounce } from './utils.js';
```

### 默认导出：单一组件/类

```javascript
// Button.jsx
export default function Button({ children, onClick }) {
  return <button onClick={onClick}>{children}</button>;
}

// 使用
import Button from './Button.jsx';
```

### 混合导出：主功能 + 辅助工具

```javascript
// config.js
export default {
  api: { baseURL: 'https://api.example.com', timeout: 10000 }
};

export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

// 使用
import config, { isProduction } from './config.js';
```

## 常见问题

### 循环依赖

```javascript
// ❌ 问题：A 依赖 B，B 依赖 A
// 解决方案：提取共同依赖到第三个模块

// 或使用动态导入
export async function createUser(email) {
  const { User } = await import('./user.js');
  return new User(email);
}
```

### Tree Shaking 优化

```javascript
// ✅ 命名导出：支持 Tree Shaking
export function map(arr, fn) { /* ... */ }
export function filter(arr, fn) { /* ... */ }

// ❌ 默认导出对象：不支持 Tree Shaking
export default {
  map: (arr, fn) => { /* ... */ },
  filter: (arr, fn) => { /* ... */ }
};
```

## 选择建议

| 场景 | 推荐方式 |
|------|----------|
| 工具函数库 | 命名导出 |
| 常量集合 | 命名导出 |
| 单一类/组件 | 默认导出 |
| 主功能 + 辅助工具 | 混合导出 |
| 需要 Tree Shaking | 命名导出 |

## 参考资料

- [MDN - export](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/export)
- [MDN - import](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/import)
