---
aliases: ["React优化", "memo", "useMemo", "useCallback"]
title: "React性能优化"
tags: ["React", "性能", "优化", "面试高频"]
updated: 2025-01-09
---

## 核心原则

**减少不必要的渲染**：组件只在数据真正变化时重渲染。

**优化手段**：
1. **React.memo**：跳过 props 未变的组件
2. **useMemo**：缓存计算结果
3. **useCallback**：缓存回调函数
4. **状态下沉**：状态放在需要的最小组件树中

## 渲染触发条件

组件重渲染的三种情况：

```javascript
// 1. 自身状态变化
const [count, setCount] = useState(0);
setCount(1);  // → 重渲染

// 2. 父组件重渲染（即使 props 没变）
function Parent() {
  const [state, setState] = useState(0);
  return <Child />;  // Parent 重渲染 → Child 也重渲染
}

// 3. Context 值变化
const value = useContext(MyContext);  // value 变 → 重渲染
```

---

## React.memo

### 基本用法

```javascript
// 默认：浅比较 props
const MemoizedChild = React.memo(function Child({ data, onClick }) {
  console.log('Child render');
  return <div onClick={onClick}>{data.name}</div>;
});

// 自定义比较函数
const MemoizedChild = React.memo(Child, (prevProps, nextProps) => {
  // 返回 true 跳过渲染，false 重渲染
  return prevProps.data.id === nextProps.data.id;
});
```

### 配合 useCallback

```javascript
// ❌ 每次父组件渲染，onClick 都是新函数
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log('clicked');
  };

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <MemoizedChild onClick={handleClick} />
      {/* memo 无效：handleClick 每次都是新引用 */}
    </>
  );
}

// ✅ 使用 useCallback 稳定函数引用
function Parent() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => {
    console.log('clicked');
  }, []);  // 空依赖，函数永不变

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <MemoizedChild onClick={handleClick} />
      {/* memo 生效：handleClick 引用稳定 */}
    </>
  );
}
```

### 什么时候用 memo

| 场景 | 是否需要 memo |
|------|--------------|
| 渲染开销大的组件 | ✅ 需要 |
| 频繁重渲染的父组件下 | ✅ 需要 |
| 列表项组件 | ✅ 需要 |
| 简单组件 | ❌ 不需要（memo 本身有开销） |
| 总是接收新 props | ❌ 不需要（比较后还是要渲染） |

---

## useMemo

### 基本用法

```javascript
// 缓存计算结果
const expensiveValue = useMemo(() => {
  return items.filter(item => item.active)
              .map(item => transform(item))
              .sort((a, b) => a.name.localeCompare(b.name));
}, [items]);  // 只有 items 变化时重新计算
```

### 常见场景

```javascript
// 1. 复杂计算
const sortedList = useMemo(() => {
  return [...list].sort((a, b) => a.score - b.score);
}, [list]);

// 2. 引用稳定（配合 memo）
const config = useMemo(() => ({
  theme: 'dark',
  size: 'large'
}), []);  // 对象引用稳定

// 3. 避免重复创建
const regex = useMemo(() => new RegExp(pattern, 'gi'), [pattern]);
```

### 什么时候不需要

```javascript
// ❌ 简单计算不需要
const double = useMemo(() => count * 2, [count]);
// 直接写：const double = count * 2;

// ❌ 基本类型不需要
const name = useMemo(() => firstName + lastName, [firstName, lastName]);
// 直接写：const name = firstName + lastName;
```

---

## useCallback

### 基本用法

```javascript
// 缓存函数引用
const handleClick = useCallback((id) => {
  setItems(items => items.filter(item => item.id !== id));
}, []);  // 依赖为空，函数永不变

// 有依赖的情况
const handleSearch = useCallback((query) => {
  fetch(`/api/search?q=${query}&type=${type}`);
}, [type]);  // type 变化时，函数更新
```

### useCallback vs useMemo

```javascript
// useCallback 是 useMemo 的语法糖
useCallback(fn, deps)
// 等价于
useMemo(() => fn, deps)
```

### 什么时候用

```javascript
// ✅ 传给 memo 子组件的回调
const MemoChild = React.memo(Child);

function Parent() {
  const handleClick = useCallback(() => {}, []);
  return <MemoChild onClick={handleClick} />;
}

// ✅ 作为 useEffect 依赖
const fetchData = useCallback(async () => {
  const data = await api.get(id);
  setData(data);
}, [id]);

useEffect(() => {
  fetchData();
}, [fetchData]);

// ❌ 不需要的场景：没有子组件依赖
function Component() {
  // 这个 useCallback 没有意义
  const handleClick = useCallback(() => {
    console.log('click');
  }, []);

  return <button onClick={handleClick}>Click</button>;
}
```

---

## 状态优化

### 状态下沉

```javascript
// ❌ 状态放在顶层，导致整棵树重渲染
function App() {
  const [inputValue, setInputValue] = useState('');

  return (
    <div>
      <input value={inputValue} onChange={e => setInputValue(e.target.value)} />
      <ExpensiveList />  {/* 每次输入都重渲染 */}
    </div>
  );
}

// ✅ 状态下沉到需要的组件
function App() {
  return (
    <div>
      <SearchInput />  {/* 状态在这里 */}
      <ExpensiveList />  {/* 不受影响 */}
    </div>
  );
}

function SearchInput() {
  const [inputValue, setInputValue] = useState('');
  return <input value={inputValue} onChange={e => setInputValue(e.target.value)} />;
}
```

