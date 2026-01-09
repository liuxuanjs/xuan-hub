## 概述
letter-spacing属性控制字符之间的间距，对文本的可读性和视觉效果有重要影响。合理使用可以提升文本的美观度和可读性。

## 基本用法

### 数值设置
```css
.normal { letter-spacing: normal; }    /* 默认值 */
.tight { letter-spacing: -0.5px; }     /* 紧密 */
.loose { letter-spacing: 1px; }        /* 宽松 */
.very-loose { letter-spacing: 0.1em; } /* 相对单位 */
```

### 单位选择
```css
.px-spacing { letter-spacing: 2px; }     /* 像素，精确控制 */
.em-spacing { letter-spacing: 0.1em; }   /* 相对字体大小 */
.rem-spacing { letter-spacing: 0.05rem; } /* 相对根字体 */
```

## 应用场景

### 1. 标题设计
```css
h1 {
    font-size: 48px;
    letter-spacing: -1px; /* 大标题稍微紧密 */
    font-weight: 700;
}

.subtitle {
    font-size: 18px;
    letter-spacing: 0.5px; /* 副标题稍微宽松 */
    color: #666;
}
```

### 2. 按钮文字
```css
.btn {
    letter-spacing: 0.5px; /* 按钮文字更清晰 */
    text-transform: uppercase;
    font-weight: 600;
}

.btn-small {
    font-size: 12px;
    letter-spacing: 1px; /* 小字体需要更大间距 */
}
```

### 3. 导航菜单
```css
.nav-link {
    letter-spacing: 0.3px;
    text-transform: uppercase;
    font-size: 14px;
}

.nav-link:hover {
    letter-spacing: 0.8px; /* 悬停时间距增加 */
    transition: letter-spacing 0.2s ease;
}
```

### 4. 品牌标识
```css
.logo {
    font-size: 24px;
    font-weight: 300;
    letter-spacing: 2px; /* 品牌名间距较大 */
    text-transform: uppercase;
}

.tagline {
    font-size: 12px;
    letter-spacing: 3px; /* 标语间距很大 */
    text-transform: uppercase;
    color: #999;
}
```

## 不同字体的优化

### 系统字体
```css
.system-font {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    letter-spacing: 0; /* 系统字体通常不需要调整 */
}
```

### 等宽字体
```css
.monospace {
    font-family: 'Monaco', 'Menlo', monospace;
    letter-spacing: -0.2px; /* 等宽字体稍微紧密 */
}
```

### 装饰字体
```css
.decorative {
    font-family: 'Georgia', serif;
    letter-spacing: 1px; /* 装饰字体增加间距 */
}
```

## 响应式间距

### 媒体查询调整
```css
.responsive-spacing {
    letter-spacing: 0.5px;
}

@media (max-width: 768px) {
    .responsive-spacing {
        letter-spacing: 0.2px; /* 移动端减少间距 */
    }
}

@media (min-width: 1200px) {
    .responsive-spacing {
        letter-spacing: 1px; /* 大屏幕增加间距 */
    }
}
```

### 根据字体大小调整
```css
.adaptive-spacing {
    font-size: 16px;
    letter-spacing: 0.03em; /* 使用em单位自适应 */
}
```

## 与其他属性的配合

### 配合text-transform
```css
.uppercase-spaced {
    text-transform: uppercase;
    letter-spacing: 1.5px; /* 大写字母需要更大间距 */
}

.lowercase-normal {
    text-transform: lowercase;
    letter-spacing: 0.2px; /* 小写字母间距适中 */
}
```

### 配合font-weight
```css
.thin-spaced {
    font-weight: 300;
    letter-spacing: 0.8px; /* 细字体需要更大间距 */
}

.bold-tight {
    font-weight: 700;
    letter-spacing: -0.3px; /* 粗字体可以更紧密 */
}
```

### 配合color对比
```css
.low-contrast {
    color: #888;
    background: #f5f5f5;
    letter-spacing: 0.5px; /* 低对比度需要更大间距 */
}
```

## 可读性考虑

### 正文阅读
```css
.body-text {
    font-size: 16px;
    line-height: 1.6;
    letter-spacing: 0.2px; /* 轻微增加可读性 */
}

.small-text {
    font-size: 12px;
    letter-spacing: 0.5px; /* 小字体需要更大间距 */
}
```

### 长文阅读
```css
.article-content {
    font-size: 18px;
    line-height: 1.8;
    letter-spacing: 0.3px;
    max-width: 65ch; /* 限制行长度 */
}
```

## 动画效果

### 悬停动画
```css
.animated-spacing {
    letter-spacing: 0.5px;
    transition: letter-spacing 0.3s ease;
}

.animated-spacing:hover {
    letter-spacing: 2px;
}
```

### 加载动画
```css
@keyframes letter-wave {
    0%, 100% { letter-spacing: 0.5px; }
    50% { letter-spacing: 2px; }
}

.loading-text {
    animation: letter-wave 2s ease-in-out infinite;
}
```

## 特殊效果

### 打字机效果
```css
.typewriter {
    letter-spacing: 0.1em;
    white-space: nowrap;
    overflow: hidden;
    border-right: 2px solid;
    animation: typing 3s steps(20, end), blink 0.5s step-end infinite alternate;
}

@keyframes typing {
    from { width: 0; }
    to { width: 100%; }
}
```

### 展开效果
```css
.expand-text {
    letter-spacing: -0.5em;
    opacity: 0;
    animation: expand-letters 1s ease-out forwards;
}

@keyframes expand-letters {
    to {
        letter-spacing: 0.1em;
        opacity: 1;
    }
}
```

## 注意事项

### 不要过度使用
```css
/* 过度：影响可读性 */
.excessive {
    letter-spacing: 5px; /* 太大 */
}

/* 合适：适度增强 */
.appropriate {
    letter-spacing: 1px;
}
```

### 考虑文本长度
```css
/* 短文本可以用较大间距 */
.short-text {
    letter-spacing: 2px;
}

/* 长文本应该保持适中 */
.long-text {
    letter-spacing: 0.2px;
}
```

## 浏览器兼容性

- letter-spacing基本功能：所有浏览器
- 负值：IE6+
- em/rem单位：IE9+
- 动画：现代浏览器

## 调试技巧

### 可视化间距
```css
.debug-spacing {
    background: linear-gradient(to right, red 1px, transparent 1px);
    background-size: 1em 100%;
}
```

## 总结

letter-spacing的关键要点：

1. **影响字符间距**：控制字符之间的空白
2. **单位很重要**：px精确，em相对
3. **配合其他属性**：text-transform、font-weight等
4. **响应式调整**：不同屏幕尺寸优化
5. **可读性优先**：不要过度使用
6. **特殊效果**：动画、装饰等应用

合理使用letter-spacing可以显著提升文本的视觉效果和可读性。