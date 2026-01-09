import React from 'react';
import './CodeComparison.css';

/**
 * 代码对比组件
 * 并排展示问题代码和修复代码
 */
export const CodeComparison = ({ problemCode, solutionCode }) => {
  if (!problemCode && !solutionCode) {
    return null;
  }

  return (
    <div className="code-comparison">
      <div className="code-comparison__header">
        <h2>💻 代码示例对比</h2>
      </div>

      <div className="code-comparison__container">
        {/* 问题代码 */}
        <div className="code-comparison__panel code-comparison__panel--problem">
          <div className="code-comparison__panel-header">
            <span className="code-comparison__icon">❌</span>
            <span className="code-comparison__title">问题代码</span>
          </div>
          <div className="code-comparison__content">
            <pre className="code-comparison__code">
              <code>{problemCode}</code>
            </pre>
          </div>
        </div>

        {/* 分隔线 */}
        <div className="code-comparison__divider">
          <div className="code-comparison__divider-line" />
          <span className="code-comparison__divider-arrow">→</span>
          <div className="code-comparison__divider-line" />
        </div>

        {/* 修复代码 */}
        <div className="code-comparison__panel code-comparison__panel--solution">
          <div className="code-comparison__panel-header">
            <span className="code-comparison__icon">✅</span>
            <span className="code-comparison__title">修复后的代码</span>
          </div>
          <div className="code-comparison__content">
            <pre className="code-comparison__code">
              <code>{solutionCode}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeComparison;
