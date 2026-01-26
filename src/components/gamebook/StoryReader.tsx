import { useState } from 'react';
import { Menu, RotateCcw, LogOut, Trophy, Skull } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { GamebookData, GameState, Page, Choice, SaveSlot, ItemDef, EnemyDef } from '@/types/gamebook';
import { HistoryPanel } from './HistoryPanel';
import { InventoryPanel } from './InventoryPanel';
import { SaveLoadPanel } from './SaveLoadPanel';
import { ChoiceButton } from './ChoiceButton';
import { InputDialog } from './InputDialog';
import { DicePopup } from './DicePopup';
import { ThemeControls } from './ThemeControls';
import { CombatPopup } from './CombatPopup';
import { ShopPanel } from './ShopPanel';
import { useTheme, useApplyThemeConfig } from '@/contexts/ThemeContext';
import { formatText } from '@/lib/text-formatter';

interface StoryReaderProps {
  gamebookData: GamebookData;
  gameState: GameState;
  currentPage: Page | null;
  canChoose: (choice: Choice) => boolean;
  getChoiceRequirements: (choice: Choice) => string[];
  makeChoice: (choice: Choice, inputCorrect?: boolean) => void;
  jumpToPage: (pageId: number | string) => void;
  restart: () => void;
  getPageById: (id: number | string) => Page | null;
  getSaveSlots: () => SaveSlot[];
  saveGame: (slotId: number, name: string) => void;
  loadGame: (slot: SaveSlot) => void;
  deleteSave: (slotId: number) => void;
  exitStory: () => void;
  maxSaveSlots: number;
  canSave: () => boolean;
  onUpdateStat?: (statName: string, value: number) => void;
  onConsumeItem?: (itemId: string) => void;
  onPurchaseItem?: (pageId: number | string, itemId: string, price: number, currencyVar: string) => boolean;
  getItemDetails?: (itemId: string) => ItemDef | undefined;
  getEnemyDetails?: (enemyId: string) => EnemyDef | undefined;
  onUpdateStats?: (stats: Record<string, number>) => void;
}

