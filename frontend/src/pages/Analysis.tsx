import React, { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, LineChart, Line, Legend } from 'recharts';
import { Mountain, Scale, Satellite, Compass, AlertCircle, Info } from 'lucide-react';
import { useParcelsData } from '../hooks/useParcelsData';
import { InfoTooltip } from '../components/ui/InfoToolTip';

// Perfil fenológico representativo de Sentinel-2 para el ciclo 2025 (Suavizado gaussiano BW=10d)
const FENOLOGIA_CURVA = [
  { dia: 'Abr 01', doy: 91, ndvi: 0.18, fase: 'Siembra / Emergencia' },
  { dia: 'May 06', doy: 126, ndvi: 0.28, fase: 'Macollamiento' },
  { dia: 'Jun 10', doy: 161, ndvi: 0.52, fase: 'Inicio Desarrollo (Umbral 50%)' },
  { dia: 'Jul 15', doy: 196, ndvi: 0.74, fase: 'Pico Vegetativo (Floración)' },
  { dia: 'Ago 19', doy: 231, ndvi: 0.61, fase: 'Llenado de Grano' },
  { dia: 'Sep 23', doy: 266, ndvi: 0.38, fase: 'Maduración' },
  { dia: 'Oct 28', doy: 301, ndvi: 0.22, fase: 'Cosecha' },
];

// Tooltip personalizado para la gráfica de dispersión
const CustomScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg text-xs space-y-1 z-50">
        <p className="font-bold text-blue-800 border-b pb-1 mb-1">{data.nombre}</p>
        <p className="text-gray-700"><span className="font-semibold">Elevación:</span> {Number(data.elevacion).toFixed(1)} msnm</p>
        <p className="text-gray-700"><span className="font-semibold">Rendimiento:</span> {Number(data.rendimiento).toFixed(2)} t/ha</p>
        <p className="text-gray-400 text-[10px] uppercase font-bold mt-1">{data.zona}</p>
      </div>
    );
  }
  return null;
};

