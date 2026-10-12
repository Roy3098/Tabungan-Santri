import React, { useState } from 'react';
import { Kelas, Santri, Transaksi } from '../types';
import { formatRupiah, calculateStudentBalance } from '../utils/formatters';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  Wallet,
  X,
  UserCheck,
  ArrowRight,
  FolderOpen,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface KelasViewProps {
  kelasList: Kelas[];
  santriList: Santri[];
  transaksiList: Transaksi[];
  onSaveKelas: (kelasData: {
    id?: string;
    nama: string;
    wali_kelas?: string;
    keterangan?: string;
  }) => boolean | void;
  onDeleteKelas: (id: string, reassignToClass?: string) => void;
  onNavigateToSantriWithClassFilter: (className: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const KelasView: React.FC<KelasViewProps> = ({
  kelasList,
  santriList,
  transaksiList,
  onSaveKelas,
  onDeleteKelas,
  onNavigateToSantriWithClassFilter,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingKelas, setEditingKelas] = useState<Kelas | null>(null);

  // Delete confirmation modal state
  const [deletingKelas, setDeletingKelas] = useState<Kelas | null>(null);
  const [reassignClass, setReassignClass] = useState<string>('');

  // Form states
  const [formNama, setFormNama] = useState('');
  const [formWali, setFormWali] = useState('');
  const [formKet, setFormKet] = useState('');

  const filteredKelas = kelasList.filter((k) => {
    const q = searchTerm.trim().toLowerCase();
    return (
      !q ||
      k.nama.toLowerCase().includes(q) ||
      (k.wali_kelas || '').toLowerCase().includes(q) ||
      (k.keterangan || '').toLowerCase().includes(q)
    );
  });

  const openAddModal = () => {
    setEditingKelas(null);
    setFormNama('');
    setFormWali('');
    setFormKet('');
    setModalOpen(true);
  };

  const openEditModal = (k: Kelas) => {
    setEditingKelas(k);
    setFormNama(k.nama);
    setFormWali(k.wali_kelas || '');
    setFormKet(k.keterangan || '');
    setModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNama.trim()) {
      showToast('Nama kelas / halaqah wajib diisi!', 'warning');
      return;
    }

    const success = onSaveKelas({
      id: editingKelas ? editingKelas.id : undefined,
      nama: formNama.trim(),
      wali_kelas: formWali.trim(),
      keterangan: formKet.trim(),
    });

    if (success !== false) {
      setModalOpen(false);
      setEditingKelas(null);
    }
  };

  const openDeleteModal = (k: Kelas) => {
    const otherClasses = kelasList.filter((item) => item.id !== k.id);
    setReassignClass(otherClasses[0]?.nama || 'Belum Ditentukan');
    setDeletingKelas(k);
  };

  const confirmDeleteKelas = () => {
    if (!deletingKelas) return;
    onDeleteKelas(deletingKelas.id, reassignClass);
    setDeletingKelas(null);
  };

  const deletingClassStudents = deletingKelas
    ? santriList.filter((s) => s.kelas === deletingKelas.nama)
    : [];
  const otherClassesForReassign = deletingKelas
    ? kelasList.filter((k) => k.id !== deletingKelas.id)
    : [];

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Kelola Kelas & Halaqah
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm mt-0.5">
            Atur pembagian kelompok halaqah, wali kelas, dan pantau tabungan per kelas.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-teal-700 hover:bg-black dark:hover:bg-teal-800 text-white px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md active:scale-[0.98] transition-all cursor-pointer w-full sm:w-auto h-12 sm:h-auto touch-manipulation"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Kelas Baru</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 dark:border-slate-800 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between transition-colors">
        <div className="relative flex-1 w-full">
          <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari nama kelas, wali kelas, atau keterangan..."
            className="bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-11 pr-11 h-12 font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none shadow-2xs transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 flex items-center justify-center w-11 h-12 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer touch-manipulation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 font-medium shrink-0">
          Menampilkan <strong className="text-teal-700 dark:text-teal-400 font-bold">{filteredKelas.length}</strong> dari{' '}
          {kelasList.length} kelas
        </div>
      </div>

      {/* Grid of Class Cards */}
      {filteredKelas.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center transition-colors">
          <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center mb-3 text-slate-300 dark:text-slate-600">
            <FolderOpen className="w-7 h-7" />
          </div>
          <p className="text-slate-700 dark:text-slate-300 font-bold text-sm">Tidak ada kelas yang ditemukan</p>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
            Klik tombol Tambah Kelas Baru untuk menambahkan kelompok halaqah.
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
                className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-100 dark:border-slate-800 shadow-xs hover:border-teal-200/80 dark:hover:border-teal-800 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top line with Icon & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-100/70 dark:border-teal-800 text-teal-700 dark:text-teal-400 flex items-center justify-center font-bold text-sm shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-tight tracking-tight truncate">
                          {k.nama}
                        </h3>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1 mt-0.5 truncate">
                          <UserCheck className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{k.wali_kelas || 'Belum ada pengampu'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditModal(k)}
                        className="px-2.5 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-500 dark:hover:bg-amber-600 text-amber-700 dark:text-amber-300 hover:text-white border border-amber-200/60 dark:border-amber-800 flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer touch-manipulation"
                        title="Edit Kelas"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openDeleteModal(k)}
                        className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white border border-rose-200/60 dark:border-rose-800 flex items-center justify-center transition-all active:scale-95 cursor-pointer touch-manipulation"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Keterangan */}
                  {k.keterangan && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mb-3.5 line-clamp-2 leading-relaxed bg-slate-50/60 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100/50 dark:border-slate-700/50">
                      {k.keterangan}
                    </p>
                  )}

                  {/* Stats Bar */}
                  <div className="grid grid-cols-2 gap-2 mb-3.5">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-100/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                        <Users className="w-3 h-3 text-slate-400" /> Santri
                      </div>
                      <div className="text-base font-black text-slate-800 dark:text-slate-200 tracking-tight">
                        {activeCount}{' '}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                          / {classStudents.length}
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-teal-50/60 dark:bg-teal-950/40 rounded-xl border border-teal-100/60 dark:border-teal-800/60">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-0.5">
                        <Wallet className="w-3 h-3 text-teal-600 dark:text-teal-400" /> Total Saldo
                      </div>
                      <div className="text-sm font-black text-teal-900 dark:text-teal-200 tracking-tight truncate">
                        {formatRupiah(totalSaldoKelas)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom link to view students in this class */}
                <button
                  type="button"
                  onClick={() => onNavigateToSantriWithClassFilter(k.nama)}
                  className="w-full mt-1 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/60 text-slate-600 dark:text-slate-300 hover:text-teal-800 dark:hover:text-teal-300 text-xs font-bold transition-all flex items-center justify-between group-hover:bg-teal-50/80 cursor-pointer"
                >
                  <span>Lihat Santri Kelas Ini ({classStudents.length})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: TAMBAH / UBAH KELAS */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  {editingKelas ? 'Edit Data Kelas / Halaqah' : 'Tambah Kelas Baru'}
                </h3>
                {editingKelas && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
                    Perubahan nama kelas otomatis diterapkan pada santri di kelas ini.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Nama Kelas / Halaqah <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
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
                  value={formWali}
                  onChange={(e) => setFormWali(e.target.value)}
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
                  value={formKet}
                  onChange={(e) => setFormKet(e.target.value)}
                  placeholder="Contoh: Tingkat dasar halaqah juz amma & tajwid harian..."
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3 font-medium outline-none transition-all resize-none"
                />
              </div>

              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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

      {/* MODAL: KONFIRMASI HAPUS KELAS (DENGAN REASSIGN SANTRI) */}
      {deletingKelas && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
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
                onClick={confirmDeleteKelas}
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
    </div>
  );
};
