import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AdminPanel = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication state
  const [password, setPassword] = useState(''); // Track password input
  const [hp, setHp] = useState(100); // Track HP value

  const correctPassword = 'KeithBaker'; // Replace with your desired password

  // Check localStorage for saved authentication state
  useEffect(() => {
    const savedAuth = localStorage.getItem('isAuthenticated');
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault(); // Prevent page reload
    if (password === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem('isAuthenticated', 'true'); // Save to localStorage
    } else {
      alert('Incorrect password!');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated'); // Remove from localStorage
  };

  // Handle HP update
  const updateHp = async () => {
    try {
      const shipRef = doc(db, 'ships', 'shipId'); // Adjust "shipId" to match your Firestore document ID
      await updateDoc(shipRef, { hp });
      alert('HP updated successfully!');
    } catch (error) {
      console.error('Error updating HP:', error);
    }
  };

  return (
    <div className="container">
      {!isAuthenticated ? (
        <form onSubmit={handleLogin}>
          <h2>Admin Login</h2>
          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">Login</button>
        </form>
      ) : (
        <>
          <h2>Admin Panel</h2>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={() => window.open("https://console.firebase.google.com/u/0/project/dnd-dashboard-64a3c/firestore/databases/-default-/data/~2Fships~2Fscarlet-fury", '_blank')}>Firebase</button>
          <label>
            Ship HP:
            <input
              type="number"
              value={hp}
              onChange={(e) => setHp(parseInt(e.target.value, 10))}
            />
          </label>
          <button onClick={updateHp}>Update HP</button>
        </>
      )}
    </div>
  );
};

export default AdminPanel;
