import React from 'react';

export const MemoryInfo = ({ 
  memoryInfo, 
  isMonitoring, 
  isSupported, 
  onStartMonitoring, 
  onStopMonitoring 
}) => {
  const formatMemory = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <div className="memory-info">
      <h3>📊 内存使用情况</h3>
      {!isSupported && (
        <div className="warning">
          ⚠️ 当前浏览器不支持 performance.memory API
        </div>
      )}
      
      <div className="memory-display">
        <div className="memory-item">
          <span className="label">已使用内存:</span>
          <span className="value">{formatMemory(memoryInfo.used)}</span>
        </div>
        <div className="memory-item">
          <span className="label">总内存:</span>
          <span className="value">{formatMemory(memoryInfo.total)}</span>
        </div>
        <div className="memory-item">
          <span className="label">内存限制:</span>
          <span className="value">{formatMemory(memoryInfo.limit)}</span>
        </div>
      </div>
      
      <div className="memory-controls">
        <button 
          className="btn btn-primary" 
          onClick={onStartMonitoring}
          disabled={isMonitoring || !isSupported}
        >
          开始内存监控
        </button>
        <button 
          className="btn btn-secondary" 
          onClick={onStopMonitoring}
          disabled={!isMonitoring}
        >
          停止监控
        </button>
      </div>
    </div>
  );
};
