import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => (
  <div>
    <h1>Ship Dashboard</h1>
    <nav>
      <ul>
        <li><Link to="/stats">View Ship Stats</Link></li>
        <li><Link to="/admin">Admin Panel</Link></li>
      </ul>
    </nav>
  </div>
);

export default Dashboard;
