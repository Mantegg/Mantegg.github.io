import { BuilderSection, ValidationError } from '@/types/builder';
import { GamebookData } from '@/types/gamebook';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Settings, 
  User, 
  FolderTree, 
  FileJson, 
  Package, 
  Swords,
  Search,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BuilderSidebarProps {
  selectedSection: BuilderSection;
  onSelectSection: (section: BuilderSection) => void;
  gamebookData: GamebookData;
  selectedPageId: number | string | null;
  onSelectPage: (pageId: number | string) => void;
  errors: ValidationError[];
}

const sections: { id: BuilderSection; label: string; icon: any }[] = [
  { id: 'meta', label: 'Story Info', icon: FileText },
  { id: 'preset', label: 'Presets', icon: Settings },
  { id: 'player', label: 'Player Setup', icon: User },
  { id: 'sections', label: 'Sections', icon: FolderTree },
  { id: 'pages', label: 'Pages', icon: FileJson },
  { id: 'items', label: 'Items', icon: Package },
  { id: 'enemies', label: 'Enemies', icon: Swords },
];

export const BuilderSidebar = ({
  selectedSection,
  onSelectSection,
  gamebookData,
  selectedPageId,
  onSelectPage,
  errors,
}: BuilderSidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getPageErrors = (pageId: number | string) => {
    return errors.filter(e => e.pageId === String(pageId));
  };

  const pages = gamebookData.pages || [];
  const filteredPages = pages.filter(page => {
    if (!searchQuery) return true;
    const pageId = String(page.id);
    return (
      pageId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.text?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="w-64 border-r bg-card flex flex-col">
      <div className="p-3 border-b">
        <h2 className="font-semibold text-sm text-muted-foreground mb-3">SECTIONS</h2>
        <div className="space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            const sectionErrors = errors.filter(e => e.section === section.id);
            const hasErrors = sectionErrors.length > 0;
            
            return (
              <Button
                key={section.id}
                variant={selectedSection === section.id ? 'secondary' : 'ghost'}
                className={cn(
                  'w-full justify-start text-sm',
                  hasErrors && 'text-destructive'
                )}
                onClick={() => onSelectSection(section.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {section.label}
                {hasErrors && (
                  <AlertCircle className="h-3 w-3 ml-auto" />
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {selectedSection === 'pages' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {filteredPages.map((page) => {
                const pageId = String(page.id);
                const pageErrors = getPageErrors(page.id);
                const hasErrors = pageErrors.length > 0;
                const isStartPage = pages[0]?.id === page.id; // First page is start page
                
                return (
                  <div
                    key={pageId}
                    className={cn(
                      'px-2 py-1.5 rounded cursor-pointer text-sm transition-colors',
                      selectedPageId === page.id ? 'bg-secondary' : 'hover:bg-muted/50',
                      hasErrors && 'border border-destructive'
                    )}
                    onClick={() => onSelectPage(page.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs truncate flex-1">{pageId}</span>
                      {isStartPage && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1 rounded">START</span>
                      )}
                      {hasErrors && (
                        <AlertCircle className="h-3 w-3 text-destructive flex-shrink-0" />
                      )}
                    </div>
                    {page.text && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {page.text.substring(0, 50)}...
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      )}

      {selectedSection === 'items' && (
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {(gamebookData.items || []).map((item) => (
              <div
                key={item.id}
                className="px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm"
              >
                <span className="font-mono text-xs">{item.id}</span>
                <p className="text-xs text-muted-foreground truncate">
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {selectedSection === 'enemies' && (
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {(gamebookData.enemies || []).map((enemy) => (
              <div
                key={enemy.id}
                className="px-2 py-1.5 rounded hover:bg-muted/50 cursor-pointer text-sm"
              >
                <span className="font-mono text-xs">{enemy.id}</span>
                <p className="text-xs text-muted-foreground truncate">
                  {enemy.name}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
