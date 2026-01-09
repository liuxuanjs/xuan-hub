## 概述
white-space属性控制元素内空白字符的处理方式，包括空格、制表符、换行符等。理解这个属性对文本排版很重要。

## 属性值详解

### 基本值
```css
.normal { white-space: normal; }       /* 默认：合并空白，自动换行 */
.nowrap { white-space: nowrap; }       /* 合并空白，不换行 */
.pre { white-space: pre; }             /* 保留空白，不自动换行 */
.pre-line { white-space: pre-line; }   /* 保留换行，合并其他空白 */
.pre-wrap { white-space: pre-wrap; }   /* 保留空白，自动换行 */
```

### 行为对比表

| 值 | 空格/制表符 | 换行符 | 自动换行 |
|-----------|------------|--------|----------|
| normal    | 合并       | 合并   | 是       |
| nowrap    | 合并       | 合并   | 否       |
| pre       | 保留       | 保留   | 否       |
| pre-line  | 合并       | 保留   | 是       |
| pre-wrap  | 保留       | 保留   | 是       |

## 实际应用场景

### 1. 代码显示
```css
.code-block {
    white-space: pre;       /* 保留代码格式 */
    font-family: monospace;
    background: #f5f5f5;
    padding: 15px;
    border-radius: 4px;
    overflow-x: auto;
}
```

### 2. 诗歌排版
```css
.poem {
    white-space: pre-line;  /* 保留换行，合并多余空格 */
    line-height: 1.6;
    text-align: center;
}
```

### 3. 单行文本省略
```css
.text-ellipsis {
    white-space: nowrap;    /* 不换行 */
    overflow: hidden;
    text-overflow: ellipsis;
    width: 200px;
}
```

### 4. 导航菜单
```css
.nav-item {
    white-space: nowrap;    /* 防止菜单项换行 */
    padding: 10px 15px;
}
```

### 5. 表格内容
```css
.table-cell {
    white-space: nowrap;    /* 表格单元格不换行 */
    overflow: hidden;
    text-overflow: ellipsis;
}

.table-cell-wrap {
    white-space: normal;    /* 允许换行的单元格 */
    word-break: break-word;
}
```

## 特殊用法

### 预格式化文本
```html
<pre class="formatted-text">
这是预格式化文本
    保留    所有空白
        和换行
</pre>
```

```css
.formatted-text {
    white-space: pre;       /* 或直接用pre标签 */
}
```

### 响应式换行控制
```css
.responsive-text {
    white-space: nowrap;
}

@media (max-width: 768px) {
    .responsive-text {
        white-space: normal; /* 移动端允许换行 */
    }
}
```

### 长文本处理
```css
.long-text {
    white-space: pre-wrap;  /* 保留格式但允许换行 */
    word-wrap: break-word;  /* 长单词强制换行 */
}
```

## 与其他属性配合

### 配合overflow
```css
.container {
    white-space: nowrap;
    overflow: hidden;       /* 隐藏溢出 */
    text-overflow: ellipsis; /* 显示省略号 */
}
```

### 配合word-break
```css
.break-text {
    white-space: normal;
    word-break: break-all;  /* 强制换行 */
}
```

### 配合line-height
```css
.pre-text {
    white-space: pre;
    line-height: 1.4;       /* 调整行高 */
    font-family: monospace;
}
```

## 实用技巧

### 1. 按钮文字不换行
```css
.btn {
    white-space: nowrap;    /* 确保按钮文字不换行 */
    padding: 8px 16px;
}
```

### 2. 标签云
```css
.tag {
    white-space: nowrap;    /* 标签不换行 */
    display: inline-block;
    padding: 4px 8px;
    margin: 2px;
    background: #e0e0e0;
    border-radius: 12px;
}
```

### 3. 面包屑导航
```css
.breadcrumb {
    white-space: nowrap;    /* 整个导航不换行 */
    overflow-x: auto;       /* 水平滚动 */
}
```

### 4. 聊天消息
```css
.message {
    white-space: pre-wrap;  /* 保留换行和空格 */
    word-wrap: break-word;
    max-width: 70%;
}
```

### 5. 代码高亮
```css
.syntax-highlight {
    white-space: pre;
    tab-size: 4;            /* 设置制表符宽度 */
    font-family: 'Fira Code', monospace;
}
```

## 动态控制

### JavaScript切换
```javascript
function toggleWrap(element) {
    const current = getComputedStyle(element).whiteSpace;
    element.style.whiteSpace = current === 'nowrap' ? 'normal' : 'nowrap';
}
```

### CSS类切换
```css
.text-container {
    white-space: nowrap;
}

.text-container.wrapped {
    white-space: normal;
}
```

## 常见问题

### 1. 内联块元素间距
```html
<div class="inline-blocks">
    <div class="item">项目1</div>
    <div class="item">项目2</div>
</div>
```

```css
/* 问题：元素间有空隙 */
.inline-blocks {
    font-size: 0;           /* 父元素字体为0 */
    white-space: nowrap;    /* 不换行 */
}

.item {
    display: inline-block;
    font-size: 14px;        /* 恢复字体大小 */
}
```

### 2. 表单元素对齐
```css
.form-inline {
    white-space: nowrap;    /* 表单元素不换行 */
}

.form-inline input,
.form-inline button {
    margin-right: 10px;
}
```

## 浏览器兼容性

- white-space基本值：所有浏览器
- pre-wrap：IE8+
- pre-line：IE8+
- break-spaces：Chrome 76+, Firefox 69+

## 调试技巧

### 可视化空白字符
```css
.debug-whitespace {
    background: 
        repeating-linear-gradient(
            to right,
            transparent,
            transparent 1ch,
            rgba(255, 0, 0, 0.1) 1ch,
            rgba(255, 0, 0, 0.1) 1.1ch
        );
}
```

## 总结

white-space控制的关键点：

1. **控制空白处理**：空格、制表符、换行符
2. **五个主要值**：normal、nowrap、pre、pre-line、pre-wrap
3. **常用组合**：配合overflow、text-overflow使用
4. **代码显示**：pre类值适合代码和预格式化文本
5. **响应式考虑**：不同屏幕尺寸可能需要不同处理
6. **性能影响小**：是安全的样式属性

掌握white-space可以精确控制文本的空白字符处理方式。