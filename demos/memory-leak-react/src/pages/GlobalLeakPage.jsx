import React, { useState, useRef } from 'react';
import { ScenarioLayout } from '../components/layout/ScenarioLayout';
import { ScenarioHeader, ActionPanel, CodeComparison, KeyPoints, NextScenario, PerformanceTips } from '../components/scenario';
import { MemoryMonitor, MemorySnapshot } from '../components/memory';
import { Console } from '../components/console';
import { useScenario } from '../hooks/useScenario';
import { SCENARIOS } from '../core/domain/scenarios.config';
import { SCENARIO_TYPES } from '../core/domain/constants';

export const GlobalLeakPage = () => {
  const config = SCENARIOS[SCENARIO_TYPES.GLOBAL];
  const [globalVars, setGlobalVars] = useState([]);
  const leakDataRef = useRef([]);

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
  } = useScenario(SCENARIO_TYPES.GLOBAL);

  const createGlobalLeak = () => {
    const leakData = [];

    for (let i = 0; i < 5; i++) {
      const varName = `accidentalGlobal${i}`;
      const largeData = new Array(100000).fill(`全局数据-${i}-${Date.now()}`);

      // 故意创建全局变量（模拟意外情况）
      window[varName] = largeData;

      leakData.push({
        name: varName,
        data: largeData,
        size: largeData.length
      });
    }

    leakDataRef.current = leakData;
    setGlobalVars(leakData.map(item => ({ name: item.name, size: item.size })));
    addLog('❌ 已创建 5 个全局变量泄漏');
  };

  const fixGlobalLeak = () => {
    leakDataRef.current.forEach(item => {
      if (window[item.name]) {
        delete window[item.name];
      }
    });

    leakDataRef.current = [];
    setGlobalVars([]);
    addLog('✅ 已清理所有全局变量泄漏');
  };

  // 根据本地状态判断泄漏状态
  const currentLeakStatus = globalVars.length > 0 ? 'active' : 'normal';

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
            onCreateLeak={createGlobalLeak}
            onFixLeak={fixGlobalLeak}
            onForceGC={forceGarbageCollection}
          />

          {/* 演示区域 */}
          <section className="demo-section">
            <h2>🖥️ 演示区域</h2>
            <div className="demo-container">
              <div className="global-leak-demo">
                <h3>全局变量状态</h3>
                {globalVars.length === 0 ? (
                  <div className="empty-state">
                    <p>🟢 当前没有泄漏的全局变量</p>
                    <p>点击"创建泄漏"按钮开始演示</p>
                  </div>
                ) : (
                  <div className="global-vars-list">
                    <p>🔴 检测到 {globalVars.length} 个全局变量泄漏：</p>
                    {globalVars.map((varInfo, index) => (
                      <div key={index} className="global-var-item">
                        <span className="var-name">window.{varInfo.name}</span>
                        <span className="var-size">({varInfo.size.toLocaleString()} 项)</span>
                      </div>
                    ))}
                    <div className="inspection-tip">
                      💡 在 DevTools Console 中输入以下命令查看：
                      <code>{`Object.keys(window).filter(key => key.startsWith('accidentalGlobal'))`}</code>
                    </div>
                  </div>
                )}

                <div className="demo-info">
                  <h4>📊 如何在 Performance 面板中观察：</h4>
                  <ol>
                    <li>开始录制 Performance</li>
                    <li>点击"创建泄漏"按钮</li>
                    <li>等待几秒钟</li>
                    <li>停止录制</li>
                    <li>观察 Memory 图表中 JS Heap 的增长</li>
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

export default GlobalLeakPage;
