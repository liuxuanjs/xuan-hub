---
aliases: ["Hooks原理", "useState原理", "useEffect原理"]
title: "React Hooks原理"
tags: ["React", "Hooks", "面试高频"]
updated: 2025-01-09
---

## 核心结论

**Hooks 本质**：挂载在 Fiber 节点上的链表，按调用顺序存储状态。

**为什么不能条件调用**：Hooks 依赖调用顺序匹配状态，条件调用会导致顺序错乱。

## Hooks 数据结构

### 链表结构图解

假设组件调用了 3 个 Hooks：

```javascript
function MyComponent() {
  const [count, setCount] = useState(0);      // Hook 0
  const [name, setName] = useState('test');   // Hook 1
  useEffect(() => { /* ... */ }, []);         // Hook 2
}
```

在 Fiber 节点上形成链表：

```
fiber.memoizedState
        │
        ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│    Hook 0    │───▶│    Hook 1    │───▶│    Hook 2    │───▶ null
│ state: 0     │    │ state:'test' │    │ effect: fn   │
│ (useState)   │    │ (useState)   │    │ (useEffect)  │
└──────────────┘    └──────────────┘    └──────────────┘
```

**关键点**：React 按**调用顺序**遍历链表，取出对应的状态。

### Hook 节点结构

```javascript
const hook = {
  memoizedState: null,  // 当前状态值（useState 存值，useEffect 存 effect 对象）
  baseState: null,      // 初始状态
  baseQueue: null,      // 待处理的更新队列
  queue: null,          // 更新队列
  next: null            // 指向下一个 Hook
};
```

## useState 原理

### 白话理解

```
首次渲染（mount）：
1. 创建一个 Hook 节点，加入链表
2. 把初始值存进 memoizedState
3. 创建一个更新队列
4. 返回 [当前值, setState函数]

后续渲染（update）：
1. 从链表中按顺序取出对应的 Hook
2. 处理队列中的更新，计算新值
3. 返回 [新值, 同一个setState函数]
```

### 初始化阶段（mountState）

```javascript
function mountState(initialState) {
  // 1. 创建 Hook 节点，加入链表
  const hook = mountWorkInProgressHook();

  // 2. 初始化状态
  hook.memoizedState = typeof initialState === 'function'
    ? initialState()
    : initialState;

  // 3. 创建更新队列
  const queue = { pending: null, dispatch: null };
  hook.queue = queue;

  // 4. 返回 dispatch 函数（绑定了当前 Fiber 和队列）
  const dispatch = dispatchSetState.bind(null, fiber, queue);
  queue.dispatch = dispatch;

  return [hook.memoizedState, dispatch];
}
```

### 更新阶段（updateState）

```javascript
function updateState() {
  // 1. 获取当前 Hook（按顺序取）
  const hook = updateWorkInProgressHook();

  // 2. 处理更新队列，计算新状态
  const newState = processUpdateQueue(hook);
  hook.memoizedState = newState;

  return [hook.memoizedState, hook.queue.dispatch];
}
```

### 调用顺序问题

**为什么条件调用会出问题？**

```
首次渲染（condition = true）：
调用顺序: useState(1) → useState(2) → useState(3)
链表状态: [a=1] → [b=2] → [c=3]

第二次渲染（condition = false）：
调用顺序: useState(1) → useState(3)  ← 少了一个！
链表读取: [a=1] → [b=2] ← c 读到了 b 的值！
                    ↑
              useState(3) 拿到的是 2，不是 3
```

**代码示例**：

```javascript
// ❌ 条件调用导致顺序错乱
function BadComponent({ condition }) {
  const [a, setA] = useState(1);  // Hook 0 → 始终读 Hook 0

  if (condition) {
    const [b, setB] = useState(2);  // Hook 1（仅 condition=true 时存在）
  }

  const [c, setC] = useState(3);  // condition=true 时读 Hook 2
                                   // condition=false 时读 Hook 1 ← 错了！
}

// ✅ 始终保持相同顺序
function GoodComponent({ condition }) {
  const [a, setA] = useState(1);  // Hook 0
  const [b, setB] = useState(2);  // Hook 1（始终存在）
  const [c, setC] = useState(3);  // Hook 2

  // 在逻辑中处理条件，而不是在 Hook 调用中
  const displayB = condition ? b : null;
}
```

### 为什么是链表？

| 方案 | 优点 | 缺点 |
|------|------|------|
| **链表（React 选择）** | 内存效率高，无需预分配 | 必须按顺序访问 |
| 数组 | 可随机访问 | 需预知长度或动态扩容 |
| Map（按名称） | 灵活 | 需要开发者命名，易冲突 |

---

## useEffect 原理

### 数据结构

```javascript
const effect = {
  tag: HookPassive,     // effect 类型
  create: () => {},     // 副作用函数
  destroy: undefined,   // 清理函数
  deps: [a, b],         // 依赖数组
  next: null            // 下一个 effect
};
```

### 执行时机

