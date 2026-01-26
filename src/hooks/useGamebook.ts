import { useState, useCallback } from 'react';
import { GamebookData, GameState, Page, Choice, SaveSlot, PageEffects, ChoiceConditions, ChoiceRequires, SectionPage } from '@/types/gamebook';

const SAVE_SLOTS_KEY = 'gamebook_save_slots';
const MAX_SAVE_SLOTS = 5;

const createInitialState = (): GameState => ({
  currentPageId: 0,
  inventory: [],
  stats: {},
  history: [],
  variables: {},
  playerName: '',
  visitedPages: new Set<number | string>(),
  isCharacterSetupComplete: false,
  bookmarks: {},
  shopInventories: {},
});

// Normalize gamebook data to unified page format
function normalizePages(data: GamebookData): Page[] {
  // If pages exist, use them
  if (data.pages && data.pages.length > 0) {
    return data.pages;
  }
  
  // If sections are full page objects (SectionPage format), convert them
  if (data.sections && data.sections.length > 0) {
    const firstSection = data.sections[0];
    if ('text' in firstSection || 'choices' in firstSection) {
      return (data.sections as SectionPage[]).map(section => ({
        id: section.id,
        section: section.id,
        title: section.title || section.name,
        text: section.text || '',
        choices: section.choices || [],
        bookmark: section.bookmark,
        image: section.image,
        effects: section.effects,
        ending: section.ending,
        inputGate: section.inputGate,
      }));
    }
  }
  
  return [];
}

// Get target page ID from a choice (handles both old and new formats)
function getTargetPageId(choice: Choice): number | string | undefined {
  if (choice.nextPageId !== undefined) return choice.nextPageId;
  if (choice.to !== undefined) return choice.to;
  return undefined;
}

