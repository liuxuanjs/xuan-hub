import React, { useEffect, useRef } from 'react';

export const ConsoleSection = ({ logs, onClearLogs }) => {
  const consoleRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="console-section">
      <h3>📋 日志输出</h3>
      <div 
        ref={consoleRef}
        className="console"
      >
        {logs.length === 0 ? (
          <div className="console-empty">等待日志输出...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="console-line">
              {log}
            </div>
          ))
        )}
      </div>
      <button 
        className="btn btn-secondary" 
        onClick={onClearLogs}
      >
        清空日志
      </button>
    </div>
  );
};
