import { Package, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { GamebookData } from '@/types/gamebook';

interface InventoryPanelProps {
  inventory: string[];
  stats: Record<string, number>;
  gamebookData?: GamebookData | null;
}

export function InventoryPanel({ inventory, stats, gamebookData }: InventoryPanelProps) {
  const statPresets = gamebookData?.presets?.stats;
  const itemPresets = gamebookData?.presets?.items;

  // Filter visible items based on preset visibility
  const visibleItems = inventory.filter(itemId => {
    const preset = itemPresets?.[itemId];
    // If no preset defined, show item (backward compatibility)
    // If preset exists, respect visibility flag
    return !preset || preset.visible !== false;
  });

  // Get item display name
  const getItemName = (itemId: string): string => {
    return itemPresets?.[itemId]?.name || itemId;
  };

  // Get item type for badge styling
  const getItemType = (itemId: string): string | undefined => {
    return itemPresets?.[itemId]?.type;
  };

  const getItemBadgeVariant = (type?: string): "default" | "secondary" | "outline" => {
    switch (type) {
      case 'key': return 'default';
      case 'clue': return 'secondary';
      default: return 'outline';
    }
  };

  const hasStats = Object.keys(stats).length > 0;
  const hasItems = visibleItems.length > 0;

  if (!hasStats && !hasItems) {
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
          </h3>
          <div className="space-y-2">
            {Object.entries(stats).map(([name, value]) => {
              const preset = statPresets?.[name];
              const max = preset?.max;
              const percentage = max ? (value / max) * 100 : null;

              return (
                <div key={name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{name}</span>
                    <span className="text-muted-foreground">
                      {value}{max ? ` / ${max}` : ''}
                    </span>
                  </div>
                  {percentage !== null && (
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
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
            {visibleItems.map((itemId) => (
              <Badge
                key={itemId}
                variant={getItemBadgeVariant(getItemType(itemId))}
                className="text-xs"
              >
                {getItemName(itemId)}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
