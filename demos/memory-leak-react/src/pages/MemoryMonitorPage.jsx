import React, { useState, useEffect, useRef } from 'react';
import { ScenarioLayout } from '../components/layout/ScenarioLayout';
import { ScenarioHeader, CodeComparison, KeyPoints, NextScenario, PerformanceTips } from '../components/scenario';
import { MemorySnapshot } from '../components/memory';
import { Console } from '../components/console';
import { SCENARIOS } from '../core/domain/scenarios.config';
import { SCENARIO_TYPES } from '../core/domain/constants';
import { formatMB } from '../utils/formatters';

export const MemoryMonitorPage = () => {
  const config = SCENARIOS[SCENARIO_TYPES.MEMORY_MONITOR];
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [memoryData, setMemoryData] = useState([]);
  const [currentMemory, setCurrentMemory] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const intervalRef = useRef(null);
  const alertThresholds = useRef({
    memoryGrowth: 50,
    memoryUsage: 0.8,
    rapidGrowth: 20
  });

  const addLog = (message) => {
    setLogs(prev => [...prev.slice(-49), {
      id: Date.now(),
      message,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const clearLogs = () => {
    setLogs([]);
    setAlerts([]);
  };

  const addAlert = (type, message) => {
    const alert = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    };

    setAlerts(prev => [...prev.slice(-10), alert]);
    addLog(`[${type.toUpperCase()}] ${message}`);
  };

  const checkMemoryAlerts = (data) => {
    if (data.length < 2) return;

    const current = data[data.length - 1];
    const previous = data[data.length - 2];

    if (current.usage > alertThresholds.current.memoryUsage) {
      addAlert('warning', `内存使用率过高: ${(current.usage * 100).toFixed(1)}%`);
    }

    const growthMB = (current.used - previous.used) / 1024 / 1024;
    if (growthMB > 10) {
      addAlert('warning', `内存快速增长: +${growthMB.toFixed(1)}MB`);
    }

    const thirtySecondsAgo = data.find(d => current.timestamp - d.timestamp >= 30000);
    if (thirtySecondsAgo) {
      const totalGrowth = (current.used - thirtySecondsAgo.used) / 1024 / 1024;
      if (totalGrowth > alertThresholds.current.rapidGrowth) {
        addAlert('error', `30秒内内存增长过快: +${totalGrowth.toFixed(1)}MB`);
      }
    }
  };

  const startMonitoring = () => {
    if (!performance.memory) {
      addAlert('error', '当前浏览器不支持 performance.memory API');
      return;
    }

    setIsMonitoring(true);
    addLog('开始内存监控');

    intervalRef.current = setInterval(() => {
      const memory = performance.memory;
      const timestamp = Date.now();
      const memoryInfo = {
        timestamp,
        used: memory.usedJSHeapSize,
        total: memory.totalJSHeapSize,
        limit: memory.jsHeapSizeLimit,
        usage: memory.usedJSHeapSize / memory.jsHeapSizeLimit
      };

      setCurrentMemory(memoryInfo);
      setMemoryData(prev => {
        const newData = [...prev, memoryInfo];
        if (newData.length > 100) {
          newData.shift();
        }

        checkMemoryAlerts(newData);

        return newData;
      });
    }, 2000);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    addLog('内存监控已停止');
  };

  const clearData = () => {
    setMemoryData([]);
    setCurrentMemory(null);
    setAlerts([]);
    setLogs([]);
  };

  const forceGC = () => {
    if (window.gc) {
      window.gc();
      addLog('已执行垃圾回收');
    } else {
      addAlert('warning', '垃圾回收不可用，请使用 --js-flags="--expose-gc" 启动Chrome');
    }
  };

  const generateReport = () => {
    if (memoryData.length === 0) {
      addAlert('warning', '没有足够的数据生成报告');
      return;
    }

    const first = memoryData[0];
    const last = memoryData[memoryData.length - 1];
    const duration = (last.timestamp - first.timestamp) / 1000 / 60;
    const growth = (last.used - first.used) / 1024 / 1024;
    const avgUsage = memoryData.reduce((sum, d) => sum + d.usage, 0) / memoryData.length;

    const report = {
      duration: duration.toFixed(1),
      memoryGrowth: growth.toFixed(2),
      growthRate: (growth / duration).toFixed(2),
      avgUsage: (avgUsage * 100).toFixed(1),
      peakUsage: (Math.max(...memoryData.map(d => d.usage)) * 100).toFixed(1),
      dataPoints: memoryData.length
    };

    console.group('📊 内存监控报告');
    console.log(`监控时长: ${report.duration} 分钟`);
    console.log(`内存增长: ${report.memoryGrowth} MB`);
    console.log(`增长率: ${report.growthRate} MB/分钟`);
    console.log(`平均使用率: ${report.avgUsage}%`);
    console.log(`峰值使用率: ${report.peakUsage}%`);
    console.log(`数据点数: ${report.dataPoints}`);
    console.groupEnd();

    addLog(`报告已生成，请查看控制台。增长率: ${report.growthRate} MB/分钟`);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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
          <section className="demo-section">
            <h2>🖥️ 监控控制台</h2>
            <div className="demo-container">
              <div className="memory-monitor-demo">
                <div className="monitor-controls">
                  <div className="control-buttons">
                    <button
                      onClick={startMonitoring}
                      disabled={isMonitoring}
                      className="btn btn-success"
                    >
                      {isMonitoring ? '监控中...' : '开始监控'}
                    </button>
                    <button
                      onClick={stopMonitoring}
                      disabled={!isMonitoring}
                      className="btn btn-danger"
                    >
                      停止监控
                    </button>
                    <button
                      onClick={forceGC}
                      className="btn btn-outline"
                    >
                      强制GC
                    </button>
                    <button
                      onClick={generateReport}
                      className="btn btn-primary"
                      disabled={memoryData.length === 0}
                    >
                      生成报告
                    </button>
                    <button
                      onClick={clearData}
                      className="btn btn-outline"
                    >
                      清空数据
                    </button>
                  </div>
                </div>

                {currentMemory && (
                  <div className="current-memory">
                    <h4>📊 当前内存状态</h4>
                    <div className="memory-stats">
                      <div className="stat-item">
                        <span className="stat-label">已使用:</span>
                        <span className="stat-value">{formatMB(currentMemory.used)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">总分配:</span>
                        <span className="stat-value">{formatMB(currentMemory.total)}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">使用率:</span>
                        <span className={`stat-value ${currentMemory.usage > 0.8 ? 'high' : currentMemory.usage > 0.6 ? 'medium' : 'low'}`}>
                          {(currentMemory.usage * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">数据点:</span>
                        <span className="stat-value">{memoryData.length}</span>
                      </div>
                    </div>
                  </div>
                )}

                {memoryData.length > 0 && (
                  <div className="memory-chart">
                    <h4>📈 内存使用趋势</h4>
                    <div className="chart-container">
                      <div className="chart-area">
                        {memoryData.map((point, index) => {
                          const height = point.usage * 100;
                          const left = (index / (memoryData.length - 1)) * 100;
                          return (
                            <div
                              key={point.timestamp}
                              className="chart-point"
                              style={{
                                left: `${left}%`,
                                bottom: `${height}%`,
                                backgroundColor: height > 80 ? '#ef4444' : height > 60 ? '#f59e0b' : '#10b981'
                              }}
                              title={`${(point.usage * 100).toFixed(1)}% - ${new Date(point.timestamp).toLocaleTimeString()}`}
                            />
                          );
                        })}
                      </div>
                      <div className="chart-labels">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                )}

                {alerts.length > 0 && (
                  <div className="alerts-section">
                    <h4>🚨 监控告警</h4>
                    <div className="alerts-list">
                      {alerts.slice(-5).reverse().map((alert) => (
                        <div key={alert.id} className={`alert alert-${alert.type}`}>
                          <span className="alert-time">{alert.timestamp}</span>
                          <span className="alert-message">{alert.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="demo-info">
                  <h4>🛠️ 监控工具使用说明:</h4>
                  <ol>
                    <li><strong>开始监控</strong>: 点击"开始监控"按钮启动实时内存监控</li>
                    <li><strong>观察趋势</strong>: 查看内存使用率的变化趋势图</li>
                    <li><strong>关注告警</strong>: 留意系统自动生成的内存告警信息</li>
                    <li><strong>生成报告</strong>: 定期生成内存使用报告，分析应用性能</li>
                    <li><strong>结合其他工具</strong>: 配合 Performance 和 Memory 面板进行深度分析</li>
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
          <MemorySnapshot />

          <Console logs={logs} onClear={clearLogs} />

          <PerformanceTips tips={config.performanceTips} />

          <NextScenario nextScenario={config.nextScenario} />
        </>
      }
    />
  );
};

export default MemoryMonitorPage;
