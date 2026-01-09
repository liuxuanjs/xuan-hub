---
aliases: ["Vue响应式", "响应式原理", "Proxy", "Object.defineProperty"]
title: "Vue响应式原理"
tags: ["Vue", "响应式", "面试高频"]
updated: 2025-01-09
---

## 核心结论

| 版本 | 实现方式 | 特点 |
|------|---------|------|
| **Vue2** | `Object.defineProperty` | 需要递归遍历，无法检测新增/删除属性 |
| **Vue3** | `Proxy` | 惰性代理，可拦截所有操作 |

## Vue2 响应式

### 实现原理

```javascript
// 核心：Object.defineProperty 劫持属性的 getter/setter
function defineReactive(obj, key, val) {
  const dep = new Dep();  // 每个属性有自己的依赖收集器

  Object.defineProperty(obj, key, {
    get() {
      // 收集依赖：谁在读这个属性？
      if (Dep.target) {
        dep.depend();
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      // 通知更新：告诉所有依赖这个属性的地方
      dep.notify();
    }
  });
}
```

### 依赖收集流程

```
组件渲染
    │
    ▼
Watcher 开始（设置 Dep.target = 当前 Watcher）
    │
    ▼
读取 data.message（触发 getter）
    │
    ▼
getter 中收集依赖（把 Watcher 加入 dep）
    │
    ▼
渲染完成（Dep.target = null）

─────────────────────────────────────

data.message = '新值'（触发 setter）
    │
    ▼
setter 中通知更新（dep.notify()）
    │
    ▼
Watcher 执行更新（重新渲染组件）
```

### Vue2 的局限性

```javascript
// ❌ 无法检测新增属性
this.obj.newProp = 'value';  // 不是响应式的！

// ✅ 解决方案
this.$set(this.obj, 'newProp', 'value');
Vue.set(this.obj, 'newProp', 'value');

// ❌ 无法检测数组索引赋值
this.arr[0] = 'new';  // 不是响应式的！

// ✅ 解决方案
this.$set(this.arr, 0, 'new');
this.arr.splice(0, 1, 'new');

// ❌ 无法检测数组长度修改
this.arr.length = 0;  // 不是响应式的！

// ✅ 解决方案
this.arr.splice(0);
```

### 数组方法重写

Vue2 重写了 7 个数组方法，使其触发更新：

```javascript
const arrayMethods = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'];

arrayMethods.forEach(method => {
  const original = Array.prototype[method];

  Object.defineProperty(arrayProto, method, {
    value: function(...args) {
      const result = original.apply(this, args);
      // 通知更新
      this.__ob__.dep.notify();
      return result;
    }
  });
});
```

---

## Vue3 响应式

### 实现原理

```javascript
// 核心：Proxy 代理整个对象
function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 收集依赖
      track(target, key);
      const result = Reflect.get(target, key, receiver);
      // 嵌套对象惰性代理
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        // 触发更新
        trigger(target, key);
      }
      return result;
    },
    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key);
      // 触发更新
      trigger(target, key);
      return result;
    }
  });
}
```

### Vue3 的优势

| 特性 | Vue2 | Vue3 |
|------|------|------|
| 检测新增属性 | ❌ 需要 $set | ✅ 自动检测 |
| 检测删除属性 | ❌ 需要 $delete | ✅ 自动检测 |
| 数组索引修改 | ❌ 需要 $set | ✅ 自动检测 |
| 初始化性能 | 递归遍历所有属性 | 惰性代理（用到才代理） |
| 内存占用 | 每个属性一个 dep | 更少 |

### ref vs reactive

```javascript
import { ref, reactive } from 'vue';

// ref：包装基本类型（也可包装对象）
const count = ref(0);
console.log(count.value);  // 需要 .value 访问
count.value++;

// reactive：代理对象
const state = reactive({ count: 0, name: 'test' });
console.log(state.count);  // 直接访问
state.count++;
```

| 对比 | ref | reactive |
|------|-----|----------|
| 适用类型 | 基本类型 + 对象 | 仅对象 |
| 访问方式 | 需要 `.value` | 直接访问 |
| 模板中使用 | 自动解包 | 直接使用 |
| 解构 | 保持响应式 | ❌ 丢失响应式 |

### 解构丢失响应式问题

```javascript
const state = reactive({ count: 0, name: 'test' });

// ❌ 解构后丢失响应式
const { count, name } = state;
count++;  // 不会触发更新！

// ✅ 使用 toRefs 保持响应式
import { toRefs } from 'vue';
const { count, name } = toRefs(state);
count.value++;  // 会触发更新
```

---

## 依赖收集与触发

### Vue3 track 和 trigger

**白话理解**：

```
track（收集依赖）：
  "谁在用我？记下来！"
  当组件读取 state.count 时，Vue 记住这个组件依赖了 count

trigger（触发更新）：
  "我变了，通知所有人！"
  当 state.count 变化时，Vue 通知所有依赖它的组件更新
```

**简化实现**：

