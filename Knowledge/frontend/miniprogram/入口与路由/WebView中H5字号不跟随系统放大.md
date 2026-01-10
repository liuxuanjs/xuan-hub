---
aliases: ["字号适配", "fontSizeSetting", "系统字号"]
title: "WebView 中 H5 字号不跟随系统放大"
tags: ["微信小程序", "WebView", "适老化", "字号"]
updated: 2026-01-10
---

## 结论

微信小程序 WebView 中的 H5，默认会跟随系统字号设置放大。

**禁用方法**：在 H5 的根字号计算中加入**反向补偿**。

```javascript
// 标准字号：iOS=17, Android=16
var standardFontSize = isIOS ? 17 : 16;
var scale = standardFontSize / fontSizeSetting;  // 反向补偿
document.documentElement.style.fontSize = (screenWidth / 10) * scale + 'px';
```

## 问题现象

用户在微信「设置 → 通用 → 字体大小」调大字号后，WebView 里的 H5 页面整体放大，布局错乱。

| 设置 | H5 表现 |
|------|---------|
| 标准字号 | 正常 |
| 大字号 | 所有文字、rem 布局都放大，可能溢出 |

## 原因分析

### 微信的 fontSizeSetting

微信小程序提供 `fontSizeSetting` 表示用户的字号设置：

```typescript
const systemInfo = Taro.getSystemInfoSync();
const fontSizeSetting = systemInfo.fontSizeSetting;
// iOS: 标准值 17，范围约 15-23
// Android: 标准值 16，范围约 14-22
```

### 微信字号档位体系

