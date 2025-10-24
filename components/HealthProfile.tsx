'use client';

import { useState, useEffect } from 'react';

interface HealthProfileProps {
  onProfileComplete: (profile: {
    hasAsthma: boolean;
    hasAllergies: boolean;
    hasSensitivity: boolean;
  }) => void;
  onLocationPermission: (location: { lat: number; lng: number } | null) => void;
}

export default function HealthProfile({
  onProfileComplete,
  onLocationPermission,
}: HealthProfileProps) {
  const [showModal, setShowModal] = useState(false);
  const [hasAsthma, setHasAsthma] = useState(false);
  const [hasAllergies, setHasAllergies] = useState(false);
  const [hasSensitivity, setHasSensitivity] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem('healthProfile');
    if (!savedProfile) {
      setShowModal(true);
    } else {
      const profile = JSON.parse(savedProfile);
      setHasAsthma(profile.hasAsthma);
      setHasAllergies(profile.hasAllergies);
      setHasSensitivity(profile.hasSensitivity);
      onProfileComplete(profile);
    }

    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      onLocationPermission(JSON.parse(savedLocation));
    }
  }, [onProfileComplete, onLocationPermission]);

  const handleLocationRequest = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          localStorage.setItem('userLocation', JSON.stringify(location));
          onLocationPermission(location);
        },
        (error) => {
          console.error('Location error:', error);
          onLocationPermission(null);
        }
      );
    }
  };

  const handleSaveProfile = () => {
    const profile = { hasAsthma, hasAllergies, hasSensitivity };
    localStorage.setItem('healthProfile', JSON.stringify(profile));
    onProfileComplete(profile);
    handleLocationRequest();
    setShowModal(false);
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[2000] p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Welcome to Pollution Health Alert</h2>
        <p className="text-gray-600 mb-4">
          Help us personalize your air quality alerts by sharing your health information.
        </p>

        <div className="space-y-3 mb-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAsthma}
              onChange={(e) => setHasAsthma(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">I have asthma</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasAllergies}
              onChange={(e) => setHasAllergies(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">I have allergies</span>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasSensitivity}
              onChange={(e) => setHasSensitivity(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-gray-700">I have respiratory sensitivity</span>
          </label>
        </div>

        <button
          onClick={handleSaveProfile}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Continue & Enable Location
        </button>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Your data is stored locally and never shared.
        </p>
      </div>
    </div>
  );
}
