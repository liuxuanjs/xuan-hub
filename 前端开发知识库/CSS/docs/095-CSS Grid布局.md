## 概述
CSS Grid是二维布局系统，可以同时控制行和列，比Flexbox更适合复杂的网格布局。它是现代CSS布局的重要工具。

## 基本概念

### 网格容器和项目
```css
.grid-container {
    display: grid;              /* 创建网格容器 */
    grid-template-columns: 1fr 1fr 1fr;  /* 3列 */
    grid-template-rows: auto auto;       /* 2行 */
    gap: 20px;                          /* 网格间距 */
}

.grid-item {
    /* 网格项目 */
    background: #f0f0f0;
    padding: 20px;
}
```

### 基本术语
- **网格容器**：设置了display: grid的元素
- **网格项目**：网格容器的直接子元素
- **网格线**：分隔网格的线条
- **网格轨道**：两条相邻网格线之间的空间
- **网格单元**：最小的网格单位

## 定义网格

### 列和行
```css
.grid {
    display: grid;
    
    /* 定义列 */
    grid-template-columns: 200px 1fr 100px;     /* 固定-弹性-固定 */
    grid-template-columns: repeat(3, 1fr);      /* 重复3列 */
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* 响应式 */
    
    /* 定义行 */
    grid-template-rows: 100px auto 50px;        /* 固定-自动-固定 */
    grid-template-rows: repeat(3, 100px);       /* 重复3行 */
}
```

### 网格单位
```css
.grid-units {
    display: grid;
    grid-template-columns: 
        1fr         /* 分数单位，占剩余空间比例 */
        200px       /* 像素 */
        20%         /* 百分比 */
        min-content /* 最小内容宽度 */
        max-content /* 最大内容宽度 */
        fit-content(300px); /* 适应内容，最大300px */
}
```

## 项目定位

### 基于线的定位
```css
.item-1 {
    grid-column-start: 1;       /* 开始列线 */
    grid-column-end: 3;         /* 结束列线 */
    grid-row-start: 1;          /* 开始行线 */
    grid-row-end: 2;            /* 结束行线 */
}

/* 简写形式 */
.item-2 {
    grid-column: 1 / 3;         /* 从第1列线到第3列线 */
    grid-row: 2 / 4;            /* 从第2行线到第4行线 */
}

/* 跨越网格 */
.item-3 {
    grid-column: span 2;        /* 跨越2列 */
    grid-row: span 3;           /* 跨越3行 */
}
```

### 基于区域的定位
```css
.grid-areas {
    display: grid;
    grid-template-areas: 
        "header header header"
        "sidebar main aside"
        "footer footer footer";
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: auto 1fr auto;
}

.header { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

## 实际应用场景

### 1. 经典布局
```html
<div class="page-layout">
    <header class="header">页头</header>
    <nav class="nav">导航</nav>
    <main class="main">主内容</main>
    <aside class="aside">侧边栏</aside>
    <footer class="footer">页脚</footer>
</div>
```

```css
.page-layout {
    display: grid;
    grid-template-areas: 
        "header header header"
        "nav main aside"
        "footer footer footer";
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
    gap: 10px;
}

.header { grid-area: header; }
.nav { grid-area: nav; }
.main { grid-area: main; }
.aside { grid-area: aside; }
.footer { grid-area: footer; }
```

### 2. 响应式卡片网格
```css
.card-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
    padding: 24px;
}

.card {
    background: white;
    border-radius: 8px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

### 3. 图片画廊
```css
.gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
}

.gallery-item {
    aspect-ratio: 1;
    overflow: hidden;
    border-radius: 8px;
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
```

### 4. 表单布局
```css
.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px 24px;
}

.form-group {
    display: flex;
    flex-direction: column;
}

.form-group.full-width {
    grid-column: 1 / -1;     /* 占满整行 */
}
```

## 对齐和分布

### 容器对齐
```css
.grid-align {
    display: grid;
    grid-template-columns: repeat(3, 100px);
    
    /* 整个网格在容器中的对齐 */
    justify-content: center;     /* 水平居中 */
    align-content: center;       /* 垂直居中 */
    
    /* 或者简写 */
    place-content: center;       /* 水平垂直居中 */
}
```

### 项目对齐
```css
.grid-items {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    
    /* 所有项目的对齐 */
    justify-items: center;       /* 项目水平居中 */
    align-items: center;         /* 项目垂直居中 */
    
    /* 或者简写 */
    place-items: center;         /* 项目水平垂直居中 */
}

/* 单个项目的对齐 */
.special-item {
    justify-self: end;           /* 该项目右对齐 */
    align-self: start;           /* 该项目顶部对齐 */
}
```

## 高级功能

### 自动定位
```css
.auto-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-auto-rows: 100px;       /* 自动创建的行高度 */
    grid-auto-flow: row;         /* 自动排列方向 */
}
```

### 密集排列
```css
.dense-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-auto-flow: row dense;   /* 密集排列，填补空隙 */
}
```

### 嵌套网格
```css
.outer-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.nested-grid {
    display: grid;               /* 嵌套网格 */
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}
```

## 响应式Grid

### 媒体查询
```css
.responsive-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
}

@media (max-width: 1024px) {
    .responsive-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 768px) {
    .responsive-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
    }
}

@media (max-width: 480px) {
    .responsive-grid {
        grid-template-columns: 1fr;
        gap: 12px;
    }
}
```

### 内置响应式
```css
.auto-responsive {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
}
```

## 实用技巧

### 1. 等高卡片
```css
.equal-height-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    align-items: stretch;        /* 默认值，项目等高 */
}
```

### 2. 圣杯布局
```css
.holy-grail {
    display: grid;
    grid-template-areas: 
        "header header header"
        "nav content aside"
        "footer footer footer";
    grid-template-columns: 200px 1fr 200px;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
}
```

### 3. 瀑布流效果
```css
.masonry {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    grid-auto-rows: 10px;        /* 小行高 */
    gap: 16px;
}

.masonry-item {
    grid-row-end: span var(--row-span); /* CSS变量控制高度 */
}
```

## 浏览器兼容性

### 支持情况
- Chrome 57+
- Firefox 52+
- Safari 10.1+
- IE 10+（旧语法）

### 兼容性处理
```css
/* 降级方案 */
.fallback {
    display: flex;
    flex-wrap: wrap;
}

/* 现代浏览器 */
@supports (display: grid) {
    .fallback {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }
}
```

## 总结

CSS Grid的核心优势：

1. **二维布局**：同时控制行和列
2. **灵活定位**：基于线或区域定位
3. **响应式友好**：内置响应式功能
4. **对齐强大**：丰富的对齐选项
5. **语义清晰**：网格区域命名
6. **嵌套支持**：可以嵌套使用

Grid布局为复杂的网页布局提供了强大而灵活的解决方案。