## 概述
display属性是CSS中最重要的属性之一，它决定了元素的显示类型和布局方式。

## 主要属性值

### 1. none
隐藏元素，元素不占据空间：
```css
.hidden {
    display: none;
}
```

### 2. block
块级元素，独占一行：
```css
.block {
    display: block;
    width: 100%;
}
```

### 3. inline
行内元素，不能设置宽高：
```css
.inline {
    display: inline;
}
```

### 4. inline-block
行内块元素，可以设置宽高：
```css
.inline-block {
    display: inline-block;
    width: 100px;
    height: 50px;
}
```

### 5. table
表格显示：
```css
.table {
    display: table;
}
```

### 6. table-cell
表格单元格显示：
```css
.table-cell {
    display: table-cell;
    vertical-align: middle;
}
```

### 7. flex
弹性盒布局：
```css
.flex {
    display: flex;
    justify-content: center;
    align-items: center;
}
```

### 8. inline-flex
行内弹性盒布局：
```css
.inline-flex {
    display: inline-flex;
}
```

### 9. grid
网格布局：
```css
.grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
}
```

### 10. inline-grid
行内网格布局：
```css
.inline-grid {
    display: inline-grid;
}
```

## 应用场景

### 响应式隐藏
```css
@media (max-width: 768px) {
    .desktop-only {
        display: none;
    }
}
```

### 垂直居中
```css
.parent {
    display: table-cell;
    vertical-align: middle;
}
```

### 弹性布局
```css
.container {
    display: flex;
    flex-direction: column;
}
```

## 浏览器兼容性

- block, inline, none: 所有浏览器
- inline-block: IE8+
- flex: IE11+, 需要前缀
- grid: IE10+, 需要前缀

## 总结

display属性是控制元素布局的关键属性，选择合适的值可以实现各种布局效果。