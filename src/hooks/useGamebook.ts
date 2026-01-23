import { useState, useCallback } from 'react';
import { GamebookData, GameState, Page, Choice, SaveSlot, PageEffects, ChoiceConditions } from '@/types/gamebook';

const SAVE_SLOTS_KEY = 'gamebook_save_slots';
const MAX_SAVE_SLOTS = 5;

const createInitialState = (): GameState => ({
  currentPageId: 0,
  inventory: [],
  stats: {},
  history: [],
  variables: {},
  playerName: '',
  visitedPages: new Set<number>(),
  isCharacterSetupComplete: false,
});

export function useGamebook() {
  const [gamebookData, setGamebookData] = useState<GamebookData | null>(null);
  const [gameState, setGameState] = useState<GameState>(createInitialState());
  const [isPlaying, setIsPlaying] = useState(false);

  const loadStory = useCallback((data: GamebookData) => {
    setGamebookData(data);
    
    // Check if character setup is needed
    const needsSetup = data.presets?.stats && Object.keys(data.presets.stats).length > 0;
    const firstPageId = data.pages[0]?.id || 0;

    // Initialize variables from presets
    const initialVariables: Record<string, boolean | number> = {};
    if (data.presets?.variables) {
      for (const [key, value] of Object.entries(data.presets.variables)) {
        initialVariables[key] = value;
      }
    }

    // Initialize stats from presets
    const initialStats: Record<string, number> = {};
    if (data.presets?.stats) {
      for (const [key, preset] of Object.entries(data.presets.stats)) {
        initialStats[key] = preset.default;
      }
    }

    // Initialize starting items
    const initialInventory: string[] = data.player?.startingItems ? [...data.player.startingItems] : [];

    const initialState: GameState = {
      currentPageId: firstPageId,
      inventory: initialInventory,
      stats: initialStats,
      history: [firstPageId],
      variables: initialVariables,
      playerName: '',
      visitedPages: new Set([firstPageId]),
      isCharacterSetupComplete: !needsSetup,
    };

    setGameState(initialState);
    setIsPlaying(true);
  }, []);

  const completeCharacterSetup = useCallback((playerName: string, stats: Record<string, number>) => {
    setGameState(prev => ({
      ...prev,
      playerName,
      stats,
      isCharacterSetupComplete: true,
    }));
  }, []);

  const getCurrentPage = useCallback((): Page | null => {
    if (!gamebookData) return null;
    return gamebookData.pages.find(p => p.id === gameState.currentPageId) || null;
  }, [gamebookData, gameState.currentPageId]);

  const getPageById = useCallback((id: number): Page | null => {
    if (!gamebookData) return null;
    return gamebookData.pages.find(p => p.id === id) || null;
  }, [gamebookData]);

  // Check if a choice's conditions are met
  const checkConditions = useCallback((conditions: ChoiceConditions): boolean => {
    // Check stat conditions
    if (conditions.stats) {
      for (const [statName, condition] of Object.entries(conditions.stats)) {
        const currentValue = gameState.stats[statName] || 0;
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
      const currentValue = gameState.stats[choice.requiresStat.name] || 0;
      if (currentValue < choice.requiresStat.min) {
        return false;
      }
    }

    // New conditions system
    if (choice.conditions) {
      return checkConditions(choice.conditions);
    }

    return true;
  }, [gameState.inventory, gameState.stats, checkConditions]);

  // Get requirement hints for a locked choice
  const getChoiceRequirements = useCallback((choice: Choice): string[] => {
    const hints: string[] = [];

    // Legacy requirements
    if (choice.requiresItem && !gameState.inventory.includes(choice.requiresItem)) {
      const itemName = gamebookData?.presets?.items?.[choice.requiresItem]?.name || choice.requiresItem;
      hints.push(`Requires: ${itemName}`);
    }
    if (choice.requiresStat) {
      const currentValue = gameState.stats[choice.requiresStat.name] || 0;
      if (currentValue < choice.requiresStat.min) {
        hints.push(`Requires: ${choice.requiresStat.name} ≥ ${choice.requiresStat.min}`);
      }
    }

    // New conditions
    if (choice.conditions) {
      if (choice.conditions.stats) {
        for (const [statName, condition] of Object.entries(choice.conditions.stats)) {
          const currentValue = gameState.stats[statName] || 0;
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
            const itemName = gamebookData?.presets?.items?.[itemId]?.name || itemId;
            hints.push(`Requires: ${itemName}`);
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

    return hints;
  }, [gameState, gamebookData]);

  // Apply effects to game state
  const applyEffects = useCallback((effects: PageEffects, prevState: GameState): Partial<GameState> => {
    const updates: Partial<GameState> = {};
    
    // Apply stat changes
    if (effects.stats) {
      const newStats = { ...prevState.stats };
      for (const [statName, delta] of Object.entries(effects.stats)) {
        newStats[statName] = (newStats[statName] || 0) + delta;
        // Clamp to preset bounds if available
        const preset = gamebookData?.presets?.stats?.[statName];
        if (preset) {
          newStats[statName] = Math.max(preset.min, Math.min(preset.max, newStats[statName]));
        }
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
  }, [gamebookData]);

  const makeChoice = useCallback((choice: Choice, inputCorrect?: boolean) => {
    // Determine target page (handle input puzzles)
    let targetPageId = choice.nextPageId;
    if (choice.input !== undefined && inputCorrect === false && choice.failurePageId !== undefined) {
      targetPageId = choice.failurePageId;
    }

    const targetPage = getPageById(targetPageId);
    if (!targetPage) return;

    setGameState(prev => {
      let newInventory = [...prev.inventory];
      let newStats = { ...prev.stats };
      let newVariables = { ...prev.variables };
      const newVisitedPages = new Set(prev.visitedPages);
      const isFirstVisit = !newVisitedPages.has(targetPageId);
      newVisitedPages.add(targetPageId);

      // Apply choice effects (always apply)
      if (choice.effects && (inputCorrect === undefined || inputCorrect === true)) {
        const choiceUpdates = applyEffects(choice.effects, { ...prev, inventory: newInventory, stats: newStats, variables: newVariables });
        if (choiceUpdates.inventory) newInventory = choiceUpdates.inventory;
        if (choiceUpdates.stats) newStats = choiceUpdates.stats;
        if (choiceUpdates.variables) newVariables = choiceUpdates.variables;
      }

      // Apply page effects (only on first visit via normal navigation)
      if (isFirstVisit && targetPage.effects) {
        const pageUpdates = applyEffects(targetPage.effects, { ...prev, inventory: newInventory, stats: newStats, variables: newVariables });
        if (pageUpdates.inventory) newInventory = pageUpdates.inventory;
        if (pageUpdates.stats) newStats = pageUpdates.stats;
        if (pageUpdates.variables) newVariables = pageUpdates.variables;
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
            newStats[change.name] = (newStats[change.name] || 0) + change.value;
          });
        }
      }

      return {
        ...prev,
        currentPageId: targetPageId,
        inventory: newInventory,
        stats: newStats,
        variables: newVariables,
        history: [...prev.history, targetPageId],
        visitedPages: newVisitedPages,
      };
    });
  }, [getPageById, applyEffects]);

  const jumpToPage = useCallback((pageId: number) => {
    const historyIndex = gameState.history.indexOf(pageId);
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
    const firstPageId = gamebookData.pages[0]?.id || 0;

    // Reinitialize from presets
    const initialVariables: Record<string, boolean | number> = {};
    if (gamebookData.presets?.variables) {
      for (const [key, value] of Object.entries(gamebookData.presets.variables)) {
        initialVariables[key] = value;
      }
    }

    const initialStats: Record<string, number> = {};
    if (gamebookData.presets?.stats) {
      for (const [key, preset] of Object.entries(gamebookData.presets.stats)) {
        initialStats[key] = preset.default;
      }
    }

    const initialInventory: string[] = gamebookData.player?.startingItems ? [...gamebookData.player.startingItems] : [];

    const needsSetup = gamebookData.presets?.stats && Object.keys(gamebookData.presets.stats).length > 0;

    setGameState({
      currentPageId: firstPageId,
      inventory: initialInventory,
      stats: initialStats,
      history: [firstPageId],
      variables: initialVariables,
      playerName: '',
      visitedPages: new Set([firstPageId]),
      isCharacterSetupComplete: !needsSetup,
    });
  }, [gamebookData]);

  const getSaveSlots = useCallback((): SaveSlot[] => {
    const saved = localStorage.getItem(SAVE_SLOTS_KEY);
    if (!saved) return [];
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }, []);

  const saveGame = useCallback((slotId: number, name: string) => {
    if (!gamebookData) return;
    
    const currentPage = getCurrentPage();
    // Don't allow saving on hard endings
    if (currentPage?.ending?.type === 'hard') return;

    const preview = currentPage?.text.substring(0, 100) + '...' || '';

    const newSave: SaveSlot = {
      id: slotId,
      name,
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
    };

    const slots = getSaveSlots().filter(s => s.id !== slotId);
    slots.push(newSave);
    localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
  }, [gamebookData, gameState, getCurrentPage, getSaveSlots]);

  const loadGame = useCallback((slot: SaveSlot) => {
    // Load does NOT re-trigger effects
    setGameState({
      currentPageId: slot.currentPageId,
      inventory: slot.inventory,
      stats: slot.stats,
      history: slot.history,
      variables: slot.variables || {},
      playerName: slot.playerName || '',
      visitedPages: new Set(slot.visitedPages || slot.history),
      isCharacterSetupComplete: true,
    });
  }, []);

  const deleteSave = useCallback((slotId: number) => {
    const slots = getSaveSlots().filter(s => s.id !== slotId);
    localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
  }, [getSaveSlots]);

  const exitStory = useCallback(() => {
    setIsPlaying(false);
    setGamebookData(null);
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

  return {
    gamebookData,
    gameState,
    isPlaying,
    loadStory,
    completeCharacterSetup,
    getCurrentPage,
    getPageById,
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
  };
}
