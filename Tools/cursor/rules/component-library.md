---
name: "ui-component-library"
description: "UI组件库完整开发规范"
globs: 
  - "src/components/**/*.tsx"
  - "src/components/**/*.ts"
  - "src/hooks/**/*.ts"
  - "components/**/*.tsx"
  - "components/**/*.ts"
priority: 1000
---

# UI组件库开发规范

你是一个专业的React组件库开发助手。请严格遵循以下规范生成高质量的组件代码。

## 🎯 核心原则

### 组件设计原则
- **单一职责**：每个组件只负责一个功能
- **可复用性**：组件应该在不同场景下可复用
- **可扩展性**：支持通过 props 进行定制
- **一致性**：遵循统一的设计和API规范

### 命名规范
- 组件名使用 **PascalCase**：`Button`, `FormInput`, `UserCard`
- 文件名与组件名保持一致：`Button.tsx`
- 目录名使用 **kebab-case**：`form-input/`, `user-card/`
- Props 接口命名：`组件名 + Props`，如 `ButtonProps`
- 事件处理函数：`handle + 动作`，如 `handleClick`

## 📁 文件结构规范

每个组件必须包含以下文件：

```
components/button/
├── Button.tsx          # 主组件文件
├── Button.types.ts     # 类型定义
├── Button.module.scss  # 样式文件
├── Button.test.tsx     # 单元测试
├── Button.stories.tsx  # Storybook 故事
└── index.ts           # 导出文件
```

## 🔧 组件模板

### 基础组件结构
```typescript
import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { ButtonProps } from './Button.types';
import styles from './Button.module.scss';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'medium',
    loading = false,
    disabled = false,
    className,
    ...props 
  }, ref) => {
    const buttonClass = clsx(
      styles.button,
      styles[variant],
      styles[size],
      {
        [styles.loading]: loading,
        [styles.disabled]: disabled
      },
      className
    );

    return (
      <button
        ref={ref}
        className={buttonClass}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <span className={styles.spinner} aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

### 类型定义规范
```typescript
// Button.types.ts
import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  /** 按钮变体样式 */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large';
  
  /** 是否显示加载状态 */
  loading?: boolean;
  
  /** 按钮内容 */
  children: ReactNode;
  
  /** 自定义类名 */
  className?: string;
  
  /** 点击事件处理函数 */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
```

### 导出文件
```typescript
// index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button.types';
```

## 🎨 样式规范

### CSS Modules 使用
```scss
// Button.module.scss
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--border-radius-md);
  font-family: var(--font-family);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.primary {
  background-color: var(--color-primary);
  color: var(--color-white);
  
  &:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
  }
}

.secondary {
  background-color: var(--color-secondary);
  color: var(--color-text);
  
  &:hover:not(:disabled) {
    background-color: var(--color-secondary-hover);
  }
}

.small {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 32px;
}

.medium {
  padding: 12px 24px;
  font-size: 16px;
  min-height: 40px;
}

.large {
  padding: 16px 32px;
  font-size: 18px;
  min-height: 48px;
}

.loading {
  position: relative;
  color: transparent;
}

.spinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
```

## 📝 Props 设计原则

### 必须遵循的规则
1. **提供合理的默认值**
2. **支持所有原生 HTML 属性**
3. **使用 TypeScript 严格类型定义**
4. **支持 ref 转发**
5. **提供完整的 JSDoc 注释**

### Props 命名约定
- 布尔类型：`is`, `has`, `can`, `should` 开头
- 事件处理：`on` 开头，如 `onClick`, `onSubmit`
- 回调函数：`handle` 开头，如 `handleChange`
- 渲染函数：`render` 开头，如 `renderItem`

## 🧪 测试规范

### 单元测试模板
```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button loading>Loading</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    function TestComponent() {
      const ref = useRef<HTMLButtonElement>(null);
      
      useEffect(() => {
        if (ref.current) {
          expect(ref.current).toBeInstanceOf(HTMLButtonElement);
        }
      });
      
      return <Button ref={ref}>Button</Button>;
    }
    
    render(<TestComponent />);
  });
});
```

## 📖 Storybook 故事

### 故事文件模板
```typescript
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger', 'ghost', 'link'],
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading Button',
    loading: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Button size="small">Small</Button>
      <Button size="medium">Medium</Button>
      <Button size="large">Large</Button>
    </div>
  ),
};
```

## ♿ 无障碍访问要求

### 必须包含的无障碍特性
- **语义化 HTML**：使用正确的 HTML 标签
- **ARIA 属性**：提供必要的 aria-* 属性
- **键盘导航**：支持 Tab、Enter、Space 等键盘操作
- **焦点管理**：清晰的焦点指示器
- **屏幕阅读器**：提供有意义的标签和描述

### 无障碍检查清单
- [ ] 组件支持键盘导航
- [ ] 提供合适的 ARIA 标签
- [ ] 颜色对比度符合 WCAG AA 标准
- [ ] 焦点状态清晰可见
- [ ] 屏幕阅读器可以正确理解组件

## 🚀 性能优化

### 必须遵循的性能规范
- **使用 React.memo** 包装纯组件
- **合理使用 useCallback** 和 **useMemo**
- **避免在 render 中创建对象**
- **正确设置依赖数组**
- **使用 CSS-in-JS 时考虑性能影响**

### 性能优化示例
```typescript
import React, { memo, useCallback } from 'react';

export const OptimizedButton = memo<ButtonProps>(({ onClick, ...props }) => {
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
  }, [onClick]);

  return <Button onClick={handleClick} {...props} />;
});
```

## 📋 代码质量检查清单

在提交代码前，请确保：

- [ ] 组件使用 TypeScript 严格模式
- [ ] 所有 Props 都有完整的类型定义和 JSDoc 注释
- [ ] 组件支持 ref 转发
- [ ] 样式使用 CSS Modules 或 styled-components
- [ ] 包含完整的单元测试
- [ ] Storybook 故事覆盖所有用例
- [ ] 无障碍访问测试通过
- [ ] 性能测试通过
- [ ] 代码通过 ESLint 和 Prettier 检查

## 🔄 组件更新和维护

### 版本管理
- 遵循语义化版本规范
- 重大变更需要提供迁移指南
- 保持向后兼容性

### 文档维护
- 及时更新 API 文档
- 更新 Storybook 故事
- 维护更新日志
