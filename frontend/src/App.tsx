
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/ui/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Parcels } from './pages/Parcels';
import { Predictions } from './pages/Predictions';
import { Reports } from './pages/Reports';
import { Analysis } from './pages/Analysis';
import { Models } from './pages/Models';
import { Scopes } from './pages/Scopes';
import { Simulator } from './pages/Simulator';

// Fallback 404
const NotFound = () => (
  <div className="flex flex-col items-center justify-center h-[60vh] text-center">
    <h1 className="text-6xl font-bold text-green-800">404</h1>
    <p className="text-gray-500 mt-4 text-lg">Página no encontrada o en construcción.</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="parcels" element={<Parcels />} />
          <Route path="analysis" element={<Analysis/>} />
          <Route path="predictions" element={<Predictions />} />
          <Route path="models" element={<Models />} />
          <Route path="simulator" element={<Simulator />} />
          <Route path="reports" element={<Reports/>} />
          <Route path="scopes" element={<Scopes/>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App; 