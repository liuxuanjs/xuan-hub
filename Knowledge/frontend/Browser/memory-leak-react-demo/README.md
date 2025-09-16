# 内存泄漏检测演示项目 (React + Vite)

## 项目简介

这是一个使用React和Vite构建的现代化内存泄漏检测演示项目。通过交互式界面和实际代码示例，帮助开发者理解常见的前端内存泄漏场景以及如何使用浏览器开发者工具进行检测和分析。

## 技术栈

- ⚡ **Vite** - 快速的构建工具
- ⚛️ **React 19** - 现代化的UI框架
- 🎣 **React Hooks** - 状态管理和副作用处理
- 📦 **pnpm** - 高效的包管理器
- 🎨 **CSS3** - 现代化样式设计

## 功能特性

### 🎯 内存泄漏场景演示

1. **全局变量泄漏** - 演示意外创建的全局变量如何导致内存无法释放
2. **事件监听器泄漏** - 展示未正确移除的事件监听器造成的内存泄漏
3. **定时器泄漏** - 模拟未清理的定时器持续持有内存引用
4. **闭包泄漏** - 演示闭包意外持有大对象引用的问题
5. **DOM引用泄漏** - 展示已移除DOM元素仍被JavaScript引用的情况

### 📊 实时内存监控

- 实时显示JavaScript堆内存使用情况
- 支持开始/停止内存监控
- 可视化内存使用趋势
- 性能指标监控 (LCP, CLS, Long Tasks等)

### 🛠️ 检测工具集成

- 强制垃圾回收功能
- 堆快照获取指导
- 内存使用分析报告
- 性能监控工具使用说明

## 快速开始

### 环境要求

- Node.js >= 16
- pnpm >= 8 (推荐)

### 安装和运行

```bash
# 克隆项目
git clone <repository-url>
cd memory-leak-react-demo

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### 获得最佳体验

为了获得更精确的内存监控数据，建议使用以下标志启动Chrome：

```bash
# macOS
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --enable-precise-memory-info --js-flags="--expose-gc"

# Windows
chrome.exe --enable-precise-memory-info --js-flags="--expose-gc"

# Linux
google-chrome --enable-precise-memory-info --js-flags="--expose-gc"
```

## 项目结构

```
src/
├── components/           # React组件
│   ├── MemoryLeakDemo.jsx      # 主演示组件
│   ├── MemoryInfo.jsx          # 内存信息显示组件
│   ├── ScenarioSection.jsx     # 场景演示区域
│   ├── ToolsSection.jsx        # 工具区域
│   ├── ConsoleSection.jsx      # 日志控制台
│   ├── InstructionsSection.jsx # 使用说明
│   └── MemoryLeakDemo.css      # 样式文件
├── hooks/                # 自定义Hooks
│   ├── usePerformanceMonitor.js # 性能监控Hook
│   └── useMemoryLeaks.js       # 内存泄漏演示Hook
├── utils/                # 工具函数 (预留)
├── App.jsx              # 应用根组件
├── App.css              # 应用样式
├── main.jsx             # 应用入口
└── index.css            # 全局样式
```

## 使用指南

### 基础操作流程

1. **开始监控**
   - 点击"开始内存监控"按钮
   - 观察实时内存使用情况

2. **创建内存泄漏**
   - 依次点击各种"创建XXX泄漏"按钮
   - 观察内存使用量的变化

3. **分析内存**
   - 点击"分析内存使用"查看当前泄漏情况
   - 观察控制台输出的详细信息

4. **清理泄漏**
   - 点击对应的"修复XXX泄漏"按钮
   - 观察内存使用量是否下降

### Chrome DevTools 使用方法

#### Performance 标签页

1. 打开 Chrome DevTools (F12)
2. 切换到 "Performance" 标签页
3. 勾选 "Memory" 选项
4. 点击录制按钮开始记录
5. 在页面上进行操作（创建/清理内存泄漏）
6. 停止录制，查看内存使用趋势图

#### Memory 标签页

1. 切换到 "Memory" 标签页
2. 选择 "Heap snapshot" 选项
3. 点击 "Take snapshot" 按钮获取当前内存快照
4. 重复操作后再次获取快照
5. 对比两个快照，分析内存增长情况

## React Hook 架构

### usePerformanceMonitor

负责性能监控功能：

```javascript
const {
  memoryInfo,           // 内存使用信息
  isMonitoring,         // 监控状态
  logs,                 // 日志数组
  startMonitoring,      // 开始监控
  stopMonitoring,       // 停止监控
  addLog,               // 添加日志
  clearLogs,            // 清空日志
  forceGarbageCollection, // 强制GC
  getPerformanceReport  // 生成报告
} = usePerformanceMonitor();
```

### useMemoryLeaks

负责内存泄漏演示：

```javascript
const {
  eventElements,        // 事件元素状态
  timerCount,           // 定时器数量
  domElements,          // DOM元素状态
  createGlobalLeak,     // 创建全局变量泄漏
  fixGlobalLeak,        // 修复全局变量泄漏
  // ... 其他泄漏场景方法
  analyzeMemory         // 分析内存使用
} = useMemoryLeaks(addLog);
```

## 与原版本对比

### React版本优势

1. **组件化架构** - 代码更模块化，易于维护
2. **状态管理** - 使用React Hooks进行状态管理
3. **响应式更新** - 自动处理UI更新
4. **开发体验** - Vite提供快速热重载
5. **类型安全** - 可轻松集成TypeScript
6. **现代化** - 使用最新的前端技术栈

### 功能增强

- 更好的状态管理和数据流
- 自动内存清理（通过useEffect的cleanup）
- 更优雅的事件处理
- 组件级别的性能监控
- 更好的代码复用性

## 开发和贡献

### 开发脚本

```bash
# 开发模式（热重载）
pnpm dev

# 类型检查（如果使用TypeScript）
pnpm type-check

# 代码检查
pnpm lint

# 构建生产版本
pnpm build

# 预览构建结果
pnpm preview
```

### 项目扩展

1. **添加新的泄漏场景**
   - 在`useMemoryLeaks.js`中添加新的泄漏函数
   - 在`ScenarioSection.jsx`中添加对应的UI

2. **增强性能监控**
   - 在`usePerformanceMonitor.js`中添加新的监控指标
   - 创建新的可视化组件

3. **集成分析工具**
   - 添加第三方性能分析SDK
   - 实现数据上报功能

## 常见问题

### Q: 为什么看不到精确的内存信息？
A: 需要使用特定标志启动Chrome：`--enable-precise-memory-info`

### Q: React版本有什么特殊的内存管理注意事项？
A: 
- 使用useEffect的cleanup函数清理副作用
- 避免在useEffect中创建闭包陷阱
- 合理使用useMemo和useCallback避免不必要的重渲染

### Q: 如何扩展项目功能？
A: 项目采用组件化架构，可以轻松添加新组件和Hook

### Q: 能否集成到现有项目中？
A: 可以，只需要复制相关的Hook和组件即可

## 扩展阅读

- [React Hooks 最佳实践](https://react.dev/reference/react)
- [Vite 配置指南](https://vitejs.dev/guide/)
- [Chrome DevTools Memory分析](https://developers.google.com/web/tools/chrome-devtools/memory-problems)
- [JavaScript内存管理](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Memory_Management)

## 许可证

MIT License

---

享受探索前端性能优化的旅程！ 🚀