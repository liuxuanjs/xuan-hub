# Chrome DevTools Performance 实战演示项目

## 🎯 项目简介

这是一个专门为学习 **Chrome DevTools Performance 面板** 而设计的交互式演示项目。通过 5 个真实的内存泄漏场景，帮助开发者掌握前端性能分析和内存泄漏检测的核心技能。

## 🚀 技术栈

- ⚡ **Vite** - 极速的构建工具
- ⚛️ **React 18** - 现代化UI框架
- 🧭 **React Router 6** - 单页应用路由
- 📦 **pnpm** - 高效的包管理器

## 📚 学习场景

### 🌍 1. 全局变量泄漏 (初级) - `/global-leak`
意外创建的全局变量导致内存无法释放

### 🎯 2. 事件监听器泄漏 (初级) - `/event-leak`
未正确移除的事件监听器阻止对象回收

### ⏰ 3. 定时器泄漏 (中级) - `/timer-leak`
未清理的定时器持续运行和持有引用

### 🔒 4. 闭包泄漏 (高级) - `/closure-leak`
闭包意外持有大对象引用

### 📄 5. DOM引用泄漏 (中级) - `/dom-leak`
已移除DOM元素仍被JavaScript引用

### 📊 6. 内存监控工具 - `/memory-monitor`
完整的内存监控和告警系统

## 快速开始

### 安装和运行

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 重要：使用特殊标志启动 Chrome

```bash
# macOS/Linux
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --enable-precise-memory-info --js-flags="--expose-gc"

# Windows  
chrome.exe --enable-precise-memory-info --js-flags="--expose-gc"
```

## 项目结构

```
src/
├── components/           # 可复用组件
│   ├── Layout.jsx            # 页面布局
│   ├── MemoryInfo.jsx        # 内存信息显示
│   └── ScenarioPage.jsx      # 场景页面模板
├── hooks/                # 自定义Hooks
│   ├── usePerformanceMonitor.js # 性能监控
│   └── useMemoryLeaks.js       # 内存泄漏演示
├── pages/                # 页面组件
│   ├── HomePage.jsx          # 首页
│   ├── GlobalLeakPage.jsx    # 全局变量泄漏
│   ├── EventLeakPage.jsx     # 事件监听器泄漏
│   ├── TimerLeakPage.jsx     # 定时器泄漏
│   ├── ClosureLeakPage.jsx   # 闭包泄漏
│   ├── DomLeakPage.jsx       # DOM引用泄漏
│   └── MemoryMonitorPage.jsx # 内存监控工具
└── App.jsx               # 应用入口
```

## 使用指南

### 基本流程

1. **打开 Chrome DevTools** (F12) → **Performance** 标签页 → 勾选 **Memory** 选项
2. **选择场景** → 从首页选择要学习的内存泄漏类型
3. **开始录制** → 点击 Performance 面板的录制按钮
4. **制造泄漏** → 点击页面上的"创建泄漏"按钮
5. **观察变化** → 查看 Memory 图表中蓝色线条的变化
6. **修复验证** → 点击"修复泄漏"按钮，观察内存是否释放

## 核心功能

- 🔄 **实时内存监控**：自动显示内存使用情况
- 🎯 **5种泄漏场景**：覆盖最常见的内存泄漏问题
- 📊 **可视化分析**：配合 Chrome DevTools 学习
- 🛠️ **一键修复**：演示正确的清理方法

## 常见问题

**Q: 看不到内存数据？**  
A: 确保使用 `--enable-precise-memory-info` 标志启动 Chrome 并勾选 Performance 面板的 Memory 选项

**Q: 修复后内存没有立即释放？**  
A: 这是正常现象，点击"强制GC"按钮或等待几秒钟让垃圾回收器工作

## 学习资源

- [Chrome DevTools Memory 分析](https://developers.google.com/web/tools/chrome-devtools/memory-problems)
- [JavaScript 内存管理](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)
- [React 性能优化](https://react.dev/learn/render-and-commit)

---

享受探索前端性能优化的旅程！ 🚀