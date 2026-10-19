import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Map as MapIcon, BarChart2, Sliders, BrainCircuit, 
  FileText, Brain, ShieldAlert, Menu, X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Parcelas', icon: <MapIcon size={20} />, path: '/parcels' },
    { name: 'Análisis', icon: <BarChart2 size={20} />, path: '/analysis' },
    { name: 'Predicciones', icon: <BrainCircuit size={20} />, path: '/predictions' },
    { name: 'Modelos y Experimentos', icon: <Brain size={20} />, path: '/models' },
    { name: 'Laboratorio (Simulador)', icon: <Sliders size={20} />, path: '/simulator' },
    { name: 'Reportes', icon: <FileText size={20} />, path: '/reports' },
    { name: 'Alcances y límites', icon: <ShieldAlert size={20} />, path: '/scopes' },
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-green-900 text-white rounded-lg shadow-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-30 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`w-64 h-screen bg-green-900 text-white flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 md:mt-0 mt-14">
          <h1 className="text-2xl font-bold tracking-tight text-yellow-400">AgroCebada</h1>
          <p className="text-xs text-green-400 mt-1">Plataforma de Predicción. Cebadines</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-green-700 text-white font-medium shadow-md' 
                    : 'text-gray-300 hover:bg-green-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-green-800">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center font-bold text-sm">
              AC
            </div>
            <div className="text-sm">
              <p className="font-medium text-white">Cebadines</p>
              <p className="text-xs text-green-400">Puebla, MX</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};