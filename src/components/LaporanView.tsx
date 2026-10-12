import React from 'react';
import { Santri, Transaksi } from '../types';
import {
  formatRupiah,
  exportSantriLedgerToCSV,
} from '../utils/formatters';
import { FileSpreadsheet, Printer, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { AppLogo } from './AppLogo';

interface LaporanViewProps {
  santriList: Santri[];
  transaksiList: Transaksi[];
  lembagaName: string;
  petugasName: string;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const LaporanView: React.FC<LaporanViewProps> = ({
  santriList,
  transaksiList,
  lembagaName,
  petugasName,
  showToast,
}) => {
  const [selectedKelas, setSelectedKelas] = React.useState<string>('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'aktif' | 'nonaktif'>('all');
  const [searchTerm, setSearchTerm] = React.useState<string>('');

  // Extract unique class list
  const availableClassNames = React.useMemo(() => {
    return Array.from(new Set(santriList.map((s) => s.kelas).filter(Boolean))).sort();
  }, [santriList]);

  // Filter santri
  const filteredSantri = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return santriList.filter((s) => {
      const matchSearch =
        !q ||
        s.nama.toLowerCase().includes(q) ||
        s.nis.toLowerCase().includes(q);
      const matchClass = !selectedKelas || s.kelas === selectedKelas;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'aktif' && s.status === 'aktif') ||
        (statusFilter === 'nonaktif' && s.status === 'nonaktif');
      return matchSearch && matchClass && matchStatus;
    });
  }, [santriList, searchTerm, selectedKelas, statusFilter]);

  // Sort santri by class then by name
  const sortedSantri = React.useMemo(() => {
    return [...filteredSantri].sort((a, b) => {
      if (a.kelas === b.kelas) {
        return a.nama.localeCompare(b.nama);
      }
      return (a.kelas || '').localeCompare(b.kelas || '');
    });
  }, [filteredSantri]);

  let grandTotalSetoran = 0;
  let grandTotalPenarikan = 0;
  let grandTotalSaldo = 0;

  const santriReportData = sortedSantri.map((s, index) => {
    let totalSetoran = 0;
    let totalPenarikan = 0;

    transaksiList
      .filter((t) => t.id_santri === s.id && t.status !== 'void')
      .forEach((t) => {
        if (t.jenis === 'setoran') totalSetoran += t.nominal;
        if (t.jenis === 'penarikan') totalPenarikan += t.nominal;
      });

    const saldoAkhir = totalSetoran - totalPenarikan;
    grandTotalSetoran += totalSetoran;
    grandTotalPenarikan += totalPenarikan;
    grandTotalSaldo += saldoAkhir;

    return {
      no: index + 1,
      santri: s,
      totalSetoran,
      totalPenarikan,
      saldoAkhir,
    };
  });

  const handleExportCSV = () => {
    exportSantriLedgerToCSV(sortedSantri, transaksiList, lembagaName);
    showToast('Laporan saldo berhasil diekspor ke format CSV!', 'success');
  };

  const todayLongFormat = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300">
      {/* Screen Header & Action Buttons (Hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            Laporan Saldo
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm mt-0.5">
            Unduh atau cetak rekapitulasi buku besar saldo santri.
          </p>
        </div>

        {/* Action Buttons: 2-col precision on mobile */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportCSV}
            className="h-11 px-3 sm:px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-bold shadow-2xs active:scale-95 transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="truncate">Unduh Excel</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="h-11 px-4 sm:px-5 rounded-xl bg-slate-900 dark:bg-teal-700 hover:bg-black dark:hover:bg-teal-800 text-white text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-all cursor-pointer touch-manipulation flex items-center justify-center gap-1.5"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span className="truncate">Cetak Dokumen</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR FOR LAPORAN (Mobile Precision Grid) */}
      <div className="no-print bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 dark:border-slate-800 p-4 space-y-3 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari santri di laporan..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-3.5 h-10 font-bold outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Select Kelas */}
          <div>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm rounded-xl px-3.5 h-10 font-bold outline-none cursor-pointer"
            >
              <option value="">Semua Kelas ({availableClassNames.length})</option>
              {availableClassNames.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          {/* Status Segmented Buttons */}
          <div className="grid grid-cols-3 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 h-10 items-center border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`h-8 rounded-lg transition-all cursor-pointer flex items-center justify-center font-bold touch-manipulation active:scale-95 ${
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
              className={`h-8 rounded-lg transition-all cursor-pointer flex items-center justify-center font-bold touch-manipulation active:scale-95 ${
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
              className={`h-8 rounded-lg transition-all cursor-pointer flex items-center justify-center font-bold touch-manipulation active:scale-95 ${
                statusFilter === 'nonaktif'
                  ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-xs'
                  : 'hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Non-Aktif
            </button>
          </div>
        </div>

        {(searchTerm || selectedKelas || statusFilter !== 'all') && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-400 dark:text-slate-500">
              Menampilkan {santriReportData.length} santri
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedKelas('');
                setStatusFilter('all');
              }}
              className="text-teal-700 dark:text-teal-400 font-bold hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* Overview Cards (No Print) */}
      <div className="no-print grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xs transition-colors">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Total Setoran Terhimpun
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {formatRupiah(grandTotalSetoran)}
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-xs transition-colors">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <TrendingDown className="w-4 h-4 text-rose-500 dark:text-rose-400" /> Total Penarikan Keluar
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatRupiah(grandTotalPenarikan)}
          </div>
        </div>

        <div className="p-4 sm:p-5 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-800/80 rounded-2xl sm:rounded-3xl shadow-xs transition-colors">
          <div className="flex items-center gap-2 text-teal-700 dark:text-teal-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Wallet className="w-4 h-4 text-teal-700 dark:text-teal-400" /> Total Saldo Tersimpan
          </div>
          <div className="text-xl sm:text-2xl font-black text-teal-800 dark:text-teal-300">
            {formatRupiah(grandTotalSaldo)}
          </div>
        </div>
      </div>

      {/* PRINT HEADER ONLY */}
      <div className="print-only text-center mb-6 pb-4 border-b-2 border-slate-900">
        <AppLogo size="lg" className="mx-auto mb-2" />
        <h1 className="text-2xl font-black uppercase tracking-wide text-black">
          {lembagaName}
        </h1>
        <p className="text-slate-700 font-semibold text-sm mt-0.5">
          Laporan Rekapitulasi Buku Induk Saldo Santri
        </p>
        <p className="text-xs text-slate-500 mt-2">Dicetak pada: {todayLongFormat}</p>
      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-100 dark:border-slate-800 p-4 sm:p-7 transition-colors">
        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 mb-4 sm:mb-5 tracking-tight no-print">
          Buku Induk Saldo Santri
        </h3>

        {/* MOBILE VIEW: Responsive Ledger Cards (ZERO horizontal slider) */}
        <div className="block md:hidden no-print divide-y divide-slate-100 dark:divide-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          {santriReportData.map((row) => (
            <div
              key={row.santri.id}
              className={`p-4 ${
                row.santri.status === 'nonaktif'
                  ? 'opacity-60 bg-slate-50/40 dark:bg-slate-850'
                  : 'bg-white dark:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold text-[11px] flex items-center justify-center shrink-0">
                    {row.no}
                  </span>
                  <div>
                    <div className="font-black text-slate-900 dark:text-slate-100 text-sm leading-tight">
                      {row.santri.nama}
                      {row.santri.status === 'nonaktif' && (
                        <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded ml-1 font-bold">
                          Non
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      NIS: {row.santri.nis}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg shrink-0 max-w-[130px] truncate">
                  {row.santri.kelas}
                </span>
              </div>

              {/* 3 Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100/70 dark:border-slate-800 text-center">
                <div className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30">
                  <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                    Setoran
                  </span>
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 block mt-0.5 truncate">
                    {formatRupiah(row.totalSetoran)}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-rose-50/50 dark:bg-rose-950/30">
                  <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
                    Penarikan
                  </span>
                  <span className="text-xs font-black text-rose-700 dark:text-rose-300 block mt-0.5 truncate">
                    {formatRupiah(row.totalPenarikan)}
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-teal-50/70 dark:bg-teal-950/50 border border-teal-100/60 dark:border-teal-800/60">
                  <span className="text-[9px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider block">
                    Saldo Akhir
                  </span>
                  <span className="text-xs font-black text-teal-900 dark:text-teal-200 block mt-0.5 truncate">
                    {formatRupiah(row.saldoAkhir)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Mobile Grand Total Summary Card */}
          <div className="p-4 bg-slate-900 text-white">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">
              Total Keseluruhan Saldo:
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[9px] text-emerald-400 uppercase font-bold block">Setoran</span>
                <span className="text-xs font-black truncate block mt-0.5">{formatRupiah(grandTotalSetoran)}</span>
              </div>
              <div>
                <span className="text-[9px] text-rose-400 uppercase font-bold block">Penarikan</span>
                <span className="text-xs font-black truncate block mt-0.5">{formatRupiah(grandTotalPenarikan)}</span>
              </div>
              <div className="border-l border-white/20 pl-1">
                <span className="text-[9px] text-teal-300 uppercase font-bold block">Saldo Akhir</span>
                <span className="text-sm font-black text-teal-300 truncate block mt-0.5">{formatRupiah(grandTotalSaldo)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* DESKTOP VIEW & PRINT VIEW: Full Master Ledger Table */}
        <div className="hidden md:block print:block overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-4 w-12 text-center">No</th>
                <th className="px-5 py-4">NIS & Nama Lengkap</th>
                <th className="px-5 py-4">Kelas</th>
                <th className="px-5 py-4 text-right">Total Setoran</th>
                <th className="px-5 py-4 text-right">Total Penarikan</th>
                <th className="px-5 py-4 text-right font-black text-slate-900 dark:text-slate-100 bg-slate-100/60 dark:bg-slate-800">
                  Saldo Akhir
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {santriReportData.map((row) => (
                <tr
                  key={row.santri.id}
                  className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                    row.santri.status === 'nonaktif' ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-5 py-3.5 text-center font-bold text-slate-400 dark:text-slate-500 text-xs">
                    {row.no}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-black text-slate-800 dark:text-slate-200">
                      {row.santri.nama}
                      {row.santri.status === 'nonaktif' && (
                        <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded ml-1.5 font-bold">
                          Non-Aktif
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{row.santri.nis}</div>
                  </td>
                  <td className="px-5 py-3.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {row.santri.kelas}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400 text-xs sm:text-sm">
                    {formatRupiah(row.totalSetoran)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-bold text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
                    {formatRupiah(row.totalPenarikan)}
                  </td>
                  <td className="px-5 py-3.5 text-right font-black text-teal-800 dark:text-teal-300 bg-slate-50/50 dark:bg-slate-800/60 text-sm sm:text-base">
                    {formatRupiah(row.saldoAkhir)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-50 dark:bg-slate-850 border-t-2 border-slate-200 dark:border-slate-700 font-black">
              <tr>
                <td
                  colSpan={3}
                  className="px-5 py-4 text-right uppercase text-slate-500 dark:text-slate-400 text-[10px] tracking-widest font-black"
                >
                  Total Keseluruhan:
                </td>
                <td className="px-5 py-4 text-right text-emerald-700 dark:text-emerald-400 text-sm sm:text-base">
                  {formatRupiah(grandTotalSetoran)}
                </td>
                <td className="px-5 py-4 text-right text-rose-600 dark:text-rose-400 text-sm sm:text-base">
                  {formatRupiah(grandTotalPenarikan)}
                </td>
                <td className="px-5 py-4 text-right text-teal-900 dark:text-teal-200 bg-slate-100/70 dark:bg-slate-800 text-base sm:text-lg">
                  {formatRupiah(grandTotalSaldo)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* PRINT SIGNATURE FOOTER */}
        <div className="print-only mt-12 pt-6 flex justify-end">
          <div className="text-center w-64">
            <p className="text-xs text-slate-600 mb-20 leading-relaxed">
              Mengetahui,<br />
              <strong>Pengurus / Bendahara Lembaga</strong>
            </p>
            <p className="font-bold border-b border-slate-900 pb-1 text-sm text-slate-900">
              {petugasName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
