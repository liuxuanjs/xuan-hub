import React from 'react';
import { Link } from 'react-router-dom';
import './NextScenario.css';

/**
 * 下一个场景推荐组件
 */
export const NextScenario = ({ nextScenario }) => {
  if (!nextScenario) {
    return null;
  }

  return (
    <section className="next-scenario">
      <h3 className="next-scenario__title">⏭️ 下一个场景</h3>
      <Link to={nextScenario.path} className="next-scenario__link">
        <span className="next-scenario__icon">{nextScenario.icon}</span>
        <div className="next-scenario__text">
          <div className="next-scenario__name">{nextScenario.title}</div>
          <div className="next-scenario__description">{nextScenario.description}</div>
        </div>
      </Link>
    </section>
  );
};

export default NextScenario;
