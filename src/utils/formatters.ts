import { Santri, Transaksi } from '../types';

export function formatRupiah(number: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(dateIso: string): string {
  if (!dateIso) return '-';
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return dateIso;
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(dateIso: string): string {
  if (!dateIso) return '-';
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return dateIso;
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrencyInput(value: string): string {
  const clean = value.replace(/[^0-9]/g, '');
  if (!clean) return '';
  return new Intl.NumberFormat('id-ID').format(parseInt(clean, 10));
}

export function parseCurrencyInput(value: string): number {
  const clean = value.replace(/[^0-9]/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

export function generateRef(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  const yy = d.getFullYear().toString().slice(-2);
  const mm = (d.getMonth() + 1).toString().padStart(2, '0');
  const dd = d.getDate().toString().padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TRX${yy}${mm}${dd}${rand}`;
}

export function calculateStudentBalance(santriId: string, transaksiList: Transaksi[]): number {
  return transaksiList
    .filter((t) => t.id_santri === santriId && t.status !== 'void')
    .reduce((acc, t) => {
      if (t.jenis === 'setoran') return acc + t.nominal;
      if (t.jenis === 'penarikan') return acc - t.nominal;
      return acc;
    }, 0);
}

export function exportSantriLedgerToCSV(santriList: Santri[], transaksiList: Transaksi[], lembagaName: string): void {
  let csvContent = '\uFEFF'; // UTF-8 BOM for Microsoft Excel
  csvContent += `Laporan Saldo Tabungan Santri - ${lembagaName}\n`;
  csvContent += `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}\n\n`;
  csvContent += 'No,NIS,Nama Santri,Kelas,Status,Total Setoran,Total Penarikan,Saldo Akhir\n';

  let totalSetoranAll = 0;
  let totalPenarikanAll = 0;
  let totalSaldoAll = 0;

  santriList.forEach((s, idx) => {
    let sSetoran = 0;
    let sPenarikan = 0;
    transaksiList
      .filter((t) => t.id_santri === s.id && t.status !== 'void')
      .forEach((t) => {
        if (t.jenis === 'setoran') sSetoran += t.nominal;
        if (t.jenis === 'penarikan') sPenarikan += t.nominal;
      });

    const sSaldo = sSetoran - sPenarikan;
    totalSetoranAll += sSetoran;
    totalPenarikanAll += sPenarikan;
    totalSaldoAll += sSaldo;

    const escapedName = `"${s.nama.replace(/"/g, '""')}"`;
    csvContent += `${idx + 1},${s.nis},${escapedName},${s.kelas},${s.status === 'aktif' ? 'Aktif' : 'Non-Aktif'},${sSetoran},${sPenarikan},${sSaldo}\n`;
  });

  csvContent += `\n,,,TOTAL KESELURUHAN,,${totalSetoranAll},${totalPenarikanAll},${totalSaldoAll}\n`;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const nowStr = new Date().toISOString().split('T')[0];
  link.setAttribute('download', `Rekap_Tabungan_Santri_${nowStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Compresses and resizes an uploaded image file so the Base64 Data URL stays well below
 * Firestore's 1,048,576 byte (1MB) document size limit and localStorage limits.
 */
export function compressImageFile(file: File, maxDimension = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca berkas gambar.'));
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Berkas gambar kosong.'));
        return;
      }

      // If it's an SVG and already compact (< 250KB), return as-is
      if (file.type === 'image/svg+xml' && rawDataUrl.length < 250_000) {
        resolve(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak valid.'));
      img.onload = () => {
        let width = img.width || maxDimension;
        let height = img.height || maxDimension;

        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl.length < 500_000 ? rawDataUrl : '');
          return;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Prefer WebP to preserve alpha transparency with small file size
        let compressed = canvas.toDataURL('image/webp', 0.86);
        if (!compressed.startsWith('data:image/webp') || compressed.length > 400_000) {
          compressed = canvas.toDataURL('image/png');
        }
        if (compressed.length > 400_000) {
          compressed = canvas.toDataURL('image/jpeg', 0.8);
        }

        resolve(compressed);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

