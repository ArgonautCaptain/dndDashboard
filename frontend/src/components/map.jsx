import { useState } from 'react';
import { MapContainer, TileLayer, useMapEvents } from 'react-leaflet';

const Map = () => {
  const [zoom, setZoom] = useState(7);
  const [center, setCenter] = useState({ lat: -79.4, lng: -17.2 }); // Default center coordinates

  const MapEventHandler = () => {
    const map = useMapEvents({
      zoomend: () => {
        setZoom(map.getZoom()); // Update zoom level
      },
      moveend: () => {
        const mapCenter = map.getCenter();
        // Update the center state with the correct latitude and longitude
        setCenter({ lat: mapCenter.lat.toFixed(2), lng: mapCenter.lng.toFixed(2) });
      },
    });
    return null; // This component doesn't render anything
  };

  return (
    <div className="map-container">
      <MapContainer
        center={center} // Default map center coordinates
        zoom={zoom} // Default zoom level
        minZoom={3}
        maxZoom={7} // Adjust based on your available zoom levels
        style={{ height: '100vh', width: '100%', backgroundColor: '#00000000' }}
      >
        <TileLayer
          url="/tiles/{z}/{x}/{y}.png"
          tms={true}
          tileSize={128}
          noWrap={true}
        />
        <MapEventHandler />
      </MapContainer>
    </div>
  );
};

export default Map;
