
---
aliases: ["React 18", "并发渲染", "Concurrent Features", "自动批处理"]
title: "React 18 新特性"
tags: ["React", "并发", "性能优化", "新特性"]
updated: 2025-09-19
---

## 概览
**问题**：React 17 存在性能瓶颈和用户体验问题
**方案**：React 18 引入并发特性、自动批处理、新 Hooks
**结论**：
- 并发渲染：可中断的渲染过程，避免阻塞用户交互
- 自动批处理：扩展到 Promise/setTimeout，减少重渲染
- 新 Hooks：useTransition、useDeferredValue 等提升性能

## 背景与动机
- **现状问题**：React 17 大任务会阻塞用户交互，批处理范围有限
- **解决目标**：实现并发渲染，改善用户体验，简化性能优化
- **约束条件**：保持向后兼容，渐进式升级

## 核心概念
| 概念 | 定义 | 适用场景 | 注意事项 |
|------|------|----------|----------|
| **并发渲染** | 可中断、恢复的渲染机制 | 大数据量渲染 | 需要使用 createRoot 启用 |
| **自动批处理** | 自动合并多个状态更新 | 所有异步操作 | 可用 flushSync 退出 |
| **useTransition** | 标记非紧急更新 | 搜索、切换场景 | 用于延迟状态更新 |
| **useDeferredValue** | 延迟值更新，优先级调度而非防抖 | 输入 + 大量渲染场景 | 配合 Suspense 避免频繁 loading |

## 实现方案
### 1. 启用并发特性
```jsx
// React 17 方式
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, container);

// React 18 方式 - 启用并发特性
import { createRoot } from 'react-dom/client';
const root = createRoot(container);
root.render(<App />);
```

### 2. 自动批处理
```jsx
// React 17：只在事件处理器中批处理
function handleClick() {
  setCount(c => c + 1);
  setFlag(f => !f);
  // 只重渲染一次
}

// React 18：扩展到 Promise、setTimeout
function handleClick() {
  fetchSomething().then(() => {
    setCount(c => c + 1);
    setFlag(f => !f);
    // 也会批处理，只重渲染一次
  });
}

// 退出批处理
import { flushSync } from 'react-dom';
flushSync(() => setCount(c => c + 1)); // 立即更新
flushSync(() => setFlag(f => !f));     // 再次立即更新
```

### 3. 新的 Hooks
**useTransition - 标记非紧急更新**：

核心思想：区分**紧急更新**和**非紧急更新**
- **紧急更新**：用户输入、点击按钮等需要立即响应
- **非紧急更新**：API 请求结果、大列表渲染等可以稍后处理

**真实场景1：API 搜索**
```jsx
// ❌ 没有 useTransition：输入卡顿，请求阻塞界面
function SlowAPISearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (value) => {
    setQuery(value); // 可能被阻塞
    
    if (value.trim()) {
      setLoading(true);
      try {
        // 问题：这个 API 请求会阻塞输入框更新
        const response = await fetch(`/api/search?q=${value}`);
        const data = await response.json();
        setResults(data.results); // 这行可能导致界面卡顿
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <input 
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="输入时可能卡顿..." 
      />
      {loading && <div>搜索中...</div>}
      <div>搜索结果：{results.length} 条</div>
    </>
  );
}

// ✅ 使用 useTransition：输入流畅，API 请求不阻塞
function SmartAPISearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (value) => {
    setQuery(value); // 紧急更新：立即响应，绝不被阻塞
    
    if (value.trim()) {
      startTransition(async () => {
        // 非紧急更新：API 请求和结果更新可以被中断
        try {
          const response = await fetch(`/api/search?q=${value}`);
          const data = await response.json();
          setResults(data.results);
        } catch (error) {
          console.error('搜索失败:', error);
        }
      });
    } else {
      startTransition(() => {
        setResults([]); // 清空结果也是非紧急更新
      });
    }
  };

  return (
    <>
      <input 
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="输入始终流畅！" 
      />
      <div>
        搜索结果：{results.length} 条
        {isPending && <span> 🔄 搜索中...</span>}
      </div>
      <div>
        {results.map(item => (
          <div key={item.id}>{item.title}</div>
        ))}
      </div>
    </>
  );
}

// 实际效果对比：
// 没有 useTransition：输入"React"时，每个字符输入都要等 API 返回才能显示
// 使用 useTransition：输入"React"时，字符立即显示，API 在后台调用
```

