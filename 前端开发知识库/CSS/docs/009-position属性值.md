## 概述

CSS `position` 属性用于控制元素的定位方式，决定了元素在页面中的位置计算方法和定位上下文。不同的定位值有着不同的定位原点和行为特征，理解各种定位方式的原理对于实现精确的页面布局至关重要。

## 定位类型详解

### static（静态定位）

**语法：** `position: static`

**特点：**

- 默认值，元素的正常定位方式
- 元素出现在正常的文档流中
- 忽略 `top`、`bottom`、`left`、`right`、`z-index` 属性
- 不创建新的层叠上下文
- 不可被作为其他绝对定位元素的定位参考

**定位原点：** 无定位原点概念，遵循文档流

**使用场景：** 默认文档流布局，重置定位属性

### relative（相对定位）

**语法：** `position: relative`

**特点：**

- 相对于元素在正常文档流中的位置进行定位
- 元素仍占据原来的空间，不脱离文档流
- 支持 `top`、`bottom`、`left`、`right` 属性
- 可以创建新的层叠上下文
- 可以作为绝对定位元素的定位参考（包含块）

**定位原点：** 元素在正常文档流中的位置（左上角）

**示例：**

```css
.relative-box {
  position: relative;
  top: 20px; /* 向下偏移20px */
  left: 30px; /* 向右偏移30px */
}
```

**使用场景：** 微调元素位置，为子元素提供定位上下文

### absolute（绝对定位）

**语法：** `position: absolute`

**特点：**

- 完全脱离文档流，不占据空间
- 相对于最近的非 static 定位祖先元素进行定位
- 如果没有定位祖先，则相对于初始包含块（通常是 `<html>` 元素）
- 支持所有方向的偏移属性
- 创建新的层叠上下文

**定位原点：** 最近的非 static 定位祖先元素的 padding box 左上角

**示例：**

```css
.container {
  position: relative; /* 建立定位上下文 */
}

.absolute-box {
  position: absolute;
  top: 0; /* 距离定位父元素顶部0px */
  right: 0; /* 距离定位父元素右边0px */
}
```

**使用场景：** 弹窗、下拉菜单、浮动工具栏、重叠布局

### fixed（固定定位）

**语法：** `position: fixed`

**特点：**

- 相对于浏览器视口（viewport）进行定位
- 完全脱离文档流
- 滚动页面时位置保持不变
- 总是相对于视口定位，不受祖先元素影响
- 创建新的层叠上下文

**定位原点：** 浏览器视口的左上角

**示例：**

```css
.fixed-header {
  position: fixed;
  top: 0; /* 距离视口顶部0px */
  left: 0; /* 距离视口左边0px */
  width: 100%;
  z-index: 1000;
}
```

**兼容性：** IE6 不支持，IE7+ 支持

**使用场景：** 固定导航栏、返回顶部按钮、浮动广告、工具栏

### sticky（粘性定位）

**语法：** `position: sticky`

**特点：**

- 相对定位和固定定位的混合
- 在跨越特定阈值前为相对定位，之后为固定定位
- 必须指定 `top`、`right`、`bottom`、`left` 中至少一个阈值
- 不脱离文档流
- 受最近滚动祖先元素影响

**定位原点：**

- 阈值前：相对于正常文档流位置
- 阈值后：相对于最近的滚动祖先元素

**示例：**

```css
.sticky-nav {
  position: sticky;
  top: 0; /* 滚动到距离顶部0px时变为固定定位 */
}
```

**兼容性：** 现代浏览器支持，IE 不支持

**使用场景：** 粘性导航、表格标题行、侧边栏

### inherit（继承定位）

**语法：** `position: inherit`

**特点：**

- 从父元素继承 `position` 属性值
- 用于明确指定继承行为
- 少见使用场景

**使用场景：** 样式重置、明确继承关系

## 定位上下文与包含块

### 包含块的确定规则

**static 和 relative：**

- 包含块是最近的块级祖先元素的内容区域

**absolute：**

- 包含块是最近的 position 值不为 static 的祖先元素的 padding box
- 如果没有这样的祖先，包含块是初始包含块

**fixed：**

- 包含块是视口（viewport）

**sticky：**

- 包含块是最近的滚动祖先元素

### 定位属性的计算

**百分比值的计算基准：**

- `top` 和 `bottom`：相对于包含块的高度
- `left` 和 `right`：相对于包含块的宽度

**示例：**

```css
.container {
  position: relative;
  width: 400px;
  height: 300px;
}

.child {
  position: absolute;
  top: 50%; /* 相对于300px的50% = 150px */
  left: 25%; /* 相对于400px的25% = 100px */
}
```

## 层叠上下文与 z-index

### 层叠上下文的创建

**创建层叠上下文的条件：**

- `position` 为 `relative`、`absolute`、`fixed`、`sticky` 且 `z-index` 不为 `auto`
- `opacity` 小于 1
- `transform` 不为 `none`
- 其他 CSS3 属性

### z-index 的作用范围

**特点：**

- 只在同一层叠上下文内比较
- 只对定位元素（非 static）有效
- 数值越大，层级越高

**示例：**

```css
.modal {
  position: fixed;
  z-index: 1000;
}

.tooltip {
  position: absolute;
  z-index: 1001;
}
```

## 实际应用示例

### 模态框布局

**示例：**

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
}
```

**使用场景：** 弹窗、对话框

### 固定导航栏

**示例：**

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: #333;
  z-index: 100;
}

.content {
  margin-top: 60px; /* 为固定导航栏留出空间 */
}
```

**使用场景：** 网站导航、工具栏

### 下拉菜单

**示例：**

```css
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  display: none;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.dropdown:hover .dropdown-menu {
  display: block;
}
```

**使用场景：** 菜单系统、选择器

## 常见问题与解决方案

### 绝对定位元素的宽度问题

**问题：** 绝对定位元素默认宽度收缩

**解决方案：**

```css
.absolute-full {
  position: absolute;
  left: 0;
  right: 0; /* 左右都为0，实现全宽 */
}
```

### 固定定位在移动端的问题

**问题：** iOS Safari 中 fixed 定位可能有问题

**解决方案：**

```css
.fixed-mobile {
  position: fixed;
  -webkit-transform: translate3d(0, 0, 0); /* 强制硬件加速 */
}
```

### 粘性定位不生效

**问题：** sticky 定位没有按预期工作

**解决方案：**

```css
.sticky-container {
  overflow: visible; /* 确保父元素没有隐藏溢出 */
}

.sticky-element {
  position: sticky;
  top: 0; /* 必须指定阈值 */
}
```

## 标签

#CSS #前端面试
