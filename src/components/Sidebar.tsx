import React from 'react';
import { 
  Compass, 
  Folder, 
  Palette, 
  Star, 
  Trash2, 
  Download,
  X,
  Bookmark
} from 'lucide-react';
import type { NavigationTab } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  counts: { all: number; favorites: number; trash: number; collections: number };
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  counts,
  isOpenMobile,
  onCloseMobile
}) => {
  const navItems: Array<{ id: NavigationTab; label: string; icon: React.ReactNode; count?: number }> = [
    { id: 'all', label: 'All Inspiration', icon: <Compass className="w-5 h-5 stroke-[2]" />, count: counts.all },
    { id: 'collections', label: 'Collections', icon: <Folder className="w-5 h-5 stroke-[2]" />, count: counts.collections },
    { id: 'styles', label: 'Design Styles', icon: <Palette className="w-5 h-5 stroke-[2]" /> },
    { id: 'favorites', label: 'Favorites', icon: <Star className="w-5 h-5 stroke-[2]" />, count: counts.favorites },
    { id: 'trash', label: 'Archive Trash', icon: <Trash2 className="w-5 h-5 stroke-[2]" />, count: counts.trash }
  ];

  const handleNavClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-[#171511]/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#F4E7CF] border-r-2 border-[#29231C] flex flex-col justify-between transition-transform duration-200 ease-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div>
          <div className="h-24 flex items-center justify-between px-6 border-b-2 border-[#29231C] bg-[#FFE344]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-[#FFF0D7] border-2 border-[#29231C] flex items-center justify-center text-[#171511] shadow-retro">
                <Bookmark className="w-6 h-6 stroke-[2.2] fill-[#FFE344]" />
              </div>
              <div className="flex flex-col">
                <span className="font-pixel text-[13px] font-bold tracking-tight text-[#171511] leading-tight">
                  DesignVault
                </span>
                <span className="text-[11px] text-[#29231C] font-terminal tracking-wider font-semibold uppercase mt-0.5">
                  Personal Library
                </span>
              </div>
            </div>

            {/* Mobile close button */}
            <button 
              className="md:hidden p-2 text-[#171511] hover:bg-[#FFF0D7] border border-[#29231C] transition-colors cursor-pointer"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-4 space-y-2">
            <div className="px-3 pt-2 pb-1 text-[10px] font-pixel uppercase tracking-widest text-[#756858] font-bold">
              Navigation
            </div>
            {navItems.map((item) => {
              const isActive = currentTab === item.id || 
                (item.id === 'collections' && currentTab === 'collection-detail') ||
                (item.id === 'styles' && currentTab === 'style-detail');

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-[15px] font-semibold transition-all group border-2 cursor-pointer ${
                    isActive
                      ? 'bg-[#FFE344] text-[#171511] border-[#29231C] shadow-retro'
                      : 'bg-transparent border-transparent text-[#29231C] hover:bg-[#FFF0D7] hover:border-[#29231C]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#171511]' : 'text-[#756858] group-hover:text-[#171511]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.count !== undefined && item.count > 0 && (
                    <span className={`text-[10px] font-pixel px-2 py-0.5 font-bold border ${
                      isActive 
                        ? 'bg-[#171511] text-[#FFE344] border-[#171511]' 
                        : 'bg-[#FFF0D7] text-[#171511] border-[#29231C]'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Backup & Export */}
        <div className="p-4 border-t-2 border-[#29231C] bg-[#FFF0D7]">
          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center justify-between px-4 py-3 text-[14px] font-bold transition-all border-2 cursor-pointer ${
              currentTab === 'settings'
                ? 'bg-[#FFE344] text-[#171511] border-[#29231C] shadow-retro'
                : 'bg-[#F4E7CF] text-[#29231C] border-[#29231C] hover:bg-[#FFE344]'
            }`}
          >
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 stroke-[2] text-[#171511]" />
              <span>Backup & Export</span>
            </div>
            <span className="text-[10px] font-pixel uppercase text-[#756858]">JSON/ZIP</span>
          </button>
        </div>
      </aside>
    </>
  );
};
