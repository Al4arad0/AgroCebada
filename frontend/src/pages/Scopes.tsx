import React from 'react';
import { ShieldAlert, Info, Database, Map as MapIcon } from 'lucide-react';
import { InfoTooltip } from '../components/ui/InfoToolTip';

export const Scopes: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alcances y Limitaciones</h1>
        <p className="text-sm text-gray-500">Documentación técnica, glosario operativo y restricciones del sistema AgroCebada FIRA 2026.</p>
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg shadow-sm">
        <p className="text-sm text-blue-800 font-medium">
          Aviso: El texto de esta sección documenta las restricciones algorítmicas, ambientales y de validación bajo las cuales opera el motor de inteligencia artificial.
        </p>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 text-sm text-gray-700">
        
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 border-b pb-2">
            <Info size={18} className="text-green-600"/> Objetivo y Unidades del Sistema
          </h2>
          <p>
            AgroCebada es una plataforma analítica diseñada para estimar, consultar y visualizar el rendimiento agrícola de parcelas de cebada. 
            Todo el rendimiento dentro del sistema se expresa estrictamente en 
            <strong className="mx-1 border-b border-dashed border-gray-400 cursor-help">
              toneladas por hectárea (t/ha)
              <InfoTooltip title="Rendimiento Relativo" description="Permite comparar parcelas grandes y pequeñas de manera justa. Indica cuántas toneladas de cebada en grano se cosecharon por cada bloque de 10,000 metros cuadrados." />
            </strong>.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 border-b pb-2 mt-6">
            <Database size={18} className="text-blue-600"/> Arquitectura del Modelo Topográfico (V3)
          </h2>
          <p className="mb-2">
            El sistema en producción utiliza un algoritmo 
            <strong className="mx-1 border-b border-dashed border-gray-400 cursor-help">
              Ridge Topo
              <InfoTooltip title="Regresión Ridge" description="Algoritmo lineal que previene el sobreajuste. Analiza cómo la elevación (clima frío) y la pendiente (pérdida de agua) afectan al cultivo, restando el impacto negativo del promedio de la zona." />
            </strong> 
            que opera calculando la media de rendimiento por zona y aplicando una regresión sobre la elevación y la pendiente.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-600 mt-3">
            <li>
              <strong>Carencia de Satélites:</strong> No se utilizan variables climáticas, precipitación ni 
              <span className="mx-1 border-b border-dashed border-gray-400 cursor-help">
                índices espectrales como el NDVI
                <InfoTooltip title="Índice NDVI" description="Índice de Vegetación de Diferencia Normalizada. Los satélites lo usan para ver qué tan verde y sana está la planta absorbiendo luz roja e infrarroja." />
              </span>, debido al fuerte sesgo detectado en las etiquetas de entrenamiento.
            </li>
            <li>
              <strong>Calidad del dato:</strong> El equipo científico detectó que aproximadamente el 
              <span className="mx-1 font-bold text-rose-600">32.6% de los rendimientos fueron "estimados a ojo"</span> 
              (terminando en múltiplos exactos de 0.5 t/ha), lo que descalificó el uso de sensores ópticos.
            </li>
            <li>
              La incertidumbre actual del modelo (evaluada como 
              <span className="mx-1 border-b border-dashed border-gray-400 cursor-help">
                RMSE de referencia
                <InfoTooltip title="Incertidumbre RMSE" description="Error Cuadrático Medio. Indica que las predicciones del sistema tienen un margen de error promedio de aproximadamente ±479 kilogramos por hectárea." />
              </span>
              ) es de <strong>0.4792 t/ha</strong>.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 border-b pb-2 mt-6">
            <ShieldAlert size={18} className="text-amber-600"/> Predicción Oficial vs. En Vivo
          </h2>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-600">
            <li>
              <strong>Predicción Oficial:</strong> Corresponde a los valores calculados internamente para las 59 parcelas del Reto FIRA. Son 
              <span className="mx-1 border-b border-dashed border-gray-400 cursor-help">
                inmutables
                <InfoTooltip title="Inmutabilidad" description="Significa que estos valores ya fueron calculados, sellados y entregados para la competencia. La interfaz no los recalculará." />
              </span> 
              y tienen prioridad absoluta de visualización en todos los reportes.
            </li>
            <li>
              <strong>Estimación En Vivo:</strong> Es el cálculo en tiempo real que el motor de IA ejecuta cuando los usuarios ingresan nuevas parcelas manualmente desde el Directorio Espacial.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2 border-b pb-2 mt-6">
            <MapIcon size={18} className="text-purple-600"/> Registro Manual de Nuevas Parcelas
          </h2>
          <p>El sistema soporta la inserción manual de predios agrícolas con las siguientes limitantes geodésicas:</p>
          <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-600">
            <li>Al no contar con un archivo <code>.geojson</code> que delimite los linderos exactos, estas parcelas se visualizarán en el mapa de calor únicamente como un <strong>marcador de referencia circular</strong> (punto geográfico).</li>
            <li>La zona topográfica <strong>no se asigna dinámicamente por ubicación geográfica</strong>. Las parcelas nuevas cuyo ID no exista en el cluster de entrenamiento caerán en la <em>Zona 0</em> por defecto, recibiendo una estimación indicativa de ±4.49 t/ha.</li>
            <li>Las parcelas agregadas manualmente <strong>no</strong> forman parte del CSV Oficial ni de la evaluación de puntaje del reto.</li>
          </ul>
        </section>

      </div>
    </div>
  );
};