import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { ShipDataProvider } from './data/shipData';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <ShipDataProvider>
        <App />
      </ShipDataProvider>
    </HashRouter>
  </React.StrictMode>
);
