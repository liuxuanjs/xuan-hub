---
aliases: ["Chrome性能分析", "DevTools Performance"]
title: "Chrome DevTools Performance 面板"
tags: ["DevTools", "性能分析", "内存泄漏"]
updated: 2025-01-09
---

## 概览

**用途**：定位前端卡顿和内存泄漏问题

**核心流程**：录制 → 分析 Overview → 查看 Main 线程 → Bottom-Up 找热点 → Memory 快照对比

**关键信号**：
- JS Heap 持续上升 → 内存泄漏
- FPS 出现红色 → 页面卡顿
- 任务 > 50ms → 长任务阻塞

## 性能指标速查

| 指标 | 含义 | 优秀标准 |
|------|------|----------|
| **LCP** | 最大内容绘制完成时间 | < 2.5s |
| **FID** | 首次交互响应延迟 | < 100ms |
| **CLS** | 页面布局抖动程度 | < 0.1 |
| **FCP** | 首次内容出现时间 | < 1.8s |
| **TTI** | 页面可交互时间 | < 3.8s |
| **TBT** | 主线程阻塞总时长 | < 200ms |

## 使用步骤

### 1. 环境准备

```bash
# 启动 Chrome 时开启精确内存（可选但推荐）
chrome --enable-precise-memory-info --js-flags="--expose-gc"
```

### 2. 录制配置

打开 DevTools → Performance 面板，勾选：
- ✅ Screenshots（页面截图）
- ✅ Memory（内存监控）

### 3. 录制分析

1. 点击录制按钮
2. 操作页面（触发要分析的场景）
3. 停止录制，查看结果

## 分析面板详解

### Overview 区域（顶部图表）

| 图表 | 颜色含义 |
|------|----------|
| **FPS** | 🟢 60fps流畅 / 🟡 30-60fps轻微卡顿 / 🔴 <30fps明显卡顿 |
| **CPU** | 蓝色=JS执行 / 紫色=渲染 / 绿色=绘制 / 白色=空闲 |
| **Memory** | 蓝线=JS堆 / 绿线=DOM数量 / 紫线=节点数 / 黄线=监听器数 |

### 详情面板（底部四个视图）

| 视图 | 用途 | 使用场景 |
|------|------|----------|
| **Summary** | 时间分配概览 | 快速了解时间花在哪里 |
| **Bottom-Up** | 按耗时排序的函数列表 | 找出最耗时的函数 |
| **Call Tree** | 函数调用层级关系 | 追踪问题的调用路径 |
| **Event Log** | 按时间顺序的事件列表 | 查看事件发生时序 |

## 常见问题排查

| 症状 | 原因 | 解决方案 |
|------|------|----------|
| Memory 图表持续上升 | 内存泄漏 | 检查全局变量、事件监听器、定时器是否清理 |
| FPS 出现红色区域 | 长任务阻塞 | 拆分任务，使用 `requestIdleCallback` |
| Listeners 数量增长 | 事件监听器泄漏 | 组件卸载时移除监听器 |
| DOM Nodes 持续增加 | DOM 引用泄漏 | 及时移除不需要的 DOM 元素 |

## React 内存管理示例

```javascript
// ✅ 正确：组件卸载时清理
useEffect(() => {
  const timer = setInterval(callback, 1000);
  const controller = new AbortController();

  document.addEventListener('click', handler, {
    signal: controller.signal  // 自动移除
  });

  return () => {
    clearInterval(timer);
    controller.abort();
  };
}, []);
```

## 快速诊断流程

```
1. Overview 看整体 → FPS 掉帧的时间段
2. Memory 曲线 → 是否持续上升（内存泄漏）
3. Main 线程 → 找 >50ms 的红三角（长任务）
4. Bottom-Up → 按 Self Time 排序找热点函数
5. Memory 标签页 → 拍快照对比定位泄漏对象
```

## 相关文档

- [[前端缓存]]
- [[JavaScript事件循环深度解析：Event Loop全攻略]]
- [Chrome DevTools 官方文档](https://developers.google.com/web/tools/chrome-devtools/evaluate-performance)
