import React, { useState, useRef, useEffect } from 'react';
import { ScenarioLayout } from '../components/layout/ScenarioLayout';
import { ScenarioHeader, ActionPanel, CodeComparison, KeyPoints, NextScenario, PerformanceTips } from '../components/scenario';
import { MemoryMonitor, MemorySnapshot } from '../components/memory';
import { Console } from '../components/console';
import { useScenario } from '../hooks/useScenario';
import { SCENARIOS } from '../core/domain/scenarios.config';
import { SCENARIO_TYPES } from '../core/domain/constants';

export const DomLeakPage = () => {
  const config = SCENARIOS[SCENARIO_TYPES.DOM];
  const [domElements, setDomElements] = useState([]);
  const [detachedElements, setDetachedElements] = useState([]);
  const domRefsRef = useRef([]);
  const timeoutRef = useRef(null);  // 用于清理 setTimeout

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
  } = useScenario(SCENARIO_TYPES.DOM);

  const createDomLeak = () => {
    const elements = [];
    const refs = [];

    for (let i = 0; i < 15; i++) {
      const div = document.createElement('div');
      div.id = `leak-element-${i}`;
      div.className = 'memory-leak-element';
      div.innerHTML = `
        <h3>泄漏元素 ${i + 1}</h3>
        <p>这是一个会导致内存泄漏的DOM元素</p>
        <ul>
          ${Array(20).fill().map((_, j) => `<li>列表项 ${j + 1} - 数据 ${Math.random()}</li>`).join('')}
        </ul>
      `;

      div._leakData = new Array(30000).fill(`DOM数据-${i}-${Date.now()}`);

      const clickHandler = function() {
        console.log(`点击了泄漏元素 ${i}，数据长度:`, div._leakData.length);
      };
      div.addEventListener('click', clickHandler);

      document.body.appendChild(div);

      const elementInfo = {
        id: i,
        element: div,
        clickHandler: clickHandler,
        dataSize: div._leakData.length,
        attached: true
      };

      elements.push(elementInfo);
      refs.push(elementInfo);
    }

    setDomElements(elements.map(e => ({
      id: e.id,
      dataSize: e.dataSize,
      attached: e.attached
    })));

    // 清理之前的 timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const detached = [];
      refs.forEach(ref => {
        if (ref.element && ref.element.parentNode) {
          ref.element.parentNode.removeChild(ref.element);
          ref.attached = false;
          detached.push({
            id: ref.id,
            dataSize: ref.dataSize
          });
        }
      });

      setDetachedElements(detached);
      setDomElements(prev => prev.map(e => ({ ...e, attached: false })));
      timeoutRef.current = null;
    }, 2000);

    domRefsRef.current = refs;
    addLog('❌ 已创建 15 个DOM元素泄漏');
  };

  const fixDomLeak = () => {
    // 清理 timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    domRefsRef.current.forEach(ref => {
      if (ref.element) {
        if (ref.clickHandler) {
          ref.element.removeEventListener('click', ref.clickHandler);
        }

        if (ref.element.parentNode) {
          ref.element.parentNode.removeChild(ref.element);
        }

        ref.element._leakData = null;
        ref.element = null;
        ref.clickHandler = null;
      }
    });

    domRefsRef.current = [];
    setDomElements([]);
    setDetachedElements([]);
    addLog('✅ 已清理所有DOM元素泄漏');
  };

  useEffect(() => {
    return () => {
      // 清理 timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // 清理 DOM 元素
      if (domRefsRef.current.length > 0) {
        domRefsRef.current.forEach(ref => {
          if (ref.element) {
            if (ref.clickHandler) {
              ref.element.removeEventListener('click', ref.clickHandler);
            }
            if (ref.element.parentNode) {
              ref.element.parentNode.removeChild(ref.element);
            }
          }
        });
      }
    };
  }, []);

  const currentLeakStatus = domElements.length > 0 ? 'active' : 'normal';

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
            onCreateLeak={createDomLeak}
            onFixLeak={fixDomLeak}
            onForceGC={forceGarbageCollection}
          />

          <section className="demo-section">
            <h2>🖥️ 演示区域</h2>
            <div className="demo-container">
              <div className="dom-leak-demo">
                <h3>DOM元素状态</h3>
                {domElements.length === 0 ? (
                  <div className="empty-state">
                    <p>🟢 当前没有泄漏的DOM引用</p>
                    <p>点击"创建泄漏"按钮开始演示</p>
                  </div>
                ) : (
                  <div className="dom-demo-active">
                    <div className="dom-stats">
                      <p>🔴 创建的DOM元素: {domElements.length} 个</p>
                      <p>👻 游离的DOM元素: {detachedElements.length} 个</p>
                      <p>📊 总数据量: ~{(domElements.reduce((sum, e) => sum + e.dataSize, 0) / 1024 / 1024 * 20).toFixed(1)} MB</p>
                    </div>

                    {detachedElements.length > 0 && (
                      <div className="detached-warning">
                        <h4>⚠️ 检测到游离DOM元素</h4>
                        <p>这些元素已从页面中移除，但仍被JavaScript引用：</p>
                        <div className="detached-list">
                          {detachedElements.map(element => (
                            <div key={element.id} className="detached-item">
                              <span>元素 #{element.id}</span>
                              <span>{(element.dataSize / 1000).toFixed(0)}K 项数据</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="dom-timeline">
                      <h4>📅 泄漏时间线:</h4>
                      <div className="timeline">
                        <div className="timeline-item completed">
                          <span className="timeline-step">1</span>
                          <span className="timeline-text">创建DOM元素并添加到页面</span>
                        </div>
                        <div className="timeline-item completed">
                          <span className="timeline-step">2</span>
                          <span className="timeline-text">在元素上存储大量数据</span>
                        </div>
                        <div className="timeline-item completed">
                          <span className="timeline-step">3</span>
                          <span className="timeline-text">添加事件监听器</span>
                        </div>
                        <div className={`timeline-item ${detachedElements.length > 0 ? 'completed' : 'pending'}`}>
                          <span className="timeline-step">4</span>
                          <span className="timeline-text">从DOM中移除元素（但保持引用）</span>
                        </div>
                        <div className="timeline-item pending">
                          <span className="timeline-step">5</span>
                          <span className="timeline-text">清理JavaScript引用</span>
                        </div>
                      </div>
                    </div>

                    <div className="leak-analysis">
                      <h4>🔍 DOM泄漏分析:</h4>
                      <ul>
                        <li>元素虽然从页面移除，但JavaScript仍持有引用</li>
                        <li>元素上的数据（_leakData）无法被垃圾回收</li>
                        <li>事件监听器形成额外的引用链</li>
                        <li>这种泄漏在单页应用中很常见</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="demo-info">
                  <h4>🛠️ Memory 面板检测方法:</h4>
                  <ol>
                    <li><strong>搜索 Detached</strong>: 在堆快照中搜索 "Detached"</li>
                    <li><strong>查看 HTMLElement</strong>: 检查HTML元素对象的数量</li>
                    <li><strong>分析 Retainers</strong>: 查看DOM元素被谁引用</li>
                    <li><strong>对比快照</strong>: 比较DOM操作前后的内存变化</li>
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

export default DomLeakPage;
