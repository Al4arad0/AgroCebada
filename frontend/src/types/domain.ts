export interface Parcel {
  id: string;
  name?: string;
  state: string;
  municipality?: string;
  latitude: number;
  longitude: number;
  area?: number;
  areaUnit?: string;
  createdAt: string;
}

export interface CropObservation {
  id: string;
  parcelId: string;
  cycle: string; 
  date: string;
  variables: Record<string, number | null>;
  observedYield?: number | null;
  yieldUnit?: string;
  isValidationSet?: boolean;
}

export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  algorithm: string;
  trainedAt: string;
  featuresUsed: string[];
  metrics: PredictionMetrics;
  status: 'ACTIVE' | 'ARCHIVED' | 'DEMO';
}

export interface PredictionMetrics {
  mae: number;
  rmse: number;
  r2: number;
  mape?: number;
}

export interface YieldPrediction {
  id: string;
  parcelId: string;
  modelId: string;
  modelVersion: string;
  predictionDate: string;
  predictedYield: number;
  unit: string;
  lowerBound?: number;
  upperBound?: number;
  featuresSnapshot: Record<string, number | null>;
  createdAt: string;
}