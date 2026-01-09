# ES6模块导出详解：export vs export default

> 你有没有在项目中遇到过这样的困惑：为什么有些模块用`import { xxx }`导入，有些用`import xxx`？为什么修改导入的变量有时候会影响原模块，有时候不会？这篇文章将彻底解开ES6模块导出的所有秘密。

## 为什么要区分两种导出方式？

在ES6模块系统设计之初，JavaScript需要解决一个核心问题：**如何在保持灵活性的同时提供清晰的模块接口**。

### 传统CommonJS的限制

```javascript
// CommonJS的单一导出模式
module.exports = {
  name: 'John',
  age: 25,
  getName: function() { return this.name; }
};

// 或者
module.exports = function Calculator() {
  // ...
};
```

CommonJS只有一种导出方式，当你需要导出多个功能时，必须包装成一个对象，这带来了一些问题：
- 无法进行静态分析和Tree Shaking
- 导入时必须访问对象属性
- 不够语义化

### ES6的双重解决方案

ES6设计了两种互补的导出方式：
- **命名导出（Named Export）**：适合导出多个具体功能
- **默认导出（Default Export）**：适合导出模块的主要功能

## export：命名导出的精髓

### 基本语法与使用

```javascript
// math.js - 多个功能的工具模块
export const PI = 3.14159;
export let counter = 0;

export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

export class Calculator {
  constructor() {
    this.result = 0;
  }
  
  add(num) {
    this.result += num;
    return this;
  }
}

// 批量导出写法
const subtract = (a, b) => a - b;
const divide = (a, b) => a / b;

export { subtract, divide };

// 重命名导出
const complexFunction = () => { /* ... */ };
export { complexFunction as calculate };
```

### 导入方式详解

```javascript
// 具名导入
import { PI, add, Calculator } from './math.js';

// 重命名导入
import { add as sum, multiply as product } from './math.js';

// 导入所有命名导出
import * as MathUtils from './math.js';
console.log(MathUtils.PI); // 3.14159
console.log(MathUtils.add(2, 3)); // 5

// 部分导入（Tree Shaking 友好）
import { add } from './math.js'; // 只导入需要的函数
```

## export default：模块主角的舞台

### 基本语法与使用

```javascript
// User.js - 以类为主要功能的模块
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  
  getProfile() {
    return `${this.name} (${this.email})`;
  }
}

export default User;

// 或者直接导出
export default class User {
  // ...
}

// 函数的默认导出
export default function createUser(name, email) {
  return new User(name, email);
}

// 对象的默认导出
export default {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// 值的默认导出
export default 42;
export default "Hello World";
```

### 导入方式详解

```javascript
// 默认导入（可以自由命名）
import User from './User.js';
import MyUser from './User.js';        // 名字可以不同
import CreateUser from './User.js';    // 完全自定义名字

// 使用
const user = new User('Alice', 'alice@example.com');
```

## 核心区别对比：一张表看懂

| 特性 | export | export default |
|------|--------|---------------|
| **导出数量** | 可以多个 | 每个模块只能有一个 |
| **导入语法** | `import { name }` | `import name` |
| **名称要求** | 必须使用确切名称 | 可以任意命名 |
| **Tree Shaking** | 支持，可按需导入 | 整体导入 |
| **静态分析** | 编译时可确定 | 编译时可确定 |
| **重命名** | 导入时用 `as` | 导入时直接命名 |

## 引用 vs 复制：深入理解模块绑定

这是ES6模块最容易误解的部分！ES6模块导出的是**活动绑定（Live Binding）**，不是值的拷贝。

### 基本类型的"伪复制"现象

```javascript
// counter.js
export let count = 0;

export function increment() {
  count++;
  console.log('模块内count:', count);
}

export function getCount() {
  return count;
}
```

