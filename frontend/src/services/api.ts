// FASE 3: URL base por variables de entorno para producción
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = 'Error en la petición';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      errorMessage = `Error HTTP: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
  return response.json();
};

export const mlService = {
  async predictYield(payload: { parcelId: string, name: string, topo_elevacion: number, topo_pendiente: number }) {
    const response = await fetch(`${API_BASE_URL}/models/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },
  // FASE 3: Petición indirecta a Python a través del Backend
  async getGeoParams() {
    const response = await fetch(`${API_BASE_URL}/models/geoparams`);
    return handleResponse(response);
  }
};

export const parcelService = {
  async getParcels() {
    const response = await fetch(`${API_BASE_URL}/parcels`);
    return handleResponse(response);
  },
  async createParcel(payload: any) {
    const response = await fetch(`${API_BASE_URL}/parcels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(response);
  },
  async deleteParcel(id: string) {
    const response = await fetch(`${API_BASE_URL}/parcels/${id}`, {
      method: 'DELETE',
    });
    return handleResponse(response);
  }
};

export const importService = {
  async uploadCSV(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/import/csv`, {
      method: 'POST',
      body: formData, 
    });
    return handleResponse(response);
  },
  async loadFinalPredictions() {
    const response = await fetch(`${API_BASE_URL}/import/final-predictions`, {
      method: 'POST',
    });
    return handleResponse(response);
  }
};