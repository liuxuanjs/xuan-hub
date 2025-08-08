## 概述
position属性指定了元素的定位类型，决定了元素在文档流中的表现方式。

## 属性值详解

### 1. static（默认值）
元素遵循正常的文档流，top、right、bottom、left属性无效：
```css
.static {
    position: static;
    /* top、left等属性无效 */
}
```

### 2. relative（相对定位）
相对于元素原来的位置进行定位：
```css
.relative {
    position: relative;
    top: 10px;
    left: 20px;
}
```

### 3. absolute（绝对定位）
相对于最近的已定位祖先元素进行定位：
```css
.absolute {
    position: absolute;
    top: 50px;
    right: 0;
}
```

### 4. fixed（固定定位）
相对于浏览器窗口进行定位：
```css
.fixed {
    position: fixed;
    bottom: 20px;
    right: 20px;
}
```

### 5. sticky（粘性定位）
在跨越特定阈值前为相对定位，之后为固定定位：
```css
.sticky {
    position: sticky;
    top: 0;
}
```

## 实际应用场景

### 导航栏固定
```css
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: white;
    z-index: 1000;
}
```

### 模态框居中
```css
.modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
}
```

### 粘性侧边栏
```css
.sidebar {
    position: sticky;
    top: 20px;
    height: fit-content;
}
```

## 浏览器兼容性
- static, relative, absolute, fixed: 所有浏览器
- sticky: Chrome 56+, Firefox 32+, Safari 6.1+

## 总结
合理使用position属性可以实现各种复杂的布局效果，关键是理解各个值的定位基准。