```javascript
// main.js
import { count, increment, getCount } from './counter.js';

console.log('初始count:', count); // 0

increment(); 
// 模块内count: 1
console.log('导入的count:', count); // 🎯 仍然是0！

console.log('通过函数获取:', getCount()); // 🎯 但这是1！

// ❌ 这会报错！
// count++; // TypeError: Assignment to constant variable
```

**为什么会这样？** 

对于基本类型，导入的是**只读绑定**。模块内部变量值变化时，导入的变量不会自动更新，但通过函数访问可以获取最新值。

### 引用类型的真实绑定

```javascript
// config.js
export const config = {
  apiUrl: 'https://api.example.com',
  features: ['login', 'logout']
};

export function addFeature(feature) {
  config.features.push(feature);
}

export function updateApiUrl(url) {
  config.apiUrl = url;
}
```

```javascript
// main.js
import { config, addFeature, updateApiUrl } from './config.js';

console.log('初始配置:', config);
// { apiUrl: 'https://api.example.com', features: ['login', 'logout'] }

// ✅ 可以修改对象属性
config.features.push('profile');
console.log('修改后:', config.features); 
// ['login', 'logout', 'profile']

addFeature('settings');
console.log('再次修改:', config.features); 
// ['login', 'logout', 'profile', 'settings']

// ❌ 但不能重新赋值
// config = {}; // TypeError: Assignment to constant variable
```

### 完整的实验：验证绑定机制

```javascript
// binding-test.js
export let primitive = 100;
export const object = { value: 100 };
export const array = [1, 2, 3];

export function changePrimitive(newValue) {
  primitive = newValue;
  console.log('模块内primitive:', primitive);
}

export function changeObject(newValue) {
  object.value = newValue;
  console.log('模块内object.value:', object.value);
}

export function changeArray() {
  array.push(array.length + 1);
  console.log('模块内array:', array);
}

// 获取当前值的函数
export function getCurrentValues() {
  return {
    primitive,
    object: {...object},
    array: [...array]
  };
}
```

```javascript
// test.js
import { 
  primitive, 
  object, 
  array, 
  changePrimitive, 
  changeObject, 
  changeArray,
  getCurrentValues 
} from './binding-test.js';

console.log('=== 初始状态 ===');
console.log('primitive:', primitive); // 100
console.log('object:', object);       // { value: 100 }
console.log('array:', array);         // [1, 2, 3]

console.log('\n=== 修改基本类型 ===');
changePrimitive(200);
console.log('导入的primitive:', primitive);     // 🎯 仍然是100
console.log('函数获取:', getCurrentValues().primitive); // 🎯 200

console.log('\n=== 修改引用类型 ===');
changeObject(300);
console.log('导入的object.value:', object.value); // 🎯 300 (实时更新！)

changeArray();
console.log('导入的array:', array); // 🎯 [1, 2, 3, 4] (实时更新！)

console.log('\n=== 直接修改导入的引用类型 ===');
object.value = 400;
console.log('当前object.value:', getCurrentValues().object.value); // 🎯 400

array.push(5);
console.log('当前array:', getCurrentValues().array); // 🎯 [1, 2, 3, 4, 5]
```

**运行结果分析：**
1. **基本类型**：导入的是只读快照，不会自动更新
2. **引用类型**：导入的是对同一对象的引用，修改会实时反映
3. **函数访问**：总是能获取模块内的最新值

## 混合导出：两全其美的方案

一个模块可以同时使用命名导出和默认导出：

```javascript
// api.js - 混合导出示例
const DEFAULT_CONFIG = {
  baseURL: 'https://api.example.com',
  timeout: 5000
};

// 默认导出：主要的API类
export default class ApiClient {
  constructor(config = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  async get(url) {
    // 实现GET请求
    return fetch(`${this.config.baseURL}${url}`);
  }
}

// 命名导出：辅助功能
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE'
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
};

export function createAuthHeader(token) {
  return {
    'Authorization': `Bearer ${token}`
  };
}

export function isSuccessStatus(status) {
  return status >= 200 && status < 300;
}
```

