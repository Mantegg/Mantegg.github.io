import { useState } from 'react';
import { Menu, RotateCcw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { GamebookData, GameState, Page, Choice, SaveSlot } from '@/types/gamebook';
import { HistoryPanel } from './HistoryPanel';
import { InventoryPanel } from './InventoryPanel';
import { SaveLoadPanel } from './SaveLoadPanel';
import { ChoiceButton } from './ChoiceButton';

interface StoryReaderProps {
  gamebookData: GamebookData;
  gameState: GameState;
  currentPage: Page | null;
  canChoose: (choice: Choice) => boolean;
  makeChoice: (choice: Choice) => void;
  jumpToPage: (pageId: number) => void;
  restart: () => void;
  getPageById: (id: number) => Page | null;
  getSaveSlots: () => SaveSlot[];
  saveGame: (slotId: number, name: string) => void;
  loadGame: (slot: SaveSlot) => void;
  deleteSave: (slotId: number) => void;
  exitStory: () => void;
  maxSaveSlots: number;
}

export function StoryReader({
  gamebookData,
  gameState,
  currentPage,
  canChoose,
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
}: StoryReaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!currentPage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Page not found</p>
      </div>
    );
  }

  const isEnding = currentPage.choices.length === 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <h1 className="font-serif font-semibold text-lg truncate">
            {gamebookData.title || 'Untitled Story'}
          </h1>
          <div className="flex items-center gap-2">
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
                  <InventoryPanel 
                    inventory={gameState.inventory} 
                    stats={gameState.stats} 
                  />
                  <HistoryPanel
                    history={gameState.history}
                    currentPageId={gameState.currentPageId}
                    getPageById={getPageById}
                    onJumpToPage={(pageId) => {
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
          <div className="bg-card rounded-lg p-6 md:p-8 shadow-sm border">
            {/* Page text */}
            <div className="font-serif text-foreground leading-relaxed whitespace-pre-wrap text-lg">
              {currentPage.text}
            </div>

            {/* Ending indicator */}
            {isEnding && (
              <div className="mt-8 pt-6 border-t text-center">
                <p className="text-muted-foreground italic font-serif text-xl">— The End —</p>
                <Button onClick={restart} className="mt-4">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              </div>
            )}

            {/* Choices */}
            {!isEnding && (
              <div className="mt-8 pt-6 border-t space-y-3">
                {currentPage.choices.map((choice, index) => (
                  <ChoiceButton
                    key={index}
                    choice={choice}
                    canChoose={canChoose(choice)}
                    onClick={() => makeChoice(choice)}
                  />
                ))}
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
    </div>
  );
}
