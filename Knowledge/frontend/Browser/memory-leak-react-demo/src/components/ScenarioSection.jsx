import React from 'react';

export const ScenarioSection = ({ scenarios }) => {
  return (
    <div className="demo-section">
      <h3>🚨 内存泄漏场景演示</h3>
      
      {scenarios.map((scenario) => (
        <div key={scenario.id} className="scenario">
          <h4>{scenario.title}</h4>
          <p>{scenario.description}</p>
          
          <div className="scenario-controls">
            <button 
              className="btn btn-danger" 
              onClick={scenario.createAction}
            >
              创建{scenario.title.split('.')[1]}泄漏
            </button>
            <button 
              className="btn btn-success" 
              onClick={scenario.fixAction}
            >
              修复{scenario.title.split('.')[1]}泄漏
            </button>
          </div>

          {scenario.extraContent && (
            <div className="scenario-extra">
              {scenario.extraContent}
            </div>
          )}

          {scenario.codeExample && (
            <div className="code-example">
              <pre><code>{scenario.codeExample}</code></pre>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
