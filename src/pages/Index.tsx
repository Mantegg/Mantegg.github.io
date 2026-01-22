import { useGamebook } from '@/hooks/useGamebook';
import { WelcomeScreen } from '@/components/gamebook/WelcomeScreen';
import { StoryReader } from '@/components/gamebook/StoryReader';

const Index = () => {
  const {
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
    maxSaveSlots,
  } = useGamebook();

  if (!isPlaying || !gamebookData) {
    return <WelcomeScreen onLoadStory={loadStory} />;
  }

  return (
    <StoryReader
      gamebookData={gamebookData}
      gameState={gameState}
      currentPage={getCurrentPage()}
      canChoose={canChoose}
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
    />
  );
};

export default Index;
