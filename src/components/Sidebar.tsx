import React from 'react';
import { ViewType, User } from '../types';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Wallet,
  History,
  FileSpreadsheet,
  Settings,
  LogOut,
  UserCircle,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface SidebarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
  lembagaName: string;
  petugasName: string;
  currentUser?: User | null;
  onLogout: () => void;
  hasUnreadTxNotice?: boolean;
  logoUrl?: string;
  isDark?: boolean;
  onToggleDark?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  lembagaName,
  petugasName,
  currentUser,
  onLogout,
  hasUnreadTxNotice,
  logoUrl,
  isDark = false,
  onToggleDark,
}) => {
  const navItems = [
    { id: 'dashboard' as ViewType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'santri' as ViewType, label: 'Data Santri', icon: Users },
    { id: 'kelas' as ViewType, label: 'Kelola Kelas', icon: BookOpen },
    {
      id: 'transaksi' as ViewType,
      label: 'Transaksi',
      icon: Wallet,
      hasBadge: hasUnreadTxNotice,
    },
    { id: 'riwayat' as ViewType, label: 'Riwayat & Koreksi', icon: History },
    { id: 'laporan' as ViewType, label: 'Laporan Saldo', icon: FileSpreadsheet },
    { id: 'pengaturan' as ViewType, label: 'Pengaturan', icon: Settings },
    { id: 'profil' as ViewType, label: 'Profil Petugas', icon: UserCircle },
  ];

  const userInitials = (currentUser?.nama || petugasName || 'Admin')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <aside className="hidden md:flex flex-col w-[280px] h-screen p-4 z-30 shrink-0">
      <div className="bg-white dark:bg-slate-900 rounded-3xl h-full shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden transition-colors">
        {/* Brand Header */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="h-[88px] flex items-center px-6 border-b border-slate-100/80 dark:border-slate-800 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="mr-3.5 shrink-0">
            <AppLogo size="md" logoUrl={logoUrl} />
          </div>
          <div className="overflow-hidden">
            <h2 className="font-black text-lg text-slate-800 dark:text-slate-100 truncate leading-tight tracking-tight">
              Tabungan Santri
            </h2>
            <p className="text-[10px] text-teal-700 dark:text-teal-400 font-bold tracking-widest uppercase mt-0.5 truncate">
              {lembagaName}
            </p>
          </div>
        </div>

        {/* Petugas Badge / Clickable Profile Link */}
        <div className="p-4 border-b border-slate-100/80 dark:border-slate-800">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
              Petugas Aktif
            </span>
            <button
              onClick={() => onNavigate('profil')}
              className="text-[10px] font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
            >
              Edit Profil
            </button>
          </div>
          <button
            onClick={() => onNavigate('profil')}
            className={`w-full flex items-center p-2.5 rounded-2xl transition-all border text-left cursor-pointer group ${
              currentView === 'profil'
                ? 'bg-teal-50/80 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800 shadow-xs'
                : 'bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800 border-slate-100 dark:border-slate-700/60'
            }`}
            title="Buka Halaman Profil & Edit Foto"
          >
            <div className="w-10 h-10 rounded-full overflow-hidden bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs mr-3 border-2 border-white dark:border-slate-700">
              {currentUser?.foto_profil ? (
                <img
                  src={currentUser.foto_profil}
                  alt={currentUser.nama}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{userInitials}</span>
              )}
            </div>
            <div className="overflow-hidden flex-1 min-w-0">
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate group-hover:text-teal-800 dark:group-hover:text-teal-400">
                {currentUser?.nama || petugasName}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block truncate font-medium">
                {currentUser?.jabatan || 'Lihat & Edit Profil'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-teal-600 dark:group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto py-4 px-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-2xl transition-all font-semibold relative text-left cursor-pointer ${
                      isActive
                        ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 font-bold shadow-sm border border-teal-100/60 dark:border-teal-800/60'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 mr-3 shrink-0 transition-colors ${
                        isActive
                          ? 'text-teal-700 dark:text-teal-400'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'
                      }`}
                    />
                    <span className="text-sm truncate">{item.label}</span>
                    {item.hasBadge && (
                      <span className="absolute right-3.5 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            {/* Dark Mode Quick Toggle */}
            {onToggleDark && (
              <button
                type="button"
                onClick={onToggleDark}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl transition-all border text-xs font-bold cursor-pointer bg-slate-50 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="flex items-center gap-2.5">
                  {isDark ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-500" />
                  )}
                  <span>{isDark ? 'Mode Terang' : 'Mode Malam'}</span>
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {isDark ? 'Dark' : 'Light'}
                </span>
              </button>
            )}

            <PWAInstallButton variant="sidebar" />

            <button
              onClick={onLogout}
              className="w-full flex items-center px-4 py-3 rounded-2xl transition-all text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold cursor-pointer text-left"
            >
              <LogOut className="w-5 h-5 mr-3 shrink-0 text-rose-400" />
              <span className="text-sm">Keluar Sistem</span>
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
};
