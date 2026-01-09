import React from 'react';
import './MemoryMonitor.css';

/**
 * 内存监控组件
 * 显示内存使用信息和控制按钮
 */
export const MemoryMonitor = ({
  memoryInfo,
  isMonitoring,
  isSupported,
  onStart,
  onStop,
  onForceGC
}) => {
  return (
    <section className="memory-monitor">
      <h3 className="memory-monitor__title">📊 内存监控</h3>

      <div className="memory-monitor__controls">
        <button
          onClick={onStart}
          className="btn btn-primary btn-sm"
          disabled={isMonitoring || !isSupported}
        >
          开始监控
        </button>
        <button
          onClick={onStop}
          className="btn btn-secondary btn-sm"
          disabled={!isMonitoring}
        >
          停止监控
        </button>
        <button
          onClick={onForceGC}
          className="btn btn-outline btn-sm"
        >
          强制GC
        </button>
      </div>

      {!isSupported && (
        <div className="memory-monitor__warning">
          ⚠️ 请使用 --enable-precise-memory-info 启动 Chrome
        </div>
      )}

      {memoryInfo && (
        <div className="memory-monitor__display">
          <div className="memory-monitor__item">
            <span className="memory-monitor__label">已使用:</span>
            <span className="memory-monitor__value">
              {(memoryInfo.used / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <div className="memory-monitor__item">
            <span className="memory-monitor__label">总分配:</span>
            <span className="memory-monitor__value">
              {(memoryInfo.total / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
          <div className="memory-monitor__item">
            <span className="memory-monitor__label">使用率:</span>
            <span className="memory-monitor__value">
              {((memoryInfo.used / memoryInfo.limit) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )}
    </section>
  );
};

export default MemoryMonitor;
