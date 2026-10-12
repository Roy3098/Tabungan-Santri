import React, { useState } from 'react';
import { Santri, Transaksi } from '../types';
import { formatRupiah, formatDate } from '../utils/formatters';
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface RiwayatViewProps {
  santriList: Santri[];
  transaksiList: Transaksi[];
  onVoidTransaksi: (txId: string, reason: string) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const RiwayatView: React.FC<RiwayatViewProps> = ({
  santriList,
  transaksiList,
  onVoidTransaksi,
  showToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Void modal state
  const [voidingTx, setVoidingTx] = useState<Transaksi | null>(null);
  const [voidReason, setVoidReason] = useState('');

  const filteredTransactions = [...transaksiList]
    .filter((tx) => {
      const student = santriList.find((s) => s.id === tx.id_santri);
      const studentName = student?.nama.toLowerCase() || '';
      const ref = tx.no_ref.toLowerCase();
      const notes = (tx.keterangan || '').toLowerCase();
      const q = searchTerm.toLowerCase();

      const matchesSearch = !searchTerm || ref.includes(q) || studentName.includes(q) || notes.includes(q);

      let matchesType = true;
      if (filterType === 'setoran') {
        matchesType = tx.jenis === 'setoran' && tx.status === 'valid';
      } else if (filterType === 'penarikan') {
        matchesType = tx.jenis === 'penarikan' && tx.status === 'valid';
      } else if (filterType === 'void') {
        matchesType = tx.status === 'void';
      }

      const matchesDate = !filterDate || tx.tanggal === filterDate;

      return matchesSearch && matchesType && matchesDate;
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const handleOpenVoidModal = (tx: Transaksi) => {
    setVoidingTx(tx);
    setVoidReason('');
  };

  const handleConfirmVoid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!voidingTx) return;

    if (!voidReason.trim()) {
      showToast('Wajib mengisi alasan pembatalan transaksi.', 'warning');
      return;
    }

    onVoidTransaksi(voidingTx.id, voidReason.trim());
    showToast(`Transaksi ${voidingTx.no_ref} berhasil dibatalkan.`, 'info');
    setVoidingTx(null);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterDate('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          Riwayat & Koreksi
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-0.5">
          Jejak audit seluruh transaksi simpanan santri beserta fasilitas koreksi.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3.5 bg-slate-50/60 dark:bg-slate-800/40">
          {/* Real-time Search Input */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center justify-center w-11 pointer-events-none text-slate-400 dark:text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari no. referensi, nama santri, atau catatan..."
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-sm rounded-2xl focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-11 pr-11 h-12 font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none shadow-2xs transition-all"
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

          {/* Quick Segmented Filter Tabs (One-touch filter for mobile) */}
          <div className="grid grid-cols-4 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setFilterType('')}
              className={`h-9 rounded-xl transition-all cursor-pointer flex items-center justify-center font-bold touch-manipulation active:scale-95 ${
                filterType === ''
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setFilterType('setoran')}
              className={`h-9 rounded-xl transition-all cursor-pointer flex items-center justify-center font-bold touch-manipulation active:scale-95 ${
                filterType === 'setoran'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-400 shadow-xs font-black'
                  : 'hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Setoran
            </button>
            <button
              type="button"
              onClick={() => setFilterType('penarikan')}
              className={`h-9 rounded-xl transition-all cursor-pointer flex items-center justify-center font-bold touch-manipulation active:scale-95 ${
                filterType === 'penarikan'
                  ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs font-black'
                  : 'hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Penarikan
            </button>
            <button
              type="button"
              onClick={() => setFilterType('void')}
              className={`h-9 rounded-xl transition-all cursor-pointer flex items-center justify-center font-bold touch-manipulation active:scale-95 ${
                filterType === 'void'
                  ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Batal
            </button>
          </div>

          {/* Date Picker & Reset Filter (Precision Mobile Grid) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-1">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs sm:text-sm rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 px-3.5 h-10 font-bold shadow-2xs outline-none cursor-pointer flex-1 transition-all"
                title="Filter Tanggal Transaksi"
              />

              {(searchTerm || filterType || filterDate) && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="h-10 px-3.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer touch-manipulation active:scale-95 shrink-0 flex items-center gap-1.5"
                  title="Reset Semua Filter"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium sm:text-right">
              Menampilkan <strong className="text-teal-700 dark:text-teal-400 font-bold">{filteredTransactions.length}</strong> transaksi
            </div>
          </div>
        </div>

        {/* Mobile View: High-density cards with ZERO horizontal scrolling */}
        <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 dark:text-slate-500 font-medium text-xs">
              Tidak ada riwayat transaksi yang cocok dengan kriteria filter/pencarian.
            </div>
          ) : (
            filteredTransactions.map((tx) => {
              const student = santriList.find((s) => s.id === tx.id_santri);
              const isVoid = tx.status === 'void';
              const isDeposit = tx.jenis === 'setoran';

              return (
                <div
                  key={tx.id}
                  className={`p-4 transition-colors ${
                    isVoid ? 'opacity-60 bg-slate-50/40 dark:bg-slate-850' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Top row: Date & Ref + Badge */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                        {formatDate(tx.tanggal)}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {tx.no_ref}
                      </div>
                    </div>

                    <div>
                      {isVoid ? (
                        <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          VOID
                        </span>
                      ) : isDeposit ? (
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          <ArrowDownLeft className="w-2.5 h-2.5" /> Setoran
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[9px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          <ArrowUpRight className="w-2.5 h-2.5" /> Penarikan
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Middle row: Student Name & Keterangan */}
                  <div className="mb-2.5">
                    <div className="font-black text-slate-900 dark:text-slate-100 text-sm">
                      {student?.nama || 'Santri Terhapus'}
                    </div>
                    {tx.keterangan && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 leading-snug">
                        {tx.keterangan}
                      </p>
                    )}
                  </div>

                  {/* Bottom row: Nominal, Running Saldo, and Action */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100/70 dark:border-slate-800">
                    <div>
                      <div
                        className={`font-black text-sm sm:text-base ${
                          isVoid
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : isDeposit
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {isDeposit ? '+' : '-'} {formatRupiah(tx.nominal)}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        Sisa: {isVoid ? '-' : formatRupiah(tx.saldo_setelah)}
                      </div>
                    </div>

                    {!isVoid ? (
                      <button
                        type="button"
                        onClick={() => handleOpenVoidModal(tx)}
                        className="h-9 px-3.5 rounded-xl inline-flex items-center gap-1.5 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 hover:text-white border border-rose-200 dark:border-rose-800 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs touch-manipulation"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> Batalkan
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        Dibatalkan
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop View: Full Wide Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4">Ref & Tanggal</th>
                <th className="px-6 py-4">Rincian Santri</th>
                <th className="px-6 py-4 text-right">Nominal</th>
                <th className="px-6 py-4 text-center">Aksi / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                    Tidak ada riwayat transaksi yang cocok dengan kriteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const student = santriList.find((s) => s.id === tx.id_santri);
                  const isVoid = tx.status === 'void';
                  const isDeposit = tx.jenis === 'setoran';

                  return (
                    <tr
                      key={tx.id}
                      className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors ${
                        isVoid ? 'opacity-60 bg-slate-50/40 dark:bg-slate-850' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {formatDate(tx.tanggal)}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tracking-wider mt-0.5">
                          {tx.no_ref}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-black text-slate-900 dark:text-slate-100 text-sm mb-1">
                          {student?.nama || 'Santri Terhapus'}
                        </div>
                        <div className="flex items-center gap-2">
                          {isVoid ? (
                            <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              DIBATALKAN
                            </span>
                          ) : isDeposit ? (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Setoran
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                              <ArrowUpRight className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Penarikan
                            </span>
                          )}
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                            {tx.keterangan || '-'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div
                          className={`font-black text-base ${
                            isVoid
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : isDeposit
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isDeposit ? '+' : '-'} {formatRupiah(tx.nominal)}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-bold">
                          Sisa: {isVoid ? '-' : formatRupiah(tx.saldo_setelah)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {!isVoid ? (
                          <button
                            onClick={() => handleOpenVoidModal(tx)}
                            className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-600 hover:text-white border border-rose-200 dark:border-rose-800 text-xs font-bold px-3 py-1.5 rounded-xl transition-all active:scale-95 cursor-pointer shadow-xs"
                            title="Batalkan / Koreksi Transaksi"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Batalkan
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            Voided
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: KONFIRMASI PEMBATALAN (VOID) */}
      {voidingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setVoidingTx(null)}
          />
          <div className="relative z-10 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm p-6 sm:p-7 text-center animate-in fade-in zoom-in-95 border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-colors">
            <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60 text-rose-500 dark:text-rose-400 flex items-center justify-center text-2xl mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-1 tracking-tight">
              Batalkan Transaksi?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-5 leading-relaxed">
              Membatalkan <strong className="text-slate-800 dark:text-slate-200">{voidingTx.no_ref}</strong> akan
              mengembalikan saldo santri sesuai mutasi semula.
            </p>

            <form onSubmit={handleConfirmVoid} className="space-y-4 text-left">
              <div>
                <label className="block mb-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                  Alasan Pembatalan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Contoh: Salah input nominal / salah santri"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 block w-full px-4 py-3 font-semibold outline-none transition-all"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setVoidingTx(null)}
                  className="w-full sm:flex-1 h-11 sm:h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-bold transition-all cursor-pointer touch-manipulation active:scale-[0.98]"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="w-full sm:flex-1 h-11 sm:h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/20 transition-all active:scale-[0.98] cursor-pointer touch-manipulation flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ya, Batalkan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
