import React from 'react';
import { Sparkles, Plus, X, BookmarkCheck } from 'lucide-react';
import type { DesignReference, FilterState } from '../types';
import { ReferenceCard } from '../components/ReferenceCard';

interface LibraryViewProps {
  references: DesignReference[];
  loading: boolean;
  filters: FilterState;
  onUpdateFilters: (updates: Partial<FilterState>) => void;
  onOpenQuickSave: () => void;
  onOpenDetails: (ref: DesignReference) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onEdit: (ref: DesignReference, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  title?: string;
  subtitle?: string;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  references,
  loading,
  filters,
  onUpdateFilters,
  onOpenQuickSave,
  onOpenDetails,
  onToggleFavorite,
  onEdit,
  onDelete,
  title = 'Personal Inspiration Library',
  subtitle = 'Save screenshots, websites, and design systems for your creative reference.'
}) => {
  const hasActiveFilters = Boolean(
    filters.search ||
    filters.collectionId ||
    filters.style ||
    filters.tag ||
    filters.typeFilter !== 'all' ||
    filters.onlyFavorites
  );

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#F4E7CF]">
      {/* Editorial Page Header */}
      <div className="px-6 lg:px-10 pt-8 pb-6 border-b-2 border-[#29231C] bg-[#FFF0D7] flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="flex items-center gap-3.5">
            <h1 className="text-3xl lg:text-4xl font-heading font-black tracking-tight text-[#171511]">
              {title}
            </h1>
            <span className="font-pixel text-[10px] font-bold uppercase tracking-wider text-[#171511] px-3 py-1 bg-[#FFE344] border-2 border-[#29231C] shadow-xs">
              {references.length} {references.length === 1 ? 'ITEM' : 'ITEMS'}
            </span>
          </div>
          <p className="text-base text-[#756858] font-medium mt-2 max-w-2xl">
            {subtitle}
          </p>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[#756858] font-bold uppercase tracking-wider">Filtered by:</span>
            {filters.search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#FFF0D7] border-2 border-[#29231C] shadow-xs text-[#171511]">
                <span>"{filters.search}"</span>
                <button onClick={() => onUpdateFilters({ search: '' })} className="hover:text-[#FF682D] ml-0.5">
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </span>
            )}
            {filters.collectionId && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#FFF0D7] border-2 border-[#29231C] shadow-xs text-[#171511]">
                <span>Collection</span>
                <button onClick={() => onUpdateFilters({ collectionId: undefined })} className="hover:text-[#FF682D] ml-0.5">
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </span>
            )}
            {filters.style && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#FFE344] border-2 border-[#29231C] shadow-xs text-[#171511]">
                <span>{filters.style}</span>
                <button onClick={() => onUpdateFilters({ style: undefined })} className="hover:text-[#FF682D] ml-0.5">
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </span>
            )}
            {filters.tag && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#FFF0D7] border-2 border-[#29231C] shadow-xs text-[#171511]">
                <span>#{filters.tag}</span>
                <button onClick={() => onUpdateFilters({ tag: undefined })} className="hover:text-[#FF682D] ml-0.5">
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </span>
            )}
            {filters.onlyFavorites && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-[#FFE344] border-2 border-[#29231C] shadow-xs text-[#171511]">
                <span>Starred Only</span>
                <button onClick={() => onUpdateFilters({ onlyFavorites: false })} className="hover:text-[#FF682D] ml-0.5">
                  <X className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </span>
            )}
            <button
              onClick={() => onUpdateFilters({ search: '', collectionId: undefined, style: undefined, tag: undefined, typeFilter: 'all', onlyFavorites: false })}
              className="text-xs text-[#FF682D] hover:underline font-bold uppercase tracking-wider ml-1"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Gallery Grid - Substantially enlarged cards with generous gap */}
      <div className="p-6 lg:p-10 flex-1">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro h-80 animate-pulse" />
            ))}
          </div>
        ) : references.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            {references.map((ref) => (
              <ReferenceCard
                key={ref.id}
                reference={ref}
                onOpenDetails={onOpenDetails}
                onToggleFavorite={onToggleFavorite}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          /* Empty Folio State */
          <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto my-16 bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro-md">
            <div className="w-16 h-16 bg-[#FFE344] border-2 border-[#29231C] shadow-retro flex items-center justify-center text-[#171511] mb-5">
              <BookmarkCheck className="w-8 h-8 stroke-[2.2]" />
            </div>

            <h3 className="text-2xl font-heading font-black text-[#171511]">
              {hasActiveFilters ? 'No matching references found' : 'Your Inspiration Library is Empty'}
            </h3>

            <p className="text-base text-[#756858] mt-3 leading-relaxed font-medium">
              {hasActiveFilters
                ? 'Try adjusting or clearing your filters to explore other saved designs in your library.'
                : 'Upload screenshots, save website URLs, and build your personal visual reference collection.'}
            </p>

            <div className="mt-8 flex items-center gap-4">
              {hasActiveFilters ? (
                <button
                  onClick={() => onUpdateFilters({ search: '', collectionId: undefined, style: undefined, tag: undefined, typeFilter: 'all', onlyFavorites: false })}
                  className="h-12 px-6 bg-[#F4E7CF] hover:bg-[#FFE344] text-sm font-bold uppercase tracking-wider text-[#171511] border-2 border-[#29231C] shadow-retro transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <button
                  onClick={onOpenQuickSave}
                  className="h-12 px-6 flex items-center gap-2 bg-[#FF682D] hover:bg-[#ff7a45] text-white text-sm font-bold uppercase tracking-wider border-2 border-[#29231C] shadow-retro transition-colors"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Add First Inspiration</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
