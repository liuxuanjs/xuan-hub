# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

个人技术知识库，包含前端/后端技术文档、工作规范、示例项目。使用 Obsidian 管理，pnpm 作为包管理器。

## 目录结构

- `knowledge/` - 技术知识库（前端基础、框架、工程化、浏览器、后端）
- `work/` - 工作相关（项目文档、团队规范）
- `demos/` - 示例项目
- `resources/templates/` - 文档模板

## Demo 项目命令

### websocket-react（Webpack + React 18 + MobX）
```bash
cd demos/websocket-react
pnpm install
pnpm dev          # 启动前端开发服务
pnpm server       # 启动 WebSocket 服务端
pnpm dev:full     # 同时启动前后端
pnpm lint         # ESLint 检查
pnpm type-check   # TypeScript 类型检查
```

### memory-leak-react（Vite + React 18）
```bash
cd demos/memory-leak-react
pnpm install
pnpm dev          # 启动开发服务
pnpm lint         # ESLint 检查
```

## 文档写作规范

`knowledge/` 目录下的文档遵循 `.cursor/rules/knowledge-base-writing.mdc` 规则。

### 核心原则
- **目标**：可检索、可复用、可执行
- **风格**：全中文，先结论后论证，列表优先，短句优先
- **禁止**：博客口吻（"大家好"、"本文"）、空洞铺垫、SEO 优化

### 文档类型与触发词
| 类型 | 字数 | 触发词 | 模板 |
|------|------|--------|------|
| 知识卡 | ≤500 | "整理 X 知识卡" | `resources/templates/知识卡模板.md` |
| 专题文 | 500-2000 | "写 X 专题文档" | `resources/templates/专题文模板.md` |
| 操作手册 | 1000-3000 | "制作 X 操作手册" | `resources/templates/操作手册模板.md` |

### 文档结构
- **知识卡**：定义 → 核心要点（3-5条）→ 示例代码 → 速查命令 → 相关链接
- **专题文**：概览（问题/方案/结论）→ 背景 → 核心概念表格 → 实现步骤 → 故障排查表 → 最佳实践 → 参考
- **操作手册**：概览（目标/时长/风险/前提）→ 执行清单 → 前置准备 → 分阶段步骤 → 验证检查表 → 回滚方案

### 元数据格式
```yaml
---
aliases: ["别名"]
title: "标题"
tags: ["技术栈", "场景"]
updated: YYYY-MM-DD
---
```

### 代码与链接规范
- 代码块使用语法高亮：`bash`、`ts`、`json`、`yaml`
- 命令注释用 `#`，保持可复制运行
- 默认 macOS，必要时标注平台差异
- 内链：`[[文档标题]]` 或 `[[路径#章节]]`
- 外链：`[描述](URL)`，禁止裸链接

### 结构化标识
- `✅ 推荐` `❌ 禁止` `⚠️ 注意` `🔧 工具`
- 清单：`- [ ]` 未完成，`- [x]` 已完成
