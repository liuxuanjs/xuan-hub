## 概述

CSS Sprites（精灵图）是一种网页图像应用处理方式，通过将多个小图标合并成一张大图，然后使用CSS背景定位技术显示不同区域，从而减少HTTP请求数量，提升页面加载性能。

## 基本原理

### 实现方式

**核心技术：**
- `background-image`：设置背景图片
- `background-position`：控制显示位置
- `background-repeat: no-repeat`：禁止重复
- 元素尺寸控制：限制可视区域

```css
/* Sprite图片示例 */
.sprite {
    background-image: url('icons-sprite.png');
    background-repeat: no-repeat;
    display: inline-block;
}

/* 不同图标的定位 */
.icon-home {
    width: 24px;
    height: 24px;
    background-position: 0 0;
}

.icon-user {
    width: 24px;
    height: 24px;
    background-position: -24px 0;
}

.icon-settings {
    width: 24px;
    height: 24px;
    background-position: -48px 0;
}

.icon-search {
    width: 24px;
    height: 24px;
    background-position: 0 -24px;
}
```

### HTML使用示例

```html
<div class="navigation">
    <span class="sprite icon-home"></span>
    <span class="sprite icon-user"></span>
    <span class="sprite icon-settings"></span>
    <span class="sprite icon-search"></span>
</div>

<!-- 也可以用伪元素 -->
<button class="btn-with-icon">
    主页
</button>
```

```css
.btn-with-icon::before {
    content: '';
    display: inline-block;
    width: 16px;
    height: 16px;
    background-image: url('icons-sprite.png');
    background-position: 0 0;
    background-repeat: no-repeat;
    margin-right: 8px;
    vertical-align: middle;
}
```

## 优势分析

### 1. 减少HTTP请求

```
// 传统方式：5个请求
GET /images/home.png
GET /images/user.png
GET /images/settings.png
GET /images/search.png
GET /images/cart.png

// Sprites：1个请求
GET /images/icons-sprite.png

请求减少：80%
```

### 2. 减少总文件大小

```
单独图片：
- home.png: 2KB
- user.png: 2KB  
- settings.png: 2KB
- search.png: 2KB
- cart.png: 2KB
总计：10KB

Sprite图片：
- icons-sprite.png: 7KB

文件大小减少：30%
```

### 3. 提升加载性能

- 减少服务器连接开销
- 减少网络延迟影响
- 更好的浏览器缓存利用
- 减少页面重排次数

## 缺点与限制

### 1. 维护成本高

```css
/* 修改一个图标需要重新计算位置 */
.icon-new {
    width: 24px;
    height: 24px;
    /* 需要重新测量和计算 */
    background-position: -72px -24px;
}
```

### 2. 制作复杂

- 需要设计师和开发者协作
- 图片排列需要精心计划
- 不同尺寸图标混合复杂

### 3. 灵活性下降

- 不能动态改变图标颜色
- 不适合响应式设计
- 难以实现图标动画效果

## 现代工具与方法

### 自动化工具

#### webpack-spritesmith

```javascript
// webpack.config.js
const SpritesmithPlugin = require('webpack-spritesmith');

module.exports = {
    plugins: [
        new SpritesmithPlugin({
            src: {
                cwd: path.resolve(__dirname, 'src/icons'),
                glob: '*.png'
            },
            target: {
                image: path.resolve(__dirname, 'src/sprites/sprite.png'),
                css: path.resolve(__dirname, 'src/sprites/sprite.css')
            },
            apiOptions: {
                cssImageRef: '../sprites/sprite.png'
            }
        })
    ]
};
```

#### PostCSS Sprites

```javascript
// postcss.config.js
module.exports = {
    plugins: [
        require('postcss-sprites')({
            spritePath: './dist/images/',
            relativeTo: 'rule',
            spritesmith: {
                padding: 4
            }
        })
    ]
};
```

```css
/* 输入 */
.icon {
    background: url('icons/home.png') no-repeat;
}

/* 自动生成 */
.icon {
    background: url('../images/sprite.png') no-repeat 0 0;
}
```

### Gulp工作流

```javascript
// gulpfile.js
const gulp = require('gulp');
const spritesmith = require('gulp.spritesmith');

gulp.task('sprite', function() {
    const spriteData = gulp.src('src/icons/*.png')
        .pipe(spritesmith({
            imgName: 'sprite.png',
            cssName: 'sprite.css',
            padding: 4,
            algorithm: 'binary-tree'
        }));
    
    return spriteData.pipe(gulp.dest('dist/'));
});
```

