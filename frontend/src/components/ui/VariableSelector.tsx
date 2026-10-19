// frontend/src/components/ui/VariableSelector.tsx
import React from 'react';

// Este componente servirá como placeholder para seleccionar variables predictoras
export const VariableSelector: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
      <h3 className="text-lg font-semibold text-agricola-dark mb-4">Selección de Variables Exógenas</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Climáticas[cite: 1] */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2 border-b pb-1">Climáticas (2022-2025)</h4>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-agricola" disabled /> Precipitación (CHIRPS)</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-agricola" disabled /> Temp. Mínima (CHIRTS)</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-agricola" disabled /> Temp. Máxima (CHIRTS)</label>
          </div>
        </div>

        {/* Topográficas[cite: 1] */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2 border-b pb-1">Topográficas (CEM)</h4>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-agricola" disabled /> Elevación</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="accent-agricola" disabled /> Pendiente</label>
          </div>
        </div>

        {/* Satelitales[cite: 1, 2] */}
        <div>
          <h4 className="text-sm font-medium text-gray-500 mb-2 border-b pb-1">Satelitales (Sentinel/Planet)</h4>
          <div className="space-y-2 text-sm text-gray-400">
            {/* Espacios reservados para el árbol de selección de índices */}
            <p className="italic">Cargando catálogo de índices (NDVI, EVI, LAI, NDWI...)</p>
            <p className="italic text-xs">Agrupación por métrica: media, max, min, std</p>
          </div>
        </div>
      </div>
    </div>
  );
};