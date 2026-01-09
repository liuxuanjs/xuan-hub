import React from 'react';
import './ScenarioLayout.css';

/**
 * 场景页面统一布局组件
 */
export const ScenarioLayout = ({
  header,
  mainContent,
  sidebarContent,
  children
}) => {
  return (
    <div className="scenario-layout">
      {header}

      <div className="scenario-layout__content">
        <div className="scenario-layout__main">
          {mainContent}
          {children}
        </div>

        <div className="scenario-layout__sidebar">
          {sidebarContent}
        </div>
      </div>
    </div>
  );
};

export default ScenarioLayout;
