// ===== CORE TYPES (Backward Compatible) =====

export interface Choice {
  text: string;
  nextPageId: number;
  // Legacy fields (still supported)
  requiresItem?: string;
  requiresStat?: { name: string; min: number };
  // New extended fields
  conditions?: ChoiceConditions;
  effects?: PageEffects;
  input?: ChoiceInput;
  failurePageId?: number;
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
  section?: number;
  text: string;
  choices: Choice[];
  // Legacy fields (still supported)
  addItems?: string[];
  removeItems?: string[];
  statChanges?: StatChange[];
  // New extended fields
  effects?: PageEffects;
  ending?: EndingConfig;
}

export interface GamebookData {
  // Legacy field (still supported)
  title?: string;
  pages: Page[];
  // New extended fields
  meta?: GameMeta;
  presets?: GamePresets;
  player?: PlayerConfig;
  sections?: Section[];
}

// ===== NEW EXTENDED TYPES =====

export interface GameMeta {
  title?: string;
  author?: string;
  version?: string;
}

export interface StatPreset {
  min: number;
  max: number;
  default: number;
}

export interface ItemPreset {
  name: string;
  visible: boolean;
  type?: 'consumable' | 'clue' | 'key' | 'token' | 'flag';
}

export interface EnemyPreset {
  name: string;
  rank: number;
  note?: string;
}

export interface GamePresets {
  stats?: Record<string, StatPreset>;
  variables?: Record<string, boolean | number>;
  items?: Record<string, ItemPreset>;
  enemies?: Record<string, EnemyPreset>;
}

export interface PlayerConfig {
  statMode?: 'preset' | 'custom' | 'preset_or_custom';
  customPool?: number;
  startingItems?: string[];
}

export interface Section {
  id: number;
  name: string;
}

export interface PageEffects {
  stats?: Record<string, number>;
  variables?: Record<string, boolean | number>;
  itemsAdd?: string[];
  itemsRemove?: string[];
}

export interface StatCondition {
  gte?: number;
  lte?: number;
}

export interface ChoiceConditions {
  stats?: Record<string, StatCondition>;
  items?: string[];
  variables?: Record<string, boolean | number>;
}

export interface ChoiceInput {
  type: 'number' | 'string';
  prompt: string;
  answer: number | string;
}

export interface EndingConfig {
  type: 'hard' | 'soft';
}

// ===== GAME STATE =====

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
  // New fields
  variables?: Record<string, boolean | number>;
  playerName?: string;
  visitedPages?: number[];
}

export interface GameState {
  currentPageId: number;
  inventory: string[];
  stats: Record<string, number>;
  history: number[];
  // New fields
  variables: Record<string, boolean | number>;
  playerName: string;
  visitedPages: Set<number>;
  isCharacterSetupComplete: boolean;
}

// ===== VALIDATION =====

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  context?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
