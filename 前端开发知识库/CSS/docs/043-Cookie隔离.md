## 概述

Cookie隔离是一种优化技术，通过将静态资源部署到不同域名下，避免在请求静态文件时携带不必要的Cookie数据，从而减少请求头大小，提升加载性能。

## 问题背景

### Cookie自动携带机制

**同域请求会自动携带Cookie：**
```
主站：https://example.com
Cookie：session_id=abc123; user_pref=dark_mode; cart_items=item1,item2

当请求 https://example.com/images/logo.png 时：
Request Headers:
Cookie: session_id=abc123; user_pref=dark_mode; cart_items=item1,item2
```

**问题分析：**
- 静态资源（图片、CSS、JS）不需要Cookie信息
- Cookie增加了请求头大小，浪费带宽
- 服务器需要解析无用的Cookie数据
- 影响缓存效率和CDN性能

## 实现方案

### 1. 使用独立域名

```html
<!-- 主站：https://example.com -->
<!-- 静态资源：https://static.example.com -->

<link rel="stylesheet" href="https://static.example.com/css/style.css">
<script src="https://static.example.com/js/app.js"></script>
<img src="https://static.example.com/images/logo.png" alt="Logo">
```

**优势：**
- 完全避免Cookie传输
- 可以使用不同的服务器配置
- 便于CDN部署

### 2. 使用子域名

```html
<!-- 主站：https://www.example.com -->
<!-- 静态资源：https://assets.example.com -->

<link rel="stylesheet" href="https://assets.example.com/css/style.css">
<img src="https://assets.example.com/images/banner.jpg" alt="Banner">
```

**注意：** 需要正确设置Cookie的domain属性避免泄露

```javascript
// 设置Cookie时限制域名
document.cookie = "session_id=abc123; domain=.www.example.com; path=/";
```

### 3. CDN部署

```html
<!-- 使用CDN服务 -->
<link rel="stylesheet" href="https://cdn.example.com/css/style.css">
<script src="https://cdn.jsdelivr.net/npm/library@1.0.0/dist/lib.min.js"></script>
<img src="https://img.example.com/uploads/photo.jpg" alt="Photo">
```

## 技术实现

### Nginx配置示例

```nginx
# 主站配置
server {
    listen 80;
    server_name example.com www.example.com;
    
    location / {
        # 主站业务逻辑
        proxy_pass http://app_server;
    }
}

# 静态资源服务器
server {
    listen 80;
    server_name static.example.com;
    
    # 设置缓存头
    location ~* \.(css|js|png|jpg|jpeg|gif|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
        
        # 静态文件目录
        root /var/www/static;
    }
    
    # 禁止Cookie
    proxy_hide_header Set-Cookie;
    proxy_ignore_headers Set-Cookie;
}
```

### Apache配置示例

```apache
# 静态资源虚拟主机
<VirtualHost *:80>
    ServerName static.example.com
    DocumentRoot /var/www/static
    
    # 设置缓存
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header set Cache-Control "public, immutable"
    </LocationMatch>
    
    # 移除Cookie头
    Header unset Cookie
    Header unset Set-Cookie
</VirtualHost>
```

### 动态资源分离

```javascript
// 构建工具配置（如Webpack）
module.exports = {
    output: {
        publicPath: process.env.NODE_ENV === 'production' 
            ? 'https://static.example.com/' 
            : '/'
    },
    
    plugins: [
        // 提取CSS到独立文件
        new MiniCssExtractPlugin({
            filename: 'css/[name].[contenthash].css'
        })
    ]
};
```

## 性能优化效果

### 请求头大小对比

```
// 携带Cookie的请求
GET /images/logo.png HTTP/1.1
Host: example.com
Cookie: session_id=abc123def456ghi789; user_preferences=theme:dark,lang:en; shopping_cart=item1:2,item2:1,item3:5
User-Agent: Mozilla/5.0...

总请求头大小：~800字节

// Cookie隔离后的请求
GET /images/logo.png HTTP/1.1
Host: static.example.com
User-Agent: Mozilla/5.0...

总请求头大小：~200字节

节省：~75%的请求头大小
```

### 并发连接优化

```javascript
// 浏览器对每个域名的并发连接数有限制
// 使用独立域名可以增加并发数

// 主域名：https://example.com (6个并发连接)
// 静态域名：https://static.example.com (6个并发连接)
// CDN域名：https://cdn.example.com (6个并发连接)

// 总计：18个并发连接
```

## 实际应用案例

### 大型网站架构

```
主站：www.taobao.com
静态资源：
- g.alicdn.com (通用静态资源)
- img.alicdn.com (图片资源)
- at.alicdn.com (CSS/JS资源)
```

### 微服务架构

```yaml
# Docker Compose示例
version: '3'
services:
  web-app:
    image: nginx
    environment:
      - DOMAIN=example.com
  
  static-server:
    image: nginx
    volumes:
      - ./static:/usr/share/nginx/html
    environment:
      - DOMAIN=static.example.com
  
  cdn-server:
    image: nginx
    volumes:
      - ./assets:/usr/share/nginx/html
    environment:
      - DOMAIN=cdn.example.com
```

## 注意事项

### CORS跨域问题

```javascript
// 静态资源服务器需要设置CORS头
// Nginx配置
add_header Access-Control-Allow-Origin "https://example.com";
add_header Access-Control-Allow-Methods "GET, OPTIONS";
add_header Access-Control-Allow-Headers "*";
```

### HTTPS混合内容

```html
<!-- 避免混合内容警告 -->
<!-- 如果主站是HTTPS，静态资源也必须是HTTPS -->
<link rel="stylesheet" href="https://static.example.com/style.css">

<!-- 或使用协议相对URL -->
<img src="//static.example.com/image.png" alt="Image">
```

### 域名预解析

```html
<!-- 预解析静态资源域名 -->
<link rel="dns-prefetch" href="//static.example.com">
<link rel="dns-prefetch" href="//cdn.example.com">
<link rel="preconnect" href="https://static.example.com">
```

## 监控与测试

### 性能测试

```javascript
// 测试Cookie隔离效果
function testCookieIsolation() {
    const mainDomain = 'https://example.com/api/data';
    const staticDomain = 'https://static.example.com/image.png';
    
    // 主域名请求会携带Cookie
    fetch(mainDomain).then(response => {
        console.log('主域名请求头大小:', response.headers.get('content-length'));
    });
    
    // 静态域名请求不会携带Cookie
    fetch(staticDomain).then(response => {
        console.log('静态域名请求头大小:', response.headers.get('content-length'));
    });
}
```

### 网络分析

```bash
# 使用curl测试Cookie隔离
# 设置Cookie
curl -c cookies.txt "https://example.com/login" -d "username=test&password=test"

# 测试主站请求（会携带Cookie）
curl -b cookies.txt -I "https://example.com/page"

# 测试静态资源请求（不会携带Cookie）
curl -b cookies.txt -I "https://static.example.com/style.css"
```

## 最佳实践

1. **合理规划域名：** 区分主业务域名和静态资源域名
2. **CDN集成：** 将静态资源部署到CDN提供商
3. **缓存策略：** 为静态资源设置长期缓存
4. **安全考虑：** 避免敏感Cookie泄露到静态域名
5. **性能监控：** 持续监控Cookie隔离的效果

Cookie隔离是现代Web性能优化的重要手段，特别是在高流量网站中能够显著提升加载速度和减少服务器负载。

## 标签
#CSS #前端面试