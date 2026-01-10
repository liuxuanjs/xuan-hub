---
aliases: ["ESLint配置", "TypeScript规范", "代码规范"]
title: "操作手册：ESLint与TypeScript规范"
tags: ["操作手册", "ESLint", "TypeScript", "代码规范", "Prettier"]
updated: 2025-01-10
---

## 概览

| 项目 | 说明 |
|------|------|
| **目标** | 统一团队代码风格，启用严格类型检查，自动化代码质量检查 |
| **预计时长** | 15 分钟 |
| **风险等级** | 低 |
| **回滚难度** | 简单（删除配置文件即可） |

### 前提条件

- [ ] 项目使用 Git 版本管理
- [ ] Node 18.x+（推荐使用 volta 管理）
- [ ] 使用 pnpm 作为包管理器
- [ ] 已安装 VSCode 编辑器

## 执行清单

- [ ] 步骤1：安装依赖
- [ ] 步骤2：创建 ESLint 配置
- [ ] 步骤3：创建 TypeScript 配置
- [ ] 步骤4：创建 Prettier 配置
- [ ] 步骤5：配置 package.json 脚本
- [ ] 步骤6：配置 VSCode
- [ ] 步骤7：验证配置

## 前置准备

### 核心工具包

**@be-link/eslint-config**：统一的 ESLint、Prettier 和 TypeScript 配置包

功能：
- 提供 React 和 Vue 两套配置
- 集成 TypeScript 严格类型检查
- 集成 Prettier 代码格式化
- 集成多个规则包（import、unicorn、promise 等）

支持技术栈：React + TypeScript + Vite、Vue 3 + TypeScript + Vite

## 操作步骤

### 阶段一：安装依赖

```bash
# 进入项目目录
cd /path/to/your/project

# 安装配置包和 peer dependencies
pnpm add -D @be-link/eslint-config
pnpm add -D eslint@^8 prettier@^3 typescript@^5
```

### 阶段二：创建配置文件

#### React 项目

**.eslintrc.js**

```javascript
module.exports = {
  root: true,
  extends: ['@be-link/eslint-config/react'],
  parserOptions: {
    project: './tsconfig.json',
  },
}
```

**tsconfig.json**

```json
{
  "extends": "@be-link/eslint-config/tsconfigs/react.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

**.prettierrc.js**

```javascript
module.exports = {
  ...require('@be-link/eslint-config/.prettierrc'),
}
```

#### Vue 项目

**.eslintrc.js**

```javascript
module.exports = {
  root: true,
  extends: ['@be-link/eslint-config/vue'],
  parserOptions: {
    project: './tsconfig.json',
  },
}
```

**tsconfig.json**

```json
{
  "extends": "@be-link/eslint-config/tsconfigs/vue.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src", "vite.config.ts", "env.d.ts"],
  "exclude": ["node_modules", "dist"]
}
```

### 阶段三：配置 package.json

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,vue,css,md}\"",
    "type-check": "tsc --noEmit"
  },
  "lint-staged": {
    "*.{ts,tsx,vue}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### 阶段四：配置 VSCode

**.vscode/settings.json**

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "eslint.validate": ["javascript", "javascriptreact", "typescript", "typescriptreact", "vue"],
  "[typescript]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[typescriptreact]": { "editor.defaultFormatter": "esbenp.prettier-vscode" },
  "[vue]": { "editor.defaultFormatter": "esbenp.prettier-vscode" }
}
```

**.vscode/extensions.json**

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "vue.volar"
  ]
}
```

## 验证检查表

| 检查项 | 预期结果 | 实际结果 | 状态 |
|--------|----------|----------|------|
| `pnpm lint` 运行 | 无报错或仅 warning | | |
| `pnpm type-check` 运行 | 无类型错误 | | |
| VSCode 保存自动格式化 | 代码自动整理 | | |

**验证命令**

```bash
# 类型检查
pnpm type-check

# ESLint 检查
pnpm lint

# 自动修复
pnpm lint:fix

# 格式化代码
pnpm format
```

**自检脚本**

```bash
echo "=== ESLint配置检查 ==="
echo "1. .eslintrc.js存在: $(test -f .eslintrc.js && echo 'OK' || echo 'FAIL')"
echo "2. tsconfig.json存在: $(test -f tsconfig.json && echo 'OK' || echo 'FAIL')"
echo "3. .prettierrc.js存在: $(test -f .prettierrc.js && echo 'OK' || echo 'FAIL')"
echo "4. .vscode/settings.json存在: $(test -f .vscode/settings.json && echo 'OK' || echo 'FAIL')"
echo "5. lint脚本配置: $(grep -q '\"lint\"' package.json && echo 'OK' || echo 'FAIL')"
```

## 回滚方案

### 触发条件

- ESLint 配置与项目冲突无法解决
- 构建流程异常

### 回滚步骤

```bash
# 1. 删除配置文件
rm .eslintrc.js .prettierrc.js

# 2. 恢复原有 tsconfig.json（如有备份）
git checkout tsconfig.json

# 3. 卸载依赖
pnpm remove @be-link/eslint-config eslint prettier
```

## 常见问题

### Q1: ESLint 报错 "Parsing error"

**现象**：`Parsing error: Cannot read file 'tsconfig.json'`

**解决**：

```javascript
// .eslintrc.js - 明确指定 tsconfig 路径
module.exports = {
  root: true,
  extends: ['@be-link/eslint-config/react'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
}
```

### Q2: VSCode 保存时没有自动格式化

**解决**：

```bash
# 检查扩展是否安装
code --list-extensions | grep -E "eslint|prettier"

# 安装缺失扩展
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode

# 重启 VSCode
```

### Q3: any 类型如何处理

**策略**：
- `@typescript-eslint/no-explicit-any` 设置为 `warn`（警告，不阻止提交）
- 新代码尽量避免使用 any
- 修改老代码时顺手把 any 改成具体类型
- 不需要专门花时间批量修复 any

```typescript
// 推荐：使用 unknown + 类型守卫
const data: unknown = await api.get('/unknown')
if (typeof data === 'object' && data !== null) {
  // 使用类型守卫
}
```

### Q4: 老项目迁移策略

**渐进式修复**：

```bash
# 按模块逐步修复
pnpm lint src/pages/user
pnpm lint:fix src/pages/user
git commit -m "refactor(user): 修复用户模块的lint问题"
```

原则：
- 新增代码：严格遵守规范
- 修改代码：只修复当前修改的文件
- 专项重构：逐个模块修复

## 参考资料

- [ESLint 官方文档](https://eslint.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [[Git提交规范与Hooks - 团队实施指南]]
