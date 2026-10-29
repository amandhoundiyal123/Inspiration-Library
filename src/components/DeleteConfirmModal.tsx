import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  isDestructive = true,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171511]/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-md bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro-lg p-6 space-y-4 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b-2 border-[#29231C] pb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 border-2 border-[#29231C] flex items-center justify-center ${isDestructive ? 'bg-[#FF682D] text-white shadow-xs' : 'bg-[#FFE344] text-[#171511]'}`}>
              {isDestructive ? <AlertTriangle className="w-5 h-5 stroke-[2.5]" /> : <Trash2 className="w-5 h-5 stroke-[2.5]" />}
            </div>
            <h3 className="text-lg font-heading font-black text-[#171511]">{title}</h3>
          </div>
          <button onClick={onCancel} className="p-1 text-[#171511] hover:bg-[#FFE344] border-2 border-[#29231C]">
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <p className="text-sm text-[#756858] leading-relaxed font-medium">
          {message}
        </p>

        <div className="pt-3 border-t-2 border-[#29231C] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-4 text-xs font-bold uppercase tracking-wider text-[#171511] bg-[#F4E7CF] hover:bg-[#FFE344] border-2 border-[#29231C] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`h-10 px-5 text-xs font-bold uppercase tracking-wider border-2 border-[#29231C] shadow-retro transition-colors cursor-pointer ${
              isDestructive
                ? 'bg-[#FF682D] hover:bg-[#ff7a45] text-white'
                : 'bg-[#FFE344] hover:bg-[#ffe766] text-[#171511]'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
