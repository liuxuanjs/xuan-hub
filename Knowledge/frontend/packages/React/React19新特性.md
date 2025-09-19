
---
aliases: ["React 19", "React Compiler", "use Hook", "Server Components"]
title: "React 19 新特性"
tags: ["React", "编译器", "性能优化", "新特性"]
updated: 2025-09-19
---

## 概览
**问题**：React 18 仍需要手动性能优化，Server Components 不够完善
**方案**：React 19 引入编译器自动优化、新 Hooks、增强 Server Components
**结论**：
- React Compiler：自动添加 memoization，简化性能优化
- 新 Hooks：use、useOptimistic、useActionState 等
- Server Components：增强服务端渲染能力

⚠️ **注意**：React 19 目前仍在开发中，以下特性可能会有变化

## 背景与动机
- **现状问题**：需要手动使用 memo、useMemo 等优化性能
- **解决目标**：编译器自动优化，简化开发体验
- **约束条件**：保持向后兼容，渐进式采用

## 核心概念
| 概念 | 定义 | 适用场景 | 注意事项 |
|------|------|----------|----------|
| **React Compiler** | 自动优化的编译器 | 替代手动 memoization | 目前为实验性质 |
| **use Hook** | 统一数据获取和 Context | Promise 和 Context 消费 | 可以条件调用 |
| **useOptimistic** | 乐观更新 Hook | 网络请求的乐观响应 | 配合 Suspense 使用 |
| **Server Components** | 服务端组件增强 | SSR 和数据预取 | 需要框架支持 |

## 实现方案
### 1. React Compiler
**自动性能优化**：
```jsx
// 之前需要手动优化
const ExpensiveComponent = React.memo(({ items, filter }) => {
  const filteredItems = useMemo(() => 
    items.filter(item => item.category === filter), 
    [items, filter]
  );

  return (
    <div>
      {filteredItems.map(item => <Item key={item.id} item={item} />)}
    </div>
  );
});

// React Compiler 自动优化
function ExpensiveComponent({ items, filter }) {
  const filteredItems = items.filter(item => item.category === filter);
  // 编译器自动添加 memoization

  return (
    <div>
      {filteredItems.map(item => <Item key={item.id} item={item} />)}
    </div>
  );
}
```

