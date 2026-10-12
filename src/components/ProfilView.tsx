import React, { useState, useRef } from 'react';
import { User } from '../types';
import {
  User as UserIcon,
  Mail,
  Phone,
  Briefcase,
  Camera,
  Trash2,
  ShieldCheck,
  Save,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { compressImageFile } from '../utils/imageCompressor';

interface ProfilViewProps {
  currentUser: User | null;
  onUpdateUser: (updatedUser: User) => void;
  onNavigateToDashboard: () => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const ProfilView: React.FC<ProfilViewProps> = ({
  currentUser,
  onUpdateUser,
  onNavigateToDashboard,
  showToast,
}) => {
  const [nama, setNama] = useState(currentUser?.nama || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [jabatan, setJabatan] = useState(currentUser?.jabatan || 'Bendahara & Admin Tabungan');
  const [noHp, setNoHp] = useState(currentUser?.no_hp || '');
  const [fotoProfil, setFotoProfil] = useState<string>(currentUser?.foto_profil || '');

  // Password fields (optional)
  const [passwordBaru, setPasswordBaru] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar (JPG, PNG, atau WEBP).', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('Ukuran gambar maksimal 10MB.', 'warning');
      return;
    }

    try {
      const compressedBase64 = await compressImageFile(file, 512, 0.85);
      if (compressedBase64) {
        setFotoProfil(compressedBase64);
        showToast('Foto profil baru berhasil dimuat. Klik Simpan untuk menerapkan.', 'info');
      } else {
        showToast('Gagal memproses foto profil.', 'error');
      }
    } catch (err) {
      console.error('Gagal mengompresi foto profil:', err);
      showToast('Gagal memproses foto profil.', 'error');
    }
  };

  const handleRemovePhoto = () => {
    setFotoProfil('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Foto profil dihapus.', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama.trim() || !email.trim()) {
      showToast('Nama dan Email wajib diisi!', 'warning');
      return;
    }

    if (passwordBaru) {
      if (passwordBaru.length < 6) {
        showToast('Password minimal 6 karakter!', 'warning');
        return;
      }
      if (passwordBaru !== konfirmasiPassword) {
        showToast('Konfirmasi password tidak cocok!', 'error');
        return;
      }
    }

    setIsSaving(true);

    const updated: User = {
      ...currentUser,
      nama: nama.trim(),
      email: email.trim().toLowerCase(),
      jabatan: jabatan.trim(),
      no_hp: noHp.trim(),
      foto_profil: fotoProfil,
      password: passwordBaru || currentUser?.password || 'password123',
    };

    onUpdateUser(updated);
    setIsSaving(false);
    setPasswordBaru('');
    setKonfirmasiPassword('');
    showToast('Profil Anda berhasil diperbarui!', 'success');
  };

  const userInitials = (nama || 'Admin')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 border-b border-slate-200/60 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={onNavigateToDashboard}
              className="p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer"
              title="Kembali ke Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Profil & Akun Petugas
            </h2>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm pl-8">
            Kelola data diri, kontak aktif, kredensial, dan foto profil Anda.
          </p>
        </div>

        <button
          onClick={onNavigateToDashboard}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: Foto Profil & Info Card */}
        <div className="lg:col-span-1 space-y-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm text-center relative overflow-hidden transition-colors">
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-teal-700 to-teal-500" />

            <div className="relative pt-6">
              {/* Avatar circle */}
              <div className="relative inline-block mx-auto mb-3.5 group">
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative">
                  {fotoProfil ? (
                    <img
                      src={fotoProfil}
                      alt={nama}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-teal-800 to-teal-600 text-white flex items-center justify-center text-3xl font-black tracking-wider">
                      {userInitials}
                    </div>
                  )}
                </div>

                {/* Floating camera upload trigger */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-slate-900 dark:bg-teal-700 hover:bg-black dark:hover:bg-teal-800 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-800 transition-all active:scale-90 cursor-pointer"
                  title="Ganti Foto Profil"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                {nama || 'Nama Petugas'}
              </h3>
              <p className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-0.5">
                {jabatan || 'Pengurus Tabungan'}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1 truncate">
                {email}
              </p>

              {/* Action buttons for photo */}
              <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 px-4 rounded-xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 text-xs font-bold transition-all cursor-pointer touch-manipulation active:scale-95 flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Pilih Foto</span>
                </button>

                {fotoProfil && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="h-10 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-rose-700 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer touch-manipulation active:scale-95 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Account Details Badge Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Hak Akses Petugas</h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Administrator & Pengelola Kas</p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Status Akun:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Aktif
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Database:</span>
                <span className="font-bold text-teal-700 dark:text-teal-400">Cloud Firestore</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Edit Profile Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight mb-5 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>Formulir Edit Data Profil</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              {/* Nama Lengkap */}
              <div>
                <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Nama Lengkap Petugas <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none text-slate-400 dark:text-slate-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    placeholder="Contoh: Ustadz Ahmad Hidayat"
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-11 pr-4 py-3.5 font-bold outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email & No HP in 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Email Pengguna <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none text-slate-400 dark:text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@tahfidz.com"
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-11 pr-4 py-3.5 font-semibold outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Nomor WhatsApp / HP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none text-slate-400 dark:text-slate-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={noHp}
                      onChange={(e) => setNoHp(e.target.value)}
                      placeholder="0812-3456-7890"
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-11 pr-4 py-3.5 font-semibold outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Jabatan */}
              <div>
                <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Jabatan / Tugas di Pesantren
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none text-slate-400 dark:text-slate-500">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={jabatan}
                    onChange={(e) => setJabatan(e.target.value)}
                    placeholder="Contoh: Bendahara Utama / Pengasuh Halaqah"
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-11 pr-4 py-3.5 font-bold outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Change Box (Optional) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-3.5 mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <KeyRound className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Ubah Kata Sandi (Opsional)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Sembunyikan' : 'Perlihatkan'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Kosongkan kolom di bawah jika Anda tidak ingin mengganti kata sandi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordBaru}
                      onChange={(e) => setPasswordBaru(e.target.value)}
                      placeholder="Kata Sandi Baru (min. 6 char)"
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-teal-500 block w-full px-3.5 py-3 font-semibold outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                  <div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={konfirmasiPassword}
                      onChange={(e) => setKonfirmasiPassword(e.target.value)}
                      placeholder="Ulangi Kata Sandi Baru"
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-teal-500 block w-full px-3.5 py-3 font-semibold outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-teal-700 hover:bg-black dark:hover:bg-teal-800 text-white px-8 py-4 rounded-2xl text-sm font-bold shadow-lg shadow-slate-900/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