根据[小程序适老化设计指南](https://developers.weixin.qq.com/miniprogram/design/elderly.html)：

**iOS**：7 个档位（1 个缩小 + 1 个标准 + 5 个放大），标准字号 **17px**

**Android**：8 个档位（1 个缩小 + 1 个标准 + 6 个放大），标准字号 **16px**

| 平台 | 标准字号 | 缩放倍率计算 |
|------|---------|-------------|
| iOS | 17px | `fontSizeSetting / 17` |
| Android | 16px | `fontSizeSetting / 16` |

### WebView 会继承这个设置

小程序 WebView 里的网页，会自动应用这个字号缩放。如果你的 H5 用了 rem 布局，根字号被放大，整个页面都会放大。

## 解决方案

### 1. 小程序传递 fontSizeSetting

```typescript
// page/web-view/index.tsx
const fontSizeSetting = Taro.getSystemInfoSync().fontSizeSetting;

const url = setObjToUrlParams(`${domain}/page`, {
  fontSizeSetting,  // 传给 H5
  // ...
});
```

### 2. H5 在渲染前计算补偿

**关键**：必须在 CSS 渲染前执行，否则会闪烁。放在 `index.html` 的 `<head>` 里：

```html
<script>
(function() {
  var isIOS = /ipad|iphone|ipod/i.test(navigator.userAgent);
  var isInIframe = window.self !== window.top;
  var screenWidth = document.documentElement.clientWidth || screen.width || 375;

  // 微信标准字号
  var standardFontSize = isIOS ? 17 : 16;

  // 从 URL 获取小程序传来的 fontSizeSetting
  var urlParams = new URLSearchParams(window.location.search);
  var fontSizeSetting = parseFloat(urlParams.get('fontSizeSetting')) || standardFontSize;

  // 计算补偿比例
  var scale = 1.0;
  if (!(isIOS && isInIframe)) {
    // iOS iframe 中不需要补偿（原因见下文）
    scale = standardFontSize / fontSizeSetting;
  }

  // 应用到根字号
  document.documentElement.style.fontSize = (screenWidth / 10) * scale + 'px';
})();
</script>
```

### 3. 公式解释

```
fontSizeSetting = 20（用户调大了）
standardFontSize = 17（iOS 标准值）

scale = 17 / 20 = 0.85

原本根字号 = 37.5px
补偿后根字号 = 37.5 * 0.85 = 31.875px

微信会把 31.875px 放大 20/17 倍 ≈ 37.5px
最终效果：和标准字号一样
```

## iOS iframe 的特殊情况

如果 H5 页面在 iframe 里（比如域名保护方案），iOS 上 iframe 内的页面**不会被系统字号影响**。

```javascript
var isInIframe = window.self !== window.top;

if (!(isIOS && isInIframe)) {
  // iOS iframe 中不需要补偿
  scale = standardFontSize / fontSizeSetting;
}
```

| 环境 | 是否需要补偿 |
|------|-------------|
| iOS 主页面 | 需要 |
| iOS iframe | 不需要 |
| Android 主页面 | 需要 |
| Android iframe | 需要 |

### 为什么 iOS iframe 不需要补偿

iOS WebKit 对 iframe 有特殊处理：

1. **独立的视口**：iOS 中 iframe 有自己独立的视口（viewport），不继承父页面的字号缩放设置
2. **WKWebView 实现差异**：iOS 的 WKWebView 在处理嵌套 iframe 时，字号缩放只作用于顶层文档
3. **Android 不同**：Android 的 WebView 会将字号缩放传递到 iframe 内部

**实测验证**：在 iOS 微信中，父页面设置大字号，iframe 内的文字仍保持标准大小；Android 则父子页面都会放大。

## 第三方组件库的处理

如果用了 antd-mobile 等组件库，它们的 CSS 变量也需要处理：

```javascript
// antd-mobile 的字号变量用 rem，需要覆盖
var rootValue = 75;  // 设计稿 750px
var antdFontSizes = [18, 20, 22, 24, 26, 28, 30, 32, 34, 36];

antdFontSizes.forEach(function(size, index) {
  document.documentElement.style.setProperty(
    '--adm-font-size-' + (index + 1),
    size / rootValue + 'rem'
  );
});
document.documentElement.style.setProperty('--adm-font-size-main', 26 / rootValue + 'rem');
```

## 是否应该禁用字号缩放

这是一个产品决策问题：

| 选择 | 优点 | 缺点 |
|------|------|------|
| 禁用缩放 | 布局稳定，不会错乱 | 老年用户看不清 |
| 保留缩放 | 尊重用户设置，适老化 | 需要适配各种字号，工作量大 |

### 折中方案

可以只让文字跟随缩放，布局保持不变：

```css
/* 布局用 vw，不受字号影响 */
.container {
  padding: 4vw;
  margin-bottom: 2.667vw;
}

/* 文字用 rem，可以跟随缩放 */
.title {
  font-size: 0.427rem;  /* 32px / 75 */
}
```

## 完整代码

### 小程序端

```typescript
// app.ts
useLaunch(() => {
  const systemInfo = Taro.getSystemInfoSync();
  setGlobalData('fontSizeSetting', systemInfo.fontSizeSetting);
});

// page/web-view/index.tsx
const fontSizeSetting = getGlobalData('fontSizeSetting');

const url = setObjToUrlParams(`${domain}/page`, {
  fontSizeSetting,
  // ...
});
```

### H5 端 index.html

```html
<head>
  <!-- 必须在所有 CSS 之前执行 -->
  <script>
  (function() {
    var isIOS = /ipad|iphone|ipod/i.test(navigator.userAgent);
    var isInIframe = window.self !== window.top;
    var screenWidth = document.documentElement.clientWidth || screen.width || 375;
    var standardFontSize = isIOS ? 17 : 16;
    var urlParams = new URLSearchParams(window.location.search);
    var fontSizeSetting = parseFloat(urlParams.get('fontSizeSetting')) || standardFontSize;

    var scale = 1.0;
    if (!(isIOS && isInIframe)) {
      scale = standardFontSize / fontSizeSetting;
    }

    document.documentElement.style.fontSize = (screenWidth / 10) * scale + 'px';
  })();
  </script>

  <!-- 其他 CSS -->
</head>
```

## 调试技巧

### 模拟不同字号

在 Chrome DevTools 控制台：

```javascript
// 模拟大字号
var fontSizeSetting = 22;
var standardFontSize = 17;
var scale = standardFontSize / fontSizeSetting;
document.documentElement.style.fontSize = (375 / 10) * scale + 'px';
```

### 查看当前字号设置

```javascript
// 小程序
console.log(Taro.getSystemInfoSync().fontSizeSetting);

// H5
console.log(new URLSearchParams(location.search).get('fontSizeSetting'));
```

## 参考资料

- [wx.getSystemInfoSync - fontSizeSetting 字段说明](https://developers.weixin.qq.com/miniprogram/dev/api/base/system/wx.getSystemInfoSync.html)
- [web-view 组件官方文档](https://developers.weixin.qq.com/miniprogram/dev/component/web-view.html)
- [小程序适老化设计指南](https://developers.weixin.qq.com/miniprogram/design/elderly.html)
- [关于微信安卓端网页字体适配的通知](https://developers.weixin.qq.com/community/develop/doc/000a26b86948f8743cb9a6da951409?highLine=%25E5%25B0%258F%25E7%25A8%258B%25E5%25BA%258F%25E4%25B8%25AD%25E7%259A%2584webview%25E8%25A6%2581%25E6%2580%258E%25E4%25B9%2588%25E7%25A6%2581%25E6%25AD%25A2%25E5%25AD%2597%25E4%25BD%2593%25E8%25A2%25AB%25E6%2594%25BE%25E5%25A4%25A7)
