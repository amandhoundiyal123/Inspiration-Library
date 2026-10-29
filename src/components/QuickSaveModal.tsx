import React, { useState, useRef } from 'react';
import { X, Upload, Globe, Image as ImageIcon, Loader2, Link2, Check, AlertCircle } from 'lucide-react';
import type { Collection, DesignReference } from '../types';
import { api } from '../services/api';

interface QuickSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onReferenceSaved: (newRef: DesignReference) => void;
}

type TabMode = 'image' | 'url' | 'both';

export const QuickSaveModal: React.FC<QuickSaveModalProps> = ({
  isOpen,
  onClose,
  collections,
  onReferenceSaved
}) => {
  const [tab, setTab] = useState<TabMode>('image');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [title, setTitle] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Scraping state
  const [scraping, setScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);

  // Saving state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreviewUrl(URL.createObjectURL(selected));
      if (!title) {
        const cleanName = selected.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      setPreviewUrl(URL.createObjectURL(dropped));
      if (!title) {
        const cleanName = dropped.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const handleScrape = async () => {
    if (!urlInput.trim()) return;
    setScraping(true);
    setScrapeError(null);
    try {
      const data = await api.scrapeUrl(urlInput.trim());
      if (data.title && !title) setTitle(data.title);
      if (data.description && !personalNotes) setPersonalNotes(data.description);
      if (data.ogImage && !file && !previewUrl) {
        setPreviewUrl(data.ogImage);
      }
    } catch (err: any) {
      setScrapeError(err.message || 'Could not auto-fetch website details. You can still save it directly.');
    } finally {
      setScraping(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleCollection = (colId: string) => {
    if (selectedCollectionIds.includes(colId)) {
      setSelectedCollectionIds(selectedCollectionIds.filter((id) => id !== colId));
    } else {
      setSelectedCollectionIds([...selectedCollectionIds, colId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    if (tab === 'image' && !file && !previewUrl) {
      setSaveError('Please select or drop an image file.');
      return;
    }

    if (tab === 'url' && !urlInput.trim()) {
      setSaveError('Please enter a website URL.');
      return;
    }

    if (tab === 'both' && !file && !previewUrl && !urlInput.trim()) {
      setSaveError('Please provide an image or website URL.');
      return;
    }

    setSaving(true);

    try {
      let finalTitle = title.trim();
      if (!finalTitle) {
        if (file) {
          finalTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        } else if (urlInput.trim()) {
          try {
            finalTitle = new URL(urlInput.trim()).hostname;
          } catch {
            finalTitle = 'Saved Inspiration';
          }
        } else {
          finalTitle = 'Untitled Reference';
        }
      }

      const formData = new FormData();
      formData.append('title', finalTitle);
      if (personalNotes.trim()) formData.append('personalNotes', personalNotes.trim());
      if (urlInput.trim()) formData.append('sourceUrl', urlInput.trim());
      if (file) formData.append('image', file);
      if (selectedCollectionIds.length > 0) {
        formData.append('collectionIds', JSON.stringify(selectedCollectionIds));
      }
      if (tags.length > 0) {
        formData.append('tags', JSON.stringify(tags));
      }

      const newRef = await api.createReference(formData);

      onReferenceSaved(newRef);
      onClose();
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save reference. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171511]/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro-lg flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b-2 border-[#29231C] bg-[#FFE344] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-heading text-xl font-black text-[#171511]">Add Inspiration</span>
            <span className="text-xs font-mono font-bold text-[#756858]">/ Save Reference</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#171511] hover:bg-[#FFF0D7] border-2 border-[#29231C] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="px-6 pt-4 pb-3 border-b-2 border-[#29231C] flex gap-3 bg-[#FFF0D7]">
          <button
            type="button"
            onClick={() => setTab('image')}
            className={`flex items-center gap-2 px-4 py-2 border-2 border-[#29231C] text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === 'image'
                ? 'bg-[#FFE344] text-[#171511] shadow-xs'
                : 'bg-[#F4E7CF] text-[#756858] hover:text-[#171511]'
            }`}
          >
            <ImageIcon className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Image</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`flex items-center gap-2 px-4 py-2 border-2 border-[#29231C] text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === 'url'
                ? 'bg-[#FFE344] text-[#171511] shadow-xs'
                : 'bg-[#F4E7CF] text-[#756858] hover:text-[#171511]'
            }`}
          >
            <Globe className="w-4 h-4 stroke-[2.5]" />
            <span>Website URL</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('both')}
            className={`flex items-center gap-2 px-4 py-2 border-2 border-[#29231C] text-xs font-bold uppercase tracking-wider transition-colors ${
              tab === 'both'
                ? 'bg-[#FFE344] text-[#171511] shadow-xs'
                : 'bg-[#F4E7CF] text-[#756858] hover:text-[#171511]'
            }`}
          >
            <Link2 className="w-4 h-4 stroke-[2.5]" />
            <span>Image + URL</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          {saveError && (
            <div className="p-3.5 bg-[#FF682D] text-white border-2 border-[#29231C] flex items-center gap-2.5 text-xs font-bold">
              <AlertCircle className="w-5 h-5 shrink-0 stroke-[3]" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Image Upload Area */}
          {(tab === 'image' || tab === 'both') && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171511]">
                Design Screenshot / Image
              </label>

              {previewUrl ? (
                <div className="relative aspect-[16/9] w-full bg-[#F4E7CF] border-2 border-[#29231C] shadow-retro overflow-hidden flex items-center justify-center">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-3 right-3 p-2 bg-[#171511] text-white border-2 border-[#29231C] shadow-retro hover:bg-[#FF682D] transition-colors"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#29231C] hover:bg-[#FFE344]/20 p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#F4E7CF]"
                >
                  <Upload className="w-8 h-8 text-[#171511] mb-2 stroke-[2.2]" />
                  <span className="text-base font-heading font-black text-[#171511]">Choose a design screenshot or drag & drop</span>
                  <span className="text-xs text-[#756858] font-mono mt-1">PNG, JPG, WebP, SVG up to 25MB</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          )}

          {/* URL Input Area */}
          {(tab === 'url' || tab === 'both') && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171511]">
                Website URL
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/great-design"
                  className="flex-1 h-12 bg-[#F4E7CF] border-2 border-[#29231C] shadow-retro px-4 text-sm font-semibold text-[#171511] placeholder:text-[#756858] focus:outline-none focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleScrape}
                  disabled={scraping || !urlInput.trim()}
                  className="h-12 px-4 bg-[#FFE344] hover:bg-[#ffe766] disabled:opacity-50 text-xs font-bold uppercase tracking-wider text-[#171511] border-2 border-[#29231C] shadow-retro flex items-center gap-2 cursor-pointer transition-colors"
                >
                  {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4 stroke-[2.5]" />}
                  <span>{scraping ? 'Fetching...' : 'Fetch Info'}</span>
                </button>
              </div>

              {scrapeError && (
                <p className="text-xs text-[#FF682D] font-bold mt-1">{scrapeError}</p>
              )}
            </div>
          )}

          {/* Title */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171511]">
              Title <span className="text-[#756858] normal-case">(optional)</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern Minimalist SaaS Hero..."
              className="w-full h-12 bg-[#F4E7CF] border-2 border-[#29231C] shadow-retro px-4 text-sm font-semibold text-[#171511] placeholder:text-[#756858] focus:outline-none focus:bg-white"
            />
          </div>

          {/* Personal Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171511]">
              Personal Notes <span className="text-[#756858] normal-case">(why did you save this?)</span>
            </label>
            <textarea
              value={personalNotes}
              onChange={(e) => setPersonalNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Love the sharp borders, typographic contrast, and warm yellow highlights..."
              className="w-full bg-[#F4E7CF] border-2 border-[#29231C] shadow-retro p-3 text-sm font-medium text-[#171511] placeholder:text-[#756858] focus:outline-none focus:bg-white resize-none"
            />
          </div>

          {/* Collections Selector */}
          {collections.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#171511]">
                Assign to Collections
              </label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
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

          {/* Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#171511]">
              Tags <span className="text-[#756858] normal-case">(press Enter)</span>
            </label>
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
                placeholder="e.g. brutalism, darkmode, typography"
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
                      aria-label={`Remove tag ${t}`}
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t-2 border-[#29231C] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-12 px-5 text-xs font-bold uppercase tracking-wider text-[#171511] hover:bg-[#FFE344] border-2 border-[#29231C] bg-[#F4E7CF] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="h-12 px-6 bg-[#FF682D] text-white hover:bg-[#ff7a45] text-xs font-bold uppercase tracking-wider border-2 border-[#29231C] shadow-retro disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{saving ? 'Saving...' : 'Save to Library'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
