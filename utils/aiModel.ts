export interface HealthProfile {
  hasAsthma: boolean;
  hasAllergies: boolean;
  hasSensitivity: boolean;
}

export interface PollutionData {
  no2: number;
  pm25: number;
  o3: number;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export function calculateRiskLevel(
  pollutionData: PollutionData,
  healthProfile: HealthProfile
): RiskLevel {
  let riskScore = 0;

  const no2Risk = pollutionData.no2 / 200;
  const pm25Risk = pollutionData.pm25 / 200;
  const o3Risk = pollutionData.o3 / 200;

  riskScore += no2Risk * 0.3;
  riskScore += pm25Risk * 0.4;
  riskScore += o3Risk * 0.3;

  if (healthProfile.hasAsthma) {
    riskScore *= 1.5;
  }
  if (healthProfile.hasAllergies) {
    riskScore *= 1.3;
  }
  if (healthProfile.hasSensitivity) {
    riskScore *= 1.4;
  }

  if (riskScore > 0.7) return 'high';
  if (riskScore > 0.4) return 'medium';
  return 'low';
}

export function getRecommendations(
  riskLevel: RiskLevel,
  pollutionData: PollutionData,
  healthProfile: HealthProfile
): string[] {
  const recommendations: string[] = [];

  if (riskLevel === 'high') {
    recommendations.push('Stay indoors and keep windows closed');
    recommendations.push('Wear an N95 mask if you must go outside');
    recommendations.push('Avoid outdoor exercise and physical activities');
    
    if (healthProfile.hasAsthma) {
      recommendations.push('Keep your rescue inhaler nearby');
    }
    if (healthProfile.hasAllergies) {
      recommendations.push('Take allergy medication as prescribed');
    }
  } else if (riskLevel === 'medium') {
    recommendations.push('Limit outdoor activities, especially strenuous exercise');
    recommendations.push('Consider wearing a mask in crowded outdoor areas');
    recommendations.push('Monitor your symptoms closely');
    
    if (healthProfile.hasAsthma || healthProfile.hasSensitivity) {
      recommendations.push('Have your medication accessible');
    }
  } else {
    recommendations.push('Air quality is good for outdoor activities');
    recommendations.push('Continue normal outdoor routines');
    
    if (healthProfile.hasAsthma || healthProfile.hasAllergies) {
      recommendations.push('Monitor air quality throughout the day');
    }
  }

  if (pollutionData.pm25 > 100) {
    recommendations.push('Use air purifiers indoors');
  }

  return recommendations;
}

export async function predictFutureRisk(
  currentData: PollutionData,
  historicalData: PollutionData[],
  healthProfile: HealthProfile
): Promise<{ prediction: RiskLevel; confidence: number }> {
  if (typeof window === 'undefined') {
    const fallback = calculateRiskLevel(currentData, healthProfile);
    return Promise.resolve({
      prediction: fallback,
      confidence: 0.6,
    });
  }

  const tf = await import('@tensorflow/tfjs');

  const result = tf.tidy(() => {
    if (historicalData.length < 2) {
      const fallback = calculateRiskLevel(currentData, healthProfile);
      return {
        prediction: fallback,
        confidence: 0.5,
      };
    }

    const avgHistorical = {
      no2: historicalData.reduce((sum, d) => sum + d.no2, 0) / historicalData.length,
      pm25: historicalData.reduce((sum, d) => sum + d.pm25, 0) / historicalData.length,
      o3: historicalData.reduce((sum, d) => sum + d.o3, 0) / historicalData.length,
    };

    const currentTensor = tf.tensor1d([
      currentData.no2 / 200,
      currentData.pm25 / 200,
      currentData.o3 / 200,
    ]);

    const historicalTensor = tf.tensor1d([
      avgHistorical.no2 / 200,
      avgHistorical.pm25 / 200,
      avgHistorical.o3 / 200,
    ]);

    const trendTensor = tf.sub(currentTensor, historicalTensor);
    const trendMagnitude = tf.norm(trendTensor).dataSync()[0];

    const healthFactor = (
      (healthProfile.hasAsthma ? 1.5 : 1.0) *
      (healthProfile.hasAllergies ? 1.3 : 1.0) *
      (healthProfile.hasSensitivity ? 1.4 : 1.0)
    );

    const pollutionWeights = tf.tensor1d([0.3, 0.4, 0.3]);
    const weightedPollution = tf.dot(currentTensor, pollutionWeights).dataSync()[0];

    const riskScore = tf.sigmoid(
      tf.mul(
        tf.add(
          tf.scalar(weightedPollution),
          tf.mul(tf.scalar(trendMagnitude), tf.scalar(0.5))
        ),
        tf.scalar(healthFactor)
      )
    ).dataSync()[0];

    const prediction: RiskLevel = 
      riskScore > 0.7 ? 'high' :
      riskScore > 0.4 ? 'medium' : 'low';

    const baseConfidence = Math.min(0.6 + (historicalData.length * 0.05), 0.95);
    const confidence = baseConfidence * (0.9 + Math.abs(riskScore - 0.5) * 0.2);

    return { prediction, confidence };
  });

  return Promise.resolve(result);
}

export function shouldSendNotification(
  currentRisk: RiskLevel,
  predictedRisk: RiskLevel,
  lastNotificationTime?: number
): boolean {
  const now = Date.now();
  const hourInMs = 60 * 60 * 1000;

  if (lastNotificationTime && now - lastNotificationTime < hourInMs) {
    return false;
  }

  if (currentRisk === 'low' && predictedRisk === 'high') return true;
  if (currentRisk === 'medium' && predictedRisk === 'high') return true;
  if (currentRisk === 'low' && predictedRisk === 'medium') return true;

  return false;
}
