import React from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import appLogoImg from '../assets/images/app-logo.svg';

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-1.25rem)] max-w-[440px] pointer-events-none flex flex-col items-center gap-2.5 pt-[env(safe-area-inset-top,0px)]"
    >
      {toasts.map((toast) => {
        let accentBorder = 'border-emerald-500/30';
        let accentGlow = 'bg-emerald-500/20 text-emerald-400';
        let badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        let statusTitle = 'Berhasil';

        if (toast.type === 'error') {
          accentBorder = 'border-rose-500/35';
          accentGlow = 'bg-rose-500/20 text-rose-400';
          badgeBg = 'bg-rose-500/25 text-rose-300 border-rose-500/40';
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
          statusTitle = 'Perhatian / Error';
        } else if (toast.type === 'warning') {
          accentBorder = 'border-amber-500/35';
          accentGlow = 'bg-amber-500/20 text-amber-400';
          badgeBg = 'bg-amber-500/25 text-amber-300 border-amber-500/40';
          icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
          statusTitle = 'Peringatan';
        } else if (toast.type === 'info') {
          accentBorder = 'border-sky-500/35';
          accentGlow = 'bg-sky-500/20 text-sky-400';
          badgeBg = 'bg-sky-500/25 text-sky-300 border-sky-500/40';
          icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;
          statusTitle = 'Info';
        }

        return (
          <div
            key={toast.id}
            role="status"
            className="pointer-events-auto w-full relative overflow-hidden rounded-[26px] bg-slate-950/75 dark:bg-black/80 backdrop-blur-2xl backdrop-saturate-200 border border-white/20 text-white shadow-[0_20px_50px_rgba(0,0,0,0.45)] px-4 py-3.5 transition-all duration-300 animate-in fade-in slide-in-from-top-6 zoom-in-95 group"
          >
            {/* Top specular glossy highlight line for authentic iPhone glass feel */}
            <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

            {/* iOS Dynamic Island / Notification Header */}
            <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10 text-[11px]">
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={appLogoImg}
                  alt="Tabungan Santri"
                  className="w-4 h-4 rounded-md object-contain shrink-0 shadow-xs"
                />
                <span className="font-black tracking-wider uppercase text-white/90 text-[10px]">
                  TABUNGAN SANTRI
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${badgeBg}`}>
                  {statusTitle}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-white/50 font-medium">baru saja</span>
                <button
                  type="button"
                  onClick={() => onDismiss(toast.id)}
                  aria-label="Tutup notifikasi"
                  className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Notification Body */}
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border shadow-inner ${accentGlow} ${accentBorder}`}
              >
                {icon}
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs sm:text-[13px] font-semibold text-white/95 leading-snug break-words">
                  {toast.message}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
