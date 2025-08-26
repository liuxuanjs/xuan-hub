
## 1. 并发渲染 (Concurrent Rendering)

React 18 引入了并发渲染，这是 React 18 最重要的特性之一。

```jsx
// React 18 之前
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, container);

// React 18 使用 createRoot 启用并发特性
import { createRoot } from 'react-dom/client';
const root = createRoot(container);
root.render(<App />);
```

**主要优势：**
- 可中断的渲染过程
- 更好的用户体验
- 避免阻塞浏览器

## 2. 自动批处理 (Automatic Batching)

React 18 扩展了批处理的范围，包括 Promise、setTimeout 等异步操作。

```jsx
// React 18 之前：只有 React 事件处理器中的更新会被批处理
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // React 只会重新渲染一次（批处理）
}

// React 18：所有更新都会被自动批处理
function handleClick() {
  fetchSomething().then(() => {
    setCount(c => c + 1);
    setFlag(f => !f);
    // React 会批处理这些更新（即使在 Promise 中）
  });
}

// 如果需要退出批处理，使用 flushSync
import { flushSync } from 'react-dom';

function handleClick() {
  flushSync(() => {
    setCount(c => c + 1);
  });
  // React 已经更新 DOM
  flushSync(() => {
    setFlag(f => !f);
  });
  // React 再次更新 DOM
}
```

## 3. Suspense 改进

React 18 对 Suspense 进行了重大改进，支持服务端渲染。

```jsx
// 基本用法
function ProfilePage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ProfileDetails />
      <Suspense fallback={<PostsGlimmer />}>
        <ProfileTimeline />
      </Suspense>
    </Suspense>
  );
}

// 配合 lazy 使用
const OtherComponent = React.lazy(() => import('./OtherComponent'));

function MyComponent() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <OtherComponent />
      </Suspense>
    </div>
  );
}
```

## 4. 新的 Hooks

### useDeferredValue
延迟更新非紧急状态，提高性能。

```jsx
import { useDeferredValue, useState } from 'react';

function SearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <>
      <input value={query} onChange={e => setQuery(e.target.value)} />
      <Suspense fallback={<h2>Loading...</h2>}>
        <SearchResults query={deferredQuery} />
      </Suspense>
    </>
  );
}
```

### useTransition
标记状态更新为非紧急，避免阻塞用户交互。

```jsx
import { useTransition, useState } from 'react';

function TabContainer() {
  const [isPending, startTransition] = useTransition();
  const [tab, setTab] = useState('about');

  function selectTab(nextTab) {
    startTransition(() => {
      setTab(nextTab);
    });
  }

  return (
    <>
      <TabButton isActive={tab === 'about'} onClick={() => selectTab('about')}>
        About
      </TabButton>
      <TabButton isActive={tab === 'posts'} onClick={() => selectTab('posts')}>
        Posts
      </TabButton>
      {isPending && <Spinner />}
      <TabContent tab={tab} />
    </>
  );
}
```

### useId
生成稳定的唯一 ID，特别适用于 SSR。

```jsx
import { useId } from 'react';

function Checkbox() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>Do you like React?</label>
      <input type="checkbox" name="react" id={id} />
    </>
  );
}
```

### useSyncExternalStore
订阅外部数据源。

```jsx
import { useSyncExternalStore } from 'react';

function ChatIndicator() {
  const isOnline = useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true // 服务端渲染时的初始值
  );

  return <h1>{isOnline ? '✅ Online' : '❌ Disconnected'}</h1>;
}

function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}
```

### useInsertionEffect
专门用于 CSS-in-JS 库的 effect。

```jsx
import { useInsertionEffect } from 'react';

function useCSS(rule) {
  useInsertionEffect(() => {
    // 在这里插入 <style> 标签或操作 CSS
    if (!isInserted.has(rule)) {
      isInserted.add(rule);
      document.head.appendChild(getStyleForRule(rule));
    }
  });
  return rule;
}
```

## 5. Strict Mode 改进

React 18 的 Strict Mode 会故意双重调用某些函数来检测副作用。

```jsx
// 这些函数会在 Strict Mode 下被双重调用
// - 组件构造函数
// - render 方法
// - setState 更新函数
// - useState、useMemo、useReducer 的初始化函数

function Counter() {
  const [count, setCount] = useState(() => {
    console.log('这在 Strict Mode 下会被调用两次');
    return 0;
  });

  return <div>{count}</div>;
}
```


---

## 升级指南

### 从 React 17 升级到 React 18

1. **更新依赖**
```bash
npm install react@18 react-dom@18
```

2. **使用新的 root API**
```jsx
// 旧方式
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, container);

// 新方式
import { createRoot } from 'react-dom/client';
const root = createRoot(container);
root.render(<App />);
```

3. **更新 TypeScript 类型**
```bash
npm install @types/react@18 @types/react-dom@18
```

## 最佳实践

1. **使用 Suspense 进行数据获取**
```jsx
function App() {
  return (
    <Suspense fallback={<Loading />}>
      <DataComponent />
    </Suspense>
  );
}
```

2. **合理使用 useTransition**
```jsx
// 用于非紧急更新
function SearchResults() {
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  function handleSearch(newQuery) {
    setQuery(newQuery); // 紧急更新
    startTransition(() => {
      setResults(searchFunction(newQuery)); // 非紧急更新
    });
  }
}
```

3. **使用 useDeferredValue 优化性能**
```jsx
function App() {
  const [text, setText] = useState('hello');
  const deferredText = useDeferredValue(text);
  
  return (
    <>
      <input value={text} onChange={e => setText(e.target.value)} />
      <SlowList text={deferredText} />
    </>
  );
}
```

## 总结

- **React 18** 专注于并发特性和性能优化，引入了并发渲染、自动批处理、新的 Hooks 等