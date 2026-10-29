import React from 'react';
import { Bookmark, Minus, Square, Copy, X, Database, Sparkles } from 'lucide-react';

interface RetroWindowFrameProps {
  children: React.ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: () => void;
  referencesCount: number;
  collectionsCount: number;
}

export const RetroWindowFrame: React.FC<RetroWindowFrameProps> = ({
  children,
  isMinimized,
  isMaximized,
  onMinimize,
  onToggleMaximize,
  onClose,
  referencesCount,
  collectionsCount
}) => {
  if (isMinimized) {
    return null;
  }

  return (
    <div
      className={`relative z-20 flex flex-col transition-all duration-150 overflow-hidden ${
        isMaximized
          ? 'w-full h-[calc(100vh-44px)] rounded-none border-0'
          : 'w-full h-full md:rounded-t-lg md:border-4 md:border-[#0A3882] md:shadow-[0_25px_60px_rgba(0,0,0,0.55)]'
      }`}
    >
      {/* 1. RETRO TITLE BAR */}
      <header className="titlebar-gradient h-10 px-3 flex items-center justify-between border-b-2 border-[#0A3882] select-none shrink-0">
        {/* Left: Pixel Icon + Window Title */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 bg-[#FFE344] border border-[#29231C] shadow-xs flex items-center justify-center text-[#171511] shrink-0">
            <Bookmark className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <div className="flex items-center gap-2 truncate">
            <span className="font-pixel text-[11px] sm:text-xs font-bold text-white tracking-wider drop-shadow-[1px_1px_1px_#001C55] truncate">
              DesignVault — Personal Inspiration Library
            </span>
            <span className="font-terminal text-xs text-sky-200 hidden lg:inline drop-shadow-[1px_1px_0px_#001C55]">
              [v2.4 • SQLite Local]
            </span>
          </div>
        </div>

        {/* Right: Window Action Controls (Minimize, Maximize/Restore, Close) */}
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {/* Minimize Button */}
          <button
            onClick={onMinimize}
            className="w-6 h-6 bg-[#2565DC] hover:bg-[#3B82F6] active:bg-[#1E40AF] text-white flex items-center justify-center border border-white/60 shadow-xs transition-colors cursor-pointer"
            title="Minimize to taskbar"
            aria-label="Minimize"
          >
            <Minus className="w-3.5 h-3.5 stroke-[3]" />
          </button>

          {/* Maximize / Restore Button */}
          <button
            onClick={onToggleMaximize}
            className="w-6 h-6 bg-[#2565DC] hover:bg-[#3B82F6] active:bg-[#1E40AF] text-white flex items-center justify-center border border-white/60 shadow-xs transition-colors cursor-pointer hidden sm:flex"
            title={isMaximized ? 'Restore Down' : 'Maximize'}
            aria-label={isMaximized ? 'Restore Down' : 'Maximize'}
          >
            {isMaximized ? (
              <Copy className="w-3 h-3 stroke-[2.5]" />
            ) : (
              <Square className="w-3 h-3 stroke-[2.5]" />
            )}
          </button>

          {/* Close Button (Classic Crimson Red with subtle white border) */}
          <button
            onClick={onClose}
            className="w-6 h-6 bg-[#C0392B] hover:bg-[#E74C3C] active:bg-[#962D22] text-white flex items-center justify-center border border-white/70 shadow-xs transition-colors cursor-pointer"
            title="Close / Minimize window"
            aria-label="Close"
          >
            <X className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </header>

      {/* 2. THE REAL APPLICATION BODY */}
      <div className="flex-1 flex overflow-hidden min-h-0 bg-[#F4E7CF]">
        {children}
      </div>

      {/* 3. RETRO STATUS BAR (Classic Windows Bottom Status Panels) */}
      <footer className="h-6 bg-[#EBDCC6] border-t-2 border-[#29231C] px-3 flex items-center justify-between text-xs select-none shrink-0 overflow-hidden font-terminal">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[#171511]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-pixel text-[9px] font-bold">READY</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[#756858] border-l border-[#29231C]/30 pl-3">
            <span>{referencesCount} FOLIOS SAVED</span>
            <span>•</span>
            <span>{collectionsCount} COLLECTIONS</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[#756858]">
          <div className="flex items-center gap-1 border-r border-[#29231C]/30 pr-3 hidden md:flex">
            <Database className="w-3 h-3 text-[#171511]" />
            <span className="font-pixel text-[9px]">SQLITE PERSISTENCE</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#B18A4A]" />
            <span className="font-pixel text-[9px]">GEMINI AI READY</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
