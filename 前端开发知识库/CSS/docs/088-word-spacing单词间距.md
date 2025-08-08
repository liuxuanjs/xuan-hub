## 概述
word-spacing属性控制单词之间的间距，主要影响英文等以空格分隔单词的文本。理解其特性有助于优化文本排版效果。

## 基本用法

### 数值设置
```css
.normal { word-spacing: normal; }    /* 默认值 */
.tight { word-spacing: -2px; }       /* 紧密 */
.loose { word-spacing: 5px; }        /* 宽松 */
.relative { word-spacing: 0.3em; }   /* 相对单位 */
```

### 单位选择
```css
.px-spacing { word-spacing: 3px; }     /* 像素值 */
.em-spacing { word-spacing: 0.2em; }   /* 相对字体大小 */
.percent-spacing { word-spacing: 50%; } /* 百分比（很少用） */
```

## 应用场景

### 1. 英文标题优化
```css
.english-title {
    font-size: 32px;
    word-spacing: 2px;     /* 单词间距稍大 */
    letter-spacing: 1px;   /* 配合字符间距 */
    text-transform: uppercase;
}
```

### 2. 段落文本调整
```css
.article-text {
    font-size: 16px;
    line-height: 1.6;
    word-spacing: 1px;     /* 轻微增加可读性 */
}

.justified-text {
    text-align: justify;
    word-spacing: normal;  /* 两端对齐时保持默认 */
}
```

### 3. 按钮文字
```css
.btn-text {
    word-spacing: 2px;     /* 按钮文字间距 */
    text-transform: uppercase;
    font-weight: 600;
}
```

### 4. 导航菜单
```css
.nav-item {
    word-spacing: 3px;     /* 导航项单词间距 */
    font-size: 14px;
    text-transform: capitalize;
}
```

## 中英文混排考虑

### 中文文本
```css
.chinese-text {
    word-spacing: normal;  /* 中文不需要调整单词间距 */
    /* 中文主要靠letter-spacing调整 */
    letter-spacing: 0.5px;
}
```

### 中英混合
```css
.mixed-language {
    word-spacing: 1px;     /* 轻微调整，不影响中文 */
    letter-spacing: 0.2px; /* 主要靠字符间距 */
}
```

## 与text-align的配合

### 两端对齐
```css
.justify-text {
    text-align: justify;
    word-spacing: normal;  /* 让浏览器自动调整 */
    text-justify: inter-word; /* 优先调整单词间距 */
}
```

### 居中对齐
```css
.center-text {
    text-align: center;
    word-spacing: 2px;     /* 居中时可以增加间距 */
}
```

## 响应式调整

### 媒体查询
```css
.responsive-words {
    word-spacing: 2px;
}

@media (max-width: 768px) {
    .responsive-words {
        word-spacing: 1px;  /* 移动端减少间距 */
    }
}

@media (min-width: 1200px) {
    .responsive-words {
        word-spacing: 3px;  /* 大屏幕增加间距 */
    }
}
```

## 特殊效果

### 打字机效果
```css
.typewriter-words {
    word-spacing: 0.5em;
    white-space: nowrap;
    overflow: hidden;
    animation: typing 4s steps(10, end);
}

@keyframes typing {
    from { width: 0; }
    to { width: 100%; }
}
```

### 悬停动画
```css
.hover-words {
    word-spacing: 2px;
    transition: word-spacing 0.3s ease;
}

.hover-words:hover {
    word-spacing: 5px;
}
```

## 实际项目应用

### 品牌标语
```css
.brand-slogan {
    font-size: 18px;
    word-spacing: 4px;      /* 标语单词间距较大 */
    letter-spacing: 1px;
    text-transform: uppercase;
    text-align: center;
}
```

### 代码注释
```css
.code-comment {
    font-family: monospace;
    word-spacing: 1px;      /* 代码注释间距 */
    color: #666;
    font-style: italic;
}
```

### 表单标签
```css
.form-label {
    word-spacing: 1px;
    font-weight: 500;
    margin-bottom: 5px;
    display: block;
}
```

## 与其他CSS属性配合

### 配合white-space
```css
.nowrap-words {
    white-space: nowrap;
    word-spacing: 3px;      /* 不换行时的单词间距 */
}
```

### 配合text-transform
```css
.uppercase-words {
    text-transform: uppercase;
    word-spacing: 2px;      /* 大写单词需要更大间距 */
}
```

### 配合font-variant
```css
.small-caps-words {
    font-variant: small-caps;
    word-spacing: 1.5px;    /* 小型大写字母的间距 */
}
```

## 注意事项

### 不要过度使用
```css
/* 过度：影响可读性 */
.excessive {
    word-spacing: 20px;     /* 太大 */
}

/* 合适：适度调整 */
.moderate {
    word-spacing: 2px;
}
```

### 考虑文本内容
```css
/* 短句可以用较大间距 */
.short-phrase {
    word-spacing: 4px;
}

/* 长段落应该保守 */
.long-paragraph {
    word-spacing: 1px;
}
```

### 字体选择影响
```css
.serif-words {
    font-family: Georgia, serif;
    word-spacing: 1px;      /* 衬线字体间距 */
}

.sans-serif-words {
    font-family: Arial, sans-serif;
    word-spacing: 2px;      /* 无衬线字体间距 */
}
```

## 调试技巧

### 可视化单词边界
```css
.debug-words {
    background: repeating-linear-gradient(
        to right,
        transparent,
        transparent 1ch,
        rgba(255, 0, 0, 0.1) 1ch,
        rgba(255, 0, 0, 0.1) 1.1ch
    );
}
```

## 浏览器兼容性

- word-spacing：所有浏览器
- 负值：IE6+
- em单位：所有浏览器
- 百分比：IE8+（很少使用）

## 与letter-spacing对比

| 属性 | 作用对象 | 适用场景 |
|------|----------|----------|
| word-spacing | 单词间距 | 英文文本 |
| letter-spacing | 字符间距 | 所有文本 |

## 总结

word-spacing的关键特点：

1. **控制单词间距**：主要影响英文等空格分隔的文本
2. **中文影响小**：中文文本主要靠letter-spacing
3. **适度调整**：过大会影响可读性
4. **配合其他属性**：text-transform、text-align等
5. **响应式考虑**：不同屏幕尺寸调整
6. **特殊效果**：可用于动画和装饰

合理使用word-spacing可以改善英文文本的视觉效果和可读性。