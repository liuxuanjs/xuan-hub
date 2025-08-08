
## 概述

CSS `display` 属性用于控制元素的显示类型，决定了元素如何在页面中布局和渲染。

## 详细说明

### block（块级元素）

**特点：**
- 独占一行，自动换行
- 默认宽度为父元素的 100%
- 可以设置 `width`、`height`、`margin`、`padding`
- 默认垂直排列

**常见元素：** `div`、`p`、`h1-h6`、`ul`、`li`、`section` 等

### inline（行内元素）

**特点：**
- 在同一行内显示，不换行
- 宽高由内容决定，无法设置 `width` 和 `height`
- 只能设置左右的 `margin` 和 `padding`
- 默认水平排列

**常见元素：** `span`、`a`、`strong`、`em`、`img` 等

### inline-block（行内块元素）

**特点：**
- 结合了 `inline` 和 `block` 的特点
- 在同一行显示，但可以设置宽高
- 可以设置所有的 `margin` 和 `padding`
- 元素间可能存在空白间隙

**使用场景：** 导航按钮、卡片布局、图片画廊等

### none（隐藏元素）

**特点：**
- 元素完全不显示
- 不占用任何空间
- 从文档流中完全移除

**与 `visibility: hidden` 的区别：**
- `display: none` - 不占用空间
- `visibility: hidden` - 占用空间但不可见

### list-item

- 表现类似块级元素，但会显示列表标记
- 常用于 `<li>` 元素

### table

- 元素表现为块级表格
- 等同于 `<table>` 元素

### inherit

- 继承父元素的 `display` 属性值

## 详细资料
[《CSS display 属性》](http://www.w3school.com.cn/css/pr_class_display.asp)

## 标签
#CSS #前端面试 