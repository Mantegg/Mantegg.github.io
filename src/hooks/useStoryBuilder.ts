import { useState, useEffect, useCallback, useRef } from 'react';
import { GamebookData, Page, Choice, ItemDef, EnemyDef } from '@/types/gamebook';
import { BuilderState, BuilderMode, BuilderSection, ValidationError, PageType } from '@/types/builder';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'gamebook_builder_project';
const AUTO_SAVE_INTERVAL = 10 * 60 * 1000; // 10 minutes

export const useStoryBuilder = () => {
  const [state, setState] = useState<BuilderState>({
    mode: 'editor',
    gamebookData: createBlankTemplate(),
    selectedPageId: null,
    selectedSection: 'meta',
    isDirty: false,
    lastSaved: null,
    errors: [],
  });

  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  // Auto-save every 10 minutes
  useEffect(() => {
    if (state.isDirty) {
      autoSaveTimer.current = setTimeout(() => {
        saveToLocalStorage();
      }, AUTO_SAVE_INTERVAL);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [state.isDirty]);

  const saveToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        gamebookData: state.gamebookData,
        selectedPageId: state.selectedPageId,
        selectedSection: state.selectedSection,
        timestamp: new Date().toISOString(),
      }));
      setState(prev => ({ ...prev, isDirty: false, lastSaved: new Date() }));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }, [state.gamebookData, state.selectedPageId, state.selectedSection]);

  const loadFromLocalStorage = useCallback(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        setState(prev => ({
          ...prev,
          gamebookData: data.gamebookData,
          selectedPageId: data.selectedPageId,
          selectedSection: data.selectedSection,
          lastSaved: new Date(data.timestamp),
          isDirty: false,
        }));
        return true;
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
    return false;
  }, []);

  const hasUnsavedWork = useCallback(() => {
    return localStorage.getItem(STORAGE_KEY) !== null;
  }, []);

  const clearLocalStorage = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const setMode = useCallback((mode: BuilderMode) => {
    setState(prev => ({ ...prev, mode }));
  }, []);

  const setSelectedSection = useCallback((section: BuilderSection) => {
    setState(prev => ({ ...prev, selectedSection: section }));
  }, []);

  const setSelectedPageId = useCallback((pageId: string | null) => {
    setState(prev => ({ ...prev, selectedPageId: pageId }));
  }, []);

  const updateMeta = useCallback((updates: Partial<GamebookData['meta']>) => {
    setState(prev => ({
      ...prev,
      gamebookData: {
        ...prev.gamebookData,
        meta: { ...prev.gamebookData.meta, ...updates },
      },
      isDirty: true,
    }));
  }, []);

  const updateInitialStats = useCallback((stats: Record<string, number>) => {
    setState(prev => ({
      ...prev,
      gamebookData: {
        ...prev.gamebookData,
        initialStats: stats,
      },
      isDirty: true,
    }));
  }, []);

  const updateInitialInventory = useCallback((inventory: string[]) => {
    setState(prev => ({
      ...prev,
      gamebookData: {
        ...prev.gamebookData,
        initialInventory: inventory,
      },
      isDirty: true,
    }));
  }, []);

  const addPage = useCallback((pageId?: number | string) => {
    const pages = state.gamebookData.pages || [];
    const newPageId = pageId || Date.now();
    const newPage: Page = {
      id: newPageId,
      text: '',
      choices: [],
    };

    setState(prev => ({
      ...prev,
      gamebookData: {
        ...prev.gamebookData,
        pages: [...pages, newPage],
      },
      selectedPageId: newPageId,
      isDirty: true,
    }));

    return newPageId;
  }, [state.gamebookData.pages]);

  const updatePage = useCallback((pageId: number | string, updates: Partial<Page>) => {
    setState(prev => {
      const pages = prev.gamebookData.pages || [];
      const pageIndex = pages.findIndex(p => p.id === pageId);
      if (pageIndex === -1) return prev;

      const updatedPages = [...pages];
      updatedPages[pageIndex] = { ...updatedPages[pageIndex], ...updates };

      return {
        ...prev,
        gamebookData: {
          ...prev.gamebookData,
          pages: updatedPages,
        },
        isDirty: true,
      };
    });
  }, []);

  const deletePage = useCallback((pageId: number | string) => {
    setState(prev => {
      const pages = prev.gamebookData.pages || [];
      const filteredPages = pages.filter(p => p.id !== pageId);
      
      return {
        ...prev,
        gamebookData: {
          ...prev.gamebookData,
          pages: filteredPages,
        },
        selectedPageId: prev.selectedPageId === pageId ? null : prev.selectedPageId,
        isDirty: true,
      };
    });
  }, []);

  const duplicatePage = useCallback((sourcePageId: number | string) => {
    const pages = state.gamebookData.pages || [];
    const sourcePage = pages.find(p => p.id === sourcePageId);
    if (!sourcePage) return null;

    const newPageId = Date.now();
    const newPage = { ...JSON.parse(JSON.stringify(sourcePage)), id: newPageId }; // Deep clone with new ID

    setState(prev => ({
      ...prev,
      gamebookData: {
        ...prev.gamebookData,
        pages: [...(prev.gamebookData.pages || []), newPage],
      },
      selectedPageId: newPageId,
      isDirty: true,
    }));

    return newPageId;
  }, [state.gamebookData.pages]);

  const addChoice = useCallback((pageId: number | string, choice: Choice) => {
    setState(prev => {
      const pages = prev.gamebookData.pages || [];
      const pageIndex = pages.findIndex(p => p.id === pageId);
      if (pageIndex === -1) return prev;

      const updatedPages = [...pages];
      updatedPages[pageIndex] = {
        ...updatedPages[pageIndex],
        choices: [...(updatedPages[pageIndex].choices || []), choice],
      };

      return {
        ...prev,
        gamebookData: {
          ...prev.gamebookData,
          pages: updatedPages,
        },
        isDirty: true,
      };
    });
  }, []);

  const updateChoice = useCallback((pageId: number | string, choiceIndex: number, updates: Partial<Choice>) => {
    setState(prev => {
      const pages = prev.gamebookData.pages || [];
      const pageIndex = pages.findIndex(p => p.id === pageId);
      if (pageIndex === -1 || !pages[pageIndex].choices) return prev;

      const updatedPages = [...pages];
      const newChoices = [...(updatedPages[pageIndex].choices || [])];
      newChoices[choiceIndex] = { ...newChoices[choiceIndex], ...updates };
      updatedPages[pageIndex] = {
        ...updatedPages[pageIndex],
        choices: newChoices,
      };

      return {
        ...prev,
        gamebookData: {
          ...prev.gamebookData,
          pages: updatedPages,
        },
        isDirty: true,
      };
    });
  }, []);

  const deleteChoice = useCallback((pageId: number | string, choiceIndex: number) => {
    setState(prev => {
      const pages = prev.gamebookData.pages || [];
      const pageIndex = pages.findIndex(p => p.id === pageId);
      if (pageIndex === -1 || !pages[pageIndex].choices) return prev;

      const updatedPages = [...pages];
      updatedPages[pageIndex] = {
        ...updatedPages[pageIndex],
        choices: (updatedPages[pageIndex].choices || []).filter((_, i) => i !== choiceIndex),
      };

      return {
        ...prev,
        gamebookData: {
          ...prev.gamebookData,
          pages: updatedPages,
        },
        isDirty: true,
      };
    });
  }, []);

  const addItem = useCallback((itemId: string, itemDef: ItemDef) => {
    setState(prev => ({
      ...prev,
      gamebookData: {
        ...prev.gamebookData,
        items: [...(prev.gamebookData.items || []), { ...itemDef, id: itemId }],
      },
      isDirty: true,
    }));
  }, []);

  const updateItem = useCallback((itemId: string, updates: Partial<ItemDef>) => {
    setState(prev => {
      const items = prev.gamebookData.items || [];
      const itemIndex = items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) return prev;

      const updatedItems = [...items];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], ...updates };

      return {
        ...prev,
        gamebookData: {
          ...prev.gamebookData,
          items: updatedItems,
        },
        isDirty: true,
      };
    });
  }, []);

  const deleteItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      gamebookData: {
        ...prev.gamebookData,
        items: (prev.gamebookData.items || []).filter(item => item.id !== itemId),
      },
      isDirty: true,
    }));
  }, []);

  const addEnemy = useCallback((enemyId: string, enemyDef: EnemyDef) => {
    setState(prev => ({
      ...prev,
      gamebookData: {
        ...prev.gamebookData,
        enemies: [...(prev.gamebookData.enemies || []), { ...enemyDef, id: enemyId }],
      },
      isDirty: true,
    }));
  }, []);

  const updateEnemy = useCallback((enemyId: string, updates: Partial<EnemyDef>) => {
    setState(prev => {
      const enemies = prev.gamebookData.enemies || [];
      const enemyIndex = enemies.findIndex(enemy => enemy.id === enemyId);
      if (enemyIndex === -1) return prev;

      const updatedEnemies = [...enemies];
      updatedEnemies[enemyIndex] = { ...updatedEnemies[enemyIndex], ...updates };

      return {
        ...prev,
        gamebookData: {
          ...prev.gamebookData,
          enemies: updatedEnemies,
        },
        isDirty: true,
      };
    });
  }, []);

  const deleteEnemy = useCallback((enemyId: string) => {
    setState(prev => ({
      ...prev,
      gamebookData: {
        ...prev.gamebookData,
        enemies: (prev.gamebookData.enemies || []).filter(enemy => enemy.id !== enemyId),
      },
      isDirty: true,
    }));
  }, []);

  const loadStory = useCallback((data: GamebookData) => {
    const firstPageId = data.pages?.[0]?.id || null;
    setState(prev => ({
      ...prev,
      gamebookData: data,
      selectedPageId: firstPageId,
      isDirty: false,
      errors: [],
    }));
  }, []);

  const validateStory = useCallback((): ValidationError[] => {
    const errors: ValidationError[] = [];
    const { gamebookData } = state;
    const pages = gamebookData.pages || [];
    const items = gamebookData.items || [];
    const enemies = gamebookData.enemies || [];

    // Validate meta
    if (!gamebookData.meta?.title && !gamebookData.title) {
      errors.push({
        id: 'meta-title',
        type: 'error',
        section: 'meta',
        field: 'title',
        message: 'Story title is required',
      });
    }

    if (!gamebookData.meta?.storyId) {
      errors.push({
        id: 'meta-storyid',
        type: 'warning',
        section: 'meta',
        field: 'storyId',
        message: 'Story ID is recommended for save isolation',
      });
    }

    // Validate that at least one page exists
    if (pages.length === 0) {
      errors.push({
        id: 'pages-missing',
        type: 'error',
        section: 'pages',
        message: 'Story must have at least one page',
      });
    }

    // Validate pages
    pages.forEach((page) => {
      const pageId = String(page.id);
      
      if (!page.text || page.text.trim() === '') {
        errors.push({
          id: `page-${pageId}-text`,
          type: 'warning',
          section: 'pages',
          pageId,
          field: 'text',
          message: `Page "${pageId}" has no text`,
        });
      }

      // Validate choices
      page.choices?.forEach((choice, index) => {
        if (!choice.text || choice.text.trim() === '') {
          errors.push({
            id: `page-${pageId}-choice-${index}-text`,
            type: 'error',
            section: 'pages',
            pageId,
            field: `choices[${index}].text`,
            message: `Choice ${index + 1} has no text`,
          });
        }

        const targetPageId = choice.nextPageId || choice.to;
        if (targetPageId && !pages.find(p => p.id === targetPageId)) {
          errors.push({
            id: `page-${pageId}-choice-${index}-nextpage`,
            type: 'error',
            section: 'pages',
            pageId,
            field: `choices[${index}].nextPageId`,
            message: `Choice ${index + 1} links to non-existent page "${targetPageId}"`,
          });
        }

        // Validate combat
        if (choice.combat) {
          if (!choice.combat.enemyId) {
            errors.push({
              id: `page-${pageId}-choice-${index}-combat-enemy`,
              type: 'error',
              section: 'pages',
              pageId,
              field: `choices[${index}].combat.enemyId`,
              message: `Combat choice ${index + 1} has no enemy specified`,
            });
          } else if (!enemies.find(e => e.id === choice.combat!.enemyId)) {
            errors.push({
              id: `page-${pageId}-choice-${index}-combat-enemy-missing`,
              type: 'error',
              section: 'pages',
              pageId,
              field: `choices[${index}].combat.enemyId`,
              message: `Combat enemy "${choice.combat.enemyId}" does not exist`,
            });
          }

          if (!choice.combat.winPageId) {
            errors.push({
              id: `page-${pageId}-choice-${index}-combat-win`,
              type: 'error',
              section: 'pages',
              pageId,
              field: `choices[${index}].combat.winPageId`,
              message: `Combat choice ${index + 1} has no win page`,
            });
          }

          if (!choice.combat.losePageId) {
            errors.push({
              id: `page-${pageId}-choice-${index}-combat-lose`,
              type: 'error',
              section: 'pages',
              pageId,
              field: `choices[${index}].combat.losePageId`,
              message: `Combat choice ${index + 1} has no lose page`,
            });
          }
        }

        // Validate item effects in itemsAdd/itemsRemove
        if (choice.effects?.itemsAdd) {
          choice.effects.itemsAdd.forEach(itemId => {
            if (!items.find(item => item.id === itemId)) {
              errors.push({
                id: `page-${pageId}-choice-${index}-effect-item-add`,
                type: 'error',
                section: 'pages',
                pageId,
                field: `choices[${index}].effects.itemsAdd`,
                message: `Effect references non-existent item "${itemId}"`,
              });
            }
          });
        }
        if (choice.effects?.itemsRemove) {
          choice.effects.itemsRemove.forEach(itemId => {
            if (!items.find(item => item.id === itemId)) {
              errors.push({
                id: `page-${pageId}-choice-${index}-effect-item-remove`,
                type: 'error',
                section: 'pages',
                pageId,
                field: `choices[${index}].effects.itemsRemove`,
                message: `Effect references non-existent item "${itemId}"`,
              });
            }
          });
        }
      });

      // Validate shop
      if (page.shop) {
        page.shop.items?.forEach((shopItem, index) => {
          if (!items.find(item => item.id === shopItem.itemId)) {
            errors.push({
              id: `page-${pageId}-shop-${index}`,
              type: 'error',
              section: 'pages',
              pageId,
              field: `shop.items[${index}]`,
              message: `Shop item "${shopItem.itemId}" does not exist`,
            });
          }
        });
      }
    });

    setState(prev => ({ ...prev, errors }));
    return errors;
  }, [state.gamebookData]);

  const exportAsJSON = useCallback(() => {
    const errors = validateStory();
    const hasErrors = errors.some(e => e.type === 'error');
    
    return {
      data: state.gamebookData,
      errors,
      hasErrors,
    };
  }, [state.gamebookData, validateStory]);

  const setPreviewState = useCallback((previewState: any) => {
    setState(prev => ({ ...prev, previewState }));
  }, []);

  return {
    state,
    setMode,
    setSelectedSection,
    setSelectedPageId,
    updateMeta,
    updateInitialStats,
    updateInitialInventory,
    addPage,
    updatePage,
    deletePage,
    duplicatePage,
    addChoice,
    updateChoice,
    deleteChoice,
    addItem,
    updateItem,
    deleteItem,
    addEnemy,
    updateEnemy,
    deleteEnemy,
    loadStory,
    validateStory,
    exportAsJSON,
    saveToLocalStorage,
    loadFromLocalStorage,
    hasUnsavedWork,
    clearLocalStorage,
    setPreviewState,
  };
};

function createBlankTemplate(): GamebookData {
  return {
    meta: {
      title: 'Untitled Story',
      author: '',
      version: '1.0',
      storyId: uuidv4(),
    },
    player: {
      stats: {
        SKILL: 10,
        STAMINA: 20,
        LUCK: 10,
      },
      inventory: [],
    },
    pages: [
      {
        id: 1,
        text: 'Your adventure begins here...',
        choices: [],
      },
    ],
    items: [],
    enemies: [],
  };
}
