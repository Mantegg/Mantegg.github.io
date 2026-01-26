import { useGamebook } from '@/hooks/useGamebook';
import { WelcomeScreen } from '@/components/gamebook/WelcomeScreen';
import { StoryReader } from '@/components/gamebook/StoryReader';
import { CharacterSetup } from '@/components/gamebook/CharacterSetup';
import { ThemeProvider } from '@/contexts/ThemeContext';

const Index = () => {
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
    consumeItem,
    purchaseItem,
    getItemDetails,
    getEnemyDetails,
    completeCharacterSetup,
  } = useGamebook();

  if (!isPlaying || !gamebookData) {
    return (
      <ThemeProvider>
        <WelcomeScreen onLoadStory={loadStory} />
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
        onConsumeItem={consumeItem}
        onPurchaseItem={purchaseItem}
        getItemDetails={getItemDetails}
        getEnemyDetails={getEnemyDetails}
      />
    </ThemeProvider>
  );
};

export default Index;
