import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Loader2, Database } from 'lucide-react';
import { importService } from '../services/api';

export const Data: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      } else {
        alert('Solo se permiten archivos con extensión .csv');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    try {
      setIsImporting(true);
      const res = await importService.uploadCSV(file);
      alert(`¡Éxito! Archivo procesado en el servidor.\nMensaje: ${res.message || 'Completado'}`);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      console.error(error);
      alert("Hubo un error al procesar el archivo CSV. Revisa el formato y los encabezados.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Datos (Importación de CSV)</h1>
        <p className="text-gray-500">Importa nuevas parcelas y observaciones en lote al sistema.</p>
      </header>

      <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-colors ${
            isDragging ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
          }`}
        >
          <UploadCloud size={48} className={isDragging ? 'text-green-600' : 'text-gray-400'} />
          
          {!file ? (
            <>
              <h3 className="mt-4 text-lg font-semibold text-gray-800">Arrastra tu archivo CSV aquí</h3>
              <p className="text-sm text-gray-500 mt-1 mb-6">Formato único aceptado: .CSV delimitado por comas</p>
              
              <label className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg font-medium cursor-pointer transition-colors">
                Explorar archivos
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv" 
                  onChange={handleFileChange} 
                  ref={fileInputRef}
                />
              </label>
            </>
          ) : (
            <>
              <h3 className="mt-4 text-lg font-semibold text-green-700">Archivo Listo: {file.name}</h3>
              <p className="text-sm text-gray-500 mt-1 mb-6">{(file.size / 1024).toFixed(2)} KB</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors"
                  disabled={isImporting}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleImport}
                  className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  disabled={isImporting}
                >
                  {isImporting && <Loader2 className="animate-spin" size={18} />}
                  {isImporting ? 'Enviando...' : 'Confirmar Importación'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-100 rounded-lg flex gap-3 bg-gray-50">
            <FileSpreadsheet className="text-blue-500 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">Formato Estricto</h4>
              <p className="text-xs text-gray-500">Se requiere que el CSV contenga las cabeceras exactas esperadas por el modelo de base de datos.</p>
            </div>
          </div>
          <div className="p-4 border border-gray-100 rounded-lg flex gap-3 bg-gray-50">
            <Database className="text-purple-500 shrink-0" />
            <div>
              <h4 className="font-semibold text-sm">Validación Directa</h4>
              <p className="text-xs text-gray-500">Al confirmar, el backend procesará y mapeará directamente las columnas. Datos malformados serán rechazados.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};