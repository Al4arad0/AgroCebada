import React from 'react';
import { Brain, FileCode, ServerCrash, CheckCircle2, FlaskConical, Microscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { InfoTooltip } from '../components/ui/InfoTooltip';

export const Models: React.FC = () => {
  const mallaResultados = [
    { 
      conjunto: 'F2_pre_ciclo', nombre: 'Satélite + Clima', 
      desc: 'Fusión total: Combina los índices de vegetación satelital durante el crecimiento con las variables climáticas (temperatura y lluvia CHIRPS) de los meses previos a la siembra.',
      modelo: 'Ridge Regressor', rmse: 0.4830, mejora: -0.000891, foldsGanadores: '62.0%', mae: 0.3270, r2: 0.6601, sd: 0.0055
    },
    { 
      conjunto: 'D_planet_s2', nombre: 'Satelital Combinado', 
      desc: 'Fusión óptica: Combina imágenes de resolución media gratuita (Sentinel-2) con imágenes de alta resolución diaria privada (PlanetScope) para monitorear el dosel.',
      modelo: 'Ridge Regressor', rmse: 0.4831, mejora: -0.000996, foldsGanadores: '60.0%', mae: 0.3268, r2: 0.6600, sd: 0.0054
    },
    { 
      conjunto: 'C_s2', nombre: 'Sentinel-2 Puros', 
      desc: 'Telemetría estándar: Uso exclusivo de índices multiespectrales (NDVI, EVI, LAI) extraídos del satélite europeo Sentinel-2 de la ESA.',
      modelo: 'Ridge Regressor', rmse: 0.4838, mejora: -0.001670, foldsGanadores: '62.0%', mae: 0.3285, r2: 0.6592, sd: 0.0065
    },
    { 
      conjunto: 'B_planet', nombre: 'PlanetScope', 
      desc: 'Telemetría de precisión: Uso exclusivo de la constelación de nanosatélites comerciales PlanetScope para capturar micro-cambios diarios en el verdor de la parcela.',
      modelo: 'Gaussian Process', rmse: 0.4844, mejora: -0.002306, foldsGanadores: '20.0%', mae: 0.3280, r2: 0.6577, sd: 0.0077
    },
    { 
      conjunto: 'F1_preciclo', nombre: 'Clima Histórico', 
      desc: 'Datos meteorológicos puros: Lluvia satelital (CHIRPS) y temperaturas acumuladas en la zona antes de que la semilla germine.',
      modelo: 'Gaussian Process', rmse: 0.4849, mejora: -0.002816, foldsGanadores: '36.0%', mae: 0.3364, r2: 0.6585, sd: 0.0114
    },
    { 
      conjunto: 'E_s2_hist', nombre: 'Anomalías Históricas', 
      desc: 'Serie de tiempo: Compara el nivel de verdor del ciclo actual (2025) contra el comportamiento histórico que tuvo la misma parcela en 2022, 2023 y 2024.',
      modelo: 'Ridge Regressor', rmse: 0.4852, mejora: -0.003064, foldsGanadores: '66.0%', mae: 0.3316, r2: 0.6573, sd: 0.0101
    },
    { 
      conjunto: 'C_s2', nombre: 'Sentinel-2 Puros', 
      desc: 'Mismo conjunto de datos ópticos de Sentinel-2, pero evaluado con un modelo de Árboles de Decisión Potenciados (LightGBM) en lugar de una regresión lineal.',
      modelo: 'LightGBM', rmse: 0.4860, mejora: -0.003871, foldsGanadores: '44.0%', mae: 0.3497, r2: 0.6567, sd: 0.0225
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Modelos y Experimentos</h1>
          <p className="text-sm text-gray-500">Documentación de la matriz de selección, desempeño algorítmico y glosario de métricas.</p>
        </div>
        <Link to="/simulator" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
          <FlaskConical size={18} /> Ir al Laboratorio Interactivo
        </Link>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 border-b pb-3 mb-4">
          <Brain size={20} className="text-blue-600"/> Arquitectura Seleccionada: Ridge Topo (V3)
        </h2>
        <div className="space-y-4 text-sm text-gray-700">
          <p>
            Tras evaluar más de 30 configuraciones con validación cruzada, el sistema final utiliza un algoritmo <strong>Ridge Topo</strong>
            <InfoTooltip title="Regresión Ridge" description="Modelo matemático lineal que aplica una penalización (regularización L2) a coeficientes muy grandes. Evita que la IA saque conclusiones extremas de datos atípicos." /> 
            estructurado en dos etapas:
          </p>
          <ul className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Clustering Espacial (Single-Link k=3):</strong> Divide la región en 3 zonas agroecológicas base para definir la expectativa media de rendimiento.
              <InfoTooltip title="Single-Linkage Clustering" description="Agrupa parcelas uniendo a los vecinos más cercanos en cadena. A diferencia de KMeans, permite que las parcelas de los bordes adopten el comportamiento de su vecino más próximo." />
            </li>
            <li>
              <strong>Ajuste Topográfico Residual:</strong> Emplea Regresión Lineal Ridge sobre la elevación y la pendiente.
              <InfoTooltip title="Residual" description="La IA no predice el rendimiento total desde cero; predice cuánto se desvía el rendimiento de la parcela respecto al promedio de su zona." />
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 border-b pb-3 mb-4">
          <ServerCrash size={20} className="text-rose-600"/> ¿Por qué fracasaron la Telemetría y el Machine Learning Complejo?
        </h2>
        <div className="space-y-4 text-sm text-gray-700">
          <p>
            Se procesaron curvas fenológicas, índices hiperespectrales (NDVI, EVI, LAI) extraídos de <strong>Sentinel-2</strong> y anomalías climáticas históricas alimentando modelos como <strong>LightGBM</strong>
            <InfoTooltip title="LightGBM" description="Modelo de IA basado en árboles de decisión estructurados en gradiente. Es muy potente, pero altamente susceptible a encontrar 'falsos patrones' si los datos tienen errores humanos." /> 
            y Procesos Gaussianos.
          </p>
          <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-lg mt-2">
            <p className="text-rose-900">
              <strong>Conclusión Científica:</strong>  En el 32.6% de las parcelas se determinaron rendimientos "estimados a ojo" (múltiplos de 0.5 t/ha, se perciben como valores redondeados y poco precisos). Los satélites miden el vigor vegetal con alta precisión, pero los modelos complejos colapsaron tratando de buscar patrones donde solo existía un error de redondeo humano en la báscula.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
        <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 border-b pb-3 mb-4">
          <Microscope size={20} className="text-emerald-600"/> Resultados Históricos de la Malla de Búsqueda
        </h2>
        <div className="overflow-x-auto pb-6">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] border-b">
              <tr>
                <th className="px-3 py-3">Conjunto de Datos (Dataset)</th>
                <th className="px-3 py-3">Algoritmo</th>
                <th className="px-3 py-3 text-center">
                  RMSE <InfoTooltip title="Root Mean Square Error (RMSE)" description="Mide cuánto se equivoca el modelo en promedio (en t/ha). A menor RMSE, más precisas son las predicciones. Penaliza severamente los errores grandes." />
                </th>
                <th className="px-3 py-3 text-center">
                  MAE <InfoTooltip title="Mean Absolute Error (MAE)" description="Es el error promedio absoluto en t/ha. Si MAE es 0.32, significa que el modelo suele fallar por 320 kg por hectárea." />
                </th>
                <th className="px-3 py-3 text-center">
                  R² <InfoTooltip title="Coeficiente R²" description="Porcentaje de la variabilidad del rendimiento que la IA logra explicar. 1.00 es perfecto. 0.66 significa que explica el 66% de lo que ocurre." />
                </th>
                <th className="px-3 py-3 text-center">Mejora Pareada</th>
                <th className="px-3 py-3 text-center">
                  SD Mejora <InfoTooltip title="Desviación Estándar (SD)" description="Mide qué tan inestable es el modelo. Una desviación alta significa que a veces acierta increíblemente bien y a veces falla catastróficamente." />
                </th>
                <th className="px-3 py-3 text-right">
                  Folds Ganados <InfoTooltip title="Validación Cruzada (Folds)" description="Se dividió el mapa 5 veces en pedazos aleatorios. Este porcentaje indica en cuántas de esas veces la IA superó a un promedio simple de la zona." />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mallaResultados.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-3">
                    <div className="font-medium text-gray-800 flex items-center">
                      {row.conjunto}
                      <InfoTooltip title={row.nombre} description={row.desc} />
                    </div>
                  </td>
                  <td className="px-3 py-3 text-gray-600">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${row.modelo.includes('Ridge') ? 'bg-blue-100 text-blue-700' : row.modelo.includes('Light') ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700'}`}>
                      {row.modelo}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center font-mono text-gray-700">{row.rmse.toFixed(4)}</td>
                  <td className="px-3 py-3 text-center font-mono text-gray-700">{row.mae.toFixed(4)}</td>
                  <td className="px-3 py-3 text-center font-mono text-gray-700">{row.r2.toFixed(4)}</td>
                  <td className={`px-3 py-3 text-center font-mono ${row.mejora >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {row.mejora > 0 ? `+${row.mejora.toFixed(4)}` : row.mejora.toFixed(4)}
                  </td>
                  <td className="px-3 py-3 text-center font-mono text-gray-500">{row.sd.toFixed(4)}</td>
                  <td className="px-3 py-3 text-right text-gray-600 font-bold">{row.foldsGanadores}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};