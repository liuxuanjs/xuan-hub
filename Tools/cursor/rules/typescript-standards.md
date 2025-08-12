---
name: "typescript-standards"
description: "TypeScript编码标准和类型安全规范"
globs: 
  - "**/*.ts"
  - "**/*.tsx"
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "components/**/*.ts"
  - "components/**/*.tsx"
priority: 900
---

# TypeScript 编码标准

你是一个TypeScript专家。请严格遵循以下规范，确保代码的类型安全性和可维护性。

## 🎯 核心原则

### 类型安全优先
- **严格模式**：启用所有 TypeScript 严格检查
- **类型覆盖**：所有变量、函数参数和返回值都必须有明确类型
- **避免 any**：使用 `unknown`、`object` 或具体类型替代 `any`
- **空值安全**：正确处理 `null` 和 `undefined`

## ⚙️ TypeScript 配置

### tsconfig.json 推荐配置
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,
    "noUncheckedIndexedAccess": true
  }
}
```

## 🏷️ 类型定义规范

### Interface vs Type
优先使用 `interface`，以下情况使用 `type`：

```typescript
// ✅ 优先使用 interface
interface UserProps {
  id: string;
  name: string;
  email?: string;
}

// ✅ 以下情况使用 type
type Status = 'loading' | 'success' | 'error';
type EventHandler<T> = (event: T) => void;
type UserWithMethods = User & {
  save(): Promise<void>;
};
```

### 命名约定
```typescript
// ✅ Interface 使用 PascalCase
interface UserProfile {
  id: string;
  name: string;
}

// ✅ Type 别名使用 PascalCase
type ButtonVariant = 'primary' | 'secondary' | 'danger';

// ✅ 泛型参数使用单个大写字母，语义化命名
interface ApiResponse<TData, TError = Error> {
  data: TData;
  error?: TError;
}

// ✅ 常量使用 UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;

// ✅ 函数使用 camelCase
function getUserData(): Promise<User> {}

// ✅ 枚举使用 PascalCase
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest'
}
```

## 📦 导入和导出规范

### 导入顺序
```typescript
// 1. React 相关导入
import React, { useState, useEffect, useCallback } from 'react';

// 2. 第三方库导入
import clsx from 'clsx';
import { format } from 'date-fns';

// 3. 内部模块导入（按字母顺序）
import { apiClient } from '@/api/client';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';

// 4. 相对路径导入
import { validateEmail } from '../utils/validation';
import { UserCard } from './UserCard';

// 5. 类型导入（分组放在最后）
import type { User } from '@/types/user';
import type { ApiResponse } from './types';
```

### 导出规范
```typescript
// ✅ 优先使用命名导出
export function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}

// ✅ 类型导出
export type { ButtonProps } from './Button.types';

// ✅ 默认导出只用于主要组件
export default Button;

// ✅ 批量导出
export { Button } from './Button';
export { Input } from './Input';
export { Form } from './Form';
```

## 🔧 函数和变量类型

### 函数类型定义
```typescript
// ✅ 函数声明 - 明确返回类型
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ✅ 箭头函数 - 参数和返回类型
const processUser = (user: User): Promise<ProcessedUser> => {
  return processUserData(user);
};

// ✅ 高阶函数
function withLoading<TProps extends object>(
  Component: React.ComponentType<TProps>
): React.ComponentType<TProps & { loading?: boolean }> {
  return (props) => {
    const { loading, ...restProps } = props;
    if (loading) return <div>Loading...</div>;
    return <Component {...restProps as TProps} />;
  };
}

// ✅ 事件处理函数
const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
  event.preventDefault();
  // 处理表单提交
};

// ✅ 异步函数
async function fetchUserData(id: string): Promise<User | null> {
  try {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}
```

### 变量类型定义
```typescript
// ✅ 基本类型（通常可以推断，但复杂情况需明确）
const userName: string = 'John Doe';
const userAge: number = 30;
const isActive: boolean = true;

// ✅ 数组类型
const userIds: string[] = ['1', '2', '3'];
const users: User[] = [];

// ✅ 对象类型
const config: AppConfig = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3
};

// ✅ 联合类型
const status: 'idle' | 'loading' | 'success' | 'error' = 'idle';

// ✅ 可选属性
const userPreferences: {
  theme?: 'light' | 'dark';
  language?: string;
  notifications?: boolean;
} = {};
```

## 🎭 泛型使用规范

### 泛型命名
```typescript
// ✅ 语义化泛型命名
interface ApiResponse<TData, TError = Error> {
  data: TData;
  error?: TError;
  status: 'success' | 'error';
}

// ✅ 组件泛型
interface ListProps<TItem> {
  items: TItem[];
  renderItem: (item: TItem) => React.ReactNode;
  keyExtractor: (item: TItem) => string;
}

// ✅ Hook 泛型
function useApi<TData, TParams = void>(
  endpoint: string
): {
  data: TData | null;
  loading: boolean;
  error: Error | null;
  refetch: (params?: TParams) => Promise<void>;
} {
  // Hook 实现
}
```

### 泛型约束
```typescript
// ✅ 使用泛型约束
interface Identifiable {
  id: string;
}

function updateEntity<T extends Identifiable>(
  entity: T,
  updates: Partial<Omit<T, 'id'>>
): T {
  return { ...entity, ...updates };
}

