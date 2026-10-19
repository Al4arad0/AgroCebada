import React, { useState, useMemo } from 'react';
import { BrainCircuit, Loader2, Search, CheckCircle2, Clock, Plus, X, AlertTriangle } from 'lucide-react';
import { parcelService, mlService } from '../services/api';
import { MapView } from '../components/maps/mapView';
import { useParcelsData } from '../hooks/useParcelsData';
import { InfoTooltip } from '../components/ui/InfoToolTip';

export const Parcels: React.FC = () => {
  const { parcels = [], loading, error, reload } = useParcelsData();
  
  const [predicting, setPredicting] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSet, setFilterSet] = useState<'ALL' | 'ENTR' | 'PRED'>('ALL');
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: 'AGC_NUEVO', state: 'Puebla', municipality: 'Chignahuapan',
    latitude: '19.830000', longitude: '-98.030000',
    area: '5.0', topo_elevacion: '2650.0', topo_pendiente: '2.5'
  });

  const safeList = Array.isArray(parcels) ? parcels : [];

  const handleRunPredictions = async () => {
    if (!window.confirm("Se ejecutarán estimaciones en vivo para las parcelas manuales sin resultado oficial. ¿Deseas continuar?")) return;
    
    try {
      setPredicting(true);
      // Solo calcula para las que no son oficiales, no tienen polígono (fueron agregadas a mano) y no tienen rendimiento observado
      const parcelsToPredict = safeList.filter(p => 
        p.rendimientoObservado === null && 
        p.rendimientoOficial === null && 
        p.rendimientoEnVivo === null &&
        !p.hasPolygon 
      );

      if (parcelsToPredict.length === 0) {
        alert("No hay nuevas parcelas manuales para estimar.");
        setPredicting(false);
        return;
      }

      let errors = 0;
      for (const p of parcelsToPredict) {
        try {
          await mlService.predictYield({
            parcelId: p.id,
            name: p.name,
            topo_elevacion: Number(p.elevacion || formData.topo_elevacion),
            topo_pendiente: Number(p.pendiente || formData.topo_pendiente)
          });
        } catch (e) {
          errors++;
        }
      }
      if (errors > 0) alert(`Se encontraron ${errors} errores durante la predicción por lotes.`);
      else alert("Estimaciones en vivo ejecutadas correctamente.");
      
      await reload();
    } catch (error) {
      console.error(error);
    } finally {
      setPredicting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const resp = await parcelService.createParcel(formData);
      setIsModalOpen(false);
      
      if (resp && resp.warning) {
        alert(`Parcial: La parcela se guardó, pero: ${resp.warning}`);
      } else {
        alert("Parcela registrada y predicción ejecutada exitosamente.");
      }
      
      await reload(); 
    } catch (error: any) {
      alert(error.message || "Error de conexión o datos inválidos.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteParcel = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`¿Estás seguro de eliminar la parcela "${name}"? Se borrarán sus datos permanentemente.`)) return;

    try {
      await parcelService.deleteParcel(id);
      await reload();
    } catch (error: any) {
      alert(error.message || "Error al intentar eliminar la parcela.");
    }
  };

  const filteredList = useMemo(() => {
    return safeList.filter(item => {
      const name = String(item?.name || '').toLowerCase();
      const state = String(item?.state || '').toLowerCase();
      const mun = String(item?.municipality || '').toLowerCase();
      const s = search.toLowerCase();

      const matchesSearch = name.includes(s) || state.includes(s) || mun.includes(s);
      if (!matchesSearch) return false;
      if (filterSet === 'ENTR') return item.conjunto === 'ENTR';
      if (filterSet === 'PRED') return item.conjunto === 'PRED';
      return true;
    });
  }, [safeList, search, filterSet]);

  if (loading) return <div className="flex h-[500px] items-center justify-center text-green-700"><Loader2 className="animate-spin" size={48} /></div>;
  if (error) return <div className="flex h-96 items-center justify-center text-red-600 font-bold">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            Directorio Espacial de Parcelas
            <InfoTooltip title="Mapa Interactivo" description="Todos los polígonos agrícolas con su respectiva información geodésica y agronómica." />
          </h1>
          <p className="text-sm text-gray-500">Haz clic en cualquier parcela del listado para localizarla en el mapa ({safeList.length} en total)</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all">
            <Plus size={18} /> <span>Nueva Parcela</span>
          </button>
          <button onClick={handleRunPredictions} disabled={predicting} className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all disabled:opacity-50">
            {predicting ? <Loader2 className="animate-spin" size={18} /> : <BrainCircuit size={18} />}
            <span>{predicting ? 'Calculando...' : 'Estimar Nuevas'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[540px]">
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Listado de Polígonos</h3>
              <span className="text-xs bg-green-50 text-green-800 font-bold px-2.5 py-1 rounded-full">{filteredList.length} mostradas</span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Buscar ID, municipio o estado..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-green-600" />
              </div>
              <select value={filterSet} onChange={e => setFilterSet(e.target.value as any)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50">
                <option value="ALL">Todos ({safeList.length})</option>
                <option value="ENTR">Entrenamiento</option>
                <option value="PRED">Predicción</option>
              </select>
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase border-b border-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2.5">
                    ID / Ubicación
                  </th>
                  <th className="px-2 py-2.5 text-center">
                    Conjunto
                    <InfoTooltip title="Segmentación de Datos" description="ENTR = Entrenamiento (138 parcelas con las que la IA aprendió). PRED = Predicción (59 parcelas ciegas que la IA debe adivinar para el Reto FIRA)." />
                  </th>
                  <th className="px-3 py-2.5 text-right flex items-center justify-end">
                    Rendimiento
                    <InfoTooltip title="t/ha" description="Rendimiento en toneladas por hectárea. Verde = Pesado en báscula. Azul/Morado = Inferencia matemática generada por la IA." />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredList.map(item => (
                  <tr key={item.id} onClick={() => setSelectedParcelId(item.name)}
                    className={`cursor-pointer transition-all border-l-4 ${selectedParcelId === item.name ? 'bg-blue-50/80 border-blue-500' : 'hover:bg-gray-50/80 border-transparent'}`}
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1 " title="Registro Manual sin Polígono">
                        <span className={`font-bold ${selectedParcelId === item.name ? 'text-blue-700' : 'text-gray-900'}`}>{item.name}</span>
                        {!item.hasPolygon && <AlertTriangle size={12} className="text-amber-500"  />}
                      </div>
                      <div className="text-[11px] text-gray-400 truncate max-w-[140px]">{item.municipality !== 'Sin dato' ? `${item.municipality}, ${item.state}` : item.state}</div>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      {item.conjunto === 'PRED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"><Clock size={10} /> PRED</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200"><CheckCircle2 size={10} /> ENTR</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-bold">
                      {item.conjunto === 'ENTR' && item.rendimientoObservado !== null ? (
                        <span className="text-green-700">{item.rendimientoObservado.toFixed(2)}</span>
                      ) : item.rendimientoOficial !== null ? (
                        <div className="flex flex-col items-end">
                           <span className="text-purple-700 bg-purple-50 px-1 py-0.5 rounded border border-purple-200">{item.rendimientoOficial.toFixed(2)}</span>
                           <span className="text-[9px] text-gray-400 font-normal uppercase">Oficial</span>
                        </div>
                      ) : item.rendimientoEnVivo !== null ? (
                        <div className="flex flex-col items-end">
                           <span className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded">{item.rendimientoEnVivo.toFixed(2)}</span>
                           <span className="text-[9px] text-gray-400 font-normal uppercase">En vivo</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 font-normal">Pendiente</span>
                      )}
                      <button onClick={(e) => handleDeleteParcel(item.id, item.name, e)} className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors ml-2" title="Eliminar parcela">🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-7 z-0">
          <MapView parcels={safeList} selectedParcelId={selectedParcelId} />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
              <h2 className="font-bold text-gray-800 text-lg">Registrar Nueva Parcela Manual</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-700 mb-1">ID / Nombre Único</label><input required name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Área (ha)</label><input required type="number" step="0.1" name="area" value={formData.area} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estado</label>
                  <select name="state" value={formData.state} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Puebla">Puebla</option><option value="Hidalgo">Hidalgo</option><option value="Tlaxcala">Tlaxcala</option>
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Municipio</label><input required name="municipality" value={formData.municipality} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Latitud (Y)</label><input required type="number" step="0.000001" name="latitude" value={formData.latitude} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="block text-xs font-bold text-gray-700 mb-1">Longitud (X)</label><input required type="number" step="0.000001" name="longitude" value={formData.longitude} onChange={handleChange} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div className="bg-blue-50 p-3 rounded-lg col-span-2 border border-blue-100 mt-2">
                  <p className="text-xs font-bold text-blue-800 mb-2">Topografía (Modelo V3)</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-xs text-blue-700 mb-1">Elevación (msnm)</label><input required type="number" step="0.1" name="topo_elevacion" value={formData.topo_elevacion} onChange={handleChange} className="w-full border border-blue-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500" /></div>
                    <div><label className="block text-xs text-blue-700 mb-1">Pendiente (°)</label><input required type="number" step="0.1" name="topo_pendiente" value={formData.topo_pendiente} onChange={handleChange} className="w-full border border-blue-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500" /></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Guardar y Predecir'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};