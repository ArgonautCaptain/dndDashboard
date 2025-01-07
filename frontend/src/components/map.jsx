import React, { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';

const Map = () => {
  const [zoom, setZoom] = useState(3);
  const [center, setCenter] = useState({ lat: 0, lng: 0 }); // Match map.getCenter() structure

  const MapEventHandler = () => {
    const map = useMapEvents({
      zoomend: () => {
        setZoom(map.getZoom()); // Update zoom level
      },
      moveend: () => {
        setCenter(map.getCenter()); // Update map center
      },
    });
    return null; // This component doesn't render anything
  };

  return (
    <div className="map-container">
      {/*<div style={{ marginBottom: '10px', padding: '5px', background: '#000' }}>
        <p>Zoom Level: {zoom}</p>
        <p>Center: {`Lat: ${center.lat.toFixed(2)}, Lng: ${center.lng.toFixed(2)}`}</p>
      </div> */}
      <MapContainer
        center={[-67, 141]} // Adjust center coordinates as needed
        zoom={6} // Default zoom level
        minZoom={3}
        maxZoom={7} // Adjust based on your available zoom levels
        style={{ height: '95vh', width: '80%', backgroundColor: '#2b3b36' }}
      >
        <TileLayer
          url="/public/tiles/{z}/{x}/{y}.png"
          tms={true}
          tileSize={256}
          noWrap={true}
        />
        <MapEventHandler />
      </MapContainer>
    </div>
  );
};

export default Map;
