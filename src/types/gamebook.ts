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
  // Combat system
  combat?: CombatChoice; // Trigger combat encounter
}

export interface CombatChoice {
  enemyId: string; // Reference to enemy in enemies array
  winPageId: number | string; // Page to go to on victory
  losePageId: number | string; // Page to go to on defeat
  winEffects?: PageEffects; // Effects applied on victory
  loseEffects?: PageEffects; // Effects applied on defeat
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
  // Market system
  shop?: ShopConfig; // If present, this page is a market
}

export interface ShopConfig {
  currency: string; // Variable name used as currency (e.g., "coins", "gold")
  items: ShopItem[]; // Items available for purchase
}

export interface ShopItem {
  itemId: string; // Reference to item in items array
  price: number; // Cost in currency
  quantity?: number; // Available stock (optional, unlimited if not specified)
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
  storyId?: string; // Unique identifier for the story (e.g., UUID)
}

export interface StatPreset {
  name: string; // Display name (e.g., "Health", "Strength")
  min: number;
  max: number;
  default: number;
  description?: string; // Optional description
}

// Character profile (premade stat + inventory combination)
export interface CharacterProfile {
  id: string;
  name: string; // Profile name (e.g., "Warrior", "Mage", "Thief")
  description?: string;
  stats: Record<string, number>; // Stat values from presets
  inventory?: string[]; // Starting items
  variables?: Record<string, boolean | number | string>; // Starting variables
}

// Array-based item definition (new format)
export interface ItemDef {
  id: string;
  name: string;
  visible?: boolean;
  type?: 'consumable' | 'clue' | 'key' | 'token' | 'flag';
  description?: string; // Optional description shown on hover
  effects?: PageEffects; // Effects when consumed (for consumable items)
  shopPrice?: number; // Price in shop (if item is sold in market)
}

// Array-based enemy definition (new format)
export interface EnemyDef {
  id: string;
  name: string;
  description?: string;
  stats?: Record<string, number>; // Enemy stats from presets (Health, Attack, Defense, etc.)
  // Legacy fields (backward compatible)
  hayat?: number;
  attack?: number;
  rank?: number;
  note?: string;
}

export interface GamePresets {
  stats?: Record<string, StatPreset>; // Stat definitions only
  variables?: Record<string, boolean | number | string>; // Global variables
  profiles?: CharacterProfile[]; // Premade character profiles
}

export interface PlayerConfig {
  // Character creation mode
  creationMode?: 'sliders' | 'profiles' | 'both'; // How players create characters
  allowCustomName?: boolean; // Allow player to name their character
  totalStatPoints?: number; // For point-buy system (optional)
  
  // Which stats to use (references presets)
  useStats?: string[]; // Array of stat IDs from presets (e.g., ["health", "strength", "magic"])
  
  // Default profile (if no character creation)
  defaultProfile?: string; // Profile ID to use if no character creation
  
  // Starting inventory (if not using profiles)
  startingItems?: string[];
  
  // Starting variables (if not using profiles)
  startingVariables?: Record<string, boolean | number | string>;
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
  storyId: string; // Unique story identifier
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
  // Shop state
  shopInventories?: Record<string, Record<string, number>>;
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
  // Shop state (tracks quantity of items in shops)
  shopInventories: Record<string, Record<string, number>>; // pageId -> itemId -> quantity
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
