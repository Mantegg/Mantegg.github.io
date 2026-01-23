import { useGamebook } from '@/hooks/useGamebook';
import { WelcomeScreen } from '@/components/gamebook/WelcomeScreen';
import { StoryReader } from '@/components/gamebook/StoryReader';
import { CharacterSetup } from '@/components/gamebook/CharacterSetup';

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
    return <WelcomeScreen onLoadStory={loadStory} />;
  }

  // Show character setup if needed
  if (!gameState.isCharacterSetupComplete) {
    return (
      <CharacterSetup
        gamebookData={gamebookData}
        onComplete={completeCharacterSetup}
      />
    );
  }

  return (
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
  );
};

export default Index;
