import type { Parcel, CropObservation } from '../types/domain';

export const mockParcels: Parcel[] = [
  { id: 'AGC_001', state: 'Puebla', latitude: 19.0414, longitude: -98.2063, area: 2.5, areaUnit: 'ha', createdAt: '2025-01-01' },
  { id: 'AGC_002', state: 'Hidalgo', latitude: 20.1011, longitude: -98.7591, area: 3.1, areaUnit: 'ha', createdAt: '2025-01-01' },
  { id: 'AGC_003', state: 'Tlaxcala', latitude: 19.3182, longitude: -98.2375, area: 1.8, areaUnit: 'ha', createdAt: '2025-01-01' },
  { id: 'AGC_139', state: 'Puebla', latitude: 19.1000, longitude: -98.2500, area: 4.0, areaUnit: 'ha', createdAt: '2025-01-01' }, 
];

export const mockObservations: CropObservation[] = [
  { id: 'obs_1', parcelId: 'AGC_001', cycle: '2025', date: '2025-10-31', variables: {}, observedYield: 4.2, yieldUnit: 't/ha', isValidationSet: false },
  { id: 'obs_2', parcelId: 'AGC_002', cycle: '2025', date: '2025-10-31', variables: {}, observedYield: 3.8, yieldUnit: 't/ha', isValidationSet: false },
  { id: 'obs_3', parcelId: 'AGC_003', cycle: '2025', date: '2025-10-31', variables: {}, observedYield: 4.5, yieldUnit: 't/ha', isValidationSet: false },
  { id: 'obs_4', parcelId: 'AGC_139', cycle: '2025', date: '2025-10-31', variables: {}, observedYield: null, yieldUnit: 't/ha', isValidationSet: true }, 
];