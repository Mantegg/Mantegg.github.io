import { Package, BarChart3, Skull, Edit2, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GamebookData } from '@/types/gamebook';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface InventoryPanelProps {
  inventory: string[];
  stats: Record<string, number>;
  gamebookData?: GamebookData | null;
  onUpdateStat?: (statName: string, value: number) => void;
}

export function InventoryPanel({ inventory, stats, gamebookData, onUpdateStat }: InventoryPanelProps) {
  const [enemiesOpen, setEnemiesOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  // Get items from both array and preset formats
  const getItemInfo = (itemId: string): { name: string; visible: boolean; type?: string } => {
    // Check array-based items first
    if (gamebookData?.items) {
      if (Array.isArray(gamebookData.items)) {
        const item = gamebookData.items.find(i => i.id === itemId);
        if (item) return { name: item.name, visible: item.visible !== false, type: item.type };
      } else {
        // Object format: items: { "item_id": { name: "...", ... } }
        const item = (gamebookData.items as Record<string, { name: string; visible?: boolean; type?: string }>)[itemId];
        if (item) return { name: item.name, visible: item.visible !== false, type: item.type };
      }
    }
    // Check preset items
    const preset = gamebookData?.presets?.items?.[itemId];
    if (preset) return { name: preset.name, visible: preset.visible !== false, type: preset.type };
    // Default
    return { name: itemId, visible: true };
  };

  // Filter visible items
  const visibleItems = inventory.filter(itemId => {
    const info = getItemInfo(itemId);
    return info.visible;
  });

  const getItemBadgeVariant = (type?: string): "default" | "secondary" | "outline" => {
    switch (type) {
      case 'key': return 'default';
      case 'clue': return 'secondary';
      default: return 'outline';
    }
  };

  const hasStats = Object.keys(stats).length > 0;
  const hasItems = visibleItems.length > 0;
  
  // Get enemies from both formats
  const enemies = gamebookData?.enemies || Object.entries(gamebookData?.presets?.enemies || {}).map(([id, e]) => ({ id, ...e }));
  const hasEnemies = enemies.length > 0;

  const handleStartEdit = (statName: string, currentValue: number) => {
    setEditingStat(statName);
    setEditValue(String(currentValue));
  };

  const handleSaveEdit = (statName: string) => {
    const newValue = parseInt(editValue, 10);
    if (!isNaN(newValue) && onUpdateStat) {
      onUpdateStat(statName, newValue);
    }
    setEditingStat(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingStat(null);
    setEditValue('');
  };

  if (!hasStats && !hasItems && !hasEnemies) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Package className="h-4 w-4" />
          Inventory & Stats
        </h3>
        <p className="text-sm text-muted-foreground italic">Nothing yet...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Section */}
      {hasStats && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Stats
            {onUpdateStat && (
              <span className="text-xs text-muted-foreground font-normal">(editable)</span>
            )}
          </h3>
          <div className="space-y-2">
            {Object.entries(stats).map(([name, value]) => (
              <div key={name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{name}</span>
                  {editingStat === name ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="h-6 w-16 text-right text-sm px-1"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(name);
                          if (e.key === 'Escape') handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleSaveEdit(name)}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">{value}</span>
                      {onUpdateStat && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-50 hover:opacity-100"
                          onClick={() => handleStartEdit(name, value)}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasStats && hasItems && <Separator />}

      {/* Inventory Section */}
      {hasItems && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventory
          </h3>
          <div className="flex flex-wrap gap-2">
            {visibleItems.map((itemId) => {
              const info = getItemInfo(itemId);
              return (
                <Badge
                  key={itemId}
                  variant={getItemBadgeVariant(info.type)}
                  className="text-xs"
                >
                  {info.name}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {(hasStats || hasItems) && hasEnemies && <Separator />}

      {/* Enemies Reference Section */}
      {hasEnemies && (
        <Collapsible open={enemiesOpen} onOpenChange={setEnemiesOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Skull className="h-4 w-4" />
                Enemies Reference
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${enemiesOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <div className="space-y-2">
              {enemies.map((enemy) => (
                <div key={enemy.id} className="p-2 bg-muted/50 rounded text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{enemy.name}</span>
                    {'rank' in enemy && enemy.rank !== undefined && (
                      <Badge variant="outline" className="text-xs">Rank {enemy.rank}</Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 flex gap-3">
                    {'hayat' in enemy && enemy.hayat !== undefined && <span>HP: {enemy.hayat}</span>}
                    {'attack' in enemy && enemy.attack !== undefined && <span>ATK: {enemy.attack}</span>}
                  </div>
                  {'note' in enemy && enemy.note && (
                    <p className="text-xs text-muted-foreground italic mt-1">{enemy.note}</p>
                  )}
                </div>
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
