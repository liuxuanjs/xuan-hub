# Cursor Rules 配置指南

这个目录包含了完整的 Cursor AI 编辑器规则配置，专门针对 **React 18 + TypeScript** 组件库开发优化。

## 📁 目录结构

```
tools/cursor/rules/
├── README.md                    # 本说明文件
├── component-library.md         # 组件库开发规范
├── typescript-standards.md      # TypeScript 编码标准
├── react-patterns.md           # React 开发模式
├── testing-guidelines.md       # 测试规范
└── accessibility.md            # 无障碍访问规范
```

## 🚀 使用方法

### 1. 复制到项目根目录
将整个 `rules` 目录复制到你的项目根目录下的 `.cursor/` 目录：

```bash
cp -r tools/cursor/rules /your-project/.cursor/
```

### 2. 根据项目需求调整
- 修改 `globs` 匹配模式以适应你的项目结构
- 调整 `priority` 优先级
- 添加或删除特定规则

### 3. 验证配置
重启 Cursor 编辑器，规则将自动生效。

## 📋 规则优先级

- `priority: 1000` - 组件库核心规范
- `priority: 900` - TypeScript 类型安全
- `priority: 800` - React 性能优化
- `priority: 700` - 测试和文档
- `priority: 600` - 无障碍访问

## 🛠️ 自定义规则

每个规则文件都使用以下格式：

```markdown
---
name: "规则名称"
description: "规则描述"
globs: 
  - "适用的文件模式"
priority: 优先级数字
---

# 规则内容（Markdown 格式）
```

## 📚 相关资源

- [Cursor 官方文档](https://cursor.sh)
- [React 18 官方文档](https://react.dev)
- [TypeScript 官方文档](https://typescriptlang.org)
- [Testing Library 文档](https://testing-library.com)
- [React Error Boundary](https://github.com/bvaughn/react-error-boundary)

## ⚠️ 重要说明

这些规则专门为 **React 18 + TypeScript** 项目设计：

- ✅ 使用函数组件，避免 class 组件
- ✅ 利用 React 18 新特性（并发渲染、自动批处理等）
- ✅ 使用 TypeScript 严格模式，移除 PropTypes
- ✅ 推荐使用 react-error-boundary 库
- ✅ 支持 React 18 新 Hooks（useId、useDeferredValue 等）
