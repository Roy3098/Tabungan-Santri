import React, { useState } from 'react';
import { User } from '../types';
import {
  UserCheck,
  Mail,
  Briefcase,
  Phone,
  Lock,
  X,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  Key,
} from 'lucide-react';

interface UserProfileModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (updatedUser: User) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onSaveProfile,
  showToast,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [nama, setNama] = useState(user.nama);
  const [email, setEmail] = useState(user.email);
  const [jabatan, setJabatan] = useState(user.jabatan || 'Bendahara / Pengurus');
  const [noHp, setNoHp] = useState(user.no_hp || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!nama.trim() || !email.trim()) {
      showToast('Nama dan email wajib diisi.', 'warning');
      return;
    }

    if (password && password !== confirmPassword) {
      showToast('Konfirmasi kata sandi baru tidak cocok.', 'error');
      return;
    }

    const updated: User = {
      ...user,
      nama: nama.trim(),
      email: email.trim(),
      jabatan: jabatan.trim(),
      no_hp: noHp.trim(),
      password: password ? password : user.password,
    };

    onSaveProfile(updated);
    showToast('Profil petugas berhasil diperbarui!', 'success');
    setIsEditing(false);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 bg-white rounded-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 border border-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {isEditing ? 'Ubah Profil Petugas' : 'Profil Petugas / Bendahara'}
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                {isEditing ? 'Perbarui informasi akun Anda' : 'Detail akun & hak akses'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        {!isEditing ? (
          <div className="p-5 sm:p-6 space-y-5">
            {/* User Identity Card */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-white border border-teal-100/70">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-800 to-teal-500 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-teal-700/20 shrink-0">
                {user.nama.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-lg text-slate-900 tracking-tight truncate">
                    {user.nama}
                  </h4>
                  <span className="bg-teal-100 text-teal-800 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">
                    Aktif
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-bold mt-0.5 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span className="truncate">{user.jabatan || 'Bendahara / Pengurus'}</span>
                </p>
                <p className="text-xs text-slate-400 font-medium mt-0.5 truncate flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>{user.email}</span>
                </p>
              </div>
            </div>

            {/* Profile Detail List */}
            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" /> Alamat Email
                </span>
                <span className="font-bold text-slate-800 font-mono">{user.email}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> No. WhatsApp / HP
                </span>
                <span className="font-bold text-slate-800">
                  {user.no_hp || 'Belum diisi'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Hak Akses
                </span>
                <span className="font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  Administrator Penuh
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setIsEditing(true)}
              className="w-full text-white bg-slate-900 hover:bg-black font-bold rounded-2xl text-xs sm:text-sm py-3.5 flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Edit2 className="w-4 h-4" /> Edit Profil Saya
            </button>
          </div>
        ) : (
          /* EDIT PROFILE FORM */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            <div>
              <label className="block mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Nama Lengkap Petugas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3 font-bold outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Email Akun <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3 font-bold outline-none transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Jabatan / Peran
                </label>
                <input
                  type="text"
                  value={jabatan}
                  onChange={(e) => setJabatan(e.target.value)}
                  placeholder="Contoh: Bendahara Utama"
                  className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3 font-bold outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                value={noHp}
                onChange={(e) => setNoHp(e.target.value)}
                placeholder="Contoh: 0812-3456-7890"
                className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3 font-bold outline-none transition-all"
              />
            </div>

            {/* Change Password section */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block flex items-center gap-1">
                <Key className="w-3 h-3 text-slate-400" /> Ganti Kata Sandi (Opsional)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Kata sandi baru..."
                  className="bg-white border border-slate-200 text-slate-900 text-xs rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 block w-full px-3 py-2.5 font-medium outline-none"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi..."
                  className="bg-white border border-slate-200 text-slate-900 text-xs rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 block w-full px-3 py-2.5 font-medium outline-none"
                />
              </div>
            </div>

            {/* Submit and Cancel */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 py-3.5 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Simpan Profil
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
