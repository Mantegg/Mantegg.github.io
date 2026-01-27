import { History, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Page } from '@/types/gamebook';

interface HistoryPanelProps {
  history: (number | string)[];
  currentPageId: number | string;
  getPageById: (id: number | string) => Page | null;
  onJumpToPage: (pageId: number | string) => void;
}

export function HistoryPanel({ history, currentPageId, getPageById, onJumpToPage }: HistoryPanelProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold flex items-center gap-2">
        <History className="h-4 w-4" />
        Reading History
      </h3>
      <ScrollArea className="h-48">
        <div className="space-y-1 pr-4">
          {history.map((pageId, index) => {
            const page = getPageById(pageId);
            const isCurrent = pageId === currentPageId;
            const preview = page?.text.replace(/<[^>]+>/g, '').substring(0, 50) + '...' || 'Unknown page';
            
            return (
              <Button
                key={`${pageId}-${index}`}
                variant={isCurrent ? 'secondary' : 'ghost'}
                className="w-full justify-start h-auto py-2 px-3 text-left"
                onClick={() => onJumpToPage(pageId)}
              >
                <div className="flex items-center gap-2 w-full min-w-0">
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {index + 1}.
                  </span>
                  <span className="truncate text-sm flex-1">{preview}</span>
                  {isCurrent && (
                    <ChevronRight className="h-3 w-3 flex-shrink-0 text-primary" />
                  )}
                </div>
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
