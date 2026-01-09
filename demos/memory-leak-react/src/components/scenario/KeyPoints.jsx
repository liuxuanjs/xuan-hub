import React from 'react';
import './KeyPoints.css';

/**
 * 关键知识点组件
 * 卡片式展示知识点
 */
export const KeyPoints = ({ points }) => {
  if (!points || points.length === 0) {
    return null;
  }

  return (
    <section className="key-points">
      <h2 className="key-points__title">🎯 关键知识点</h2>
      <div className="key-points__grid">
        {points.map((point, index) => (
          <div key={index} className="key-points__card">
            <h3 className="key-points__card-title">{point.title}</h3>
            <p className="key-points__card-description">{point.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default KeyPoints;
