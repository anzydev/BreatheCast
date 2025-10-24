# Pollution Health Alert Platform

## Overview
A Next.js-based pollution visualization and health alert system optimized for Vercel deployment. The platform provides personalized air quality predictions using client-side TensorFlow.js machine learning, real-time pollution mapping with Leaflet.js, and health-centered recommendations based on user profiles.

**Status**: ✅ Fully functional and deployment-ready  
**Last Updated**: October 5, 2025

## Key Features

### 1. Interactive Pollution Map
- Fullscreen Leaflet.js map with pollution heatmap overlays
- Supports NO2, PM2.5, and O3 pollutant visualization
- Real-time location detection with geolocation API
- Responsive design for mobile and desktop

### 2. Timeline Slider
- Navigate through historical, current, and predicted pollution data
- Dates from Oct 1-7, 2025 (expandable dataset)
- Smooth transitions between time periods

### 3. AI-Powered Predictions
- **TensorFlow.js Integration**: Client-side ML for personalized risk predictions
- **Deterministic Model**: Reliable calculations using tensor operations
- **Risk Calculation Formula**: 
  ```
  riskScore = sigmoid((weightedPollution + trendMagnitude * 0.5) * healthFactor)
  ```
- **Pollution Weights**: NO2 (30%), PM2.5 (40%), O3 (30%)
- **Health Multipliers**: Asthma (1.5x), Allergies (1.3x), Respiratory Sensitivity (1.4x)
- **Dynamic Import**: TensorFlow.js loads only in browser to prevent server-side crashes
- **Memory Management**: tf.tidy() ensures automatic tensor cleanup

### 4. Health Profile System
- User inputs: Asthma, Allergies, Respiratory Sensitivity
- Stored locally in browser (no server storage)
- Privacy-first approach with clear data usage messaging

### 5. Browser Notifications
- Alerts when predicted risk exceeds current risk
- Permission-based using Notifications API
- Intelligent gating to prevent notification spam

### 6. Personalized Recommendations
- Indoor/outdoor activity suggestions based on risk level
- Health-specific advice for users with respiratory conditions
- Real-time updates as pollution levels change

## Technical Architecture

### Tech Stack
- **Framework**: Next.js 15.5.4 with TypeScript
- **Styling**: Tailwind CSS
- **Mapping**: React Leaflet v5
- **AI/ML**: TensorFlow.js (browser-only)
- **Date Handling**: date-fns
- **Deployment**: Vercel-optimized (frontend-only)

### Project Structure
```
pollution-health-app/
├── app/
│   ├── page.tsx                 # Main app component
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
├── components/
│   ├── PollutionMap.tsx        # Leaflet map with heatmap overlay
│   ├── TimelineSlider.tsx      # Date navigation slider
│   ├── HealthProfile.tsx       # User health input modal
│   ├── InfoPanel.tsx           # Risk display & recommendations
│   ├── PollutantSelector.tsx   # Pollutant type switcher
│   └── Legend.tsx              # Map legend component
├── utils/
│   └── aiModel.ts              # TensorFlow.js ML predictions
├── data/
│   └── pollution-data.json     # Sample pollution dataset
├── types/
│   └── index.ts                # TypeScript type definitions
└── next.config.ts              # Next.js configuration
```

### Key Implementation Details

#### TensorFlow.js Setup
- **Dynamic Import**: Prevents server-side execution errors
  ```typescript
  const tf = await import('@tensorflow/tfjs');
  ```
- **Browser-Only Check**: Falls back to basic calculations on server
- **Tensor Operations**: dot, sub, norm, sigmoid, mul, add
- **Risk Levels**: Low (<0.4), Medium (0.4-0.7), High (>0.7)

#### Leaflet Hot Reload Fix
- **React Strict Mode**: Disabled in next.config.ts
- **Reason**: Prevents "map container already initialized" errors during Fast Refresh
- **Impact**: Development-only change, no production effect

#### Notification Logic
- Triggers when `predictedRisk > currentRisk`
- Prevents false alerts during improving conditions
- User must grant permission explicitly

#### Data Flow
1. User selects health profile
2. App requests geolocation
3. Pollution data loads for selected date
4. TensorFlow.js calculates personalized risk
5. Map displays pollution heatmap
6. InfoPanel shows recommendations
7. Notifications trigger on risk increases

## Critical Fixes Applied

### 1. TensorFlow.js Server Crash (Fixed)
- **Problem**: TensorFlow.js loaded on server caused "kernel already registered" errors
- **Solution**: Dynamic import with browser-only execution
- **File**: utils/aiModel.ts

### 2. Random Predictions (Fixed)
- **Problem**: Neural network used random weights, producing meaningless predictions
- **Solution**: Replaced with deterministic tensor calculations
- **Impact**: Predictions now reliable and data-driven

### 3. Notification Bug (Fixed)
- **Problem**: Compared currentRisk vs currentRisk (always false)
- **Solution**: Compare predictedRisk vs currentRisk
- **File**: app/page.tsx

### 4. Leaflet Hot Reload (Fixed)
- **Problem**: Map crashes during development Fast Refresh
- **Solution**: Disabled React Strict Mode
- **File**: next.config.ts

## Development

### Running Locally
```bash
cd pollution-health-app
npm install
npm run dev
```
Server runs on port 5000: http://localhost:5000

### Environment Variables
- `SESSION_SECRET`: Available in environment (for future backend features)

### Build for Production
```bash
npm run build
npm start
```

## Deployment to Vercel

### Configuration
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Framework**: Next.js

### Optimization Features
- Static optimization for performance
- Client-side only architecture (no backend required)
- Automatic code splitting
- Image optimization disabled (no images used)
- Environment variables managed through Vercel dashboard

## Future Enhancements (Optional)

1. **Real API Integration**: Connect to OpenWeatherMap or similar pollution API
2. **Expanded Dataset**: Add more cities and historical data
3. **User Accounts**: Save profiles and preferences (requires backend)
4. **Advanced ML**: Train custom TensorFlow.js model with real data
5. **PWA Support**: Add service worker for offline functionality
6. **Multi-language**: i18n support for global audience

## Known Limitations

1. **Sample Data**: Currently uses static JSON data (Oct 1-7, 2025)
2. **Single Location**: Default to New York City coordinates
3. **Browser-Only ML**: No server-side prediction capability
4. **No Persistence**: User data lost on browser refresh (by design for privacy)

## User Privacy

- All health data stored locally in browser
- No data sent to external servers
- Location data used only for map centering
- Geolocation permission required for location features
- Clear privacy messaging in UI

## Testing Recommendations

1. Test with different health profiles (asthma, allergies, sensitivity)
2. Verify notifications work across browsers (Chrome, Firefox, Safari)
3. Check mobile responsiveness on various screen sizes
4. Validate timeline slider transitions
5. Monitor TensorFlow.js performance on low-end devices

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TensorFlow.js Guide](https://www.tensorflow.org/js)
- [React Leaflet Docs](https://react-leaflet.js.org/)
- [Vercel Deployment](https://vercel.com/docs)
