import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';

const Map = () => {
  return (
    <div>
    <MapContainer
      center={[0, 0]} // Adjust center coordinates as needed
      zoom={4} // Default zoom level
      minZoom={1}
      maxZoom={8} // Adjust based on your available zoom levels
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="/public/tiles/{z}/{x}/{y}.png"
        attribution="&copy; Your Attribution Here"
        tileSize={256}
      />
    </MapContainer>
    </div>
  );
};

export default Map;
