import { Backpack, BarChart3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface InventoryPanelProps {
  inventory: string[];
  stats: Record<string, number>;
}

export function InventoryPanel({ inventory, stats }: InventoryPanelProps) {
  const hasItems = inventory.length > 0;
  const hasStats = Object.keys(stats).length > 0;

  if (!hasItems && !hasStats) {
    return (
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Backpack className="h-4 w-4" />
          Inventory & Stats
        </h3>
        <p className="text-sm text-muted-foreground italic">Nothing collected yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasStats && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Stats
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(stats).map(([name, value]) => (
              <div key={name} className="bg-muted rounded-md p-2 text-center">
                <div className="text-lg font-bold text-foreground">{value}</div>
                <div className="text-xs text-muted-foreground">{name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasItems && (
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Backpack className="h-4 w-4" />
            Inventory ({inventory.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {inventory.map((item, index) => (
              <Badge key={index} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
