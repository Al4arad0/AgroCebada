# AgroCebada ML 🌾

AgroCebada ML es una plataforma web integral diseñada para el monitoreo espacial y la predicción algorítmica del rendimiento de cultivos de cebada. El sistema combina análisis geoespacial, clustering agroecológico y un motor de Machine Learning para estimar la producción agrícola (t/ha) basándose en parámetros topográficos.

---

## 🏛️ Arquitectura del Sistema

El proyecto está construido bajo una arquitectura de microservicios orientada a la escalabilidad, dividida en tres módulos principales y una base de datos en la nube:

1. **Frontend (Interfaz de Usuario):** React.js + Vite + TypeScript. Desplegado en **Vercel**.
2. **Backend Core (API Central):** Node.js + Express + Drizzle ORM. Desplegado en **Render**.
3. **ML Engine (Motor de Inteligencia Artificial):** Python + FastAPI + Scikit-Learn. Desplegado en **Render**.
4. **Base de Datos:** PostgreSQL relacional alojada en **Neon Tech**.

---

## ✨ Características Principales

* **Dashboard Analítico:** Visualización en tiempo real de hectáreas totales, polígonos evaluados y rendimiento promedio estimado vs. real mediante gráficas interactivas (Recharts).
* **Directorio Espacial (Mapa Geoespacial):** Representación visual de las parcelas utilizando Leaflet y polígonos GeoJSON.
* **Motor de Inferencia ML (Ridge Topo V3):** Predicción de rendimiento mediante un modelo Ridge Regressor que aplica clustering espacial (Single-Linkage) y ajuste topográfico residual (elevación y pendiente).
* **Laboratorio Interactivo:** Simulador de escenarios predictivos en tiempo real.
* **Importación Automatizada:** Carga e inserción masiva de datos topográficos e históricos a través de archivos CSV con validación de seguridad mediante `ADMIN_TOKEN`.

---

## 🛠️ Stack Tecnológico

**Frontend:**
* React 18 + Vite
* TypeScript
* Tailwind CSS + Lucide React (UI/Iconos)
* React Router DOM
* Leaflet (Mapas espaciales)

**Backend Core:**
* Node.js + Express
* Drizzle ORM (Manejo de base de datos)
* TypeScript
* CSV-Parser + Multer (Manejo de archivos)

**ML Engine:**
* Python 3.10+
* FastAPI + Uvicorn
* Scikit-Learn (Modelado matemático)
* Joblib (Persistencia de modelos)
* Numpy + Pandas

---

## 🚀 Configuración y Despliegue Local

### 1. Variables de Entorno (`.env`)
Debes crear un archivo `.env` en cada módulo correspondiente con la siguiente estructura:

**Backend Core (`backend/.env`):**
`env
PORT=3000
DATABASE_URL="postgresql://usuario:password@host.neon.tech/neondb?sslmode=require"
ML_SERVICE_URL="[http://127.0.0.1:8000](http://127.0.0.1:8000)" # En producción: URL de Render de FastAPI
ALLOWED_ORIGINS="http://localhost:5173"
ADMIN_TOKEN="tu_token_super_secreto_123"
OFFICIAL_PREDICTIONS_PATH="./predicciones_final.csv"
NODE_ENV="development"

**Frontend (`frontend/.env`):**
VITE_API_URL="http://localhost:3000/api" # En producción: URL de Render Node.js

###2. Instalación y Ejecución
**A. Iniciar Base de Datos / Backend:**
cd backend
npm install
npm run dev

**B. Iniciar el Motor de Machine Learning:**
cd ml_engine # O la ruta de tu carpeta de Python
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

**C. Iniciar el Frontend:**
cd frontend
npm install
npm run dev

##📦 Flujo de Carga de Datos (Producción)
Dado que la base de datos de Neon inicia en blanco, el flujo de carga histórica en producción requiere autenticación de administrador:

1. Subir el archivo de parcelas maestro (ID_area_rendimiento...csv) desde la interfaz web o mediante el endpoint /api/import/csv enviando el ADMIN_TOKEN en la cabecera Authorization.

2. Sincronizar las predicciones oficiales disparando un POST al endpoint /api/import/final-predictions (esto leerá los CSV locales alojados en Render y poblará las tablas de observaciones).

##🧠 Documentación de Modelos
El sistema evaluó más de 30 configuraciones con algoritmos como LightGBM, Gaussian Process y Ridge Regressor utilizando datos de telemetría PlanetScope y Sentinel-2.

El modelo ganador implementado en producción (Ridge Topo V3) descartó la telemetría óptica en favor de variables topográficas precisas (elevación y pendiente) combinadas con clustering zonal, previniendo el sobreajuste provocado por los errores de estimación "a ojo" en las mediciones de campo tradicionales. Todo el análisis y las métricas (RMSE, MAE, R²) están documentados visualmente en la pestaña "Modelos y Experimentos" de la plataforma.

Licencia
Desarrollado para el Reto AgroCebada 2025-2026.
