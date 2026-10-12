import React, { useState } from 'react';
import { User } from '../types';
import { Eye, EyeOff, User as UserIcon, Lock, Mail, ArrowLeft } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface AuthViewProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onRegisterSuccess: (newUser: User) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  logoUrl?: string;
}

export const AuthView: React.FC<AuthViewProps> = ({
  users,
  onLoginSuccess,
  onRegisterSuccess,
  showToast,
  logoUrl,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Login form states
  const [loginIdentifier, setLoginIdentifier] = useState('admin@tahfidz.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password form states
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = loginIdentifier.trim().toLowerCase();
    const user = users.find(
      (u) =>
        (u.email.toLowerCase() === cleanId || u.nama.toLowerCase() === cleanId) &&
        u.password === loginPassword
    );

    if (user) {
      if (rememberMe) {
        localStorage.setItem('simpanan_remember', 'true');
      }
      onLoginSuccess(user);
    } else {
      showToast('Email atau password salah!', 'error');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = regName.trim();
    const email = regEmail.trim().toLowerCase();

    if (!name || !email || !regPassword) {
      showToast('Mohon lengkapi semua kolom pendaftaran.', 'warning');
      return;
    }

    if (users.some((u) => u.email.toLowerCase() === email)) {
      showToast('Email sudah terdaftar! Gunakan email lain.', 'error');
      return;
    }

    const newUser: User = {
      nama: name,
      email: email,
      password: regPassword,
    };

    onRegisterSuccess(newUser);
    showToast('Akun berhasil dibuat! Silakan masuk.', 'success');
    setLoginIdentifier(email);
    setLoginPassword(regPassword);
    setAuthMode('login');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = forgotEmail.trim().toLowerCase();
    const exists = users.some((u) => u.email.toLowerCase() === email);

    if (exists) {
      showToast('Tautan reset kata sandi telah dikirim ke email Anda.', 'success');
      setTimeout(() => {
        setAuthMode('login');
      }, 1500);
    } else {
      showToast('Email tidak terdaftar dalam sistem.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 overflow-y-auto flex items-center justify-center p-4 transition-colors">
      {/* Background Animated Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-10 w-96 h-96 bg-teal-300 dark:bg-teal-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-35 animate-blob"></div>
        <div className="absolute top-10 -right-10 w-96 h-96 bg-amber-200 dark:bg-amber-900/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-35 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-10 left-20 w-96 h-96 bg-emerald-300 dark:bg-emerald-900/40 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl opacity-35 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 w-full max-w-[420px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl sm:rounded-[2.5rem] shadow-2xl shadow-slate-900/10 dark:shadow-black/50 border border-white/80 dark:border-slate-800 p-6 sm:p-9 my-8 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header Icon & Title */}
        <div className="text-center mb-7">
          <AppLogo size="xl" logoUrl={logoUrl} className="mx-auto mb-4" />
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Tabungan Santri
          </h1>
          <p className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-widest mt-1">
            {authMode === 'login' && 'Sistem Kelola Simpanan & Mutasi'}
            {authMode === 'register' && 'Daftar Akun Petugas Baru'}
            {authMode === 'forgot' && 'Pemulihan Kata Sandi'}
          </p>
        </div>

        {/* LOGIN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Email / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none text-slate-400 dark:text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-11 pr-4 py-3.5 font-semibold outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="admin@tahfidz.com"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-11 pr-11 py-3.5 font-semibold outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-slate-400 dark:text-slate-500 hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 dark:border-slate-600 focus:ring-teal-500"
                />
                <span className="ml-2 text-xs font-bold text-slate-500 dark:text-slate-400">Ingat Saya</span>
              </label>
              <button
                type="button"
                onClick={() => setAuthMode('forgot')}
                className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors cursor-pointer"
              >
                Lupa Password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full text-white bg-slate-900 dark:bg-teal-700 hover:bg-black dark:hover:bg-teal-800 font-bold rounded-2xl text-sm py-4 text-center transition-all shadow-lg active:scale-[0.98] mt-2 cursor-pointer"
            >
              Masuk ke Sistem
            </button>

            <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 pt-3">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className="font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors ml-1 cursor-pointer"
              >
                Daftar sekarang
              </button>
            </p>
          </form>
        )}

        {/* REGISTER FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none text-slate-400 dark:text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-11 pr-4 py-3.5 font-semibold outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Ustadz / Ustadzah"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-11 pr-4 py-3.5 font-semibold outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="petugas@tahfidz.com"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Buat Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none text-slate-400 dark:text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-11 pr-11 py-3.5 font-semibold outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="Minimal 6 karakter"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-11 text-slate-400 dark:text-slate-500 hover:text-teal-700 dark:hover:text-teal-400 transition-colors cursor-pointer"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full text-white bg-teal-700 hover:bg-teal-800 font-bold rounded-2xl text-sm py-4 text-center transition-all shadow-lg shadow-teal-700/25 active:scale-[0.98] mt-2 cursor-pointer"
            >
              Daftar Akun Baru
            </button>

            <p className="text-center text-xs font-medium text-slate-500 dark:text-slate-400 pt-3">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="font-bold text-slate-900 dark:text-slate-100 hover:text-teal-700 dark:hover:text-teal-400 transition-colors ml-1 cursor-pointer"
              >
                Masuk di sini
              </button>
            </p>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {authMode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 text-center leading-relaxed mb-4">
              Masukkan alamat email Anda yang terdaftar untuk menerima petunjuk pemulihan kata sandi.
            </p>

            <div>
              <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Email Terdaftar
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none text-slate-400 dark:text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="bg-slate-50/80 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-11 pr-4 py-3.5 font-semibold outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  placeholder="admin@tahfidz.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full text-white bg-slate-900 dark:bg-teal-700 hover:bg-black dark:hover:bg-teal-800 font-bold rounded-2xl text-sm py-4 text-center transition-all shadow-lg active:scale-[0.98] mt-2 cursor-pointer"
            >
              Kirim Tautan Reset
            </button>

            <div className="text-center pt-3">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className="inline-flex items-center text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Kembali ke Halaman Masuk
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