## 现代替代方案

### 1. SVG Sprites

```html
<!-- SVG Symbol方式 -->
<svg style="display: none;">
    <defs>
        <symbol id="icon-home" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
        </symbol>
        <symbol id="icon-user" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </symbol>
    </defs>
</svg>

<!-- 使用 -->
<svg class="icon">
    <use href="#icon-home"></use>
</svg>
```

```css
.icon {
    width: 24px;
    height: 24px;
    fill: currentColor;
}
```

### 2. Icon Fonts

```css
@font-face {
    font-family: 'IconFont';
    src: url('iconfont.woff2') format('woff2'),
         url('iconfont.woff') format('woff');
}

.icon {
    font-family: 'IconFont';
    font-style: normal;
    font-weight: normal;
    font-variant: normal;
    text-transform: none;
    line-height: 1;
}

.icon-home::before { content: '\e001'; }
.icon-user::before { content: '\e002'; }
```

### 3. CSS-in-JS

```jsx
// React 示例
import styled from 'styled-components';

const Icon = styled.div`
    width: ${props => props.size || 24}px;
    height: ${props => props.size || 24}px;
    background-image: url('${props => props.sprite}');
    background-position: ${props => props.x || 0}px ${props => props.y || 0}px;
    background-repeat: no-repeat;
`;

// 使用
<Icon sprite="sprite.png" x={-24} y={0} size={24} />
```

## 实际应用案例

### 电商网站图标

```css
/* 商品状态图标 */
.product-sprite {
    background-image: url('product-icons.png');
    background-repeat: no-repeat;
    display: inline-block;
}

.icon-new { 
    width: 32px; height: 16px; 
    background-position: 0 0; 
}
.icon-hot { 
    width: 32px; height: 16px; 
    background-position: -32px 0; 
}
.icon-sale { 
    width: 32px; height: 16px; 
    background-position: -64px 0; 
}
.icon-free-shipping { 
    width: 48px; height: 16px; 
    background-position: 0 -16px; 
}
```

### 社交媒体图标

```css
.social-sprite {
    background-image: url('social-icons.png');
    background-repeat: no-repeat;
    width: 32px;
    height: 32px;
    display: inline-block;
    text-indent: -9999px;
    overflow: hidden;
}

.social-facebook { background-position: 0 0; }
.social-twitter { background-position: -32px 0; }
.social-instagram { background-position: -64px 0; }
.social-linkedin { background-position: -96px 0; }
```

## 性能优化建议

### 1. 合理组织图片

- 相同使用频率的图标放一起
- 相同尺寸的图标排列整齐
- 预留适当间距防止渗透

### 2. 优化加载策略

```css
/* 预加载Sprite图片 */
.preload-sprite {
    background: url('icons-sprite.png') no-repeat -9999px -9999px;
}

/* 或者使用link预加载 */
```

```html
<link rel="preload" href="icons-sprite.png" as="image">
```

### 3. 响应式处理

```css
/* 为不同屏幕密度准备不同版本 */
.icon {
    background-image: url('sprite-1x.png');
}

@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
    .icon {
        background-image: url('sprite-2x.png');
        background-size: 200px 100px; /* 原始尺寸的一半 */
    }
}
```

## 选择指南

### 何时使用CSS Sprites

**适合场景：**
- 大量小图标（小于5KB）
- 图标风格统一，变化不频繁
- 重视加载性能的项目
- 支持HTTP/1.1的老版本项目

**不适合场景：**
- 需要动态改变颜色的图标
- 响应式设计中尺寸变化大的图标
- 需要动画效果的元素
- HTTP/2环境下的现代项目

### 现代替代方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| CSS Sprites | 减少请求、兼容性好 | 维护复杂、灵活性差 | 小图标、静态设计 |
| SVG Sprites | 矢量化、可交互 | 学习成本 | 简单图标、现代项目 |
| Icon Fonts | 灵活性高、易使用 | 语义化差 | 通用图标系统 |
| 图片分割 | 简单直接 | 请求数多 | 小型项目 |

虽然CSS Sprites在HTTP/2时代的重要性有所下降，但在特定场景下仍然是一种有效的优化手段。

## 标签
#CSS #前端面试