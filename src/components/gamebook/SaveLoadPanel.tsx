import { useState } from 'react';
import { Save, FolderOpen, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SaveSlot } from '@/types/gamebook';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SaveLoadPanelProps {
  saveSlots: SaveSlot[];
  onSave: (slotId: number, name: string) => void;
  onLoad: (slot: SaveSlot) => void;
  onDelete: (slotId: number) => void;
  maxSlots: number;
}

export function SaveLoadPanel({ saveSlots, onSave, onLoad, onDelete, maxSlots }: SaveLoadPanelProps) {
  const [saveName, setSaveName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const getNextSlotId = () => {
    const usedIds = saveSlots.map(s => s.id);
    for (let i = 1; i <= maxSlots; i++) {
      if (!usedIds.includes(i)) return i;
    }
    return 1; // Overwrite first slot if all full
  };

  const handleSave = () => {
    const slotId = getNextSlotId();
    onSave(slotId, saveName || `Save ${slotId}`);
    setSaveName('');
    setSaveDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save / Load
        </h3>
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" disabled={saveSlots.length >= maxSlots}>
              <Plus className="h-3 w-3 mr-1" />
              New Save
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Game</DialogTitle>
              <DialogDescription>
                Enter a name for your save file.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Save name..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <DialogFooter>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {saveSlots.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No saved games</p>
      ) : (
        <div className="space-y-2">
          {saveSlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-muted rounded-md p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{slot.name}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(slot.savedAt)}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={() => onLoad(slot)}
                  >
                    <FolderOpen className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Save?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete "{slot.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(slot.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {slot.pagePreview}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {saveSlots.length}/{maxSlots} slots used
      </p>
    </div>
  );
}
