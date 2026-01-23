// ===== CORE TYPES (Backward Compatible + Spec v1) =====

export interface Choice {
  text: string;
  // Navigation (supports both formats)
  nextPageId?: number;
  to?: string; // New format: section id as string
  toBookmark?: string; // Navigate to a bookmarked page
  // Legacy fields (still supported)
  requiresItem?: string;
  requiresStat?: { name: string; min: number };
  // New extended fields
  conditions?: ChoiceConditions;
  requires?: ChoiceRequires; // Alternative condition format
  effects?: PageEffects;
  input?: ChoiceInput;
  inputGate?: InputGate; // Alternative input format
  failurePageId?: number;
  note?: string; // Author note (e.g., "Resolve combat manually")
}

export interface ChoiceRequires {
  items?: string[];
  variables?: Record<string, boolean | number | string>;
  stats?: Record<string, StatCondition>;
}

export interface InputGate {
  type: 'number' | 'string';
  answer: number | string;
  onSuccess?: {
    variables?: Record<string, boolean | number | string>;
    to?: string;
  };
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
  id: number | string;
  section?: number | string;
  title?: string;
  text: string;
  choices: Choice[];
  bookmark?: string; // Mark this page as a bookmark point
  image?: string; // Image URL for this page
  // Legacy fields (still supported)
  addItems?: string[];
  removeItems?: string[];
  statChanges?: StatChange[];
  // New extended fields
  effects?: PageEffects;
  ending?: EndingConfig;
  inputGate?: InputGate; // Page-level input gate
}

export interface GamebookData {
  // Legacy field (still supported)
  title?: string;
  pages?: Page[];
  sections?: Section[] | SectionPage[]; // Can be metadata or full pages
  // New extended fields
  meta?: GameMeta;
  theme?: ThemeConfig;
  presets?: GamePresets;
  player?: PlayerConfig;
  items?: ItemDef[]; // Array-based items
  enemies?: EnemyDef[]; // Array-based enemies
}

// ===== THEME CONFIGURATION =====

export interface ThemeConfig {
  defaultMode?: 'light' | 'dark';
  backgroundGradient?: string;
}

// ===== EXTENDED TYPES =====

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

// Array-based item definition (new format)
export interface ItemDef {
  id: string;
  name: string;
  visible?: boolean;
  type?: 'consumable' | 'clue' | 'key' | 'token' | 'flag';
}

export interface EnemyPreset {
  name: string;
  rank: number;
  note?: string;
}

// Array-based enemy definition (new format)
export interface EnemyDef {
  id: string;
  name: string;
  hayat?: number;
  attack?: number;
  rank?: number;
  note?: string;
}

export interface GamePresets {
  stats?: Record<string, StatPreset>;
  variables?: Record<string, boolean | number | string>;
  items?: Record<string, ItemPreset>;
  enemies?: Record<string, EnemyPreset>;
}

export interface PlayerConfig {
  statMode?: 'preset' | 'custom' | 'preset_or_custom';
  customPool?: number;
  startingItems?: string[];
  // New format: direct stat values
  stats?: Record<string, number>;
  // New format: direct variable values
  variables?: Record<string, boolean | number | string>;
  // New format: direct inventory
  inventory?: string[];
}

export interface Section {
  id: number | string;
  name?: string;
  title?: string;
}

// Full section page (new format where sections contain page data)
export interface SectionPage extends Section {
  text?: string;
  image?: string;
  bookmark?: string;
  choices?: Choice[];
  effects?: PageEffects;
  ending?: EndingConfig;
  inputGate?: InputGate;
}

export interface PageEffects {
  stats?: Record<string, number>;
  variables?: Record<string, boolean | number | string>;
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
  variables?: Record<string, boolean | number | string>;
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
  currentPageId: number | string;
  pagePreview: string;
  savedAt: string;
  inventory: string[];
  stats: Record<string, number>;
  history: (number | string)[];
  // New fields
  variables?: Record<string, boolean | number | string>;
  playerName?: string;
  visitedPages?: (number | string)[];
  // Theme preference
  themeMode?: 'light' | 'dark';
}

export interface GameState {
  currentPageId: number | string;
  inventory: string[];
  stats: Record<string, number>;
  history: (number | string)[];
  // New fields
  variables: Record<string, boolean | number | string>;
  playerName: string;
  visitedPages: Set<number | string>;
  isCharacterSetupComplete: boolean;
  // Bookmark registry
  bookmarks: Record<string, number | string>;
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

// ===== DICE TYPES =====

export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

export interface DiceRollResult {
  dice: DiceType;
  quantity: number;
  rolls: number[];
  total: number;
  statName?: string;
  statValue?: number;
  success?: boolean;
}
