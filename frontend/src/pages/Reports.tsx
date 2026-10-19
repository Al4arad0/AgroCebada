import React from 'react';
import { Download, FileText, Map as MapIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { useParcelsData } from '../hooks/useParcelsData';
import { InfoTooltip } from '../components/ui/InfoToolTip';

export const Reports: React.FC = () => {
  const { parcels, loading, error } = useParcelsData();

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportOfficialCSV = () => {
    const officialParcels = parcels.filter(p => p.conjunto === 'PRED' && p.rendimientoOficial !== null);
    let csv = "ID_POLIGONO,RENDIMIENTO_PRED_T_HA\n";
    officialParcels.forEach(p => {
      csv += `${p.name},${p.rendimientoOficial.toFixed(4)}\n`;
    });
    downloadCSV('predicciones_final.csv', csv);
  };

  const exportValidationCSV = () => {
    const trainParcels = parcels.filter(p => p.conjunto === 'ENTR');
    let csv = "ID_POLIGONO,ESTADO,MUNICIPIO,AREA_HA,RENDIMIENTO_OBSERVADO\n";
    trainParcels.forEach(p => {
      csv += `${p.name},${p.state},${p.municipality},${p.area},${p.rendimientoObservado}\n`;
    });
    downloadCSV('validacion_entrenamiento.csv', csv);
  };

  const exportGeoCSV = () => {
    let csv = "ID_POLIGONO,LATITUD,LONGITUD,ELEVACION,PENDIENTE,ZONA\n";
    parcels.forEach(p => {
      csv += `${p.name},${p.latitude},${p.longitude},${p.elevacion},${p.pendiente},${p.zona}\n`;
    });
    downloadCSV('reporte_geografico.csv', csv);
  };

  if (loading) return <div className="flex h-[500px] items-center justify-center text-green-700"><Loader2 className="animate-spin" size={48} /></div>;
  if (error) return <div className="flex h-96 items-center justify-center text-red-600 font-bold">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes y Exportación</h1>
        <p className="text-sm text-gray-500">Descarga los resultados de inferencia y variables espaciales en formato CSV.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center mb-4"><CheckCircle2 size={24} /></div>
            <h3 className="font-bold text-gray-900 flex items-center">
              CSV Oficial del Reto
              <InfoTooltip title="Entregable FIRA" description="Formato estricto para someter a evaluación. Contiene solo las 59 parcelas objetivo con 2 columnas: ID_POLIGONO y RENDIMIENTO_PRED_T_HA." />
            </h3>
            <p className="text-xs text-gray-500 mt-2">Exporta estrictamente las 59 parcelas del conjunto de predicción con sus rendimientos pre-calculados (t/ha).</p>
          </div>
          <button onClick={exportOfficialCSV} className="mt-6 w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg font-bold text-sm transition-colors"><Download size={16} /> Descargar CSV Oficial</button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center mb-4"><FileText size={24} /></div>
            <h3 className="font-bold text-gray-900 flex items-center">
              Validación de Entrenamiento
              <InfoTooltip title="Datos de Calibración" description="Respaldo de las 138 parcelas de la base histórica. Se utiliza para recalibrar el sesgo humano si es necesario." />
            </h3>
            <p className="text-xs text-gray-500 mt-2">Descarga la tabla de las 138 parcelas de entrenamiento junto con sus rendimientos observados reportados.</p>
          </div>
          <button onClick={exportValidationCSV} className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-bold text-sm transition-colors"><Download size={16} /> Descargar Validación</button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center mb-4"><MapIcon size={24} /></div>
            <h3 className="font-bold text-gray-900 flex items-center">
              Reporte Topográfico
              <InfoTooltip title="Modelo Digital de Elevación" description="Matriz geodésica. Exporta las coordenadas X e Y, la elevación y pendiente exacta, y el cluster asignado a cada parcela." />
            </h3>
            <p className="text-xs text-gray-500 mt-2">
              Exporta las variables físicas y los 
              <strong className="mx-1 border-b border-dashed border-gray-400 cursor-help">
                Clusters Agroecológicos
                <InfoTooltip title="Agrupamiento Algorítmico" description="A falta de información de suelo y tipo de semilla, la IA agrupa las parcelas en 3 zonas (0, 1 y 2) basándose en su cercanía geográfica para estimar su rendimiento base." />
              </strong> 
              de toda la base de datos.
            </p>
          </div>
          <button onClick={exportGeoCSV} className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold text-sm transition-colors"><Download size={16} /> Descargar GeoDatos</button>
        </div>
      </div>
    </div>
  );
};