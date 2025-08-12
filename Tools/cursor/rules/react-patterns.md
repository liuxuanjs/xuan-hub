---
name: "react-patterns"
description: "React开发模式和最佳实践规范"
globs: 
  - "**/*.tsx"
  - "**/*.jsx"
  - "src/**/*.tsx"
  - "src/**/*.jsx"
  - "components/**/*.tsx"
  - "components/**/*.jsx"
priority: 800
---

# React 开发模式和最佳实践

你是一个React专家。请严格遵循以下模式和最佳实践，编写高性能、可维护的React代码。

## 🎯 核心原则 (React 18)

### React 18 新特性
- **并发渲染**：支持可中断的渲染，提升用户体验
- **自动批处理**：自动批处理状态更新，减少重渲染
- **Suspense 改进**：更好的异步组件支持
- **Strict Mode 增强**：更严格的开发时检查

### React 设计哲学
- **组件化思维**：将UI拆分为可复用的组件
- **单向数据流**：数据从父组件流向子组件
- **声明式编程**：描述UI应该是什么样子，而不是如何操作
- **不可变性**：避免直接修改state和props

## 🏗️ 组件设计模式

### 函数组件优先
```typescript
// ✅ 使用函数组件和Hooks
import React, { useState, useEffect } from 'react';

interface UserProfileProps {
  userId: string;
  onUserLoad?: (user: User) => void;
}

export function UserProfile({ 
  userId, 
  onUserLoad 
}: UserProfileProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const userData = await getUserById(userId);
        setUser(userData);
        onUserLoad?.(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [userId, onUserLoad]);

  if (loading) return <LoadingSpinner />;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};
```

### 组件组合模式
```typescript
// ✅ 复合组件模式
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
}

interface CardBodyProps {
  children: React.ReactNode;
}

interface CardFooterProps {
  children: React.ReactNode;
}

function Card({ children, className }: CardProps) {
  return (
    <div className={clsx('card', className)}>
      {children}
    </div>
  );
}

function CardHeader({ children, actions }: CardHeaderProps) {
  return (
    <div className="card-header">
      <div className="card-title">{children}</div>
      {actions && <div className="card-actions">{actions}</div>}
    </div>
  );
}

function CardBody({ children }: CardBodyProps) {
  return <div className="card-body">{children}</div>;
}

function CardFooter({ children }: CardFooterProps) {
  return <div className="card-footer">{children}</div>;
}

// 复合组件模式
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

// 使用示例
<Card>
  <Card.Header actions={<Button>Edit</Button>}>
    User Profile
  </Card.Header>
  <Card.Body>
    <UserInfo user={user} />
  </Card.Body>
  <Card.Footer>
    <Button variant="primary">Save</Button>
  </Card.Footer>
</Card>
```

### Render Props 模式
```typescript
// ✅ Render Props 模式
interface DataFetcherProps<T> {
  url: string;
  children: (state: {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
  }) => React.ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fetch failed'));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return children({ data, loading, error, refetch: fetchData });
}

// 使用示例
<DataFetcher<User[]> url="/api/users">
  {({ data: users, loading, error, refetch }) => (
    <>
      {loading && <LoadingSpinner />}
      {error && <ErrorMessage error={error} onRetry={refetch} />}
      {users && <UserList users={users} />}
    </>
  )}
</DataFetcher>
```

## 🪝 Hooks 使用规范

### 内置 Hooks 最佳实践
```typescript
// ✅ useState - 合理分组状态
function UserForm() {
  // 相关状态分组
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: 0
  });
  
  // 独立的UI状态
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 状态更新函数
  const updateFormData = useCallback((field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      {/* 表单内容 */}
    </form>
  );
}

// ✅ useEffect - 清晰的依赖和清理
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1);
    }, 1000);

    // 清理函数
    return () => clearInterval(interval);
  }, []); // 空依赖数组，只在挂载时运行

  return <div>Count: {count}</div>;
}

// ✅ useCallback - 防止不必要的重渲染
interface ListItemProps {
  item: Item;
  onItemClick: (id: string) => void;
}

const ListItem = memo<ListItemProps>(({ item, onItemClick }) => (
  <div onClick={() => onItemClick(item.id)}>
    {item.name}
  </div>
));

function ItemList({ items }: { items: Item[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 使用 useCallback 避免子组件重渲染
  const handleItemClick = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <div>
      {items.map(item => (
        <ListItem
          key={item.id}
          item={item}
          onItemClick={handleItemClick}
        />
      ))}
    </div>
  );
}

// ✅ useMemo - 缓存昂贵计算
function ExpensiveComponent({ data }: { data: DataItem[] }) {
  const processedData = useMemo(() => {
    return data
      .filter(item => item.active)
      .map(item => ({
        ...item,
        computedValue: expensiveComputation(item)
      }))
      .sort((a, b) => a.priority - b.priority);
  }, [data]);

  return (
    <div>
      {processedData.map(item => (
        <DataCard key={item.id} data={item} />
      ))}
    </div>
  );
}
```

