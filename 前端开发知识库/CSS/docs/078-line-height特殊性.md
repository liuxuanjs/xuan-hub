## 概述
line-height（行高）是CSS中控制文本行间距的重要属性，它有一些特殊的计算规则和表现形式，理解这些特性对文本排版很重要。

## 基本概念

### 什么是line-height
line-height定义了文本行之间的垂直距离：
```css
.text {
    font-size: 16px;
    line-height: 24px; /* 行高24px，行间距8px */
}
```

### 行间距的计算
```text
行间距 = line-height - font-size
```

例如：font-size: 16px, line-height: 24px
- 行间距 = 24px - 16px = 8px
- 上下各分配4px

## line-height的几种写法

### 1. 像素值（px）
```css
.px-value {
    font-size: 16px;
    line-height: 24px; /* 固定24px */
}
```

### 2. 倍数值（无单位）
```css
.multiply-value {
    font-size: 16px;
    line-height: 1.5; /* 16px × 1.5 = 24px */
}
```

### 3. 百分比值
```css
.percent-value {
    font-size: 16px;
    line-height: 150%; /* 16px × 150% = 24px */
}
```

### 4. em值
```css
.em-value {
    font-size: 16px;
    line-height: 1.5em; /* 16px × 1.5 = 24px */
}
```

## 继承特性的差异

### 无单位数值（推荐）
```css
.parent {
    font-size: 16px;
    line-height: 1.5; /* 继承倍数，不是计算值 */
}

.child {
    font-size: 20px;
    /* line-height = 20px × 1.5 = 30px */
}
```

### 有单位值的问题
```css
.parent {
    font-size: 16px;
    line-height: 24px; /* 继承计算值24px */
}

.child {
    font-size: 20px;
    /* line-height = 24px（继承的固定值，可能太小） */
}
```

## 实际应用场景

### 1. 文章正文
```css
.article {
    font-size: 16px;
    line-height: 1.6; /* 舒适的阅读行高 */
    color: #333;
}
```

### 2. 标题层级
```css
h1 { font-size: 32px; line-height: 1.2; }
h2 { font-size: 24px; line-height: 1.3; }
h3 { font-size: 20px; line-height: 1.4; }
p  { font-size: 16px; line-height: 1.6; }
```

### 3. 按钮垂直居中
```css
.button {
    height: 40px;
    line-height: 40px; /* 单行文字垂直居中 */
    text-align: center;
    padding: 0 20px;
}
```

### 4. 导航菜单
```css
.nav-item {
    height: 50px;
    line-height: 50px; /* 导航项垂直居中 */
    padding: 0 15px;
}
```

## 特殊情况处理

### 1. 替换元素（如图片）
```css
.image-line {
    line-height: 0; /* 消除图片下方空隙 */
}

.image-line img {
    display: block; /* 或改为块级 */
}
```

### 2. 内联块元素对齐
```css
.inline-blocks {
    line-height: 1;
    font-size: 0; /* 消除间隙 */
}

.inline-block-item {
    display: inline-block;
    line-height: 1.5;
    font-size: 14px;
    vertical-align: top;
}
```

### 3. 表单元素对齐
```css
.form-control {
    height: 36px;
    line-height: 36px; /* 内容垂直居中 */
    padding: 0 12px;
    box-sizing: border-box;
}
```

## 常见问题解决

### 1. 行高过小导致重叠
```css
/* 问题：行高小于字体大小 */
.overlap-text {
    font-size: 16px;
    line-height: 12px; /* 文字重叠 */
}

/* 解决：合理的行高 */
.normal-text {
    font-size: 16px;
    line-height: 1.2; /* 最小建议值 */
}
```

### 2. 容器高度不准确
```css
/* 问题：容器高度与预期不符 */
.container {
    font-size: 0; /* 解决幽灵空白节点问题 */
}

.text-content {
    font-size: 16px;
    line-height: 1.5;
}
```

### 3. 垂直居中失效
```css
/* 问题：多行文本无法居中 */
.single-line {
    height: 50px;
    line-height: 50px; /* 仅适用单行 */
}

/* 解决：使用flexbox */
.multi-line {
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}
```

## 最佳实践

### 1. 使用无单位数值
```css
/* 推荐 */
body {
    line-height: 1.6; /* 灵活继承 */
}

/* 避免 */
body {
    line-height: 24px; /* 固定值，不够灵活 */
}
```

### 2. 合理的行高范围
```css
.text-content {
    /* 正文：1.4-1.8 */
    line-height: 1.6;
}

.heading {
    /* 标题：1.1-1.4 */
    line-height: 1.2;
}

.small-text {
    /* 小字：1.3-1.5 */
    line-height: 1.4;
}
```

### 3. 响应式行高
```css
.responsive-text {
    font-size: 16px;
    line-height: 1.6;
}

@media (max-width: 768px) {
    .responsive-text {
        font-size: 14px;
        line-height: 1.5; /* 移动端稍微紧凑 */
    }
}
```

## 调试技巧

### 可视化行高
```css
.debug-line-height {
    background: linear-gradient(
        to bottom,
        transparent 0%,
        transparent 50%,
        rgba(255, 0, 0, 0.5) 50%,
        rgba(255, 0, 0, 0.5) 100%
    );
    background-size: 100% 1.5em; /* 根据line-height调整 */
}
```

## 浏览器兼容性

- line-height基本功能：所有浏览器
- 无单位数值：所有浏览器
- calc()计算：IE9+

## 总结

line-height的关键点：

1. **控制行间距**：line-height - font-size = 行间距
2. **无单位数值最佳**：继承倍数而非固定值
3. **单行垂直居中**：设置line-height等于容器高度
4. **合理范围**：正文1.4-1.8，标题1.1-1.4
5. **继承特性**：注意不同单位的继承差异

掌握line-height特性有助于创建更好的文本排版和垂直对齐效果。