// ✅ keyof 约束
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// ✅ 条件类型
type ApiEndpoint<T> = T extends string 
  ? `/api/${T}` 
  : never;
```

## 🛡️ 类型守卫和断言

### 类型守卫
```typescript
// ✅ 类型谓词函数
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    typeof (obj as User).id === 'string' &&
    typeof (obj as User).name === 'string'
  );
}

// ✅ 使用类型守卫
function processUserData(data: unknown): User | null {
  if (isUser(data)) {
    return data; // 这里 data 的类型是 User
  }
  return null;
}

// ✅ in 操作符
function handleApiResponse(response: SuccessResponse | ErrorResponse): void {
  if ('data' in response) {
    // response 是 SuccessResponse
    console.log(response.data);
  } else {
    // response 是 ErrorResponse
    console.error(response.error);
  }
}
```

### 类型断言（谨慎使用）
```typescript
// ✅ 必要时使用类型断言
const userInput = document.getElementById('user-input') as HTMLInputElement;

// ✅ 非空断言（确定不为 null/undefined 时）
const user = users.find(u => u.id === userId)!;

// ❌ 避免 any 断言
const data = response as any; // 不推荐

// ✅ 更好的方式
const data = response as ApiResponse<User>;
```

## 📋 实用工具类型

### 常用工具类型
```typescript
// ✅ Partial - 所有属性可选
interface UpdateUserRequest extends Partial<User> {
  id: string; // id 必须存在
}

// ✅ Pick - 选择特定属性
type UserSummary = Pick<User, 'id' | 'name' | 'email'>;

// ✅ Omit - 排除特定属性
type CreateUserRequest = Omit<User, 'id' | 'createdAt'>;

// ✅ Record - 键值对类型
type UserRoles = Record<string, 'admin' | 'user' | 'guest'>;

// ✅ 自定义工具类型
type NonNullable<T> = T extends null | undefined ? never : T;
type RequiredKeys<T> = {
  [K in keyof T]-?: T[K] extends undefined ? never : K;
}[keyof T];
```

## 🔍 错误处理和空值安全

### 错误处理模式
```typescript
// ✅ Result 模式
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await apiClient.getUser(id);
    return { success: true, data: user };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error')
    };
  }
}

// ✅ 使用 Result
const result = await fetchUser('123');
if (result.success) {
  console.log(result.data.name); // 类型安全
} else {
  console.error(result.error.message);
}
```

### 空值安全
```typescript
// ✅ 可选链和空值合并
const userName = user?.profile?.name ?? 'Anonymous';

// ✅ 类型守卫处理空值
function processUser(user: User | null): string {
  if (!user) {
    return 'No user provided';
  }
  return `Processing user: ${user.name}`;
}

// ✅ 非空断言（确定不为空时）
const activeUser = users.find(u => u.active)!;
```

## 📝 JSDoc 和类型注释

### JSDoc 规范
```typescript
/**
 * 计算购物车总价
 * @param items - 购物车商品列表
 * @param discountRate - 折扣率 (0-1)
 * @returns 计算后的总价
 * @throws {Error} 当折扣率无效时抛出错误
 * @example
 * ```typescript
 * const total = calculateCartTotal(items, 0.1);
 * console.log(total); // 90
 * ```
 */
function calculateCartTotal(
  items: CartItem[], 
  discountRate: number = 0
): number {
  if (discountRate < 0 || discountRate > 1) {
    throw new Error('Discount rate must be between 0 and 1');
  }
  
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 - discountRate);
}
```

## ⚠️ 常见错误和最佳实践

### 避免的错误模式
```typescript
// ❌ 使用 any
function processData(data: any): any {
  return data.someProperty;
}

// ✅ 使用具体类型
function processData<T extends { someProperty: unknown }>(data: T): T['someProperty'] {
  return data.someProperty;
}

// ❌ 忽略错误处理
function parseJson(json: string) {
  return JSON.parse(json);
}

// ✅ 正确的错误处理
function parseJson<T = unknown>(json: string): Result<T> {
  try {
    const data = JSON.parse(json) as T;
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Parse failed')
    };
  }
}

// ❌ 类型断言滥用
const element = document.querySelector('.button') as HTMLButtonElement;

// ✅ 类型守卫
function isButtonElement(element: Element | null): element is HTMLButtonElement {
  return element instanceof HTMLButtonElement;
}

const element = document.querySelector('.button');
if (isButtonElement(element)) {
  element.click(); // 类型安全
}
```

### 性能相关的类型优化
```typescript
// ✅ 使用 const assertions
const themes = ['light', 'dark'] as const;
type Theme = typeof themes[number]; // 'light' | 'dark'

// ✅ 延迟类型计算
type ExpensiveType<T> = T extends string ? ComplexCalculation<T> : never;
// 只在需要时计算

// ✅ 避免深度递归类型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

## 🔧 开发工具配置

### ESLint TypeScript 规则
```json
{
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": "error",
  "@typescript-eslint/explicit-function-return-type": "warn",
  "@typescript-eslint/prefer-nullish-coalescing": "error",
  "@typescript-eslint/prefer-optional-chain": "error"
}
```

### VS Code 设置
```json
{
  "typescript.preferences.strictFunctionTypes": true,
  "typescript.preferences.noImplicitReturns": true,
  "typescript.suggest.autoImports": true
}
```
