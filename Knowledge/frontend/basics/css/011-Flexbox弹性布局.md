## 概述

CSS Flexbox（弹性盒布局模型）是 CSS3 引入的一种强大的布局方式，为盒状模型提供最大的灵活性。它特别适合处理一维布局场景，能够轻松实现元素的对齐、分布和排序。Flexbox 解决了传统布局中许多复杂的问题，是现代 Web 布局的首选方案之一。

## Flexbox 核心概念

### 基本术语

**Flex 容器（Flex Container）：**

- 采用 Flex 布局的元素
- 通过设置 `display: flex` 或 `display: inline-flex` 创建
- 简称"容器"

**Flex 项目（Flex Item）：**

- Flex 容器的所有子元素
- 自动成为容器成员
- 简称"项目"

### 轴线概念

**主轴（Main Axis）：**

- 水平的主要方向轴线
- 默认从左到右
- 可通过 `flex-direction` 改变方向

**交叉轴（Cross Axis）：**

- 垂直于主轴的轴线
- 与主轴垂直
- 方向依赖于主轴方向

**特点：**

- 项目默认沿主轴排列
- 轴线方向决定了对齐和分布的行为

**使用场景：** 理解布局行为的基础

## 容器属性

### flex-direction（主轴方向）

**语法：** `flex-direction: row | row-reverse | column | column-reverse`

**特点：**

- `row`（默认）：主轴水平，从左到右
- `row-reverse`：主轴水平，从右到左
- `column`：主轴垂直，从上到下
- `column-reverse`：主轴垂直，从下到上

**示例：**

```css
.container {
  display: flex;
  flex-direction: column; /* 垂直排列 */
}
```

**使用场景：** 改变布局方向，响应式设计

### flex-wrap（换行控制）

**语法：** `flex-wrap: nowrap | wrap | wrap-reverse`

**特点：**

- `nowrap`（默认）：不换行，项目压缩
- `wrap`：换行，第一行在上方
- `wrap-reverse`：换行，第一行在下方

**示例：**

```css
.container {
  display: flex;
  flex-wrap: wrap; /* 允许换行 */
}
```

**使用场景：** 响应式网格，多行布局

### flex-flow（复合属性）

**语法：** `flex-flow: <flex-direction> <flex-wrap>`

**特点：**

- `flex-direction` 和 `flex-wrap` 的简写
- 默认值：`row nowrap`
- 简化代码书写

**示例：**

```css
.container {
  display: flex;
  flex-flow: column wrap; /* 垂直方向，允许换行 */
}
```

**使用场景：** 同时设置方向和换行

### justify-content（主轴对齐）

**语法：** `justify-content: flex-start | flex-end | center | space-between | space-around | space-evenly`

**特点：**

- `flex-start`（默认）：靠主轴起点对齐
- `flex-end`：靠主轴终点对齐
- `center`：居中对齐
- `space-between`：两端对齐，项目间等间距
- `space-around`：每个项目两侧等间距
- `space-evenly`：所有间距都相等

**示例：**

```css
.container {
  display: flex;
  justify-content: space-between; /* 两端对齐 */
}
```

**使用场景：** 导航栏布局，按钮组分布

### align-items（交叉轴对齐）

**语法：** `align-items: flex-start | flex-end | center | baseline | stretch`

**特点：**

- `stretch`（默认）：拉伸填满容器高度
- `flex-start`：交叉轴起点对齐
- `flex-end`：交叉轴终点对齐
- `center`：交叉轴中点对齐
- `baseline`：项目第一行文字基线对齐

**示例：**

```css
.container {
  display: flex;
  align-items: center; /* 垂直居中 */
  height: 200px;
}
```

**使用场景：** 垂直居中，等高布局

### align-content（多行对齐）

**语法：** `align-content: flex-start | flex-end | center | space-between | space-around | stretch`

**特点：**

- 定义多根轴线的对齐方式
- 只有一根轴线时不起作用
- 需要配合 `flex-wrap: wrap` 使用

**示例：**

```css
.container {
  display: flex;
  flex-wrap: wrap;
  align-content: space-between; /* 多行两端对齐 */
}
```

**使用场景：** 多行网格布局，卡片列表

## 项目属性

### order（排序）

**语法：** `order: <integer>`

**特点：**

- 定义项目的排列顺序
- 数值越小，排列越靠前
- 默认为 0
- 可以为负值

**示例：**

```css
.item1 {
  order: 2;
}
.item2 {
  order: 1;
} /* 会排在item1前面 */
.item3 {
  order: 3;
}
```

**使用场景：** 调整显示顺序，响应式重排

### flex-grow（放大比例）

**语法：** `flex-grow: <number>`

**特点：**

