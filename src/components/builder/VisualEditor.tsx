import { GamebookData, Choice } from '@/types/gamebook';
import { ValidationError } from '@/types/builder';

interface VisualEditorProps {
  gamebookData: GamebookData;
  selectedPageId: string | null;
  onSelectPage: (pageId: string) => void;
  onAddChoice: (pageId: string, choice: Choice) => void;
  onUpdateChoice: (pageId: string, choiceIndex: number, updates: Partial<Choice>) => void;
  errors: ValidationError[];
}

export const VisualEditor = (props: VisualEditorProps) => {
  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Visual Node Editor</h3>
        <p className="text-muted-foreground">
          ReactFlow visual editor - Coming in next phase
        </p>
      </div>
    </div>
  );
};
