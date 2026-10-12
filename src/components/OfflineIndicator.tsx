import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showReconnected) return null;

  if (showReconnected) {
    return (
      <div className="fixed bottom-20 md:bottom-5 left-4 z-50 flex items-center gap-2 rounded-2xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-xl animate-in slide-in-from-bottom-2">
        <Wifi className="w-4 h-4 text-emerald-200" />
        <span>Koneksi Pulih — Data tersinkronisasi kembali.</span>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-5 left-4 z-50 flex items-center gap-2 rounded-2xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-xl animate-in slide-in-from-bottom-2">
      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
      <WifiOff className="w-4 h-4 text-amber-200" />
      <span>Mode Offline — Menyimpan data lokal & cache PWA.</span>
    </div>
  );
};