- 定义项目的放大比例
- 默认为 0，即不放大
- 如果所有项目都为 1，则等分剩余空间
- 数值表示占剩余空间的比例

**示例：**

```css
.item1 {
  flex-grow: 1;
} /* 占1份 */
.item2 {
  flex-grow: 2;
} /* 占2份 */
```

**使用场景：** 自适应宽度，比例分配

### flex-shrink（缩小比例）

**语法：** `flex-shrink: <number>`

**特点：**

- 定义项目的缩小比例
- 默认为 1，即空间不足时等比缩小
- 如果为 0，则不缩小
- 负值无效

**示例：**

```css
.item1 {
  flex-shrink: 0;
} /* 不缩小 */
.item2 {
  flex-shrink: 1;
} /* 正常缩小 */
```

**使用场景：** 防止特定元素缩小

### flex-basis（主轴空间）

**语法：** `flex-basis: <length> | auto`

**特点：**

- 定义分配多余空间前项目占据的主轴空间
- 默认值为 `auto`，即项目本来大小
- 可以设置具体的长度值
- 浏览器根据此属性计算是否有多余空间

**示例：**

```css
.item {
  flex-basis: 200px; /* 基础宽度200px */
}
```

**使用场景：** 设置项目基础尺寸

### flex（复合属性）

**语法：** `flex: <flex-grow> <flex-shrink> <flex-basis>`

**特点：**

- `flex-grow`、`flex-shrink` 和 `flex-basis` 的简写
- 默认值为 `0 1 auto`
- 建议优先使用这个属性

**常用值：**

```css
.item {
  flex: 1; /* 等同于 flex: 1 1 0% */
  flex: auto; /* 等同于 flex: 1 1 auto */
  flex: none; /* 等同于 flex: 0 0 auto */
}
```

**使用场景：** 灵活控制项目尺寸行为

### align-self（单独对齐）

**语法：** `align-self: auto | flex-start | flex-end | center | baseline | stretch`

**特点：**

- 允许单个项目有不同的对齐方式
- 可覆盖 `align-items` 属性
- 默认值为 `auto`，表示继承父元素

**示例：**

```css
.container {
  align-items: flex-start;
}

.special-item {
  align-self: center; /* 单独居中对齐 */
}
```

**使用场景：** 特殊项目的个性化对齐

## 实际应用示例

### 导航栏布局

**示例：**

```css
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.nav-left {
  flex: 0 0 auto;
}
.nav-center {
  flex: 1;
  text-align: center;
}
.nav-right {
  flex: 0 0 auto;
}
```

**使用场景：** 网站导航，工具栏

### 卡片布局

**示例：**

```css
.card-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  flex: 1 1 300px; /* 最小宽度300px，可伸缩 */
  min-width: 0; /* 允许收缩 */
}
```

**使用场景：** 产品展示，内容列表

### 垂直居中

**示例：**

```css
.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
```

**使用场景：** 登录框，加载界面

### 表单布局

**示例：**

```css
.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.form-row label {
  flex: 0 0 100px;
}

.form-row input {
  flex: 1;
}
```

**使用场景：** 表单设计，输入组合

## 布局模式对比

### Flexbox vs Grid

**Flexbox 特点：**

- 一维布局（行或列）
- 内容优先（content-first）
- 适合组件内部布局

**Grid 特点：**

- 二维布局（行和列）
- 布局优先（layout-first）
- 适合页面整体布局

### Flexbox vs Float

**Flexbox 优势：**

- 更简洁的语法
- 更强的控制能力
- 原生的垂直居中
- 无需清除浮动

**Float 适用场景：**

- 文字环绕图片
- 老浏览器兼容

## 浏览器兼容性

### 现代浏览器支持

- Chrome 29+
- Firefox 28+
- Safari 9+
- IE 11+（部分支持 IE10）

### 兼容性注意事项

**旧版本前缀：**

```css
.container {
  display: -webkit-flex; /* Safari */
  display: -ms-flexbox; /* IE10 */
  display: flex;
}
```

**IE 兼容问题：**

- IE10-11 有一些实现差异
- 建议使用 autoprefixer 处理
- 测试关键功能的兼容性

## 最佳实践

### 性能优化

- 避免过度嵌套 flex 容器
- 合理使用 `flex` 简写属性
- 注意 `min-width: 0` 的使用

### 响应式设计

```css
.responsive-flex {
  display: flex;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .responsive-flex {
    flex-direction: column;
  }
}
```

### 常见陷阱

- 忘记设置 `min-width: 0` 导致 overflow
- 混淆主轴和交叉轴的概念
- 过度依赖 `flex: 1` 而忽略内容尺寸

## 标签

#CSS #前端面试
