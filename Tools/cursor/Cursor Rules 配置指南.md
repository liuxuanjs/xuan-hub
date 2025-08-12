
## 什么是 Cursor Rules

Cursor Rules 是通过 `.cursor/rules/` 目录下的规则文件来指导 Cursor AI 编辑器的配置系统。规则文件使用 Markdown 格式，包含前置元数据（YAML frontmatter），让 AI 理解项目约定和编码风格。

## 目录
- [基本配置](#基本配置)
- [组件库专用规则](#组件库专用规则)
- [规则文件示例](#规则文件示例)
- [规则文件组织](#规则文件组织)
- [最佳实践](#最佳实践)

## 基本配置

### 目录结构
```
.cursor/
└── rules/
    ├── component-library.md      # 组件库开发规范
    ├── typescript-standards.md   # TypeScript 编码标准
    ├── react-patterns.md        # React 开发模式
    └── testing-guidelines.md    # 测试规范
```

### 规则文件格式
每个规则文件都包含 YAML frontmatter 和 Markdown 内容：

```markdown
---
name: "规则名称"
description: "规则描述"
globs: ["适用文件模式"]
priority: 优先级数字
---

# 规则内容（Markdown 格式）
```

## 组件库专用规则

### 1. 组件开发规范 (`.cursor/rules/component-library.md`)

```markdown
---
name: "component-library-standards"
description: "UI组件库开发规范"
globs: 
  - "src/components/**/*.tsx"
  - "src/components/**/*.ts"
priority: 1000
---

# 组件库开发规范

## 组件命名
- 组件名使用 PascalCase：`Button`, `FormInput`
- 文件名与组件名一致：`Button.tsx`
- 目录名使用 kebab-case：`form-input/`

## 组件结构
每个组件必须包含：
- 主组件文件：`ComponentName.tsx`
- 样式文件：`ComponentName.module.scss`
- 类型定义：`ComponentName.types.ts`
- 测试文件：`ComponentName.test.tsx`
- 故事文件：`ComponentName.stories.tsx`

## Props 设计
- 接口命名：`ComponentNameProps`
- 提供合理默认值
- 支持 ref 转发
- 完整 TypeScript 类型定义

## 样式规范
- 使用 CSS Modules
- 遵循 BEM 命名规范
- 支持主题变量
- 确保无障碍访问
```

### 2. TypeScript 规范 (`.cursor/rules/typescript-standards.md`)

```markdown
---
name: "typescript-standards"
description: "TypeScript编码标准"
globs: 
  - "**/*.ts"
  - "**/*.tsx"
priority: 900
---

# TypeScript 编码标准

## 类型定义
- 严格模式：启用所有严格检查
- 避免使用 `any`，使用 `unknown` 替代
- 优先使用 `interface` 而不是 `type`
- 为所有函数参数和返回值提供类型

## 导入顺序
1. React 相关导入
2. 第三方库导入
3. 项目内部导入
4. 相对路径导入

## 命名约定
- 接口：PascalCase，如 `UserProfile`
- 类型别名：PascalCase，如 `ButtonVariant`
- 常量：UPPER_SNAKE_CASE，如 `DEFAULT_TIMEOUT`
- 函数：camelCase，如 `getUserData`
```

### 3. React 开发模式 (`.cursor/rules/react-patterns.md`)

```markdown
---
name: "react-patterns"
description: "React开发模式和最佳实践"
globs: 
  - "**/*.tsx"
  - "**/*.jsx"
priority: 800
---

# React 开发模式

## 组件模式
- 使用函数组件和 Hooks
- 合理使用 `React.memo`
- 正确使用 `useCallback` 和 `useMemo`
- 避免在 render 中创建对象

## Hook 规则
- Hook 只能在组件顶层调用
- 自定义 Hook 以 `use` 开头
- 依赖数组要完整准确

## 性能优化
- 避免不必要的重渲染
- 合理使用 `key` 属性
```

## 规则文件示例

### 完整的组件库规则文件

```markdown
---
name: "ui-component-library"
description: "UI组件库完整开发规范"
globs: 
  - "src/components/**/*.tsx"
  - "src/components/**/*.ts"
  - "src/hooks/**/*.ts"
priority: 1000
---

# UI组件库开发规范

你是一个专业的React组件库开发助手。请严格遵循以下规范：

## 组件开发原则

### 文件结构
每个组件必须包含以下文件：
```
components/button/
├── Button.tsx          # 主组件
├── Button.types.ts     # 类型定义
├── Button.module.scss  # 样式文件
├── Button.test.tsx     # 单元测试
├── Button.stories.tsx  # Storybook故事
└── index.ts           # 导出文件
```

### 组件模板
```typescript
import React, { forwardRef } from 'react';
import { ButtonProps } from './Button.types';
import styles from './Button.module.scss';

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'medium', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${styles.button} ${styles[variant]} ${styles[size]}`}
        {...props}
      >
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
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** 按钮变体 */
  variant?: 'primary' | 'secondary' | 'danger';
  /** 按钮尺寸 */
  size?: 'small' | 'medium' | 'large';
  /** 是否加载中 */
  loading?: boolean;
  /** 按钮内容 */
  children: React.ReactNode;
}
```

### 样式规范
- 使用 CSS Modules
- 遵循 BEM 命名约定
- 支持 CSS 变量主题
- 确保响应式设计
- 提供无障碍访问支持

### 测试要求
- 每个组件必须有单元测试
- 测试覆盖率不低于 80%
- 使用 @testing-library/react
- 测试用户交互和边界情况

### 文档要求
- 使用 JSDoc 注释所有 Props
- Storybook 故事展示所有用例
- 提供使用示例
- 说明无障碍访问特性

## 代码质量要求
- TypeScript 严格模式
- 所有 Props 必须有类型定义
- 避免使用 any 类型
- 合理使用 React.memo 优化性能
- 正确处理 ref 转发


## 规则文件组织

### 按功能划分
```
.cursor/rules/
├── core/
│   ├── typescript.md      # TS基础规范
│   ├── react.md          # React基础规范
│   └── accessibility.md  # 无障碍访问规范
├── components/
│   ├── form-controls.md  # 表单组件规范
│   ├── navigation.md     # 导航组件规范
│   └── feedback.md       # 反馈组件规范
└── testing/
    ├── unit-tests.md     # 单元测试规范
    └── e2e-tests.md      # 端到端测试规范
```

### 按优先级组织
- `priority: 1000` - 核心开发规范
- `priority: 900` - 类型和安全规范  
- `priority: 800` - 性能和优化规范
- `priority: 700` - 测试和文档规范

## 最佳实践

### 1. 规则文件编写技巧
- 使用具体的代码示例
- 提供反例说明
- 包含常见错误和解决方案
- 定期更新和维护规则

### 2. 团队协作
- 规则文件版本控制
- 定期团队评审规则
- 新成员规则培训
- 规则执行情况监控

### 3. 工具集成
- 结合 ESLint 规则
- 配合 Prettier 格式化
- 集成 CI/CD 检查
- 使用 Husky 提交钩子