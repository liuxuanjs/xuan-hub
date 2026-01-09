---
aliases: ["Cookie隔离", "静态资源域名分离", "Cookie-Free Domain"]
title: "Cookie 隔离优化方案"
tags: ["性能优化", "Cookie", "CDN", "前端工程化"]
updated: 2026-01-09
---

## 概述

Cookie 隔离是一种性能优化技术，通过将静态资源部署到不同域名下，避免请求静态文件时携带不必要的 Cookie 数据，从而减少请求头大小、提升加载性能。

## 问题背景

### Cookie 自动携带机制

同域请求会自动携带 Cookie：

```
主站：https://example.com
Cookie：session_id=abc123; user_pref=dark_mode; cart_items=item1,item2

当请求 https://example.com/images/logo.png 时：
Request Headers:
Cookie: session_id=abc123; user_pref=dark_mode; cart_items=item1,item2
```

### 问题分析

- 静态资源（图片、CSS、JS）不需要 Cookie 信息
- Cookie 增加请求头大小，浪费带宽
- 服务器需要解析无用的 Cookie 数据
- 影响缓存效率和 CDN 性能

## 实现方案

### 方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| 独立域名 | 完全隔离、便于 CDN | 域名成本 | 大型项目 |
| 子域名 | 成本低、管理方便 | 需配置 Cookie domain | 中小型项目 |
| CDN 部署 | 性能最优、全球加速 | 成本较高 | 高流量网站 |

### 1. 使用独立域名

```html
<!-- 主站：https://example.com -->
<!-- 静态资源：https://static.example.com -->

<link rel="stylesheet" href="https://static.example.com/css/style.css">
<script src="https://static.example.com/js/app.js"></script>
<img src="https://static.example.com/images/logo.png" alt="Logo">
```

### 2. 使用子域名

```html
<!-- 主站：https://www.example.com -->
<!-- 静态资源：https://assets.example.com -->

<link rel="stylesheet" href="https://assets.example.com/css/style.css">
```

⚠️ 需正确设置 Cookie 的 domain 属性避免泄露：

```javascript
document.cookie = "session_id=abc123; domain=.www.example.com; path=/";
```

### 3. CDN 部署

```html
<link rel="stylesheet" href="https://cdn.example.com/css/style.css">
<script src="https://cdn.jsdelivr.net/npm/library@1.0.0/dist/lib.min.js"></script>
```

## 服务器配置

### Nginx 配置

```nginx
# 静态资源服务器
server {
    listen 80;
    server_name static.example.com;

    location ~* \.(css|js|png|jpg|jpeg|gif|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        root /var/www/static;
    }

    # 禁止 Cookie
    proxy_hide_header Set-Cookie;
    proxy_ignore_headers Set-Cookie;
}
```

### Apache 配置

```apache
<VirtualHost *:80>
    ServerName static.example.com
    DocumentRoot /var/www/static

    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, immutable"
    </LocationMatch>

    Header unset Cookie
    Header unset Set-Cookie
</VirtualHost>
```

### 构建工具配置（Webpack）

```javascript
module.exports = {
    output: {
        publicPath: process.env.NODE_ENV === 'production'
            ? 'https://static.example.com/'
            : '/'
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash].css'
        })
    ]
};
```

## 性能收益

### 请求头大小对比

| 场景 | 请求头大小 | 节省 |
|------|-----------|------|
| 携带 Cookie | ~800 字节 | - |
| Cookie 隔离后 | ~200 字节 | ~75% |

### 并发连接优化

浏览器对每个域名有并发连接数限制（通常 6 个），使用独立域名可增加并发数：

- 主域名：6 个并发连接
- 静态域名：6 个并发连接
- CDN 域名：6 个并发连接
- **总计：18 个并发连接**

## 注意事项

### CORS 跨域配置

```nginx
add_header Access-Control-Allow-Origin "https://example.com";
add_header Access-Control-Allow-Methods "GET, OPTIONS";
```

### HTTPS 混合内容

```html
<!-- 主站是 HTTPS 时，静态资源也必须是 HTTPS -->
<link rel="stylesheet" href="https://static.example.com/style.css">

<!-- 或使用协议相对 URL -->
<img src="//static.example.com/image.png" alt="Image">
```

### 域名预解析

```html
<link rel="dns-prefetch" href="//static.example.com">
<link rel="preconnect" href="https://static.example.com">
```

## 最佳实践

1. ✅ 合理规划域名：区分主业务域名和静态资源域名
2. ✅ CDN 集成：将静态资源部署到 CDN 提供商
3. ✅ 缓存策略：为静态资源设置长期缓存
4. ✅ 安全考虑：避免敏感 Cookie 泄露到静态域名
5. ✅ 性能监控：持续监控 Cookie 隔离的效果

## 参考资料

- [Yahoo 性能优化规则 - Use Cookie-Free Domains](https://developer.yahoo.com/performance/rules.html)
- [MDN - HTTP cookies](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies)
