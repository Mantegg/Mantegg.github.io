import { useState, useCallback } from 'react';
import { GamebookData, GameState, Page, Choice, SaveSlot } from '@/types/gamebook';

const SAVE_SLOTS_KEY = 'gamebook_save_slots';
const MAX_SAVE_SLOTS = 5;

export function useGamebook() {
  const [gamebookData, setGamebookData] = useState<GamebookData | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    currentPageId: 1,
    inventory: [],
    stats: {},
    history: [1],
  });
  const [isPlaying, setIsPlaying] = useState(false);

  const loadStory = useCallback((data: GamebookData) => {
    setGamebookData(data);
    const firstPage = data.pages[0];
    const initialState: GameState = {
      currentPageId: firstPage?.id || 1,
      inventory: [],
      stats: {},
      history: [firstPage?.id || 1],
    };
    setGameState(initialState);
    setIsPlaying(true);
  }, []);

  const getCurrentPage = useCallback((): Page | null => {
    if (!gamebookData) return null;
    return gamebookData.pages.find(p => p.id === gameState.currentPageId) || null;
  }, [gamebookData, gameState.currentPageId]);

  const getPageById = useCallback((id: number): Page | null => {
    if (!gamebookData) return null;
    return gamebookData.pages.find(p => p.id === id) || null;
  }, [gamebookData]);

  const canChoose = useCallback((choice: Choice): boolean => {
    if (choice.requiresItem && !gameState.inventory.includes(choice.requiresItem)) {
      return false;
    }
    if (choice.requiresStat) {
      const currentValue = gameState.stats[choice.requiresStat.name] || 0;
      if (currentValue < choice.requiresStat.min) {
        return false;
      }
    }
    return true;
  }, [gameState.inventory, gameState.stats]);

  const makeChoice = useCallback((choice: Choice) => {
    const targetPage = getPageById(choice.nextPageId);
    if (!targetPage) return;

    setGameState(prev => {
      let newInventory = [...prev.inventory];
      let newStats = { ...prev.stats };

      // Apply page effects
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

      return {
        ...prev,
        currentPageId: choice.nextPageId,
        inventory: newInventory,
        stats: newStats,
        history: [...prev.history, choice.nextPageId],
      };
    });
  }, [getPageById]);

  const jumpToPage = useCallback((pageId: number) => {
    const historyIndex = gameState.history.indexOf(pageId);
    if (historyIndex === -1) return;

    setGameState(prev => ({
      ...prev,
      currentPageId: pageId,
      history: prev.history.slice(0, historyIndex + 1),
    }));
  }, [gameState.history]);

  const restart = useCallback(() => {
    if (!gamebookData) return;
    const firstPage = gamebookData.pages[0];
    setGameState({
      currentPageId: firstPage?.id || 1,
      inventory: [],
      stats: {},
      history: [firstPage?.id || 1],
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
    const preview = currentPage?.text.substring(0, 100) + '...' || '';

    const newSave: SaveSlot = {
      id: slotId,
      name,
      storyTitle: gamebookData.title || 'Untitled Story',
      currentPageId: gameState.currentPageId,
      pagePreview: preview,
      savedAt: new Date().toISOString(),
      inventory: gameState.inventory,
      stats: gameState.stats,
      history: gameState.history,
    };

    const slots = getSaveSlots().filter(s => s.id !== slotId);
    slots.push(newSave);
    localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
  }, [gamebookData, gameState, getCurrentPage, getSaveSlots]);

  const loadGame = useCallback((slot: SaveSlot) => {
    setGameState({
      currentPageId: slot.currentPageId,
      inventory: slot.inventory,
      stats: slot.stats,
      history: slot.history,
    });
  }, []);

  const deleteSave = useCallback((slotId: number) => {
    const slots = getSaveSlots().filter(s => s.id !== slotId);
    localStorage.setItem(SAVE_SLOTS_KEY, JSON.stringify(slots));
  }, [getSaveSlots]);

  const exitStory = useCallback(() => {
    setIsPlaying(false);
    setGamebookData(null);
    setGameState({
      currentPageId: 1,
      inventory: [],
      stats: {},
      history: [1],
    });
  }, []);

  return {
    gamebookData,
    gameState,
    isPlaying,
    loadStory,
    getCurrentPage,
    getPageById,
    canChoose,
    makeChoice,
    jumpToPage,
    restart,
    getSaveSlots,
    saveGame,
    loadGame,
    deleteSave,
    exitStory,
    maxSaveSlots: MAX_SAVE_SLOTS,
  };
}
