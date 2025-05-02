import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import OSStructure from './components/OSStructure';
import Processes from './components/Processes';
import Scheduling from './components/Scheduling';
import Deadlocks from './components/Deadlocks';
import Home from './components/Home';
import Layout from './components/Layout';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>          
          <Route path="/" element={<Home />} />
          <Route path="/structure" element={<OSStructure />} />
          <Route path="/processes" element={<Processes />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/deadlocks" element={<Deadlocks />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
