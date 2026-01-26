import { BuilderSection, ValidationError } from '@/types/builder';
import { GamebookData, Page, Choice, ItemDef, EnemyDef } from '@/types/gamebook';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MetaEditor } from './editors/MetaEditor';
import { PlayerEditor } from './editors/PlayerEditor';
import { PageEditor } from './editors/PageEditor';
import { ItemsEditor } from './editors/ItemsEditor';
import { EnemiesEditor } from './editors/EnemiesEditor';
import { PresetsEditor } from './editors/PresetsEditor';
import { SectionsEditor } from './editors/SectionsEditor';

interface FormEditorProps {
  section: BuilderSection;
  gamebookData: GamebookData;
  selectedPageId: number | string | null;
  errors: ValidationError[];
  onUpdateMeta: (updates: Partial<GamebookData['meta']>) => void;
  onUpdatePlayer: (player: GamebookData['player']) => void;
  onUpdatePresets: (presets: GamebookData['presets']) => void;
  onUpdateSections: (sections: GamebookData['sections']) => void;
  onUpdatePage: (pageId: number | string, updates: Partial<Page>) => void;
  onAddPage: (pageId?: number | string) => number | string;
  onDeletePage: (pageId: number | string) => void;
  onDuplicatePage: (pageId: number | string) => number | string | null;
  onAddChoice: (pageId: number | string, choice: Choice) => void;
  onUpdateChoice: (pageId: number | string, choiceIndex: number, updates: Partial<Choice>) => void;
  onDeleteChoice: (pageId: number | string, choiceIndex: number) => void;
  onAddItem: (itemId: string, itemDef: ItemDef) => void;
  onUpdateItem: (itemId: string, updates: Partial<ItemDef>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddEnemy: (enemyId: string, enemyDef: EnemyDef) => void;
  onUpdateEnemy: (enemyId: string, updates: Partial<EnemyDef>) => void;
  onDeleteEnemy: (enemyId: string) => void;
}

export const FormEditor = (props: FormEditorProps) => {
  const { section, gamebookData, selectedPageId, errors } = props;

  return (
    <ScrollArea className="h-full">
      <div className="p-6">
        {section === 'meta' && (
          <MetaEditor
            meta={gamebookData.meta}
            onUpdate={props.onUpdateMeta}
            errors={errors.filter(e => e.section === 'meta')}
          />
        )}

        {section === 'player' && (
          <PlayerEditor
            player={gamebookData.player}
            presets={gamebookData.presets || {}}
            items={gamebookData.items || []}
            onUpdate={props.onUpdatePlayer}
            errors={errors.filter(e => e.section === 'player')}
          />
        )}

        {section === 'pages' && selectedPageId && (() => {
          const currentPage = gamebookData.pages?.find(p => p.id === selectedPageId);
          if (!currentPage) {
            return (
              <div className="text-center py-12 text-muted-foreground">
                <p>Page not found</p>
              </div>
            );
          }
          return (
            <PageEditor
              key={selectedPageId}
              page={currentPage}
              pageId={selectedPageId}
              pages={gamebookData.pages || []}
              items={gamebookData.items || []}
              enemies={gamebookData.enemies || []}
              onUpdate={props.onUpdatePage}
              onAddChoice={props.onAddChoice}
              onUpdateChoice={props.onUpdateChoice}
              onDeleteChoice={props.onDeleteChoice}
              onDuplicate={props.onDuplicatePage}
              onDelete={props.onDeletePage}
              errors={errors.filter(e => e.pageId === String(selectedPageId))}
            />
          );
        })()}

        {section === 'pages' && !selectedPageId && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Select a page from the sidebar to edit it</p>
          </div>
        )}

        {section === 'items' && (
          <ItemsEditor
            items={gamebookData.items || []}
            onAdd={props.onAddItem}
            onUpdate={props.onUpdateItem}
            onDelete={props.onDeleteItem}
            errors={errors.filter(e => e.section === 'items')}
          />
        )}

        {section === 'enemies' && (
          <EnemiesEditor
            enemies={gamebookData.enemies || []}
            onAdd={props.onAddEnemy}
            onUpdate={props.onUpdateEnemy}
            onDelete={props.onDeleteEnemy}
            errors={errors.filter(e => e.section === 'enemies')}
          />
        )}

        {section === 'preset' && (
          <PresetsEditor
            presets={gamebookData.presets || {}}
            items={gamebookData.items || []}
            onUpdate={props.onUpdatePresets}
          />
        )}

        {section === 'sections' && (
          <SectionsEditor
            sections={gamebookData.sections as any[] || []}
            pages={gamebookData.pages || []}
            onUpdate={props.onUpdateSections}
          />
        )}
      </div>
    </ScrollArea>
  );
};