### 2. 新的 Hooks
**use Hook - 统一数据获取**：
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
```

**useOptimistic - 乐观更新**：

**什么是乐观更新？**
- **传统方式**：用户操作 → 等待服务器响应 → 更新界面
- **乐观更新**：用户操作 → 立即更新界面 → 后台发送请求 → 失败时回滚

**为什么需要乐观更新？**
提升用户体验，让操作感觉更快速响应，特别适用于：
- 聊天应用发送消息
- 点赞/收藏功能
- 评论提交
- 购物车操作

**问题场景：传统聊天消息发送**
```jsx
// ❌ 传统方式：用户感觉很慢
function SlowChatComponent({ messages, sendMessage }) {
  const [newMessages, setNewMessages] = useState([]);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (formData) => {
    const messageText = formData.get('message');
    setSending(true);
    
    try {
      // 用户要等待这个请求完成才能看到消息
      const response = await sendMessage(messageText);
      setNewMessages(prev => [...prev, response]);
    } catch (error) {
      alert('发送失败！');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* 用户只能看到已确认的消息 */}
      {[...messages, ...newMessages].map(msg => (
        <div key={msg.id}>{msg.text}</div>
      ))}
      
      <form action={handleSubmit}>
        <input type="text" name="message" placeholder="输入消息..." />
        <button type="submit" disabled={sending}>
          {sending ? '发送中...' : '发送'}
        </button>
      </form>
    </>
  );
}
```

**✅ 使用 useOptimistic：立即响应**
```jsx
function OptimisticChatComponent({ messages, sendMessage }) {
  // useOptimistic 的两个参数：
  // 1. messages: 真实的、已确认的数据
  // 2. reducer: 如何将乐观数据合并到真实数据中
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages, // 基础数据（来自服务器的真实消息）
    (currentMessages, optimisticMessage) => {
      // 这个函数定义如何将新的乐观消息添加到列表中
      // currentMessages: 当前的消息列表（真实 + 乐观）
      // optimisticMessage: 要添加的乐观消息
      return [...currentMessages, {
        ...optimisticMessage,
        id: `temp-${Date.now()}`, // 临时 ID
        status: 'sending',         // 标记为发送中
        isOptimistic: true        // 标记为乐观更新
      }];
    }
  );

  const handleSubmit = async (formData) => {
    const messageText = formData.get('message');
    
    // 步骤1：立即添加乐观消息（用户立即看到）
    addOptimisticMessage({
      text: messageText,
      timestamp: new Date().toISOString(),
      user: 'me'
    });
    
    try {
      // 步骤2：后台发送真实请求
      await sendMessage(messageText);
      // 成功后，服务器会返回真实消息，自动替换乐观消息
    } catch (error) {
      // 步骤3：失败时，乐观消息会自动消失
      alert('发送失败，消息已撤回');
      // useOptimistic 会自动回滚到原始状态
    }
  };

  return (
    <>
      {/* 用户看到：真实消息 + 乐观消息 */}
      {optimisticMessages.map(msg => (
        <div 
          key={msg.id} 
          style={{ 
            opacity: msg.isOptimistic ? 0.7 : 1,
            fontStyle: msg.isOptimistic ? 'italic' : 'normal'
          }}
        >
          {msg.text}
          {msg.status === 'sending' && (
            <small style={{ color: '#666' }}> 📤 发送中...</small>
          )}
        </div>
      ))}
      
      <form action={handleSubmit}>
        <input type="text" name="message" placeholder="输入消息..." />
        <button type="submit">发送</button>
      </form>
    </>
  );
}
```

**真实场景：点赞功能**
```jsx
function LikeButton({ postId, initialLiked, initialCount }) {
  // 乐观更新点赞状态
  const [optimisticState, setOptimisticState] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (currentState, action) => {
      switch (action.type) {
        case 'toggle_like':
          return {
            liked: !currentState.liked,
            count: currentState.liked 
              ? currentState.count - 1 
              : currentState.count + 1
          };
        default:
          return currentState;
      }
    }
  );

  const handleLike = async () => {
    // 立即更新界面（乐观更新）
    setOptimisticState({ type: 'toggle_like' });
    
    try {
      // 后台发送请求
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        body: JSON.stringify({ liked: !optimisticState.liked })
      });
      
      if (!response.ok) {
        throw new Error('点赞失败');
      }
      
      // 成功后，真实数据会通过 props 更新，自动同步状态
    } catch (error) {
      // 失败时，乐观状态会自动回滚
      console.error('点赞失败:', error);
      // 可以显示错误提示
      alert('点赞失败，请重试');
    }
  };

  return (
    <button 
      onClick={handleLike}
      style={{ 
        color: optimisticState.liked ? 'red' : 'gray',
        opacity: optimisticState.liked !== initialLiked ? 0.7 : 1
      }}
    >
      ❤️ {optimisticState.count}
      {optimisticState.liked !== initialLiked && <small> 处理中...</small>}
    </button>
  );
}
```

**关键理解：**
1. **乐观更新不是魔法**：失败时会自动回滚到原始状态
2. **双重状态**：真实状态（来自服务器）+ 乐观状态（用户看到的）
3. **用户体验优先**：让用户感觉操作立即生效
4. **错误处理重要**：失败时要给用户清晰的反馈

**useActionState - 表单状态管理**：
```jsx
async function updateName(previousState, formData) {
  const name = formData.get('name');
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
```jsx
// 服务器组件 - 数据获取
async function BlogPost({ id }) {
  const post = await fetchPost(id);
  
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.excerpt} />
      <h1>{post.title}</h1>
      <p>{post.content}</p>
      <Comments postId={id} />
    </article>
  );
}

// 客户端组件 - 交互
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

## 升级指南
### 配置 React Compiler
```bash
# 1. 安装编译器
npm install babel-plugin-react-compiler

# 2. 配置 Babel
```

```javascript
// babel.config.js
module.exports = {
  plugins: [
    ['babel-plugin-react-compiler', {
      // 编译器选项
    }],
  ],
};
```

## 故障排查
| 症状 | 可能原因 | 排查方法 | 解决方案 |
|------|----------|----------|----------|
| 编译器不工作 | 配置错误 | 检查 Babel 配置 | 正确配置 react-compiler 插件 |
| use Hook 报错 | 不在 Suspense 中 | 检查是否包装 Suspense | 在 Suspense 边界内使用 |
| 乐观更新不回滚 | 错误处理缺失 | 检查 catch 逻辑 | 添加错误处理和状态回滚 |
| Server Components 错误 | 客户端代码混入 | 检查 'use client' 指令 | 正确标记客户端组件 |
| 乐观更新不回滚 | 错误处理不当 | 检查 try-catch 逻辑 | 确保错误时会触发重新渲染 |
| 乐观状态显示错误 | reducer 函数逻辑错误 | 检查 useOptimistic 的 reducer | 确保正确合并乐观数据和真实数据 |

## 最佳实践
- ✅ **拥抱编译器**：让 React Compiler 处理优化，减少手动 memo/useMemo
- ✅ **乐观更新**：
  - 适用场景：聊天消息、点赞收藏、评论提交、购物车操作
  - 关键原则：用户操作立即生效，失败时自动回滚
  - 错误处理：必须有清晰的失败反馈机制
- ✅ **合理分离**：Server Components 处理数据，Client Components 处理交互
- ✅ **表单增强**：使用 useActionState 简化表单状态管理
- ❌ **避免过度优化**：不再需要大量手动性能优化
- ❌ **避免混合使用**：Server/Client Components 边界要清晰
- ⚠️ **实验性特性**：密切关注官方文档的变化

## 实用代码示例
```jsx
// ✅ 编译器自动优化
function OptimizedComponent({ items, filter }) {
  // 编译器自动添加 memoization
  const filtered = items.filter(item => item.category === filter);
  
  return (
    <div>
      {filtered.map(item => <Item key={item.id} item={item} />)}
    </div>
  );
}

// ✅ 购物车乐观更新：完整示例
function ShoppingCart({ cartItems, updateCart }) {
  const [optimisticCart, updateOptimisticCart] = useOptimistic(
    cartItems,
    (currentCart, action) => {
      switch (action.type) {
        case 'add_item':
          const existingItem = currentCart.find(item => item.id === action.item.id);
          if (existingItem) {
            return currentCart.map(item =>
              item.id === action.item.id
                ? { ...item, quantity: item.quantity + 1, isOptimistic: true }
                : item
            );
          }
          return [...currentCart, { ...action.item, quantity: 1, isOptimistic: true }];
          
        case 'remove_item':
          return currentCart.filter(item => item.id !== action.itemId);
          
        case 'update_quantity':
          return currentCart.map(item =>
            item.id === action.itemId
              ? { ...item, quantity: action.quantity, isOptimistic: true }
              : item
          );
          
        default:
          return currentCart;
      }
    }
  );

  // 添加商品到购物车
  const addToCart = async (product) => {
    // 立即更新界面（乐观更新）
    updateOptimisticCart({ type: 'add_item', item: product });
    
    try {
      // 后台发送请求
      await updateCart({ type: 'add', productId: product.id });
      // 成功后，真实数据会通过 props 更新
    } catch (error) {
      // 失败时显示错误，乐观状态自动回滚
      alert(`添加 ${product.name} 失败：${error.message}`);
    }
  };

  // 更新商品数量
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      updateOptimisticCart({ type: 'remove_item', itemId });
    } else {
      updateOptimisticCart({ type: 'update_quantity', itemId, quantity: newQuantity });
    }
    
    try {
      await updateCart({ type: 'update', itemId, quantity: newQuantity });
    } catch (error) {
      alert(`更新数量失败：${error.message}`);
    }
  };

  const totalPrice = optimisticCart.reduce(
    (sum, item) => sum + item.price * item.quantity, 
    0
  );

  return (
    <div>
      <h2>购物车 ({optimisticCart.length} 件商品)</h2>
      
      {optimisticCart.map(item => (
        <div 
          key={item.id} 
          style={{ 
            padding: '10px',
            border: '1px solid #ddd',
            margin: '5px 0',
            opacity: item.isOptimistic ? 0.7 : 1,
            backgroundColor: item.isOptimistic ? '#f0f8ff' : 'white'
          }}
        >
          <h4>{item.name}</h4>
          <p>单价: ¥{item.price}</p>
          <div>
            数量: 
            <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
              -
            </button>
            <span style={{ margin: '0 10px' }}>{item.quantity}</span>
            <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
              +
            </button>
            {item.isOptimistic && (
              <small style={{ color: '#666', marginLeft: '10px' }}>
                🔄 更新中...
              </small>
            )}
          </div>
          <p>小计: ¥{(item.price * item.quantity).toFixed(2)}</p>
        </div>
      ))}
      
      <div style={{ marginTop: '20px', fontSize: '18px', fontWeight: 'bold' }}>
        总计: ¥{totalPrice.toFixed(2)}
      </div>
      
      <button 
        style={{ 
          marginTop: '10px', 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white' 
        }}
        onClick={() => alert('前往结算')}
      >
        结算
      </button>
    </div>
  );
}
```

## 参考资源
- 官方文档：[React 19](https://react.dev/blog)
- React Compiler：[React Compiler Beta](https://react.dev/learn/react-compiler)
