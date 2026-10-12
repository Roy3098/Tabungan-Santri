export type TransactionType = 'setoran' | 'penarikan';
export type TransactionStatus = 'valid' | 'void';
export type StudentStatus = 'aktif' | 'nonaktif';

export interface Kelas {
  id: string;
  nama: string;
  wali_kelas?: string;
  keterangan?: string;
  created_at: string;
}

export interface Santri {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  status: StudentStatus;
  wali_santri?: string;
  no_hp?: string;
  alamat?: string;
  created_at: string;
}

export interface Transaksi {
  id: string;
  no_ref: string;
  tanggal: string; // YYYY-MM-DD
  id_santri: string;
  jenis: TransactionType;
  nominal: number;
  keterangan: string;
  petugas: string;
  saldo_setelah: number;
  status: TransactionStatus;
  created_at: string; // ISO
}

export interface User {
  id?: string;
  nama: string;
  email: string;
  password?: string;
  jabatan?: string;
  no_hp?: string;
  foto_profil?: string;
}

export interface AppSettings {
  lembaga: string;
  petugas: string;
  logo?: string;
}

export interface AppData {
  settings: AppSettings;
  users: User[];
  kelas: Kelas[];
  santri: Santri[];
  transaksi: Transaksi[];
}

export type ViewType = 'dashboard' | 'santri' | 'kelas' | 'transaksi' | 'riwayat' | 'laporan' | 'pengaturan' | 'profil';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

