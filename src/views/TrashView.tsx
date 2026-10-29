import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, Loader2 } from 'lucide-react';
import type { DesignReference } from '../types';
import { api } from '../services/api';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface TrashViewProps {
  onCountsChanged: () => void;
}

export const TrashView: React.FC<TrashViewProps> = ({ onCountsChanged }) => {
  const [trashItems, setTrashItems] = useState<DesignReference[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadTrash = async () => {
    setLoading(true);
    try {
      const items = await api.getReferences({ isTrash: true });
      setTrashItems(items);
    } catch (err) {
      console.error('Failed to load trash:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
  }, []);

  const [deletingRef, setDeletingRef] = useState<DesignReference | null>(null);

  const handleRestore = async (id: string) => {
    setActionId(id);
    try {
      await api.restoreFromTrash(id);
      setTrashItems(trashItems.filter((item) => item.id !== id));
      onCountsChanged();
    } catch (err: any) {
      console.error('Failed to restore reference:', err);
    } finally {
      setActionId(null);
    }
  };

  const handlePermanentDelete = (ref: DesignReference) => {
    setDeletingRef(ref);
  };

  const handleConfirmPermanentDelete = async () => {
    if (!deletingRef) return;
    const id = deletingRef.id;
    setActionId(id);
    try {
      await api.deletePermanently(id);
      setTrashItems(trashItems.filter((item) => item.id !== id));
      onCountsChanged();
    } catch (err: any) {
      console.error('Failed to delete permanently:', err);
    } finally {
      setActionId(null);
      setDeletingRef(null);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F4E7CF]">
      {/* Header */}
      <div className="px-6 lg:px-10 pt-8 pb-6 border-b-2 border-[#29231C] bg-[#FFF0D7] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3.5">
            <h1 className="text-3xl lg:text-4xl font-heading font-black tracking-tight text-[#171511]">
              Trash
            </h1>
            <span className="font-pixel text-[10px] font-bold uppercase tracking-wider text-[#171511] px-3 py-1 bg-[#FFE344] border-2 border-[#29231C] shadow-xs">
              {trashItems.length} {trashItems.length === 1 ? 'ITEM' : 'ITEMS'}
            </span>
          </div>
          <p className="text-base text-[#756858] font-medium mt-2">
            Soft-deleted references. You can restore any item or permanently expunge it.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 lg:p-10 flex-1">
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-[#171511]" />
          </div>
        ) : trashItems.length > 0 ? (
          <div className="divide-y-2 divide-[#29231C] border-2 border-[#29231C] bg-[#FFF0D7] shadow-retro">
            {trashItems.map((ref) => (
              <div
                key={ref.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FFE344]/30 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-16 bg-[#F4E7CF] border-2 border-[#29231C] shrink-0 overflow-hidden flex items-center justify-center">
                    {ref.imageUrl ? (
                      <img src={ref.imageUrl} alt={ref.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs font-mono font-bold text-[#756858]">No Img</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-heading font-bold text-[#171511] truncate">
                      {ref.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#756858] font-mono mt-1">
                      <span>Deleted: {ref.deletedAt ? new Date(ref.deletedAt).toLocaleDateString() : 'Recently'}</span>
                      {ref.sourceDomain && (
                        <>
                          <span>•</span>
                          <span className="truncate">{ref.sourceDomain}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleRestore(ref.id)}
                    disabled={actionId === ref.id}
                    className="h-10 px-4 flex items-center gap-2 bg-[#FFE344] hover:bg-[#ffe766] text-xs font-bold uppercase tracking-wider text-[#171511] border-2 border-[#29231C] shadow-retro transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                    <span>Restore</span>
                  </button>

                  <button
                    onClick={() => handlePermanentDelete(ref)}
                    disabled={actionId === ref.id}
                    className="h-10 px-4 flex items-center gap-2 bg-[#FFF0D7] hover:bg-[#FF682D] hover:text-white text-xs font-bold uppercase tracking-wider text-[#FF682D] border-2 border-[#29231C] shadow-retro transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Expunge</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto my-16 bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro-md">
            <div className="w-16 h-16 bg-[#FFE344] border-2 border-[#29231C] shadow-retro flex items-center justify-center text-[#171511] mb-5">
              <Trash2 className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h3 className="text-2xl font-heading font-black text-[#171511]">Trash is Empty</h3>
            <p className="text-base text-[#756858] mt-2.5 leading-relaxed font-medium">
              When references are removed from your library, they are safely preserved here before permanent deletion.
            </p>
          </div>
        )}
      </div>

      <DeleteConfirmModal
        isOpen={Boolean(deletingRef)}
        title="Permanently Expunge Item"
        message={`Permanently expunge "${deletingRef?.title}"? This cannot be undone and permanently removes all stored files.`}
        confirmLabel="Expunge Item"
        onConfirm={handleConfirmPermanentDelete}
        onCancel={() => setDeletingRef(null)}
      />
    </div>
  );
};