**真实场景2：防抖 + useTransition 组合**
```jsx
function AdvancedAPISearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();
  const timeoutRef = useRef(null);

  const handleSearch = (value) => {
    setQuery(value); // 立即更新输入框
    
    // 清除之前的定时器
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 防抖：500ms 后才发起请求
    timeoutRef.current = setTimeout(() => {
      if (value.trim()) {
        startTransition(async () => {
          try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
            const data = await response.json();
            setResults(data.results);
          } catch (error) {
            console.error('搜索失败:', error);
            setResults([]);
          }
        });
      } else {
        startTransition(() => setResults([]));
      }
    }, 500);
  };

  return (
    <>
      <input 
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="智能搜索：防抖 + 流畅输入" 
      />
      <div>
        {query && (
          <span>
            搜索 "{query}" 的结果：{results.length} 条
            {isPending && <span> 🔄 搜索中...</span>}
          </span>
        )}
      </div>
      <div>
        {results.map(item => (
          <div key={item.id}>
            <h4>{item.title}</h4>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}
```

**useDeferredValue - 延迟值更新**：

核心思想：**让输入响应优先，数据更新延后**
- 用户输入立即更新（紧急）
- 基于输入的数据处理延迟更新（非紧急）

**问题场景：搜索框 + 大量结果渲染**
```jsx
// ❌ 没有 useDeferredValue：输入卡顿
function SlowSearchResults() {
  const [query, setQuery] = useState('');

  // 模拟渲染大量搜索结果很慢
  const renderResults = (searchQuery) => {
    const results = [];
    for (let i = 0; i < 10000; i++) {
      if (`Item ${i}`.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push(<div key={i}>Item {i}</div>);
      }
    }
    return results;
  };

  return (
    <>
      <input 
        value={query} 
        onChange={e => setQuery(e.target.value)}
        placeholder="输入会卡顿..."
      />
      {/* 问题：每次输入都要重新渲染大量结果，阻塞输入 */}
      <div>{query && renderResults(query)}</div>
    </>
  );
}

// ✅ 使用 useDeferredValue：输入流畅
function SmoothSearchResults() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const renderResults = (searchQuery) => {
    const results = [];
    for (let i = 0; i < 10000; i++) {
      if (`Item ${i}`.toLowerCase().includes(searchQuery.toLowerCase())) {
        results.push(<div key={i}>Item {i}</div>);
      }
    }
    return results;
  };

  return (
    <>
      <input 
        value={query} 
        onChange={e => setQuery(e.target.value)}
        placeholder="输入流畅！"
      />
      {/* 
        关键：deferredQuery 会"滞后"于 query
        当用户快速输入时，只有最后的值会触发重新渲染
      */}
      <div>{deferredQuery && renderResults(deferredQuery)}</div>
      
      {/* 显示当前状态 */}
      <div style={{ fontSize: '12px', color: '#666' }}>
        输入值: "{query}" | 渲染值: "{deferredQuery}"
        {query !== deferredQuery && <span> 🔄 渲染延迟中...</span>}
      </div>
    </>
  );
}
```

