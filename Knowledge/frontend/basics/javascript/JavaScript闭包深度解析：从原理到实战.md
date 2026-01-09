---
aliases: ["闭包", "Closure", "JavaScript闭包"]
title: "JavaScript 闭包"
tags: ["JavaScript", "闭包", "作用域", "前端面试"]
updated: 2026-01-09
---

## 概述

闭包是指函数能够访问其词法作用域外部变量的机制，即使在外部函数已经返回之后。闭包是 JavaScript 最核心的特性之一，广泛应用于模块化、数据封装、函数工厂等场景。

## 核心概念

### 闭包定义

```javascript
function createGreeting(name) {
  const greeting = `Hello, ${name}!`;

  return function() {
    console.log(greeting); // 访问外部变量
  };
}

const sayHello = createGreeting('Alice');
sayHello(); // "Hello, Alice!"
// createGreeting 已执行完毕，但 greeting 变量仍可访问
```

### 形成条件

1. **嵌套函数**：内部函数定义在外部函数内
2. **引用外部变量**：内部函数引用外部函数的变量
3. **返回或传递**：内部函数被返回或传递到外部作用域

### 词法作用域

```javascript
let globalVar = 'global';

function outerFunction(outerParam) {
  let outerVar = 'outer';

  function innerFunction(innerParam) {
    let innerVar = 'inner';

    // 内部函数可访问所有外层变量
    console.log(innerVar);   // 自身变量
    console.log(outerVar);   // 外部函数变量
    console.log(globalVar);  // 全局变量
  }

  return innerFunction;
}
```

## 应用场景

### 1. 模块模式（数据封装）

```javascript
const Calculator = (function() {
  // 私有变量
  let history = [];
  let currentValue = 0;

  // 公共 API
  return {
    add(num) {
      currentValue += num;
      history.push({ op: 'add', value: num, result: currentValue });
      return this;
    },
    getValue() {
      return currentValue;
    },
    getHistory() {
      return [...history]; // 返回副本
    }
  };
})();

Calculator.add(10).add(5);
console.log(Calculator.getValue()); // 15
console.log(Calculator.history);    // undefined（私有）
```

### 2. 函数工厂

```javascript
function createValidator(rules) {
  return function validate(value) {
    const errors = [];

    if (rules.required && !value) {
      errors.push('必填字段');
    }
    if (rules.minLength && value.length < rules.minLength) {
      errors.push(`最少 ${rules.minLength} 个字符`);
    }

    return { isValid: errors.length === 0, errors };
  };
}

const emailValidator = createValidator({ required: true });
const passwordValidator = createValidator({ required: true, minLength: 8 });
```

### 3. 防抖与节流

```javascript
// 防抖：延迟执行，重复调用重置延迟
function debounce(fn, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

// 节流：限制执行频率
function throttle(fn, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}
```

### 4. 记忆化（缓存）

```javascript
function memoize(fn) {
  const cache = new Map();

  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const memoizedFib = memoize(function fib(n) {
  if (n <= 1) return n;
  return memoizedFib(n - 1) + memoizedFib(n - 2);
});
```

## 常见陷阱

### 陷阱 1：循环中的闭包

```javascript
// ❌ 错误：所有回调共享同一个 i
for (var i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100); // 输出 5 个 5
}

// ✅ 方案 1：使用 let（块级作用域）
for (let i = 0; i < 5; i++) {
  setTimeout(() => console.log(i), 100); // 输出 0,1,2,3,4
}

// ✅ 方案 2：IIFE 创建独立作用域
for (var i = 0; i < 5; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i);
}
```

### 陷阱 2：内存泄漏

```javascript
// ❌ 大数据被闭包引用，无法回收
function createLeak() {
  const largeData = new Array(1000000).fill('data');
  return function() {
    return largeData[0]; // 整个 largeData 被保留
  };
}

// ✅ 只保留需要的数据
function createOptimized() {
  const largeData = new Array(1000000).fill('data');
  const firstElement = largeData[0];
  return function() {
    return firstElement;
  };
}
```

### 陷阱 3：this 指向问题

```javascript
const obj = {
  name: 'MyObject',

  // ❌ 普通函数的 this 可能丢失
  createBadMethod() {
    return function() {
      console.log(this.name); // this 可能是 undefined
    };
  },

  // ✅ 保存 this 或直接使用闭包变量
  createGoodMethod() {
    const name = this.name;
    return function() {
      console.log(name);
    };
  }
};
```

## 高级模式

### 柯里化

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

const add = curry((a, b, c) => a + b + c);
console.log(add(1)(2)(3)); // 6
console.log(add(1, 2)(3)); // 6
```

### 函数组合

```javascript
const pipe = (...fns) => value =>
  fns.reduce((acc, fn) => fn(acc), value);

const trim = str => str.trim();
const toLowerCase = str => str.toLowerCase();
const addPrefix = prefix => str => `${prefix}${str}`;

const processUsername = pipe(trim, toLowerCase, addPrefix('user_'));
console.log(processUsername('  Alice  ')); // "user_alice"
```

## 框架中的闭包

### React Hooks

```javascript
function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);

  // useCallback 创建闭包保持引用稳定
  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  return { count, increment };
}
```

### Vue Composition API

```javascript
function useAsyncData(url) {
  const data = ref(null);
  const loading = ref(false);

  // 闭包捕获响应式变量
  const fetchData = async () => {
    loading.value = true;
    data.value = await fetch(url).then(r => r.json());
    loading.value = false;
  };

  return { data, loading, fetchData };
}
```

## 要点总结

| 特性 | 说明 |
|------|------|
| **本质** | 函数记住创建时的词法环境 |
| **生命周期** | 外部变量因被闭包引用而延长生命周期 |
| **数据封装** | 实现真正的私有变量 |
| **内存注意** | 及时清理不需要的引用 |

### 最佳实践

- ✅ 合理使用闭包实现数据封装
- ✅ 循环中使用 `let` 或 IIFE
- ✅ 及时清理不需要的闭包引用
- ❌ 避免在闭包中引用大型数据结构
- ❌ 避免过度创建闭包影响性能

## 参考资料

- [MDN - 闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
- [JavaScript 高级程序设计 - 闭包章节](https://www.ituring.com.cn/book/2472)
