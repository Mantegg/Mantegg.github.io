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
    maxSaveSlots,
    canSave,
  } = useGamebook();

  if (!isPlaying || !gamebookData) {
    return (
      <ThemeProvider>
        <WelcomeScreen onLoadStory={loadStory} />
      </ThemeProvider>
    );
  }

  // Show character setup if needed
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
      />
    </ThemeProvider>
  );
};

export default Index;