### 状态拆分

```javascript
// ❌ 一个大状态对象
const [state, setState] = useState({
  user: null,
  posts: [],
  comments: [],
  settings: {}
});

// 更新 settings 会导致使用 user/posts/comments 的组件也重渲染

// ✅ 拆分状态
const [user, setUser] = useState(null);
const [posts, setPosts] = useState([]);
const [comments, setComments] = useState([]);
const [settings, setSettings] = useState({});
```

### 内容提升

```javascript
// ❌ 状态变化导致 children 重渲染
function Parent() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      <ExpensiveChild />  {/* 每次都重渲染 */}
    </div>
  );
}

// ✅ 将 children 提升到上层
function App() {
  return (
    <Parent>
      <ExpensiveChild />  {/* 不会重渲染 */}
    </Parent>
  );
}

function Parent({ children }) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <button onClick={() => setCount(c => c + 1)}>{count}</button>
      {children}  {/* children 引用稳定 */}
    </div>
  );
}
```

---

## Context 优化

### 问题：Context 变化导致所有消费者重渲染

```javascript
// ❌ 任何值变化都导致所有消费者重渲染
const AppContext = createContext();

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  return (
    <AppContext.Provider value={{ user, theme, setUser, setTheme }}>
      {children}
    </AppContext.Provider>
  );
}

// UserInfo 只用 user，但 theme 变化也会导致重渲染
function UserInfo() {
  const { user } = useContext(AppContext);
  return <div>{user?.name}</div>;
}
```

### 方案1：拆分 Context

```javascript
const UserContext = createContext();
const ThemeContext = createContext();

function Provider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <ThemeContext.Provider value={{ theme, setTheme }}>
        {children}
      </ThemeContext.Provider>
    </UserContext.Provider>
  );
}
```

### 方案2：分离状态和 dispatch

```javascript
const StateContext = createContext();
const DispatchContext = createContext();

function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// 只需要 dispatch 的组件不会因为 state 变化重渲染
function ActionButton() {
  const dispatch = useContext(DispatchContext);
  return <button onClick={() => dispatch({ type: 'increment' })}>+</button>;
}
```

---

## 列表优化

### 虚拟列表

```javascript
// 大列表使用虚拟滚动
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  return (
    <FixedSizeList
      height={400}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}
```

### 列表项优化

```javascript
// 列表项使用 memo
const ListItem = React.memo(function ListItem({ item, onSelect }) {
  return (
    <div onClick={() => onSelect(item.id)}>
      {item.name}
    </div>
  );
});

// 父组件稳定回调
function List({ items }) {
  const handleSelect = useCallback((id) => {
    // ...
  }, []);

  return items.map(item => (
    <ListItem key={item.id} item={item} onSelect={handleSelect} />
  ));
}
```

---

## 懒加载

### 组件懒加载

```javascript
import { lazy, Suspense } from 'react';

// 动态导入
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 路由懒加载

```javascript
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Suspense>
  );
}
```

---

## 性能检测

### React DevTools Profiler

```javascript
// 开发环境使用 Profiler
<Profiler id="App" onRender={onRenderCallback}>
  <App />
</Profiler>

function onRenderCallback(
  id,         // Profiler 的 id
  phase,      // "mount" 或 "update"
  actualDuration,  // 本次渲染耗时
  baseDuration,    // 无优化时的估计耗时
  startTime,
  commitTime
) {
  console.log({ id, phase, actualDuration });
}
```

### 检测不必要的渲染

```javascript
// 自定义 Hook 检测渲染次数
function useRenderCount(name) {
  const count = useRef(0);
  count.current++;

  useEffect(() => {
    console.log(`${name} rendered ${count.current} times`);
  });
}
```

---

## 优化清单

### 组件层面

- [ ] 大组件使用 `React.memo`
- [ ] 传给子组件的回调使用 `useCallback`
- [ ] 传给子组件的对象/数组使用 `useMemo`
- [ ] 列表项组件使用 `memo` + 稳定 `key`

### 状态层面

- [ ] 状态下沉到需要的最小组件
- [ ] 频繁变化的状态与稳定状态分离
- [ ] Context 按使用场景拆分

### 渲染层面

- [ ] 大列表使用虚拟滚动
- [ ] 路由/组件懒加载
- [ ] 避免在 render 中创建对象/函数

---

## 常见面试题

### Q1：memo、useMemo、useCallback 的区别？

| 对比 | 作用 | 缓存对象 |
|------|------|---------|
| React.memo | 跳过组件重渲染 | 组件 |
| useMemo | 缓存计算结果 | 值 |
| useCallback | 缓存函数引用 | 函数 |

### Q2：什么时候不需要优化？

- 简单计算（`a + b`）
- 组件本身渲染很快
- 不会频繁重渲染的组件
- 优化后收益小于开销

### Q3：如何定位性能问题？

1. React DevTools Profiler 找慢组件
2. 检查组件渲染次数
3. 检查 props 是否稳定
4. 检查是否有不必要的重渲染

### Q4：useCallback 为什么要配合 memo 使用？

单独使用 useCallback 只是稳定函数引用，不会减少渲染。
配合 memo 使用时，稳定的 props 才能让 memo 判断跳过渲染。

## 相关文档

- [[React Hooks原理]]
- [[React虚拟DOM与Diff]]
- [[React18新特性]]
