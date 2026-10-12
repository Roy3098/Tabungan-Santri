import React, { useState, useEffect, useCallback } from 'react';
import {
  AppData,
  Santri,
  Transaksi,
  User,
  AppSettings,
  ViewType,
  TransactionType,
  ToastMessage,
  Kelas,
} from './types';
import { defaultAppData } from './data/initialData';
import { generateRef } from './utils/formatters';
import {
  testConnection,
  initializeFirestoreData,
  subscribeToDatabase,
  dbSaveSettings,
  dbSaveKelas,
  dbDeleteKelas,
  dbDeleteKelasAndReassignSantri,
  dbSaveSantri,
  dbDeleteSantri,
  dbDeleteSantriWithTransaksi,
  dbSaveTransaksi,
  dbBatchUpdateTransaksi,
  dbResetAllData,
  dbRestoreFullData,
  dbSaveUser,
} from './firebase';
import { AuthView } from './components/AuthView';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { DashboardView } from './components/DashboardView';
import { SantriView } from './components/SantriView';
import { KelasView } from './components/KelasView';
import { TransaksiView } from './components/TransaksiView';
import { RiwayatView } from './components/RiwayatView';
import { LaporanView } from './components/LaporanView';
import { PengaturanView } from './components/PengaturanView';
import { ProfilView } from './components/ProfilView';
import { ToastContainer } from './components/Toast';
import { OfflineIndicator } from './components/OfflineIndicator';
import { useDarkMode } from './hooks/useDarkMode';

const STORAGE_KEY = 'SistemSimpananSantri_Data_v2';
const AUTH_KEY = 'simpanan_isLoggedIn';
const USER_KEY = 'simpanan_currentUser';