### 自定义 Hooks
```typescript
// ✅ 自定义 Hook - 逻辑复用
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}

// ✅ 使用自定义 Hook
function Settings() {
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [language, setLanguage] = useLocalStorage('language', 'en');

  return (
    <div>
      <select value={theme} onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}

// ✅ API 请求 Hook
function useApi<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

// ✅ React 18 useId Hook - 生成稳定的唯一ID
import { useId } from 'react';

function FormField({ label, type = 'text' }: { label: string; type?: string }) {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} />
    </div>
  );
}

// ✅ React 18 useDeferredValue - 延迟非紧急更新
import { useDeferredValue, useMemo } from 'react';

function SearchResults({ query }: { query: string }) {
  const deferredQuery = useDeferredValue(query);
  
  const results = useMemo(() => {
    // 昂贵的搜索计算
    return searchItems(deferredQuery);
  }, [deferredQuery]);

  return (
    <div>
      {results.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

## ⚡ 性能优化模式

### React.memo 使用
```typescript
// ✅ 使用 React.memo 优化纯组件
interface UserCardProps {
  user: User;
  onEdit: (user: User) => void;
}

const UserCard = memo<UserCardProps>(({ user, onEdit }) => {
  const handleEditClick = useCallback(() => {
    onEdit(user);
  }, [user, onEdit]);

  return (
    <div className="user-card">
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <button onClick={handleEditClick}>Edit</button>
    </div>
  );
});

UserCard.displayName = 'UserCard';

// ✅ 自定义比较函数
const ExpensiveComponent = memo<ComponentProps>(
  ({ data, config }) => {
    // 组件实现
  },
  (prevProps, nextProps) => {
    // 自定义比较逻辑
    return (
      prevProps.data.id === nextProps.data.id &&
      prevProps.config.version === nextProps.config.version
    );
  }
);
```

### 代码分割和懒加载 (React 18 优化)
```typescript
// ✅ 组件懒加载
const LazyUserDashboard = lazy(() => import('./UserDashboard'));
const LazyAdminPanel = lazy(() => import('./AdminPanel'));

function App() {
  const [currentView, setCurrentView] = useState<'user' | 'admin'>('user');

  return (
    <div>
      <nav>
        <button onClick={() => setCurrentView('user')}>User</button>
        <button onClick={() => setCurrentView('admin')}>Admin</button>
      </nav>
      
      {/* React 18 支持多个 Suspense 边界 */}
      <Suspense fallback={<LoadingSpinner />}>
        {currentView === 'user' && (
          <Suspense fallback={<div>Loading dashboard...</div>}>
            <LazyUserDashboard />
          </Suspense>
        )}
        {currentView === 'admin' && (
          <Suspense fallback={<div>Loading admin panel...</div>}>
            <LazyAdminPanel />
          </Suspense>
        )}
      </Suspense>
    </div>
  );
}

// ✅ 路由级别的代码分割
const routes = [
  {
    path: '/dashboard',
    component: lazy(() => import('../pages/Dashboard'))
  },
  {
    path: '/profile',
    component: lazy(() => import('../pages/Profile'))
  }
];
```

### 虚拟化长列表
```typescript
// ✅ 使用 react-window 进行虚拟化
import { FixedSizeList as List } from 'react-window';

interface VirtualListProps {
  items: ListItem[];
}

