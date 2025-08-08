## 概述

`line-height`是CSS中控制行高的重要属性，它具有许多特殊的行为和计算规则。深入理解`line-height`的特性对于精确控制文字排版和解决垂直对齐问题至关重要。

## line-height的核心特性

### 1. 内联元素高度决定机制

**对于非替换内联元素，`line-height`完全决定其可视高度**

```html
<div class="line-height-demo">
    <span class="text-element">纯文本内容</span>
</div>
```

```css
.text-element {
    font-size: 16px;
    line-height: 2; /* 32px，完全决定元素高度 */
    background: yellow;
}

/* line-height就是行框盒子高度的基础 */
.line-box-base {
    font-size: 20px;
    line-height: 1.5; /* 30px行高 */
}
```

### 2. 行距（Leading）机制

**行距分布在文字上下方，形成"半行距"概念**

```css
.leading-example {
    font-size: 16px;
    line-height: 24px;
    /* 行距 = line-height - font-size = 24px - 16px = 8px */
    /* 上半行距 = 下半行距 = 4px */
}
```

```html
<div class="leading-visualization">
    <div class="text-line">第一行文字</div>
    <div class="text-line">第二行文字</div>
</div>
```

```css
.leading-visualization {
    font-size: 16px;
    line-height: 2; /* 32px */
    border: 1px solid #ccc;
}

.text-line {
    background: rgba(255, 0, 0, 0.1);
    /* 每行上方4px + 文字16px + 下方4px = 24px可视区域 */
}
```

### 3. 行距计算公式

```css
/* 基本公式：行距 = line-height - font-size */
.calculation-demo {
    font-size: 18px;
    line-height: 30px;
    /* 行距 = 30px - 18px = 12px */
    /* 上半行距 = 下半行距 = 6px */
}
```

### 4. 像素取整规则

**传统CSS属性不支持小数像素，有特殊的取整规则**

```css
.pixel-rounding {
    font-size: 15px;
    line-height: 23px;
    /* 行距 = 8px，上下各4px（整数） */
}

.fractional-example {
    font-size: 16px;
    line-height: 23px;
    /* 行距 = 7px */
    /* 上边距 = 3px（向下取整） */
    /* 下边距 = 4px（向上取整） */
}
```

### 5. 替换元素的影响

**有替换元素时，`line-height`只能决定最小高度**

```html
<div class="mixed-content">
    文本内容 <img src="icon.png" alt="图标" class="inline-icon"> 更多文本
</div>
```

```css
.mixed-content {
    font-size: 16px;
    line-height: 20px; /* 最小高度20px */
}

.inline-icon {
    width: 32px;
    height: 32px;
    vertical-align: baseline;
    /* 图标高度32px > line-height 20px，实际行高会被撑大 */
}
```

### 6. 块级元素的间接影响

**`line-height`对块级元素本身无作用，通过内联元素间接影响**

```css
.block-element {
    line-height: 2; /* 对块级元素本身无直接作用 */
    font-size: 16px;
}

.block-element span {
    /* 继承line-height: 2，影响内联元素高度 */
    /* 从而间接改变父级块元素高度 */
}
```

## line-height值类型详解

### 1. 数值类型（推荐）

```css
.numeric-line-height {
    font-size: 16px;
    line-height: 1.5; /* 数值，计算值 = 16px × 1.5 = 24px */
}

.numeric-line-height .child {
    font-size: 20px;
    /* 继承line-height: 1.5，计算值 = 20px × 1.5 = 30px */
}
```

### 2. 百分比类型

```css
.percentage-line-height {
    font-size: 16px;
    line-height: 150%; /* 计算值 = 16px × 1.5 = 24px */
}

.percentage-line-height .child {
    font-size: 20px;
    /* 继承计算值24px，不会重新计算 */
}
```

### 3. 长度值类型

```css
.length-line-height {
    font-size: 16px;
    line-height: 24px; /* 固定长度值 */
}

.length-line-height .child {
    font-size: 20px;
    /* 继承24px，不随字体大小变化 */
}
```

### 4. normal关键字

```css
.normal-line-height {
    line-height: normal;
    /* 浏览器默认值，通常为1.0-1.2之间 */
    /* 具体值取决于字体 */
}
```

## 继承机制对比

### 数值继承 vs 计算值继承

```html
<div class="parent-numeric">
    父元素（数值）
    <div class="child-large">子元素（大字体）</div>
</div>

<div class="parent-percentage">
    父元素（百分比）
    <div class="child-large">子元素（大字体）</div>
</div>
```

```css
/* 数值继承：推荐方式 */
.parent-numeric {
    font-size: 16px;
    line-height: 1.5; /* 子元素继承1.5这个比例 */
}

.parent-numeric .child-large {
    font-size: 24px;
    /* line-height计算值 = 24px × 1.5 = 36px（合适） */
}

/* 百分比/长度值继承：可能有问题 */
.parent-percentage {
    font-size: 16px;
    line-height: 150%; /* 计算值24px */
}

.parent-percentage .child-large {
    font-size: 24px;
    /* line-height = 24px（继承的计算值，可能太小） */
}
```

