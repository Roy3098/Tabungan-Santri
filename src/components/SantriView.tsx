import React, { useState, useMemo, useEffect } from 'react';
import { Santri, Transaksi, Kelas } from '../types';
import {
  formatRupiah,
  formatDate,
  calculateStudentBalance,
} from '../utils/formatters';
import {
  Search,
  Plus,
  BookOpen,
  Edit2,
  Trash2,
  X,
  Printer,
  Users,
  ArrowDownLeft,
  ArrowUpRight,
  FolderOpen,
  UserCheck,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MapPin,
  User as UserIcon,
  Wallet,
} from 'lucide-react';

interface SantriViewProps {
  santriList: Santri[];
  transaksiList: Transaksi[];
  kelasList: Kelas[];
  onSaveSantri: (santriData: {
    id?: string;
    nis: string;
    nama: string;
    kelas: string;
    status: 'aktif' | 'nonaktif';
    wali_santri?: string;
    no_hp?: string;
    alamat?: string;
  }) => boolean | void;
  onDeleteSantri: (id: string, deleteTransactions?: boolean) => void;
  onSaveKelas: (kelasData: {
    id?: string;
    nama: string;
    wali_kelas?: string;
    keterangan?: string;
  }) => boolean | void;
  onDeleteKelas: (id: string, reassignToClass?: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  modalAddOpen: boolean;
  onSetModalAddOpen: (open: boolean) => void;
  initialClassFilter?: string;
}

export const SantriView: React.FC<SantriViewProps> = ({
  santriList,
  transaksiList,
  kelasList,
  onSaveSantri,
  onDeleteSantri,
  onSaveKelas,
  onDeleteKelas,
  showToast,
  modalAddOpen,
  onSetModalAddOpen,
  initialClassFilter = '',
}) => {
  // Top level sub-tab: 'santri' or 'kelas'
  const [activeTab, setActiveTab] = useState<'santri' | 'kelas'>('santri');

  // Real-time search and filters for Santri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKelas, setSelectedKelas] = useState(initialClassFilter);
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'nonaktif'>('all');

  useEffect(() => {
    if (initialClassFilter !== undefined) {
      setSelectedKelas(initialClassFilter);
    }
  }, [initialClassFilter]);

  // Santri Modals
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [detailSantriId, setDetailSantriId] = useState<string | null>(null);
  const [deletingSantri, setDeletingSantri] = useState<Santri | null>(null);

  // Santri Form states
  const [formNis, setFormNis] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formKelas, setFormKelas] = useState('');
  const [formStatus, setFormStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const [formWaliSantri, setFormWaliSantri] = useState('');
  const [formNoHp, setFormNoHp] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [isCustomClassMode, setIsCustomClassMode] = useState(false);

  // Kelas Management States & Modals
  const [kelasSearchTerm, setKelasSearchTerm] = useState('');
  const [modalKelasOpen, setModalKelasOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);
  const [deletingKelas, setDeletingKelas] = useState<Kelas | null>(null);
  const [reassignClass, setReassignClass] = useState('');
  const [formKelasNama, setFormKelasNama] = useState('');
  const [formKelasWali, setFormKelasWali] = useState('');
  const [formKelasKet, setFormKelasKet] = useState('');

  // Combined available class names
  const availableClassNames = useMemo(() => {
    return Array.from(
      new Set([
        ...kelasList.map((k) => k.nama),
        ...santriList.map((s) => s.kelas),
      ])
    ).filter(Boolean);
  }, [kelasList, santriList]);

  // Sync external modalAddOpen trigger (e.g. from Dashboard "Tambah Santri")
  useEffect(() => {
    if (modalAddOpen && !editingSantri && !formNis) {
      setFormNis(`2024${Math.floor(100 + Math.random() * 900)}`);
      setFormNama('');
      setFormKelas(selectedKelas || availableClassNames[0] || 'Tahfidz 1A (Juz 30)');
      setFormStatus('aktif');
      setFormWaliSantri('');
      setFormNoHp('');
      setFormAlamat('');
    }
  }, [modalAddOpen, editingSantri, formNis, selectedKelas, availableClassNames]);

  // Live reference to detailSantri so edits immediately reflect in passbook modal
  const detailSantri = useMemo(() => {
    if (!detailSantriId) return null;
    return santriList.find((s) => s.id === detailSantriId) || null;
  }, [detailSantriId, santriList]);

  // Real-time filtered Santri
  const filteredSantri = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return santriList.filter((s) => {
      const matchSearch =
        !q ||
        s.nama.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q) ||
        (s.wali_santri || '').toLowerCase().includes(q);
      const matchClass = !selectedKelas || s.kelas === selectedKelas;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'aktif' && s.status === 'aktif') ||
        (statusFilter === 'nonaktif' && s.status === 'nonaktif');
      return matchSearch && matchClass && matchStatus;
    });
  }, [santriList, searchTerm, selectedKelas, statusFilter]);

  // Filtered Kelas
  const filteredKelas = useMemo(() => {
    const q = kelasSearchTerm.trim().toLowerCase();
    return kelasList.filter((k) => {
      return (
        !q ||
        k.nama.toLowerCase().includes(q) ||
        (k.wali_kelas || '').toLowerCase().includes(q) ||
        (k.keterangan || '').toLowerCase().includes(q)
      );
    });
  }, [kelasList, kelasSearchTerm]);

  // Santri Handlers
  const openAddSantriModal = () => {
    setEditingSantri(null);
    setFormNis(`2024${Math.floor(100 + Math.random() * 900)}`);
    setFormNama('');
    setFormKelas(selectedKelas || availableClassNames[0] || 'Tahfidz 1A (Juz 30)');
    setFormStatus('aktif');
    setFormWaliSantri('');
    setFormNoHp('');
    setFormAlamat('');
    onSetModalAddOpen(true);
  };

  const openEditSantriModal = (santri: Santri) => {
    setEditingSantri(santri);
    setFormNis(santri.nis);
    setFormNama(santri.nama);
    setFormKelas(santri.kelas);
    setFormStatus(santri.status);
    setFormWaliSantri(santri.wali_santri || '');
    setFormNoHp(santri.no_hp || '');
    setFormAlamat(santri.alamat || '');
    onSetModalAddOpen(true);
  };

  const closeSantriModal = () => {
    onSetModalAddOpen(false);
    setEditingSantri(null);
  };

  const handleSantriSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNis.trim() || !formNama.trim() || !formKelas.trim()) {
      showToast('Mohon lengkapi NIS, Nama Lengkap, dan Kelas santri.', 'warning');
      return;
    }

    const success = onSaveSantri({
      id: editingSantri ? editingSantri.id : undefined,
      nis: formNis.trim(),
      nama: formNama.trim(),
      kelas: formKelas.trim(),
      status: formStatus,
      wali_santri: formWaliSantri.trim(),
      no_hp: formNoHp.trim(),
      alamat: formAlamat.trim(),
    });

    if (success !== false) {
      closeSantriModal();
    }
  };

  const handleOpenDeleteSantri = (santri: Santri) => {
    setDeletingSantri(santri);
  };

  const handleDeactivateSantriInstead = () => {
    if (!deletingSantri) return;
    onSaveSantri({
      id: deletingSantri.id,
      nis: deletingSantri.nis,
      nama: deletingSantri.nama,
      kelas: deletingSantri.kelas,
      status: 'nonaktif',
      wali_santri: deletingSantri.wali_santri,
      no_hp: deletingSantri.no_hp,
      alamat: deletingSantri.alamat,
    });
    setDeletingSantri(null);
  };

  const handleConfirmDeleteSantri = (deleteWithTransactions = false) => {
    if (!deletingSantri) return;
    if (detailSantriId === deletingSantri.id) {
      setDetailSantriId(null);
    }
    onDeleteSantri(deletingSantri.id, deleteWithTransactions);
    setDeletingSantri(null);
  };

  // Kelas Handlers
  const openAddKelasModal = () => {
    setEditingKelas(null);
    setFormKelasNama('');
    setFormKelasWali('');
    setFormKelasKet('');
    setModalKelasOpen(true);
  };

  const openEditKelasModal = (k: Kelas) => {
    setEditingKelas(k);
    setFormKelasNama(k.nama);
    setFormKelasWali(k.wali_kelas || '');
    setFormKelasKet(k.keterangan || '');
    setModalKelasOpen(true);
  };

  const handleKelasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKelasNama.trim()) {
      showToast('Nama kelas / halaqah wajib diisi!', 'warning');
      return;
    }

    const success = onSaveKelas({
      id: editingKelas ? editingKelas.id : undefined,
      nama: formKelasNama.trim(),
      wali_kelas: formKelasWali.trim(),
      keterangan: formKelasKet.trim(),
    });

    if (success !== false) {
      setModalKelasOpen(false);
      setEditingKelas(null);
    }
  };

  const handleOpenDeleteKelas = (k: Kelas) => {
    const otherClasses = kelasList.filter((item) => item.id !== k.id);
    setReassignClass(otherClasses[0]?.nama || 'Belum Ditentukan');
    setDeletingKelas(k);
  };

  const handleConfirmDeleteKelas = () => {
    if (!deletingKelas) return;
    if (selectedKelas === deletingKelas.nama) {
      setSelectedKelas('');
    }
    onDeleteKelas(deletingKelas.id, reassignClass);
    setDeletingKelas(null);
  };

  // Passbook data calculation
  const studentTxList = detailSantri
    ? transaksiList
        .filter((t) => t.id_santri === detailSantri.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    : [];

  const studentBalance = detailSantri
    ? calculateStudentBalance(detailSantri.id, transaksiList)
    : 0;

  const deletingSantriTxList = deletingSantri
    ? transaksiList.filter((t) => t.id_santri === deletingSantri.id)
    : [];
  const deletingSantriBalance = deletingSantri
    ? calculateStudentBalance(deletingSantri.id, transaksiList)
    : 0;

  const deletingClassStudents = deletingKelas
    ? santriList.filter((s) => s.kelas === deletingKelas.nama)
    : [];
  const otherClassesForReassign = deletingKelas
    ? kelasList.filter((k) => k.id !== deletingKelas.id)
    : [];

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Page Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            <span>Data Santri & Kelas</span>
            <span className="text-xs bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-bold px-2.5 py-0.5 rounded-full border border-teal-200/60 dark:border-teal-800 hidden sm:inline-block">
              Manajemen Lembaga
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm mt-0.5">
            Kelola buku simpanan santri, profil wali, dan pembagian kelompok halaqah.
          </p>
        </div>

        {/* Action Button: Add Santri or Add Kelas based on active tab */}
        <div className="w-full sm:w-auto">
          {activeTab === 'santri' ? (
            <button
              type="button"
              onClick={openAddSantriModal}
              className="w-full sm:w-auto h-12 sm:h-auto inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-teal-700 hover:bg-black dark:hover:bg-teal-800 text-white px-5 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-slate-900/10 active:scale-[0.98] transition-all cursor-pointer touch-manipulation"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Santri Baru</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={openAddKelasModal}
              className="w-full sm:w-auto h-12 sm:h-auto inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-teal-700 hover:bg-black dark:hover:bg-teal-800 text-white px-5 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-slate-900/10 active:scale-[0.98] transition-all cursor-pointer touch-manipulation"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Kelas Baru</span>
            </button>
          )}
        </div>
      </div>

      {/* SIDE-BY-SIDE TABS: [Data Santri] & [Kelola Kelas] */}
      <div className="flex bg-slate-200/70 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-300/50 dark:border-slate-700 shadow-inner max-w-md w-full transition-colors">
        <button
          type="button"
          onClick={() => setActiveTab('santri')}
          className={`flex-1 h-11 flex items-center justify-center gap-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer touch-manipulation active:scale-[0.98] ${
            activeTab === 'santri'
              ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs border border-slate-200/60 dark:border-slate-600'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Data Santri</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'santri'
                ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300'
                : 'bg-slate-300/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {santriList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('kelas')}
          className={`flex-1 h-11 flex items-center justify-center gap-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer touch-manipulation active:scale-[0.98] ${
            activeTab === 'kelas'
              ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-200 shadow-xs border border-slate-200/60 dark:border-slate-600'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>Kelola Kelas</span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              activeTab === 'kelas'
                ? 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300'
                : 'bg-slate-300/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {kelasList.length}
          </span>
        </button>
      </div>

      {/* ===================== TAB 1: DATA SANTRI ===================== */}
      {activeTab === 'santri' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* SEARCH BAR REAL-TIME & FILTER CONTROLS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 dark:border-slate-800 p-4 sm:p-5 space-y-3.5 transition-colors">
            {/* Real-time Search Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none text-slate-400 dark:text-slate-500">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari cepat nama santri, NIS, atau nama wali..."
                className="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-11 pr-11 h-12 font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition-all shadow-2xs"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-11 h-12 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer touch-manipulation"
                  title="Hapus pencarian"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Bar: Kelas & Status (Mobile Precision Grid) */}
            <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between pt-0.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-center gap-2.5 w-full md:w-auto">
                <div className="relative w-full">
                  <select
                    value={selectedKelas}
                    onChange={(e) => setSelectedKelas(e.target.value)}
                    className="w-full bg-slate-50/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 px-3.5 h-11 font-bold outline-none cursor-pointer transition-all shadow-2xs"
                  >
                    <option value="">Semua Kelas ({availableClassNames.length})</option>
                    {availableClassNames.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Segmented Buttons (equal widths, 44px friendly height) */}
                <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 h-11 items-center border border-slate-200/60 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setStatusFilter('all')}
                    className={`h-9 rounded-lg transition-all cursor-pointer flex items-center justify-center font-bold touch-manipulation active:scale-95 ${
                      statusFilter === 'all'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                        : 'hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('aktif')}
                    className={`h-9 rounded-lg transition-all cursor-pointer flex items-center justify-center font-bold touch-manipulation active:scale-95 ${
                      statusFilter === 'aktif'
                        ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs font-black'
                        : 'hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    Aktif
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusFilter('nonaktif')}
                    className={`h-9 rounded-lg transition-all cursor-pointer flex items-center justify-center font-bold touch-manipulation active:scale-95 ${
                      statusFilter === 'nonaktif'
                        ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs'
                        : 'hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    Non-Aktif
                  </button>
                </div>
              </div>

              {/* Real-time search counter feedback */}
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center justify-between sm:justify-start gap-1.5 pt-1 sm:pt-0">
                <span>Ditemukan:</span>
                <span className="font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-lg border border-teal-200/60 dark:border-teal-800">
                  {filteredSantri.length} dari {santriList.length} santri
                </span>
              </div>
            </div>
          </div>

          {/* SANTRI LIST (MOBILE CARDS + DESKTOP TABLE) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
            {/* Mobile View: High density stacked cards */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSantri.length === 0 ? (
                <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">
                  Tidak ada santri yang sesuai dengan kriteria filter/pencarian.
                </div>
              ) : (
                filteredSantri.map((s) => {
                  const balance = calculateStudentBalance(s.id, transaksiList);
                  const isInactive = s.status === 'nonaktif';

                  return (
                    <div
                      key={s.id}
                      className={`p-4 transition-colors ${
                        isInactive
                          ? 'opacity-65 bg-slate-50/40 dark:bg-slate-850'
                          : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Top: Avatar, Name, NIS & Status */}
                      <div className="flex items-start justify-between gap-2.5 mb-2.5">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-700 to-teal-500 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                            {s.nama.charAt(0)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="font-black text-slate-900 dark:text-slate-100 text-sm leading-tight truncate">
                              {s.nama}
                            </div>
                            <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 truncate">
                              NIS: {s.nis} {s.wali_santri ? `• Wali: ${s.wali_santri}` : ''}
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {s.status === 'aktif' ? (
                            <span className="bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                              Aktif
                            </span>
                          ) : (
                            <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                              Non-Aktif
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Middle: Class badge & Live Saldo */}
                      <div className="flex items-center justify-between gap-2 py-2 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-3 border border-slate-100/60 dark:border-slate-750">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[170px]">
                          {s.kelas}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-bold leading-none mb-0.5">
                            Saldo
                          </span>
                          <span className="font-black text-teal-800 dark:text-teal-300 text-sm tracking-tight">
                            {formatRupiah(balance)}
                          </span>
                        </div>
                      </div>

                      {/* Bottom: Action Buttons (Precision 12-col grid for mobile touch) */}
                      <div className="grid grid-cols-12 gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => setDetailSantriId(s.id)}
                          className="col-span-6 h-10 px-3 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/80 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer touch-manipulation shadow-2xs"
                        >
                          <BookOpen className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">Buku Tabungan</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditSantriModal(s)}
                          className="col-span-4 h-10 px-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/80 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-600 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer touch-manipulation shadow-2xs"
                          title="Edit Data Santri"
                        >
                          <Edit2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteSantri(s)}
                          className="col-span-2 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800/80 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-600 flex items-center justify-center transition-all active:scale-[0.98] cursor-pointer touch-manipulation shadow-2xs"
                          title="Hapus Santri"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop View: Full Master Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Profil Santri</th>
                    <th className="px-6 py-4">Kelas / Halaqah</th>
                    <th className="px-6 py-4 text-right">Saldo Aktif</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSantri.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">
                        Tidak ada santri yang cocok dengan kriteria pencarian.
                      </td>
                    </tr>
                  ) : (
                    filteredSantri.map((s) => {
                      const balance = calculateStudentBalance(s.id, transaksiList);
                      const isInactive = s.status === 'nonaktif';

                      return (
                        <tr
                          key={s.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isInactive ? 'opacity-65 bg-slate-50/40' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-sm shrink-0 border border-teal-200/60 shadow-xs">
                                {s.nama.charAt(0)}
                              </div>
                              <div>
                                <div className="font-black text-slate-900 text-sm">{s.nama}</div>
                                <div className="text-[11px] text-slate-400 font-mono tracking-wider">
                                  NIS: {s.nis}{' '}
                                  {s.wali_santri && (
                                    <span className="font-sans text-slate-400">
                                      • Wali: {s.wali_santri}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="font-bold text-slate-700 text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                              {s.kelas}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-right">
                            <span className="font-black text-teal-800 text-base tracking-tight bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-xl">
                              {formatRupiah(balance)}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            {s.status === 'aktif' ? (
                              <span className="bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                                Aktif
                              </span>
                            ) : (
                              <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                                Lulus / Non-Aktif
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setDetailSantriId(s.id)}
                                className="px-3 h-9 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-600 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                                title="Buku Simpanan (Mutasi)"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Buku</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openEditSantriModal(s)}
                                className="px-3 h-9 rounded-xl bg-amber-50 text-amber-700 border border-amber-200/70 hover:bg-amber-500 hover:text-white flex items-center gap-1 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
                                title="Edit Profil Santri"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteSantri(s)}
                                className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/70 hover:bg-rose-600 hover:text-white flex items-center justify-center transition-all shadow-2xs active:scale-95 cursor-pointer"
                                title="Hapus Data Santri"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: KELOLA KELAS ===================== */}
      {activeTab === 'kelas' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Class Search Bar */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={kelasSearchTerm}
                onChange={(e) => setKelasSearchTerm(e.target.value)}
                placeholder="Cari nama kelas, wali kelas, atau keterangan target hafalan..."
                className="bg-slate-50/80 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:bg-white focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-11 pr-10 py-3 font-semibold placeholder:text-slate-400 outline-none transition-all"
              />
              {kelasSearchTerm && (
                <button
                  type="button"
                  onClick={() => setKelasSearchTerm('')}
                  className="absolute inset-y-0 right-0 flex items-center justify-center w-10 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 font-medium shrink-0">
              Total <strong className="text-teal-700 font-bold">{filteredKelas.length}</strong> kelas halaqah
            </div>
          </div>

          {/* Grid of Class Cards */}
          {filteredKelas.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-100 flex flex-col items-center justify-center">
              <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-300">
                <FolderOpen className="w-7 h-7" />
              </div>
              <p className="text-slate-700 font-bold text-sm">Tidak ada kelas yang ditemukan</p>
              <p className="text-slate-400 text-xs mt-1">
                Klik tombol Tambah Kelas Baru untuk menambahkan kelompok halaqah baru.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
              {filteredKelas.map((k) => {
                const classStudents = santriList.filter((s) => s.kelas === k.nama);
                const activeCount = classStudents.filter((s) => s.status === 'aktif').length;

                let totalSaldoKelas = 0;
                classStudents.forEach((s) => {
                  totalSaldoKelas += calculateStudentBalance(s.id, transaksiList);
                });

                return (
                  <div
                    key={k.id}
                    className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:border-teal-200/80 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top line with Icon & Actions */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-100/70 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                            <BookOpen className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-black text-slate-900 text-sm sm:text-base leading-tight tracking-tight truncate">
                              {k.nama}
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1 mt-0.5 truncate">
                              <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{k.wali_kelas || 'Belum ada pengampu'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditKelasModal(k)}
                            className="px-2.5 h-8 rounded-xl bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white border border-amber-200/60 flex items-center gap-1 text-[11px] font-bold transition-all active:scale-95 cursor-pointer"
                            title="Edit Kelas"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteKelas(k)}
                            className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200/60 flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                            title="Hapus Kelas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Keterangan */}
                      {k.keterangan && (
                        <p className="text-xs text-slate-500 font-normal mb-3.5 line-clamp-2 leading-relaxed bg-slate-50/60 p-2.5 rounded-xl border border-slate-100/50">
                          {k.keterangan}
                        </p>
                      )}

                      {/* Stats Bar */}
                      <div className="grid grid-cols-2 gap-2 mb-3.5">
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100/60">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                            <Users className="w-3 h-3 text-slate-400" /> Santri
                          </div>
                          <div className="text-base font-black text-slate-800 tracking-tight">
                            {activeCount}{' '}
                            <span className="text-[10px] text-slate-400 font-normal">
                              / {classStudents.length}
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-teal-50/60 rounded-xl border border-teal-100/60">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-teal-700 uppercase tracking-wider mb-0.5">
                            <Wallet className="w-3 h-3 text-teal-600" /> Total Saldo
                          </div>
                          <div className="text-sm font-black text-teal-900 tracking-tight truncate">
                            {formatRupiah(totalSaldoKelas)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom link: filter santri to this class and switch tab */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedKelas(k.nama);
                        setActiveTab('santri');
                      }}
                      className="w-full mt-1 py-2 px-3 rounded-xl bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-teal-800 text-xs font-bold transition-all flex items-center justify-between group-hover:bg-teal-50/80 cursor-pointer"
                    >
                      <span>Lihat Santri Kelas Ini ({classStudents.length})</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: TAMBAH / EDIT SANTRI */}
      {modalAddOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={closeSantriModal}
          />
          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 border border-slate-100 dark:border-slate-800 my-8 text-slate-900 dark:text-slate-100 transition-colors">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {editingSantri ? 'Edit Data Santri' : 'Tambah Santri Baru'}
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                  {editingSantri
                    ? `Memperbarui profil santri ${editingSantri.nama}`
                    : 'Lengkapi identitas santri dan kelas halaqah'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeSantriModal}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSantriSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Nomor Induk (NIS) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formNis}
                    onChange={(e) => setFormNis(e.target.value)}
                    placeholder="Contoh: 2024001"
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3 font-bold outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Status Santri <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'aktif' | 'nonaktif')}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3 font-bold outline-none transition-all cursor-pointer"
                  >
                    <option value="aktif">Aktif Belajar</option>
                    <option value="nonaktif">Lulus / Non-Aktif</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Nama Lengkap Santri <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  placeholder="Ketik nama lengkap santri..."
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3 font-bold outline-none transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Kelas / Halaqah <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomClassMode(!isCustomClassMode);
                    }}
                    className="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    {isCustomClassMode ? '← Pilih dari Daftar' : '+ Ketik Kelas Baru'}
                  </button>
                </div>
                {isCustomClassMode ? (
                  <input
                    type="text"
                    required
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    placeholder="Contoh: Tahfidz 2B (Juz 29)"
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3 font-bold outline-none transition-all"
                  />
                ) : (
                  <select
                    required
                    value={formKelas}
                    onChange={(e) => setFormKelas(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3 font-bold outline-none transition-all cursor-pointer"
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {availableClassNames.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Data Wali & Kontak (Opsional) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Informasi Wali Santri & Kontak (Opsional)
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block mb-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      Nama Orang Tua / Wali
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={formWaliSantri}
                        onChange={(e) => setFormWaliSantri(e.target.value)}
                        placeholder="Nama wali santri"
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-10 pr-3.5 py-2.5 font-semibold outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      No. WhatsApp / Telepon
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={formNoHp}
                        onChange={(e) => setFormNoHp(e.target.value)}
                        placeholder="Contoh: 0812-3456-7890"
                        className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-10 pr-3.5 py-2.5 font-semibold outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Alamat Domisili
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="text"
                      value={formAlamat}
                      onChange={(e) => setFormAlamat(e.target.value)}
                      placeholder="Alamat lengkap santri..."
                      className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-10 pr-3.5 py-2.5 font-semibold outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={closeSantriModal}
                  className="w-full sm:flex-1 h-11 sm:h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer touch-manipulation active:scale-[0.98]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-2 h-11 sm:h-12 text-white bg-slate-900 dark:bg-teal-700 hover:bg-black dark:hover:bg-teal-800 font-bold rounded-2xl text-sm px-6 text-center transition-all shadow-md active:scale-[0.98] cursor-pointer touch-manipulation"
                >
                  {editingSantri ? 'Simpan Perubahan' : 'Tambah Santri'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS SANTRI */}
      {deletingSantri && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDeletingSantri(null)}
          />
          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 border border-slate-100 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100 transition-colors">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setDeletingSantri(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Hapus Santri "{deletingSantri.nama}"?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              NIS: <strong className="font-mono text-slate-700 dark:text-slate-300">{deletingSantri.nis}</strong> • Kelas:{' '}
              <strong className="text-slate-700 dark:text-slate-300">{deletingSantri.kelas}</strong>
            </p>

            {deletingSantriTxList.length > 0 ? (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 space-y-2.5">
                <p className="text-xs text-amber-900 dark:text-amber-300 font-bold leading-relaxed">
                  Santri ini memiliki <strong>{deletingSantriTxList.length} riwayat transaksi</strong> dengan saldo aktif{' '}
                  <strong>{formatRupiah(deletingSantriBalance)}</strong>.
                </p>
                <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
                  Anda dapat menonaktifkan status santri (agar histori buku kas tetap tersimpan), atau menghapus permanen santri beserta seluruh riwayat transaksinya.
                </p>
              </div>
            ) : (
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Santri ini belum memiliki riwayat transaksi dan aman dihapus.</span>
              </div>
            )}

            <div className="mt-5 space-y-2.5">
              {deletingSantriTxList.length > 0 && deletingSantri.status === 'aktif' && (
                <button
                  type="button"
                  onClick={handleDeactivateSantriInstead}
                  className="w-full h-11 px-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs sm:text-sm font-bold transition-all cursor-pointer touch-manipulation active:scale-[0.98]"
                >
                  Nonaktifkan Santri Saja (Simpan Riwayat)
                </button>
              )}

              <div className="flex flex-col-reverse sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeletingSantri(null)}
                  className="w-full sm:flex-1 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer touch-manipulation active:scale-[0.98]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmDeleteSantri(true)}
                  className="w-full sm:flex-1 h-11 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 active:scale-[0.98] transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {deletingSantriTxList.length > 0
                      ? 'Hapus Permanen'
                      : 'Ya, Hapus Santri'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH / UBAH KELAS */}
      {modalKelasOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setModalKelasOpen(false)}
          />
          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {editingKelas ? 'Edit Data Kelas' : 'Tambah Kelas Baru'}
                </h3>
                {editingKelas && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    Perubahan nama kelas otomatis diterapkan pada santri di kelas ini.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setModalKelasOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleKelasSubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Nama Kelas / Halaqah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formKelasNama}
                  onChange={(e) => setFormKelasNama(e.target.value)}
                  placeholder="Contoh: Tahfidz 1A (Juz 30)"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3.5 font-bold outline-none transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Wali Kelas / Ustadz Pengampu{' '}
                  <span className="text-slate-400 dark:text-slate-500 font-normal lowercase">(opsional)</span>
                </label>
                <input
                  type="text"
                  value={formKelasWali}
                  onChange={(e) => setFormKelasWali(e.target.value)}
                  placeholder="Contoh: Ustadz Ahmad Al-Hafidz"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3.5 font-bold outline-none transition-all"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Keterangan / Target Hafalan{' '}
                  <span className="text-slate-400 dark:text-slate-500 font-normal lowercase">(opsional)</span>
                </label>
                <textarea
                  rows={3}
                  value={formKelasKet}
                  onChange={(e) => setFormKelasKet(e.target.value)}
                  placeholder="Contoh: Tingkat dasar halaqah juz amma & tajwid harian..."
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3 font-medium outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalKelasOpen(false)}
                  className="w-full sm:flex-1 h-11 sm:h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm transition-all cursor-pointer touch-manipulation active:scale-[0.98]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-2 h-11 sm:h-12 text-white bg-slate-900 dark:bg-teal-700 hover:bg-black dark:hover:bg-teal-800 font-bold rounded-2xl text-sm px-6 text-center transition-all shadow-md active:scale-[0.98] cursor-pointer touch-manipulation flex items-center justify-center gap-2"
                >
                  {editingKelas ? 'Simpan Perubahan' : 'Tambah Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS KELAS */}
      {deletingKelas && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDeletingKelas(null)}
          />
          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 border border-slate-100 dark:border-slate-800 p-6 text-slate-900 dark:text-slate-100 transition-colors">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <button
                type="button"
                onClick={() => setDeletingKelas(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Hapus Kelas "{deletingKelas.nama}"?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Wali Kelas: <strong className="text-slate-700 dark:text-slate-300">{deletingKelas.wali_kelas || '-'}</strong>
            </p>

            {deletingClassStudents.length > 0 ? (
              <div className="mt-4 p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 space-y-3">
                <p className="text-xs text-amber-900 dark:text-amber-300 font-bold leading-relaxed">
                  Terdapat {deletingClassStudents.length} santri di kelas ini. Pilih kelas tujuan untuk memindahkan santri secara otomatis sebelum kelas dihapus:
                </p>
                <div>
                  <label className="block mb-1 text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                    Pindahkan {deletingClassStudents.length} Santri ke Kelas:
                  </label>
                  <select
                    value={reassignClass}
                    onChange={(e) => setReassignClass(e.target.value)}
                    className="w-full bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm rounded-xl px-3 py-2.5 font-bold outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                  >
                    {otherClassesForReassign.map((cls) => (
                      <option key={cls.id} value={cls.nama}>
                        {cls.nama}
                      </option>
                    ))}
                    <option value="Belum Ditentukan">Belum Ditentukan (Tanpa Kelas)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Kelas ini kosong (0 santri) dan aman untuk dihapus.</span>
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingKelas(null)}
                className="w-full sm:flex-1 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer touch-manipulation active:scale-[0.98]"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteKelas}
                className="w-full sm:flex-1 h-11 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 active:scale-[0.98] transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>
                  {deletingClassStudents.length > 0
                    ? 'Pindahkan & Hapus'
                    : 'Ya, Hapus Kelas'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BUKU TABUNGAN (MUTASI DETAIL) */}
      {detailSantri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDetailSantriId(null)}
          />
          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                    Buku Simpanan Santri
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold">
                    Detail profil, mutasi setoran & penarikan
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => openEditSantriModal(detailSantri)}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-500 dark:hover:bg-amber-600 text-amber-700 dark:text-amber-300 hover:text-white border border-amber-200/60 dark:border-amber-800 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  title="Edit Data Santri"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenDeleteSantri(detailSantri)}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-200/60 dark:border-rose-800 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  title="Hapus Santri"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hapus</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  title="Cetak Buku Simpanan"
                >
                  <Printer className="w-4 h-4" /> <span className="hidden sm:inline">Cetak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailSantriId(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile Bar */}
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="overflow-hidden space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-black text-lg sm:text-xl text-slate-900 dark:text-slate-100 tracking-tight truncate">
                    {detailSantri.nama}
                  </h4>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                      detailSantri.status === 'aktif'
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {detailSantri.status === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg shadow-2xs">
                    NIS: {detailSantri.nis}
                  </span>
                  <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg shadow-2xs">
                    {detailSantri.kelas}
                  </span>
                  {detailSantri.wali_santri && (
                    <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg shadow-2xs">
                      Wali: {detailSantri.wali_santri}
                    </span>
                  )}
                  {detailSantri.no_hp && (
                    <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-lg shadow-2xs">
                      HP: {detailSantri.no_hp}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-white dark:from-teal-950/50 dark:to-slate-850 border border-teal-100 dark:border-teal-800/80 p-3 sm:p-4 rounded-2xl text-left sm:text-right w-full sm:w-auto min-w-[180px] shadow-2xs shrink-0">
                <p className="text-[10px] text-teal-700 dark:text-teal-400 font-bold uppercase tracking-widest mb-0.5">
                  Total Saldo Aktif
                </p>
                <p className="text-xl sm:text-2xl font-black text-teal-800 dark:text-teal-300 tracking-tight">
                  {formatRupiah(studentBalance)}
                </p>
              </div>
            </div>

            {/* Passbook Mutation List */}
            <div className="flex-1 overflow-y-auto">
              {studentTxList.length === 0 ? (
                <div className="py-16 px-6 text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center mb-3 text-slate-300 dark:text-slate-600">
                    <FolderOpen className="w-7 h-7" />
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-bold text-sm">Belum ada riwayat mutasi</p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
                    Santri ini belum memiliki aktivitas simpanan atau penarikan.
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Passbook Cards */}
                  <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {studentTxList.map((tx) => {
                      const isVoid = tx.status === 'void';
                      const isDeposit = tx.jenis === 'setoran';

                      return (
                        <div
                          key={tx.id}
                          className={`p-3.5 ${isVoid ? 'bg-slate-50/60 dark:bg-slate-800/40 opacity-60' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] ${
                                  isDeposit
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                }`}
                              >
                                {isDeposit ? (
                                  <ArrowDownLeft className="w-3 h-3" />
                                ) : (
                                  <ArrowUpRight className="w-3 h-3" />
                                )}
                              </span>
                              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                {formatDate(tx.tanggal)}
                              </span>
                              {isVoid && (
                                <span className="text-[9px] bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded uppercase">
                                  VOID
                                </span>
                              )}
                            </div>
                            <div
                              className={`font-black text-sm ${
                                isVoid
                                  ? 'text-slate-400 dark:text-slate-500 line-through'
                                  : isDeposit
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {isDeposit ? '+' : '-'} {formatRupiah(tx.nominal)}
                            </div>
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium pl-6 truncate">
                            {tx.keterangan || 'Tanpa keterangan'}
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 pl-6 mt-1 font-mono">
                            <span>{tx.no_ref}</span>
                            <span className="font-sans text-slate-600 dark:text-slate-300 font-bold">
                              Saldo: {isVoid ? '-' : formatRupiah(tx.saldo_setelah)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Passbook Table */}
                  <table className="hidden sm:table w-full text-sm text-left">
                    <thead className="bg-white dark:bg-slate-900 sticky top-0 shadow-2xs border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider z-10">
                      <tr>
                        <th className="px-6 py-3.5">Tanggal & Ket</th>
                        <th className="px-6 py-3.5 text-right">Mutasi (Rp)</th>
                        <th className="px-6 py-3.5 text-right">Saldo (Rp)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {studentTxList.map((tx) => {
                        const isVoid = tx.status === 'void';
                        const isDeposit = tx.jenis === 'setoran';

                        return (
                          <tr
                            key={tx.id}
                            className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors ${
                              isVoid ? 'bg-slate-50/50 dark:bg-slate-800/30 opacity-60' : ''
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] ${
                                    isDeposit
                                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                                  }`}
                                >
                                  {isDeposit ? (
                                    <ArrowDownLeft className="w-3 h-3" />
                                  ) : (
                                    <ArrowUpRight className="w-3 h-3" />
                                  )}
                                </span>
                                <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                                  {formatDate(tx.tanggal)}
                                </span>
                                {isVoid && (
                                  <span className="text-[9px] bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold px-1.5 py-0.5 rounded uppercase">
                                    VOID
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium pl-7 truncate max-w-sm">
                                {tx.keterangan || 'Tanpa keterangan'}
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-slate-500 pl-7 font-mono mt-0.5">
                                {tx.no_ref}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-right">
                              <div
                                className={`font-black text-sm ${
                                  isVoid
                                    ? 'text-slate-400 dark:text-slate-500 line-through'
                                    : isDeposit
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-rose-600 dark:text-rose-400'
                                }`}
                              >
                                {isDeposit ? '+' : '-'} {formatRupiah(tx.nominal)}
                              </div>
                            </td>

                            <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-slate-100 text-sm">
                              {isVoid ? '-' : formatRupiah(tx.saldo_setelah)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

