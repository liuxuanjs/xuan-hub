import React from 'react';
import { DIFFICULTY_COLORS } from '../../core/domain/constants';
import './ScenarioHeader.css';

/**
 * 场景头部组件
 * 展示场景标题、图标、描述和难度
 */
export const ScenarioHeader = ({
  title,
  icon,
  description,
  difficulty
}) => {
  const difficultyColor = DIFFICULTY_COLORS[difficulty] || '#6b7280';

  return (
    <header className="scenario-header">
      <div className="scenario-header__content">
        <span className="scenario-header__icon">{icon}</span>
        <div className="scenario-header__text">
          <h1 className="scenario-header__title">{title}</h1>
          <p className="scenario-header__description">{description}</p>
          <span
            className="scenario-header__badge"
            style={{ backgroundColor: difficultyColor }}
          >
            {difficulty}
          </span>
        </div>
      </div>
    </header>
  );
};

export default ScenarioHeader;
