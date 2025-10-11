'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import pollutionData from '@/data/pollution-data.json';
import HealthProfile from '@/components/HealthProfile';
import TimelineSlider from '@/components/TimelineSlider';
import InfoPanel from '@/components/InfoPanel';
import PollutantSelector from '@/components/PollutantSelector';
import Legend from '@/components/Legend';
import {
  calculateRiskLevel,
  getRecommendations,
  shouldSendNotification,
  predictFutureRisk,
  type HealthProfile as HealthProfileType,
  type RiskLevel,
} from '@/utils/aiModel';

const PollutionMap = dynamic(() => import('@/components/PollutionMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">Loading map...</p>
    </div>
  ),
});

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(4);
  const [pollutantType, setPollutantType] = useState<'no2' | 'pm25' | 'o3'>('pm25');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [healthProfile, setHealthProfile] = useState<HealthProfileType | null>(null);
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('low');
  const [predictedRisk, setPredictedRisk] = useState<RiskLevel>('low');
  const [predictionConfidence, setPredictionConfidence] = useState<number>(0);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [nearestLocation, setNearestLocation] = useState<typeof pollutionData.locations[0] | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (userLocation && healthProfile) {
      let nearest = pollutionData.locations[0];
      let minDistance = Infinity;

      pollutionData.locations.forEach((location) => {
        const distance = Math.sqrt(
          Math.pow(location.lat - userLocation.lat, 2) +
          Math.pow(location.lng - userLocation.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearest = location;
        }
      });

      setNearestLocation(nearest);

      const pollutionValues = {
        no2: nearest.data.no2[currentTimeIndex],
        pm25: nearest.data.pm25[currentTimeIndex],
        o3: nearest.data.o3[currentTimeIndex],
      };

      const risk = calculateRiskLevel(pollutionValues, healthProfile);
      const recs = getRecommendations(risk, pollutionValues, healthProfile);

      setRiskLevel(risk);
      setRecommendations(recs);

      const historicalData = [];
      for (let i = Math.max(0, currentTimeIndex - 3); i < currentTimeIndex; i++) {
        historicalData.push({
          no2: nearest.data.no2[i],
          pm25: nearest.data.pm25[i],
          o3: nearest.data.o3[i],
        });
      }

      predictFutureRisk(pollutionValues, historicalData, healthProfile).then(
        ({ prediction, confidence }) => {
          setPredictedRisk(prediction);
          setPredictionConfidence(confidence);

          const lastNotification = localStorage.getItem('lastNotificationTime');
          const lastTime = lastNotification ? parseInt(lastNotification) : undefined;

          if (shouldSendNotification(risk, prediction, lastTime)) {
            if (Notification.permission === 'granted') {
              new Notification('Air Quality Alert', {
                body: `${prediction.toUpperCase()} pollution risk predicted in your area. Check recommendations.`,
                icon: '/favicon.ico',
              });
              localStorage.setItem('lastNotificationTime', Date.now().toString());
            }
          }
        }
      );
    }
  }, [userLocation, healthProfile, currentTimeIndex]);

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <HealthProfile
        onProfileComplete={setHealthProfile}
        onLocationPermission={setUserLocation}
      />

      <PollutionMap
        locations={pollutionData.locations}
        currentTimeIndex={currentTimeIndex}
        pollutantType={pollutantType}
        userLocation={userLocation || undefined}
      />

      <PollutantSelector
        selected={pollutantType}
        onChange={setPollutantType}
      />

      <Legend />

      {healthProfile && nearestLocation && (
        <InfoPanel
          riskLevel={riskLevel}
          predictedRisk={predictedRisk}
          predictionConfidence={predictionConfidence}
          recommendations={recommendations}
          locationName={nearestLocation.name}
          pollutantValue={nearestLocation.data[pollutantType][currentTimeIndex]}
          pollutantType={pollutantType}
        />
      )}

      <TimelineSlider
        timestamps={pollutionData.timestamps}
        currentIndex={currentTimeIndex}
        onChange={setCurrentTimeIndex}
      />
    </div>
  );
}
