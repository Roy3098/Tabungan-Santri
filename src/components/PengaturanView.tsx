import React, { useState, useRef } from 'react';
import { AppSettings, AppData, User } from '../types';
import { defaultAppData } from '../data/initialData';
import {
  Save,
  LogOut,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Info,
  ImageIcon,
  Camera,
  ChevronRight,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { AppLogo } from './AppLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { compressImageFile } from '../utils/imageCompressor';

interface PengaturanViewProps {
  settings: AppSettings;
  fullData: AppData;
  currentUser?: User | null;
  onNavigateToProfil: () => void;
  onSaveSettings: (settings: AppSettings) => void;
  onRestoreData: (data: AppData) => void;
  onResetAllData: () => void;
  onLogout: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  theme?: 'light' | 'dark' | 'system';
  onSetTheme?: (theme: 'light' | 'dark' | 'system') => void;
  isDark?: boolean;
  onToggleDark?: () => void;
}

export const PengaturanView: React.FC<PengaturanViewProps> = ({
  settings,
  fullData,
  currentUser,
  onNavigateToProfil,
  onSaveSettings,
  onRestoreData,
  onResetAllData,
  onLogout,
  showToast,
  theme = 'system',
  onSetTheme,
  isDark = false,
  onToggleDark,
}) => {
  const [lembaga, setLembaga] = useState(settings.lembaga);
  const [petugas, setPetugas] = useState(settings.petugas);
  const [logo, setLogo] = useState<string>(
    settings.logo || localStorage.getItem('app_custom_logo') || ''
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Security code challenge modal for reset
  const [showResetModal, setShowResetModal] = useState(false);
  const [challengeCode, setChallengeCode] = useState('');
  const [userEnteredCode, setUserEnteredCode] = useState('');

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lembaga.trim() || !petugas.trim()) {
      showToast('Nama lembaga dan petugas tidak boleh kosong.', 'warning');
      return;
    }

    onSaveSettings({
      lembaga: lembaga.trim(),
      petugas: petugas.trim(),
      logo: logo.trim(),
    });
    showToast('Pengaturan lembaga berhasil diperbarui!', 'success');
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Format berkas harus berupa gambar (PNG, JPG, SVG, WebP).', 'error');
      return;
    }

    try {
      showToast('Memproses dan mengoptimalkan gambar logo...', 'info');
      // Compress and resize image so it never exceeds Firestore document limits
      const compressedBase64 = await compressImageFile(file, 512, 0.85);

      if (compressedBase64.length > 450_000) {
        showToast('Ukuran gambar terlalu besar. Gunakan gambar beresolusi lebih kecil.', 'error');
        return;
      }

      setLogo(compressedBase64);
      localStorage.setItem('app_custom_logo', compressedBase64);

      // Auto save to database
      onSaveSettings({
        lembaga,
        petugas,
        logo: compressedBase64,
      });

      showToast('Logo kustom berhasil disimpan ke database!', 'success');
    } catch (err) {
      console.error('Error processing logo image', err);
      showToast('Gagal memproses gambar logo. Coba berkas gambar lain.', 'error');
    }
  };

  const handleResetLogo = () => {
    setLogo('');
    localStorage.removeItem('app_custom_logo');
    onSaveSettings({
      lembaga,
      petugas,
      logo: '',
    });
    showToast('Logo dikembalikan ke desain bawaan aplikasi.', 'info');
  };

  const handleExportBackup = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      const dateStr = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute('download', `backup_tabungan_santri_${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showToast('Cadangan berkas data berhasil diunduh.', 'success');
    } catch (e) {
      showToast('Gagal membuat berkas cadangan data.', 'error');
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.santri && parsed.transaksi && parsed.settings) {
          if (!parsed.kelas || !Array.isArray(parsed.kelas)) {
            parsed.kelas = defaultAppData.kelas;
          }
          onRestoreData(parsed);
          setLembaga(parsed.settings.lembaga || defaultAppData.settings.lembaga);
          setPetugas(parsed.settings.petugas || defaultAppData.settings.petugas);
          setLogo(parsed.settings.logo || '');
          showToast('Data berhasil dipulihkan dari berkas cadangan!', 'success');
        } else {
          showToast('Format berkas cadangan tidak valid!', 'error');
        }
      } catch (err) {
        showToast('Gagal membaca berkas cadangan. Pastikan berkas berformat JSON valid.', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const openResetChallenge = () => {
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setChallengeCode(randomCode);
    setUserEnteredCode('');
    setShowResetModal(true);
  };

  const handleConfirmReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (userEnteredCode.trim() === challengeCode) {
      onResetAllData();
      setShowResetModal(false);
      showToast('Seluruh data santri dan transaksi telah berhasil dikosongkan.', 'info');
    } else {
      showToast('Kode konfirmasi salah! Tindakan penghapusan dibatalkan demi keamanan.', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          Pengaturan Sistem
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm mt-0.5">
          Sesuaikan identitas lembaga, logo resmi, tema mode malam, PWA, dan cadangan data.
        </p>
      </div>

      {/* Profil Petugas Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-teal-800 to-emerald-800 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/20 border-2 border-white/40 flex items-center justify-center font-black text-xl shrink-0 shadow-sm">
            {currentUser?.foto_profil ? (
              <img
                src={currentUser.foto_profil}
                alt={currentUser.nama}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {(currentUser?.nama || petugas || 'Admin')
                  .split(' ')
                  .slice(0, 2)
                  .map((w) => w[0].toUpperCase())
                  .join('')}
              </span>
            )}
          </div>
          <div>
            <div className="inline-block px-2 py-0.5 rounded-full bg-teal-500/30 text-teal-200 text-[10px] font-bold uppercase tracking-wider mb-1">
              Akun Petugas Aktif
            </div>
            <h3 className="text-lg font-black tracking-tight leading-tight">
              {currentUser?.nama || petugas}
            </h3>
            <p className="text-xs text-teal-200/90 font-medium">
              {currentUser?.jabatan || 'Pengurus & Bendahara'} • {currentUser?.email || 'admin@tahfidz.com'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onNavigateToProfil}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white hover:bg-teal-50 text-teal-900 font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Camera className="w-4 h-4 text-teal-700" />
          <span>Lihat & Ubah Foto Profil</span>
          <ChevronRight className="w-4 h-4 text-teal-700" />
        </button>
      </div>

      {/* TEMA TAMPILAN (MODE MALAM / MODE GELAP) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-5 sm:p-6 transition-colors">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>Tema Tampilan & Mode Malam</span>
              {isDark ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Mode Malam Aktif
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Mode Terang Aktif
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Pilih tampilan terang, gelap/malam untuk kenyamanan mata, atau ikuti pengaturan perangkat Anda.
            </p>
          </div>
        </div>

        {onSetTheme && (
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => onSetTheme('light')}
              className={`p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                theme === 'light'
                  ? 'bg-amber-50/80 dark:bg-slate-800 border-amber-400 text-amber-900 dark:text-amber-300 shadow-xs ring-2 ring-amber-400/20'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black">Mode Terang</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
                  Cerah & Bersih
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSetTheme('dark')}
              className={`p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                theme === 'dark'
                  ? 'bg-indigo-50/80 dark:bg-slate-800 border-indigo-500 text-indigo-900 dark:text-indigo-300 shadow-xs ring-2 ring-indigo-500/20'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black">Mode Malam</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
                  Nyaman di Mata
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onSetTheme('system')}
              className={`p-3 sm:p-4 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                theme === 'system'
                  ? 'bg-teal-50/80 dark:bg-slate-800 border-teal-500 text-teal-900 dark:text-teal-300 shadow-xs ring-2 ring-teal-500/20'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black">Sistem (Otomatis)</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden sm:block">
                  Ikuti HP / Laptop
                </p>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* PWA Install Banner in Settings */}
      <PWAInstallButton variant="settings" />

      {/* Main Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 sm:p-8 space-y-7 transition-colors">
        {/* LOGO APLIKASI */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-teal-50/30 dark:from-slate-800/60 dark:to-teal-950/20 border border-slate-200/80 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Logo Preview Container with subtle checker pattern */}
              <div
                className="w-16 h-16 rounded-2xl border-2 border-teal-600/30 bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center p-1.5 shrink-0 relative overflow-hidden"
                style={{
                  backgroundImage:
                    'radial-gradient(#cbd5e1 0.75px, transparent 0.75px), radial-gradient(#cbd5e1 0.75px, #ffffff 0.75px)',
                  backgroundSize: '12px 12px',
                  backgroundPosition: '0 0, 6px 6px',
                }}
              >
                <AppLogo size="md" logoUrl={logo} />
              </div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-[10px] font-black text-teal-800 dark:text-teal-300 uppercase tracking-widest bg-teal-100/80 dark:bg-teal-950/80 px-2 py-0.5 rounded-full">
                    Logo Aplikasi
                  </span>
                  {logo && (
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800">
                      100% Berkas Kustom Aktif
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">
                  Logo Resmi Tabungan Santri
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Tampil pada Sidebar, Header, Layar Masuk, dan Kop Laporan Cetak.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleLogoFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4" />
                <span>{logo ? 'Ganti Logo Berkas' : 'Unggah Logo Asli'}</span>
              </button>

              {logo && (
                <button
                  type="button"
                  onClick={handleResetLogo}
                  className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950 hover:text-rose-600 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer"
                  title="Kembalikan ke logo default"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3 font-medium flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            Unggah file PNG transparan Anda untuk memastikan logo terlihat presisi di semua latar belakang.
          </p>
        </div>

        <form onSubmit={handleSettingsSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Nama Lembaga / Pesantren / Rumah Tahfidz
            </label>
            <input
              type="text"
              required
              value={lembaga}
              onChange={(e) => setLembaga(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3.5 font-bold outline-none transition-all"
            />
          </div>

          <div>
            <label className="block mb-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Nama Petugas / Bendahara Aktif
            </label>
            <input
              type="text"
              required
              value={petugas}
              onChange={(e) => setPetugas(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3.5 font-bold outline-none transition-all"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 font-medium flex items-center gap-1">
              <Info className="w-3.5 h-3.5 shrink-0" />
              Nama ini akan otomatis tertera pada setiap mutasi dan tanda tangan laporan.
            </p>
          </div>

          <button
            type="submit"
            className="w-full text-white bg-slate-900 dark:bg-teal-700 hover:bg-black dark:hover:bg-teal-800 font-bold rounded-2xl text-sm py-4 text-center transition-all shadow-md active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" /> Simpan Pengaturan
          </button>
        </form>

        <div className="my-8 border-t border-slate-100 dark:border-slate-800" />

        {/* Backup & Restore Data */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Cadangan & Pemulihan Data
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleExportBackup}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all flex items-start gap-3 active:scale-98 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">
                  Unduh Cadangan
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">
                  Simpan data dalam berkas JSON
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-all flex items-start gap-3 active:scale-98 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">
                  Pulihkan Data
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 block mt-0.5">
                  Unggah berkas JSON cadangan
                </span>
              </div>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        <div className="my-8 border-t border-slate-100 dark:border-slate-800" />

        {/* Danger Zone */}
        <div className="space-y-4">
          <h4 className="text-[11px] font-black text-rose-500 uppercase tracking-widest">
            Zona Berbahaya & Sesi
          </h4>

          {/* Logout */}
          <div className="p-4 bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/60 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
                Keluar Sistem (Logout)
              </p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                Akhiri sesi kerja Anda saat ini dan kembali ke layar login.
              </p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/60 active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Keluar
            </button>
          </div>

          {/* Reset All */}
          <div className="p-4 bg-rose-50/50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/60 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
                Kosongkan Seluruh Data
              </p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">
                Hapus permanen semua catatan santri dan mutasi simpanan.
              </p>
            </div>
            <button
              type="button"
              onClick={openResetChallenge}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-xs shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Kosongkan Data
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: RESET CHALLENGE */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowResetModal(false)}
          />
          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 border border-slate-100 dark:border-slate-800 p-6 text-slate-800 dark:text-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-black tracking-tight">Konfirmasi Kosongkan Data</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
              Tindakan ini akan <strong>menghapus seluruh data santri dan riwayat mutasi tabungan secara permanen</strong>.
            </p>

            <form onSubmit={handleConfirmReset} className="mt-5 space-y-4">
              <div className="p-3.5 bg-slate-100 dark:bg-slate-800 rounded-2xl text-center">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">
                  Ketik kode angka keamanan berikut:
                </span>
                <span className="text-2xl font-black font-mono tracking-widest text-slate-800 dark:text-slate-200">
                  {challengeCode}
                </span>
              </div>

              <input
                type="text"
                required
                maxLength={4}
                value={userEnteredCode}
                onChange={(e) => setUserEnteredCode(e.target.value)}
                placeholder="Masukkan 4 digit kode di atas"
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-center text-lg font-mono rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-rose-500/20 focus:border-rose-600 block w-full px-4 py-3 outline-none"
              />

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 cursor-pointer transition-all"
                >
                  Ya, Hapus Semua Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
