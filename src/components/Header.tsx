import React from 'react';
import { ViewType, User } from '../types';
import { User as UserIcon, Settings, Sun, Moon } from 'lucide-react';
import { AppLogo } from './AppLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentView: ViewType;
  lembagaName: string;
  onNavigate: (view: ViewType) => void;
  currentUser?: User | null;
  logoUrl?: string;
  isDark?: boolean;
  onToggleDark?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  lembagaName,
  onNavigate,
  currentUser,
  logoUrl,
  isDark = false,
  onToggleDark,
}) => {
  const titles: Record<ViewType, string> = {
    dashboard: 'Dashboard',
    santri: 'Data Santri',
    kelas: 'Kelola Kelas',
    transaksi: 'Catat Transaksi',
    riwayat: 'Riwayat Mutasi',
    laporan: 'Laporan Saldo',
    pengaturan: 'Pengaturan',
    profil: 'Profil Petugas',
  };

  const userInitials = (currentUser?.nama || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <header className="md:hidden sticky top-0 glass z-20 px-3.5 py-2.5 flex justify-between items-center shadow-xs transition-colors">
      <div
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-2 overflow-hidden cursor-pointer min-w-0 mr-1"
      >
        {/* App Logo */}
        <AppLogo size="sm" logoUrl={logoUrl} />
        <div className="overflow-hidden">
          <h1 className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight truncate">
            Tabungan Santri
          </h1>
          <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider truncate max-w-[140px] sm:max-w-[180px]">
            {titles[currentView] || 'Tabungan Santri'} • {lembagaName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <PWAInstallButton variant="header" />

        {/* Dark Mode Toggle Button */}
        {onToggleDark && (
          <button
            type="button"
            onClick={onToggleDark}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border transition-all flex items-center justify-center cursor-pointer bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/70 dark:border-slate-700 text-slate-600 dark:text-amber-400 hover:text-teal-700 dark:hover:text-amber-300 touch-manipulation active:scale-95 shadow-2xs"
            title={isDark ? 'Ganti ke Mode Terang' : 'Ganti ke Mode Malam'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        )}

        <button
          type="button"
          onClick={() => onNavigate('pengaturan')}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border transition-all flex items-center justify-center cursor-pointer touch-manipulation active:scale-95 shadow-2xs ${
            currentView === 'pengaturan'
              ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
              : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/70 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400'
          }`}
          title="Pengaturan Lembaga"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Dedicated Profile Button with Photo/Avatar */}
        <button
          type="button"
          onClick={() => onNavigate('profil')}
          className={`h-9 sm:h-10 px-2 sm:px-2.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer touch-manipulation active:scale-95 shadow-2xs ${
            currentView === 'profil'
              ? 'bg-slate-900 dark:bg-teal-700 text-white border-slate-900 dark:border-teal-700 shadow-xs'
              : 'bg-slate-100/90 dark:bg-slate-800/90 border-slate-200/70 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
          title="Profil & Edit Profil"
        >
          <div className="w-6 h-6 rounded-full overflow-hidden bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
            {currentUser?.foto_profil ? (
              <img
                src={currentUser.foto_profil}
                alt={currentUser.nama}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{userInitials || <UserIcon className="w-3 h-3" />}</span>
            )}
          </div>
          <span className="text-xs font-bold hidden sm:inline truncate max-w-[70px]">
            {currentUser?.nama?.split(' ')[0] || 'Profil'}
          </span>
        </button>
      </div>
    </header>
  );
};
