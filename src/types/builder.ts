import { GamebookData } from './gamebook';

export type BuilderMode = 'editor' | 'preview';

export type PageType = 'normal' | 'combat' | 'shop';

export interface BuilderState {
  mode: BuilderMode;
  gamebookData: GamebookData;
  selectedPageId: number | string | null;
  selectedSection: BuilderSection;
  isDirty: boolean;
  lastSaved: Date | null;
  errors: ValidationError[];
  previewState?: any; // Store preview game state
}

export type BuilderSection = 
  | 'meta'
  | 'preset'
  | 'player'
  | 'sections'
  | 'pages'
  | 'items'
  | 'enemies';

export interface ValidationError {
  id: string;
  type: 'error' | 'warning';
  section: BuilderSection;
  pageId?: string;
  field?: string;
  message: string;
}

export interface NodeData {
  id: string;
  label: string;
  pageType: PageType;
  firstLineText: string;
  isStarting?: boolean;
  isBookmark?: boolean;
  isEnding?: boolean;
  hasErrors?: boolean;
}

export interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  data: GamebookData;
}
