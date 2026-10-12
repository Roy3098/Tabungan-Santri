import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  writeBatch,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { AppData, AppSettings, Kelas, Santri, Transaksi, User } from './types';
import { defaultAppData } from './data/initialData';
import { compressBase64Image } from './utils/imageCompressor';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean as T;
}

async function sanitizeSettingsForFirestore(settings: AppSettings): Promise<AppSettings> {
  let safeLogo = settings.logo || '';
  if (safeLogo) {
    safeLogo = await compressBase64Image(safeLogo, 512, 0.85);
    if (safeLogo.length > 450_000) {
      safeLogo = '';
    }
  }
  return stripUndefined({
    lembaga: settings.lembaga || defaultAppData.settings.lembaga,
    petugas: settings.petugas || defaultAppData.settings.petugas,
    logo: safeLogo,
  });
}

async function sanitizeUserForFirestore(user: User): Promise<User> {
  let safeAvatar = user.foto_profil || '';
  if (safeAvatar) {
    safeAvatar = await compressBase64Image(safeAvatar, 512, 0.85);
    if (safeAvatar.length > 450_000) {
      safeAvatar = '';
    }
  }
  return stripUndefined({
    ...user,
    foto_profil: safeAvatar,
  });
}

// Test Connection
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // Document might simply not exist yet, connection works
    return true;
  }
}

// Check and seed initial data if Firestore is empty
export async function initializeFirestoreData(): Promise<AppData> {
  const santriPath = 'santri';
  try {
    const santriSnap = await getDocs(collection(db, santriPath));
    if (santriSnap.empty) {
      console.log('Seeding initial data into Firestore...');
      const cleanSettings = await sanitizeSettingsForFirestore(defaultAppData.settings);
      await setDoc(doc(db, 'settings', 'main'), cleanSettings);

      const batch = writeBatch(db);
      for (const k of defaultAppData.kelas) {
        batch.set(doc(db, 'kelas', k.id), stripUndefined(k));
      }
      for (const s of defaultAppData.santri) {
        batch.set(doc(db, 'santri', s.id), stripUndefined(s));
      }
      for (const t of defaultAppData.transaksi) {
        batch.set(doc(db, 'transaksi', t.id), stripUndefined(t));
      }
      await batch.commit();

      return defaultAppData;
    }

    // Load existing data from Firestore
    const settingsDoc = await getDoc(doc(db, 'settings', 'main'));
    const settings = settingsDoc.exists()
      ? (settingsDoc.data() as AppSettings)
      : defaultAppData.settings;

    const kelasSnap = await getDocs(collection(db, 'kelas'));
    const kelasList: Kelas[] = [];
    kelasSnap.forEach((d) => kelasList.push(d.data() as Kelas));

    const santriList: Santri[] = [];
    santriSnap.forEach((d) => santriList.push(d.data() as Santri));

    const txSnap = await getDocs(collection(db, 'transaksi'));
    const txList: Transaksi[] = [];
    txSnap.forEach((d) => txList.push(d.data() as Transaksi));

    return {
      settings,
      users: defaultAppData.users,
      kelas: kelasList.length > 0 ? kelasList : defaultAppData.kelas,
      santri: santriList,
      transaksi: txList,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, 'santri');
  }
}