**useDeferredValue + Suspense 组合：处理异步数据**
```jsx
// 模拟一个需要异步加载数据的组件
function AsyncSearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // 模拟 API 请求
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(response => response.json())
      .then(data => {
        if (!cancelled) {
          setResults(data.results);
          setLoading(false);
        }
      })
      .catch(error => {
        if (!cancelled) {
          console.error('搜索失败:', error);
          setResults([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  if (loading) {
    throw new Promise(() => {}); // 触发 Suspense
  }

  return (
    <div>
      <h3>搜索结果 ({results.length} 条)</h3>
      {results.map(item => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  );
}

// ✅ 完整的 useDeferredValue + Suspense 方案
function SmartSearchPage() {
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  return (
    <div>
      <input 
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="智能搜索：输入流畅 + 延迟加载"
        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
      />
      
      {/* 状态指示 */}
      <div style={{ margin: '10px 0', fontSize: '14px', color: '#666' }}>
        当前输入: "{query}"
        {query !== deferredQuery && <span> | 🔄 等待搜索: "{deferredQuery}"</span>}
      </div>

      {/* 核心组合：只有当 deferredQuery 改变时才触发搜索 */}
      {deferredQuery && (
        <Suspense fallback={
          <div style={{ padding: '20px', textAlign: 'center' }}>
            🔄 搜索 "{deferredQuery}" 中...
          </div>
        }>
          <AsyncSearchResults query={deferredQuery} />
        </Suspense>
      )}
    </div>
  );
}

// 实际效果：
// 1. 用户输入"React"时，输入框立即显示每个字符
// 2. deferredQuery 会等待用户输入稍微停顿后才更新
// 3. 只有最终的查询词会触发 API 请求和 Suspense
// 4. 避免了频繁的网络请求和无用的 loading 状态
```

**关键理解：**
- `useDeferredValue` 不是防抖，而是**渲染优先级调度**
- 当有更紧急的更新时，延迟值会等待
- 配合 `Suspense` 可以避免频繁的 loading 状态切换

**useId - 生成稳定唯一ID**：
```jsx
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

**useSyncExternalStore - 订阅外部数据**：
```jsx
function OnlineStatus() {
  const isOnline = useSyncExternalStore(
    (callback) => {
      window.addEventListener('online', callback);
      window.addEventListener('offline', callback);
      return () => {
        window.removeEventListener('online', callback);
        window.removeEventListener('offline', callback);
      };
    },
    () => navigator.onLine,
    () => true // SSR 初始值
  );

  return <h1>{isOnline ? '✅ Online' : '❌ Offline'}</h1>;
}
```

## 升级指南
### 基本升级步骤
```bash
# 1. 更新依赖
npm install react@18 react-dom@18 @types/react@18 @types/react-dom@18

# 2. 更新渲染方式
```

```jsx
// 旧方式
import ReactDOM from 'react-dom';
ReactDOM.render(<App />, container);

