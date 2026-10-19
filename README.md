# AgroCebada ML - Plataforma Predictiva de Rendimiento

Plataforma empresarial de análisis de datos, visualización espacial y predicción de rendimiento para cultivos de cebada. Desarrollada con una arquitectura de microservicios orientada a la agricultura de precisión.

## Arquitectura del Sistema
El sistema implementa una separación estricta para evitar el *data leakage* y permitir la escalabilidad para N parcelas y N ciclos agrícolas:
1. **Frontend (React + Vite + Tailwind v4):** Capa de presentación (SPA). Gestión de estado, visualización geoespacial (Leaflet) y dashboard de métricas.
2. **Backend Core (Node.js + Express):** API Gateway. Valida datos, gestiona la conexión a PostGIS y orquesta las peticiones al motor matemático.
3. **ML Engine (Python + FastAPI):** Microservicio aislado. Encargado del preprocesamiento (pandas/NumPy) y entrenamiento de modelos (scikit-learn, XGBoost, Modelos Autoregresivos).

## Estructura de Datos (Reto 70/30)
- **197 Parcelas Geoespaciales:** Hidalgo, Puebla y Tlaxcala.
- **Entrenamiento (138 parcelas):** Rendimiento observado (t/ha).
- **Predicción (59 parcelas):** Objetivo de inferencia.
- **Variables Integradas:** Climáticas (CHIRPS, CHIRTS-ERA5), Topográficas (CEM) y Satelitales (Sentinel-2, Planet).

## Requisitos Previos
- Node.js v20+
- Python 3.10+
- Docker & Docker Compose (para PostGIS)

## Instrucciones de Ejecución (Desarrollo)
1. **Frontend:** `cd frontend && npm install && npm run dev`
2. **Backend Core:** `cd backend && npm install && npm run dev`
3. **ML Engine:** `cd ml && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python app/api.py`