// Subscribe to real-time changes
export function subscribeToDatabase(
  onDataUpdate: (data: Partial<AppData>) => void,
  onError?: (err: Error) => void
) {
  const unsubSettings = onSnapshot(
    doc(db, 'settings', 'main'),
    (snapshot) => {
      if (snapshot.exists()) {
        onDataUpdate({ settings: snapshot.data() as AppSettings });
      }
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, 'settings/main');
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );

  const unsubKelas = onSnapshot(
    collection(db, 'kelas'),
    (snapshot) => {
      const list: Kelas[] = [];
      snapshot.forEach((d) => list.push(d.data() as Kelas));
      onDataUpdate({ kelas: list });
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, 'kelas');
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );

  const unsubSantri = onSnapshot(
    collection(db, 'santri'),
    (snapshot) => {
      const list: Santri[] = [];
      snapshot.forEach((d) => list.push(d.data() as Santri));
      onDataUpdate({ santri: list });
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, 'santri');
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );

  const unsubTx = onSnapshot(
    collection(db, 'transaksi'),
    (snapshot) => {
      const list: Transaksi[] = [];
      snapshot.forEach((d) => list.push(d.data() as Transaksi));
      onDataUpdate({ transaksi: list });
    },
    (err) => {
      try {
        handleFirestoreError(err, OperationType.GET, 'transaksi');
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );

  return () => {
    unsubSettings();
    unsubKelas();
    unsubSantri();
    unsubTx();
  };
}

// Firestore CRUD operations
export async function dbSaveSettings(settings: AppSettings): Promise<void> {
  const path = 'settings/main';
  try {
    const cleanSettings = await sanitizeSettingsForFirestore(settings);
    await setDoc(doc(db, 'settings', 'main'), cleanSettings);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function dbSaveKelas(kelas: Kelas): Promise<void> {
  const path = `kelas/${kelas.id}`;
  try {
    await setDoc(doc(db, 'kelas', kelas.id), stripUndefined(kelas));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function dbDeleteKelas(id: string): Promise<void> {
  const path = `kelas/${id}`;
  try {
    await deleteDoc(doc(db, 'kelas', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function dbDeleteKelasAndReassignSantri(
  kelasId: string,
  reassignedSantri: Santri[]
): Promise<void> {
  const path = `kelas/${kelasId}`;
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'kelas', kelasId));
    for (const s of reassignedSantri) {
      batch.set(doc(db, 'santri', s.id), stripUndefined(s));
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function dbSaveSantri(santri: Santri): Promise<void> {
  const path = `santri/${santri.id}`;
  try {
    await setDoc(doc(db, 'santri', santri.id), stripUndefined(santri));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function dbDeleteSantri(id: string): Promise<void> {
  const path = `santri/${id}`;
  try {
    await deleteDoc(doc(db, 'santri', id));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function dbDeleteSantriWithTransaksi(
  santriId: string,
  txIds: string[]
): Promise<void> {
  const path = `santri/${santriId}`;
  try {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'santri', santriId));
    for (const txId of txIds) {
      batch.delete(doc(db, 'transaksi', txId));
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function dbSaveTransaksi(tx: Transaksi): Promise<void> {
  const path = `transaksi/${tx.id}`;
  try {
    await setDoc(doc(db, 'transaksi', tx.id), stripUndefined(tx));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function dbBatchUpdateTransaksi(txList: Transaksi[]): Promise<void> {
  const path = 'transaksi';
  try {
    const batch = writeBatch(db);
    for (const t of txList) {
      batch.set(doc(db, 'transaksi', t.id), stripUndefined(t));
    }
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function dbResetAllData(): Promise<void> {
  try {
    const batch = writeBatch(db);
    const santriSnap = await getDocs(collection(db, 'santri'));
    santriSnap.forEach((d) => batch.delete(d.ref));

    const txSnap = await getDocs(collection(db, 'transaksi'));
    txSnap.forEach((d) => batch.delete(d.ref));

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, 'santri_and_transaksi');
  }
}

export async function dbRestoreFullData(data: AppData): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Settings
    const cleanSettings = await sanitizeSettingsForFirestore(data.settings);
    batch.set(doc(db, 'settings', 'main'), cleanSettings);

    // Kelas
    if (data.kelas) {
      for (const k of data.kelas) {
        batch.set(doc(db, 'kelas', k.id), stripUndefined(k));
      }
    }

    // Santri
    if (data.santri) {
      for (const s of data.santri) {
        batch.set(doc(db, 'santri', s.id), stripUndefined(s));
      }
    }

    // Transaksi
    if (data.transaksi) {
      for (const t of data.transaksi) {
        batch.set(doc(db, 'transaksi', t.id), stripUndefined(t));
      }
    }

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'all_collections');
  }
}

export async function dbSaveUser(user: User): Promise<void> {
  const userId = user.id || user.email.replace(/[@.]/g, '_');
  const path = `users/${userId}`;
  try {
    const cleanUser = await sanitizeUserForFirestore({ ...user, id: userId });
    await setDoc(doc(db, 'users', userId), cleanUser);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}
