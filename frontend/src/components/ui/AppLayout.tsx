import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      {/* md:ml-64 asegura que el margen solo aplique en PC */}
      <main className="flex-1 md:ml-64 p-4 pt-16 md:pt-8 md:p-8 w-full overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};