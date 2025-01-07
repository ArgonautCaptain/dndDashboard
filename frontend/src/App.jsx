import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Map from './components/map';
import AdminPanel from './components/adminpanel';
import ShipDashboard from './components/shipdashboard';
import './App.css'; // Ensure styles for the header are included
import 'leaflet/dist/leaflet.css';

const App = () => (
  <>
    {/* Persistent Header */}
    <header className="header">
      <nav className="nav">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/">Ship Dashboard</Link>
          </li>
          <li className="nav-item">
            <Link to="/map">Map</Link>
          </li>
          <li className="nav-item">
            <Link to="/admin">DM Panel</Link>
          </li>
        </ul>
      </nav>
    </header>

    {/* Page Content */}
    <main className="content">
      <Routes>
        <Route path="/" element={<ShipDashboard />} />
        <Route path="/map" element={<Map />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </main>
  </>
);

export default App;