```javascript
// 全局依赖映射
// targetMap: WeakMap<target, Map<key, Set<effect>>>
const targetMap = new WeakMap();

// 当前活跃的 effect（正在执行的副作用函数）
let activeEffect = null;

// 收集依赖：记录"谁在读取这个属性"
function track(target, key) {
  if (!activeEffect) return;  // 没有活跃的 effect，不需要收集

  // 获取或创建 target 对应的依赖 Map
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()));
  }

  // 获取或创建 key 对应的依赖 Set
  let dep = depsMap.get(key);
  if (!dep) {
    depsMap.set(key, (dep = new Set()));
  }

  // 把当前 effect 加入依赖集合
  dep.add(activeEffect);
}

// 触发更新：通知所有依赖这个属性的 effect 重新执行
function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  const effects = depsMap.get(key);
  if (effects) {
    effects.forEach(effect => effect());  // 执行所有依赖的副作用
  }
}
```

### 数据结构图示

```
targetMap (WeakMap)
    │
    ├── target1 (对象) ──→ depsMap (Map)
    │                          │
    │                          ├── 'count' ──→ Set { effect1, effect2 }
    │                          └── 'name'  ──→ Set { effect3 }
    │
    └── target2 (对象) ──→ depsMap (Map)
                               │
                               └── 'value' ──→ Set { effect4 }
```

---

## computed 原理

### 特点

- **惰性求值**：只有被读取时才计算
- **缓存**：依赖不变，返回缓存值
- **依赖追踪**：自动追踪依赖的响应式数据

### 白话理解

```
computed 的工作流程：

1. 首次读取 computed.value
   → dirty = true，需要计算
   → 执行 getter，得到结果
   → 缓存结果，dirty = false

2. 再次读取（依赖未变）
   → dirty = false，直接返回缓存

3. 依赖变化时
   → dirty = true（标记需要重算）
   → 下次读取时重新计算
```

### 简化实现

```javascript
function computed(getter) {
  let value;
  let dirty = true;  // 是否需要重新计算

  // ReactiveEffect：响应式副作用
  // 参数1：要执行的函数（getter）
  // 参数2：调度器（依赖变化时执行）
  const effect = {
    run() {
      // 执行 getter，同时收集依赖
      activeEffect = this;
      const result = getter();
      activeEffect = null;
      return result;
    }
  };

  // 当依赖变化时的回调
  const scheduler = () => {
    dirty = true;              // 标记需要重算
    trigger(obj, 'value');     // 通知使用这个 computed 的地方
  };

  const obj = {
    get value() {
      if (dirty) {
        value = effect.run();  // 执行 getter
        dirty = false;         // 标记已计算
      }
      track(obj, 'value');     // 收集谁在用这个 computed
      return value;
    }
  };

  return obj;
}
```

---

## watch 原理

### 基本实现

```javascript
function watch(source, callback, options = {}) {
  let getter;

  if (typeof source === 'function') {
    getter = source;
  } else {
    getter = () => traverse(source);  // 递归读取所有属性
  }

  let oldValue;

  const job = () => {
    const newValue = effect.run();
    callback(newValue, oldValue);
    oldValue = newValue;
  };

  const effect = new ReactiveEffect(getter, job);

  if (options.immediate) {
    job();
  } else {
    oldValue = effect.run();
  }
}
```

---

## 常见面试题

### Q1：Vue2 和 Vue3 响应式的区别？

| 对比 | Vue2 | Vue3 |
|------|------|------|
| 实现方式 | Object.defineProperty | Proxy |
| 新增属性 | 需要 $set | 自动响应 |
| 数组处理 | 重写 7 个方法 | 原生支持 |
| 性能 | 递归遍历 | 惰性代理 |
| 嵌套对象 | 初始化时全部代理 | 访问时才代理 |

### Q2：为什么 Vue3 选择 Proxy？

1. **功能更强**：可拦截新增、删除、in、for...in 等操作
2. **性能更好**：惰性代理，不需要初始化时递归
3. **代码更简洁**：不需要 $set/$delete 等 hack

### Q3：ref 和 reactive 怎么选？

- **基本类型**：用 `ref`
- **对象/数组**：都可以，但 `reactive` 更直观
- **需要解构**：用 `ref` 或 `toRefs`
- **组合式函数返回**：推荐 `ref`（调用方更灵活）

### Q4：为什么 reactive 解构会丢失响应式？

```javascript
const state = reactive({ count: 0 });
const { count } = state;  // count 是普通数字 0，不是 Proxy
```

解构相当于 `const count = state.count`，拿到的是值而非代理。

### Q5：computed 和 watch 的区别？

| 对比 | computed | watch |
|------|----------|-------|
| 用途 | 派生数据 | 执行副作用 |
| 返回值 | 有返回值 | 无返回值 |
| 缓存 | 有缓存 | 无缓存 |
| 执行时机 | 惰性（用到才算） | 立即或变化时 |

## 相关文档

- [[Vue3 Composition API]]
- [[Vue组件通信]]
- [[Vue生命周期]]
