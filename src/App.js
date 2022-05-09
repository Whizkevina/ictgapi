import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import LiveStream from "./Components/LiveStream";


function App() {
  return (
    <div className="Container">
      <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="LiveStream" element={<LiveStream />} />
      </Routes>
        </BrowserRouter>
     </div>
  );
}

export default App;
