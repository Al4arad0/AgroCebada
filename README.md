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
```env
PORT=3000
DATABASE_URL="postgresql://usuario:password@host.neon.tech/neondb?sslmode=require"
ML_SERVICE_URL="[http://127.0.0.1:8000](http://127.0.0.1:8000)" # En producción: URL de Render de FastAPI
ALLOWED_ORIGINS="http://localhost:5173"
ADMIN_TOKEN="tu_token_super_secreto_123"
OFFICIAL_PREDICTIONS_PATH="./predicciones_final.csv"
NODE_ENV="development"
