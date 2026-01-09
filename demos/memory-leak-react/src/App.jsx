import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { GlobalLeakPage } from './pages/GlobalLeakPage';
import { EventLeakPage } from './pages/EventLeakPage';
import { TimerLeakPage } from './pages/TimerLeakPage';
import { ClosureLeakPage } from './pages/ClosureLeakPage';
import { DomLeakPage } from './pages/DomLeakPage';
import { MemoryMonitorPage } from './pages/MemoryMonitorPage';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/global-leak" element={<GlobalLeakPage />} />
          <Route path="/event-leak" element={<EventLeakPage />} />
          <Route path="/timer-leak" element={<TimerLeakPage />} />
          <Route path="/closure-leak" element={<ClosureLeakPage />} />
          <Route path="/dom-leak" element={<DomLeakPage />} />
          <Route path="/memory-monitor" element={<MemoryMonitorPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;