import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, CircleMarker, Popup } from 'react-leaflet';
import type { Layer } from 'leaflet';

interface MapViewProps {
  parcels?: any[];
  selectedParcelId?: string | null;
}

const MapUpdater: React.FC<{ selectedId: string | null; geoJsonRef: any; parcels: any[] }> = ({ selectedId, geoJsonRef, parcels }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!selectedId) return;
    const targetId = String(selectedId).trim().replace(/[_-\s]/g, '').toUpperCase();
    let foundLayer: any = null;

    if (geoJsonRef.current && typeof geoJsonRef.current.eachLayer === 'function') {
      geoJsonRef.current.eachLayer((layer: any) => {
        if (typeof geoJsonRef.current.resetStyle === 'function') geoJsonRef.current.resetStyle(layer);
        const rawId = layer.feature?.properties?.ID_POLIGONO || layer.feature?.properties?.ID_POLIGON || layer.feature?.properties?.ID || '';
        if (String(rawId).trim().replace(/[_-\s]/g, '').toUpperCase() === targetId) {
          foundLayer = layer;
        }
      });
    }

    if (foundLayer) {
      foundLayer.setStyle({ color: '#ef4444', fillColor: '#fca5a5', weight: 4, fillOpacity: 0.9 });
      if (foundLayer.bringToFront) foundLayer.bringToFront();
      if (foundLayer.getBounds) map.flyToBounds(foundLayer.getBounds(), { padding: [50, 50], duration: 1.5, maxZoom: 15 });
    } else {
      const manualParcel = parcels.find(p => p && (String(p.name).replace(/[_-\s]/g, '').toUpperCase() === targetId));
      if (manualParcel && manualParcel.latitude && manualParcel.longitude) {
        map.flyTo([manualParcel.latitude, manualParcel.longitude], 14, { duration: 1.5 });
      }
    }
  }, [selectedId, map, geoJsonRef, parcels]);

  return null;
};

export const MapView: React.FC<MapViewProps> = ({ parcels = [], selectedParcelId = null }) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [loadingGeo, setLoadingGeo] = useState<boolean>(true);
  const geoJsonRef = useRef<any>(null);
  const center: [number, number] = [19.5, -98.4];
  
  // Garantizar que siempre sea un array válido
  const safeParcels = Array.isArray(parcels) ? parcels : [];

  useEffect(() => {
    fetch('/parcelas.geojson')
      .then(res => res.ok ? res.json() : null)
      .then(data => { setGeoData(data); setLoadingGeo(false); })
      .catch(() => setLoadingGeo(false));
  }, []);

  const getStyle = (feature: any) => {
    const rawId = feature?.properties?.ID_POLIGONO || feature?.properties?.ID_POLIGON || feature?.properties?.ID || '';
    const cleanId = String(rawId).trim().replace(/[_-\s]/g, '').toUpperCase();
    const dbParcel = safeParcels.find(p => p && String(p.name || '').trim().replace(/[_-\s]/g, '').toUpperCase() === cleanId);
    
    const isPrediction = dbParcel ? dbParcel.conjunto === 'PRED' : String(feature?.properties?.CONJUNTO || '').toUpperCase().includes('PRED');

    return { color: isPrediction ? '#eab308' : '#16a34a', fillColor: isPrediction ? '#fef08a' : '#4ade80', weight: 2, opacity: 1, fillOpacity: 0.6 };
  };

  const onEachFeature = (feature: any, layer: Layer) => {
    try {
      const props = feature?.properties || {};
      const rawId = props.ID_POLIGONO || props.ID_POLIGON || props.ID || 'Desconocido';
      const cleanId = String(rawId).trim().replace(/[_-\s]/g, '').toUpperCase();
      const dbParcel = safeParcels.find(p => p && String(p.name || '').trim().replace(/[_-\s]/g, '').toUpperCase() === cleanId);

      const isPrediction = dbParcel ? dbParcel.conjunto === 'PRED' : String(props.CONJUNTO || '').toUpperCase().includes('PRED');
      const estado = props.Estado || props.ESTADO || dbParcel?.state || 'Hidalgo';
      const municipio = props.Municipio || props.MUNICIPIO || dbParcel?.municipality || '';
      const ubicacion = municipio && municipio !== 'Sin dato' ? `${municipio}, ${estado}` : estado;
      const area = props.área_ha || props.area_ha || props.Area_ha || props.AREA_HA || dbParcel?.area || 0;
      const rendimiento = dbParcel?.rendimientoObservado ?? dbParcel?.mejorEstimacion ?? null;

      // Inyección de HTML segura para el Popup
      const container = document.createElement('div');
      container.className = "text-sm font-sans p-1 space-y-1";
      container.innerHTML = `
        <h4 class="font-bold border-b pb-1 text-gray-800">${rawId}</h4>
        <p><strong>Ubicación:</strong> ${ubicacion}</p>
        <p><strong>Área:</strong> ${Number(area || 0).toFixed(2)} ha</p>
        <p><strong>Conjunto:</strong> ${isPrediction ? 'PREDICCIÓN (30%)' : 'ENTRENAMIENTO (70%)'}</p>
        ${rendimiento !== null ? `<p class="font-semibold mt-1 ${isPrediction ? 'text-blue-700' : 'text-green-700'}">${isPrediction ? 'Estimado:' : 'Real:'} ${rendimiento.toFixed(2)} t/ha</p>` : ''}
      `;
      layer.bindPopup(container);
    } catch (e) {}
  };

  const manualParcels = safeParcels.filter(p => p && !p.hasPolygon && p.latitude && p.longitude);

  return (
    <div className="h-[540px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm z-0 relative bg-gray-50 flex items-center justify-center">
      {loadingGeo && <div className="absolute z-10 text-gray-500 font-medium bg-white/90 px-4 py-2 rounded-lg shadow-sm text-xs">Cargando cartografía satelital...</div>}
      <MapContainer center={center} zoom={9} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
        {geoData && <GeoJSON ref={geoJsonRef} data={geoData} style={getStyle} onEachFeature={onEachFeature} />}
        {manualParcels.map(p => (
          <CircleMarker key={p.id} center={[p.latitude, p.longitude]} radius={8} pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.8 }}>
            <Popup>
              <div className="text-sm p-1">
                <h4 className="font-bold border-b pb-1 text-blue-800">${p.name} (Manual)</h4>
                <p><strong>Ubicación:</strong> ${p.municipality},${p.state}</p>
                <p><strong>Área:</strong> ${p.area} ha</p>
                <p className="text-blue-700 font-semibold mt-1">Estimado en vivo: ${p.mejorEstimacion !== null ? p.mejorEstimacion.toFixed(2) + ' t/ha' : 'Pendiente'}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
        <MapUpdater selectedId={selectedParcelId} geoJsonRef={geoJsonRef} parcels={safeParcels} />
      </MapContainer>
    </div>
  );
};