## 概述

`transition`和`animation`是CSS3中实现动画效果的两种主要方式，它们各有特点和适用场景。理解两者的区别有助于选择合适的动画实现方案。

## 基本概念

### transition（过渡）

**定义：** 用于在CSS属性值发生变化时创建平滑的过渡效果

**特点：**
- 被动触发，需要状态改变（如hover、focus、类名变化）
- 只能定义起始和结束状态
- 适合简单的状态变化动画

```css
.button {
    background: #3498db;
    padding: 10px 20px;
    transition: background 0.3s ease;
}

.button:hover {
    background: #2980b9;
}
```

### animation（动画）

**定义：** 使用关键帧(@keyframes)创建复杂的动画序列

**特点：**
- 主动执行，可以有多个关键帧
- 可以循环播放、反向播放
- 能实现更复杂的动画效果

```css
@keyframes slideIn {
    0% {
        transform: translateX(-100%);
        opacity: 0;
    }
    100% {
        transform: translateX(0);
        opacity: 1;
    }
}

.element {
    animation: slideIn 0.5s ease-in-out;
}
```

## 核心区别对比

### 触发方式

**transition：**
```css
.box {
    width: 100px;
    transition: width 0.3s ease;
}

.box:hover {
    width: 200px; /* 需要触发器 */
}
```

**animation：**
```css
.box {
    animation: expand 0.3s ease; /* 自动执行 */
}

@keyframes expand {
    from { width: 100px; }
    to { width: 200px; }
}
```

### 控制能力

**transition（有限控制）：**
```css
.element {
    transition-property: transform;
    transition-duration: 0.3s;
    transition-timing-function: ease;
    transition-delay: 0.1s;
}
```

**animation（精确控制）：**
```css
.element {
    animation-name: complexMove;
    animation-duration: 2s;
    animation-timing-function: ease-in-out;
    animation-delay: 0.5s;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-fill-mode: both;
    animation-play-state: running;
}
```

### 复杂度对比

**transition（简单过渡）：**
```css
.card {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    transition: all 0.3s ease;
}

.card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
}
```

**animation（复杂序列）：**
```css
@keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0, 0, 0);
    }
    40%, 43% {
        transform: translate3d(0, -20px, 0);
    }
    70% {
        transform: translate3d(0, -10px, 0);
    }
    90% {
        transform: translate3d(0, -4px, 0);
    }
}

.element {
    animation: bounce 1s ease-in-out;
}
```

## 实际应用场景

### transition适用场景

**按钮交互：**
```css
.btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 4px;
    transition: all 0.2s ease;
}

.btn:hover {
    background: #0056b3;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.btn:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
```

**表单焦点：**
```css
.input {
    border: 2px solid #ddd;
    padding: 10px;
    transition: border-color 0.3s ease;
}

.input:focus {
    border-color: #007bff;
    outline: none;
}
```

### animation适用场景

**加载动画：**
```css
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}
```

**页面入场动画：**
```css
@keyframes fadeInUp {
    0% {
        opacity: 0;
        transform: translateY(30px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.page-enter {
    animation: fadeInUp 0.6s ease-out;
}
```

## 性能对比

### transition性能

```css
/* 高性能：只改变transform和opacity */
.element {
    transition: transform 0.3s ease, opacity 0.3s ease;
}

/* 低性能：改变布局属性 */
.element {
    transition: width 0.3s ease, height 0.3s ease;
}
```

### animation性能优化

```css
@keyframes optimizedMove {
    0% {
        transform: translate3d(-100px, 0, 0);
        opacity: 0;
    }
    100% {
        transform: translate3d(0, 0, 0);
        opacity: 1;
    }
}

.element {
    animation: optimizedMove 0.5s ease;
    /* 提前告知浏览器需要优化的属性 */
    will-change: transform, opacity;
}
```

## JavaScript控制

### transition事件

```javascript
const element = document.querySelector('.element');

element.addEventListener('transitionend', (e) => {
    console.log(`${e.propertyName} transition completed`);
});

element.addEventListener('transitionstart', (e) => {
    console.log(`${e.propertyName} transition started`);
});
```

### animation事件

```javascript
const element = document.querySelector('.element');

element.addEventListener('animationstart', (e) => {
    console.log(`Animation ${e.animationName} started`);
});

element.addEventListener('animationend', (e) => {
    console.log(`Animation ${e.animationName} ended`);
    // 动画结束后的处理
    element.classList.remove('animate');
});

element.addEventListener('animationiteration', (e) => {
    console.log(`Animation ${e.animationName} iteration`);
});
```

### 动态控制

```javascript
// 控制transition
function toggleTransition() {
    const element = document.querySelector('.box');
    element.classList.toggle('expanded');
}

// 控制animation
function startAnimation() {
    const element = document.querySelector('.box');
    element.style.animationPlayState = 'running';
}

function pauseAnimation() {
    const element = document.querySelector('.box');
    element.style.animationPlayState = 'paused';
}
```

## 组合使用

```css
.complex-card {
    /* 基础过渡效果 */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.complex-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.complex-card.loading {
    /* 加载时的动画 */
    animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}
```

## 最佳实践建议

### 选择指南

1. **简单状态变化 → transition**
   - 按钮hover效果
   - 表单焦点状态
   - 简单的显示/隐藏

2. **复杂动画序列 → animation**
   - 加载动画
   - 页面转场效果
   - 复杂的UI交互

3. **性能优先原则**
   - 优先使用transform和opacity
   - 避免频繁改变布局属性
   - 合理使用will-change

4. **用户体验考虑**
   - 动画时长不宜过长（一般0.2s-0.5s）
   - 提供减少动画的选项
   - 确保动画有明确的目的