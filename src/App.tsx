import React, { useState, useEffect, useCallback } from 'react';
import type { NavigationTab, DesignReference, Collection, FilterState } from './types';
import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { LibraryView } from './views/LibraryView';
import { CollectionsView } from './views/CollectionsView';
import { StylesView } from './views/StylesView';
import { TrashView } from './views/TrashView';
import { SettingsView } from './views/SettingsView';
import { ReferenceDetailView } from './views/ReferenceDetailView';
import { QuickSaveModal } from './components/QuickSaveModal';
import { EditReferenceModal } from './components/EditReferenceModal';
import { DesktopWallpaper } from './components/retro/DesktopWallpaper';
import { RetroTaskbar } from './components/retro/RetroTaskbar';
import { RetroWindowFrame } from './components/retro/RetroWindowFrame';
import { RetroNotepadModal } from './components/retro/RetroNotepadModal';
import { Bookmark } from 'lucide-react';

export const App: React.FC = () => {
  const { user } = useAuth();

  // Desktop Window State
  const [isWindowOpen, setIsWindowOpen] = useState(true);
  const [isWindowMinimized, setIsWindowMinimized] = useState(false);
  const [isWindowMaximized, setIsWindowMaximized] = useState(false);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavigationTab>('all');
  const [selectedReferenceId, setSelectedReferenceId] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [selectedStyleName, setSelectedStyleName] = useState<string | null>(null);

  // Mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Quick Save Modal
  const [isQuickSaveOpen, setIsQuickSaveOpen] = useState(false);

  // Edit Reference Modal
  const [editingReference, setEditingReference] = useState<DesignReference | null>(null);

  // Data & Counts
  const [references, setReferences] = useState<DesignReference[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [counts, setCounts] = useState({ all: 0, favorites: 0, trash: 0, collections: 0 });

  // Filters
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    collectionId: undefined,
    style: undefined,
    tag: undefined,
    typeFilter: 'all',
    onlyFavorites: false,
    sortBy: 'recent'
  });

  // Fetch counts
  const loadCounts = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getCounts();
      setCounts(data);
    } catch (err) {
      console.error('Failed to load counts:', err);
    }
  }, [user]);

  // Fetch collections
  const loadCollections = useCallback(async () => {
    if (!user) return;
    try {
      const data = await api.getCollections();
      setCollections(data);
    } catch (err) {
      console.error('Failed to load collections:', err);
    }
  }, [user]);

  // Fetch references
  const loadReferences = useCallback(async () => {
    if (!user) return;
    setLoadingRefs(true);
    try {
      const activeFilters: Partial<FilterState> = { ...filters };

      // Tab-specific filters
      if (currentTab === 'favorites') {
        activeFilters.onlyFavorites = true;
      }
      if (currentTab === 'recent') {
        activeFilters.sortBy = 'recent';
      }
      if (currentTab === 'collection-detail' && selectedCollection) {
        activeFilters.collectionId = selectedCollection.id;
      }
      if (currentTab === 'style-detail' && selectedStyleName) {
        activeFilters.style = selectedStyleName;
      }

      const data = await api.getReferences(activeFilters);
      setReferences(data);
    } catch (err) {
      console.error('Failed to load references:', err);
    } finally {
      setLoadingRefs(false);
    }
  }, [user, filters, currentTab, selectedCollection, selectedStyleName]);

  // Load initial data
  useEffect(() => {
    loadCounts();
    loadCollections();
  }, [loadCounts, loadCollections]);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  // Handlers
  const handleUpdateFilters = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleSelectTab = (tab: NavigationTab) => {
    setCurrentTab(tab);
    setSelectedReferenceId(null);
    if (tab !== 'collection-detail') setSelectedCollection(null);
    if (tab !== 'style-detail') setSelectedStyleName(null);

    // Reset certain filters on direct tab change
    if (tab === 'all') {
      setFilters((prev) => ({
        ...prev,
        collectionId: undefined,
        style: undefined,
        tag: undefined,
        onlyFavorites: false
      }));
    }
  };

  const handleOpenDetails = (ref: DesignReference) => {
    setSelectedReferenceId(ref.id);
  };

  const handleToggleFavorite = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await api.toggleFavorite(id);
      setReferences((prev) =>
        prev.map((r) => (r.id === id ? { ...r, isFavorite: res.isFavorite } : r))
      );
      loadCounts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenEdit = (ref: DesignReference, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingReference(ref);
  };

  const handleSoftDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.moveToTrash(id);
      setReferences((prev) => prev.filter((r) => r.id !== id));
      loadCounts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReferenceSaved = (newRef: DesignReference) => {
    setReferences((prev) => [newRef, ...prev]);
    loadCollections();
    loadCounts();
    setSelectedReferenceId(newRef.id);
  };

  const handleSelectCollection = (col: Collection) => {
    setSelectedCollection(col);
    setCurrentTab('collection-detail');
    setSelectedReferenceId(null);
  };

  const handleSelectStyle = (styleName: string) => {
    setSelectedStyleName(styleName);
    setCurrentTab('style-detail');
    setSelectedReferenceId(null);
  };

  // Window control actions
  const handleOpenApp = () => {
    setIsWindowOpen(true);
    setIsWindowMinimized(false);
  };

  const handleToggleWindow = () => {
    if (!isWindowOpen || isWindowMinimized) {
      setIsWindowOpen(true);
      setIsWindowMinimized(false);
    } else {
      setIsWindowMinimized(true);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#0A1C3E] select-none font-sans">
      {/* 1. RETRO DESKTOP WALLPAPER & INTERACTIVE SHORTCUTS */}
      <DesktopWallpaper
        onOpenApp={handleOpenApp}
        onNavigateTab={(tab) => {
          handleSelectTab(tab);
          handleOpenApp();
        }}
        onOpenNotepad={() => setIsNotepadOpen(true)}
        referencesCount={counts.all}
        collectionsCount={counts.collections}
        favoritesCount={counts.favorites}
        trashCount={counts.trash}
      />

      {/* 2. MINIMIZED PROMPT (When user minimizes the window) */}
      {isWindowMinimized && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 bg-[#FFF0D7] border-4 border-[#0A3882] shadow-2xl p-6 text-center max-w-sm animate-in fade-in zoom-in-95">
          <div className="w-12 h-12 bg-[#FFE344] border-2 border-[#29231C] mx-auto mb-3 flex items-center justify-center text-[#171511] shadow-retro">
            <Bookmark className="w-7 h-7 stroke-[2.5]" />
          </div>
          <h3 className="font-pixel text-xs font-bold text-[#171511]">
            DesignVault Minimized
          </h3>
          <p className="text-xs text-[#756858] font-medium mt-1.5 leading-relaxed">
            The application is docked in your taskbar below.
          </p>
          <button
            onClick={handleOpenApp}
            className="mt-4 px-4 py-2 bg-[#FF682D] hover:bg-[#ff7a45] text-white font-pixel text-[11px] font-bold border-2 border-[#29231C] shadow-retro cursor-pointer transition-colors"
          >
            Restore Window
          </button>
        </div>
      )}

      {/* 3. RETRO DESKTOP WINDOW CONTAINER */}
      <div 
        className={`absolute inset-0 pb-11 flex items-center justify-center pointer-events-none ${
          isWindowMaximized ? 'p-0' : 'p-0 md:pt-3 md:pb-14 md:pl-28 md:pr-4 lg:pl-32 lg:pr-6'
        }`}
      >
        <div className="pointer-events-auto w-full h-full flex items-center justify-center">
          <RetroWindowFrame
            isMinimized={isWindowMinimized}
            isMaximized={isWindowMaximized}
            onMinimize={() => setIsWindowMinimized(true)}
            onToggleMaximize={() => setIsWindowMaximized(!isWindowMaximized)}
            onClose={() => setIsWindowMinimized(true)}
            referencesCount={counts.all}
            collectionsCount={counts.collections}
          >
            {/* The Real DesignVault Application Running Inside the Window */}
            <div className="flex h-full w-full overflow-hidden bg-[#F4E7CF] text-[#171511]">
              {/* Sidebar Navigation */}
              <Sidebar
                currentTab={currentTab}
                onSelectTab={handleSelectTab}
                counts={counts}
                isOpenMobile={isMobileMenuOpen}
                onCloseMobile={() => setIsMobileMenuOpen(false)}
              />

              {/* Main Body */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <Topbar
                  filters={filters}
                  onUpdateFilters={handleUpdateFilters}
                  onOpenQuickSave={() => setIsQuickSaveOpen(true)}
                  onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
                />

                {/* View Switcher */}
                <main className="flex-1 flex overflow-hidden">
                  {selectedReferenceId ? (
                    <ReferenceDetailView
                      referenceId={selectedReferenceId}
                      onBack={() => setSelectedReferenceId(null)}
                      collections={collections}
                      onReferenceDeleted={(id) => {
                        setReferences((prev) => prev.filter((r) => r.id !== id));
                        loadCounts();
                        setSelectedReferenceId(null);
                      }}
                      onToggleFavoriteGlobal={(id) => {
                        setReferences((prev) =>
                          prev.map((r) => (r.id === id ? { ...r, isFavorite: !r.isFavorite } : r))
                        );
                        loadCounts();
                      }}
                    />
                  ) : currentTab === 'collections' ? (
                    <CollectionsView
                      collections={collections}
                      onSelectCollection={handleSelectCollection}
                      onRefreshCollections={() => {
                        loadCollections();
                        loadCounts();
                      }}
                    />
                  ) : currentTab === 'collection-detail' ? (
                    <LibraryView
                      references={references}
                      loading={loadingRefs}
                      filters={filters}
                      onUpdateFilters={handleUpdateFilters}
                      onOpenQuickSave={() => setIsQuickSaveOpen(true)}
                      onOpenDetails={handleOpenDetails}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={handleOpenEdit}
                      onDelete={handleSoftDelete}
                      title={`Collection: ${selectedCollection?.name || 'Collection'}`}
                      subtitle={selectedCollection?.description || 'References saved in this collection.'}
                    />
                  ) : currentTab === 'styles' ? (
                    <StylesView onSelectStyle={handleSelectStyle} />
                  ) : currentTab === 'style-detail' ? (
                    <LibraryView
                      references={references}
                      loading={loadingRefs}
                      filters={filters}
                      onUpdateFilters={handleUpdateFilters}
                      onOpenQuickSave={() => setIsQuickSaveOpen(true)}
                      onOpenDetails={handleOpenDetails}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={handleOpenEdit}
                      onDelete={handleSoftDelete}
                      title={`Style: ${selectedStyleName || 'Style'}`}
                      subtitle="All saved inspirations sharing this identified visual language."
                    />
                  ) : currentTab === 'favorites' ? (
                    <LibraryView
                      references={references}
                      loading={loadingRefs}
                      filters={filters}
                      onUpdateFilters={handleUpdateFilters}
                      onOpenQuickSave={() => setIsQuickSaveOpen(true)}
                      onOpenDetails={handleOpenDetails}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={handleOpenEdit}
                      onDelete={handleSoftDelete}
                      title="Favorites"
                      subtitle="Your most valued design references and foundational visual directions."
                    />
                  ) : currentTab === 'recent' ? (
                    <LibraryView
                      references={references}
                      loading={loadingRefs}
                      filters={filters}
                      onUpdateFilters={handleUpdateFilters}
                      onOpenQuickSave={() => setIsQuickSaveOpen(true)}
                      onOpenDetails={handleOpenDetails}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={handleOpenEdit}
                      onDelete={handleSoftDelete}
                      title="Recently Added"
                      subtitle="Chronological feed of your latest inspiration saves."
                    />
                  ) : currentTab === 'trash' ? (
                    <TrashView
                      onCountsChanged={() => {
                        loadCounts();
                      }}
                    />
                  ) : currentTab === 'settings' ? (
                    <SettingsView />
                  ) : (
                    <LibraryView
                      references={references}
                      loading={loadingRefs}
                      filters={filters}
                      onUpdateFilters={handleUpdateFilters}
                      onOpenQuickSave={() => setIsQuickSaveOpen(true)}
                      onOpenDetails={handleOpenDetails}
                      onToggleFavorite={handleToggleFavorite}
                      onEdit={handleOpenEdit}
                      onDelete={handleSoftDelete}
                    />
                  )}
                </main>
              </div>

              {/* Quick Save Modal */}
              {isQuickSaveOpen && (
                <QuickSaveModal
                  isOpen={isQuickSaveOpen}
                  onClose={() => setIsQuickSaveOpen(false)}
                  collections={collections}
                  onReferenceSaved={handleReferenceSaved}
                />
              )}

              {/* Edit Reference Modal */}
              {editingReference && (
                <EditReferenceModal
                  reference={editingReference}
                  collections={collections}
                  isOpen={Boolean(editingReference)}
                  onClose={() => setEditingReference(null)}
                  onUpdated={(updated) => {
                    setReferences((prev) =>
                      prev.map((r) => (r.id === updated.id ? updated : r))
                    );
                    loadCollections();
                    loadCounts();
                  }}
                />
              )}
            </div>
          </RetroWindowFrame>
        </div>
      </div>

      {/* 4. RETRO NOTEPAD MODAL (ReadMe.txt) */}
      <RetroNotepadModal
        isOpen={isNotepadOpen}
        onClose={() => setIsNotepadOpen(false)}
      />

      {/* 5. RETRO TASKBAR AT BOTTOM */}
      <RetroTaskbar
        isWindowOpen={isWindowOpen}
        isWindowMinimized={isWindowMinimized}
        onToggleWindow={handleToggleWindow}
        onNavigateTab={(tab) => {
          handleSelectTab(tab);
          handleOpenApp();
        }}
        onOpenNotepad={() => setIsNotepadOpen(true)}
        referencesCount={counts.all}
        collectionsCount={counts.collections}
      />
    </div>
  );
};
export default App;
