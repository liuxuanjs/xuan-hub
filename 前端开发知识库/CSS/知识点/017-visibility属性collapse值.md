## 概述

visibility 属性的 collapse 值是 CSS 中一个相对少见但功能独特的属性值。它主要针对表格相关元素设计，能够在隐藏元素的同时释放其占用的空间。理解 collapse 值的行为特点和浏览器兼容性差异，对于处理复杂的表格布局和动态显示隐藏需求具有重要意义。

## visibility 属性值对比

### visible（默认值）

**语法：** `visibility: visible`

**特点：**

- 元素正常显示
- 占用页面空间
- 参与页面交互

**使用场景：** 默认状态，元素正常显示

### hidden 值

**语法：** `visibility: hidden`

**特点：**

- 元素不可见
- 仍然占用页面空间
- 不参与页面交互
- 布局不受影响

**与 display: none 的区别：**

- visibility: hidden 保留空间
- display: none 完全移除元素

**使用场景：** 需要隐藏元素但保持布局结构时

## collapse 值详解

### 基本行为

**语法：** `visibility: collapse`

**对于普通元素：**

```css
.normal-element {
  visibility: collapse;
  /* 效果等同于 visibility: hidden */
}
```

**特点：**

- 元素不可见
- 仍占用页面空间
- 行为与 hidden 值相同

**使用场景：** 对于非表格元素，实际应用价值有限

### 表格元素的特殊行为

**针对表格相关元素：**

- `<tr>` (表格行)
- `<tbody>` (表格主体组)
- `<col>` (表格列)
- `<colgroup>` (表格列组)

**语法示例：**

```css
/* 隐藏表格行 */
tr.hidden-row {
  visibility: collapse;
}

/* 隐藏表格列 */
col.hidden-column {
  visibility: collapse;
}
```

**特殊效果：**

- 元素完全消失
- 释放占用的空间
- 行为类似 `display: none`
- 其他行/列自动调整位置

**实际应用：**

```html
<table>
  <tr>
    <td>第一行第一列</td>
    <td>第一行第二列</td>
  </tr>
  <tr class="hidden-row">
    <td>第二行第一列</td>
    <td>第二行第二列</td>
  </tr>
  <tr>
    <td>第三行第一列</td>
    <td>第三行第二列</td>
  </tr>
</table>
```

**使用场景：** 动态显示隐藏表格行列，实现数据筛选效果

## 浏览器兼容性

### Chrome 浏览器

**行为特点：**

- collapse 值与 hidden 值表现相同
- 对表格元素也不释放空间
- 未完全实现 CSS 规范

**实际效果：**

```css
/* 在 Chrome 中这两种写法效果相同 */
tr {
  visibility: collapse; /* 不释放空间 */
  visibility: hidden; /* 不释放空间 */
}
```

### Firefox 浏览器

**行为特点：**

- 完全按照 CSS 规范实现
- 表格行使用 collapse 会消失并释放空间
- 其他行自动上移填补位置

**实际效果：**

```css
tr {
  visibility: collapse; /* 表格行完全消失，释放空间 */
}
```

### Safari 和 IE11

**行为特点：**

- 与 Firefox 类似
- 按照 CSS 规范正确实现
- 表格元素会释放空间

## 实际应用场景

### 动态表格筛选

**JavaScript 配合使用：**

```javascript
// 切换表格行的显示状态
function toggleTableRow(rowElement) {
  if (rowElement.style.visibility === "collapse") {
    rowElement.style.visibility = "visible";
  } else {
    rowElement.style.visibility = "collapse";
  }
}
```

**CSS 样式：**

```css
.filtered-out {
  visibility: collapse;
}

/* 兼容性处理 */
@supports not (visibility: collapse) {
  .filtered-out {
    display: none;
  }
}
```

### 响应式表格设计

**移动端列隐藏：**

```css
@media (max-width: 768px) {
  .desktop-only-column {
    visibility: collapse;
  }
}
```

## 兼容性解决方案

### 特性检测

**JavaScript 检测：**

```javascript
function supportsVisibilityCollapse() {
  const testElement = document.createElement("div");
  testElement.style.visibility = "collapse";
  return testElement.style.visibility === "collapse";
}
```

### 回退方案

**CSS 回退：**

```css
.hide-table-row {
  display: none; /* 回退方案 */
  visibility: collapse; /* 支持的浏览器使用 */
}
```

**JavaScript 增强：**

```javascript
// 根据浏览器支持情况选择方案
if (supportsVisibilityCollapse()) {
  element.style.visibility = "collapse";
} else {
  element.style.display = "none";
}
```

## 性能考虑

### 重排和重绘

**collapse 值的优势：**

- 在支持的浏览器中，表格重排更高效
- 避免整个表格结构的重新计算
- 动画过渡更平滑

**与 display: none 的对比：**

- visibility: collapse 可能触发较少的重排
- 特别是在频繁切换显示状态时

### 使用建议

**推荐场景：**

- 表格数据的动态筛选
- 响应式表格列的显示隐藏
- 需要平滑动画效果的场景

**不推荐场景：**

- 普通元素的显示隐藏（用 hidden 或 display: none）
- 需要严格跨浏览器一致性的场景

## 参考资料

[《CSS 里的 visibility 属性有个鲜为人知的属性值：collapse》](http://www.webhek.com/post/visibility-collapse.html)

## 标签

#CSS #前端面试
