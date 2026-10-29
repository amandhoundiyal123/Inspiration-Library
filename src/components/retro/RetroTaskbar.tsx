import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  HardDrive, 
  Folder, 
  Trash2, 
  Star, 
  Sparkles, 
  FileText, 
  Volume2, 
  Database, 
  Power, 
  HelpCircle,
  ExternalLink,
  Layers,
  ChevronRight
} from 'lucide-react';
import type { NavigationTab } from '../../types';

interface RetroTaskbarProps {
  isWindowOpen: boolean;
  isWindowMinimized: boolean;
  onToggleWindow: () => void;
  onNavigateTab: (tab: NavigationTab) => void;
  onOpenNotepad: () => void;
  referencesCount: number;
  collectionsCount: number;
}

export const RetroTaskbar: React.FC<RetroTaskbarProps> = ({
  isWindowOpen,
  isWindowMinimized,
  onToggleWindow,
  onNavigateTab,
  onOpenNotepad,
  referencesCount,
  collectionsCount
}) => {
  const [startMenuOpen, setStartMenuOpen] = useState(false);
  const [time, setTime] = useState('');

  // Real-time retro clock
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      );
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Taskbar Bar Container */}
      <footer className="fixed bottom-0 left-0 right-0 h-11 z-50 taskbar-gradient border-t-2 border-[#3C7BE6] flex items-center justify-between px-2 select-none shadow-[0_-2px_6px_rgba(0,0,0,0.35)]">
        {/* Left: Start Button + Open Windows */}
        <div className="flex items-center gap-2 h-full py-1">
          {/* Windows Classic Start Button */}
          <button
            onClick={() => setStartMenuOpen(!startMenuOpen)}
            className={`h-full px-3 sm:px-4 flex items-center gap-2 rounded-r-md transition-all cursor-pointer ${
              startMenuOpen
                ? 'bg-gradient-to-b from-[#1E6B24] to-[#154E1A] shadow-inner text-amber-200 ring-1 ring-black/40'
                : 'bg-gradient-to-b from-[#388E3C] via-[#2E7D32] to-[#1B5E20] hover:from-[#43A047] hover:to-[#2E7D32] text-white shadow-md'
            } border-t border-l border-[#81C784]/60 border-b-2 border-r-2 border-[#0E3A12] active:translate-y-[1px]`}
          >
            {/* Retro 4-color Windows/Vault flag seal */}
            <div className="w-5 h-5 bg-[#FFE344] border border-[#29231C] flex items-center justify-center text-[#171511] shrink-0 shadow-xs">
              <Bookmark className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="font-pixel text-xs sm:text-[13px] font-black uppercase tracking-wider drop-shadow-[1px_1px_1px_#000]">
              Start
            </span>
          </button>

          {/* Quick Launch separator */}
          <div className="h-6 w-0.5 bg-[#123C85] border-r border-[#4085F0]/40 mx-1 hidden sm:block" />

          {/* DesignVault Active Window Tab */}
          <button
            onClick={onToggleWindow}
            className={`h-full max-w-[220px] px-3 flex items-center gap-2 text-xs font-semibold rounded-sm transition-all cursor-pointer truncate ${
              isWindowOpen && !isWindowMinimized
                ? 'bevel-retro-inset bg-[#0E3576] text-white shadow-inner font-bold'
                : 'bevel-retro-outset bg-[#2257B8] hover:bg-[#2A65D4] text-white shadow-xs'
            }`}
            title="DesignVault — Personal Inspiration Library"
          >
            <div className="w-4 h-4 bg-[#FFE344] border border-[#29231C] shrink-0 flex items-center justify-center text-[#171511]">
              <Bookmark className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span className="font-pixel text-[10px] sm:text-[11px] truncate tracking-tight drop-shadow-[1px_1px_0px_#000]">
              DesignVault
            </span>
            <span className="font-terminal text-xs text-sky-200 hidden md:inline">
              ({referencesCount})
            </span>
          </button>
        </div>

        {/* Right: System Tray */}
        <div className="flex items-center gap-2 sm:gap-3 h-full py-1">
          <div className="bevel-retro-inset bg-[#0D2E68] h-full px-2.5 sm:px-3 flex items-center gap-2.5 text-white">
            {/* Database status */}
            <div 
              className="flex items-center gap-1.5 cursor-pointer text-sky-200 hover:text-white"
              title={`SQLite DB: ${referencesCount} items, ${collectionsCount} collections active`}
            >
              <Database className="w-3.5 h-3.5 text-[#FFE344] stroke-[2.5]" />
              <span className="font-terminal text-xs hidden lg:inline text-sky-200">
                SQLITE
              </span>
            </div>

            {/* Volume icon */}
            <div 
              className="text-sky-200 hover:text-white cursor-pointer hidden sm:block"
              title="System Sounds: Enabled"
            >
              <Volume2 className="w-3.5 h-3.5" />
            </div>

            <div className="h-4 w-px bg-[#184594]" />

            {/* Retro Clock */}
            <div className="font-terminal text-sm font-semibold tracking-wider text-white">
              {time || '12:00 PM'}
            </div>
          </div>

          {/* Show Desktop sliver */}
          <button
            onClick={onToggleWindow}
            className="h-full w-3.5 sm:w-4 bg-gradient-to-b from-[#2B68DC] to-[#123E90] hover:bg-sky-400 border-l border-[#4085F0] transition-colors cursor-pointer"
            title="Show Desktop / Minimize All"
            aria-label="Show Desktop"
          />
        </div>
      </footer>

      {/* Retro XP Start Menu Popup */}
      {startMenuOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setStartMenuOpen(false)}
          />
          <div className="fixed bottom-11 left-1 z-50 w-72 sm:w-80 bg-[#FFF0D7] border-4 border-[#0A3882] shadow-2xl overflow-hidden select-none animate-in fade-in slide-in-from-bottom-2 duration-100">
            {/* Start Menu Header */}
            <div className="bg-gradient-to-r from-[#175CC0] via-[#2070E0] to-[#175CC0] p-3 border-b-2 border-[#29231C] flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FFE344] border-2 border-white shadow-retro flex items-center justify-center text-[#171511]">
                <Bookmark className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="text-white">
                <div className="font-pixel text-xs font-bold tracking-wide drop-shadow-[1px_1px_1px_#000]">
                  Ashutosh
                </div>
                <div className="font-terminal text-xs text-sky-200 drop-shadow-[1px_1px_1px_#000]">
                  Personal DesignVault Curator
                </div>
              </div>
            </div>

            {/* Start Menu Items */}
            <div className="p-2 space-y-1 bg-[#FFF0D7] text-[#171511]">
              <button
                onClick={() => {
                  onNavigateTab('all');
                  setStartMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#FFE344] border border-transparent hover:border-[#29231C] flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Bookmark className="w-4 h-4 text-[#171511] stroke-[2.5]" />
                  <span className="font-pixel text-[11px]">All Inspiration</span>
                </div>
                <span className="font-terminal text-xs text-[#756858]">{referencesCount}</span>
              </button>

              <button
                onClick={() => {
                  onNavigateTab('collections');
                  setStartMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#FFE344] border border-transparent hover:border-[#29231C] flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Folder className="w-4 h-4 text-[#171511] stroke-[2.2]" />
                  <span className="font-pixel text-[11px]">Collections</span>
                </div>
                <span className="font-terminal text-xs text-[#756858]">{collectionsCount}</span>
              </button>

              <button
                onClick={() => {
                  onNavigateTab('styles');
                  setStartMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#FFE344] border border-transparent hover:border-[#29231C] flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#171511] stroke-[2.5]" />
                <span className="font-pixel text-[11px]">Design Styles & DNA</span>
              </button>

              <button
                onClick={() => {
                  onNavigateTab('favorites');
                  setStartMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#FFE344] border border-transparent hover:border-[#29231C] flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                <Star className="w-4 h-4 fill-[#FFE344] text-[#171511] stroke-[2]" />
                <span className="font-pixel text-[11px]">Favorites</span>
              </button>

              <div className="my-1.5 border-t-2 border-[#29231C]/20" />

              <button
                onClick={() => {
                  onOpenNotepad();
                  setStartMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#FFE344] border border-transparent hover:border-[#29231C] flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#1E40AF] stroke-[2.2]" />
                <span className="font-pixel text-[11px]">ReadMe.txt</span>
              </button>

              <button
                onClick={() => {
                  onNavigateTab('settings');
                  setStartMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#FFE344] border border-transparent hover:border-[#29231C] flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                <HardDrive className="w-4 h-4 text-[#FF682D] stroke-[2.5]" />
                <span className="font-pixel text-[11px]">Backup & Export</span>
              </button>

              <button
                onClick={() => {
                  onNavigateTab('trash');
                  setStartMenuOpen(false);
                }}
                className="w-full px-3 py-2 text-left hover:bg-[#FFE344] border border-transparent hover:border-[#29231C] flex items-center gap-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4 text-[#FF682D] stroke-[2.2]" />
                <span className="font-pixel text-[11px]">Recycle Bin</span>
              </button>
            </div>

            {/* Start Menu Footer */}
            <div className="bg-[#EBDCC6] p-2 border-t-2 border-[#29231C] flex items-center justify-between text-xs">
              <span className="font-terminal text-xs text-[#756858]">
                DesignVault OS v2.4
              </span>
              <button
                onClick={() => {
                  onToggleWindow();
                  setStartMenuOpen(false);
                }}
                className="px-2.5 py-1 bg-[#FFF0D7] hover:bg-[#FFE344] border border-[#29231C] text-[10px] font-pixel font-bold text-[#171511] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Power className="w-3 h-3 text-[#FF682D]" />
                <span>Minimize</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};
