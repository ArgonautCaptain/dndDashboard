import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Map from './pages/map';
import AdminPanel from './pages/adminpanel';
import ShipDashboard from './pages/shipdashboard';
import './App.css'; // Ensure styles for the header are included
import 'leaflet/dist/leaflet.css';

const App = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Persistent Header */}
      <header className="header">
        <nav className="nav">
          <ul className="nav-list">
            <li className={`nav-item ${isActive('/') ? 'active' : ''}`}>
              <Link to="/">Ship Dashboard</Link>
            </li>
            <li className={`nav-item ${isActive('/map') ? 'active' : ''}`}>
              <Link to="/map">Map</Link>
            </li>
            <li className={`nav-item ${isActive('/admin') ? 'active' : ''}`}>
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
};

export default App;
