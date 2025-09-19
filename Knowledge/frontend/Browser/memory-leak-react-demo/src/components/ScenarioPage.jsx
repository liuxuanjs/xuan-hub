import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ScenarioPage.css';

export const ScenarioPage = ({ 
  title, 
  icon, 
  description, 
  difficulty,
  children,
  onCreateLeak,
  onFixLeak,
  leakStatus,
  codeExample,
  keyPoints,
  performanceTips,
  nextScenario
}) => {
  const [memoryInfo, setMemoryInfo] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [logs, setLogs] = useState([]);

  // 内存监控
  useEffect(() => {
    let interval;
    if (isMonitoring && performance.memory) {
      interval = setInterval(() => {
        const memory = performance.memory;
        const info = {
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          limit: memory.jsHeapSizeLimit
        };
        setMemoryInfo(info);
        
        const usedMB = (info.used / 1024 / 1024).toFixed(2);
        const totalMB = (info.total / 1024 / 1024).toFixed(2);
        addLog(`内存使用: ${usedMB}MB / ${totalMB}MB`);
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev.slice(-20), `[${timestamp}] ${message}`]);
  };

  const startMonitoring = () => {
    if (!performance.memory) {
      addLog('⚠️ 当前浏览器不支持 performance.memory API');
      addLog('请使用 --enable-precise-memory-info 标志启动 Chrome');
      return;
    }
    setIsMonitoring(true);
    addLog('🚀 开始内存监控');
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    addLog('⏹️ 停止内存监控');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const forceGC = () => {
    if (window.gc) {
      window.gc();
      addLog('🗑️ 已执行垃圾回收');
    } else {
      addLog('⚠️ 垃圾回收不可用，请使用 --js-flags="--expose-gc" 启动 Chrome');
    }
  };

  const getDifficultyColor = (level) => {
    switch (level) {
      case '初级': return '#10b981';
      case '中级': return '#f59e0b';
      case '高级': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="scenario-page">
      <header className="scenario-header">
        <div className="scenario-title">
          <span className="scenario-icon-large">{icon}</span>
          <div>
            <h1>{title}</h1>
            <p>{description}</p>
            <span 
              className="difficulty-badge"
              style={{ backgroundColor: getDifficultyColor(difficulty) }}
            >
              {difficulty}
            </span>
          </div>
        </div>
      </header>

      <div className="scenario-content">
        <div className="main-panel">
          {/* 操作区域 */}
          <section className="action-section">
            <h2>🎮 操作面板</h2>
            <div className="action-buttons">
              <button 
                onClick={() => {
                  onCreateLeak();
                  addLog(`❌ 创建${title}`);
                }}
                className="btn btn-danger"
                disabled={leakStatus === 'active'}
              >
                创建泄漏
              </button>
              <button 
                onClick={() => {
                  onFixLeak();
                  addLog(`✅ 修复${title}`);
                }}
                className="btn btn-success"
                disabled={leakStatus !== 'active'}
              >
                修复泄漏
              </button>
              <div className="status-indicator">
                状态: <span className={`status ${leakStatus}`}>
                  {leakStatus === 'active' ? '🔴 泄漏中' : '🟢 正常'}
                </span>
              </div>
            </div>
          </section>

          {/* 演示区域 */}
          <section className="demo-section">
            <h2>🖥️ 演示区域</h2>
            <div className="demo-container">
              {children}
            </div>
          </section>

          {/* 代码示例 */}
          {codeExample && (
            <section className="code-section">
              <h2>💻 代码示例</h2>
              <div className="code-tabs">
                <div className="code-tab active">问题代码</div>
                <div className="code-tab">修复后</div>
              </div>
              <pre className="code-block">
                <code>{codeExample.problem}</code>
              </pre>
            </section>
          )}

          {/* 关键知识点 */}
          {keyPoints && (
            <section className="knowledge-section">
              <h2>🎯 关键知识点</h2>
              <div className="knowledge-grid">
                {keyPoints.map((point, index) => (
                  <div key={index} className="knowledge-card">
                    <h3>{point.title}</h3>
                    <p>{point.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="side-panel">
          {/* 内存监控 */}
          <section className="monitor-section">
            <h3>📊 内存监控</h3>
            <div className="monitor-controls">
              <button 
                onClick={startMonitoring}
                className="btn btn-primary btn-sm"
                disabled={isMonitoring}
              >
                开始监控
              </button>
              <button 
                onClick={stopMonitoring}
                className="btn btn-secondary btn-sm"
                disabled={!isMonitoring}
              >
                停止监控
              </button>
              <button 
                onClick={forceGC}
                className="btn btn-outline btn-sm"
              >
                强制GC
              </button>
            </div>
            
            {memoryInfo && (
              <div className="memory-display">
                <div className="memory-item">
                  <span>已使用:</span>
                  <span>{(memoryInfo.used / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="memory-item">
                  <span>总分配:</span>
                  <span>{(memoryInfo.total / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <div className="memory-item">
                  <span>使用率:</span>
                  <span>{((memoryInfo.used / memoryInfo.limit) * 100).toFixed(1)}%</span>
                </div>
              </div>
            )}
          </section>

          {/* 日志控制台 */}
          <section className="console-section">
            <div className="console-header">
              <h3>📝 日志控制台</h3>
              <button onClick={clearLogs} className="btn btn-outline btn-xs">
                清空
              </button>
            </div>
            <div className="console-logs">
              {logs.length === 0 ? (
                <div className="console-empty">暂无日志</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="console-log">
                    {log}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Performance 使用提示 */}
          {performanceTips && (
            <section className="tips-section">
              <h3>💡 Performance 使用提示</h3>
              <div className="tips-list">
                {performanceTips.map((tip, index) => (
                  <div key={index} className="tip-item">
                    <span className="tip-number">{index + 1}</span>
                    <span className="tip-text">{tip}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 下一个场景 */}
          {nextScenario && (
            <section className="next-section">
              <h3>⏭️ 下一个场景</h3>
              <Link to={nextScenario.path} className="next-link">
                <span className="next-icon">{nextScenario.icon}</span>
                <div>
                  <div className="next-title">{nextScenario.title}</div>
                  <div className="next-description">{nextScenario.description}</div>
                </div>
              </Link>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
