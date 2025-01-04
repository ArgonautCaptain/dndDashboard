import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/dashboard';
import AdminPanel from './components/adminpanel';
import ShipStats from './components/shipstats';
import './App.css'; // Ensure styles for the header are included

const App = () => (
  <>
    {/* Persistent Header */}
    <header className="header">
      <nav className="nav">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/">Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link to="/stats">Ship Stats</Link>
          </li>
          <li className="nav-item">
            <Link to="/admin">Admin Panel</Link>
          </li>
        </ul>
      </nav>
    </header>

    {/* Page Content */}
    <main className="content">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/stats" element={<ShipStats />} />
      </Routes>
    </main>
  </>
);

export default App;
