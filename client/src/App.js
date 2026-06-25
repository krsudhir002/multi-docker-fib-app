import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Fib from './Fib';
import Other from './Other'; 

function App() {
  return (
    <BrowserRouter>
      <div>
        <nav>
          <Link to="/">Home</Link>
          {' | '}
          <Link to="/other">Other</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Fib />} />
          <Route path="/other" element={<Other />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;