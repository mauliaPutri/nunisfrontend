// src/app/dashboard/layout.tsx
'use client'
import '../../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Sidebar from '../../components/sidebar';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex items-start justify-between" style={{overflow:"hidden"}}>
      <div className={`fixed transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[80px]' : 'w-[270px]'}`}>
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>
      <main className={`overflow-auto transition-all duration-300 ease-in-out ${isCollapsed ? 'sm:ml-[80px]' : 'sm:ml-[270px]'} w-screen h-screen sm:p-0 ps-4 pe-2`}>
        {children}
      </main>
    </div>
  );
}