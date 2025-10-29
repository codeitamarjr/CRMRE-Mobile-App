export interface DataProvider {
  getMe(): Promise<{ name: string; phone: string }>;
  updateMe(p: Partial<{ name: string; phone: string }>): Promise<void>;
  getSettings(): Promise<{ theme: 'light'|'dark'|'system' }>;
  updateSettings(s: Partial<{ theme: 'light'|'dark'|'system' }>): Promise<void>;
  getFavorites(): Promise<string[]>;
  addFavorite(id: string): Promise<void>;
  removeFavorite(id: string): Promise<void>;
}

// firebase-provider.ts and laravel-provider.ts implement this.