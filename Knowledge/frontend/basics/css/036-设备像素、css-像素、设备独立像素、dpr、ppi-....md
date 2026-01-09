## 概述

在移动设备和高清屏幕普及的今天，理解不同类型像素的概念对于前端开发至关重要。这些像素概念帮助我们实现跨设备的一致性体验。

## 像素类型详解

### 设备像素（物理像素）

**定义：** 设备屏幕上最小的物理显示单元

**特点：**
- 硬件层面的真实像素点
- 设备出厂后数量固定，不可改变
- 决定屏幕的物理分辨率

```javascript
// 获取设备像素
console.log(screen.width);  // 物理屏幕宽度
console.log(screen.height); // 物理屏幕高度
```

**常见设备像素：**
- iPhone 13: 1170 × 2532 像素
- Samsung Galaxy S21: 1080 × 2400 像素
- MacBook Pro 13": 2560 × 1600 像素

### CSS像素（设备独立像素）

**定义：** CSS中使用的抽象像素单位，为开发者提供统一的度量标准

**特点：**
- 相对单位，大小可变
- 不同设备上保持视觉一致性
- 受页面缩放和DPR影响

```css
/* CSS像素示例 */
.element {
    width: 100px;  /* 100个CSS像素 */
    height: 50px;  /* 50个CSS像素 */
}
```

**计算关系：**
```
CSS像素 = 设备像素 ÷ DPR ÷ 缩放比例
```

## 重要概念

### DPR（设备像素比）

**定义：** 设备像素与CSS像素的比值

```javascript
// 获取设备像素比
console.log(window.devicePixelRatio);
```

**常见设备DPR：**
- 普通PC屏幕：DPR = 1
- iPhone 6-8：DPR = 2
- iPhone X及以上：DPR = 3
- 部分Android设备：DPR = 1.5, 2, 3等

**实际应用：**
```css
/* 针对高DPR设备的图片适配 */
@media (-webkit-min-device-pixel-ratio: 2) {
    .logo {
        background-image: url('logo@2x.png');
        background-size: 100px 50px;
    }
}

@media (-webkit-min-device-pixel-ratio: 3) {
    .logo {
        background-image: url('logo@3x.png');
        background-size: 100px 50px;
    }
}
```

### PPI（每英寸像素数）

**定义：** 屏幕像素密度，表示每英寸包含的像素数量

**计算公式：**
```
PPI = √(宽度像素² + 高度像素²) ÷ 屏幕尺寸(英寸)
```

**分类标准：**
- 低密度：~120 PPI
- 中密度：~160 PPI
- 高密度：~240 PPI
- 超高密度：~320 PPI及以上

**实际示例：**
- iPhone 13：460 PPI
- MacBook Pro 13"：227 PPI
- 普通PC显示器：72-96 PPI

## 实际应用

### 响应式图片

```html
<!-- 使用srcset适配不同DPR -->
<img src="image-1x.jpg" srcset="image-1x.jpg 1x, image-2x.jpg 2x, image-3x.jpg 3x" alt="响应式图片">
```

```css
/* CSS中的图片适配 */
.hero-bg {
    background-image: url('hero-1x.jpg');
}

@media (-webkit-min-device-pixel-ratio: 2) {
    .hero-bg {
        background-image: url('hero-2x.jpg');
    }
}
```

### 1px边框问题

```css
/* 解决移动端1px边框过粗问题 */
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
    transform: scale(0.5);
    transform-origin: 0 0;
}
```

### 视口设置

```html
<!-- 确保CSS像素与设备独立像素一致 -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## JavaScript检测

### 获取像素信息

```javascript
// 设备像素信息
const deviceInfo = {
    screenWidth: screen.width,
    screenHeight: screen.height,
    devicePixelRatio: window.devicePixelRatio,
    
    // 视口信息
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    
    // CSS像素转设备像素
    cssToDevice: (cssPixels) => cssPixels * window.devicePixelRatio
};

console.log(deviceInfo);
```

### 监听DPR变化

```javascript
// 监听设备像素比变化（如用户缩放）
function watchDPR() {
    const callback = () => {
        console.log('DPR changed:', window.devicePixelRatio);
        // 重新加载高清图片等操作
    };
    
    const mediaQuery = `(resolution: ${window.devicePixelRatio}dppx)`;
    const mediaQueryList = window.matchMedia(mediaQuery);
    mediaQueryList.addListener(callback);
}
```

## 最佳实践

### 图片资源准备

```
images/
├── logo.png          (1x, 100×50px)
├── logo@2x.png       (2x, 200×100px)
├── logo@3x.png       (3x, 300×150px)
└── logo.svg          (矢量图，适用于所有DPR)
```

### CSS媒体查询

```css
/* 通用设备适配 */
@media screen and (max-width: 767px) {
    /* 移动端样式 */
}

@media screen and (min-width: 768px) and (-webkit-min-device-pixel-ratio: 2) {
    /* 高DPR平板和桌面 */
}
```

### rem适配方案

```javascript
// 基于DPR的rem适配
function setRemUnit() {
    const docEl = document.documentElement;
    const devicePixelRatio = window.devicePixelRatio || 1;
    const scale = 1 / devicePixelRatio;
    const width = docEl.clientWidth * devicePixelRatio;
    
    // 设置viewport缩放
    const metaEl = document.querySelector('meta[name="viewport"]');
    metaEl.setAttribute('content', `width=${width}, initial-scale=${scale}, maximum-scale=${scale}`);
    
    // 设置rem基准值
    docEl.style.fontSize = width / 10 + 'px';
}
```

## 注意事项

- **图片资源：** 准备多套不同DPR的图片资源
- **性能考虑：** 高DPR图片文件较大，注意加载优化
- **兼容性：** 老旧设备可能不支持高DPR
- **测试验证：** 在不同设备和缩放级别下测试效果

## 标签
#CSS #前端面试