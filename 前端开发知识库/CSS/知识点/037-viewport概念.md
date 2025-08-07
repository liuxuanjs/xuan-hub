## 概述

Viewport（视口）是移动端web开发的核心概念，它决定了网页在移动设备上的显示方式。理解三种不同的viewport对于实现良好的移动端体验至关重要。

## 三种视口类型

### Layout Viewport（布局视口）

**定义：** 浏览器用于布局网页的虚拟区域

**特点：**
- 默认宽度通常为980px（各浏览器略有不同）
- 为了让桌面网站在移动端正常显示而设计
- 用户需要缩放和拖拽来查看完整内容

```javascript
// 获取布局视口尺寸
const layoutWidth = document.documentElement.clientWidth;
const layoutHeight = document.documentElement.clientHeight;
console.log(`Layout Viewport: ${layoutWidth} × ${layoutHeight}`);
```

**问题：**
- 网页显示过小，用户体验差
- 需要手动缩放才能看清内容
- 存在水平滚动条

### Visual Viewport（视觉视口）

**定义：** 用户实际能看到的网页区域

**特点：**
- 尺寸等于设备屏幕尺寸
- 随用户缩放而改变
- 像透过窗户看风景，窗户就是视觉视口

```javascript
// 获取视觉视口尺寸
const visualWidth = window.innerWidth;
const visualHeight = window.innerHeight;
console.log(`Visual Viewport: ${visualWidth} × ${visualHeight}`);
```

**关系比喻：**
```
视觉视口 = 窗户
布局视口 = 窗外的风景
用户通过"窗户"看"风景"
```

### Ideal Viewport（理想视口）

**定义：** 最适合移动设备浏览的视口

**特点：**
- 宽度等于设备的屏幕宽度（CSS像素）
- 无需缩放即可获得最佳阅读体验
- 消除水平滚动条

```html
<!-- 设置理想视口 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## 视口设置详解

### viewport meta标签

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, 
                              maximum-scale=1.0, minimum-scale=1.0, 
                              user-scalable=no">
```

**属性说明：**

| 属性 | 说明 | 示例值 |
|------|------|--------|
| `width` | 设置布局视口宽度 | `device-width`, `320` |
| `height` | 设置布局视口高度 | `device-height`, `640` |
| `initial-scale` | 初始缩放比例 | `1.0` |
| `minimum-scale` | 最小缩放比例 | `0.5` |
| `maximum-scale` | 最大缩放比例 | `2.0` |
| `user-scalable` | 是否允许用户缩放 | `yes`, `no` |

### 常用设置组合

```html
<!-- 基础响应式设计 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- 禁止缩放的应用 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, 
                              maximum-scale=1.0, user-scalable=no">

<!-- 允许适度缩放 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, 
                              maximum-scale=2.0, minimum-scale=0.5">
```

## JavaScript操作视口

### 获取视口信息

```javascript
const viewportInfo = {
    // 布局视口
    layoutWidth: document.documentElement.clientWidth,
    layoutHeight: document.documentElement.clientHeight,
    
    // 视觉视口
    visualWidth: window.innerWidth,
    visualHeight: window.innerHeight,
    
    // 屏幕尺寸
    screenWidth: screen.width,
    screenHeight: screen.height,
    
    // 设备像素比
    devicePixelRatio: window.devicePixelRatio,
    
    // 页面缩放比例
    pageScale: window.innerWidth / document.documentElement.clientWidth
};
```

### 动态设置视口

```javascript
function setViewport(width, scale = 1) {
    let viewport = document.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        document.head.appendChild(viewport);
    }
    
    viewport.content = `width=${width}, initial-scale=${scale}`;
}

// 使用示例
setViewport('device-width', 1.0);
setViewport(375, 1.0); // 固定宽度
```

### 监听视口变化

```javascript
// 监听屏幕方向变化
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        console.log('视口尺寸已更新');
        console.log(`新尺寸: ${window.innerWidth} × ${window.innerHeight}`);
    }, 100);
});

// 监听窗口大小变化
window.addEventListener('resize', () => {
    console.log(`视口变化: ${window.innerWidth} × ${window.innerHeight}`);
});
```

## 适配方案

### rem适配

```javascript
// 基于viewport的rem适配
function setRemUnit() {
    const docEl = document.documentElement;
    const viewportWidth = docEl.clientWidth;
    const fontSize = viewportWidth / 10; // 1rem = viewportWidth/10
    docEl.style.fontSize = fontSize + 'px';
}

setRemUnit();
window.addEventListener('resize', setRemUnit);
```

### vw/vh适配

```css
/* 基于视口单位的布局 */
.container {
    width: 100vw;    /* 视口宽度的100% */
    height: 100vh;   /* 视口高度的100% */
    padding: 2vw;    /* 视口宽度的2% */
}

.title {
    font-size: 4vw;  /* 响应式字体大小 */
}
```

### 媒体查询结合

```css
/* 基于理想视口的响应式设计 */
@media screen and (max-width: 375px) {
    .container { padding: 15px; }
}

@media screen and (min-width: 376px) and (max-width: 768px) {
    .container { padding: 20px; }
}

@media screen and (min-width: 769px) {
    .container { padding: 30px; }
}
```

## 常见问题与解决

### 1px边框问题

```css
/* 解决高DPR设备1px边框过粗 */
.border {
    position: relative;
}

.border::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 200%;
    border: 1px solid #ccc;
    transform-origin: 0 0;
    transform: scale(0.5);
}
```

### iOS Safari地址栏影响

```javascript
// 处理iOS Safari地址栏高度变化
function handleIOSViewport() {
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
        const updateViewport = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        };
        
        updateViewport();
        window.addEventListener('resize', updateViewport);
    }
}
```

```css
/* 使用自定义CSS变量 */
.full-height {
    height: 100vh; /* 回退方案 */
    height: calc(var(--vh, 1vh) * 100);
}
```

## 最佳实践

### 设置建议

```html
<!-- 推荐的基础设置 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, 
                              viewport-fit=cover">
```

### 响应式设计原则

1. **移动优先：** 从小屏幕开始设计
2. **渐进增强：** 逐步适配大屏幕
3. **灵活布局：** 使用相对单位和弹性布局
4. **合理断点：** 基于内容而非设备选择断点

### 测试验证

- 使用浏览器开发者工具测试不同设备
- 在真实设备上验证效果
- 注意横竖屏切换的表现
- 测试不同浏览器的兼容性

## 标签
#CSS #前端面试