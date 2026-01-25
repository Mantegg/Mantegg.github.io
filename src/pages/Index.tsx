import { useGamebook } from '@/hooks/useGamebook';
import { WelcomeScreen } from '@/components/gamebook/WelcomeScreen';
import { StoryReader } from '@/components/gamebook/StoryReader';
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
  } = useGamebook();

  if (!isPlaying || !gamebookData) {
    return (
      <ThemeProvider>
        <WelcomeScreen onLoadStory={loadStory} />
      </ThemeProvider>
    );
  }

  // Character setup is no longer needed - stats are author-defined
  // and always editable by the player

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
      />
    </ThemeProvider>
  );
};

export default Index;
