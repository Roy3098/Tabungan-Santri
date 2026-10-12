import React from 'react';
import { ViewType } from '../types';
import { LayoutDashboard, Users, Plus, History, FileSpreadsheet } from 'lucide-react';

interface MobileNavProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentView, onNavigate }) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-nav px-3 py-1.5 flex justify-between items-center z-40 pb-safe shadow-[0_-4px_25px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)] transition-colors">
      {/* Utama */}
      <button
        type="button"
        onClick={() => onNavigate('dashboard')}
        className={`flex flex-col items-center justify-center p-1.5 w-1/5 relative transition-colors cursor-pointer touch-manipulation active:scale-95 ${
          currentView === 'dashboard'
            ? 'text-teal-700 dark:text-teal-400 font-bold'
            : 'text-slate-400 dark:text-slate-500 font-medium'
        }`}
      >
        <div
          className={`absolute -top-1.5 w-8 h-1 rounded-full transition-all ${
            currentView === 'dashboard' ? 'bg-teal-600 dark:bg-teal-400' : 'bg-transparent'
          }`}
        />
        <LayoutDashboard className="w-5 h-5 mb-1" />
        <span className="text-[10px] tracking-tight">Utama</span>
      </button>

      {/* Santri */}
      <button
        type="button"
        onClick={() => onNavigate('santri')}
        className={`flex flex-col items-center justify-center p-1.5 w-1/5 relative transition-colors cursor-pointer touch-manipulation active:scale-95 ${
          currentView === 'santri'
            ? 'text-teal-700 dark:text-teal-400 font-bold'
            : 'text-slate-400 dark:text-slate-500 font-medium'
        }`}
      >
        <div
          className={`absolute -top-1.5 w-8 h-1 rounded-full transition-all ${
            currentView === 'santri' ? 'bg-teal-600 dark:bg-teal-400' : 'bg-transparent'
          }`}
        />
        <Users className="w-5 h-5 mb-1" />
        <span className="text-[10px] tracking-tight">Santri</span>
      </button>

      {/* Floating Center Action Button (Transaksi) */}
      <div className="relative w-1/5 flex justify-center items-center h-full">
        <button
          type="button"
          onClick={() => onNavigate('transaksi')}
          className="absolute -top-6 bg-gradient-to-tr from-teal-700 to-teal-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-teal-700/30 active:scale-95 border-4 border-white dark:border-slate-900 transition-transform cursor-pointer touch-manipulation"
          title="Catat Transaksi"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-5 tracking-tight">
          Catat
        </span>
      </div>

      {/* Riwayat */}
      <button
        type="button"
        onClick={() => onNavigate('riwayat')}
        className={`flex flex-col items-center justify-center p-1.5 w-1/5 relative transition-colors cursor-pointer touch-manipulation active:scale-95 ${
          currentView === 'riwayat'
            ? 'text-teal-700 dark:text-teal-400 font-bold'
            : 'text-slate-400 dark:text-slate-500 font-medium'
        }`}
      >
        <div
          className={`absolute -top-1.5 w-8 h-1 rounded-full transition-all ${
            currentView === 'riwayat' ? 'bg-teal-600 dark:bg-teal-400' : 'bg-transparent'
          }`}
        />
        <History className="w-5 h-5 mb-1" />
        <span className="text-[10px] tracking-tight">Riwayat</span>
      </button>

      {/* Laporan */}
      <button
        type="button"
        onClick={() => onNavigate('laporan')}
        className={`flex flex-col items-center justify-center p-1.5 w-1/5 relative transition-colors cursor-pointer touch-manipulation active:scale-95 ${
          currentView === 'laporan'
            ? 'text-teal-700 dark:text-teal-400 font-bold'
            : 'text-slate-400 dark:text-slate-500 font-medium'
        }`}
      >
        <div
          className={`absolute -top-1.5 w-8 h-1 rounded-full transition-all ${
            currentView === 'laporan' ? 'bg-teal-600 dark:bg-teal-400' : 'bg-transparent'
          }`}
        />
        <FileSpreadsheet className="w-5 h-5 mb-1" />
        <span className="text-[10px] tracking-tight">Laporan</span>
      </button>
    </nav>
  );
};
