import React, { useState, useEffect } from 'react';
import { Santri, Transaksi, TransactionType } from '../types';
import {
  formatRupiah,
  formatCurrencyInput,
  parseCurrencyInput,
  calculateStudentBalance,
} from '../utils/formatters';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface TransaksiViewProps {
  santriList: Santri[];
  transaksiList: Transaksi[];
  defaultType?: TransactionType;
  petugasName: string;
  onSaveTransaksi: (txData: {
    id_santri: string;
    jenis: TransactionType;
    tanggal: string;
    nominal: number;
    keterangan: string;
  }) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const TransaksiView: React.FC<TransaksiViewProps> = ({
  santriList,
  transaksiList,
  defaultType = 'setoran',
  petugasName,
  onSaveTransaksi,
  showToast,
}) => {
  const [jenis, setJenis] = useState<TransactionType>(defaultType);
  const [selectedSantriId, setSelectedSantriId] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [nominalDisplay, setNominalDisplay] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if defaultType changes
  useEffect(() => {
    if (defaultType) {
      setJenis(defaultType);
    }
  }, [defaultType]);

  // Active students only
  const activeStudents = santriList
    .filter((s) => s.status === 'aktif')
    .sort((a, b) => a.nama.localeCompare(b.nama));

  const selectedStudentBalance = selectedSantriId
    ? calculateStudentBalance(selectedSantriId, transaksiList)
    : 0;

  const currentNominalValue = parseCurrencyInput(nominalDisplay);
  const isInsufficient = jenis === 'penarikan' && currentNominalValue > selectedStudentBalance;

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNominalDisplay(formatCurrencyInput(e.target.value));
  };

  const handleQuickAmount = (amount: number) => {
    setNominalDisplay(formatCurrencyInput(amount.toString()));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSantriId) {
      showToast('Pilih santri terlebih dahulu!', 'warning');
      return;
    }

    if (currentNominalValue <= 0) {
      showToast('Nominal transaksi harus lebih dari Rp 0!', 'warning');
      return;
    }

    if (jenis === 'penarikan' && currentNominalValue > selectedStudentBalance) {
      showToast(
        `Saldo tidak mencukupi! Saldo saat ini hanya ${formatRupiah(selectedStudentBalance)}`,
        'error'
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      onSaveTransaksi({
        id_santri: selectedSantriId,
        jenis,
        tanggal,
        nominal: currentNominalValue,
        keterangan: keterangan.trim(),
      });

      showToast(
        `Berhasil mencatat ${jenis} ${formatRupiah(currentNominalValue)}!`,
        'success'
      );

      // Reset form
      setNominalDisplay('');
      setKeterangan('');
      setIsSubmitting(false);
    }, 400);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="text-center sm:text-left">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
          Catat Transaksi
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-0.5">
          Masukkan setoran tabungan baru atau penarikan saldo santri.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Tab Switcher */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => setJenis('setoran')}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              jenis === 'setoran'
                ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/80 dark:hover:bg-slate-800'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" /> Setoran Simpanan
          </button>
          <button
            type="button"
            onClick={() => setJenis('penarikan')}
            className={`flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
              jenis === 'penarikan'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-white/80 dark:hover:bg-slate-800'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" /> Penarikan Saldo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {/* Santri Selector */}
          <div>
            <label className="block mb-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Pilih Santri <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedSantriId}
              onChange={(e) => setSelectedSantriId(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3.5 font-bold outline-none transition-all cursor-pointer"
            >
              <option value="">-- Klik untuk memilih nama santri --</option>
              {activeStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nis} - {s.nama} ({s.kelas})
                </option>
              ))}
            </select>

            {/* Current Balance Notice */}
            {selectedSantriId && (
              <div
                className={`mt-3 p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  isInsufficient
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
                    : 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-100 dark:border-teal-800 text-teal-900 dark:text-teal-200'
                }`}
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest block opacity-75">
                    Saldo Aktif Saat Ini
                  </span>
                  <span className="text-xl font-black tracking-tight">
                    {formatRupiah(selectedStudentBalance)}
                  </span>
                </div>
                {isInsufficient && (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-4 h-4" /> Saldo tidak cukup!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grid Tanggal & Nominal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block mb-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Tanggal Transaksi <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  required
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3.5 font-bold outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                Nominal (Rp) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center justify-center w-12 pointer-events-none text-slate-400 dark:text-slate-500 font-black text-sm">
                  Rp
                </div>
                <input
                  type="text"
                  required
                  value={nominalDisplay}
                  onChange={handleNominalChange}
                  placeholder="0"
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-lg font-black rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full pl-12 pr-4 py-3 outline-none transition-all tracking-tight"
                />
              </div>
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Pilihan Cepat Nominal:
              </p>
              {nominalDisplay && (
                <button
                  type="button"
                  onClick={() => setNominalDisplay('')}
                  className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer touch-manipulation"
                >
                  Kosongkan Nominal
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[20000, 50000, 100000, 200000, 500000, 1000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleQuickAmount(amt)}
                  className="h-10 sm:h-11 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 hover:text-teal-800 dark:hover:text-teal-300 text-xs font-bold transition-all active:scale-95 cursor-pointer touch-manipulation flex items-center justify-center border border-slate-200/60 dark:border-slate-700/60 shadow-2xs"
                >
                  +{formatRupiah(amt)}
                </button>
              ))}
            </div>
          </div>

          {/* Keterangan */}
          <div>
            <label className="block mb-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              Catatan / Keterangan{' '}
              <span className="text-slate-400 dark:text-slate-500 font-normal lowercase">(opsional)</span>
            </label>
            <textarea
              rows={2}
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              placeholder={
                jenis === 'setoran'
                  ? 'Contoh: Uang saku pekan ke-2, titipan orang tua...'
                  : 'Contoh: Pembelian kitab tafsir, uang jajan rihlah...'
              }
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-teal-500/15 focus:border-teal-600 block w-full px-4 py-3.5 font-medium outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
            />
          </div>

          {/* Officer Tag */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between border border-slate-100 dark:border-slate-800">
            <span>Petugas Pencatat:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{petugasName}</span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting || isInsufficient}
              className={`w-full text-white font-bold rounded-2xl text-base py-4 text-center transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer ${
                jenis === 'setoran'
                  ? 'bg-teal-700 hover:bg-teal-800 shadow-teal-700/25'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
              } ${isSubmitting || isInsufficient ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses Transaksi...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" /> Konfirmasi Simpan Transaksi
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
