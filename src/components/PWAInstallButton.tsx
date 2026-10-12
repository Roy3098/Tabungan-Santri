import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Download,
  Smartphone,
  X,
  CheckCircle2,
  Share,
  ExternalLink,
  Monitor,
  MoreVertical,
  Sparkles,
} from 'lucide-react';
import { AppLogo } from './AppLogo';

interface PWAInstallButtonProps {
  variant?: 'header' | 'sidebar' | 'banner' | 'settings';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInIframe, swActive, install } =
    usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'android' | 'ios' | 'desktop'>(() => {
    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'desktop';
  });

  // If already running as an installed standalone PWA:
  // - Hide in header/sidebar
  // - Show active status card in settings
  if (isInstalled) {
    if (variant === 'settings') {
      return (
        <div
          className={`p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 flex items-center justify-between gap-3 ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-950">
                Aplikasi PWA Terpasang & Aktif
              </h4>
              <p className="text-xs text-emerald-700 font-medium mt-0.5">
                Anda sedang menggunakan aplikasi dalam mode Standalone (Aplikasi Penuh & Offline Siap).
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-200/80 text-emerald-900 shrink-0">
            Terpasang
          </span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      const result = await install();
      setIsInstalling(false);
      if (result === 'unavailable') {
        setShowInstallModal(true);
      }
    } else {
      if (isIOS) setActiveGuideTab('ios');
      else if (isAndroid) setActiveGuideTab('android');
      else setActiveGuideTab('desktop');
      setShowInstallModal(true);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '/';

  return (
    <>
      {variant === 'header' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${className}`}
          title="Install Aplikasi ke HP / Laptop (PWA)"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {variant === 'sidebar' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-teal-700 to-emerald-700 text-white shadow-md shadow-teal-900/10 hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer text-left ${className}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4 text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate leading-tight">
                {isInstalling ? 'Memasang...' : 'Install Aplikasi'}
              </p>
              <p className="text-[10px] text-teal-100 font-medium truncate">
                {isInstallable ? 'Klik untuk pasang langsung' : 'Pasang di HP / Laptop'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 shrink-0">
            PWA
          </span>
        </button>
      )}

      {variant === 'settings' && (
        <div
          className={`p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-50/90 to-emerald-50/60 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-sm font-black text-slate-900">
                  Pasang Aplikasi Tabungan Santri (PWA)
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                  {swActive ? 'Offline Ready' : 'Siap Pasang'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5 leading-relaxed">
                Gunakan seperti aplikasi native di Android, iPhone, atau komputer tanpa bar browser dan tetap berjalan saat offline.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInstallClick}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-sm active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>{isInstalling ? 'Memproses...' : 'Pasang Sekarang'}</span>
          </button>
        </div>
      )}

      {/* MODAL INSTALASI & PANDUAN PWA */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setShowInstallModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 my-8 text-slate-900 dark:text-slate-100 transition-colors">
            <button
              type="button"
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* App Identity Header */}
            <div className="flex items-center gap-3.5 mb-4">
              <AppLogo size="lg" />
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold mb-1">
                  <Sparkles className="w-3 h-3" /> Progressive Web App
                </div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 leading-tight">
                  Pasang Tabungan Santri
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Akses cepat dari Layar Utama & dukungan Offline
                </p>
              </div>
            </div>

            {/* Direct Install Button if prompt becomes ready */}
            {isInstallable && (
              <div className="mb-4">
                <button
                  type="button"
                  onClick={async () => {
                    setIsInstalling(true);
                    const res = await install();
                    setIsInstalling(false);
                    if (res === 'accepted') setShowInstallModal(false);
                  }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Instal Otomatis Sekarang</span>
                </button>
              </div>
            )}

            {/* If running inside AI Studio preview iframe, explain & offer full tab link */}
            {isInIframe && !isInstallable && (
              <div className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 space-y-2.5">
                <p className="text-xs text-amber-900 dark:text-amber-300 font-bold leading-relaxed">
                  Anda sedang membuka aplikasi di dalam jendela pratinjau (iframe).
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
                  Browser Chrome/Edge/Safari mengharuskan aplikasi dibuka di <strong>Tab Penuh</strong> agar tombol instalasi otomatis muncul.
                </p>
                <a
                  href={currentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka Aplikasi di Tab Baru Lalu Install</span>
                </a>
              </div>
            )}

            {/* Platform Selector Tabs */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 mb-3.5">
              <button
                type="button"
                onClick={() => setActiveGuideTab('android')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  activeGuideTab === 'android'
                    ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-2xs font-black'
                    : 'hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                HP Android
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab('ios')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  activeGuideTab === 'ios'
                    ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-2xs font-black'
                    : 'hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                iPhone / iOS
              </button>
              <button
                type="button"
                onClick={() => setActiveGuideTab('desktop')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                  activeGuideTab === 'desktop'
                    ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-2xs font-black'
                    : 'hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Laptop / PC
              </button>
            </div>

            {/* Platform Specific Steps */}
            {activeGuideTab === 'android' && (
              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    Buka aplikasi ini di browser <strong>Google Chrome</strong> pada HP Android Anda.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    Ketuk ikon menu titik tiga <MoreVertical className="inline w-3.5 h-3.5 text-teal-700 dark:text-teal-400 -mt-0.5" /> di pojok kanan atas Chrome.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    Pilih <strong>"Instal aplikasi"</strong> atau <strong>"Tambahkan ke Layar utama"</strong>.
                  </p>
                </div>
              </div>
            )}

            {activeGuideTab === 'ios' && (
              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    Buka aplikasi ini menggunakan browser <strong>Safari</strong> di iPhone atau iPad.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    Ketuk tombol <strong>Bagikan (Share)</strong> <Share className="inline w-3.5 h-3.5 text-teal-700 dark:text-teal-400 mx-0.5 -mt-0.5" /> di bilah navigasi bawah Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    Gulir ke bawah dan ketuk <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.
                  </p>
                </div>
              </div>
            )}

            {activeGuideTab === 'desktop' && (
              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <p>
                    Buka aplikasi di tab penuh pada browser <strong>Google Chrome</strong> atau <strong>Microsoft Edge</strong>.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <p>
                    Klik ikon <strong>Instal Tabungan Santri</strong> <Monitor className="inline w-3.5 h-3.5 text-teal-700 dark:text-teal-400 mx-0.5 -mt-0.5" /> di sisi kanan bilah alamat URL (address bar).
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <p>
                    Klik tombol <strong>"Instal"</strong> pada dialog yang muncul.
                  </p>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowInstallModal(false)}
              className="mt-5 w-full rounded-2xl bg-slate-900 dark:bg-teal-700 hover:bg-black dark:hover:bg-teal-800 py-3 text-xs font-bold text-white transition-all cursor-pointer"
            >
              Selesai & Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
};