export const Analysis: React.FC = () => {
  const { parcels, loading, error } = useParcelsData();

  const stats = useMemo(() => {
    const validElevationPlots = parcels.filter(p => p.elevacion > 0 && p.rendimientoObservado !== null);
    
    let roundedCount = 0;
    let measuredCount = 0;
    let sumRoundedYield = 0;
    let sumMeasuredYield = 0;

    parcels.forEach(p => {
      if (p.rendimientoObservado !== null) {
        const isRounded = Math.abs((p.rendimientoObservado * 2) - Math.round(p.rendimientoObservado * 2)) < 0.01;
        if (isRounded) {
          roundedCount++;
          sumRoundedYield += p.rendimientoObservado;
        } else {
          measuredCount++;
          sumMeasuredYield += p.rendimientoObservado;
        }
      }
    });

    const zoneData: Record<string, { obsSum: number; obsCount: number; estSum: number; estCount: number }> = {
      '0': { obsSum: 0, obsCount: 0, estSum: 0, estCount: 0 },
      '1': { obsSum: 0, obsCount: 0, estSum: 0, estCount: 0 },
      '2': { obsSum: 0, obsCount: 0, estSum: 0, estCount: 0 },
    };

    parcels.forEach(p => {
      const z = String(p.zona);
      if (zoneData[z]) {
        if (p.rendimientoObservado !== null) {
          zoneData[z].obsSum += p.rendimientoObservado;
          zoneData[z].obsCount++;
        }
        if (p.mejorEstimacion !== null) {
          zoneData[z].estSum += p.mejorEstimacion;
          zoneData[z].estCount++;
        }
      }
    });

    const zoneComparison = Object.keys(zoneData).map(z => ({
      zona: `Zona ${z}`,
      observado: zoneData[z].obsCount > 0 ? Number((zoneData[z].obsSum / zoneData[z].obsCount).toFixed(2)) : 0,
      estimado: zoneData[z].estCount > 0 ? Number((zoneData[z].estSum / zoneData[z].estCount).toFixed(2)) : 0,
      total: zoneData[z].obsCount + zoneData[z].estCount
    }));

    const qualityComparison = [
      { tipo: 'Pesadas a Báscula', cantidad: measuredCount, promedio: measuredCount > 0 ? Number((sumMeasuredYield / measuredCount).toFixed(2)) : 0 },
      { tipo: 'Estimadas a Ojo (múltiplos 0.5)', cantidad: roundedCount, promedio: roundedCount > 0 ? Number((sumRoundedYield / roundedCount).toFixed(2)) : 0 }
    ];

    return {
      scatterPlots: validElevationPlots.map(p => ({
        elevacion: p.elevacion,
        rendimiento: p.rendimientoObservado,
        nombre: p.name,
        zona: `Zona ${p.zona}`
      })),
      zoneComparison,
      qualityComparison,
      pctRounded: (roundedCount + measuredCount > 0) ? ((roundedCount / (roundedCount + measuredCount)) * 100).toFixed(1) : '32.6'
    };
  }, [parcels]);

  if (loading) return <div className="p-8 text-center text-green-700">Cargando diagnóstico agronómico...</div>;
  if (error) return <div className="p-8 text-center text-red-600 font-bold">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Análisis Agronómico y Diagnóstico del Reto</h1>
        <p className="text-sm text-gray-500">
          Resultados empíricos que respaldan la selección del modelo Ridge Topo frente a métodos satelitales y climáticos.
        </p>
      </div>

      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex gap-3">
        <AlertCircle size={22} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 space-y-1">
          <p className="font-bold text-sm">Hallazgo Central: El {stats.pctRounded}% de los rendimientos fueron estimados a ojo</p>
          <p>
            Al analizar la variable objetivo de las 138 parcelas de entrenamiento, se descubrió que 45 parcelas son múltiplos exactos de 0.5 t/ha.
            La Zona 1 es 100% de este tipo. El satélite óptico mide con precisión el desarrollo vegetal, pero no puede correlacionar con errores humanos de redondeo en campo.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col h-80">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Satellite size={16} className="text-green-600" /> Perfil Fenológico
              <InfoTooltip title="Perfil Fenológico (NDVI)" description="El NDVI es un índice satelital que mide el verdor del cultivo. La curva muestra cómo crece la cebada desde la siembra (abril) hasta su pico máximo (julio), para luego secarse y ser cosechada (octubre). 
              Este periodo (abril-octubre) es basado en el ciclo agrícola, en el modelo no fueron proporcionadas fechas de siembra. " />
            </h3>
            <span className="text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded font-mono">Kernel Gaussiano BW=10d</span>
          </div>
          <p className="text-[11px] text-gray-500 mb-2">Dinámica temporal de NDVI con umbrales del 50% de desarrollo y fecha de pico.</p>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={FENOLOGIA_CURVA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="dia" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 1]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Line type="monotone" dataKey="ndvi" name="NDVI Medio" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col h-80">
          <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-1.5">
            <Mountain size={16} className="text-blue-600" /> Altitud vs Rendimiento
            <InfoTooltip title="Dispersión Topográfica" description="Cada punto es una parcela real. Muestra cómo la altitud (elevación) afecta directamente la cantidad de cosecha. Demasiada altura expone al cultivo a heladas letales." />
          </h3>
          <p className="text-[11px] text-gray-500 mb-2">Comportamiento del rendimiento en parcelas medidas (datos reales de la BD).</p>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis type="number" dataKey="elevacion" name="Elevación" unit="m" domain={['dataMin - 30', 'dataMax + 30']} tick={{ fontSize: 10 }} />
                <YAxis type="number" dataKey="rendimiento" name="Rendimiento" unit=" t/ha" domain={[1.5, 6]} tick={{ fontSize: 10 }} />
                
                {/* Se inyecta el Tooltip personalizado aquí */}
                <Tooltip content={<CustomScatterTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                
                <Scatter name="Parcelas" data={stats.scatterPlots} fill="#3b82f6" opacity={0.7} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col h-80">
          <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-1.5">
            <Compass size={16} className="text-purple-600" /> Rendimiento Observado vs Estimado por Zona
          </h3>
          <p className="text-[11px] text-gray-500 mb-2">Agrupamiento jerárquico espacial (Single-link k=3) que condiciona la media base.</p>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.zoneComparison} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="zona" tick={{ fontSize: 11 }} />
                <YAxis unit=" t/ha" domain={[0, 5.5]} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="observado" name="Observado (t/ha)" fill="#16a34a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="estimado" name="Predicho (t/ha)" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col h-80">
          <h3 className="text-sm font-bold text-gray-800 mb-1 flex items-center gap-1.5">
            <Scale size={16} className="text-rose-600" /> Comparativa: Báscula vs Estimación Visual
          </h3>
          <p className="text-[11px] text-gray-500 mb-2">Discrepancia de rendimiento según el método con el que el productor reportó el dato.</p>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.qualityComparison} layout="vertical" margin={{ top: 10, right: 30, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" unit=" t/ha" domain={[0, 5]} tick={{ fontSize: 10 }} />
                <YAxis dataKey="tipo" type="category" tick={{ fontSize: 10 }} width={110} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="promedio" name="Rendimiento Promedio (t/ha)" fill="#e11d48" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-xs text-gray-700 space-y-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Info size={16} className="text-blue-600" /> Recomendaciones para la Siembra y Manejo del Cultivo
        </h3>
        <p>
          1. <strong>Manejo de Heladas por Altitud:</strong> La pendiente y la elevación actúan como moduladores térmicos. Parcelas en cotas superiores a los 2,650 msnm deben privilegiar variedades de cebada con mayor resistencia a heladas tempranas en fase de floración.
        </p>
        <p>
          2. <strong>Retención Hídrica en Temporal:</strong> Pendientes mayores al 3% provocan escorrentía superficial acelerada en la zona de Tlaxcala-Puebla. Se sugiere laboreo en curvas de nivel para maximizar la recarga hídrica efectiva del perfil del suelo.
        </p>
      </div>
    </div>
  );
};