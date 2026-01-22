export interface Choice {
  text: string;
  nextPageId: number;
  requiresItem?: string;
  requiresStat?: { name: string; min: number };
}

export interface InventoryChange {
  action: 'add' | 'remove';
  item: string;
}

export interface StatChange {
  name: string;
  value: number;
}

export interface Page {
  id: number;
  text: string;
  choices: Choice[];
  addItems?: string[];
  removeItems?: string[];
  statChanges?: StatChange[];
}

export interface GamebookData {
  title?: string;
  pages: Page[];
}

export interface SaveSlot {
  id: number;
  name: string;
  storyTitle: string;
  currentPageId: number;
  pagePreview: string;
  savedAt: string;
  inventory: string[];
  stats: Record<string, number>;
  history: number[];
}

export interface GameState {
  currentPageId: number;
  inventory: string[];
  stats: Record<string, number>;
  history: number[];
}
