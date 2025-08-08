## 概述

CSS3的`all`属性是一个简写属性，用于重置元素的所有CSS属性（除了`unicode-bidi`和`direction`），常用于样式重置和组件隔离。

## 基本语法

```css
/* all属性的三个可用值 */
.element {
    all: initial;  /* 重置为初始值 */
    all: inherit;  /* 继承父元素值 */
    all: unset;    /* 智能重置 */
}
```

## 属性值详解

### initial - 初始值重置

**作用：** 将所有属性重置为CSS规范定义的初始值

```css
.reset-to-initial {
    all: initial;
}

/* 等同于手动重置所有属性 */
.manual-reset {
    background: transparent;
    border: none;
    color: black;
    font-size: medium;
    margin: 0;
    padding: 0;
    /* ... 更多属性 */
}
```

### inherit - 继承父元素

**作用：** 强制所有属性继承父元素的对应属性值

```css
.parent {
    color: red;
    font-size: 16px;
    background: yellow;
}

.child {
    all: inherit;  /* 继承父元素的所有样式 */
}
```

### unset - 智能重置

**作用：** 根据属性的继承特性智能选择`inherit`或`initial`

```css
.smart-reset {
    all: unset;
}

/* 效果等同于： */
/* 可继承属性（如color, font-size）→ inherit */
/* 不可继承属性（如background, margin）→ initial */
```

## 不受影响的属性

`all`属性不会重置以下两个属性：

- **unicode-bidi：** 控制文本双向算法
- **direction：** 控制文本方向（ltr/rtl）

```css
.element {
    direction: rtl;
    unicode-bidi: bidi-override;
    all: initial;  /* 以上两个属性保持不变 */
}
```

## 实际应用场景

### 组件样式隔离

```css
/* 第三方组件样式重置 */
.third-party-widget {
    all: initial;
    /* 然后应用组件自己的样式 */
    font-family: Arial, sans-serif;
    color: #333;
}
```

### 样式覆盖重置

```css
/* 清除所有外部样式影响 */
.clean-slate {
    all: unset;
    display: block;  /* 重新设置需要的属性 */
}
```

### 表单元素重置

```css
/* 重置表单元素的默认样式 */
.custom-input {
    all: unset;
    /* 重新定义输入框样式 */
    border: 1px solid #ccc;
    padding: 8px;
    border-radius: 4px;
}
```

## 浏览器兼容性

- **现代浏览器：** 广泛支持
- **IE：** 不支持（IE11及以下）
- **移动端：** 支持良好

```css
/* 兼容性处理 */
.element {
    /* 手动重置关键属性作为回退 */
    margin: 0;
    padding: 0;
    border: none;
    background: none;
    
    /* 现代浏览器使用all属性 */
    all: unset;
}
```

## 使用建议

### 适用场景

- 创建完全独立的组件
- 重置特定元素的所有样式
- 避免样式继承冲突

### 注意事项

- 使用后需要重新设置必要的样式
- 可能影响可访问性相关的样式
- 在复杂布局中谨慎使用

## 标签
#CSS #前端面试