```javascript
// 使用混合导出
import ApiClient, { 
  HTTP_METHODS, 
  HTTP_STATUS, 
  createAuthHeader,
  isSuccessStatus 
} from './api.js';

// 使用默认导出
const client = new ApiClient({
  baseURL: 'https://my-api.com'
});

// 使用命名导出
const authHeader = createAuthHeader('your-token');
const response = await client.get('/users');

if (isSuccessStatus(response.status)) {
  console.log('请求成功');
}
```

## 实际应用场景与最佳实践

### 场景1：工具函数库 - 使用命名导出

```javascript
// utils.js - 工具函数集合
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

// 使用：按需导入，支持Tree Shaking
import { debounce, throttle } from './utils.js';
```

### 场景2：React组件 - 使用默认导出

```javascript
// Button.jsx - 单一组件
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  onClick,
  disabled = false,
  ...props 
}) => {
  const baseClasses = 'btn';
  const variantClasses = `btn--${variant}`;
  const sizeClasses = `btn--${size}`;
  
  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;

// 使用
import Button from './Button.jsx';
import MyButton from './Button.jsx'; // 可以重命名
```

### 场景3：配置文件 - 混合导出

```javascript
// config.js - 应用配置
const isDevelopment = process.env.NODE_ENV === 'development';

// 默认导出：主配置对象
export default {
  api: {
    baseURL: isDevelopment ? 'http://localhost:3000' : 'https://api.prod.com',
    timeout: 10000,
    retries: 3
  },
  features: {
    enableLogging: isDevelopment,
    enableAnalytics: !isDevelopment,
    enableExperiments: false
  },
  ui: {
    theme: 'light',
    language: 'zh-CN'
  }
};

// 命名导出：环境相关的工具
export const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  TEST: 'test'
};

export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function isDev() {
  return process.env.NODE_ENV === 'development';
}

export function getApiUrl(endpoint) {
  const baseURL = isDevelopment ? 'http://localhost:3000' : 'https://api.prod.com';
  return `${baseURL}${endpoint}`;
}

// 使用
import config, { ENV, isProduction, getApiUrl } from './config.js';
```

## 常见陷阱与解决方案

### 陷阱1：循环依赖问题

```javascript
// user.js
import { validateEmail } from './validator.js';

export class User {
  constructor(email) {
    if (!validateEmail(email)) {
      throw new Error('Invalid email');
    }
    this.email = email;
  }
}

// validator.js  
import { User } from './user.js'; // 🚨 循环依赖！

export function validateEmail(email) {
  // 验证逻辑
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function createUserIfValid(email) {
  if (validateEmail(email)) {
    return new User(email); // 这里会出问题
  }
  return null;
}
```

**解决方案：**

```javascript
// 方案1：提取共同依赖
// types.js
export class User {
  constructor(email) {
    this.email = email;
  }
}

// validator.js
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// user-factory.js
import { User } from './types.js';
import { validateEmail } from './validator.js';

export function createUser(email) {
  if (!validateEmail(email)) {
    throw new Error('Invalid email');
  }
  return new User(email);
}

// 方案2：延迟导入
// validator.js
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function createUserIfValid(email) {
  if (validateEmail(email)) {
    const { User } = await import('./user.js'); // 动态导入
    return new User(email);
  }
  return null;
}
```

### 陷阱2：默认导出的命名混淆

```javascript
// 不好的实践：默认导出没有明确的语义
// math-utils.js
export default {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b
}; // 导入时容易命名混乱

// 不同文件中的导入
import MathUtils from './math-utils.js';    // 这样还好
import Calculator from './math-utils.js';   // 这个名字有歧义
import Operations from './math-utils.js';   // 这个也不够清晰
```

**更好的实践：**

```javascript
// math-utils.js - 命名导出更清晰
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export const multiply = (a, b) => a * b;

// 或者如果确实需要默认导出，使用明确的名称
const MathOperations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b
};

export default MathOperations;

// 使用时更清晰
import { add, subtract } from './math-utils.js'; // 按需导入
import MathOperations from './math-utils.js';    // 默认导入时名称明确
```

