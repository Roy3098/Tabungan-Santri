import React, { useState, useEffect } from 'react';
import appLogoImg from '../assets/images/app-logo.svg';

interface AppLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  logoUrl?: string;
  alt?: string;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  className = '',
  size = 'md',
  logoUrl,
  alt = 'Logo Tabungan Santri',
}) => {
  const getSafeCustomLogo = () => {
    try {
      const stored = localStorage.getItem('app_custom_logo');
      if (stored && stored.length > 450_000) {
        localStorage.removeItem('app_custom_logo');
        return '';
      }
      return stored || '';
    } catch {
      return '';
    }
  };

  const [currentLogo, setCurrentLogo] = useState<string>(() => {
    if (logoUrl && logoUrl.length <= 450_000) return logoUrl;
    return getSafeCustomLogo() || appLogoImg;
  });

  useEffect(() => {
    if (logoUrl !== undefined) {
      setCurrentLogo((logoUrl && logoUrl.length <= 450_000 ? logoUrl : '') || appLogoImg);
    } else {
      setCurrentLogo(getSafeCustomLogo() || appLogoImg);
    }
  }, [logoUrl]);

  useEffect(() => {
    const handleLogoUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string | undefined>;
      const newLogo = customEvent.detail || getSafeCustomLogo() || appLogoImg;
      setCurrentLogo(newLogo);
    };

    window.addEventListener('app-logo-updated', handleLogoUpdate);
    return () => {
      window.removeEventListener('app-logo-updated', handleLogoUpdate);
    };
  }, []);

  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${sizeClasses[size]} ${className}`}
    >
      <img
        src={currentLogo}
        alt={alt}
        className="w-full h-full object-contain select-none drop-shadow-xs"
        onError={(e) => {
          // Fallback if image fails to load
          const target = e.target as HTMLImageElement;
          if (target.src !== appLogoImg) {
            target.src = appLogoImg;
          }
        }}
      />
    </div>
  );
};

