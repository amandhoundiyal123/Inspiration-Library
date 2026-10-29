import React, { useState } from 'react';
import { X, Check, Loader2 } from 'lucide-react';
import type { DesignReference, Collection } from '../types';
import { api } from '../services/api';

interface EditReferenceModalProps {
  reference: DesignReference;
  collections: Collection[];
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updated: DesignReference) => void;
}

export const EditReferenceModal: React.FC<EditReferenceModalProps> = ({
  reference,
  collections,
  isOpen,
  onClose,
  onUpdated
}) => {
  const [title, setTitle] = useState(reference.title);
  const [sourceUrl, setSourceUrl] = useState(reference.sourceUrl || '');
  const [personalNotes, setPersonalNotes] = useState(reference.personalNotes || '');
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>(
    reference.collections?.map((c) => c.id) || []
  );
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(
    reference.tags?.map((t) => t.name) || []
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCollection = (colId: string) => {
    if (selectedCollectionIds.includes(colId)) {
      setSelectedCollectionIds(selectedCollectionIds.filter((id) => id !== colId));
    } else {
      setSelectedCollectionIds([...selectedCollectionIds, colId]);
    }
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const updated = await api.updateReference(reference.id, {
        title: title.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
        personalNotes: personalNotes.trim() || undefined,
        collectionIds: selectedCollectionIds,
        tags
      });

      onUpdated(updated);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update reference');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171511]/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro-lg flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b-2 border-[#29231C] bg-[#FFE344] flex items-center justify-between">
          <span className="font-heading text-xl font-black text-[#171511]">Edit Reference Details</span>
          <button
            onClick={onClose}
            className="p-1.5 text-[#171511] hover:bg-[#FFF0D7] border-2 border-[#29231C] transition-colors"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <p className="text-xs font-bold text-white bg-[#FF682D] p-3 border-2 border-[#29231C]">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171511]">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full h-12 bg-[#F4E7CF] border-2 border-[#29231C] shadow-retro px-4 text-sm font-semibold text-[#171511] focus:outline-none focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171511]">Source URL</label>
            <input
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full h-12 bg-[#F4E7CF] border-2 border-[#29231C] shadow-retro px-4 text-sm font-semibold text-[#171511] placeholder:text-[#756858] focus:outline-none focus:bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171511]">Personal Notes</label>
            <textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              rows={3}
              placeholder="Notes on design styles, aesthetic qualities, or implementation ideas..."
              className="w-full bg-[#F4E7CF] border-2 border-[#29231C] shadow-retro p-3 text-sm font-medium text-[#171511] placeholder:text-[#756858] focus:outline-none focus:bg-white resize-none"
            />
          </div>

          {collections.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171511]">Assigned Collections</label>
              <div className="flex flex-wrap gap-2">
                {collections.map((col) => {
                  const isSelected = selectedCollectionIds.includes(col.id);
                  return (
                    <button
                      key={col.id}
                      type="button"
                      onClick={() => toggleCollection(col.id)}
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 border-[#29231C] transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFE344] text-[#171511] shadow-xs'
                          : 'bg-[#F4E7CF] text-[#756858] hover:text-[#171511]'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-[#171511]" />}
                      <span>{col.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171511]">Tags</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add tag..."
                className="flex-1 h-11 bg-[#F4E7CF] border-2 border-[#29231C] shadow-retro px-4 text-xs font-semibold text-[#171511] placeholder:text-[#756858] focus:outline-none focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="h-11 px-4 bg-[#FFE344] hover:bg-[#ffe766] text-xs font-bold uppercase text-[#171511] border-2 border-[#29231C] shadow-retro transition-colors"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold bg-[#F4E7CF] border-2 border-[#29231C] text-[#171511]"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="text-[#756858] hover:text-[#FF682D]"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t-2 border-[#29231C] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-11 px-5 text-xs font-bold uppercase tracking-wider text-[#171511] bg-[#F4E7CF] hover:bg-[#FFE344] border-2 border-[#29231C] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-11 px-6 bg-[#FF682D] hover:bg-[#ff7a45] text-white border-2 border-[#29231C] shadow-retro text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