export function useGamebook() {
  const [gamebookData, setGamebookData] = useState<GamebookData | null>(null);
  const [normalizedPages, setNormalizedPages] = useState<Page[]>([]);
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [isPlaying, setIsPlaying] = useState(false);

  const loadStory = useCallback((data: GamebookData) => {
    setGamebookData(data);
    
    const pages = normalizePages(data);
    setNormalizedPages(pages);
    
    const firstPageId = pages[0]?.id ?? 0;

    // Initialize variables from presets OR player config
    const initialVariables: Record<string, boolean | number | string> = {};
    if (data.presets?.variables) {
      for (const [key, value] of Object.entries(data.presets.variables)) {
        initialVariables[key] = value;
      }
    }
    // New structure: startingVariables in PlayerConfig
    if (data.player?.startingVariables) {
      for (const [key, value] of Object.entries(data.player.startingVariables)) {
        initialVariables[key] = value as boolean | number | string;
      }
    }

    // Initialize stats from presets (for character creation)
    // If story has character creation, we'll use default values temporarily
    const initialStats: Record<string, number> = {};
    if (data.presets?.stats && data.player?.useStats) {
      for (const statId of data.player.useStats) {
        const preset = data.presets.stats[statId];
        if (preset) {
          initialStats[statId] = preset.default;
        }
      }
    }

    // Initialize starting items
    let initialInventory: string[] = [];
    if (data.player?.startingItems) {
      initialInventory = [...data.player.startingItems];
    }

    // Build bookmark registry from pages
    const bookmarks: Record<string, number | string> = {};
    for (const page of pages) {
      if (page.bookmark) {
        bookmarks[page.bookmark] = page.id;
      }
    }

    // Initialize shop inventories from pages
    const shopInventories: Record<string, Record<string, number>> = {};
    for (const page of pages) {
      if (page.shop) {
        const pageId = String(page.id);
        shopInventories[pageId] = {};
        for (const shopItem of page.shop.items) {
          if (shopItem.quantity !== undefined) {
            shopInventories[pageId][shopItem.itemId] = shopItem.quantity;
          }
        }
      }
    }

    // Determine if character creation is needed
    const needsCharacterCreation = Boolean(
      data.presets?.stats && 
      data.player?.useStats && 
      data.player.useStats.length > 0
    );

    const initialState: GameState = {
      currentPageId: firstPageId,
      inventory: initialInventory,
      stats: initialStats,
      history: [firstPageId],
      variables: initialVariables,
      playerName: '',
      visitedPages: new Set([firstPageId]),
      isCharacterSetupComplete: !needsCharacterCreation, // Only skip if no character creation needed
      bookmarks,
      shopInventories,
    };

    setGameState(initialState);
    setIsPlaying(true);
  }, []);

  const completeCharacterSetup = useCallback((
    playerName: string, 
    stats: Record<string, number>,
    inventory: string[] = [],
    variables: Record<string, any> = {}
  ) => {
    setGameState(prev => {
      // Merge character creation variables with existing ones
      const mergedVariables = { ...prev.variables, ...variables };
      
      return {
        ...prev,
        playerName,
        stats,
        inventory: [...prev.inventory, ...inventory],
        variables: mergedVariables,
        isCharacterSetupComplete: true,
      };
    });
  }, []);

  // Update stats directly (for editable stats UI)
  const updateStats = useCallback((newStats: Record<string, number>) => {
    setGameState(prev => ({
      ...prev,
      stats: newStats,
    }));
  }, []);

  // Update a single stat
  const updateStat = useCallback((statName: string, value: number) => {
    setGameState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        [statName]: value,
      },
    }));
  }, []);

  const getCurrentPage = useCallback((): Page | null => {
    return normalizedPages.find(p => p.id === gameState.currentPageId) || null;
  }, [normalizedPages, gameState.currentPageId]);

  const getPageById = useCallback((id: number | string): Page | null => {
    return normalizedPages.find(p => p.id === id) || null;
  }, [normalizedPages]);

  // Get page by bookmark name
  const getPageByBookmark = useCallback((bookmark: string): Page | null => {
    const pageId = gameState.bookmarks[bookmark];
    if (pageId === undefined) return null;
    return getPageById(pageId);
  }, [gameState.bookmarks, getPageById]);

  // Check conditions (new format)
  const checkRequires = useCallback((requires: ChoiceRequires): boolean => {
    // Check items
    if (requires.items) {
      for (const itemId of requires.items) {
        if (!gameState.inventory.includes(itemId)) return false;
      }
    }

    // Check variables
    if (requires.variables) {
      for (const [varName, expectedValue] of Object.entries(requires.variables)) {
        const currentValue = gameState.variables[varName];
        if (currentValue !== expectedValue) return false;
      }
    }

    // Check stats
    if (requires.stats) {
      for (const [statName, condition] of Object.entries(requires.stats)) {
        const currentValue = gameState.stats[statName] ?? 0;
        if (condition.gte !== undefined && currentValue < condition.gte) return false;
        if (condition.lte !== undefined && currentValue > condition.lte) return false;
      }
    }

    return true;
  }, [gameState.stats, gameState.inventory, gameState.variables]);

  // Check if a choice's conditions are met (legacy format)
  const checkConditions = useCallback((conditions: ChoiceConditions): boolean => {
    // Check stat conditions
    if (conditions.stats) {
      for (const [statName, condition] of Object.entries(conditions.stats)) {
        const currentValue = gameState.stats[statName] ?? 0;
        if (condition.gte !== undefined && currentValue < condition.gte) return false;
        if (condition.lte !== undefined && currentValue > condition.lte) return false;
      }
    }

    // Check item conditions
    if (conditions.items) {
      for (const itemId of conditions.items) {
        if (!gameState.inventory.includes(itemId)) return false;
      }
    }

    // Check variable conditions
    if (conditions.variables) {
      for (const [varName, expectedValue] of Object.entries(conditions.variables)) {
        const currentValue = gameState.variables[varName];
        if (currentValue !== expectedValue) return false;
      }
    }

    return true;
  }, [gameState.stats, gameState.inventory, gameState.variables]);

  const canChoose = useCallback((choice: Choice): boolean => {
    // Legacy condition support
    if (choice.requiresItem && !gameState.inventory.includes(choice.requiresItem)) {
      return false;
    }
    if (choice.requiresStat) {
      const currentValue = gameState.stats[choice.requiresStat.name] ?? 0;
      if (currentValue < choice.requiresStat.min) {
        return false;
      }
    }

    // New conditions system
    if (choice.conditions) {
      if (!checkConditions(choice.conditions)) return false;
    }

    // New requires system
    if (choice.requires) {
      if (!checkRequires(choice.requires)) return false;
    }

    return true;
  }, [gameState.inventory, gameState.stats, checkConditions, checkRequires]);

  // Get item name helper
  const getItemName = useCallback((itemId: string): string => {
    // Check array-based items first
    if (gamebookData?.items) {
      if (Array.isArray(gamebookData.items)) {
        const item = gamebookData.items.find(i => i.id === itemId);
        if (item) return item.name;
      } else {
        // Object format
        const item = (gamebookData.items as Record<string, { name: string }>)[itemId];
        if (item) return item.name;
      }
    }
    // No preset items in new structure - items are in root items array
    return itemId;
  }, [gamebookData]);

  // Get requirement hints for a locked choice
  const getChoiceRequirements = useCallback((choice: Choice): string[] => {
    const hints: string[] = [];

    // Legacy requirements
    if (choice.requiresItem && !gameState.inventory.includes(choice.requiresItem)) {
      hints.push(`Requires: ${getItemName(choice.requiresItem)}`);
    }
    if (choice.requiresStat) {
      const currentValue = gameState.stats[choice.requiresStat.name] ?? 0;
      if (currentValue < choice.requiresStat.min) {
        hints.push(`Requires: ${choice.requiresStat.name} ≥ ${choice.requiresStat.min}`);
      }
    }

    // New conditions
    if (choice.conditions) {
      if (choice.conditions.stats) {
        for (const [statName, condition] of Object.entries(choice.conditions.stats)) {
          const currentValue = gameState.stats[statName] ?? 0;
          if (condition.gte !== undefined && currentValue < condition.gte) {
            hints.push(`Requires: ${statName} ≥ ${condition.gte}`);
          }
          if (condition.lte !== undefined && currentValue > condition.lte) {
            hints.push(`Requires: ${statName} ≤ ${condition.lte}`);
          }
        }
      }
      if (choice.conditions.items) {
        for (const itemId of choice.conditions.items) {
          if (!gameState.inventory.includes(itemId)) {
            hints.push(`Requires: ${getItemName(itemId)}`);
          }
        }
      }
      if (choice.conditions.variables) {
        for (const [varName, expectedValue] of Object.entries(choice.conditions.variables)) {
          const currentValue = gameState.variables[varName];
          if (currentValue !== expectedValue) {
            hints.push(`Condition not met`);
          }
        }
      }
    }

    // New requires format
    if (choice.requires) {
      if (choice.requires.items) {
        for (const itemId of choice.requires.items) {
          if (!gameState.inventory.includes(itemId)) {
            hints.push(`Requires: ${getItemName(itemId)}`);
          }
        }
      }
      if (choice.requires.stats) {
        for (const [statName, condition] of Object.entries(choice.requires.stats)) {
          const currentValue = gameState.stats[statName] ?? 0;
          if (condition.gte !== undefined && currentValue < condition.gte) {
            hints.push(`Requires: ${statName} ≥ ${condition.gte}`);
          }
          if (condition.lte !== undefined && currentValue > condition.lte) {
            hints.push(`Requires: ${statName} ≤ ${condition.lte}`);
          }
        }
      }
      if (choice.requires.variables) {
        for (const [, expectedValue] of Object.entries(choice.requires.variables)) {
          const currentValue = gameState.variables[Object.keys(choice.requires.variables)[0]];
          if (currentValue !== expectedValue) {
            hints.push(`Condition not met`);
          }
        }
      }
    }

    return hints;
  }, [gameState, getItemName]);

  // Apply effects to game state - NO CLAMPING, raw numeric deltas
  const applyEffects = useCallback((effects: PageEffects, prevState: GameState): Partial<GameState> => {
    const updates: Partial<GameState> = {};
    
    // Apply stat changes - raw deltas, no clamping
    if (effects.stats) {
      const newStats = { ...prevState.stats };
      for (const [statName, delta] of Object.entries(effects.stats)) {
        // If stat doesn't exist, initialize to 0 then apply delta
        const currentValue = newStats[statName] ?? 0;
        newStats[statName] = currentValue + delta;
        // NO clamping - engine does not enforce limits
      }
      updates.stats = newStats;
    }

    // Apply variable changes
    if (effects.variables) {
      const newVariables = { ...prevState.variables };
      for (const [varName, value] of Object.entries(effects.variables)) {
        newVariables[varName] = value;
      }
      updates.variables = newVariables;
    }

    // Add items
    if (effects.itemsAdd) {
      const newInventory = [...(updates.inventory || prevState.inventory)];
      for (const itemId of effects.itemsAdd) {
        if (!newInventory.includes(itemId)) {
          newInventory.push(itemId);
        }
      }
      updates.inventory = newInventory;
    }

    // Remove items
    if (effects.itemsRemove) {
      const currentInventory = updates.inventory || prevState.inventory;
      updates.inventory = currentInventory.filter(id => !effects.itemsRemove!.includes(id));
    }

    return updates;
  }, []);

  const makeChoice = useCallback((choice: Choice, inputCorrect?: boolean) => {
    // Determine target page (handle different formats and bookmark navigation)
    let targetPageId: number | string | undefined = getTargetPageId(choice);
    
    // Handle bookmark navigation
    if (choice.toBookmark) {
      targetPageId = gameState.bookmarks[choice.toBookmark];
    }
    
    // Handle input puzzles with failure
    if (choice.input !== undefined && inputCorrect === false && choice.failurePageId !== undefined) {
      targetPageId = choice.failurePageId;
    }

    if (targetPageId === undefined) return;

    const targetPage = getPageById(targetPageId);
    if (!targetPage) return;

    setGameState(prev => {
      let newInventory = [...prev.inventory];
      let newStats = { ...prev.stats };
      let newVariables = { ...prev.variables };
      const newVisitedPages = new Set(prev.visitedPages);
      const isFirstVisit = !newVisitedPages.has(targetPageId!);
      newVisitedPages.add(targetPageId!);

      // Apply choice effects (always apply on success)
      if (choice.effects && (inputCorrect === undefined || inputCorrect === true)) {
        const choiceUpdates = applyEffects(choice.effects, { ...prev, inventory: newInventory, stats: newStats, variables: newVariables } as GameState);
        if (choiceUpdates.inventory) newInventory = choiceUpdates.inventory;
        if (choiceUpdates.stats) newStats = choiceUpdates.stats;
        if (choiceUpdates.variables) newVariables = choiceUpdates.variables as Record<string, boolean | number | string>;
      }

      // Apply page effects (only on first visit via normal navigation)
      if (isFirstVisit && targetPage.effects) {
        const pageUpdates = applyEffects(targetPage.effects, { ...prev, inventory: newInventory, stats: newStats, variables: newVariables } as GameState);
        if (pageUpdates.inventory) newInventory = pageUpdates.inventory;
        if (pageUpdates.stats) newStats = pageUpdates.stats;
        if (pageUpdates.variables) newVariables = pageUpdates.variables as Record<string, boolean | number | string>;
      }

      // Legacy page effects (only on first visit)
      if (isFirstVisit) {
        if (targetPage.addItems) {
          targetPage.addItems.forEach(item => {
            if (!newInventory.includes(item)) {
              newInventory.push(item);
            }
          });
        }
        if (targetPage.removeItems) {
          newInventory = newInventory.filter(item => !targetPage.removeItems!.includes(item));
        }
        if (targetPage.statChanges) {
          targetPage.statChanges.forEach(change => {
            newStats[change.name] = (newStats[change.name] ?? 0) + change.value;
          });
        }
      }

      return {
        ...prev,
        currentPageId: targetPageId!,
        inventory: newInventory,
        stats: newStats,
        variables: newVariables,
        history: [...prev.history, targetPageId!],
        visitedPages: newVisitedPages,
      };
    });
  }, [getPageById, applyEffects, gameState.bookmarks]);

  const jumpToPage = useCallback((pageId: number | string) => {
    const historyIndex = gameState.history.findIndex(id => id === pageId);
    if (historyIndex === -1) return;

    // Jump does NOT re-trigger effects, just changes position
    setGameState(prev => ({
      ...prev,
      currentPageId: pageId,
      history: prev.history.slice(0, historyIndex + 1),
    }));
  }, [gameState.history]);

  const restart = useCallback(() => {
    if (!gamebookData) return;
    
    const pages = normalizedPages;
    const firstPageId = pages[0]?.id ?? 0;

    // Reinitialize from presets/player config
    const initialVariables: Record<string, boolean | number | string> = {};
    if (gamebookData.presets?.variables) {
      for (const [key, value] of Object.entries(gamebookData.presets.variables)) {
        initialVariables[key] = value;
      }
    }
    // New structure: startingVariables in PlayerConfig
    if (gamebookData.player?.startingVariables) {
      for (const [key, value] of Object.entries(gamebookData.player.startingVariables)) {
        initialVariables[key] = value as boolean | number | string;
      }
    }

    // Initialize stats from presets (for character creation)
    const initialStats: Record<string, number> = {};
    if (gamebookData.presets?.stats && gamebookData.player?.useStats) {
      for (const statId of gamebookData.player.useStats) {
        const preset = gamebookData.presets.stats[statId];
        if (preset) {
          initialStats[statId] = preset.default;
        }
      }
    }

    let initialInventory: string[] = [];
    if (gamebookData.player?.startingItems) {
      initialInventory = [...gamebookData.player.startingItems];
    }

    // Rebuild bookmark registry
    const bookmarks: Record<string, number | string> = {};
    for (const page of pages) {
      if (page.bookmark) {
        bookmarks[page.bookmark] = page.id;
      }
    }

    // Reinitialize shop inventories
    const shopInventories: Record<string, Record<string, number>> = {};
    for (const page of pages) {
      if (page.shop) {
        const pageId = String(page.id);
        shopInventories[pageId] = {};
        for (const shopItem of page.shop.items) {
          if (shopItem.quantity !== undefined) {
            shopInventories[pageId][shopItem.itemId] = shopItem.quantity;
          }
        }
      }
    }

    setGameState({
      currentPageId: firstPageId,
      inventory: initialInventory,
      stats: initialStats,
      history: [firstPageId],
      variables: initialVariables,
      playerName: '',
      visitedPages: new Set([firstPageId]),
      isCharacterSetupComplete: true,
      bookmarks,
      shopInventories,
    });
  }, [gamebookData, normalizedPages]);

  const getSaveSlots = useCallback((): SaveSlot[] => {
    const saved = localStorage.getItem(SAVE_SLOTS_KEY);
    if (!saved) return [];
    try {
      const allSaves = JSON.parse(saved);
      
      // Filter saves for current story only
      if (gamebookData) {
        const currentStoryId = gamebookData.meta?.storyId || 
                               `legacy-${gamebookData.meta?.title || gamebookData.title || 'untitled'}`;
        return allSaves.filter((save: SaveSlot) => {
          // Handle legacy saves without storyId
          if (!save.storyId) {
            return save.storyTitle === (gamebookData.meta?.title || gamebookData.title);
          }
          return save.storyId === currentStoryId;
        });
      }
      
      return allSaves;
    } catch {
      return [];
    }
  }, [gamebookData]);

  const saveGame = useCallback((slotId: number, name: string) => {
    if (!gamebookData) return;
    
    const currentPage = getCurrentPage();
    // Don't allow saving on hard endings
    if (currentPage?.ending?.type === 'hard') return;

    // Generate storyId if not present (fallback for old stories)
    const storyId = gamebookData.meta?.storyId || 
                    `legacy-${gamebookData.meta?.title || gamebookData.title || 'untitled'}`;

    const preview = currentPage?.text.substring(0, 100) + '...' || '';

    const newSave: SaveSlot = {
      id: slotId,
      name,
      storyId,
      storyTitle: gamebookData.meta?.title || gamebookData.title || 'Untitled Story',
      currentPageId: gameState.currentPageId,
      pagePreview: preview,
      savedAt: new Date().toISOString(),
      inventory: gameState.inventory,
      stats: gameState.stats,
      history: gameState.history,
      variables: gameState.variables,
      playerName: gameState.playerName,
      visitedPages: Array.from(gameState.visitedPages),
      shopInventories: gameState.shopInventories,
    };

    const slots = getSaveSlots().filter(s => s.id !== slotId);
    slots.push(newSave);
    localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
  }, [gamebookData, gameState, getCurrentPage, getSaveSlots]);

  const loadGame = useCallback((slot: SaveSlot) => {
    if (!gamebookData) return;
    
    // Verify the save belongs to current story
    const currentStoryId = gamebookData.meta?.storyId || 
                           `legacy-${gamebookData.meta?.title || gamebookData.title || 'untitled'}`;
    
    // Handle legacy saves without storyId
    const saveStoryId = slot.storyId || `legacy-${slot.storyTitle}`;
    
    if (saveStoryId !== currentStoryId) {
      console.error('Cannot load save from different story');
      return;
    }
    
    // Load does NOT re-trigger effects
    // Rebuild bookmarks from current pages
    const bookmarks: Record<string, number | string> = {};
    for (const page of normalizedPages) {
      if (page.bookmark) {
        bookmarks[page.bookmark] = page.id;
      }
    }

    setGameState({
      currentPageId: slot.currentPageId,
      inventory: slot.inventory,
      stats: slot.stats,
      history: slot.history,
      variables: slot.variables || {},
      playerName: slot.playerName || '',
      visitedPages: new Set(slot.visitedPages || slot.history),
      isCharacterSetupComplete: true,
      bookmarks,
      shopInventories: slot.shopInventories || {},
    });
  }, [normalizedPages, gamebookData]);

  const deleteSave = useCallback((slotId: number) => {
    // Get ALL saves from localStorage (not just current story)
    const saved = localStorage.getItem(SAVE_SLOTS_KEY);
    if (!saved) return;
    
    try {
      const allSlots = JSON.parse(saved);
      const remainingSlots = allSlots.filter((s: SaveSlot) => s.id !== slotId);
      localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(remainingSlots));
    } catch {
      // If parse fails, do nothing
    }
  }, []);

  const exitStory = useCallback(() => {
    setIsPlaying(false);
    setGamebookData(null);
    setNormalizedPages([]);
    setGameState(createInitialState());
  }, []);

  // Check if current page is an ending
  const isEnding = useCallback((): { isEnd: boolean; type?: 'hard' | 'soft' } => {
    const page = getCurrentPage();
    if (!page) return { isEnd: false };
    
    if (page.ending) {
      return { isEnd: true, type: page.ending.type };
    }
    
    // No choices also means ending
    if (page.choices.length === 0) {
      return { isEnd: true, type: 'soft' };
    }
    
    return { isEnd: false };
  }, [getCurrentPage]);

  // Check if saving is allowed
  const canSave = useCallback((): boolean => {
    const ending = isEnding();
    return !ending.isEnd || ending.type !== 'hard';
  }, [isEnding]);

  // Consume a consumable item from inventory
  const consumeItem = useCallback((itemId: string) => {
    const item = gamebookData?.items?.find((i: any) => i.id === itemId);
    if (!item || item.type !== 'consumable') return;
    if (!gameState.inventory.includes(itemId)) return;

    setGameState(prev => {
      // Remove item from inventory
      const newInventory = prev.inventory.filter(id => id !== itemId);
      
      // Apply item effects if any
      let updates: Partial<GameState> = { inventory: newInventory };
      if (item.effects) {
        const effectUpdates = applyEffects(item.effects, prev);
        updates = { ...updates, ...effectUpdates };
      }

      return {
        ...prev,
        ...updates,
      };
    });
  }, [gamebookData, gameState.inventory, applyEffects]);

  // Purchase item from shop
  const purchaseItem = useCallback((pageId: number | string, itemId: string, price: number, currencyVar: string) => {
    const currentCurrency = (gameState.variables[currencyVar] as number) || 0;
    if (currentCurrency < price) return false; // Can't afford
    if (gameState.inventory.includes(itemId)) return false; // Already have it

    const pageIdStr = String(pageId);
    const shopStock = gameState.shopInventories[pageIdStr]?.[itemId];
    if (shopStock !== undefined && shopStock <= 0) return false; // Out of stock

    setGameState(prev => {
      const newVariables = { ...prev.variables };
      newVariables[currencyVar] = currentCurrency - price;

      const newInventory = [...prev.inventory, itemId];

      const newShopInventories = { ...prev.shopInventories };
      if (shopStock !== undefined) {
        if (!newShopInventories[pageIdStr]) {
          newShopInventories[pageIdStr] = {};
        }
        newShopInventories[pageIdStr][itemId] = shopStock - 1;
      }

      return {
        ...prev,
        variables: newVariables,
        inventory: newInventory,
        shopInventories: newShopInventories,
      };
    });

    return true;
  }, [gameState]);

  // Get item details
  const getItemDetails = useCallback((itemId: string) => {
    if (gamebookData?.items) {
      if (Array.isArray(gamebookData.items)) {
        return gamebookData.items.find(i => i.id === itemId);
      }
    }
    return undefined;
  }, [gamebookData]);

  // Get enemy details
  const getEnemyDetails = useCallback((enemyId: string) => {
    if (gamebookData?.enemies) {
      if (Array.isArray(gamebookData.enemies)) {
        return gamebookData.enemies.find(e => e.id === enemyId);
      }
    }
    return undefined;
  }, [gamebookData]);

  return {
    gamebookData,
    gameState,
    isPlaying,
    loadStory,
    completeCharacterSetup,
    updateStats,
    updateStat,
    getCurrentPage,
    getPageById,
    getPageByBookmark,
    canChoose,
    getChoiceRequirements,
    makeChoice,
    jumpToPage,
    restart,
    getSaveSlots,
    saveGame,
    loadGame,
    deleteSave,
    exitStory,
    maxSaveSlots: MAX_SAVE_SLOTS,
    isEnding,
    canSave,
    consumeItem,
    purchaseItem,
    getItemDetails,
    getEnemyDetails,
  };
}
