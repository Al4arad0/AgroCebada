export const mockTimeSeriesData = [
  { date: '2025-04-01', ndvi: 0.15, evi: 0.10, precip: 15, tmax: 28, tmin: 12 },
  { date: '2025-05-01', ndvi: 0.25, evi: 0.18, precip: 45, tmax: 29, tmin: 13 },
  { date: '2025-06-01', ndvi: 0.45, evi: 0.35, precip: 110, tmax: 27, tmin: 14 },
  { date: '2025-07-01', ndvi: 0.75, evi: 0.60, precip: 140, tmax: 26, tmin: 13 },
  { date: '2025-08-01', ndvi: 0.85, evi: 0.70, precip: 125, tmax: 26, tmin: 13 },
  { date: '2025-09-01', ndvi: 0.65, evi: 0.50, precip: 80, tmax: 25, tmin: 11 },
  { date: '2025-10-01', ndvi: 0.30, evi: 0.20, precip: 30, tmax: 23, tmin: 9 },
];

export const variablesCatalog = [
  { id: 'ndvi', name: 'NDVI (Sentinel-2)', unit: 'Índice', type: 'Satelital', color: '#16a34a' },
  { id: 'evi', name: 'EVI (Sentinel-2)', unit: 'Índice', type: 'Satelital', color: '#4ade80' },
  { id: 'precip', name: 'Precipitación (CHIRPS)', unit: 'mm', type: 'Climática', color: '#3b82f6' },
  { id: 'tmax', name: 'Temp. Máxima (CHIRTS)', unit: '°C', type: 'Climática', color: '#ef4444' },
];