import React from 'react';
import { NavLink } from 'react-router-dom';
import './Nav.css';                           // styles just below

export default function Nav(){
  return (
    <nav className="main-nav">
      <ul>
        <li><NavLink to="/"          end>Home</NavLink></li>
        <li><NavLink to="/structure">OS Structure</NavLink></li>
        <li><NavLink to="/processes">Processes</NavLink></li>
        <li><NavLink to="/scheduling">CPU Scheduling</NavLink></li>
        <li><NavLink to="/deadlocks">Deadlocks</NavLink></li>
      </ul>
    </nav>
  );
}
