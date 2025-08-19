import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import LiveService from "./Components/LiveService";
import UserCheck from './Components/UserCheck';
import AdminLiveService from './Components/AdminLiveService';
import ErrorBoundary from './Components/ErrorBoundary';
import { usePerformanceOptimizations, CriticalCSS } from './utils/performance';

function App() {
  // Apply performance optimizations
  usePerformanceOptimizations();

  return (
    <ErrorBoundary>
      <CriticalCSS />
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/UserCheck" element={<UserCheck />} />
            <Route path="/LiveService" element={<LiveService />} />
            <Route path="/admin/live-service" element={<AdminLiveService />} />
            {/* Catch-all route for 404 */}
            <Route path="*" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </div>
    </ErrorBoundary>
  );
}

export default App;
