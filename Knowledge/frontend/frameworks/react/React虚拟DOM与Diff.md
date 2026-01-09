---
aliases: ["虚拟DOM", "Virtual DOM", "Diff算法", "Reconciliation"]
title: "React虚拟DOM与Diff"
tags: ["React", "虚拟DOM", "Diff", "面试高频"]
updated: 2025-01-09
---

## 核心结论

**虚拟 DOM**：用 JS 对象描述 UI 结构，更新时对比新旧对象，最小化 DOM 操作。

**Diff 策略**：
1. **树层级比较**：只比较同层节点，不跨层
2. **类型判断**：类型不同直接替换整棵子树
3. **key 优化**：通过 key 识别节点移动，避免重建

## 虚拟 DOM 结构

```javascript
// JSX
<div className="container">
  <h1>Hello</h1>
  <p>World</p>
</div>

// 虚拟 DOM 对象
{
  type: 'div',
  props: {
    className: 'container',
    children: [
      { type: 'h1', props: { children: 'Hello' } },
      { type: 'p', props: { children: 'World' } }
    ]
  }
}

// React Element（实际结构）
{
  $$typeof: Symbol(react.element),
  type: 'div',
  key: null,
  ref: null,
  props: {
    className: 'container',
    children: [...]
  }
}
```

## 为什么需要虚拟 DOM

### 直接操作 DOM 的问题

```javascript
// ❌ 频繁 DOM 操作，性能差
list.forEach(item => {
  const li = document.createElement('li');
  li.textContent = item.name;
  ul.appendChild(li);  // 每次都触发重排
});

// ✅ 虚拟 DOM 方式
// 1. 对比新旧虚拟 DOM
// 2. 计算最小变更
// 3. 批量更新真实 DOM
```

### 虚拟 DOM 的优势

| 优势 | 说明 |
|------|------|
| **批量更新** | 收集多次变更，一次性更新 DOM |
| **最小化操作** | Diff 计算最小变更，减少 DOM 操作 |
| **跨平台** | 虚拟 DOM 可渲染到不同平台（Web、Native、SSR） |
| **声明式编程** | 只描述 UI 状态，不关心更新细节 |

---

## Diff 算法

### 三大策略

```
策略1：树层级比较
┌─────────────────────────────────────┐
│  只比较同一层级的节点               │
│  跨层级移动 = 删除 + 创建           │
└─────────────────────────────────────┘

策略2：类型判断
┌─────────────────────────────────────┐
│  类型相同 → 更新属性，递归子节点     │
│  类型不同 → 删除旧树，创建新树       │
└─────────────────────────────────────┘

策略3：key 标识
┌─────────────────────────────────────┐
│  通过 key 识别节点身份              │
│  key 相同 → 复用节点                │
│  key 不同 → 创建新节点              │
└─────────────────────────────────────┘
```

### 策略1：同层比较

```javascript
// 旧树
<div>
  <A />
</div>

// 新树：A 移动到 span 下
<div>
  <span>
    <A />
  </span>
</div>

// React 的处理：不会移动 A
// 1. 发现 div 的子节点从 A 变成 span
// 2. 删除 A
// 3. 创建 span 和新的 A

// 为什么不做跨层移动？
// 跨层移动的检测复杂度是 O(n³)，不实用
```

### 策略2：类型判断

```javascript
// 类型相同：更新属性
<div className="old" />
<div className="new" />
// → 只更新 className

// 类型不同：替换整棵树
<div><Counter /></div>
<span><Counter /></span>
// → 删除 div 和 Counter，创建新的 span 和 Counter
// → Counter 的状态会丢失！
```

### 策略3：key 的作用

```javascript
// ❌ 没有 key：按索引比较
// 旧列表
<ul>
  <li>A</li>  // index 0
  <li>B</li>  // index 1
</ul>

// 新列表：在开头插入 C
<ul>
  <li>C</li>  // index 0 → 更新内容 A→C
  <li>A</li>  // index 1 → 更新内容 B→A
  <li>B</li>  // index 2 → 创建新节点
</ul>
// 结果：3 次 DOM 操作

// ✅ 有 key：按 key 比较
<ul>
  <li key="a">A</li>
  <li key="b">B</li>
</ul>

<ul>
  <li key="c">C</li>  // 新节点，创建
  <li key="a">A</li>  // key 匹配，复用
  <li key="b">B</li>  // key 匹配，复用
</ul>
// 结果：1 次 DOM 插入
```

---

## 列表 Diff 详解

### key 的正确使用

```javascript
// ❌ 使用 index 作为 key
{items.map((item, index) => (
  <Item key={index} data={item} />
))}
// 问题：删除/插入/排序时，index 变化导致错误复用

// ❌ 使用随机值作为 key
{items.map(item => (
  <Item key={Math.random()} data={item} />
))}
// 问题：每次渲染 key 都变，无法复用

// ✅ 使用稳定唯一标识
{items.map(item => (
  <Item key={item.id} data={item} />
))}
```

### index 作为 key 的问题

