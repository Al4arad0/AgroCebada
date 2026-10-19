import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Maximize2, Minimize2, Map as MapIcon, TrendingUp, Tractor, Loader2 } from 'lucide-react';
import { useParcelsData } from '../hooks/useParcelsData';
import { InfoTooltip } from '../components/ui/InfoToolTip';

const COLORS = ['#16a34a', '#eab308', '#ef4444'];

interface ChartContainerProps {
  id: string;
  title: string;
  children: React.ReactNode;
  fullScreenChart: string | null;
  setFullScreenChart: (id: string | null) => void;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ id, title, children, fullScreenChart, setFullScreenChart }) => {
  const isFull = fullScreenChart === id;
  return (
    <div className={`${isFull ? 'fixed inset-0 z-50 bg-gray-50 p-8 flex flex-col' : 'bg-white p-5 rounded-xl border border-gray-200 shadow-sm h-96 flex flex-col'} transition-all`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`${isFull ? 'text-2xl' : 'text-lg'} font-bold text-gray-800`}>{title}</h3>
        <button onClick={() => setFullScreenChart(isFull ? null : id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
          {isFull ? <Minimize2 size={isFull ? 24 : 18} /> : <Maximize2 size={18} />}
        </button>
      </div>
      <div className="flex-1 w-full h-full min-h-0">
        {children}
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const [fullScreenChart, setFullScreenChart] = useState<string | null>(null);
  
  // FASE 3/4: Usamos el Hook Maestro en vez de fetch individuales.
  const { parcels, loading, error } = useParcelsData();

  const dashboardStats = useMemo(() => {
    let totalArea = 0;
    let sumObserved = 0;
    let countObserved = 0;
    let sumEstimated = 0;
    let countEstimated = 0;

    const stateAggregation: Record<string, { real: number, estimada: number }> = {};
    const zoneCount = { '0': 0, '1': 0, '2': 0 };

    parcels.forEach((p) => {
      // Si la parcela no tiene área o es inventada/cero, evitamos sumarla
      const currentArea = isNaN(p.area) ? 0 : p.area;
      totalArea += currentArea;

      if (!stateAggregation[p.state]) {
        stateAggregation[p.state] = { real: 0, estimada: 0 };
      }

      // Separación estricta de Observado vs Estimado
      if (p.rendimientoObservado !== null) {
        sumObserved += p.rendimientoObservado;
        countObserved += 1;
        stateAggregation[p.state].real += (p.rendimientoObservado * currentArea);
      } else if (p.mejorEstimacion !== null) {
        sumEstimated += p.mejorEstimacion;
        countEstimated += 1;
        stateAggregation[p.state].estimada += (p.mejorEstimacion * currentArea);
      }

      // Acumulador de Zonas
      const zStr = String(p.zona);
      if (zStr === '0' || zStr === '1' || zStr === '2') {
        zoneCount[zStr as '0'|'1'|'2'] += 1;
      }
    });

    const avgObserved = countObserved > 0 ? (sumObserved / countObserved).toFixed(2) : '0.00';
    const avgEstimated = countEstimated > 0 ? (sumEstimated / countEstimated).toFixed(2) : '0.00';

    const stateDataFormat = Object.keys(stateAggregation).map(state => ({
      name: state,
      produccionReal: Math.round(stateAggregation[state].real),
      produccionEstimada: Math.round(stateAggregation[state].estimada)
    }));

    const zoneDataFormat = [
      { name: 'Zona 0', value: zoneCount['0'] },
      { name: 'Zona 1', value: zoneCount['1'] },
      { name: 'Zona 2', value: zoneCount['2'] },
    ].filter(z => z.value > 0);

    return {
      totalArea: Math.round(totalArea),
      avgObserved,
      avgEstimated,
      totalParcels: parcels.length,
      stateData: stateDataFormat,
      zoneData: zoneDataFormat
    };

  }, [parcels]);

  if (loading) {
    return <div className="flex h-96 items-center justify-center text-green-700"><Loader2 className="animate-spin" size={48} /></div>;
  }

  if (error) {
    return <div className="flex h-96 items-center justify-center text-red-600 font-bold">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Centro de Mando Agrocebada</h1>
        <p className="text-sm text-gray-500">Visión general de la producción y distribución espacial (Ciclo 2025-2026)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-lg text-green-700"><MapIcon size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium flex items-center">
              Hectáreas Totales
              <InfoTooltip title="Área de Siembra" description="Suma de la superficie (en hectáreas) de todos los polígonos satelitales registrados en la base de datos." />
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {dashboardStats.totalArea > 0 ? dashboardStats.totalArea.toLocaleString() : 'Sin datos'}
              {dashboardStats.totalArea > 0 && <span className="text-xs text-gray-400 font-normal ml-1">ha</span>}
            </p>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-700"><TrendingUp size={24} /></div>
          <div className="flex-1">
            <p className="text-sm text-gray-500 font-medium border-b pb-1 mb-1 flex items-center justify-between">
              Rendimiento Promedio
              <InfoTooltip title="Rendimiento (t/ha)" description="Toneladas de cebada producidas por cada hectárea. Un rendimiento superior a 4 t/ha se considera óptimo en zonas altas." />
            </p>
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-green-700 font-bold flex items-center gap-1">
                Obs: {dashboardStats.avgObserved} 
                <InfoTooltip title="Observado a Báscula" description="Rendimiento real medido físicamente al pesar la cosecha de las parcelas de entrenamiento." />
              </span>
              <span className="text-amber-600 font-bold flex items-center gap-1">
                Est: {dashboardStats.avgEstimated}
                <InfoTooltip title="Estimado por IA" description="Rendimiento inferido por el algoritmo Ridge Topo para parcelas que aún no han sido cosechadas." />
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-lg text-amber-700"><Tractor size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium flex items-center">
              Polígonos Evaluados
              <InfoTooltip title="Parcelas Activas" description="Número total de fincas, ranchos o parcelas agrícolas registradas en el sistema para este ciclo de siembra." />
            </p>
            <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalParcels} <span className="text-xs text-gray-400 font-normal">parcelas</span></p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartContainer id="bar" title="Producción Estimada vs Real por Estado (Ton)" fullScreenChart={fullScreenChart} setFullScreenChart={setFullScreenChart}>
          {dashboardStats.stateData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardStats.stateData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="produccionReal" name="Observado a Báscula" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="produccionEstimada" name="Estimación de IA" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">No hay datos de estados registrados</div>
          )}
        </ChartContainer>

        <ChartContainer id="pie" title="Distribución de Parcelas por Cluster Espacial" fullScreenChart={fullScreenChart} setFullScreenChart={setFullScreenChart}>
          {dashboardStats.zoneData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dashboardStats.zoneData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" label={({name, percent}) => `${name} (${((percent||0) * 100).toFixed(0)}%)`}>
                  {dashboardStats.zoneData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">No hay parcelas con zona asignada</div>
          )}
        </ChartContainer>
      </div>
    </div>
  );
};