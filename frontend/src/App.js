import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SnakeGame from './components/SnakeGame';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SnakeGame />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;