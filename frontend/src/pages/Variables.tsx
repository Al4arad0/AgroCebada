import React, { useEffect, useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Loader2 } from 'lucide-react';
import { parcelService } from '../services/api';

const CATALOGO = [
  { key: 'ndvi_avg', code: 'NDVI', name: 'Vegetation Index', source: 'Sentinel-2', unit: 'índice', desc: 'Vigor vegetal verde.', color: '#16a34a' },
  { key: 'planet_ndvi_avg', code: 'NDVI (PRO)', name: 'Planet NDVI', source: 'Planet', unit: 'índice', desc: 'Vigor vegetal alta resolución.', color: '#2563eb' },
  { key: 'evi_avg', code: 'EVI', name: 'Enhanced Veg Index', source: 'Sentinel-2', unit: 'índice', desc: 'Vigor ajustado por suelo.', color: '#059669' },
  { key: 'ndwi_avg', code: 'NDWI', name: 'Water Index', source: 'Sentinel-2', unit: 'índice', desc: 'Humedad de la planta.', color: '#0284c7' },
  { key: 'rainfall', code: 'Precipitación', name: 'CHIRPS', source: 'Clima', unit: 'mm', desc: 'Lluvia acumulada.', color: '#0369a1' },
  { key: 'temp_avg', code: 'Temperatura', name: 'Temperatura Media', source: 'Clima', unit: '°C', desc: 'Temperatura promedio del ciclo.', color: '#e11d48' },
];

export const Variables: React.FC = () => {
  const [parcels, setParcels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKey, setSelectedKey] = useState('ndvi_avg');

  useEffect(() => {
    parcelService.getParcels().then(data => { 
      setParcels(data || []); 
      setLoading(false); 
    });
  }, []);

  const selectedVar = CATALOGO.find(v => v.key === selectedKey)!;

  const chartData = useMemo(() => {
    return parcels.map(p => {
      const vars = p.observations?.[0]?.variables || {};
      return {
        name: p.name, 
        valor: Number(vars[selectedKey] ?? 0),
        ndvi_s2: Number(vars.ndvi_avg ?? 0), 
        ndvi_pro: Number(vars.planet_ndvi_avg ?? 0), 
        precip: Number(vars.rainfall ?? 0)
      };
    }).filter(d => d.valor !== 0); // <-- AQUÍ QUITAMOS EL .slice(0, 50) PARA MOSTRAR TODAS LAS PARCELAS
  }, [parcels, selectedKey]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-green-700" size={40}/>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Diccionario de Variables Satelitales</h1>
        <p className="text-sm text-gray-500">
          Mostrando datos de {chartData.length} parcelas registradas en el sistema.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm h-[400px] overflow-y-auto">
          {CATALOGO.map(v => (
            <button 
              key={v.key} 
              onClick={() => setSelectedKey(v.key)} 
              className={`w-full text-left p-3 mb-2 rounded-lg border ${selectedKey === v.key ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:bg-gray-50'}`}
            >
              <div className="font-bold text-gray-800">{v.code}</div>
              <div className="text-xs text-gray-500">{v.source}</div>
            </button>
          ))}
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border shadow-sm h-[400px]">
            <h2 className="text-xl font-bold text-gray-900">{selectedVar.code} - {selectedVar.name} ({selectedVar.unit})</h2>
            <div className="mt-6 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  {/* minTickGap={20} evita que los nombres en el Eje X se amontonen al tener 197 barras */}
                  <XAxis dataKey="name" tick={{fontSize: 10}} minTickGap={20} />
                  <YAxis tick={{fontSize: 11}} domain={['auto', 'auto']} />
                  <RechartsTooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="valor" fill={selectedVar.color} radius={[2,2,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};