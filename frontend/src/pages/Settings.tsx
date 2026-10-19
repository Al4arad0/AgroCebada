import React, { useState } from 'react';
import { 
  Settings as Ruler, Sliders, Database, User, 
  Save, ShieldCheck, Loader2 
} from 'lucide-react';

export const Settings: React.FC = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'units' | 'thresholds' | 'variables' | 'profile'>('units');

  // Estados de configuración (En producción esto vendría de una API o Contexto Global)
  const [units, setUnits] = useState({
    yield: 't/ha',
    rainfall: 'mm',
    temperature: '°C',
    area: 'ha'
  });

  const [thresholds, setThresholds] = useState({
    low: 3.0,
    medium: 4.5,
    high: 6.0
  });

  const [variables, setVariables] = useState([
    { id: 'ndvi_avg', name: 'NDVI Promedio', active: true, type: 'Satélite' },
    { id: 'rainfall', name: 'Precipitación Acumulada', active: true, type: 'Clima' },
    { id: 'temp_avg', name: 'Temperatura Promedio', active: true, type: 'Clima' },
    { id: 'water_consumption', name: 'Consumo de Agua', active: false, type: 'Riego' },
  ]);

  const handleSave = () => {
    setIsSaving(true);
    // Simulamos la latencia de guardar en base de datos
    setTimeout(() => {
      setIsSaving(false);
      alert("¡Configuraciones guardadas con éxito!\nEstos parámetros ahora rigen toda la plataforma.");
    }, 1000);
  };

  const toggleVariable = (id: string) => {
    setVariables(variables.map(v => v.id === id ? { ...v, active: !v.active } : v));
  };

  return (
    <div className="space-y-6">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Configuración del Sistema</h1>
          <p className="text-gray-500">Administra unidades, umbrales, catálogo de variables y preferencias de tu cuenta.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-agricola hover:bg-agricola-dark text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          <span>Guardar Cambios</span>
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Menú Lateral de Ajustes */}
        <div className="md:col-span-1 space-y-2">
          <button onClick={() => setActiveTab('units')} className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'units' ? 'bg-green-50 text-green-700 border border-green-200' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}>
            <Ruler size={18} /> Unidades Globales
          </button>
          <button onClick={() => setActiveTab('thresholds')} className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'thresholds' ? 'bg-green-50 text-green-700 border border-green-200' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}>
            <Sliders size={18} /> Umbrales del Mapa
          </button>
          <button onClick={() => setActiveTab('variables')} className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'variables' ? 'bg-green-50 text-green-700 border border-green-200' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}>
            <Database size={18} /> Catálogo de Variables
          </button>
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-3 p-3 rounded-lg font-medium transition-colors ${activeTab === 'profile' ? 'bg-green-50 text-green-700 border border-green-200' : 'text-gray-600 hover:bg-gray-50 border border-transparent'}`}>
            <User size={18} /> Perfil y Roles
          </button>
        </div>

        {/* Panel de Contenido */}
        <div className="md:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px]">
          
          {/* TAB: UNIDADES GLOBALES */}
          {activeTab === 'units' && (
            <div className="p-6 space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-bold text-gray-800">Sistema de Unidades</h2>
                <p className="text-sm text-gray-500">Estas unidades se aplicarán en todos los gráficos, tablas y exportaciones.</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rendimiento (Yield)</label>
                  <select 
                    value={units.yield} 
                    onChange={e => setUnits({...units, yield: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="t/ha">Toneladas por Hectárea (t/ha)</option>
                    <option value="kg/ha">Kilogramos por Hectárea (kg/ha)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precipitación</label>
                  <select 
                    value={units.rainfall} 
                    onChange={e => setUnits({...units, rainfall: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="mm">Milímetros (mm)</option>
                    <option value="in">Pulgadas (in)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temperatura</label>
                  <select 
                    value={units.temperature} 
                    onChange={e => setUnits({...units, temperature: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="°C">Celsius (°C)</option>
                    <option value="°F">Fahrenheit (°F)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Superficie</label>
                  <select 
                    value={units.area} 
                    onChange={e => setUnits({...units, area: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  >
                    <option value="ha">Hectáreas (ha)</option>
                    <option value="acres">Acres</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB: UMBRALES DEL MAPA */}
          {activeTab === 'thresholds' && (
            <div className="p-6 space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-bold text-gray-800">Umbrales de Rendimiento</h2>
                <p className="text-sm text-gray-500">Define los límites (en {units.yield}) para categorizar las parcelas en el mapa y reportes.</p>
              </div>

              <div className="space-y-4 max-w-md">
                <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                  <div>
                    <h4 className="font-bold text-red-800">Rendimiento Bajo</h4>
                    <p className="text-xs text-red-600">Menor a este valor</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={thresholds.low} onChange={e => setThresholds({...thresholds, low: parseFloat(e.target.value)})} className="w-20 p-1 text-right border rounded outline-none"/>
                    <span className="text-sm font-bold text-red-800">{units.yield}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                  <div>
                    <h4 className="font-bold text-yellow-800">Rendimiento Medio</h4>
                    <p className="text-xs text-yellow-600">Entre {thresholds.low} y este valor</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.1" value={thresholds.medium} onChange={e => setThresholds({...thresholds, medium: parseFloat(e.target.value)})} className="w-20 p-1 text-right border rounded outline-none"/>
                    <span className="text-sm font-bold text-yellow-800">{units.yield}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50 rounded-lg">
                  <div>
                    <h4 className="font-bold text-green-800">Rendimiento Alto</h4>
                    <p className="text-xs text-green-600">Mayor a {thresholds.medium}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-green-800">&gt; {thresholds.medium} {units.yield}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CATÁLOGO DE VARIABLES */}
          {activeTab === 'variables' && (
            <div className="p-6 space-y-6">
              <div className="border-b pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Catálogo de Variables</h2>
                  <p className="text-sm text-gray-500">Activa o desactiva variables para el análisis y modelado predictivo.</p>
                </div>
                <button className="text-sm bg-gray-100 text-gray-700 px-3 py-1.5 rounded font-medium hover:bg-gray-200">
                  + Nueva Variable
                </button>
              </div>

              <div className="space-y-3">
                {variables.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div>
                      <h4 className="font-bold text-gray-800 flex items-center gap-2">
                        {v.name} 
                        <span className="text-[10px] uppercase bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{v.type}</span>
                      </h4>
                      <p className="text-xs text-gray-500 font-mono mt-1">ID Interno: {v.id}</p>
                    </div>
                    <button 
                      onClick={() => toggleVariable(v.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${v.active ? 'bg-green-600' : 'bg-gray-300'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${v.active ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: PERFIL Y ROLES */}
          {activeTab === 'profile' && (
            <div className="p-6 space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-lg font-bold text-gray-800">Perfil de Usuario</h2>
                <p className="text-sm text-gray-500">Información de tu cuenta y nivel de acceso en la plataforma.</p>
              </div>

              <div className="flex items-center gap-6 p-6 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="w-20 h-20 bg-green-700 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-inner">
                  AA
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800">Administrador / Analista</h3>
                  <p className="text-gray-500">Puebla, MX</p>
                  
                  <div className="flex gap-2 mt-3">
                    <span className="flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">
                      <ShieldCheck size={14} /> Acceso Total
                    </span>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">
                      Edición de Modelos
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-500 pt-4">
                * Para modificar roles o añadir nuevos analistas al equipo, contacta al administrador del servidor.
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};