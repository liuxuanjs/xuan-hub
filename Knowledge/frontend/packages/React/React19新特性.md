
## React 19 新特性

> 注意：React 19 目前仍在开发中，以下特性可能会有变化。

### 1. React Compiler

React 19 引入了革命性的编译器，自动优化组件性能。

```jsx
// 之前需要手动优化
const ExpensiveComponent = React.memo(({ items, filter }) => {
  const filteredItems = useMemo(() => 
    items.filter(item => item.category === filter), 
    [items, filter]
  );

  return (
    <div>
      {filteredItems.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
});

// React Compiler 会自动优化
function ExpensiveComponent({ items, filter }) {
  const filteredItems = items.filter(item => item.category === filter);

  return (
    <div>
      {filteredItems.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </div>
  );
}
// 编译器自动添加 memoization
```

### 2. 新的 Hooks

#### use Hook
统一的数据获取 Hook，可以处理 Promise 和 Context。

```jsx
import { use, Suspense } from 'react';

// 使用 Promise
function UserProfile({ userPromise }) {
  const user = use(userPromise);
  return <h1>{user.name}</h1>;
}

// 使用 Context
function ProfilePage() {
  const theme = use(ThemeContext);
  return <div className={theme}>...</div>;
}

// 条件调用
function Comments({ commentsPromise }) {
  const comments = use(commentsPromise);
  
  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>{comment.text}</div>
      ))}
    </div>
  );
}
```

#### useOptimistic
乐观更新的 Hook。

```jsx
import { useOptimistic, useState } from 'react';

function Thread({ messages, sendMessage }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, { ...newMessage, sending: true }]
  );

  async function formAction(formData) {
    const message = formData.get('message');
    addOptimisticMessage({ text: message });
    await sendMessage(message);
  }

  return (
    <>
      {optimisticMessages.map((message, index) => (
        <div key={index}>
          {message.text}
          {message.sending && <small> (Sending...)</small>}
        </div>
      ))}
      <form action={formAction}>
        <input type="text" name="message" placeholder="Hello!" />
        <button type="submit">Send</button>
      </form>
    </>
  );
}
```

#### useActionState
处理表单动作状态的 Hook。

```jsx
import { useActionState } from 'react';

async function updateName(previousState, formData) {
  const name = formData.get('name');
  // 模拟 API 调用
  await new Promise(resolve => setTimeout(resolve, 1000));
  if (name === '') {
    return { error: 'Name is required' };
  }
  return { success: `Hello, ${name}!` };
}

function MyComponent() {
  const [state, submitAction, isPending] = useActionState(updateName, null);

  return (
    <form action={submitAction}>
      <input type="text" name="name" />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Updating...' : 'Update'}
      </button>
      {state?.error && <p style={{ color: 'red' }}>{state.error}</p>}
      {state?.success && <p style={{ color: 'green' }}>{state.success}</p>}
    </form>
  );
}
```

### 3. Server Components 增强

React 19 进一步改进了服务器组件。

```jsx
// 服务器组件
async function BlogPost({ id }) {
  const post = await fetchPost(id);
  
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <Comments postId={id} />
    </article>
  );
}

// 客户端组件
'use client';

function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  
  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id}>{comment.text}</div>
      ))}
    </div>
  );
}
```

### 4. 新的 ref 回调清理机制

React 19 改进了 ref 回调的清理机制。

```jsx
function MyComponent() {
  return (
    <input
      ref={(ref) => {
        // 设置 ref
        if (ref) {
          ref.focus();
        }
        
        // 返回清理函数
        return () => {
          // 组件卸载时调用
          console.log('清理 ref');
        };
      }}
    />
  );
}
```

### 5. 改进的 Context 性能

React 19 优化了 Context 的性能。

```jsx
// 更好的 Context 性能
const ThemeContext = createContext();

function App() {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={theme}>
      <Header />
      <Main />
      <Footer />
    </ThemeContext.Provider>
  );
}

// 只有真正使用 Context 的组件才会重新渲染
function Header() {
  const theme = useContext(ThemeContext);
  return <header className={theme}>Header</header>;
}
```

### 6. 文档元数据支持

React 19 内置支持文档元数据。

```jsx
function BlogPost({ post }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.excerpt} />
      <meta property="og:title" content={post.title} />
      
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

### 7. 样式表支持

React 19 改进了样式表的处理。

```jsx
function App() {
  return (
    <html>
      <head>
        <link rel="stylesheet" href="/styles.css" precedence="default" />
        <link rel="stylesheet" href="/theme.css" precedence="high" />
      </head>
      <body>
        <div id="root">
          <HomePage />
        </div>
      </body>
    </html>
  );
}
```

---

## 升级指南

### 从 React 18 升级到 React 19

1. **安装 React Compiler**
```bash
npm install babel-plugin-react-compiler
```

2. **配置 Babel**
```javascript
// babel.config.js
module.exports = {
  plugins: [
    ['babel-plugin-react-compiler', {
      // 配置选项
    }],
  ],
};
```

---

## 最佳实践

### React 19 最佳实践

1. **充分利用 React Compiler**
```jsx
// 让编译器处理优化，避免过度优化
function Component({ items }) {
  // 不需要手动 useMemo
  const expensiveValue = items.map(item => item.value * 2);
  
  return <div>{expensiveValue}</div>;
}
```

2. **使用 useOptimistic 提升用户体验**
```jsx
function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage) => [...state, newMessage]
  );

  async function sendMessage(text) {
    addOptimisticMessage({ text, id: Date.now() });
    try {
      const response = await api.sendMessage(text);
      setMessages(current => [...current, response]);
    } catch (error) {
      // 处理错误，移除乐观更新
    }
  }
}
```

3. **合理使用 Server Components**
```jsx
// 服务器组件：数据获取
async function PostList() {
  const posts = await fetchPosts();
  
  return (
    <div>
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}

// 客户端组件：交互
'use client';
function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  
  return (
    <div>
      <h3>{post.title}</h3>
      <button onClick={() => setLiked(!liked)}>
        {liked ? '♥️' : '♡'}
      </button>
    </div>
  );
}
```

---

## 总结

- **React 19** 引入了革命性的编译器，进一步简化开发体验，增强了 Server Components 和表单处理能力
- 升级时需要注意 API 变化和新的最佳实践
- 充分利用新特性可以显著提升应用性能和用户体验

> 持续关注 React 官方文档获取最新信息：https://react.dev/