## 多内联元素的line-height竞争

### 高度由最大line-height决定

```html
<div class="multi-inline">
    <span class="small-line">小行高文本</span>
    <span class="large-line">大行高文本</span>
    <span class="medium-line">中等行高文本</span>
</div>
```

```css
.multi-inline {
    font-size: 16px;
    border: 1px solid #ccc;
}

.small-line {
    line-height: 1.2; /* 19.2px */
}

.large-line {
    line-height: 2.5; /* 40px，决定整行高度 */
    background: yellow;
}

.medium-line {
    line-height: 1.8; /* 28.8px */
}

/* 整行高度由.large-line的40px决定 */
```

## 幽灵空白节点

### 行框盒子中的隐形节点

```html
<div class="ghost-node-demo">
    <span class="visible-text">可见文本</span>
</div>
```

```css
.ghost-node-demo {
    font-size: 16px;
    line-height: 2;
    border: 1px solid #ccc;
    /* 每个行框盒子前都有一个0宽度的"幽灵空白节点" */
    /* 它具有当前元素的字体和行高属性 */
}

.visible-text {
    background: yellow;
    /* 与幽灵空白节点在同一行框盒子中 */
}
```

## 实际应用场景

### 1. 垂直居中

```css
.vertical-center {
    height: 200px;
    line-height: 200px; /* 单行文本垂直居中 */
    text-align: center;
}

.multi-line-center {
    display: table-cell;
    height: 200px;
    vertical-align: middle;
    line-height: 1.4; /* 多行文本时使用正常行高 */
}
```

### 2. 按钮文字对齐

```css
.button {
    height: 40px;
    line-height: 40px; /* 文字垂直居中 */
    padding: 0 20px;
    text-align: center;
}

.button-with-icon {
    height: 40px;
    line-height: 40px;
    display: inline-flex;
    align-items: center; /* 现代方案，更灵活 */
}
```

### 3. 列表项间距控制

```css
.custom-list li {
    line-height: 1.8; /* 增加行间距提高可读性 */
}

.compact-list li {
    line-height: 1.2; /* 紧凑布局 */
}
```

### 4. 表单元素对齐

```css
.form-row {
    line-height: 2.5;
}

.form-row label {
    display: inline-block;
    width: 100px;
    /* 与input元素基线对齐 */
}

.form-row input {
    vertical-align: baseline;
    line-height: normal; /* 恢复默认行高 */
}
```

## 调试技巧

### 可视化line-height

```css
.debug-line-height {
    background: linear-gradient(
        to bottom,
        transparent 0,
        transparent calc(50% - 0.5px),
        red calc(50% - 0.5px),
        red calc(50% + 0.5px),
        transparent calc(50% + 0.5px)
    );
    /* 显示行高中心线 */
}
```

### JavaScript检测

```javascript
function analyzeLineHeight(element) {
    const computed = getComputedStyle(element);
    const fontSize = parseFloat(computed.fontSize);
    const lineHeight = parseFloat(computed.lineHeight);
    
    return {
        fontSize: fontSize,
        lineHeight: lineHeight,
        leading: lineHeight - fontSize,
        halfLeading: (lineHeight - fontSize) / 2,
        ratio: lineHeight / fontSize
    };
}

// 使用示例
const element = document.querySelector('.text-element');
console.table(analyzeLineHeight(element));
```

## 常见问题解决

### 问题1：图标和文字不对齐

```css
/* 问题：图标与文字基线不一致 */
.icon-text-problem {
    font-size: 16px;
    line-height: 1.5;
}

.icon-text-problem .icon {
    width: 16px;
    height: 16px;
    /* 默认基线对齐可能有偏差 */
}

/* 解决：调整vertical-align */
.icon-text-solution .icon {
    vertical-align: -2px; /* 微调对齐 */
    /* 或使用 vertical-align: middle; */
}
```

### 问题2：行高继承问题

```css
/* 问题：使用百分比导致子元素行高不当 */
.parent-issue {
    font-size: 16px;
    line-height: 120%; /* 计算值19.2px */
}

.parent-issue .large-child {
    font-size: 24px;
    /* 继承19.2px，太小了 */
}

/* 解决：使用数值 */
.parent-solution {
    font-size: 16px;
    line-height: 1.2; /* 比例值 */
}

.parent-solution .large-child {
    font-size: 24px;
    /* line-height = 24px × 1.2 = 28.8px，合适 */
}
```

## 最佳实践

1. **优先使用数值：** `line-height: 1.5`而不是`150%`或`24px`
2. **考虑可读性：** 正文文本通常使用1.4-1.6的行高
3. **标题区别对待：** 大标题可以使用较小的行高比例
4. **测试不同字体：** 不同字体可能需要调整行高
5. **注意替换元素：** 图片等元素会影响行高计算
6. **使用相对单位：** 便于响应式设计和维护

理解`line-height`的特殊性有助于创建更好的文字排版效果和解决复杂的垂直对齐问题。

## 标签
#CSS #前端面试