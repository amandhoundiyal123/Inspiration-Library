import React, { useState } from 'react';
import { 
  Folder, 
  Trash2, 
  Star, 
  Sparkles, 
  FileText, 
  HardDrive, 
  Bookmark, 
  ExternalLink
} from 'lucide-react';
import type { NavigationTab } from '../../types';

interface DesktopWallpaperProps {
  onOpenApp: () => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenNotepad: () => void;
  referencesCount: number;
  collectionsCount: number;
  favoritesCount: number;
  trashCount: number;
}

export const DesktopWallpaper: React.FC<DesktopWallpaperProps> = ({
  onOpenApp,
  onNavigateTab,
  onOpenNotepad,
  referencesCount,
  collectionsCount,
  favoritesCount,
  trashCount
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  const desktopIcons = [
    {
      id: 'vault',
      title: 'My Vault',
      sub: `${referencesCount} items`,
      icon: (
        <div className="w-11 h-11 bg-[#FFE344] border-2 border-[#29231C] shadow-retro flex items-center justify-center text-[#171511]">
          <Bookmark className="w-6 h-6 stroke-[2.5]" />
        </div>
      ),
      action: onOpenApp
    },
    {
      id: 'collections',
      title: 'Collections',
      sub: `${collectionsCount} groups`,
      icon: (
        <div className="w-11 h-11 bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro flex items-center justify-center text-[#171511]">
          <Folder className="w-6 h-6 stroke-[2.2]" />
        </div>
      ),
      action: () => {
        onNavigateTab('collections');
        onOpenApp();
      }
    },
    {
      id: 'styles',
      title: 'Styles & DNA',
      sub: 'Movements',
      icon: (
        <div className="w-11 h-11 bg-[#FFE344] border-2 border-[#29231C] shadow-retro flex items-center justify-center text-[#171511]">
          <Sparkles className="w-6 h-6 stroke-[2.5]" />
        </div>
      ),
      action: () => {
        onNavigateTab('styles');
        onOpenApp();
      }
    },
    {
      id: 'favorites',
      title: 'Favorites',
      sub: `${favoritesCount} starred`,
      icon: (
        <div className="w-11 h-11 bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro flex items-center justify-center text-[#171511]">
          <Star className="w-6 h-6 stroke-[2.5] fill-[#FFE344]" />
        </div>
      ),
      action: () => {
        onNavigateTab('favorites');
        onOpenApp();
      }
    },
    {
      id: 'readme',
      title: 'ReadMe.txt',
      sub: 'Guide',
      icon: (
        <div className="w-11 h-11 bg-white border-2 border-[#29231C] shadow-retro flex items-center justify-center text-[#171511]">
          <FileText className="w-6 h-6 stroke-[2.2] text-[#1E40AF]" />
        </div>
      ),
      action: onOpenNotepad
    },
    {
      id: 'backup',
      title: 'Backup & Export',
      sub: 'JSON / ZIP',
      icon: (
        <div className="w-11 h-11 bg-[#FF682D] border-2 border-[#29231C] shadow-retro flex items-center justify-center text-white">
          <HardDrive className="w-6 h-6 stroke-[2.5]" />
        </div>
      ),
      action: () => {
        onNavigateTab('settings');
        onOpenApp();
      }
    },
    {
      id: 'trash',
      title: 'Recycle Bin',
      sub: `${trashCount} items`,
      icon: (
        <div className="w-11 h-11 bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro flex items-center justify-center text-[#171511]">
          <Trash2 className="w-6 h-6 stroke-[2.2] text-[#FF682D]" />
        </div>
      ),
      action: () => {
        onNavigateTab('trash');
        onOpenApp();
      }
    }
  ];

  return (
    <div 
      className="absolute inset-0 overflow-hidden select-none"
      onClick={() => setSelectedIcon(null)}
    >
      {/* 1. RETRO PIXEL ART SKY & HILLS WALLPAPER (Windows XP/7 nostalgic bliss homage) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#1C64D6] via-[#4895EF] to-[#80C2FF]">
        {/* Pixel sun aura in top corner */}
        <div className="absolute -top-12 -right-12 w-96 h-96 bg-amber-200/20 rounded-full blur-2xl pointer-events-none" />

        {/* Scalable Pixel Clouds */}
        <div className="absolute top-10 left-1/4 opacity-75 pointer-events-none">
          <svg width="220" height="70" viewBox="0 0 220 70" fill="none" className="drop-shadow-md">
            {/* Cloud pixel silhouette */}
            <rect x="40" y="20" width="140" height="40" fill="#FFFFFF" fillOpacity="0.85" />
            <rect x="60" y="10" width="80" height="20" fill="#FFFFFF" fillOpacity="0.9" />
            <rect x="90" y="0" width="40" height="20" fill="#FFFFFF" />
            <rect x="20" y="30" width="180" height="25" fill="#FFFFFF" fillOpacity="0.8" />
            <rect x="10" y="35" width="200" height="15" fill="#FFFFFF" fillOpacity="0.6" />
          </svg>
        </div>

        <div className="absolute top-28 right-24 opacity-60 pointer-events-none hidden sm:block">
          <svg width="180" height="60" viewBox="0 0 180 60" fill="none" className="drop-shadow-sm">
            <rect x="30" y="15" width="110" height="35" fill="#FFFFFF" fillOpacity="0.8" />
            <rect x="50" y="5" width="60" height="20" fill="#FFFFFF" fillOpacity="0.85" />
            <rect x="15" y="25" width="140" height="20" fill="#FFFFFF" fillOpacity="0.7" />
          </svg>
        </div>

        {/* Distant Hills (Darker Emerald Green) */}
        <div className="absolute bottom-16 sm:bottom-11 left-0 right-0 h-64 sm:h-80 pointer-events-none">
          <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="w-full h-full">
            <path
              d="M0,192 C280,130 520,240 820,170 C1120,100 1320,180 1440,150 L1440,320 L0,320 Z"
              fill="#1B7A3E"
            />
          </svg>
        </div>

        {/* Foreground Lush Rolling Hills (Classic XP Bliss Vibrant Green) */}
        <div className="absolute bottom-10 sm:bottom-11 left-0 right-0 h-48 sm:h-64 pointer-events-none">
          <svg viewBox="0 0 1440 260" preserveAspectRatio="none" className="w-full h-full drop-shadow-lg">
            <path
              d="M0,120 C360,50 680,180 1020,90 C1240,30 1380,110 1440,80 L1440,260 L0,260 Z"
              fill="#2EA043"
            />
            {/* Hill crest highlight */}
            <path
              d="M0,120 C360,50 680,180 1020,90 C1240,30 1380,110 1440,80"
              fill="none"
              stroke="#5BD86A"
              strokeWidth="4"
              strokeOpacity="0.5"
            />
          </svg>
        </div>

        {/* Pixel Dither / Scanline texture */}
        <div className="absolute inset-0 pixel-dither pointer-events-none opacity-25" />
      </div>

      {/* 2. RETRO DESKTOP ICONS (Left Column) */}
      <div 
        className="relative z-10 p-4 sm:p-6 grid grid-flow-col grid-rows-7 sm:grid-rows-6 gap-3 sm:gap-4 w-fit pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {desktopIcons.map((item) => {
          const isSelected = selectedIcon === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setSelectedIcon(item.id)}
              onDoubleClick={item.action}
              className={`flex flex-col items-center justify-center w-20 sm:w-24 p-2 rounded cursor-pointer transition-all ${
                isSelected
                  ? 'bg-[#0055EA]/70 ring-1 ring-dotted ring-white text-white shadow-sm'
                  : 'hover:bg-white/15 text-white'
              }`}
              title={`${item.title} — Double-click to open`}
            >
              <div className="relative mb-1.5 transition-transform active:scale-95">
                {item.icon}
              </div>
              <span className="font-pixel text-[10px] sm:text-[11px] text-center font-bold tracking-tight text-white drop-shadow-[1px_1px_1px_#000] leading-tight line-clamp-1">
                {item.title}
              </span>
              <span className="font-terminal text-[11px] text-sky-100/90 text-center drop-shadow-[1px_1px_1px_#000] line-clamp-1">
                {item.sub}
              </span>
            </div>
          );
        })}
      </div>

      {/* Retro OS Watermark bottom-right of desktop */}
      <div className="absolute bottom-16 right-6 z-10 pointer-events-none text-right hidden md:block">
        <div className="font-pixel text-[11px] font-bold text-white/70 drop-shadow-[1px_1px_0px_#000]">
          DesignVault XP Edition
        </div>
        <div className="font-terminal text-xs text-white/50 drop-shadow-[1px_1px_0px_#000]">
          Personal Workspace Environment • Build 2026.10
        </div>
      </div>
    </div>
  );
};