export default function App() {
  // App data state
  const [appData, setAppData] = useState<AppData>(() => {
    try {
      // Clean up any oversized custom logo in localStorage that exceeds Firestore's 1MB limit
      const customLogo = localStorage.getItem('app_custom_logo');
      if (customLogo && customLogo.length > 450_000) {
        localStorage.removeItem('app_custom_logo');
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.santri && parsed.transaksi && parsed.settings) {
          if (!parsed.kelas || !Array.isArray(parsed.kelas)) {
            parsed.kelas = defaultAppData.kelas;
          }
          // Ensure settings.logo never exceeds Firestore's 1MB document limit
          if (parsed.settings.logo && parsed.settings.logo.length > 450_000) {
            parsed.settings.logo = '';
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Gagal memuat data dari localStorage', e);
    }
    return defaultAppData;
  });

  // Database connection state
  const [isDbConnected, setIsDbConnected] = useState<boolean>(false);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) === 'true';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      if (storedUser) return JSON.parse(storedUser);
    } catch (e) {}
    return appData.users[0] || null;
  });

  // Navigation state
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [txDefaultType, setTxDefaultType] = useState<TransactionType>('setoran');
  const [modalAddSantriOpen, setModalAddSantriOpen] = useState(false);
  const [selectedClassFilter, setSelectedClassFilter] = useState('');

  // Toast system state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Dark Mode Theme state
  const { theme, isDark, setTheme, toggleDark } = useDarkMode();

  // Initialize and subscribe to Firestore Database
  useEffect(() => {
    let isMounted = true;

    // 1. Test connection to server
    testConnection().then((connected) => {
      if (isMounted) setIsDbConnected(connected);
    });

    // 2. Load or seed initial data
    initializeFirestoreData()
      .then((data) => {
        if (isMounted && data) {
          setAppData(data);
          setIsDbConnected(true);
        }
      })
      .catch((err) => {
        console.warn('Memakai cadangan lokal sementara menghubungkan database...', err);
      });

    // 3. Realtime Firestore synchronization
    const unsubscribe = subscribeToDatabase((liveData) => {
      if (!isMounted) return;
      setAppData((prev) => ({
        ...prev,
        ...liveData,
      }));
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sync to localStorage as offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
      console.error('Gagal menyimpan data ke localStorage', e);
    }
  }, [appData]);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth handlers
  const handleLoginSuccess = (user: User) => {
    localStorage.setItem(AUTH_KEY, 'true');
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setIsLoggedIn(true);
    setCurrentUser(user);
    // Update active petugas name to logged in user's name
    const updatedSettings = {
      ...appData.settings,
      petugas: user.nama,
    };
    setAppData((prev) => ({
      ...prev,
      settings: updatedSettings,
    }));
    dbSaveSettings(updatedSettings).catch(console.error);
    showToast(`Selamat datang kembali, ${user.nama}!`, 'success');
  };

  const handleRegisterSuccess = (newUser: User) => {
    setAppData((prev) => ({
      ...prev,
      users: [...prev.users, newUser],
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
    setIsLoggedIn(false);
    setCurrentUser(null);
    showToast('Anda telah keluar dari sistem.', 'info');
  };

  // Navigation helper
  const handleNavigate = (view: ViewType, extra?: { txType?: TransactionType }) => {
    if (extra?.txType) {
      setTxDefaultType(extra.txType);
    }
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Student (Santri) Actions
  const handleSaveSantri = (santriData: {
    id?: string;
    nis: string;
    nama: string;
    kelas: string;
    status: 'aktif' | 'nonaktif';
    wali_santri?: string;
    no_hp?: string;
    alamat?: string;
  }): boolean => {
    const isEdit = !!santriData.id;
    // Check duplicate NIS
    const duplicate = appData.santri.find(
      (s) =>
        s.nis.trim().toLowerCase() === santriData.nis.trim().toLowerCase() &&
        s.id !== santriData.id
    );

    if (duplicate) {
      showToast(`NIS "${santriData.nis}" sudah terdaftar atas nama ${duplicate.nama}!`, 'error');
      return false;
    }

    if (isEdit) {
      const target = appData.santri.find((s) => s.id === santriData.id);
      const updatedItem: Santri = {
        ...target,
        id: santriData.id!,
        nis: santriData.nis.trim(),
        nama: santriData.nama.trim(),
        kelas: santriData.kelas.trim(),
        status: santriData.status,
        wali_santri:
          santriData.wali_santri !== undefined
            ? santriData.wali_santri.trim()
            : target?.wali_santri,
        no_hp:
          santriData.no_hp !== undefined
            ? santriData.no_hp.trim()
            : target?.no_hp,
        alamat:
          santriData.alamat !== undefined
            ? santriData.alamat.trim()
            : target?.alamat,
        created_at: target?.created_at || new Date().toISOString(),
      };

      setAppData((prev) => ({
        ...prev,
        santri: prev.santri.map((s) => (s.id === santriData.id ? updatedItem : s)),
      }));
      dbSaveSantri(updatedItem).catch(console.error);
      showToast(`Data santri "${updatedItem.nama}" berhasil diperbarui.`, 'success');
      return true;
    } else {
      const newSantri: Santri = {
        id: 's-' + Date.now().toString(36),
        nis: santriData.nis.trim(),
        nama: santriData.nama.trim(),
        kelas: santriData.kelas.trim(),
        status: santriData.status,
        wali_santri: santriData.wali_santri?.trim() || '',
        no_hp: santriData.no_hp?.trim() || '',
        alamat: santriData.alamat?.trim() || '',
        created_at: new Date().toISOString(),
      };
      setAppData((prev) => ({
        ...prev,
        santri: [...prev.santri, newSantri],
      }));
      dbSaveSantri(newSantri).catch(console.error);
      showToast(`Santri "${newSantri.nama}" berhasil disimpan ke database.`, 'success');
      return true;
    }
  };

  const handleDeleteSantri = (id: string, deleteTransactions = false) => {
    setAppData((prev) => {
      const targetSantri = prev.santri.find((s) => s.id === id);
      const relatedTxIds = prev.transaksi
        .filter((t) => t.id_santri === id)
        .map((t) => t.id);

      const nextSantri = prev.santri.filter((s) => s.id !== id);
      const nextTransaksi =
        deleteTransactions || relatedTxIds.length > 0
          ? prev.transaksi.filter((t) => t.id_santri !== id)
          : prev.transaksi;

      if (relatedTxIds.length > 0) {
        dbDeleteSantriWithTransaksi(id, relatedTxIds).catch(console.error);
      } else {
        dbDeleteSantri(id).catch(console.error);
      }

      showToast(
        targetSantri
          ? `Santri "${targetSantri.nama}" berhasil dihapus dari database.`
          : 'Data santri berhasil dihapus.',
        'info'
      );

      return {
        ...prev,
        santri: nextSantri,
        transaksi: nextTransaksi,
      };
    });
  };

  // Class (Kelas) Actions
  const handleSaveKelas = (kelasData: {
    id?: string;
    nama: string;
    wali_kelas?: string;
    keterangan?: string;
  }): boolean => {
    const isEdit = !!kelasData.id;
    const currentClasses = appData.kelas || [];

    // Check duplicate class name
    const duplicate = currentClasses.find(
      (k) =>
        k.nama.trim().toLowerCase() === kelasData.nama.trim().toLowerCase() &&
        k.id !== kelasData.id
    );

    if (duplicate) {
      showToast(`Nama kelas "${kelasData.nama}" sudah terdaftar!`, 'error');
      return false;
    }

    if (isEdit) {
      const oldClass = currentClasses.find((k) => k.id === kelasData.id);
      const updatedKelasItem: Kelas = {
        id: kelasData.id!,
        nama: kelasData.nama.trim(),
        wali_kelas: kelasData.wali_kelas?.trim() || '',
        keterangan: kelasData.keterangan?.trim() || '',
        created_at: oldClass?.created_at || new Date().toISOString(),
      };

      const updatedKelasList = currentClasses.map((k) =>
        k.id === kelasData.id ? updatedKelasItem : k
      );

      // If class name changed, also update students assigned to this class
      let updatedSantri = appData.santri;
      if (oldClass && oldClass.nama !== updatedKelasItem.nama) {
        updatedSantri = appData.santri.map((s) => {
          if (s.kelas === oldClass.nama) {
            const u = { ...s, kelas: updatedKelasItem.nama };
            dbSaveSantri(u).catch(console.error);
            return u;
          }
          return s;
        });
      }

      dbSaveKelas(updatedKelasItem).catch(console.error);
      setAppData((prev) => ({
        ...prev,
        kelas: updatedKelasList,
        santri: updatedSantri,
      }));
      showToast(`Kelas "${updatedKelasItem.nama}" berhasil diperbarui.`, 'success');
      return true;
    } else {
      const newClass: Kelas = {
        id: 'k-' + Date.now().toString(36),
        nama: kelasData.nama.trim(),
        wali_kelas: kelasData.wali_kelas?.trim() || '',
        keterangan: kelasData.keterangan?.trim() || '',
        created_at: new Date().toISOString(),
      };

      dbSaveKelas(newClass).catch(console.error);
      setAppData((prev) => ({
        ...prev,
        kelas: [...currentClasses, newClass],
      }));
      showToast(`Kelas "${newClass.nama}" berhasil ditambahkan ke database.`, 'success');
      return true;
    }
  };

  const handleDeleteKelas = (id: string, reassignToClass?: string) => {
    setAppData((prev) => {
      const currentClasses = prev.kelas || [];
      const targetClass = currentClasses.find((k) => k.id === id);
      const nextKelas = currentClasses.filter((k) => k.id !== id);

      const reassignedSantriList: Santri[] = [];
      let nextSantri = prev.santri;

      if (targetClass) {
        const fallbackClass =
          reassignToClass?.trim() ||
          nextKelas[0]?.nama ||
          'Belum Ditentukan';

        nextSantri = prev.santri.map((s) => {
          if (s.kelas === targetClass.nama) {
            const updatedS = { ...s, kelas: fallbackClass };
            reassignedSantriList.push(updatedS);
            return updatedS;
          }
          return s;
        });
      }

      if (reassignedSantriList.length > 0) {
        dbDeleteKelasAndReassignSantri(id, reassignedSantriList).catch(console.error);
      } else {
        dbDeleteKelas(id).catch(console.error);
      }

      showToast(
        targetClass
          ? `Kelas "${targetClass.nama}" berhasil dihapus.`
          : 'Data kelas berhasil dihapus.',
        'info'
      );

      return {
        ...prev,
        kelas: nextKelas,
        santri: nextSantri,
      };
    });
  };

  // Transaction Actions
  const handleSaveTransaksi = (txInput: {
    id_santri: string;
    jenis: TransactionType;
    tanggal: string;
    nominal: number;
    keterangan: string;
  }) => {
    setAppData((prev) => {
      const student = prev.santri.find((s) => s.id === txInput.id_santri);
      if (!student) return prev;

      // Calculate current student balance
      let currentBal = 0;
      prev.transaksi
        .filter((t) => t.id_santri === txInput.id_santri && t.status !== 'void')
        .forEach((t) => {
          if (t.jenis === 'setoran') currentBal += t.nominal;
          if (t.jenis === 'penarikan') currentBal -= t.nominal;
        });

      const newBal =
        txInput.jenis === 'setoran'
          ? currentBal + txInput.nominal
          : currentBal - txInput.nominal;

      const newTx: Transaksi = {
        id: 'tx-' + Date.now().toString(36),
        no_ref: generateRef(txInput.tanggal),
        tanggal: txInput.tanggal,
        id_santri: txInput.id_santri,
        jenis: txInput.jenis,
        nominal: txInput.nominal,
        keterangan: txInput.keterangan,
        petugas: prev.settings.petugas,
        saldo_setelah: newBal,
        status: 'valid',
        created_at: new Date().toISOString(),
      };

      dbSaveTransaksi(newTx).catch(console.error);
      const updatedTransactions = [...prev.transaksi, newTx];
      return { ...prev, transaksi: updatedTransactions };
    });
  };

  const handleVoidTransaksi = (txId: string, reason: string) => {
    setAppData((prev) => {
      const txIndex = prev.transaksi.findIndex((t) => t.id === txId);
      if (txIndex === -1) return prev;

      const targetTx = prev.transaksi[txIndex];
      const studentId = targetTx.id_santri;

      // Mark as void
      const modifiedList = prev.transaksi.map((t) => {
        if (t.id === txId) {
          return {
            ...t,
            status: 'void' as const,
            keterangan: `[VOID] ${reason} - Awal: ${t.keterangan || 'Tanpa keterangan'}`,
          };
        }
        return t;
      });

      // Rebuild running balances for this student
      let running = 0;
      const sortedByTime = [...modifiedList].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );

      const rebuilt = sortedByTime.map((t) => {
        if (t.id_santri === studentId && t.status !== 'void') {
          if (t.jenis === 'setoran') running += t.nominal;
          if (t.jenis === 'penarikan') running -= t.nominal;
          return { ...t, saldo_setelah: running };
        }
        return t;
      });

      dbBatchUpdateTransaksi(rebuilt).catch(console.error);
      return { ...prev, transaksi: rebuilt };
    });
  };

  // Settings Actions
  const handleSaveSettings = (newSettings: AppSettings) => {
    setAppData((prev) => ({
      ...prev,
      settings: newSettings,
    }));
    dbSaveSettings(newSettings).catch(console.error);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));

    setAppData((prev) => {
      const idx = prev.users.findIndex(
        (u) => u.email.toLowerCase() === updatedUser.email.toLowerCase()
      );
      let updatedUsers = [...prev.users];
      if (idx >= 0) {
        updatedUsers[idx] = updatedUser;
      } else {
        updatedUsers.push(updatedUser);
      }
      return {
        ...prev,
        users: updatedUsers,
        settings: {
          ...prev.settings,
          petugas: updatedUser.nama,
        },
      };
    });

    dbSaveUser(updatedUser).catch(console.error);
    dbSaveSettings({
      ...appData.settings,
      petugas: updatedUser.nama,
    }).catch(console.error);
  };

  const handleRestoreData = (restored: AppData) => {
    setAppData(restored);
    dbRestoreFullData(restored).catch(console.error);
  };

  const handleResetAllData = () => {
    setAppData((prev) => ({
      ...prev,
      santri: [],
      transaksi: [],
    }));
    dbResetAllData().catch(console.error);
    handleNavigate('dashboard');
  };

  return (
    <>
      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* PWA Offline Connectivity Indicator */}
      <OfflineIndicator />

      {!isLoggedIn ? (
        <AuthView
          users={appData.users}
          onLoginSuccess={handleLoginSuccess}
          onRegisterSuccess={handleRegisterSuccess}
          showToast={showToast}
          logoUrl={appData.settings.logo}
        />
      ) : (
        <div className="h-screen w-full flex overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative selection:bg-teal-100 selection:text-teal-900 dark:selection:bg-teal-900 dark:selection:text-teal-100 transition-colors">
          {/* Desktop Floating Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={handleNavigate}
            lembagaName={appData.settings.lembaga}
            petugasName={appData.settings.petugas}
            currentUser={currentUser}
            onLogout={handleLogout}
            logoUrl={appData.settings.logo}
            isDark={isDark}
            onToggleDark={toggleDark}
          />

          {/* Main Scrollable Content */}
          <main className="flex-1 h-full overflow-y-auto w-full relative pb-24 md:pb-8 scroll-smooth">
            {/* Mobile Header */}
            <Header
              currentView={currentView}
              lembagaName={appData.settings.lembaga}
              onNavigate={handleNavigate}
              currentUser={currentUser}
              logoUrl={appData.settings.logo}
              isDark={isDark}
              onToggleDark={toggleDark}
            />

            {/* View Container */}
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
              {/* Database Status Indicator Bar */}
              <div className="mb-4 sm:mb-6 flex items-center justify-between px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xs text-xs transition-colors">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isDbConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`}
                  />
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    {isDbConnected ? 'Cloud Firestore Terhubung' : 'Sinkronisasi Database...'}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500">
                  Real-time Sync
                </span>
              </div>

              {currentView === 'dashboard' && (
                <DashboardView
                  santriList={appData.santri}
                  transaksiList={appData.transaksi}
                  totalKelasCount={(appData.kelas || []).length}
                  onNavigate={handleNavigate}
                  onOpenAddSantri={() => {
                    handleNavigate('santri');
                    setModalAddSantriOpen(true);
                  }}
                />
              )}

              {currentView === 'santri' && (
                <SantriView
                  santriList={appData.santri}
                  transaksiList={appData.transaksi}
                  kelasList={appData.kelas || []}
                  onSaveSantri={handleSaveSantri}
                  onDeleteSantri={handleDeleteSantri}
                  onSaveKelas={handleSaveKelas}
                  onDeleteKelas={handleDeleteKelas}
                  showToast={showToast}
                  modalAddOpen={modalAddSantriOpen}
                  onSetModalAddOpen={setModalAddSantriOpen}
                  initialClassFilter={selectedClassFilter}
                />
              )}

              {currentView === 'kelas' && (
                <KelasView
                  kelasList={appData.kelas || []}
                  santriList={appData.santri}
                  transaksiList={appData.transaksi}
                  onSaveKelas={handleSaveKelas}
                  onDeleteKelas={handleDeleteKelas}
                  onNavigateToSantriWithClassFilter={(className) => {
                    setSelectedClassFilter(className);
                    handleNavigate('santri');
                  }}
                  showToast={showToast}
                />
              )}

              {currentView === 'transaksi' && (
                <TransaksiView
                  santriList={appData.santri}
                  transaksiList={appData.transaksi}
                  defaultType={txDefaultType}
                  petugasName={appData.settings.petugas}
                  onSaveTransaksi={handleSaveTransaksi}
                  showToast={showToast}
                />
              )}

              {currentView === 'riwayat' && (
                <RiwayatView
                  santriList={appData.santri}
                  transaksiList={appData.transaksi}
                  onVoidTransaksi={handleVoidTransaksi}
                  showToast={showToast}
                />
              )}

              {currentView === 'laporan' && (
                <LaporanView
                  santriList={appData.santri}
                  transaksiList={appData.transaksi}
                  lembagaName={appData.settings.lembaga}
                  petugasName={appData.settings.petugas}
                  showToast={showToast}
                />
              )}

              {currentView === 'pengaturan' && (
                <PengaturanView
                  settings={appData.settings}
                  fullData={appData}
                  currentUser={currentUser}
                  onNavigateToProfil={() => handleNavigate('profil')}
                  onSaveSettings={handleSaveSettings}
                  onRestoreData={handleRestoreData}
                  onResetAllData={handleResetAllData}
                  onLogout={handleLogout}
                  showToast={showToast}
                  theme={theme}
                  onSetTheme={setTheme}
                  isDark={isDark}
                  onToggleDark={toggleDark}
                />
              )}

              {currentView === 'profil' && (
                <ProfilView
                  currentUser={currentUser}
                  onUpdateUser={handleUpdateUser}
                  onNavigateToDashboard={() => handleNavigate('dashboard')}
                  showToast={showToast}
                />
              )}
            </div>
          </main>

          {/* Mobile Bottom Navigation Bar */}
          <MobileNav currentView={currentView} onNavigate={handleNavigate} />
        </div>
      )}
    </>
  );
}
