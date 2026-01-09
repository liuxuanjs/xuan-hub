## 概述
text-indent属性用于设置文本首行缩进，它有一些特殊的表现和应用技巧，在文本排版和元素隐藏方面都很有用。

## 基本用法

### 数值缩进
```css
.indent-px { text-indent: 32px; }      /* 像素值 */
.indent-em { text-indent: 2em; }       /* 相对字体大小 */
.indent-percent { text-indent: 10%; }  /* 相对容器宽度 */
```

### 负值缩进
```css
.negative-indent {
    text-indent: -2em;    /* 负值，首行向左伸出 */
    padding-left: 2em;    /* 避免文字被截断 */
}
```

## 特殊应用场景

### 1. 中文段落缩进
```css
.chinese-paragraph {
    text-indent: 2em;     /* 中文习惯：首行缩进两个字符 */
    line-height: 1.8;
    margin-bottom: 1em;
}
```

### 2. 文字隐藏技巧
```css
.hide-text {
    text-indent: -9999px; /* 将文字推到屏幕外隐藏 */
    overflow: hidden;     /* 确保隐藏 */
    background: url('logo.png') no-repeat;
    width: 200px;
    height: 50px;
}
```

### 3. 无障碍文本
```css
.screen-reader-only {
    text-indent: -9999px;
    position: absolute;
    left: -9999px;
    /* 屏幕阅读器可读，视觉上隐藏 */
}
```

### 4. 装饰性首字符
```css
.drop-cap::first-letter {
    float: left;
    font-size: 3em;
    line-height: 1;
    margin-right: 0.1em;
    margin-top: 0.1em;
}

.drop-cap {
    text-indent: 0; /* 取消默认缩进 */
}
```

## 继承特性

### 子元素继承
```css
.parent {
    text-indent: 2em; /* 子元素会继承 */
}

.child {
    text-indent: inherit; /* 明确继承 */
    text-indent: 0;       /* 重置缩进 */
}
```

### 块级元素才有效
```css
/* 有效 */
p { text-indent: 2em; }
div { text-indent: 2em; }

/* 无效 */
span { text-indent: 2em; } /* 内联元素无效 */
```

## 实际应用技巧

### 1. 响应式缩进
```css
.responsive-indent {
    text-indent: 5%;
}

@media (max-width: 768px) {
    .responsive-indent {
        text-indent: 1em; /* 移动端固定缩进 */
    }
}
```

### 2. 列表样式优化
```css
.custom-list {
    list-style: none;
    padding: 0;
}

.custom-list li {
    text-indent: -1.5em;  /* 负缩进 */
    padding-left: 1.5em;  /* 留出空间 */
}

.custom-list li::before {
    content: "• ";
    color: #666;
}
```

### 3. 诗歌排版
```css
.poem {
    text-indent: 0;       /* 诗歌通常不缩进 */
    line-height: 1.8;
    margin-bottom: 1em;
}

.poem-indent {
    text-indent: 4em;     /* 特殊缩进效果 */
}
```

### 4. 代码缩进效果
```css
.code-indent {
    font-family: monospace;
    white-space: pre;
    text-indent: 0;       /* 代码不使用text-indent */
}

/* 使用padding模拟缩进层级 */
.code-level-1 { padding-left: 2em; }
.code-level-2 { padding-left: 4em; }
```

## 与其他属性的配合

### 配合direction
```css
.rtl-text {
    direction: rtl;       /* 从右到左 */
    text-indent: 2em;     /* 在RTL中从右侧缩进 */
}
```

### 配合writing-mode
```css
.vertical-text {
    writing-mode: vertical-rl;
    text-indent: 2em;   /* 垂直文本中的缩进 */
}
```

### 避免与float冲突
```css
.float-container {
    text-indent: 2em;
}

.float-container img {
    float: left;
    margin-right: 1em;
    /* 可能影响首行缩进效果 */
}
```

## 常见误区

### 1. 对内联元素无效
```css
/* 错误：对span无效 */
span { text-indent: 2em; }

/* 正确：改为块级或内联块 */
span {
    display: inline-block;
    text-indent: 2em;
}
```

### 2. 只影响首行
```css
.multi-line {
    text-indent: 2em; /* 只有第一行缩进 */
    /* 其他行不受影响 */
}
```

### 3. 百分比基于容器宽度
```css
.container {
    width: 300px;
}

.text {
    text-indent: 10%; /* 缩进30px (300px * 10%) */
}
```

## 浏览器兼容性

- text-indent基本功能：所有浏览器
- 负值：所有浏览器
- 百分比值：所有浏览器
- 配合direction/writing-mode：现代浏览器

## 性能考虑

### 避免过大负值
```css
/* 可能影响性能 */
.extreme-negative {
    text-indent: -99999px;
}

/* 推荐 */
.reasonable-negative {
    text-indent: -9999px;
}
```

## 调试技巧

### 可视化缩进
```css
.debug-indent {
    background: linear-gradient(to right, red 0, red 2em, transparent 2em);
}
```

## 替代方案

### 使用padding
```css
/* text-indent方案 */
.indent-text {
    text-indent: 2em;
}

/* padding方案（更灵活） */
.padding-text {
    padding-left: 2em;
}
```

### 使用伪元素
```css
.pseudo-indent::before {
    content: '';
    display: inline-block;
    width: 2em;
}
```

## 总结

text-indent的关键特性：

1. **只影响首行**：其他行不受影响
2. **块级元素有效**：内联元素无效
3. **可以用负值**：实现文字隐藏等效果
4. **继承性**：子元素会继承父元素的缩进
5. **百分比基于容器宽度**：响应式设计友好
6. **有替代方案**：padding、伪元素等

text-indent在文本排版和特殊效果实现中都有重要作用。