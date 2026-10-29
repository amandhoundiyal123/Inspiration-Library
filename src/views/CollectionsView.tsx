import React, { useState } from 'react';
import { Folder, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import type { Collection } from '../types';
import { api } from '../services/api';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

interface CollectionsViewProps {
  collections: Collection[];
  onSelectCollection: (col: Collection) => void;
  onRefreshCollections: () => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections,
  onSelectCollection,
  onRefreshCollections
}) => {
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openCreate = () => {
    setName('');
    setDescription('');
    setError(null);
    setModalMode('create');
  };

  const openEdit = (col: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCollection(col);
    setName(col.name);
    setDescription(col.description || '');
    setError(null);
    setModalMode('edit');
  };

  const [deletingCol, setDeletingCol] = useState<Collection | null>(null);

  const handleDelete = (col: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingCol(col);
  };

  const handleConfirmDelete = async () => {
    if (!deletingCol) return;
    try {
      await api.deleteCollection(deletingCol.id);
      onRefreshCollections();
    } catch (err: any) {
      console.error('Failed to delete collection:', err);
    } finally {
      setDeletingCol(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Collection name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      if (modalMode === 'create') {
        await api.createCollection(name.trim(), description.trim() || undefined);
      } else if (modalMode === 'edit' && editingCollection) {
        await api.updateCollection(
          editingCollection.id,
          name.trim(),
          description.trim() || undefined
        );
      }
      setModalMode(null);
      onRefreshCollections();
    } catch (err: any) {
      setError(err.message || 'Failed to save collection');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F4E7CF]">
      {/* Header */}
      <div className="px-6 lg:px-10 pt-8 pb-6 border-b-2 border-[#29231C] bg-[#FFF0D7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3.5">
            <h1 className="text-3xl lg:text-4xl font-heading font-black tracking-tight text-[#171511]">
              Collections
            </h1>
            <span className="font-pixel text-[10px] font-bold uppercase tracking-wider text-[#171511] px-3 py-1 bg-[#FFE344] border-2 border-[#29231C] shadow-xs">
              {collections.length} {collections.length === 1 ? 'GROUP' : 'GROUPS'}
            </span>
          </div>
          <p className="text-base text-[#756858] font-medium mt-2">
            Organize references into thematic design categories, brands, or client projects.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="h-12 px-5 flex items-center gap-2 bg-[#FF682D] hover:bg-[#ff7a45] text-white font-pixel text-[11px] font-bold uppercase tracking-wider border-2 border-[#29231C] shadow-retro cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Grid */}
      <div className="p-6 lg:p-10 flex-1">
        {collections.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((col) => (
              <div
                key={col.id}
                onClick={() => onSelectCollection(col)}
                className="group p-6 bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro hover:shadow-retro-md hover:-translate-y-0.5 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-[#FFE344] border-2 border-[#29231C] shadow-xs flex items-center justify-center text-[#171511]">
                      <Folder className="w-6 h-6 stroke-[2.2]" />
                    </div>

                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => openEdit(col, e)}
                        className="p-2 text-[#171511] hover:bg-[#FFE344] border-2 border-[#29231C] bg-[#FFF0D7] transition-colors"
                        title="Edit collection"
                        aria-label="Edit collection"
                      >
                        <Edit2 className="w-4 h-4 stroke-[2]" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(col, e)}
                        className="p-2 text-[#FF682D] hover:bg-[#FFE344] border-2 border-[#29231C] bg-[#FFF0D7] transition-colors"
                        title="Delete collection"
                        aria-label="Delete collection"
                      >
                        <Trash2 className="w-4 h-4 stroke-[2]" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-heading font-black text-[#171511] group-hover:text-[#FF682D] transition-colors truncate">
                    {col.name}
                  </h3>

                  {col.description ? (
                    <p className="text-sm text-[#756858] mt-2 line-clamp-2 leading-relaxed font-medium">
                      {col.description}
                    </p>
                  ) : (
                    <p className="text-xs text-[#756858] mt-2 italic">No description provided</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t-2 border-[#29231C]/15 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-[#171511] bg-[#FFE344] px-2.5 py-1 border border-[#29231C]">
                    {col.referenceCount || 0} {col.referenceCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-[#756858] font-mono">
                    {new Date(col.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto my-16 bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro-md">
            <div className="w-16 h-16 bg-[#FFE344] border-2 border-[#29231C] shadow-retro flex items-center justify-center text-[#171511] mb-5">
              <Folder className="w-8 h-8 stroke-[2.2]" />
            </div>
            <h3 className="text-2xl font-heading font-black text-[#171511]">No collections yet</h3>
            <p className="text-base text-[#756858] mt-2.5 leading-relaxed font-medium">
              Create collections like "Landing Pages", "Dark Mode UI", or "Editorial Typographies" to group references.
            </p>
            <button
              onClick={openCreate}
              className="mt-6 h-12 px-6 flex items-center gap-2 bg-[#FF682D] hover:bg-[#ff7a45] text-white text-xs font-bold uppercase tracking-wider border-2 border-[#29231C] shadow-retro transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Collection</span>
            </button>
          </div>
        )}
      </div>

      {/* Create / Edit Collection Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171511]/70 backdrop-blur-xs">
          <div className="bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro-lg max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b-2 border-[#29231C] pb-4">
              <h3 className="text-xl font-heading font-black text-[#171511]">
                {modalMode === 'create' ? 'Create Collection' : 'Edit Collection'}
              </h3>
              <button
                onClick={() => setModalMode(null)}
                className="p-1.5 text-[#171511] hover:bg-[#FFE344] border-2 border-[#29231C]"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-[#FF682D] text-white text-xs font-bold border-2 border-[#29231C]">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#171511] mb-1.5">
                  Collection Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Minimalist Dashboards"
                  required
                  autoFocus
                  className="w-full h-12 bg-[#F4E7CF] border-2 border-[#29231C] shadow-retro px-4 text-sm font-semibold text-[#171511] placeholder:text-[#756858] focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#171511] mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Notes about what kind of design patterns live in this collection..."
                  rows={3}
                  className="w-full bg-[#F4E7CF] border-2 border-[#29231C] shadow-retro p-3 text-sm font-medium text-[#171511] placeholder:text-[#756858] focus:outline-none focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#29231C]">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="h-11 px-4 bg-[#F4E7CF] hover:bg-[#FFE344] text-[#171511] border-2 border-[#29231C] text-xs font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-11 px-6 bg-[#FF682D] hover:bg-[#ff7a45] text-white border-2 border-[#29231C] shadow-retro text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{modalMode === 'create' ? 'Create' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingCol)}
        title="Delete Collection"
        message={`Delete "${deletingCol?.name}"? Your saved references in this collection will NOT be deleted.`}
        confirmLabel="Delete Collection"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingCol(null)}
      />
    </div>
  );
};
