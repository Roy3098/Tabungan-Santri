import React from 'react';
import { Santri, Transaksi, ViewType } from '../types';
import { formatRupiah, formatDate, formatTime, calculateStudentBalance } from '../utils/formatters';
import {
  Wallet,
  Users,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  MinusCircle,
  UserPlus,
  Inbox,
  ArrowRight,
} from 'lucide-react';

interface DashboardViewProps {
  santriList: Santri[];
  transaksiList: Transaksi[];
  totalKelasCount: number;
  onNavigate: (view: ViewType, extra?: { txType?: 'setoran' | 'penarikan' }) => void;
  onOpenAddSantri: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  santriList,
  transaksiList,
  totalKelasCount,
  onNavigate,
  onOpenAddSantri,
}) => {
  // Statistics calculations
  let totalSaldo = 0;
  santriList.forEach((s) => {
    totalSaldo += calculateStudentBalance(s.id, transaksiList);
  });

  const activeSantriCount = santriList.filter((s) => s.status === 'aktif').length;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let setoranBulanIni = 0;
  let penarikanBulanIni = 0;

  transaksiList
    .filter((t) => t.status !== 'void')
    .forEach((t) => {
      const d = new Date(t.tanggal);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        if (t.jenis === 'setoran') setoranBulanIni += t.nominal;
        if (t.jenis === 'penarikan') penarikanBulanIni += t.nominal;
      }
    });

  // Recent 5 transactions
  const recentTransactions = [...transaksiList]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Ringkasan
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm mt-0.5">
            Pantau aktivitas simpanan santri secara real-time.
          </p>
        </div>

        {/* Quick action buttons (Precision 2x2 grid on mobile, inline on desktop) */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onNavigate('transaksi', { txType: 'setoran' })}
            className="h-11 sm:h-10 px-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-2xs active:scale-[0.98] transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>+ Setoran</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('transaksi', { txType: 'penarikan' })}
            className="h-11 sm:h-10 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-2xs active:scale-[0.98] transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-1.5"
          >
            <MinusCircle className="w-4 h-4 shrink-0" />
            <span>- Penarikan</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddSantri}
            className="h-11 sm:h-10 px-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs active:scale-[0.98] transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-1.5"
          >
            <UserPlus className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>+ Santri</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('santri')}
            className="h-11 sm:h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-2xs active:scale-[0.98] transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
            <span>Kelas ({totalKelasCount})</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
        {/* Total Saldo (Hero Card) - spans 2 cols on mobile */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-teal-800 via-teal-700 to-teal-600 rounded-2xl sm:rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-teal-900/15 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-start mb-3 relative z-10">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xs">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border border-white/20">
              Aktif
            </span>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] sm:text-[11px] font-bold text-teal-100 uppercase tracking-widest mb-1 opacity-90">
              Total Saldo Santri
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight drop-shadow-xs">
              {formatRupiah(totalSaldo)}
            </h3>
          </div>
        </div>

        {/* Santri Terdaftar */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-3">
            <Users className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
              Santri Aktif
            </p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {activeSantriCount}
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                / {santriList.length} total
              </span>
            </div>
          </div>
        </div>

        {/* Setoran Bulan Ini */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
            <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
              Setoran Bulan Ini
            </p>
            <h3 className="text-base sm:text-xl md:text-2xl font-black text-emerald-700 dark:text-emerald-400 tracking-tight truncate">
              {formatRupiah(setoranBulanIni)}
            </h3>
          </div>
        </div>

        {/* Penarikan Bulan Ini */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-3">
            <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">
              Penarikan Bulan Ini
            </p>
            <h3 className="text-base sm:text-xl md:text-2xl font-black text-rose-600 dark:text-rose-400 tracking-tight truncate">
              {formatRupiah(penarikanBulanIni)}
            </h3>
          </div>
        </div>
      </div>

      {/* Recent Transactions Section (Responsive for Mobile & Desktop) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-base sm:text-lg tracking-tight">
              Aktivitas Terbaru
            </h3>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
              5 Terkini
            </span>
          </div>
          <button
            onClick={() => onNavigate('riwayat')}
            className="inline-flex items-center text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100/80 dark:hover:bg-teal-900/60 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-colors gap-1 cursor-pointer"
          >
            Semua <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-12 sm:py-16 px-6 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full flex items-center justify-center mb-2.5 text-slate-300 dark:text-slate-600">
              <Inbox className="w-7 h-7" />
            </div>
            <p className="text-slate-700 dark:text-slate-300 font-bold text-sm">Belum ada transaksi</p>
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
              Transaksi yang dicatat akan otomatis muncul di sini.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: Compact Card List */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map((tx) => {
                const student = santriList.find((s) => s.id === tx.id_santri);
                const isVoid = tx.status === 'void';
                const isDeposit = tx.jenis === 'setoran';

                return (
                  <div
                    key={tx.id}
                    className={`p-4 transition-colors ${
                      isVoid
                        ? 'opacity-50 bg-slate-50/40 dark:bg-slate-850'
                        : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                          {student?.nama || 'Santri Terhapus'}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                          {formatDate(tx.tanggal)} • {formatTime(tx.created_at)}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`font-black text-sm ${
                            isVoid
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : isDeposit
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {isDeposit ? '+' : '-'} {formatRupiah(tx.nominal)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100/60 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        {isVoid ? (
                          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                            VOID
                          </span>
                        ) : isDeposit ? (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                            <ArrowDownLeft className="w-2.5 h-2.5" /> Setoran
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
                            <ArrowUpRight className="w-2.5 h-2.5" /> Penarikan
                          </span>
                        )}
                        <span className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                          {tx.keterangan || '-'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                        {tx.no_ref}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW: Full Wide Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Santri & Waktu</th>
                    <th className="px-6 py-4">Jenis Transaksi</th>
                    <th className="px-6 py-4">Keterangan</th>
                    <th className="px-6 py-4 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentTransactions.map((tx) => {
                    const student = santriList.find((s) => s.id === tx.id_santri);
                    const isVoid = tx.status === 'void';
                    const isDeposit = tx.jenis === 'setoran';

                    return (
                      <tr
                        key={tx.id}
                        className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors ${
                          isVoid ? 'opacity-50 bg-slate-50/40 dark:bg-slate-850' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                            {student?.nama || 'Santri tidak ditemukan'}
                          </div>
                          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                            {formatDate(tx.tanggal)} • {formatTime(tx.created_at)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {isVoid ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                              Dibatalkan (Void)
                            </span>
                          ) : isDeposit ? (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                              <ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Setoran
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800">
                              <ArrowUpRight className="w-3 h-3 text-rose-600 dark:text-rose-400" /> Penarikan
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate font-medium">
                          {tx.keterangan || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div
                            className={`font-black text-sm ${
                              isVoid
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : isDeposit
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isDeposit ? '+' : '-'} {formatRupiah(tx.nominal)}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">
                            {tx.no_ref}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
