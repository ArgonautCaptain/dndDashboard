import React, { createContext, useContext, useState } from 'react';

// Create Context
const ShipDataContext = createContext();

// Provider Component
export const ShipDataProvider = ({ children }) => {
  const [shipDataSaved, setShipDataSaved] = useState(null);

  const setShipData = (newData) => {
    setShipDataSaved(newData);
    return shipDataSaved;
  };

  const shipData = shipDataSaved;

  return (
    <ShipDataContext.Provider value={{ shipData, setShipData }}>
      {children}
    </ShipDataContext.Provider>
  );
};

// Hook to use the context
export const useShipData = () => useContext(ShipDataContext);
