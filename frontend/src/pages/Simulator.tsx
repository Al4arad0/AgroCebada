import React, { useState, useMemo } from 'react';
import { Sliders, RefreshCw, Activity, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { InfoTooltip } from '../components/ui/InfoToolTip';

const BASE_GEO_PARAMS = {
  medias_yield: { '0': 4.488966, '1': 3.033333, '2': 3.071429 },
  medianas_elevacion: { '0': 2580.0, '1': 2640.0, '2': 2710.0 },
  medianas_pendiente: { '0': 1.8, '1': 2.3, '2': 3.1 },
  coef_elevacion: -0.00035, 
  coef_pendiente: -0.04200  
};

export const Simulator: React.FC = () => {
  const [selectedZone, setSelectedZone] = useState<'0' | '1' | '2'>('0');
  const [elevacion, setElevacion] = useState<number>(2580);
  const [pendiente, setPendiente] = useState<number>(2.0);
  const [alphaRidge, setAlphaRidge] = useState<number>(100);
  const [biasZona, setBiasZona] = useState<number>(0);

  const simulation = useMemo(() => {
    const medElev = BASE_GEO_PARAMS.medianas_elevacion[selectedZone];
    const medPend = BASE_GEO_PARAMS.medianas_pendiente[selectedZone];
    const mediaYield = BASE_GEO_PARAMS.medias_yield[selectedZone];

    const elevCentrada = elevacion - medElev;
    const pendCentrada = pendiente - medPend;
    const factorRegularizacion = 100 / (100 + alphaRidge * 0.1);
    
    const residuo = (elevCentrada * BASE_GEO_PARAMS.coef_elevacion + pendCentrada * BASE_GEO_PARAMS.coef_pendiente) * factorRegularizacion;
    const yieldFinal = Math.max(0, mediaYield + residuo + biasZona);

    return { mediaZona: mediaYield, elevCentrada, pendCentrada, residuo, yieldFinal };
  }, [selectedZone, elevacion, pendiente, alphaRidge, biasZona]);

  const chartData = [
    { etapa: 'Media Zona', valor: Number(simulation.mediaZona.toFixed(3)) },
    { etapa: 'Efecto Topo', valor: Number(simulation.residuo.toFixed(3)) },
    { etapa: 'Offset Manual', valor: Number(biasZona.toFixed(3)) },
    { etapa: 'Resultado', valor: Number(simulation.yieldFinal.toFixed(3)) }
  ];

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laboratorio de Simulación y Calibración (Ridge V3)</h1>
          <p className="text-sm text-gray-500">
            Modifica parámetros agronómicos y visualiza cómo la IA penaliza o premia el rendimiento.
          </p>
        </div>
        <button 
          onClick={() => { setSelectedZone('0'); setElevacion(2580); setPendiente(2.0); setAlphaRidge(100); setBiasZona(0); }}
          className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <RefreshCw size={16} /> Restaurar
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b pb-3">
            <Sliders size={18} className="text-blue-600" /> Entorno de la Parcela
          </h2>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              Cluster Agroecológico
              <InfoTooltip title="Cluster / Zona" description="La IA agrupa el mapa en 3 zonas. La Zona 0 es la región plana de alto rendimiento, la Zona 2 es la montaña escarpada de bajo rendimiento." />
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['0', '1', '2'] as const).map(z => (
                <button
                  key={z}
                  onClick={() => { setSelectedZone(z); setElevacion(BASE_GEO_PARAMS.medianas_elevacion[z]); setPendiente(BASE_GEO_PARAMS.medianas_pendiente[z]); }}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${selectedZone === z ? 'bg-blue-50 border-blue-600 text-blue-700 ring-2 ring-blue-100' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  Zona {z}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1">
              <span>Elevación <InfoTooltip title="Altitud (msnm)" description="A mayor altitud, las temperaturas nocturnas caen drásticamente. Las heladas en fase de floración de la cebada destruyen el llenado del grano, bajando el rendimiento." /></span>
              <span className="font-mono text-blue-600">{elevacion} msnm</span>
            </div>
            <input type="range" min="2300" max="3000" step="10" value={elevacion} onChange={e => setElevacion(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-bold text-gray-700 mb-1">
              <span>Pendiente <InfoTooltip title="Inclinación (°)" description="Una pendiente empinada provoca escorrentía superficial (el agua de lluvia rueda en lugar de absorberse). La cebada sufre estrés hídrico por falta de retención." /></span>
              <span className="font-mono text-blue-600">{pendiente.toFixed(1)}°</span>
            </div>
            <input type="range" min="0" max="10" step="0.1" value={pendiente} onChange={e => setPendiente(Number(e.target.value))} className="w-full accent-blue-600" />
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-4">
            <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Hiperparámetros de IA</h3>

            <div>
              <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                <span>Regularización $\alpha$ <InfoTooltip title="Parámetro Alpha (Ridge)" description="Fuerza a la IA a ser cautelosa. Si subes este valor, la IA ignorará los efectos de elevación y pendiente y se acercará al promedio de la zona." /></span>
                <span className="font-mono text-gray-900">{alphaRidge}</span>
              </div>
              <input type="range" min="1" max="1000" step="10" value={alphaRidge} onChange={e => setAlphaRidge(Number(e.target.value))} className="w-full accent-purple-600" />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                <span>Offset / Bias <InfoTooltip title="Sesgo de Corrección" description="Permite sumar o restar rendimiento artificialmente para corregir errores detectados por el humano (por ejemplo, sumar 0.45 t/ha a una zona entera)." /></span>
                <span className="font-mono text-gray-900">{biasZona > 0 ? `+${biasZona.toFixed(2)}` : biasZona.toFixed(2)}</span>
              </div>
              <input type="range" min="-1" max="1" step="0.05" value={biasZona} onChange={e => setBiasZona(Number(e.target.value))} className="w-full accent-purple-600" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Promedio Base</p>
              <p className="text-2xl font-bold text-gray-800">{simulation.mediaZona.toFixed(2)} <span className="text-xs font-normal text-gray-400">t/ha</span></p>
              <p className="text-[11px] text-gray-400 mt-1">Anclaje del cluster ({selectedZone})</p>
            </div>
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 font-medium">Impacto Topográfico</p>
              <p className={`text-2xl font-bold ${simulation.residuo >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {simulation.residuo >= 0 ? `+${simulation.residuo.toFixed(3)}` : simulation.residuo.toFixed(3)} 
                <span className="text-xs font-normal text-gray-400 ml-1">t/ha</span>
              </p>
              <p className="text-[11px] text-gray-400 mt-1">Lo que el terreno resta o suma.</p>
            </div>
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200 shadow-sm">
              <p className="text-xs text-blue-800 font-bold">Rendimiento Estimado Final</p>
              <p className="text-3xl font-extrabold text-blue-900">{simulation.yieldFinal.toFixed(2)} <span className="text-xs font-normal text-blue-700">t/ha</span></p>
              <p className="text-[11px] text-blue-700 mt-1 flex items-center gap-1"><CheckCircle2 size={12} /> Cálculo en tiempo real</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity size={16} className="text-blue-600" /> Descomposición Aditiva de la Ecuación Matemática
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="etapa" tick={{ fontSize: 11 }} />
                  <YAxis unit=" t/ha" domain={[0, 6]} />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(3)} t/ha`, 'Cálculo']} />
                  <ReferenceLine y={BASE_GEO_PARAMS.medias_yield[selectedZone]} stroke="#94a3b8" strokeDasharray="3 3" />
                  <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};