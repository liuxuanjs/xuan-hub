# Chrome DevTools Performance 实战演示项目

## 项目简介

这是一个专门为学习 **Chrome DevTools Performance 面板** 而设计的交互式演示项目。通过 5 个真实的内存泄漏场景 + 1 个监控工具，帮助开发者掌握前端性能分析和内存泄漏检测的核心技能。

## 技术栈

- **Vite** - 极速的构建工具
- **React 18** - 现代化 UI 框架
- **React Router 6** - 单页应用路由
- **pnpm** - 高效的包管理器

## 学习场景

| 场景 | 难度 | 路由 | 泄漏规模 | 核心演示 |
|------|------|------|----------|----------|
| 🌍 全局变量泄漏 | 初级 | `/global-leak` | 5 个变量 × 100K 项 | 意外挂载 window 对象 |
| 🎯 事件监听器泄漏 | 初级 | `/event-leak` | 10 个监听器 × 50K 项 | document 上的未清理监听器 |
| ⏰ 定时器泄漏 | 中级 | `/timer-leak` | 5 个定时器 × 100K 项 | setInterval/setTimeout 未清理 |
| 🔒 闭包泄漏 | 高级 | `/closure-leak` | 3 个闭包 × 300K 项 | 闭包持有大对象引用 |
| 📄 DOM引用泄漏 | 中级 | `/dom-leak` | 15 个元素 × 30K 项 | Detached DOM 元素 |
| 📊 内存监控工具 | 工具 | `/memory-monitor` | - | 实时监控 + 快照对比 |

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

这些标志可以获得精确的内存数据和手动垃圾回收功能。

## 学习流程

```
1. 选择场景 → 2. 录制 Performance 基线 → 3. 点击"创建泄漏"
                                              ↓
6. 点击"修复泄漏"验证 ← 5. 拍摄堆快照分析 ← 4. 在 DevTools 观察变化
```

### 详细步骤

1. **打开 Chrome DevTools** (F12) → **Performance** 标签页 → 勾选 **Memory** 选项
2. **选择场景** → 从首页选择要学习的内存泄漏类型
3. **开始录制** → 点击 Performance 面板的录制按钮
4. **制造泄漏** → 点击页面上的"创建泄漏"按钮（可多次点击累积泄漏）
5. **观察变化** → 查看 Memory 图表中 JS Heap 的增长
6. **深度分析** → 切换到 Memory 标签页，拍摄堆快照对比
7. **修复验证** → 点击"修复泄漏"按钮，观察内存是否释放

## 各场景检测方法

### 🌍 全局变量泄漏
```javascript
// Console 中执行
Object.keys(window).filter(key => key.startsWith('accidentalGlobal'))
```

### 🎯 事件监听器泄漏
```javascript
// Console 中执行
getEventListeners(document)
```

### ⏰ 定时器泄漏
- Performance 面板观察 `Timer Fired` 事件
- 注意 CPU 使用率的周期性波动

### 🔒 闭包泄漏
- Memory 面板搜索 `Closure`
- 查看 Retainers 追踪引用链

### 📄 DOM引用泄漏
- Memory 面板搜索 `Detached`
- 检查 `HTMLElement` 类型对象数量

## 项目结构

```
src/
├── core/                     # 核心领域
│   └── domain/
│       ├── constants.js          # 常量定义（场景类型、难度等级等）
│       └── scenarios.config.js   # 场景配置（代码示例、知识点、提示）
├── components/               # UI 组件
│   ├── layout/
│   │   └── ScenarioLayout.jsx    # 三栏布局（头部、主内容、侧边栏）
│   ├── scenario/
│   │   ├── ActionPanel.jsx       # 操作面板（创建/修复泄漏按钮）
│   │   ├── CodeComparison.jsx    # 问题代码 vs 解决方案对比
│   │   ├── KeyPoints.jsx         # 关键知识点列表
│   │   ├── NextScenario.jsx      # 下一场景导航
│   │   ├── PerformanceTips.jsx   # DevTools 操作提示
│   │   └── ScenarioHeader.jsx    # 场景标题和难度显示
│   ├── memory/
│   │   ├── MemoryMonitor.jsx     # 实时内存监控图表
│   │   └── MemorySnapshot.jsx    # 内存快照对比功能
│   └── console/
│       └── Console.jsx           # 日志控制台
├── hooks/                    # 自定义 Hooks
│   ├── useScenario.js            # 场景通用逻辑（整合监控和泄漏管理）
│   ├── usePerformanceMonitor.js  # 性能监控（内存采集、日志、GC）
│   ├── useMemoryLeaks.js         # 内存泄漏创建/修复
│   └── useMemorySnapshot.js      # 快照管理
├── pages/                    # 页面组件
│   ├── HomePage.jsx              # 首页（使用指南 + 场景概览）
│   ├── GlobalLeakPage.jsx        # 全局变量泄漏
│   ├── EventLeakPage.jsx         # 事件监听器泄漏
│   ├── TimerLeakPage.jsx         # 定时器泄漏
│   ├── ClosureLeakPage.jsx       # 闭包泄漏
│   ├── DomLeakPage.jsx           # DOM引用泄漏
│   └── MemoryMonitorPage.jsx     # 内存监控工具
├── utils/                    # 工具函数
│   └── memoryUtils.js            # 内存格式化等工具
├── App.jsx                   # 应用入口和路由配置
└── index.css                 # 全局样式（暗色主题设计系统）
```

## 核心功能

- **实时内存监控** - 基于 `performance.memory` API 的实时数据采集
- **5 种泄漏场景** - 覆盖最常见的内存泄漏问题
- **代码对比展示** - 问题代码 vs 解决方案并排显示
- **累积泄漏演示** - 支持多次创建泄漏，便于观察明显的内存增长
- **一键修复** - 演示正确的清理方法
- **快照对比** - 创建前后内存快照对比分析
- **强制 GC** - 手动触发垃圾回收验证清理效果

## 常见问题

**Q: 看不到内存数据？**
A: 确保使用 `--enable-precise-memory-info` 标志启动 Chrome，并勾选 Performance 面板的 Memory 选项。

**Q: 修复后内存没有立即释放？**
A: 这是正常现象，点击"强制 GC"按钮或等待几秒钟让垃圾回收器工作。

**Q: 为什么可以多次点击"创建泄漏"？**
A: 这是有意设计，允许累积创建泄漏（如 10→20→30 个事件监听器），便于在 DevTools 中观察更明显的内存增长趋势。

## 学习资源

- [Chrome DevTools Memory 分析](https://developers.google.com/web/tools/chrome-devtools/memory-problems)
- [JavaScript 内存管理](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)
- [React 性能优化](https://react.dev/learn/render-and-commit)