```
组件渲染
    ↓
DOM 更新
    ↓
浏览器绘制
    ↓
useEffect 异步执行（不阻塞渲染）

vs

useLayoutEffect 同步执行（在绘制前）
```

### 依赖比较

```javascript
function areHookInputsEqual(nextDeps, prevDeps) {
  // 浅比较每个依赖项
  for (let i = 0; i < prevDeps.length; i++) {
    if (Object.is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }
  return true;
}
```

### 常见陷阱

```javascript
// ❌ 对象/数组每次都是新引用
useEffect(() => {
  // 每次渲染都会执行
}, [{ id: 1 }]);  // 对象字面量每次都是新对象

// ✅ 使用基本类型或 useMemo
const config = useMemo(() => ({ id: 1 }), []);
useEffect(() => {
  // 只在 config 真正变化时执行
}, [config]);

// ❌ 闭包陷阱
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      console.log(count);  // 永远是 0（闭包捕获）
    }, 1000);
    return () => clearInterval(timer);
  }, []);  // 空依赖，只执行一次

  // ✅ 使用函数式更新
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(c => c + 1);  // 使用最新值
    }, 1000);
    return () => clearInterval(timer);
  }, []);
}
```

---

## useRef 原理

```javascript
function mountRef(initialValue) {
  const hook = mountWorkInProgressHook();
  const ref = { current: initialValue };
  hook.memoizedState = ref;
  return ref;
}

function updateRef() {
  const hook = updateWorkInProgressHook();
  return hook.memoizedState;  // 返回同一个对象引用
}
```

**特点**：
- `ref.current` 改变不会触发重渲染
- 整个组件生命周期内是同一个对象
- 适合存储不需要触发渲染的值

---

## useMemo / useCallback 原理

```javascript
function mountMemo(nextCreate, deps) {
  const hook = mountWorkInProgressHook();
  const nextValue = nextCreate();  // 立即计算
  hook.memoizedState = [nextValue, deps];
  return nextValue;
}

function updateMemo(nextCreate, deps) {
  const hook = updateWorkInProgressHook();
  const prevState = hook.memoizedState;
  const prevDeps = prevState[1];

  // 依赖未变，返回缓存值
  if (areHookInputsEqual(deps, prevDeps)) {
    return prevState[0];
  }

  // 依赖变了，重新计算
  const nextValue = nextCreate();
  hook.memoizedState = [nextValue, deps];
  return nextValue;
}

// useCallback 是 useMemo 的特例
function useCallback(callback, deps) {
  return useMemo(() => callback, deps);
}
```

---

## useContext 原理

```javascript
function readContext(context) {
  // 直接从 context 的 Provider 读取当前值
  return context._currentValue;
}

function useContext(Context) {
  // 订阅 context 变化
  const value = readContext(Context);
  return value;
}
```

**特点**：
- 不创建 Hook 节点（与其他 Hooks 不同）
- Provider 值变化时，所有消费者重渲染

---

## 自定义 Hook

```javascript
// 自定义 Hook 本质：组合内置 Hooks
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// 使用
function Component() {
  const { width, height } = useWindowSize();
  // 每个组件有自己独立的 size 状态
}
```

---

## 常见面试题

### Q1：为什么 Hooks 不能在条件语句中调用？

React 依赖 Hooks 的**调用顺序**来匹配状态。条件调用会导致顺序变化，状态错乱。

### Q2：useState 和 useReducer 的区别？

| 对比 | useState | useReducer |
|------|----------|------------|
| 适用场景 | 简单状态 | 复杂状态逻辑 |
| 更新方式 | 直接设值 | dispatch action |
| 可测试性 | 一般 | 高（纯函数 reducer） |

```javascript
// useState 实际上是 useReducer 的特例
function useState(initialState) {
  return useReducer(
    (state, action) => typeof action === 'function' ? action(state) : action,
    initialState
  );
}
```

### Q3：useEffect 和 useLayoutEffect 的区别？

| 对比 | useEffect | useLayoutEffect |
|------|-----------|-----------------|
| 执行时机 | 浏览器绘制后 | DOM 更新后、绘制前 |
| 是否阻塞渲染 | 否 | 是 |
| 适用场景 | 数据获取、订阅 | DOM 测量、同步样式 |

### Q4：如何避免 useEffect 的闭包陷阱？

1. **添加依赖**：把用到的值加入依赖数组
2. **函数式更新**：`setState(prev => prev + 1)`
3. **useRef**：存储最新值但不触发更新
4. **useReducer**：dispatch 是稳定的

### Q5：useMemo 和 useCallback 什么时候用？

- **useMemo**：计算开销大的值
- **useCallback**：传递给子组件的回调（配合 `React.memo`）

```javascript
// 不需要优化的情况
const value = a + b;  // 计算简单，不需要 useMemo

// 需要优化的情况
const value = useMemo(() => expensiveCalculation(a, b), [a, b]);
const callback = useCallback(() => doSomething(a), [a]);
```

## 相关文档

- [[React Fiber架构]]
- [[React性能优化]]
- [[React18新特性]]
