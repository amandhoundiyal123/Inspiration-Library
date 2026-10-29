import React from 'react';
import { X, FileText, Minimize2, Square } from 'lucide-react';

interface RetroNotepadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RetroNotepadModal: React.FC<RetroNotepadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs select-none">
      <div 
        className="w-full max-w-xl bg-[#FFF0D7] border-4 border-[#0A3882] shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="titlebar-gradient h-8 px-2 flex items-center justify-between border-b-2 border-[#0A3882]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border border-[#0A3882] flex items-center justify-center text-[#1E40AF]">
              <FileText className="w-3 h-3 stroke-[2.5]" />
            </div>
            <span className="font-pixel text-[11px] font-bold text-white tracking-wide drop-shadow-[1px_1px_0px_#000]">
              ReadMe.txt — Notepad
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="w-5 h-5 bg-[#C0392B] hover:bg-[#E74C3C] text-white flex items-center justify-center border border-white/60 text-xs font-bold transition-colors cursor-pointer"
              title="Close"
              aria-label="Close"
            >
              <X className="w-3 h-3 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Notepad Menu Bar */}
        <div className="h-6 bg-[#EBDCC6] border-b border-[#29231C] px-2 flex items-center gap-4 text-xs font-medium text-[#171511]">
          <span className="cursor-pointer hover:bg-black/10 px-1.5 py-0.5 rounded">File</span>
          <span className="cursor-pointer hover:bg-black/10 px-1.5 py-0.5 rounded">Edit</span>
          <span className="cursor-pointer hover:bg-black/10 px-1.5 py-0.5 rounded">Format</span>
          <span className="cursor-pointer hover:bg-black/10 px-1.5 py-0.5 rounded">View</span>
          <span className="cursor-pointer hover:bg-black/10 px-1.5 py-0.5 rounded">Help</span>
        </div>

        {/* Notepad Text Content */}
        <div className="p-4 bg-white text-[#171511] font-mono text-xs sm:text-sm leading-relaxed overflow-y-auto max-h-[60vh] select-text">
          <div className="font-pixel text-xs text-[#0A3882] font-bold mb-3 border-b border-[#29231C]/20 pb-2">
            DESIGNVAULT — PERSONAL INSPIRATION OS (V2.4)
          </div>
          <p className="mb-2">
            Welcome to DesignVault, your private retro-editorial inspiration library running inside a classic desktop workstation.
          </p>
          <p className="mb-3 font-semibold text-[#FF682D]">
            [CORE PHILOSOPHY: THE ART PROVIDES THE RICHNESS. THE INTERFACE PROVIDES THE RESTRAINT.]
          </p>

          <div className="my-3 p-3 bg-[#FFF0D7] border-2 border-[#29231C] text-xs">
            <div className="font-bold mb-1">KEYBOARD & DESKTOP TIPS:</div>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Add Inspiration:</strong> Click "+ Add Inspiration" in the orange title bar button.</li>
              <li><strong>Desktop Window:</strong> Click Minimize (_) to dock to taskbar; click Maximize (□) to go full-screen.</li>
              <li><strong>Design DNA:</strong> Click any saved card to deconstruct color palettes, typography, and generate AI brief/prompts.</li>
              <li><strong>Backup & Portability:</strong> Export complete JSON metadata or full image ZIP archives anytime.</li>
            </ul>
          </div>

          <p className="text-[#756858] text-xs">
            Personal Curator: Ashutosh (adhoundiyal20@gmail.com)<br />
            Local Database: SQLite (Offline-Ready & Persistent)<br />
            AI Synthesis: Server-Side Gemini Intelligence
          </p>
        </div>

        {/* Footer */}
        <div className="h-8 bg-[#EBDCC6] border-t-2 border-[#29231C] px-3 flex items-center justify-between text-xs">
          <span className="font-terminal text-xs text-[#756858]">Lines: 32 • Col: 1 • UTF-8</span>
          <button
            onClick={onClose}
            className="px-4 py-1 bg-[#FFF0D7] hover:bg-[#FFE344] border-2 border-[#29231C] shadow-retro text-xs font-bold uppercase transition-colors cursor-pointer"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
