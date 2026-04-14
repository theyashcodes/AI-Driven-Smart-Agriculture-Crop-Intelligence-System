"use client";
import React from 'react';
import { MapContainer, TileLayer, Rectangle, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function NDVIMap() {
  // Center roughly in a farm area based on the region mapping, or a generic field.
  const lat = 22.5937;
  const lng = 78.9629;
  
  // Heatmap boundaries (simulating a 2x2 grid of NDVI sensing)
  const bounds1: [[number, number], [number, number]] = [[lat, lng], [lat + 0.05, lng + 0.05]];
  const bounds2: [[number, number], [number, number]] = [[lat, lng + 0.05], [lat + 0.05, lng + 0.10]];
  const bounds3: [[number, number], [number, number]] = [[lat + 0.05, lng], [lat + 0.10, lng + 0.05]];
  const bounds4: [[number, number], [number, number]] = [[lat + 0.05, lng + 0.05], [lat + 0.10, lng + 0.10]];

  return (
    <div style={{ height: "300px", width: "100%", borderRadius: "0.5rem", overflow: "hidden" }}>
      <MapContainer 
        bounds={[[lat-0.05, lng-0.05], [lat+0.15, lng+0.15]]} 
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        {/* Real Satellite Imagery TileLayer for farming feel */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        />
        
        {/* Simulated NDVI Grid */}
        <Rectangle bounds={bounds1} pathOptions={{ color: 'transparent', fillColor: '#00ff00', fillOpacity: 0.45 }}>
            <Tooltip permanent direction="center" className="bg-transparent border-none text-white font-bold drop-shadow-md">0.82</Tooltip>
        </Rectangle>
        <Rectangle bounds={bounds2} pathOptions={{ color: 'transparent', fillColor: '#ffff00', fillOpacity: 0.45 }}>
            <Tooltip permanent direction="center" className="bg-transparent border-none text-white font-bold drop-shadow-md">0.45</Tooltip>
        </Rectangle>
        <Rectangle bounds={bounds3} pathOptions={{ color: 'transparent', fillColor: '#ff0000', fillOpacity: 0.45 }}>
            <Tooltip permanent direction="center" className="bg-transparent border-none text-white font-bold drop-shadow-md">0.12</Tooltip>
        </Rectangle>
        <Rectangle bounds={bounds4} pathOptions={{ color: 'transparent', fillColor: '#32cd32', fillOpacity: 0.45 }}>
            <Tooltip permanent direction="center" className="bg-transparent border-none text-white font-bold drop-shadow-md">0.71</Tooltip>
        </Rectangle>
      </MapContainer>
    </div>
  );
}
