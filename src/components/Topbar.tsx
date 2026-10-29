import React from 'react';
import { Search, Plus, Menu, X, ArrowUpDown } from 'lucide-react';
import type { FilterState, ReferenceTypeFilter, SortField } from '../types';

interface TopbarProps {
  filters: FilterState;
  onUpdateFilters: (updates: Partial<FilterState>) => void;
  onOpenQuickSave: () => void;
  onOpenMobileMenu: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  filters,
  onUpdateFilters,
  onOpenQuickSave,
  onOpenMobileMenu
}) => {
  return (
    <header className="h-20 border-b-2 border-[#29231C] bg-[#F4E7CF] sticky top-0 z-30 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2.5 sm:gap-4">
      {/* Left: Mobile trigger & Spacious Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 max-w-2xl">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden h-12 w-12 shrink-0 flex items-center justify-center bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro text-[#171511] hover:bg-[#FFE344] transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Search Input - 48px tall, retro outline & shadow */}
        <div className="relative w-full">
          <Search className="w-5 h-5 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-[#171511] stroke-[2.2] pointer-events-none" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onUpdateFilters({ search: e.target.value })}
            placeholder="Search references..."
            className="w-full h-12 bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro pl-10 sm:pl-12 pr-8 sm:pr-10 text-[14px] sm:text-[15px] font-medium text-[#171511] placeholder-[#756858] focus:outline-none focus:bg-white focus:border-[#29231C] transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onUpdateFilters({ search: '' })}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#756858] hover:text-[#171511] p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Right: Type Filter, Sort Dropdown & Orange Action Button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Type Filter */}
        <div className="hidden sm:flex items-center bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro p-1 h-12">
          {(['all', 'image', 'url', 'both'] as ReferenceTypeFilter[]).map((t) => (
            <button
              key={t}
              onClick={() => onUpdateFilters({ typeFilter: t })}
              className={`h-9 px-3 text-[10px] font-pixel uppercase tracking-wider transition-all border border-transparent cursor-pointer ${
                filters.typeFilter === t
                  ? 'bg-[#FFE344] text-[#171511] border-[#29231C] shadow-xs'
                  : 'text-[#756858] hover:text-[#171511]'
              }`}
            >
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="relative hidden md:block">
          <select
            value={filters.sortBy}
            onChange={(e) => onUpdateFilters({ sortBy: e.target.value as SortField })}
            className="h-12 bg-[#FFF0D7] border-2 border-[#29231C] shadow-retro text-[#171511] font-semibold pl-4 pr-10 text-[13px] uppercase tracking-wider appearance-none focus:outline-none cursor-pointer hover:bg-white transition-colors"
          >
            <option value="recent">Recently Added</option>
            <option value="updated">Recently Revised</option>
            <option value="oldest">Earliest First</option>
            <option value="title">Alphabetical (A-Z)</option>
          </select>
          <ArrowUpDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#171511] stroke-[2.5] pointer-events-none" />
        </div>

        {/* Quick Save Action Button - Vivid Orange with Retro 2px Outline and Shadow */}
        <button
          onClick={onOpenQuickSave}
          className="h-12 px-3.5 sm:px-5 flex items-center gap-2 bg-[#FF682D] text-white hover:bg-[#ff7a45] active:translate-x-[1px] active:translate-y-[1px] font-pixel text-[11px] sm:text-xs font-bold tracking-wide uppercase border-2 border-[#29231C] shadow-retro cursor-pointer transition-all whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span className="hidden xs:inline sm:inline">Add Inspiration</span>
          <span className="xs:hidden sm:hidden inline">Add</span>
        </button>
      </div>
    </header>
  );
};
