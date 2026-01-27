import { GamebookData } from '@/types/gamebook';
import { useState, useEffect } from 'react';
import { useGamebook } from '@/hooks/useGamebook';
import { StoryReader } from '@/components/gamebook/StoryReader';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, RotateCcw, Settings } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PreviewModeProps {
  gamebookData: GamebookData;
  selectedPageId: number | string | null;
}

export const PreviewMode = ({ gamebookData, selectedPageId }: PreviewModeProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [startPageId, setStartPageId] = useState<number | string>(
    selectedPageId || gamebookData.pages?.[0]?.id || 1
  );
  const [showSettings, setShowSettings] = useState(!isPlaying);

  // Initialize useGamebook hook
  const gamebook = useGamebook();

  // Load story data when component mounts or gamebookData changes
  useEffect(() => {
    if (gamebookData && gamebookData.pages && gamebookData.pages.length > 0) {
      gamebook.loadStory(gamebookData);
    }
  }, [gamebookData]);

  // Update start page when selected page changes
  useEffect(() => {
    if (selectedPageId && !isPlaying) {
      setStartPageId(selectedPageId);
    }
  }, [selectedPageId, isPlaying]);

  const handleStartPreview = () => {
    // First load the story to initialize
    if (gamebookData) {
      gamebook.loadStory(gamebookData);
    }
    // Then navigate to the selected page using makeChoice to properly update history
    // We need to wait for the loadStory to complete
    setTimeout(() => {
      // Navigate by directly setting the page via jumpToPage
      // But first we need to add it to history by making a "fake" choice
      const targetPage = gamebookData.pages?.find(p => p.id === startPageId);
      if (targetPage) {
        // Directly call makeChoice with a fake choice that goes to our target page
        gamebook.makeChoice({ text: '', nextPageId: startPageId as any });
      }
      setIsPlaying(true);
      setShowSettings(false);
    }, 50);
  };

  const handleRestartPreview = () => {
    // Reload the story and navigate to start page
    if (gamebookData) {
      gamebook.loadStory(gamebookData);
    }
    setTimeout(() => {
      const targetPage = gamebookData.pages?.find(p => p.id === startPageId);
      if (targetPage) {
        gamebook.makeChoice({ text: '', nextPageId: startPageId as any });
      }
    }, 50);
  };

  const handleStopPreview = () => {
    setIsPlaying(false);
    setShowSettings(true);
  };

  // Get page preview helper
  const getPagePreview = (pageId: number | string) => {
    const page = gamebookData.pages?.find(p => p.id === pageId);
    if (!page) return `Page ${pageId}`;
    const title = page.title ? `${page.title} - ` : '';
    const text = page.text ? page.text.replace(/<[^>]+>/g, '').substring(0, 50).replace(/\n/g, ' ') : '';
    const preview = text.length > 50 ? text + '...' : text;
    return `Page ${pageId}${title ? ` - ${title}` : ''}${preview ? `: ${preview}` : ''}`;
  };

  if (!gamebookData.pages || gamebookData.pages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Alert>
          <AlertDescription>
            No pages to preview. Create at least one page to test your story.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Preview Settings Bar */}
      {showSettings && (
        <Card className="m-4 mb-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Preview Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Start From Page</Label>
              <Select
                value={String(startPageId)}
                onValueChange={(value) => {
                  const pageId = isNaN(parseInt(value)) ? value : parseInt(value);
                  setStartPageId(pageId);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select starting page" />
                </SelectTrigger>
                <SelectContent>
                  {gamebookData.pages.map((page) => (
                    <SelectItem key={page.id} value={String(page.id)}>
                      {getPagePreview(page.id)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Choose which page to start testing from. Useful for testing specific sections.
              </p>
            </div>

            <Button onClick={handleStartPreview} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Start Preview
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Story Preview with StoryReader */}
      {isPlaying && (
        <div className="flex-1 overflow-auto relative">
          {/* Preview Controls Overlay */}
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRestartPreview}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStopPreview}
            >
              Exit Preview
            </Button>
          </div>

          {/* Story Reader - wrapped to override min-h-screen */}
          <div className="h-full w-full [&>div]:min-h-full [&>div]:!min-h-0">
            <StoryReader
              gamebookData={gamebookData}
              gameState={gamebook.gameState}
              currentPage={gamebook.getCurrentPage()}
              canChoose={gamebook.canChoose}
              getChoiceRequirements={gamebook.getChoiceRequirements}
              makeChoice={gamebook.makeChoice}
              jumpToPage={gamebook.jumpToPage}
              restart={handleRestartPreview}
              getPageById={gamebook.getPageById}
              getSaveSlots={gamebook.getSaveSlots}
              saveGame={gamebook.saveGame}
              loadGame={gamebook.loadGame}
              deleteSave={gamebook.deleteSave}
              exitStory={handleStopPreview}
              maxSaveSlots={gamebook.maxSaveSlots}
              canSave={gamebook.canSave}
              onUpdateStat={gamebook.updateStat}
              onConsumeItem={gamebook.consumeItem}
              onPurchaseItem={gamebook.purchaseItem}
              getItemDetails={gamebook.getItemDetails}
              getEnemyDetails={gamebook.getEnemyDetails}
              onUpdateStats={gamebook.updateStats}
            />
          </div>
        </div>
      )}
    </div>
  );
};
