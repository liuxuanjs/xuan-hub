import React from 'react';
import { LEAK_STATUS } from '../../core/domain/constants';
import './ActionPanel.css';

/**
 * 操作面板组件
 * 提供创建泄漏、修复泄漏等操作按钮
 */
export const ActionPanel = ({
  leakStatus,
  onCreateLeak,
  onFixLeak,
  onForceGC,
  isGCSupported = true
}) => {
  const isActive = leakStatus === LEAK_STATUS.ACTIVE;

  return (
    <section className="action-panel">
      <h2 className="action-panel__title">🎮 操作面板</h2>
      <div className="action-panel__buttons">
        <button
          onClick={onCreateLeak}
          className="btn btn-danger"
          disabled={isActive}
        >
          创建泄漏
        </button>
        <button
          onClick={onFixLeak}
          className="btn btn-success"
          disabled={!isActive}
        >
          修复泄漏
        </button>
        {onForceGC && (
          <button
            onClick={onForceGC}
            className="btn btn-outline"
            title={isGCSupported ? '强制垃圾回收' : '需要 --js-flags="--expose-gc" 启动 Chrome'}
          >
            强制 GC
          </button>
        )}
        <div className="action-panel__status">
          状态:{' '}
          <span className={`action-panel__status-text ${isActive ? 'active' : 'normal'}`}>
            {isActive ? '🔴 泄漏中' : '🟢 正常'}
          </span>
        </div>
      </div>
    </section>
  );
};

export default ActionPanel;