// 新方式
import { createRoot } from 'react-dom/client';
const root = createRoot(container);
root.render(<App />);
```

## 故障排查
| 症状 | 可能原因 | 排查方法 | 解决方案 |
|------|----------|----------|----------|
| 并发特性不生效 | 未使用 createRoot | 检查是否使用新的渲染 API | 替换为 createRoot |
| 组件重复渲染 | StrictMode 双重调用 | 检查开发环境 StrictMode | 正常现象，生产环境正常 |
| 批处理不工作 | 使用了 flushSync | 检查是否显式调用 flushSync | 移除不必要的 flushSync |
| useTransition 无效果 | 更新太快完成 | 检查更新是否真的耗时 | 确保更新确实需要时间 |
| 输入仍然卡顿 | 紧急更新也被包装了 | 检查输入处理是否在 startTransition 中 | 只包装非紧急更新，输入框更新要立即执行 |
| isPending 一直为 true | 状态更新陷入死循环 | 检查 startTransition 内部的依赖 | 避免在 transition 中触发新的 transition |
| API 请求重复发送 | 没有取消前一个请求 | 检查是否使用 AbortController | 在新请求前取消之前的请求 |
| 搜索结果错乱 | 请求返回顺序不一致 | 检查是否有请求竞态条件 | 使用 AbortController 或请求 ID 标识 |
| useDeferredValue 不生效 | 延迟的组件渲染很快 | 检查组件是否真的耗时 | 确保延迟的操作确实需要时间 |
| Suspense 频繁触发 | 没有使用 useDeferredValue | 检查是否直接传递快速变化的值 | 用 useDeferredValue 包装频繁变化的值 |

## 最佳实践
- ✅ **使用 createRoot**：启用并发特性
- ✅ **合理使用 useTransition**：
  - 紧急更新：用户输入、按钮点击、表单提交
  - 非紧急更新：API 请求结果、搜索结果、数据过滤、页面切换、大列表渲染
  - API 场景：结合 AbortController 取消过期请求
- ✅ **配合 useDeferredValue**：
  - 适用场景：输入框 + 大量结果渲染、搜索 + Suspense 组合
  - 关键理解：不是防抖，而是渲染优先级调度
  - 组合使用：useDeferredValue + Suspense 避免频繁 loading 状态
- ✅ **利用自动批处理**：减少不必要的重渲染
- ✅ **Suspense 数据获取**：配合数据库层实现加载状态
- ❌ **避免滥用 flushSync**：会破坏批处理优势
- ❌ **避免在高频操作中使用 useTransition**：如动画、滚动事件

## 实用代码示例
```jsx
// ✅ 真实场景：电商商品搜索
function EcommerceSearch() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [isPending, startTransition] = useTransition();
  const abortControllerRef = useRef(null);

  const searchProducts = async (searchTerm) => {
    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchTerm)}`, {
        signal: abortControllerRef.current.signal
      });
      
      if (!response.ok) throw new Error('搜索失败');
      
      const data = await response.json();
      return data.products;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('请求被取消');
        return null; // 请求被取消，不更新状态
      }
      throw error;
    }
  };

  const handleSearch = (value) => {
    setQuery(value); // 紧急更新：输入框立即响应
    
    if (value.trim().length >= 2) {
      startTransition(async () => {
        // 非紧急更新：API 搜索
        try {
          const results = await searchProducts(value.trim());
          if (results) { // 只有在请求未被取消时才更新
            setProducts(results);
          }
        } catch (error) {
          console.error('搜索失败:', error);
          setProducts([]);
        }
      });
    } else {
      startTransition(() => {
        setProducts([]); // 清空结果
      });
    }
  };

  return (
    <div>
      <input 
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="搜索商品（输入2个字符开始搜索）..."
        style={{ width: '100%', padding: '10px', fontSize: '16px' }}
      />
      
      <div style={{ marginTop: '10px' }}>
        {query.length >= 2 && (
          <div>
            搜索 "{query}" 找到 {products.length} 个商品
            {isPending && <span> 🔄 搜索中...</span>}
          </div>
        )}
      </div>
      
      <div style={{ marginTop: '10px' }}>
        {products.map(product => (
          <div key={product.id} style={{ 
            border: '1px solid #ddd', 
            padding: '10px', 
            margin: '5px 0',
            borderRadius: '4px'
          }}>
            <h4>{product.name}</h4>
            <p>价格: ¥{product.price}</p>
            <p>{product.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ✅ 实际项目：产品筛选
function ProductFilter() {
  const [category, setCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isPending, startTransition] = useTransition();

  const filterProducts = (cat, price) => {
    // 模拟复杂的产品筛选逻辑
    startTransition(() => {
      const filtered = products.filter(product => 
        (cat === 'all' || product.category === cat) &&
        product.price >= price[0] && 
        product.price <= price[1]
      );
      setFilteredProducts(filtered);
    });
  };

  return (
    <div>
      {/* 筛选控件 - 立即响应 */}
      <select 
        value={category} 
        onChange={(e) => {
          setCategory(e.target.value);
          filterProducts(e.target.value, priceRange);
        }}
      >
        <option value="all">所有分类</option>
        <option value="electronics">电子产品</option>
        <option value="clothing">服装</option>
      </select>
      
      <input 
        type="range" 
        min="0" 
        max="1000"
        onChange={(e) => {
          const newRange = [0, parseInt(e.target.value)];
          setPriceRange(newRange);
          filterProducts(category, newRange);
        }}
      />
      
      {/* 结果展示 - 可以被中断 */}
      <div>
        <h3>
          产品列表 ({filteredProducts.length} 个产品)
          {isPending && <span> 🔄 筛选中...</span>}
        </h3>
        {filteredProducts.map(product => (
          <div key={product.id}>{product.name} - ¥{product.price}</div>
        ))}
      </div>
    </div>
  );
}
```

## 参考资源
- 官方文档：[React 18](https://react.dev/blog/2022/03/29/react-v18)
- 并发特性：[Concurrent Features](https://react.dev/reference/react)