# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个个人技术知识库，包含前端/后端技术文档、工作规范、示例项目等内容。主要使用 Obsidian 管理。

## 目录结构

- `knowledge/` - 技术知识库
  - `frontend/basics/` - HTML、CSS、JavaScript 基础
  - `frontend/browser/` - 浏览器原理与 DevTools
  - `frontend/frameworks/` - React 等框架
  - `frontend/engineering/` - 构建工具、包管理、微前端
  - `frontend/libraries/` - MobX、WebSocket、Node、Webpack
  - `frontend/solutions/` - 技术解决方案
  - `backend/` - 后端知识（Nginx 等）
- `work/` - 工作相关（项目文档、团队规范）
- `tools/` - 工具使用指南
- `demos/` - 示例项目（React/Vue）
- `personal/` - 个人内容
- `resources/` - 模板与附件

## 常用命令

### Demo 项目
```bash
cd demos/<project-name>
pnpm install && pnpm dev
```

### 生成文档
- 知识卡：`整理 X 知识卡`
- 专题文：`写 X 专题文档`
- 操作手册：`制作 X 操作手册`

## 文档写作规范

`knowledge/` 目录下的文档遵循 `.cursor/rules/knowledge-base-writing.mdc` 规则：

- **目标**：可检索、可复用、可执行
- **风格**：全中文，先结论后论证，列表优先
- **禁止**：博客口吻、空洞铺垫

### 文档类型
| 类型 | 字数 | 触发词 | 模板 |
|------|------|--------|------|
| 知识卡 | ≤500 | "整理 X 知识卡" | `resources/templates/知识卡模板.md` |
| 专题文 | 500-2000 | "写 X 专题文档" | `resources/templates/专题文模板.md` |
| 操作手册 | 1000-3000 | "制作 X 操作手册" | `resources/templates/操作手册模板.md` |

### 元数据
```yaml
---
aliases: ["别名"]
title: "标题"
tags: ["技术栈", "场景"]
updated: YYYY-MM-DD
---
```
