## 概述

基线（baseline）和x-height是CSS布局中的重要概念，它们决定了文字的垂直对齐方式和内联元素的排列规则。理解这些概念有助于精确控制文字排版和元素对齐。

## 基本概念

### 基线（Baseline）

**定义：** 字母x的下边缘所在的水平线

```html
<div class="baseline-demo">
    <span>字母x的底部就是基线</span>
    <img src="icon.png" alt="图标" class="baseline-aligned">
</div>
```

```css
.baseline-demo {
    font-size: 24px;
    border-bottom: 1px solid red; /* 可视化基线位置 */
}

.baseline-aligned {
    vertical-align: baseline; /* 默认值，与基线对齐 */
    width: 20px;
    height: 20px;
}
```

### x-height

**定义：** 小写字母x的高度，即基线到中线（meanline）的距离

```css
.x-height-demo {
    font-family: Arial;
    font-size: 48px;
    position: relative;
}

/* 可视化x-height */
.x-height-demo::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1ex; /* 1ex = x-height */
    background: rgba(255, 0, 0, 0.2);
    pointer-events: none;
}
```

## CSS中的middle定义

### middle = 基线 + 1/2 x-height

```html
<div class="middle-demo">
    <span class="text">文字</span>
    <span class="middle-aligned">x</span>
    <img src="icon.png" alt="图标" class="middle-image">
</div>
```

```css
.middle-demo {
    font-size: 24px;
    line-height: 2;
}

.middle-aligned {
    vertical-align: middle; /* 中线对齐 */
    background: yellow;
}

.middle-image {
    vertical-align: middle;
    width: 16px;
    height: 16px;
}
```

## ex单位的应用

### 基本特性

```css
.ex-unit-demo {
    font-size: 16px;
    /* 1ex ≈ 8px（取决于字体） */
}

.ex-height {
    height: 1ex; /* 等于当前字体的x-height */
}

.ex-icon {
    width: 1ex;
    height: 1ex;
    /* 图标大小始终与字体的x-height匹配 */
}
```

### 不受字体和字号影响的居中

```css
.ex-centered {
    font-size: 14px;
}

.ex-centered .icon {
    vertical-align: -0.5ex; /* 向下偏移半个x-height */
    /* 实现视觉上的垂直居中 */
}

/* 在不同字号下测试 */
.large-text {
    font-size: 24px;
}

.large-text .icon {
    vertical-align: -0.5ex; /* 仍然居中 */
}
```

## 实际应用场景

### 1. 图标与文字对齐

```html
<p class="icon-text">
    <img src="success-icon.svg" alt="成功" class="icon">
    操作成功
</p>
```

```css
.icon-text .icon {
    width: 1ex;
    height: 1ex;
    vertical-align: baseline;
    margin-right: 0.5ex;
}
```

### 2. 上标和下标

```html
<p>H<sub class="ex-subscript">2</sub>O 和 E=mc<sup class="ex-superscript">2</sup></p>
```

```css
.ex-subscript {
    vertical-align: -0.3ex;
    font-size: 0.8em;
}

.ex-superscript {
    vertical-align: 0.6ex;
    font-size: 0.8em;
}
```

### 3. 装饰性元素对齐

```css
.decorated-text::before {
    content: "★";
    vertical-align: 0.1ex; /* 微调对齐 */
    margin-right: 0.5ex;
    color: gold;
}
```

## 不同字体的x-height差异

### 字体对比

```css
.font-comparison {
    font-size: 48px;
    display: flex;
    gap: 20px;
}

.arial {
    font-family: Arial;
    /* Arial的x-height相对较大 */
}

.times {
    font-family: "Times New Roman";
    /* Times的x-height相对较小 */
}

.georgia {
    font-family: Georgia;
    /* Georgia的x-height适中 */
}

/* 使用ex单位的元素会自动适应不同字体 */
.adaptive-icon {
    width: 1ex;
    height: 1ex;
    background: red;
    display: inline-block;
    vertical-align: baseline;
}
```

## 调试和可视化

### 显示基线和x-height

```css
.debug-typography {
    position: relative;
    font-size: 48px;
    line-height: 2;
}

/* 基线 */
.debug-typography::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: red;
    z-index: 1;
}

/* x-height */
.debug-typography::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1ex;
    background: rgba(0, 255, 0, 0.3);
    z-index: 0;
}
```

### JavaScript测量

```javascript
function measureTypography(element) {
    const computed = getComputedStyle(element);
    const fontSize = parseFloat(computed.fontSize);
    
    // 创建测量元素
    const testEl = document.createElement('span');
    testEl.style.font = computed.font;
    testEl.style.fontSize = fontSize + 'px';
    testEl.textContent = 'x';
    testEl.style.position = 'absolute';
    testEl.style.visibility = 'hidden';
    
    document.body.appendChild(testEl);
    
    const xHeight = testEl.offsetHeight;
    const exValue = parseFloat(computed.getPropertyValue('--ex-test') || '0');
    
    document.body.removeChild(testEl);
    
    return {
        fontSize: fontSize,
        xHeight: xHeight,
        xHeightRatio: xHeight / fontSize,
        exInPixels: exValue || 'N/A'
    };
}

// 使用示例
const typography = measureTypography(document.querySelector('.test-element'));
console.table(typography);
```

## 高级应用

### 响应式图标大小

```css
.responsive-icon {
    width: 1.2ex;
    height: 1.2ex;
    /* 图标大小跟随文字大小变化 */
}

@media (max-width: 768px) {
    body {
        font-size: 14px; /* 图标会自动变小 */
    }
}

@media (min-width: 1200px) {
    body {
        font-size: 18px; /* 图标会自动变大 */
    }
}
```

### 精确的垂直对齐

```css
.precise-alignment {
    font-size: 16px;
}

.bullet-point::before {
    content: "•";
    vertical-align: 0.125ex; /* 精确调整项目符号位置 */
    margin-right: 0.5ex;
}

.mathematical-symbol {
    vertical-align: -0.2ex; /* 数学符号微调 */
}
```

## 浏览器兼容性

- **基线对齐：** 所有浏览器支持
- **ex单位：** IE6+支持
- **vertical-align: middle：** 所有浏览器支持
- **CSS中的middle定义：** 现代浏览器实现一致

## 最佳实践

1. **使用ex单位：** 创建与字体大小相关的图标和装饰元素
2. **理解middle：** 知道middle不是真正的几何中心
3. **字体测试：** 在不同字体下测试对齐效果
4. **微调对齐：** 使用小数ex值进行精确调整
5. **调试工具：** 使用CSS或JavaScript可视化基线和x-height

掌握基线和x-height概念是实现精确文字排版和元素对齐的基础。

## 标签
#CSS #前端面试