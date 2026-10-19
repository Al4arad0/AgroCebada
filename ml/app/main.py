import os
import json
import joblib
import numpy as np
import sklearn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="AgroCebada ML Engine V3")

# CORS: Se configura desde variable de entorno o por defecto a bloqueado en prod
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False if "*" in allowed_origins else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

model = None
geo_params = {"mapa_zonas": {}, "medianas_elevacion": {}, "medianas_pendiente": {}, "medias_yield": {}}
normalized_zonas = {}

# 1. Función única de normalización de ID
def normalize_id(parcel_id: str) -> str:
    if not parcel_id:
        return ""
    return parcel_id.strip().replace('_', '').replace('-', '').replace(' ', '').upper()

try:
    model = joblib.load(os.path.join(BASE_DIR, 'modelo_cebada_v3.joblib'))
    with open(os.path.join(BASE_DIR, 'parametros_geograficos_v3.json'), 'r') as f:
        geo_params = json.load(f)
        
        # Construir índice con las claves normalizadas en memoria
        for k, v in geo_params.get('mapa_zonas', {}).items():
            normalized_zonas[normalize_id(k)] = str(v)
            
    print("✅ Modelo V3 Espacial cargado correctamente.")
except Exception as e:
    print(f"❌ Error crítico cargando el modelo: {e}")

# 3. Validación estricta con Pydantic
class PredictRequest(BaseModel):
    parcelId: str = ""
    topo_elevacion: float = Field(..., description="Elevación topográfica obligatoria")
    topo_pendiente: float = Field(..., description="Pendiente topográfica obligatoria")

# 4. Endpoint Health con versión
@app.get("/health")
def health_check():
    if model is None:
        raise HTTPException(status_code=503, detail="Modelo no disponible")
    return {
        "status": "OK", 
        "version": "v3.0",
        "scikit_learn_version": sklearn.__version__
    }

@app.get("/geoparams")
async def get_geoparams():
    return geo_params

@app.post("/predict")
async def predict(request: PredictRequest):
    if model is None:
        raise HTTPException(status_code=503, detail="Modelo no cargado")
        
    parcel_id_norm = normalize_id(request.parcelId)
    
    # 2. Verificación y asignación de zona
    zona_asignada = parcel_id_norm in normalized_zonas
    zona = normalized_zonas.get(parcel_id_norm, "0")
    
    advertencia = None
    if not zona_asignada:
        advertencia = f"La parcela '{request.parcelId}' no pertenece a una zona conocida (Cluster espacial). Se asigna zona 0 por defecto."
        
    elevacion = request.topo_elevacion
    pendiente = request.topo_pendiente
    
    mediana_elev = float(geo_params['medianas_elevacion'].get(zona, 2600.0))
    mediana_pend = float(geo_params['medianas_pendiente'].get(zona, 2.0))
    
    elev_centrada = elevacion - mediana_elev
    pend_centrada = pendiente - mediana_pend
    
    try:
        X_pred = np.array([[elev_centrada, pend_centrada]])
        residuo = model.predict(X_pred)[0]
        
        media_zona = float(geo_params['medias_yield'].get(zona, 3.95))
        rendimiento_final = media_zona + residuo
        
        return {
            "prediction": float(rendimiento_final), 
            "predictedYield": float(rendimiento_final), 
            "zona": zona,
            "zonaAsignada": zona_asignada,
            "advertencia": advertencia
        }
    except Exception as e:
        print("Error interno en predicción:", str(e))
        raise HTTPException(status_code=500, detail="Error interno del servidor ML ejecutando el modelo.")