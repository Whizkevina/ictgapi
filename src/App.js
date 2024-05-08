import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Components/Home";
import LiveService from "./Components/LiveService";
import UserCheck from './Components/UserCheck';


function App() {
  return (
    <div className="Container">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home />} />  {/* Added exact for root path */}
          <Route path="/UserCheck" element={<UserCheck />} />
          <Route path="/LiveService" element={<LiveService />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
