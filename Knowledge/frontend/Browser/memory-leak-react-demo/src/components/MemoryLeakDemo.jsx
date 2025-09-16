import React, { useEffect } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { useMemoryLeaks } from '../hooks/useMemoryLeaks';
import { MemoryInfo } from './MemoryInfo';
import { ScenarioSection } from './ScenarioSection';
import { ToolsSection } from './ToolsSection';
import { ConsoleSection } from './ConsoleSection';
import { InstructionsSection } from './InstructionsSection';
import './MemoryLeakDemo.css';

export const MemoryLeakDemo = () => {
  const {
    memoryInfo,
    isMonitoring,
    logs,
    isSupported,
    startMonitoring,
    stopMonitoring,
    addLog,
    clearLogs,
    forceGarbageCollection,
    getPerformanceReport,
    updateMemoryInfo
  } = usePerformanceMonitor();

  const {
    eventElements,
    timerCount,
    domElements,
    createGlobalLeak,
    fixGlobalLeak,
    createEventLeak,
    fixEventLeak,
    createTimerLeak,
    fixTimerLeak,
    createClosureLeak,
    fixClosureLeak,
    createDomLeak,
    fixDomLeak,
    analyzeMemory
  } = useMemoryLeaks(addLog);

  // 初始化时添加欢迎日志
  useEffect(() => {
    addLog('内存泄漏演示初始化完成');
    if (!isSupported) {
      addLog('⚠️ 当前浏览器不支持 performance.memory API');
    }
  }, [addLog, isSupported]);

  const scenarios = [
    {
      id: 'global',
      title: '1. 全局变量泄漏',
      description: '意外创建的全局变量不会被垃圾回收',
      createAction: createGlobalLeak,
      fixAction: fixGlobalLeak,
      codeExample: `// 错误示例
function createLeak() {
    accidentalGlobal = new Array(100000).fill('data');
}`
    },
    {
      id: 'event',
      title: '2. 事件监听器泄漏',
      description: '未移除的事件监听器会阻止相关对象被回收',
      createAction: createEventLeak,
      fixAction: fixEventLeak,
      extraContent: eventElements.length > 0 && (
        <div className="event-elements">
          {eventElements.map((element) => (
            <button
              key={element.id}
              className="btn btn-primary event-btn"
              onClick={() => element.handler()}
            >
              {element.text}
            </button>
          ))}
        </div>
      )
    },
    {
      id: 'timer',
      title: '3. 定时器泄漏',
      description: '未清理的定时器会持续运行并持有引用',
      createAction: createTimerLeak,
      fixAction: fixTimerLeak,
      extraContent: (
        <div className="timer-info">
          <span>活跃定时器数量: <span className="timer-count">{timerCount}</span></span>
        </div>
      )
    },
    {
      id: 'closure',
      title: '4. 闭包泄漏',
      description: '闭包意外持有大对象的引用',
      createAction: createClosureLeak,
      fixAction: fixClosureLeak,
      codeExample: `// 错误示例
function createClosure() {
    const largeData = new Array(1000000).fill('data');
    return function() {
        // 即使不使用largeData，闭包也会保持引用
        console.log('Function called');
    };
}`
    },
    {
      id: 'dom',
      title: '5. DOM引用泄漏',
      description: '已移除的DOM元素仍被JavaScript引用',
      createAction: createDomLeak,
      fixAction: fixDomLeak,
      extraContent: domElements.length > 0 && (
        <div className="dom-container">
          {domElements.map((element) => (
            <div key={element.id} className="leak-item">
              {element.text}
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="container">
      <header className="header">
        <h1>🔍 内存泄漏检测演示</h1>
        <p>演示常见的内存泄漏场景及检测方法 - React + Vite版本</p>
      </header>

      <MemoryInfo
        memoryInfo={memoryInfo}
        isMonitoring={isMonitoring}
        isSupported={isSupported}
        onStartMonitoring={startMonitoring}
        onStopMonitoring={stopMonitoring}
      />

      <ScenarioSection scenarios={scenarios} />

      <ToolsSection
        onForceGC={forceGarbageCollection}
        onGetReport={getPerformanceReport}
        onAnalyzeMemory={analyzeMemory}
        onUpdateMemory={updateMemoryInfo}
      />

      <ConsoleSection
        logs={logs}
        onClearLogs={clearLogs}
      />

      <InstructionsSection />
    </div>
  );
};
