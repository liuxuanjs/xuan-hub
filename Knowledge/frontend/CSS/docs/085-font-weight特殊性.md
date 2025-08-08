## 概述
font-weight属性控制字体的粗细程度，它有一些特殊的取值规则和表现形式，理解这些特性对于精确控制文字样式很重要。

## 属性值类型

### 1. 关键字值
```css
.normal { font-weight: normal; }     /* 400 */
.bold { font-weight: bold; }         /* 700 */
.bolder { font-weight: bolder; }     /* 相对父元素更粗 */
.lighter { font-weight: lighter; }   /* 相对父元素更细 */
```

### 2. 数值
```css
.thin { font-weight: 100; }          /* 最细 */
.extra-light { font-weight: 200; }
.light { font-weight: 300; }
.normal { font-weight: 400; }        /* 正常 */
.medium { font-weight: 500; }
.semi-bold { font-weight: 600; }
.bold { font-weight: 700; }          /* 粗体 */
.extra-bold { font-weight: 800; }
.black { font-weight: 900; }         /* 最粗 */
```

## 字体支持的差异

### 系统字体的限制
```css
/* 大多数系统字体只支持两种粗细 */
.system-font {
    font-family: Arial;
    font-weight: 300; /* 可能显示为400 */
    font-weight: 600; /* 可能显示为700 */
}
```

### Web字体的优势
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');

.web-font {
    font-family: 'Inter', sans-serif;
    font-weight: 300; /* 精确显示 */
}
```

## bolder和lighter的特殊性

### 相对值计算规则
```css
.parent {
    font-weight: 400; /* normal */
}

.child-bolder {
    font-weight: bolder; /* 计算为700 */
}

.child-lighter {
    font-weight: lighter; /* 计算为100 */
}
```

### 计算表
| 继承值 | bolder | lighter |
|--------|--------|---------|
| 100    | 400    | 100     |
| 200    | 400    | 100     |
| 300    | 400    | 100     |
| 400    | 700    | 100     |
| 500    | 700    | 100     |
| 600    | 900    | 400     |
| 700    | 900    | 400     |
| 800    | 900    | 700     |
| 900    | 900    | 700     |

## 实际应用场景

### 1. 标题层级
```css
h1 { font-weight: 900; } /* 主标题最粗 */
h2 { font-weight: 700; } /* 次标题 */
h3 { font-weight: 600; } /* 三级标题 */
h4 { font-weight: 500; } /* 四级标题 */
h5 { font-weight: 400; } /* 五级标题 */
h6 { font-weight: 300; } /* 六级标题 */
```

### 2. 文本强调
```css
.emphasis-light { font-weight: 300; color: #666; }
.emphasis-normal { font-weight: 400; }
.emphasis-medium { font-weight: 500; }
.emphasis-strong { font-weight: 700; }
```

### 3. UI组件
```css
.btn {
    font-weight: 500; /* 按钮文字稍粗 */
}

.nav-link {
    font-weight: 400;
}

.nav-link.active {
    font-weight: 600; /* 激活状态更粗 */
}

.badge {
    font-weight: 700; /* 徽章文字突出 */
    font-size: 12px;
}
```

### 4. 表格数据
```css
.table th {
    font-weight: 600; /* 表头稍粗 */
}

.table td {
    font-weight: 400; /* 数据正常 */
}

.table .number {
    font-weight: 500; /* 数字稍粗，便于阅读 */
}
```

## 字体回退策略

### 声明多种粗细
```css
@font-face {
    font-family: 'CustomFont';
    src: url('font-400.woff2') format('woff2');
    font-weight: 400;
}

@font-face {
    font-family: 'CustomFont';
    src: url('font-700.woff2') format('woff2');
    font-weight: 700;
}

.text {
    font-family: 'CustomFont', Arial, sans-serif;
    font-weight: 500; /* 如果没有500，浏览器会合成 */
}
```

### 字体变量
```css
@font-face {
    font-family: 'Variable Font';
    src: url('font-variable.woff2') format('woff2-variations');
    font-weight: 100 900; /* 支持任意粗细 */
}

.variable-text {
    font-family: 'Variable Font';
    font-weight: 350; /* 精确控制 */
}
```

## 响应式字重

### 媒体查询调整
```css
.responsive-weight {
    font-weight: 400;
}

@media (max-width: 768px) {
    .responsive-weight {
        font-weight: 500; /* 移动端稍粗，提高可读性 */
    }
}

@media (min-width: 1200px) {
    .responsive-weight {
        font-weight: 300; /* 大屏幕可以更细 */
    }
}
```

### 根据屏幕密度调整
```css
.density-aware {
    font-weight: 400;
}

@media (-webkit-min-device-pixel-ratio: 2) {
    .density-aware {
        font-weight: 300; /* 高密度屏幕可以更细 */
    }
}
```

## 性能考虑

### 减少字重变体
```css
/* 不推荐：加载过多字重 */
@import url('fonts.css?weights=100,200,300,400,500,600,700,800,900');

/* 推荐：只加载需要的字重 */
@import url('fonts.css?weights=400,600,700');
```

### 字体加载优化
```css
@font-face {
    font-family: 'WebFont';
    src: url('font.woff2') format('woff2');
    font-weight: 400;
    font-display: swap; /* 优化加载体验 */
}
```

## 可读性考虑

### 不同场景的最佳实践
```css
/* 正文：易读性优先 */
.body-text {
    font-weight: 400;
    line-height: 1.6;
}

/* 小字：稍粗增强可读性 */
.small-text {
    font-size: 12px;
    font-weight: 500;
}

/* 反色背景：稍细避免过重 */
.dark-bg {
    background: #333;
    color: white;
    font-weight: 300;
}
```

## 浏览器兼容性

- font-weight基本功能：所有浏览器
- 数值100-900：IE9+
- 字体变量：Chrome 62+, Firefox 62+
- font-display：Chrome 60+, Firefox 58+

## 调试技巧

### 检查实际渲染字重
```css
.debug-weight {
    outline: 1px solid red;
    /* 在开发者工具中查看computed值 */
}
```

### 字重对比
```html
<div class="weight-comparison">
    <p style="font-weight: 100;">100 - Thin</p>
    <p style="font-weight: 300;">300 - Light</p>
    <p style="font-weight: 400;">400 - Normal</p>
    <p style="font-weight: 500;">500 - Medium</p>
    <p style="font-weight: 700;">700 - Bold</p>
    <p style="font-weight: 900;">900 - Black</p>
</div>
```

## 总结

font-weight的关键特性：

1. **数值范围**：100-900，400为normal，700为bold
2. **相对值**：bolder和lighter相对父元素计算
3. **字体依赖**：实际效果取决于字体支持情况
4. **合成字重**：浏览器可能合成不存在的字重
5. **性能影响**：过多字重影响加载速度
6. **可读性重要**：选择合适字重提升阅读体验

合理使用font-weight可以创建清晰的视觉层级和良好的阅读体验。