const VirtualList: React.FC<VirtualListProps> = ({ items }) => {
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style}>
      <ListItem item={items[index]} />
    </div>
  );

  return (
    <List
      height={400}
      itemCount={items.length}
      itemSize={60}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

## 🎮 事件处理模式

### 事件处理最佳实践
```typescript
// ✅ 事件处理函数命名和类型
interface FormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

function ContactForm({ onSubmit, onCancel }: FormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });

  // 表单提交处理
  const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    // 验证
    if (!formData.name || !formData.email) {
      return;
    }

    onSubmit(formData);
  }, [formData, onSubmit]);

  // 输入变化处理
  const handleInputChange = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  // 键盘事件处理
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCancel();
    }
  }, [onCancel]);

  return (
    <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
      <input
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="Name"
      />
      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Email"
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleInputChange}
        placeholder="Message"
      />
      <button type="submit">Submit</button>
      <button type="button" onClick={onCancel}>Cancel</button>
    </form>
  );
}
```

## 🔄 状态管理模式

### Context 使用模式
```typescript
// ✅ Context + Reducer 模式
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  loading: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGOUT' };

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGOUT':
      return { ...state, user: null };
    default:
      return state;
  }
}

// Provider 组件
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    theme: 'light',
    loading: false
  });

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// 自定义 Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

// 使用示例
function UserProfile() {
  const { state, dispatch } = useAppContext();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  if (!state.user) {
    return <LoginForm />;
  }

  return (
    <div>
      <h1>Welcome, {state.user.name}</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## 🛡️ 错误边界模式

### 错误边界组件
```typescript
// ✅ 使用 react-error-boundary 库 (React 18 推荐)
import { ErrorBoundary } from 'react-error-boundary';

// 错误回退组件
function ErrorFallback({ error, resetErrorBoundary }: { 
  error: Error; 
  resetErrorBoundary: () => void;
}) {
  return (
    <div role="alert" className="error-boundary">
      <h2>Something went wrong</h2>
      <details>
        <summary>Error details</summary>
        <pre>{error.message}</pre>
      </details>
      <button onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  );
}

// 使用示例
function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // 发送错误报告到监控服务
        console.error('Error caught by boundary:', error, errorInfo);
      }}
      onReset={() => {
        // 重置应用状态
        window.location.reload();
      }}
    >
      <Header />
      <main>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </ErrorBoundary>
  );
}
```

## 🔍 调试和开发工具

### 开发时的最佳实践
```typescript
// ✅ 开发模式下的调试工具
function DebugInfo({ data }: { data: any }) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <details style={{ marginTop: '1rem', fontSize: '0.8rem' }}>
      <summary>Debug Info</summary>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </details>
  );
}

// ✅ 使用 React DevTools Profiler API
import { Profiler } from 'react';

function onRenderCallback(
  id: string,
  phase: 'mount' | 'update',
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number
) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Component ${id} ${phase} took ${actualDuration}ms`);
  }
}

// 使用示例
function App() {
  return (
    <Profiler id="App" onRender={onRenderCallback}>
      <Dashboard />
    </Profiler>
  );
}

// ✅ React 18 Strict Mode - 开发时启用
function App() {
  return (
    <React.StrictMode>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </React.StrictMode>
  );
}

// ✅ React 18 + TypeScript 项目中，类型检查由 TypeScript 处理
// 不需要额外的 PropTypes，TypeScript 提供更好的类型安全
```

## 📋 代码质量检查清单

### React 18 组件开发检查清单
- [ ] 使用函数组件，避免 class 组件
- [ ] 组件使用 TypeScript 严格类型定义
- [ ] 正确使用 useCallback 和 useMemo 优化性能
- [ ] 使用 useId 生成稳定的唯一ID
- [ ] 合理使用 useDeferredValue 延迟非紧急更新
- [ ] 事件处理函数有正确的类型定义
- [ ] 使用 React.memo 优化纯组件
- [ ] 副作用有正确的清理函数
- [ ] 依赖数组完整且准确
- [ ] 组件有 displayName（用于调试）
- [ ] 使用 react-error-boundary 处理错误
- [ ] 无障碍访问属性正确设置
- [ ] 开发环境启用 StrictMode

### React 18 性能优化检查清单
- [ ] 利用并发渲染特性
- [ ] 避免在 render 中创建对象和函数
- [ ] 长列表使用虚拟化
- [ ] 图片使用懒加载
- [ ] 路由级别的代码分割
- [ ] 合理使用 Suspense 边界
- [ ] 避免不必要的重渲染
- [ ] 状态结构合理，避免深度嵌套
- [ ] 移除 PropTypes，使用 TypeScript
