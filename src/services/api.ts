import type { DesignReference, Collection, Tag, DesignAnalysis, FilterState } from '../types';

const TOKEN_KEY = 'designvault_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(url, { ...options, headers });
  
  if (!res.ok) {
    let errorMsg = `Request failed: ${res.statusText}`;
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {}
    throw new Error(errorMsg);
  }

  return res;
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    setStoredToken(data.token);
    return data;
  },

  async register(email: string, password: string, displayName: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    setStoredToken(data.token);
    return data;
  },

  async loginDemo() {
    const res = await fetch('/api/auth/demo', { method: 'POST' });
    if (!res.ok) throw new Error('Demo login failed');
    const data = await res.json();
    setStoredToken(data.token);
    return data;
  },

  async getMe() {
    const res = await fetchWithAuth('/api/auth/me');
    return res.json();
  },

  logout() {
    setStoredToken(null);
  },

  // Scrape URL
  async scrapeUrl(url: string) {
    const res = await fetchWithAuth('/api/scrape-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    return res.json();
  },

  // References
  async getReferences(filters: Partial<FilterState> & { isTrash?: boolean } = {}) {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.collectionId) params.set('collectionId', filters.collectionId);
    if (filters.style) params.set('style', filters.style);
    if (filters.tag) params.set('tag', filters.tag);
    if (filters.typeFilter && filters.typeFilter !== 'all') params.set('typeFilter', filters.typeFilter);
    if (filters.onlyFavorites) params.set('onlyFavorites', 'true');
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.isTrash) params.set('isTrash', 'true');

    const res = await fetchWithAuth(`/api/references?${params.toString()}`);
    return res.json() as Promise<DesignReference[]>;
  },

  async getReferenceById(id: string) {
    const res = await fetchWithAuth(`/api/references/${id}`);
    return res.json() as Promise<DesignReference>;
  },

  async createReference(formData: FormData) {
    const res = await fetchWithAuth('/api/references', {
      method: 'POST',
      body: formData
    });
    return res.json() as Promise<DesignReference>;
  },

  async updateReference(id: string, updates: {
    title?: string;
    sourceUrl?: string;
    sourceDomain?: string;
    personalNotes?: string;
    isFavorite?: boolean;
    collectionIds?: string[];
    tags?: string[];
  }) {
    const res = await fetchWithAuth(`/api/references/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json() as Promise<DesignReference>;
  },

  async toggleFavorite(id: string) {
    const res = await fetchWithAuth(`/api/references/${id}/favorite`, { method: 'POST' });
    return res.json() as Promise<{ isFavorite: boolean }>;
  },

  async moveToTrash(id: string) {
    const res = await fetchWithAuth(`/api/references/${id}/trash`, { method: 'POST' });
    return res.json();
  },

  async restoreFromTrash(id: string) {
    const res = await fetchWithAuth(`/api/references/${id}/restore`, { method: 'POST' });
    return res.json();
  },

  async deletePermanently(id: string) {
    const res = await fetchWithAuth(`/api/references/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // AI Analysis
  async analyzeReference(id: string) {
    const res = await fetchWithAuth(`/api/references/${id}/analyze`, { method: 'POST' });
    return res.json() as Promise<DesignAnalysis>;
  },

  async updateAnalysis(id: string, updates: {
    creativeBrief?: string;
    reusablePrompt?: string;
    primaryStyle?: string;
    summary?: string;
  }) {
    const res = await fetchWithAuth(`/api/references/${id}/analysis`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json() as Promise<DesignAnalysis>;
  },

  async adaptPrompt(id: string, targetProject: string) {
    const res = await fetchWithAuth(`/api/references/${id}/adapt-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetProject })
    });
    return res.json() as Promise<{ adaptedPrompt: string }>;
  },

  // Collections
  async getCollections() {
    const res = await fetchWithAuth('/api/collections');
    return res.json() as Promise<Collection[]>;
  },

  async createCollection(name: string, description?: string) {
    const res = await fetchWithAuth('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    return res.json() as Promise<Collection>;
  },

  async updateCollection(id: string, name: string, description?: string) {
    const res = await fetchWithAuth(`/api/collections/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description })
    });
    return res.json() as Promise<Collection>;
  },

  async deleteCollection(id: string) {
    const res = await fetchWithAuth(`/api/collections/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Tags & Styles
  async getTags() {
    const res = await fetchWithAuth('/api/tags');
    return res.json() as Promise<Tag[]>;
  },

  async deleteTag(id: string) {
    const res = await fetchWithAuth(`/api/tags/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async getStyles() {
    const res = await fetchWithAuth('/api/styles');
    return res.json() as Promise<Array<{ name: string; count: number; sampleKeywords: string[]; description?: string }>>;
  },

  async getCounts() {
    const res = await fetchWithAuth('/api/counts');
    return res.json() as Promise<{ all: number; favorites: number; trash: number; collections: number }>;
  },

  async getSystemStatus() {
    const res = await fetchWithAuth('/api/system/status');
    return res.json();
  },

  async restoreBackup(data: any) {
    const res = await fetchWithAuth('/api/backup/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
