'use client';

import { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';

interface PollutionMapProps {
  locations: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    data: {
      no2: number[];
      pm25: number[];
      o3: number[];
    };
  }>;
  currentTimeIndex: number;
  pollutantType: 'no2' | 'pm25' | 'o3';
  userLocation?: { lat: number; lng: number };
}

function MapUpdater({ userLocation }: { userLocation?: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 10);
    }
  }, [userLocation, map]);

  return null;
}

const getColorForValue = (value: number, type: 'no2' | 'pm25' | 'o3'): string => {
  const thresholds = {
    no2: [0, 40, 80, 120, 160, 200],
    pm25: [0, 35, 75, 115, 150, 200],
    o3: [0, 50, 100, 130, 160, 200],
  };

  const colors = ['#00e400', '#ffff00', '#ff7e00', '#ff0000', '#8f3f97', '#7e0023'];

  const limits = thresholds[type];
  for (let i = limits.length - 1; i >= 0; i--) {
    if (value >= limits[i]) {
      return colors[i];
    }
  }
  return colors[0];
};

const getRadiusForValue = (value: number, type: 'no2' | 'pm25' | 'o3'): number => {
  const maxValues = { no2: 200, pm25: 200, o3: 200 };
  const normalized = Math.min(value / maxValues[type], 1);
  return 15000 + normalized * 35000;
};

export default function PollutionMap({
  locations,
  currentTimeIndex,
  pollutantType,
  userLocation,
}: PollutionMapProps) {
  const center: LatLngExpression = userLocation
    ? [userLocation.lat, userLocation.lng]
    : [20, 0];

  const markers = useMemo(
    () =>
      locations.map((location) => {
        const value = location.data[pollutantType][currentTimeIndex];
        return {
          ...location,
          value,
          color: getColorForValue(value, pollutantType),
          radius: getRadiusForValue(value, pollutantType),
        };
      }),
    [locations, currentTimeIndex, pollutantType]
  );

  return (
    <MapContainer
      center={center}
      zoom={userLocation ? 10 : 2}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater userLocation={userLocation} />
      {markers.map((marker) => (
        <CircleMarker
          key={marker.id}
          center={[marker.lat, marker.lng]}
          radius={20}
          pathOptions={{
            fillColor: marker.color,
            color: marker.color,
            weight: 2,
            opacity: 0.6,
            fillOpacity: 0.4,
          }}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-bold mb-1">{marker.name}</h3>
              <p>
                {pollutantType.toUpperCase()}: <span className="font-semibold">{marker.value}</span> μg/m³
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
      {userLocation && (
        <CircleMarker
          center={[userLocation.lat, userLocation.lng]}
          radius={8}
          pathOptions={{
            fillColor: '#3b82f6',
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }}
        >
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">Your Location</p>
            </div>
          </Popup>
        </CircleMarker>
      )}
    </MapContainer>
  );
}