### 陷阱3：修改导入值的误区

```javascript
// state.js
export let currentUser = null;
export const users = [];

export function setCurrentUser(user) {
  currentUser = user;
}

export function addUser(user) {
  users.push(user);
}
```

```javascript
// main.js
import { currentUser, users, setCurrentUser, addUser } from './state.js';

console.log(currentUser); // null

// ❌ 错误：尝试直接修改基本类型导入值
// currentUser = { name: 'Alice' }; // 报错！

// ✅ 正确：通过函数修改
setCurrentUser({ name: 'Alice' });
console.log(currentUser); // 仍然是null（基本类型不会自动更新）

// ✅ 但引用类型可以修改内容
addUser({ name: 'Bob' });
console.log(users); // [{ name: 'Bob' }] ✅ 会更新

users.push({ name: 'Charlie' });
console.log(users); // [{ name: 'Bob' }, { name: 'Charlie' }] ✅ 会更新
```

## 性能考虑：Tree Shaking优化

### 命名导出的优势

```javascript
// lodash-style.js - 大型工具库
export function map(array, fn) { /* 实现 */ }
export function filter(array, fn) { /* 实现 */ }
export function reduce(array, fn, initial) { /* 实现 */ }
export function find(array, fn) { /* 实现 */ }
export function sort(array, fn) { /* 实现 */ }
// ... 100个更多函数

// 使用时只导入需要的函数 - Tree Shaking友好
import { map, filter } from './lodash-style.js';
// 打包时只会包含map和filter的代码
```

### 默认导出的限制

```javascript
// big-library.js - 不利于Tree Shaking
export default {
  map: function(array, fn) { /* 实现 */ },
  filter: function(array, fn) { /* 实现 */ },
  reduce: function(array, fn, initial) { /* 实现 */ },
  // ... 100个函数
};

// 使用时必须导入整个对象
import utils from './big-library.js';
const result = utils.map(data, fn);
// 打包时会包含整个对象的所有代码 😞
```

### 混合策略：兼顾便利性和性能

```javascript
// best-of-both.js
// 命名导出：支持Tree Shaking
export function map(array, fn) { /* 实现 */ }
export function filter(array, fn) { /* 实现 */ }
export function reduce(array, fn, initial) { /* 实现 */ }

// 默认导出：便于整体使用
export default {
  map,
  filter,
  reduce
};

// 灵活使用
import { map, filter } from './best-of-both.js';        // Tree Shaking
import * as utils from './best-of-both.js';             // 全部命名导出
import utilsBundle from './best-of-both.js';            // 默认导出
```

## 总结：选择合适的导出方式

### 🎯 使用命名导出的场景
- ✅ 工具函数库（支持Tree Shaking）
- ✅ 常量集合（如HTTP状态码、配置选项）
- ✅ 需要导出多个独立功能的模块
- ✅ 希望导入时保持明确的命名

### 🎯 使用默认导出的场景
- ✅ 单一职责的类或组件
- ✅ 模块的主要功能或API
- ✅ 配置对象或大型数据结构
- ✅ 希望导入时能自由命名

### 🎯 使用混合导出的场景
- ✅ 主功能 + 辅助工具的组合
- ✅ 需要同时支持整体和按需使用
- ✅ 大型库的API设计

### 💡 关键记忆点
1. **绑定机制**：ES6模块导出的是活动绑定，不是值复制
2. **基本类型**：导入的是只读快照，不会自动更新
3. **引用类型**：导入的是对同一对象的引用，修改会实时反映
4. **性能优化**：命名导出支持Tree Shaking，默认导出通常不支持
5. **命名规范**：默认导出应该有明确的语义，避免命名混淆

掌握这些原理和最佳实践，你就能在项目中游刃有余地使用ES6模块系统，写出既优雅又高效的代码！
