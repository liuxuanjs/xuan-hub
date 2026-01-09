import React from 'react';
import './PerformanceTips.css';

/**
 * Performance 使用提示组件
 */
export const PerformanceTips = ({ tips }) => {
  if (!tips || tips.length === 0) {
    return null;
  }

  return (
    <section className="performance-tips">
      <h3 className="performance-tips__title">💡 Performance 使用提示</h3>
      <div className="performance-tips__list">
        {tips.map((tip, index) => (
          <div key={index} className="performance-tips__item">
            <span className="performance-tips__number">{index + 1}</span>
            <span className="performance-tips__text">{tip}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PerformanceTips;
