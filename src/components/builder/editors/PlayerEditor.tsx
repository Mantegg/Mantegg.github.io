import { PlayerConfig } from '@/types/gamebook';
import { ValidationError } from '@/types/builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PlayerEditorProps {
  player?: PlayerConfig;
  onUpdateStats: (stats: Record<string, number>) => void;
  onUpdateInventory: (inventory: string[]) => void;
  errors: ValidationError[];
}

export const PlayerEditor = ({ player, onUpdateStats, onUpdateInventory, errors }: PlayerEditorProps) => {
  const [newStatName, setNewStatName] = useState('');
  const [newStatValue, setNewStatValue] = useState('10');
  const [newItemId, setNewItemId] = useState('');

  const stats = player?.stats || {};
  const inventory = player?.inventory || player?.startingItems || [];

  const addStat = () => {
    if (newStatName.trim() && !stats[newStatName]) {
      onUpdateStats({ ...stats, [newStatName.trim()]: parseInt(newStatValue) || 0 });
      setNewStatName('');
      setNewStatValue('10');
    }
  };

  const updateStat = (name: string, value: number) => {
    onUpdateStats({ ...stats, [name]: value });
  };

  const deleteStat = (name: string) => {
    const { [name]: _, ...rest } = stats;
    onUpdateStats(rest);
  };

  const addItem = () => {
    if (newItemId.trim() && !inventory.includes(newItemId.trim())) {
      onUpdateInventory([...inventory, newItemId.trim()]);
      setNewItemId('');
    }
  };

  const deleteItem = (itemId: string) => {
    onUpdateInventory(inventory.filter(id => id !== itemId));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Player Setup</h2>
        <p className="text-muted-foreground">Configure initial player stats and inventory</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Starting Stats</CardTitle>
          <CardDescription>Define the player's initial attribute values</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(stats).map(([name, value]) => (
            <div key={name} className="flex items-center gap-2">
              <div className="flex-1">
                <Label className="text-xs">{name}</Label>
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => updateStat(name, parseInt(e.target.value) || 0)}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteStat(name)}
                className="mt-5"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="flex gap-2 pt-2 border-t">
            <Input
              placeholder="Stat name (e.g., HEALTH)"
              value={newStatName}
              onChange={(e) => setNewStatName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addStat()}
            />
            <Input
              type="number"
              placeholder="Value"
              value={newStatValue}
              onChange={(e) => setNewStatValue(e.target.value)}
              className="w-24"
              onKeyDown={(e) => e.key === 'Enter' && addStat()}
            />
            <Button onClick={addStat}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Starting Inventory</CardTitle>
          <CardDescription>Items the player begins with</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {inventory.length > 0 ? (
            <div className="space-y-2">
              {inventory.map((itemId) => (
                <div key={itemId} className="flex items-center gap-2 p-2 border rounded">
                  <span className="flex-1 font-mono text-sm">{itemId}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteItem(itemId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No starting items</p>
          )}

          <div className="flex gap-2 pt-2 border-t">
            <Input
              placeholder="Item ID"
              value={newItemId}
              onChange={(e) => setNewItemId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addItem()}
            />
            <Button onClick={addItem}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Make sure to define these items in the Items section
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
