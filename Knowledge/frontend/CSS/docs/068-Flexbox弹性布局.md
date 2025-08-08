## 概述
Flexbox（弹性盒模型）是CSS3引入的布局方式，为盒状模型提供最大的灵活性，是现代网页布局的核心技术。

## 基本概念

### 主轴和交叉轴
- 主轴（main axis）：Flex容器的主要方向
- 交叉轴（cross axis）：垂直于主轴的方向

### 容器和项目
- 容器（container）：设置了display: flex的元素
- 项目（item）：容器的直接子元素

## 容器属性

### 1. display
```css
.container {
    display: flex; /* 块级容器 */
    display: inline-flex; /* 行内容器 */
}
```

### 2. flex-direction（主轴方向）
```css
.container {
    flex-direction: row; /* 默认，水平从左到右 */
    flex-direction: row-reverse; /* 水平从右到左 */
    flex-direction: column; /* 垂直从上到下 */
    flex-direction: column-reverse; /* 垂直从下到上 */
}
```

### 3. flex-wrap（换行）
```css
.container {
    flex-wrap: nowrap; /* 默认，不换行 */
    flex-wrap: wrap; /* 换行 */
    flex-wrap: wrap-reverse; /* 换行，第一行在下方 */
}
```

### 4. flex-flow（简写）
```css
.container {
    flex-flow: row wrap; /* flex-direction 和 flex-wrap 的简写 */
}
```

### 5. justify-content（主轴对齐）
```css
.container {
    justify-content: flex-start; /* 默认，左对齐 */
    justify-content: flex-end; /* 右对齐 */
    justify-content: center; /* 居中 */
    justify-content: space-between; /* 两端对齐，项目之间间隔相等 */
    justify-content: space-around; /* 每个项目两侧间隔相等 */
    justify-content: space-evenly; /* 项目和间隔都相等 */
}
```

### 6. align-items（交叉轴对齐）
```css
.container {
    align-items: stretch; /* 默认，如果项目未设置高度，将占满整个容器 */
    align-items: flex-start; /* 交叉轴起点对齐 */
    align-items: flex-end; /* 交叉轴终点对齐 */
    align-items: center; /* 交叉轴中点对齐 */
    align-items: baseline; /* 项目第一行文字基线对齐 */
}
```

### 7. align-content（多根轴线对齐）
```css
.container {
    align-content: stretch; /* 默认，轴线占满整个交叉轴 */
    align-content: flex-start; /* 与交叉轴起点对齐 */
    align-content: flex-end; /* 与交叉轴终点对齐 */
    align-content: center; /* 与交叉轴中点对齐 */
    align-content: space-between; /* 与交叉轴两端对齐 */
    align-content: space-around; /* 每根轴线两侧间隔相等 */
}
```

## 项目属性

### 1. order（排列顺序）
```css
.item {
    order: 0; /* 默认为0，数值越小，排列越靠前 */
    order: 1;
    order: -1;
}
```

### 2. flex-grow（放大比例）
```css
.item {
    flex-grow: 0; /* 默认，即使存在剩余空间也不放大 */
    flex-grow: 1; /* 等比例分配剩余空间 */
    flex-grow: 2; /* 获得2倍的剩余空间 */
}
```

### 3. flex-shrink（缩小比例）
```css
.item {
    flex-shrink: 1; /* 默认，如果空间不足，该项目将缩小 */
    flex-shrink: 0; /* 不缩小 */
    flex-shrink: 2; /* 缩小比例为2 */
}
```

### 4. flex-basis（初始大小）
```css
.item {
    flex-basis: auto; /* 默认，项目本来大小 */
    flex-basis: 200px; /* 固定尺寸 */
    flex-basis: 20%; /* 百分比 */
    flex-basis: content; /* 基于内容的自动尺寸 */
}
```

### 5. flex（简写）
```css
.item {
    flex: 0 1 auto; /* 默认值，相当于 flex-grow flex-shrink flex-basis */
    flex: 1; /* 相当于 flex: 1 1 0% */
    flex: auto; /* 相当于 flex: 1 1 auto */
    flex: none; /* 相当于 flex: 0 0 auto */
}
```

### 6. align-self（单独对齐）
```css
.item {
    align-self: auto; /* 默认，继承父元素的align-items */
    align-self: flex-start;
    align-self: flex-end;
    align-self: center;
    align-self: baseline;
    align-self: stretch;
}
```

## 实际应用场景

### 1. 水平垂直居中
```css
.center-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
```

### 2. 等高布局
```css
.equal-height {
    display: flex;
    align-items: stretch; /* 默认值 */
}

.equal-height .column {
    flex: 1;
    padding: 20px;
}
```

### 3. 响应式导航
```css
.nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.nav-links {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
}

.nav-links li {
    margin-left: 20px;
}

@media (max-width: 768px) {
    .nav {
        flex-direction: column;
    }
    
    .nav-links {
        flex-direction: column;
        width: 100%;
    }
    
    .nav-links li {
        margin: 5px 0;
    }
}
```

### 4. 卡片布局
```css
.card-container {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
}

.card {
    flex: 1 1 300px; /* 最小宽度300px，自动调整 */
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
}
```

### 5. 侧边栏布局
```css
.layout {
    display: flex;
    min-height: 100vh;
}

.sidebar {
    flex: 0 0 250px; /* 固定宽度 */
    background: #f5f5f5;
}

.main-content {
    flex: 1; /* 自适应剩余空间 */
    padding: 20px;
}
```

## 浏览器兼容性

### 现代语法
- Chrome 29+
- Firefox 28+
- Safari 9+
- IE 11+

### 旧版本兼容
```css
.container {
    display: -webkit-box; /* 老版本语法 */
    display: -webkit-flex; /* Chrome */
    display: -ms-flexbox; /* IE 10 */
    display: flex; /* 现代语法 */
}
```

## 常见问题和解决方案

### 1. flex项目最小宽度问题
```css
.item {
    min-width: 0; /* 解决内容撑开问题 */
    word-wrap: break-word;
}
```

### 2. IE11兼容性问题
```css
.item {
    flex: 1 1 0px; /* IE11需要明确单位 */
}
```

### 3. Safari兼容性
```css
.container {
    -webkit-flex-wrap: wrap;
    flex-wrap: wrap;
}
```

## 总结

Flexbox是现代布局的核心技术，具有以下优势：
- 简化了复杂布局的实现
- 提供了强大的对齐能力
- 原生支持响应式设计
- 解决了传统布局的许多痛点

掌握Flexbox是现代前端开发的必备技能。