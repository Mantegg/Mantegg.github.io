import { useState } from 'react';
import { useGamebook } from '@/hooks/useGamebook';
import { WelcomeScreen } from '@/components/gamebook/WelcomeScreen';
import { SaveLoadStartScreen } from '@/components/gamebook/SaveLoadStartScreen';
import { StoryReader } from '@/components/gamebook/StoryReader';
import { CharacterSetup } from '@/components/gamebook/CharacterSetup';
import { ThemeProvider } from '@/contexts/ThemeContext';

const Index = () => {
  const [showSaveLoadScreen, setShowSaveLoadScreen] = useState(true);
  
  const {
    gamebookData,
    gameState,
    isPlaying,
    loadStory,
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
    maxSaveSlots,
    canSave,
    updateStat,
    updateStats,
    updateVariable,
    consumeItem,
    purchaseItem,
    getItemDetails,
    getEnemyDetails,
    completeCharacterSetup,
    exportSaveAsCode,
    loadGameState,
  } = useGamebook();

  if (!isPlaying || !gamebookData) {
    return (
      <ThemeProvider>
        <WelcomeScreen onLoadStory={loadStory} />
      </ThemeProvider>
    );
  }

  // Show save/load selection screen after story is loaded but before starting
  if (!gameState.isCharacterSetupComplete && gameState.history.length === 0 && showSaveLoadScreen) {
    return (
      <ThemeProvider>
        <SaveLoadStartScreen
          gamebookData={gamebookData}
          onStartNew={() => setShowSaveLoadScreen(false)}
          onLoadSave={(state) => {
            loadGameState(state);
            setShowSaveLoadScreen(false);
          }}
        />
      </ThemeProvider>
    );
  }

  // Show character creation screen if not completed
  if (!gameState.isCharacterSetupComplete) {
    return (
      <ThemeProvider>
        <CharacterSetup
          gamebookData={gamebookData}
          onComplete={completeCharacterSetup}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <StoryReader
        gamebookData={gamebookData}
        gameState={gameState}
        currentPage={getCurrentPage()}
        canChoose={canChoose}
        getChoiceRequirements={getChoiceRequirements}
        makeChoice={makeChoice}
        jumpToPage={jumpToPage}
        restart={restart}
        getPageById={getPageById}
        getSaveSlots={getSaveSlots}
        saveGame={saveGame}
        loadGame={loadGame}
        deleteSave={deleteSave}
        exitStory={exitStory}
        maxSaveSlots={maxSaveSlots}
        canSave={canSave}
        onUpdateStat={updateStat}
        onUpdateStats={updateStats}
        onUpdateVariable={updateVariable}
        onConsumeItem={consumeItem}
        onPurchaseItem={purchaseItem}
        getItemDetails={getItemDetails}
        getEnemyDetails={getEnemyDetails}
        onExportSave={(slot) => {
          // Convert SaveSlot back to GameState for export
          const gameStateForExport: any = {
            currentPageId: slot.currentPageId,
            inventory: slot.inventory,
            stats: slot.stats,
            history: slot.history,
            variables: slot.variables || {},
            playerName: slot.playerName,
            visitedPages: new Set(slot.visitedPages || []),
            isCharacterSetupComplete: true,
            bookmarks: {},
          };
          return exportSaveAsCode(gameStateForExport);
        }}
      />
    </ThemeProvider>
  );
};

export default Index;
