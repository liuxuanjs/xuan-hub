import React, { useState, useRef, useEffect } from 'react';
import { ScenarioLayout } from '../components/layout/ScenarioLayout';
import { ScenarioHeader, ActionPanel, CodeComparison, KeyPoints, NextScenario, PerformanceTips } from '../components/scenario';
import { MemoryMonitor, MemorySnapshot } from '../components/memory';
import { Console } from '../components/console';
import { useScenario } from '../hooks/useScenario';
import { SCENARIOS } from '../core/domain/scenarios.config';
import { SCENARIO_TYPES } from '../core/domain/constants';

export const TimerLeakPage = () => {
  const config = SCENARIOS[SCENARIO_TYPES.TIMER];
  const [activeTimers, setActiveTimers] = useState([]);
  const [timerLogs, setTimerLogs] = useState([]);
  const timersRef = useRef([]);

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
  } = useScenario(SCENARIO_TYPES.TIMER);

  const createTimerLeak = () => {
    const timers = [];

    for (let i = 0; i < 5; i++) {
      const largeData = new Array(100000).fill(`定时器数据-${i}-${Date.now()}`);
      let executionCount = 0;

      const intervalId = setInterval(() => {
        executionCount++;
        const logMessage = `定时器 ${i} 执行第 ${executionCount} 次，数据大小: ${largeData.length}`;

        setTimerLogs(prev => [...prev.slice(-10), {
          id: `timer-${i}-${executionCount}`,
          message: logMessage,
          timestamp: new Date().toLocaleTimeString()
        }]);

        if (executionCount % 10 === 0) {
          const sum = largeData.slice(0, 1000).reduce((acc, item) => acc + item.length, 0);
          console.log(`定时器 ${i} 计算结果:`, sum);
        }
      }, 1000 + i * 200);

      const timeoutId = setTimeout(() => {
        console.log(`延迟执行定时器 ${i}，数据:`, largeData.slice(0, 3));
      }, 5000 + i * 1000);

      const timerInfo = {
        id: i,
        intervalId,
        timeoutId,
        data: largeData,
        type: 'interval + timeout',
        interval: 1000 + i * 200,
        executionCount: 0
      };

      timers.push(timerInfo);
    }

    timersRef.current = timers;
    setActiveTimers(timers.map(t => ({
      id: t.id,
      type: t.type,
      interval: t.interval,
      dataSize: t.data.length
    })));
    addLog('❌ 已创建 5 个定时器泄漏');
  };

  const fixTimerLeak = () => {
    timersRef.current.forEach(timer => {
      clearInterval(timer.intervalId);
      clearTimeout(timer.timeoutId);
      timer.data = null;
    });

    timersRef.current = [];
    setActiveTimers([]);
    setTimerLogs([]);
    addLog('✅ 已清理所有定时器泄漏');
  };

  useEffect(() => {
    return () => {
      if (timersRef.current.length > 0) {
        timersRef.current.forEach(timer => {
          clearInterval(timer.intervalId);
          clearTimeout(timer.timeoutId);
        });
      }
    };
  }, []);

  const currentLeakStatus = activeTimers.length > 0 ? 'active' : 'normal';

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
            onCreateLeak={createTimerLeak}
            onFixLeak={fixTimerLeak}
            onForceGC={forceGarbageCollection}
          />

          <section className="demo-section">
            <h2>🖥️ 演示区域</h2>
            <div className="demo-container">
              <div className="timer-leak-demo">
                <h3>定时器状态</h3>
                {activeTimers.length === 0 ? (
                  <div className="empty-state">
                    <p>🟢 当前没有运行的定时器</p>
                    <p>点击"创建泄漏"按钮开始演示</p>
                  </div>
                ) : (
                  <div className="timer-demo-active">
                    <div className="timer-stats">
                      <p>🔴 活跃定时器: {activeTimers.length} 个</p>
                      <p>📊 总数据量: ~{(activeTimers.reduce((sum, t) => sum + t.dataSize, 0) / 1024 / 1024 * 20).toFixed(1)} MB</p>
                    </div>

                    <div className="timer-list">
                      <h4>定时器列表:</h4>
                      {activeTimers.map((timer) => (
                        <div key={timer.id} className="timer-item">
                          <span className="timer-id">定时器 {timer.id}</span>
                          <span className="timer-type">{timer.type}</span>
                          <span className="timer-interval">{timer.interval}ms</span>
                          <span className="timer-size">{(timer.dataSize / 1000).toFixed(0)}K 项</span>
                        </div>
                      ))}
                    </div>

                    <div className="timer-logs">
                      <h4>定时器执行日志:</h4>
                      <div className="log-container">
                        {timerLogs.slice(-8).map((log) => (
                          <div key={log.id} className="log-entry">
                            <span className="log-time">{log.timestamp}</span>
                            <span className="log-message">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="demo-info">
                  <h4>🔍 Performance 面板观察要点:</h4>
                  <ul>
                    <li><strong>Main 线程</strong>: 查看周期性的 'Timer Fired' 事件</li>
                    <li><strong>Memory 图表</strong>: 观察 JS Heap 的锯齿状增长模式</li>
                    <li><strong>CPU 使用率</strong>: 注意周期性的 CPU 峰值</li>
                    <li><strong>Call Tree</strong>: 找到定时器回调函数的耗时</li>
                  </ul>
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

export default TimerLeakPage;
