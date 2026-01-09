---
aliases: ["meta标签", "HTML元数据", "meta元素"]
title: "HTML Meta 标签"
tags: ["HTML", "前端基础", "SEO", "meta"]
updated: 2026-01-09
---

## 概述

`<meta>` 标签提供 HTML 文档的元数据，不显示在页面上，但对浏览器和搜索引擎有重要作用。位于 `<head>` 元素内部。

## 核心属性

| 属性 | 作用 | 示例 |
|------|------|------|
| `charset` | 声明文档字符编码 | `<meta charset="UTF-8">` |
| `name` | 定义元信息名称 | `<meta name="viewport" content="...">` |
| `content` | 定义元信息的值 | 配合 `name` 或 `http-equiv` 使用 |
| `http-equiv` | 模拟 HTTP 响应头 | `<meta http-equiv="refresh" content="30">` |

## 常用 Meta 标签

### 1. 字符集（必需）

```html
<meta charset="UTF-8">
```

UTF-8 包含几乎所有语言字符，是最常用的字符集。

### 2. 视口设置（移动端必需）

```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

- `width=device-width`：页面宽度等于设备屏幕宽度
- `initial-scale=1`：初始缩放级别为 1

### 3. 页面描述（SEO 重要）

```html
<meta name="description" content="页面描述内容">
```

搜索引擎会在搜索结果中显示此描述。

### 4. 关键词

```html
<meta name="keywords" content="HTML, CSS, JavaScript">
```

⚠️ 大多数搜索引擎已不再使用此标签。

### 5. 作者信息

```html
<meta name="author" content="作者名">
```

### 6. 页面刷新

```html
<meta http-equiv="refresh" content="30">
```

每 30 秒自动刷新页面。

### 7. 搜索引擎控制

```html
<!-- 禁止索引 -->
<meta name="robots" content="noindex">

<!-- 禁止跟踪链接 -->
<meta name="robots" content="nofollow">

<!-- 禁止索引和跟踪 -->
<meta name="robots" content="noindex, nofollow">
```

## 完整示例

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="这是一个示例页面">
    <meta name="author" content="开发者">
    <meta name="robots" content="index, follow">
    <title>页面标题</title>
</head>
```

## 参考资料

- [MDN - meta 元素](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/meta)
