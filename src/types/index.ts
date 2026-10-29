export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  referenceCount?: number;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  count?: number;
}

export interface DesignAnalysis {
  id: string;
  referenceId: string;
  userId: string;
  modelIdentifier: string;
  summary: string;
  primaryStyle: string;
  secondaryStyles: string[];
  visualMood: string;
  associations: string[];
  keywords: string[];
  typography: {
    classification: string;
    characteristics: string;
    hierarchyNotes: string;
  };
  colorPalette: Array<{
    hex: string;
    name: string;
    role: string;
  }>;
  layout: {
    gridType: string;
    density: string;
    whitespace: string;
    compositionNotes: string;
  };
  shapesAndTextures: string[];
  interactionObservations?: string;
  whyItWorks: string;
  potentialUses: string[];
  implementationIdeas: string[];
  creativeBrief: string;
  reusablePrompt: string;
  confidenceOrUncertainty?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DesignReference {
  id: string;
  userId: string;
  title: string;
  sourceUrl?: string;
  sourceDomain?: string;
  imageStoragePath?: string;
  imageUrl?: string;
  originalFilename?: string;
  mimeType?: string;
  fileSize?: number;
  personalNotes?: string;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  collections?: Collection[];
  tags?: Array<{ id: string; name: string; origin: 'user' | 'ai' }>;
  analysis?: DesignAnalysis | null;
}

export type NavigationTab = 
  | 'all'
  | 'collections'
  | 'collection-detail'
  | 'styles'
  | 'style-detail'
  | 'favorites'
  | 'recent'
  | 'trash'
  | 'settings';

export type ReferenceTypeFilter = 'all' | 'image' | 'url' | 'both';

export type SortField = 'recent' | 'oldest' | 'updated' | 'title';

export interface FilterState {
  search: string;
  collectionId?: string;
  style?: string;
  tag?: string;
  typeFilter: ReferenceTypeFilter;
  onlyFavorites: boolean;
  sortBy: SortField;
}