```javascript
// 场景：列表项有输入框
function List({ items }) {
  return items.map((item, index) => (
    <div key={index}>
      <span>{item.name}</span>
      <input defaultValue={item.name} />
    </div>
  ));
}

// 初始状态
items = [{name: 'A'}, {name: 'B'}, {name: 'C'}]
// 输入框显示：A, B, C

// 删除第一项后
items = [{name: 'B'}, {name: 'C'}]
// 期望输入框：B, C
// 实际输入框：A, B（因为 key=0,1 复用了旧的 input）
```

### 列表 Diff 算法流程

**白话理解**：

```
核心思想：
1. 用 key 找到"老朋友"（可复用的节点）
2. 判断老朋友需不需要"换座位"（移动）
3. 新来的同学要"安排座位"（创建）
4. 不见的同学要"清除座位"（删除）
```

**具体例子**：

```
旧列表: A B C D    （key 分别是 a b c d）
新列表: D A B C    （把 D 移到最前面）

Step 1: 构建旧列表的映射
  { a:0, b:1, c:2, d:3 }

Step 2: 遍历新列表，记录 lastIndex = 0

  D(key=d): 在旧列表位置 3，3 > lastIndex(0)
            → 不用移动，更新 lastIndex = 3

  A(key=a): 在旧列表位置 0，0 < lastIndex(3)
            → 需要移动！（因为它在 D 前面，但新列表要求在 D 后面）

  B(key=b): 在旧列表位置 1，1 < lastIndex(3)
            → 需要移动！

  C(key=c): 在旧列表位置 2，2 < lastIndex(3)
            → 需要移动！

结果: 移动 A、B、C，D 不动
实际 DOM 操作: 3 次移动
```

**简化代码**：

```javascript
function diffChildren(oldChildren, newChildren) {
  // 1. 构建旧节点的 key -> index 映射
  const oldKeyToIndex = {};
  oldChildren.forEach((child, index) => {
    oldKeyToIndex[child.key] = index;
  });

  // 2. 遍历新节点
  let lastIndex = 0;
  newChildren.forEach((newChild, newIndex) => {
    const oldIndex = oldKeyToIndex[newChild.key];

    if (oldIndex !== undefined) {
      // 找到可复用节点
      if (oldIndex < lastIndex) {
        // 需要移动：旧位置在 lastIndex 之前
        move(newChild, newIndex);
      }
      lastIndex = Math.max(lastIndex, oldIndex);
    } else {
      // 新节点，需要创建
      create(newChild, newIndex);
    }
  });

  // 3. 删除旧节点中未被复用的
  // ...
}
```

---

## 组件 Diff

### 函数组件 vs 类组件

```javascript
// 同类型组件：复用实例，更新 props
<MyComponent name="old" />
<MyComponent name="new" />
// → 同一个组件实例，props 更新

// 不同类型组件：销毁重建
<ComponentA />
<ComponentB />
// → 销毁 ComponentA，创建 ComponentB
// → 状态丢失
```

### 强制重建组件

```javascript
// 使用 key 强制重建
function Parent({ userId }) {
  // userId 变化时，UserProfile 完全重建
  return <UserProfile key={userId} userId={userId} />;
}

// 场景：切换用户时，确保组件状态重置
```

---

## 性能优化

### React.memo

```javascript
// 跳过不必要的 Diff
const MemoizedItem = React.memo(function Item({ data }) {
  return <div>{data.name}</div>;
});

// 只有 props 变化时才重新渲染
// 配合 key 使用效果更好
```

### 减少 Diff 范围

```javascript
// ❌ 整个列表重渲染
function List({ items, selectedId }) {
  return items.map(item => (
    <Item
      key={item.id}
      data={item}
      isSelected={item.id === selectedId}  // 每次都变
    />
  ));
}

// ✅ 缩小变化范围
function List({ items }) {
  return items.map(item => (
    <Item key={item.id} data={item} />
  ));
}

function Item({ data }) {
  const selectedId = useContext(SelectionContext);
  const isSelected = data.id === selectedId;
  // ...
}
```

---

## 常见面试题

### Q1：虚拟 DOM 一定比直接操作 DOM 快吗？

**不一定**。虚拟 DOM 的优势在于：
- 批量更新，减少重排重绘
- 声明式编程，代码更易维护
- 跨平台能力

简单场景下，直接操作 DOM 可能更快（少了 Diff 开销）。

### Q2：React Diff 的时间复杂度？

- **传统 Diff**：O(n³)
- **React Diff**：O(n)

通过三个假设（同层比较、类型判断、key 标识）降低复杂度。

### Q3：key 的作用是什么？为什么不能用 index？

**作用**：标识节点身份，帮助 React 判断节点是移动、新增还是删除。

**不用 index 的原因**：
- 列表变化时 index 会变
- 导致错误复用，状态错乱
- 性能下降（无法识别移动，变成删除+创建）

### Q4：为什么组件类型变了，状态会丢失？

React 假设不同类型的组件产生不同的树结构。类型变化时：
1. 卸载旧组件（调用 componentWillUnmount）
2. 创建新组件实例
3. 挂载新组件（调用 constructor、render）

状态存储在组件实例上，实例销毁则状态丢失。

### Q5：如何强制组件重建？

使用 `key` 属性：

```javascript
<Profile key={userId} userId={userId} />
```

`key` 变化时，React 认为是不同组件，会销毁重建。

## 相关文档

- [[React Fiber架构]]
- [[React性能优化]]
- [[React Hooks原理]]