export function StoryReader({
  gamebookData,
  gameState,
  currentPage,
  canChoose,
  getChoiceRequirements,
  makeChoice,
  jumpToPage,
  restart,
  getPageById,
  getSaveSlots,
  saveGame,
  loadGame,
  deleteSave,
  exitStory,
  maxSaveSlots,
  canSave,
  onUpdateStat,
  onConsumeItem,
  onPurchaseItem,
  getItemDetails,
  getEnemyDetails,
  onUpdateStats,
}: StoryReaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputDialogOpen, setInputDialogOpen] = useState(false);
  const [pendingInputChoice, setPendingInputChoice] = useState<Choice | null>(null);
  const [combatDialogOpen, setCombatDialogOpen] = useState(false);
  const [pendingCombatChoice, setPendingCombatChoice] = useState<Choice | null>(null);
  const [currentEnemy, setCurrentEnemy] = useState<EnemyDef | null>(null);

  const { backgroundGradient } = useTheme();
  
  // Apply theme config from gamebook
  useApplyThemeConfig(gamebookData.theme);

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Page not found</p>
      </div>
    );
  }

  const isEnding = currentPage.choices.length === 0 || !!currentPage.ending;
  const endingType = currentPage.ending?.type || (currentPage.choices.length === 0 ? 'soft' : undefined);
  const isHardEnding = endingType === 'hard';

  const handleChoiceClick = (choice: Choice) => {
    // Handle combat choices
    if (choice.combat && getEnemyDetails) {
      const enemy = getEnemyDetails(choice.combat.enemyId);
      if (enemy) {
        setCurrentEnemy(enemy);
        setPendingCombatChoice(choice);
        setCombatDialogOpen(true);
        return;
      }
    }
    
    // Handle input choices
    if (choice.input) {
      setPendingInputChoice(choice);
      setInputDialogOpen(true);
    } else {
      makeChoice(choice);
    }
  };

  const handleInputSubmit = (correct: boolean) => {
    if (pendingInputChoice) {
      makeChoice(pendingInputChoice, correct);
      setPendingInputChoice(null);
      setInputDialogOpen(false);
    }
  };

  const handleCombatWin = (finalStats: Record<string, number>) => {
    if (pendingCombatChoice && pendingCombatChoice.combat && onUpdateStats) {
      onUpdateStats(finalStats);
      
      // Apply win effects if any
      if (pendingCombatChoice.combat.winEffects) {
        makeChoice({
          ...pendingCombatChoice,
          effects: pendingCombatChoice.combat.winEffects,
          to: String(pendingCombatChoice.combat.winPageId),
        });
      } else {
        makeChoice({
          ...pendingCombatChoice,
          to: String(pendingCombatChoice.combat.winPageId),
        });
      }
      
      setCombatDialogOpen(false);
      setPendingCombatChoice(null);
      setCurrentEnemy(null);
    }
  };

  const handleCombatLose = (finalStats: Record<string, number>) => {
    if (pendingCombatChoice && pendingCombatChoice.combat && onUpdateStats) {
      onUpdateStats(finalStats);
      
      // Apply lose effects if any
      if (pendingCombatChoice.combat.loseEffects) {
        makeChoice({
          ...pendingCombatChoice,
          effects: pendingCombatChoice.combat.loseEffects,
          to: String(pendingCombatChoice.combat.losePageId),
        });
      } else {
        makeChoice({
          ...pendingCombatChoice,
          to: String(pendingCombatChoice.combat.losePageId),
        });
      }
      
      setCombatDialogOpen(false);
      setPendingCombatChoice(null);
      setCurrentEnemy(null);
    }
  };

  const handleCombatCancel = () => {
    setCombatDialogOpen(false);
    setPendingCombatChoice(null);
    setCurrentEnemy(null);
  };

  const handlePurchase = (itemId: string, price: number) => {
    if (currentPage?.shop && onPurchaseItem) {
      onPurchaseItem(currentPage.id, itemId, price, currentPage.shop.currency);
    }
  };

  const title = gamebookData.meta?.title || gamebookData.title || 'Untitled Story';

  // Get section name if available (handle both formats)
  const getSectionName = (): string | undefined => {
    if (!currentPage.section) return undefined;
    
    // Check if sections is metadata array
    if (gamebookData.sections) {
      const section = gamebookData.sections.find(s => 
        s.id === currentPage.section || String(s.id) === String(currentPage.section)
      );
      if (section) return section.name || section.title;
    }
    
    return undefined;
  };

  const sectionName = getSectionName();

  // Background style
  const backgroundStyle = backgroundGradient
    ? { background: backgroundGradient }
    : undefined;

  return (
    <div className="min-h-screen bg-background" style={backgroundStyle}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="font-serif font-semibold text-lg truncate">
              {currentPage.title || title}
            </h1>
            {sectionName && (
              <p className="text-xs text-muted-foreground truncate">{sectionName}</p>
            )}
          </div>
          <div className="flex items-center gap-1">
            <ThemeControls />
            <DicePopup stats={gameState.stats} />
            <Button variant="ghost" size="icon" onClick={restart} title="Restart">
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={exitStory} title="Exit">
              <LogOut className="h-4 w-4" />
            </Button>
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80 overflow-y-auto">
                <div className="space-y-6 pt-6">
                  {canSave() && (
                    <SaveLoadPanel
                      saveSlots={getSaveSlots()}
                      onSave={saveGame}
                      onLoad={(slot) => {
                        loadGame(slot);
                        setSidebarOpen(false);
                      }}
                      onDelete={deleteSave}
                      maxSlots={maxSaveSlots}
                    />
                  )}
                  <InventoryPanel 
                    inventory={gameState.inventory} 
                    stats={gameState.stats}
                    gamebookData={gamebookData}
                    onUpdateStat={onUpdateStat}
                    onConsumeItem={onConsumeItem}
                  />
                  <HistoryPanel
                    history={gameState.history as (number | string)[]}
                    currentPageId={gameState.currentPageId as number | string}
                    getPageById={getPageById}
                    onJumpToPage={(pageId: number | string) => {
                      jumpToPage(pageId);
                      setSidebarOpen(false);
                    }}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container max-w-3xl mx-auto px-4 py-8">
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <div className="bg-card/90 backdrop-blur rounded-lg p-6 md:p-8 shadow-sm border">
            {/* Player name greeting (if set) */}
            {gameState.playerName && gameState.history.length === 1 && (
              <p className="text-muted-foreground text-sm mb-4">
                Welcome, <span className="font-medium text-foreground">{gameState.playerName}</span>
              </p>
            )}

            {/* Page image */}
            {currentPage.image && (
              <div className="mb-6 -mx-2 md:-mx-4">
                <img
                  src={currentPage.image}
                  alt=""
                  className="w-full rounded-lg object-cover max-h-64 md:max-h-80"
                  loading="lazy"
                />
              </div>
            )}

            {/* Page text with formatting support */}
            <div className="font-serif text-foreground leading-relaxed text-lg">
              {formatText(currentPage.text)}
            </div>

            {/* Choice notes (e.g., combat instructions) */}
            {currentPage.choices.some(c => c.note) && (
              <div className="mt-4 p-3 bg-muted/50 rounded text-sm text-muted-foreground italic">
                {currentPage.choices.find(c => c.note)?.note}
              </div>
            )}

            {/* Ending indicator */}
            {isEnding && (
              <div className="mt-8 pt-6 border-t text-center">
                {isHardEnding ? (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                    </div>
                    <p className="text-muted-foreground italic font-serif text-xl">— The End —</p>
                    <p className="text-sm text-muted-foreground mt-2">Congratulations! You've reached a true ending.</p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Skull className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground italic font-serif text-xl">— The End —</p>
                    <p className="text-sm text-muted-foreground mt-2">This journey has ended. Try again?</p>
                  </>
                )}
                <Button onClick={restart} className="mt-4">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              </div>
            )}

            {/* Choices */}
            {!isEnding && currentPage.choices.length > 0 && (
              <div className="mt-8 pt-6 border-t space-y-3">
                {currentPage.choices.map((choice, index) => (
                  <ChoiceButton
                    key={index}
                    choice={choice}
                    canChoose={canChoose(choice)}
                    requirements={getChoiceRequirements(choice)}
                    hasInput={!!choice.input}
                    hasCombat={!!choice.combat}
                    onClick={() => handleChoiceClick(choice)}
                  />
                ))}
              </div>
            )}

            {/* Shop Panel */}
            {currentPage.shop && getItemDetails && (
              <div className="mt-8 pt-6 border-t">
                <ShopPanel
                  shop={currentPage.shop}
                  currentPageId={currentPage.id}
                  playerCurrency={(gameState.variables[currentPage.shop.currency] as number) || 0}
                  playerInventory={gameState.inventory}
                  shopInventories={gameState.shopInventories}
                  getItemDetails={getItemDetails}
                  onPurchase={handlePurchase}
                />
              </div>
            )}
          </div>
        </article>

        {/* Quick status bar */}
        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>Page {gameState.history.length} of your journey</span>
          {gameState.inventory.length > 0 && (
            <span>• {gameState.inventory.length} items</span>
          )}
        </div>
      </main>

      {/* Input Dialog for puzzles */}
      {pendingInputChoice?.input && (
        <InputDialog
          open={inputDialogOpen}
          onOpenChange={(open) => {
            setInputDialogOpen(open);
            if (!open) setPendingInputChoice(null);
          }}
          input={pendingInputChoice.input}
          onSubmit={handleInputSubmit}
        />
      )}

      {/* Combat Dialog */}
      {currentEnemy && (
        <CombatPopup
          open={combatDialogOpen}
          enemy={currentEnemy}
          playerStats={gameState.stats}
          onWin={handleCombatWin}
          onLose={handleCombatLose}
          onCancel={handleCombatCancel}
        />
      )}
    </div>
  );
}
