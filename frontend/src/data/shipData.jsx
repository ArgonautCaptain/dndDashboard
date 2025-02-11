import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

// Create Context
const ShipDataContext = createContext();

// Provider Component
export const ShipDataProvider = ({ children }) => {
  const [shipData, setShipData] = useState(null);

  // Fetch ship data from Firestore when provider loads
  useEffect(() => {
    const shipRef = doc(db, 'ships', 'scarlet-fury');

    const unsubscribe = onSnapshot(shipRef, (snapshot) => {
      if (snapshot.exists()) {
        setShipData(snapshot.data());
      } else {
        console.error('No ship data found in Firestore.');
      }
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  return (
    <ShipDataContext.Provider value={{ shipData, setShipData }}>
      {children}
    </ShipDataContext.Provider>
  );
};
ShipDataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useShipData = () => useContext(ShipDataContext);