import { GameMeta } from '@/types/gamebook';
import { ValidationError } from '@/types/builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface MetaEditorProps {
  meta?: GameMeta;
  onUpdate: (updates: Partial<GameMeta>) => void;
  errors: ValidationError[];
}

export const MetaEditor = ({ meta, onUpdate, errors }: MetaEditorProps) => {
  const getError = (field: string) => errors.find(e => e.field === field);

  const generateNewStoryId = () => {
    onUpdate({ storyId: uuidv4() });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Story Information</h2>
        <p className="text-muted-foreground">Basic metadata about your story</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>Information that identifies your story</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={meta?.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Enter story title"
              className={getError('title') ? 'border-destructive' : ''}
            />
            {getError('title') && (
              <p className="text-sm text-destructive">{getError('title')!.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input
              id="author"
              value={meta?.author || ''}
              onChange={(e) => onUpdate({ author: e.target.value })}
              placeholder="Enter author name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              value={meta?.version || ''}
              onChange={(e) => onUpdate({ version: e.target.value })}
              placeholder="1.0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storyId">
              Story ID
              {getError('storyId') && <span className="text-yellow-600 ml-2">(Recommended)</span>}
            </Label>
            <div className="flex gap-2">
              <Input
                id="storyId"
                value={meta?.storyId || ''}
                onChange={(e) => onUpdate({ storyId: e.target.value })}
                placeholder="UUID for save isolation"
                className={getError('storyId') ? 'border-yellow-600' : ''}
                readOnly
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateNewStoryId}
                className="flex-shrink-0"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {getError('storyId') && (
              <p className="text-sm text-yellow-600">{getError('storyId')!.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Story ID ensures saves from different stories don't conflict
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
