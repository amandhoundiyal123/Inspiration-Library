import React, { useState } from 'react';
import { Star, ExternalLink, MoreVertical, Edit2, Trash2, Globe, Sparkles } from 'lucide-react';
import type { DesignReference } from '../types';

interface ReferenceCardProps {
  reference: DesignReference;
  onOpenDetails: (ref: DesignReference) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onEdit: (ref: DesignReference, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const ReferenceCard: React.FC<ReferenceCardProps> = ({
  reference,
  onOpenDetails,
  onToggleFavorite,
  onEdit,
  onDelete
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const primaryStyle = reference.analysis?.primaryStyle;

  return (
    <article
      onClick={() => onOpenDetails(reference)}
      className="group relative bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro hover:shadow-retro-md hover:-translate-y-0.5 flex flex-col transition-all duration-150 cursor-pointer overflow-hidden"
    >
      {/* Thumbnail Container - Generous aspect ratio */}
      <div className="relative aspect-[16/10] bg-[#F4E7CF] overflow-hidden flex items-center justify-center border-b-2 border-[#29231C]">
        {reference.imageUrl && !imageError ? (
          <img
            src={reference.imageUrl}
            alt={reference.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-[#756858]">
            {reference.sourceUrl ? (
              <>
                <Globe className="w-10 h-10 mb-2 stroke-[2] text-[#171511]" />
                <span className="text-sm font-bold text-[#171511] truncate max-w-[220px]">
                  {reference.sourceDomain || 'Web Reference'}
                </span>
                <span className="text-xs font-mono text-[#756858] mt-1">Design Link Saved</span>
              </>
            ) : (
              <span className="text-sm font-medium text-[#756858]">No preview image</span>
            )}
          </div>
        )}

        {/* Top Badges (Always clear, high-contrast) */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between pointer-events-none">
          {/* Style Badge */}
          <div className="pointer-events-auto">
            {primaryStyle ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-[#FFE344] border-2 border-[#29231C] shadow-xs text-[#171511]">
                <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                {primaryStyle}
              </span>
            ) : reference.sourceDomain ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-semibold bg-[#FFF0D7] border-2 border-[#29231C] shadow-xs text-[#171511]">
                {reference.sourceDomain}
              </span>
            ) : null}
          </div>

          {/* Quick Actions (Favorite & Options) */}
          <div className="pointer-events-auto flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => onToggleFavorite(reference.id, e)}
              className={`h-9 w-9 flex items-center justify-center border-2 border-[#29231C] shadow-xs transition-colors cursor-pointer ${
                reference.isFavorite
                  ? 'bg-[#FFE344] text-[#171511]'
                  : 'bg-[#FFF0D7] text-[#756858] hover:text-[#171511] hover:bg-[#FFE344]'
              }`}
              title={reference.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
              aria-label={reference.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            >
              <Star className={`w-4 h-4 stroke-[2.5] ${reference.isFavorite ? 'fill-[#171511]' : ''}`} />
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(!menuOpen);
                }}
                className="h-9 w-9 flex items-center justify-center bg-[#FFF0D7] hover:bg-[#FFE344] text-[#171511] border-2 border-[#29231C] shadow-xs transition-colors cursor-pointer"
                aria-label="Options menu"
              >
                <MoreVertical className="w-4 h-4 stroke-[2.5]" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                    }}
                  />
                  <div className="absolute right-0 top-11 z-30 w-48 bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro-md py-1 text-sm font-semibold">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit(reference, e);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[#171511] hover:bg-[#FFE344] transition-colors text-left cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4 stroke-[2.2]" />
                      <span>Edit Details</span>
                    </button>
                    {reference.sourceUrl && (
                      <a
                        href={reference.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[#171511] hover:bg-[#FFE344] transition-colors text-left"
                      >
                        <ExternalLink className="w-4 h-4 stroke-[2.2]" />
                        <span>Visit Website</span>
                      </a>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onDelete(reference.id, e);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[#FF682D] hover:bg-[#FFE344] transition-colors border-t-2 border-[#29231C] mt-1 text-left cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 stroke-[2.2]" />
                      <span>Move to Trash</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Card Content - Generous spacing & typography */}
      <div className="p-5 flex flex-col justify-between flex-1 bg-[#FFF0D7]">
        <div>
          <h3 className="font-heading text-lg font-bold text-[#171511] group-hover:text-[#FF682D] transition-colors truncate">
            {reference.title}
          </h3>
          {reference.personalNotes ? (
            <p className="text-sm text-[#756858] line-clamp-2 mt-1.5 font-medium leading-relaxed">
              {reference.personalNotes}
            </p>
          ) : (
            <span className="text-xs font-mono text-[#756858] mt-1.5 block">
              Added {new Date(reference.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>

        {/* Collections & Tags chips */}
        <div className="mt-4 pt-3 border-t-2 border-[#29231C]/15 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            {reference.collections && reference.collections.length > 0 ? (
              reference.collections.slice(0, 2).map((col) => (
                <span
                  key={col.id}
                  className="text-xs font-bold px-2.5 py-1 bg-[#FFE344] text-[#171511] border border-[#29231C]"
                >
                  {col.name}
                </span>
              ))
            ) : reference.tags && reference.tags.length > 0 ? (
              reference.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag.id}
                  className="text-xs font-medium px-2 py-0.5 bg-[#F4E7CF] text-[#171511] border border-[#29231C]/60"
                >
                  #{tag.name}
                </span>
              ))
            ) : (
              <span className="text-xs font-mono text-[#756858]">Personal Library</span>
            )}
          </div>

          {reference.analysis?.colorPalette && reference.analysis.colorPalette.length > 0 && (
            <div className="flex items-center gap-1">
              {reference.analysis.colorPalette.slice(0, 3).map((c, i) => (
                <div
                  key={i}
                  className="w-3.5 h-3.5 border border-[#29231C]"
                  style={{ backgroundColor: c.hex }}
                  title={`${c.hex} (${c.role || 'accent'})`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
