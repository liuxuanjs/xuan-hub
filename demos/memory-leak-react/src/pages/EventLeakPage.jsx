import React, { useState, useRef, useEffect } from 'react';
import { ScenarioLayout } from '../components/layout/ScenarioLayout';
import { ScenarioHeader, ActionPanel, CodeComparison, KeyPoints, NextScenario, PerformanceTips } from '../components/scenario';
import { MemoryMonitor, MemorySnapshot } from '../components/memory';
import { Console } from '../components/console';
import { useScenario } from '../hooks/useScenario';
import { SCENARIOS } from '../core/domain/scenarios.config';
import { SCENARIO_TYPES } from '../core/domain/constants';

export const EventLeakPage = () => {
  const config = SCENARIOS[SCENARIO_TYPES.EVENT];
  const [eventElements, setEventElements] = useState([]);
  const [clickCount, setClickCount] = useState(0);
  const eventHandlersRef = useRef([]);

  const {
    memoryInfo,
    isMonitoring,
    isSupported,
    logs,
    startMonitoring,
    stopMonitoring,
    addLog,
    clearLogs,
    forceGarbageCollection
  } = useScenario(SCENARIO_TYPES.EVENT);

  const createEventLeak = () => {
    const elements = [];
    const handlers = [];

    for (let i = 0; i < 10; i++) {
      const largeData = new Array(50000).fill(`事件数据-${i}`);

      const eventHandler = function(event) {
        console.log(`按钮 ${i} 被点击，数据长度:`, largeData.length);
        setClickCount(prev => prev + 1);
      };

      const element = {
        id: `leak-btn-${i}`,
        text: `泄漏按钮 ${i + 1}`,
        data: largeData,
        handler: eventHandler
      };

      document.addEventListener('click', eventHandler);

      elements.push(element);
      handlers.push({ handler: eventHandler, element });
    }

    eventHandlersRef.current = handlers;
    setEventElements(elements);
    addLog('❌ 已创建 10 个事件监听器泄漏');
  };

  const fixEventLeak = () => {
    eventHandlersRef.current.forEach(({ handler }) => {
      document.removeEventListener('click', handler);
    });

    eventHandlersRef.current.forEach(({ element }) => {
      element.data = null;
    });

    eventHandlersRef.current = [];
    setEventElements([]);
    setClickCount(0);
    addLog('✅ 已清理所有事件监听器泄漏');
  };

  useEffect(() => {
    return () => {
      if (eventHandlersRef.current.length > 0) {
        eventHandlersRef.current.forEach(({ handler }) => {
          document.removeEventListener('click', handler);
        });
      }
    };
  }, []);

  const currentLeakStatus = eventElements.length > 0 ? 'active' : 'normal';

  return (
    <ScenarioLayout
      header={
        <ScenarioHeader
          title={config.title}
          icon={config.icon}
          description={config.description}
          difficulty={config.difficulty}
        />
      }
      mainContent={
        <>
          <ActionPanel
            leakStatus={currentLeakStatus}
            onCreateLeak={createEventLeak}
            onFixLeak={fixEventLeak}
            onForceGC={forceGarbageCollection}
          />

          <section className="demo-section">
            <h2>🖥️ 演示区域</h2>
            <div className="demo-container">
              <div className="event-leak-demo">
                <h3>事件监听器状态</h3>
                {eventElements.length === 0 ? (
                  <div className="empty-state">
                    <p>🟢 当前没有泄漏的事件监听器</p>
                    <p>点击"创建泄漏"按钮开始演示</p>
                  </div>
                ) : (
                  <div className="event-demo-active">
                    <p>🔴 已创建 {eventElements.length} 个带有内存泄漏的事件监听器</p>
                    <p>点击计数: {clickCount}</p>

                    <div className="event-buttons">
                      {eventElements.slice(0, 5).map((element) => (
                        <button
                          key={element.id}
                          className="demo-button"
                          onClick={() => element.handler({ target: { id: element.id } })}
                        >
                          {element.text}
                        </button>
                      ))}
                    </div>

                    <div className="leak-info">
                      <h4>🔍 泄漏分析：</h4>
                      <ul>
                        <li>每个按钮的事件处理器都持有 50,000 项数据的引用</li>
                        <li>即使按钮被移除，document 上的监听器仍然存在</li>
                        <li>闭包导致大量数据无法被垃圾回收</li>
                        <li>总计约 {(eventElements.length * 50000 * 20 / 1024 / 1024).toFixed(1)} MB 的泄漏数据</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="demo-info">
                  <h4>🛠️ DevTools 检测方法：</h4>
                  <ol>
                    <li><strong>Console 检查</strong>: <code>getEventListeners(document)</code></li>
                    <li><strong>Performance 面板</strong>: 观察 Listeners 计数增长</li>
                    <li><strong>Memory 面板</strong>: 搜索 'EventListener' 和 'Closure'</li>
                    <li><strong>Elements 面板</strong>: 选中元素查看 Event Listeners</li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          <CodeComparison
            problemCode={config.codeExample.problem}
            solutionCode={config.codeExample.solution}
          />

          <KeyPoints points={config.keyPoints} />
        </>
      }
      sidebarContent={
        <>
          <MemoryMonitor
            memoryInfo={memoryInfo}
            isMonitoring={isMonitoring}
            isSupported={isSupported}
            onStart={startMonitoring}
            onStop={stopMonitoring}
            onForceGC={forceGarbageCollection}
          />

          <MemorySnapshot />

          <Console logs={logs} onClear={clearLogs} />

          <PerformanceTips tips={config.performanceTips} />

          <NextScenario nextScenario={config.nextScenario} />
        </>
      }
    />
  );
};

export default EventLeakPage;
