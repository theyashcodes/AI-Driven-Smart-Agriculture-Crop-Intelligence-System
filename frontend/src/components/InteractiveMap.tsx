"use client";
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

function MapClickHandler({ onRegionSelect }: { onRegionSelect: (region: string) => void }) {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      let region = "North";
      
      // Simple region bounding box logic (tuned for India defaults)
      if (lat < 18) region = "South";
      else if (lng > 84) region = "East";
      else if (lat > 25) region = "North";
      else region = "West";

      onRegionSelect(region);
    },
  });
  return null;
}

export default function InteractiveMap({ onRegionSelect }: { onRegionSelect: (region: string) => void }) {
  return (
    <MapContainer center={[22.5937, 78.9629]} zoom={4} style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <MapClickHandler onRegionSelect={onRegionSelect} />
    </MapContainer>
  );
}
