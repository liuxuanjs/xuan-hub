import React, { useState, useRef } from 'react';
import { ScenarioLayout } from '../components/layout/ScenarioLayout';
import { ScenarioHeader, ActionPanel, CodeComparison, KeyPoints, NextScenario, PerformanceTips } from '../components/scenario';
import { MemoryMonitor, MemorySnapshot } from '../components/memory';
import { Console } from '../components/console';
import { useScenario } from '../hooks/useScenario';
import { SCENARIOS } from '../core/domain/scenarios.config';
import { SCENARIO_TYPES } from '../core/domain/constants';

export const ClosureLeakPage = () => {
  const config = SCENARIOS[SCENARIO_TYPES.CLOSURE];
  const [closureFunctions, setClosureFunctions] = useState([]);
  const closureRefsRef = useRef([]);

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
  } = useScenario(SCENARIO_TYPES.CLOSURE);

  const createClosureLeak = () => {
    const functions = [];

    for (let i = 0; i < 3; i++) {
      const veryLargeData = new Array(200000).fill(`大数据-${i}-${Math.random()}`);
      const someOtherData = new Array(100000).fill(`其他数据-${i}`);
      const metadata = { id: i, created: Date.now(), size: veryLargeData.length };

      const leakyFunction = function(action) {
        if (action === 'getMetadata') {
          return metadata;
        } else if (action === 'getSize') {
          return veryLargeData.length;
        } else if (action === 'getOtherSize') {
          return someOtherData.length;
        }
        return null;
      };

      const anotherFunction = function() {
        return `处理器 ${i} 已就绪`;
      };

      const functionInfo = {
        id: i,
        name: `闭包函数 ${i}`,
        largeDataSize: veryLargeData.length,
        otherDataSize: someOtherData.length,
        func: leakyFunction,
        anotherFunc: anotherFunction,
        _largeData: veryLargeData,
        _otherData: someOtherData
      };

      functions.push(functionInfo);
    }

    closureRefsRef.current = functions;
    setClosureFunctions(functions.map(f => ({
      id: f.id,
      name: f.name,
      largeDataSize: f.largeDataSize,
      otherDataSize: f.otherDataSize
    })));
    addLog('❌ 已创建 3 个闭包泄漏');
  };

  const fixClosureLeak = () => {
    closureRefsRef.current.forEach(item => {
      item.func = null;
      item.anotherFunc = null;
      item._largeData = null;
      item._otherData = null;
    });

    closureRefsRef.current = [];
    setClosureFunctions([]);
    addLog('✅ 已清理所有闭包泄漏');
  };

  const testClosureFunction = (id, action) => {
    const closureInfo = closureRefsRef.current.find(f => f.id === id);
    if (closureInfo && closureInfo.func) {
      const result = closureInfo.func(action);
      console.log(`闭包函数 ${id} 执行结果:`, result);
      addLog(`测试闭包函数 ${id}: ${action} => ${JSON.stringify(result)}`);
      return result;
    }
    return null;
  };

  const currentLeakStatus = closureFunctions.length > 0 ? 'active' : 'normal';

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
            onCreateLeak={createClosureLeak}
            onFixLeak={fixClosureLeak}
            onForceGC={forceGarbageCollection}
          />

          <section className="demo-section">
            <h2>🖥️ 演示区域</h2>
            <div className="demo-container">
              <div className="closure-leak-demo">
                <h3>闭包函数状态</h3>
                {closureFunctions.length === 0 ? (
                  <div className="empty-state">
                    <p>🟢 当前没有泄漏的闭包</p>
                    <p>点击"创建泄漏"按钮开始演示</p>
                  </div>
                ) : (
                  <div className="closure-demo-active">
                    <div className="closure-stats">
                      <p>🔴 泄漏的闭包函数: {closureFunctions.length} 个</p>
                      <p>📊 总数据量: ~{(closureFunctions.reduce((sum, f) => sum + f.largeDataSize + f.otherDataSize, 0) / 1024 / 1024 * 20).toFixed(1)} MB</p>
                    </div>

                    <div className="closure-list">
                      <h4>闭包函数列表:</h4>
                      {closureFunctions.map((func) => (
                        <div key={func.id} className="closure-item">
                          <div className="closure-header">
                            <span className="closure-name">{func.name}</span>
                            <span className="closure-size">
                              {((func.largeDataSize + func.otherDataSize) / 1000).toFixed(0)}K 项
                            </span>
                          </div>
                          <div className="closure-actions">
                            <button
                              className="test-btn"
                              onClick={() => testClosureFunction(func.id, 'getMetadata')}
                            >
                              获取元数据
                            </button>
                            <button
                              className="test-btn"
                              onClick={() => testClosureFunction(func.id, 'getSize')}
                            >
                              获取大小
                            </button>
                            <button
                              className="test-btn"
                              onClick={() => testClosureFunction(func.id, 'getOtherSize')}
                            >
                              获取其他大小
                            </button>
                          </div>
                          <div className="closure-details">
                            <small>大数据: {func.largeDataSize.toLocaleString()} 项</small>
                            <small>其他数据: {func.otherDataSize.toLocaleString()} 项</small>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="leak-analysis">
                      <h4>🔍 闭包泄漏分析:</h4>
                      <ul>
                        <li>每个闭包函数都持有完整的外部作用域</li>
                        <li>即使只使用少量数据，所有变量都被引用</li>
                        <li>嵌套闭包会创建引用链，加剧泄漏</li>
                        <li>这种泄漏在代码中很难直接看出</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="demo-info">
                  <h4>🛠️ Memory 面板分析技巧:</h4>
                  <ol>
                    <li><strong>搜索 Closure</strong>: 在堆快照中搜索 "Closure"</li>
                    <li><strong>查看 Retainers</strong>: 分析闭包被谁引用</li>
                    <li><strong>对比快照</strong>: 创建前后对比闭包数量</li>
                    <li><strong>检查作用域</strong>: 查看闭包持有的变量列表</li>
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

export default ClosureLeakPage;
