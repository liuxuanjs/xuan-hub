## 概述

margin 重叠（也叫 margin 合并）是指在垂直方向上，相邻块级元素的外边距会合并为单个外边距的现象。理解 margin 重叠机制有助于我们更好地控制页面布局。

## 重叠条件

### 基本条件

**必要条件：**

- 必须是常规文档流中的块级元素
- 处于同一个 BFC 中
- 垂直方向上相邻
- 没有 border、padding、内联内容分隔

**适用方向：** 只在垂直方向发生，水平方向不会重叠

## 重叠场景

### 相邻兄弟元素

**现象：** 上一个元素的 `margin-bottom` 与下一个元素的 `margin-top` 重叠

**特点：**

- 最常见的重叠情况
- 取两个 margin 值中的较大者
- 两个元素处于同一层级

**解决方案：**

- 将其中一个元素创建为 BFC
- 使用 flexbox 或 grid 布局

### 父子元素 margin-top 重叠

**现象：** 父元素的 `margin-top` 与第一个子元素的 `margin-top` 重叠

**特点：**

- 父元素没有上边框或内边距
- 子元素是第一个常规流子元素
- 重叠后 margin 显示在父元素外部

**解决方案：**

- 父元素设置 `border-top` 或 `padding-top`
- 父元素创建 BFC（如 `overflow: hidden`）
- 在父子元素间添加内联元素

### 父子元素 margin-bottom 重叠

**现象：** 父元素的 `margin-bottom` 与最后一个子元素的 `margin-bottom` 重叠

**特点：**

- 父元素高度为 auto
- 父元素没有下边框或内边距
- 子元素是最后一个常规流子元素

**解决方案：**

- 父元素设置 `border-bottom` 或 `padding-bottom`
- 父元素设置固定高度
- 父元素创建 BFC

### 空元素自身重叠

**现象：** 空元素的 `margin-top` 与 `margin-bottom` 重叠

**特点：**

- 元素没有内容、边框、内边距
- 高度为 0 或 auto
- 自身的上下 margin 合并

**解决方案：**

- 设置 `border` 或 `padding`
- 设置 `height` 或 `min-height`
- 添加内联内容（空格无效）

## 避免重叠

### 创建 BFC

**常用方法：**

- `overflow: hidden/auto/scroll`
- `display: flow-root`
- `position: absolute/fixed`
- `display: flex/grid`

**使用场景：** 万能解决方案，适用于各种重叠情况

### 物理分隔

**方法：**

- 使用 `border` 分隔
- 使用 `padding` 分隔
- 添加内联元素

**使用场景：** 简单场景，不改变布局上下文

## 标签

#CSS #前端面试 
