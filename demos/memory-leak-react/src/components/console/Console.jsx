import React, { useRef, useEffect } from 'react';
import './Console.css';

/**
 * 日志控制台组件
 */
export const Console = ({ logs, onClear }) => {
  const consoleRef = useRef(null);

  // 自动滚动到底部
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <section className="console">
      <div className="console__header">
        <h3 className="console__title">📝 日志控制台</h3>
        <button onClick={onClear} className="btn btn-outline btn-xs">
          清空
        </button>
      </div>
      <div className="console__body" ref={consoleRef}>
        {logs.length === 0 ? (
          <div className="console__empty">暂无日志</div>
        ) : (
          logs.map((log, index) => {
            // 使用 log.id 或 log.timestamp 作为 key，确保唯一性
            const key = log.id || log.timestamp || `log-${index}-${Date.now()}`;
            return (
              <div key={key} className="console__log">
                {typeof log === 'string' ? log : log.message || JSON.stringify(log)}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};

export default Console;
