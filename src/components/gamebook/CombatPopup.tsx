import { useState } from 'react';
import { Swords, Heart, Shield } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EnemyDef } from '@/types/gamebook';

interface CombatPopupProps {
  open: boolean;
  enemy: EnemyDef;
  playerStats: Record<string, number>;
  onWin: (finalStats: Record<string, number>) => void;
  onLose: (finalStats: Record<string, number>) => void;
  onCancel: () => void;
}

export function CombatPopup({
  open,
  enemy,
  playerStats,
  onWin,
  onLose,
  onCancel,
}: CombatPopupProps) {
  const [finalStats, setFinalStats] = useState<Record<string, number>>(playerStats);

  const handleStatChange = (statName: string, value: string) => {
    const numValue = parseInt(value) || 0;
    setFinalStats(prev => ({ ...prev, [statName]: numValue }));
  };

  const handleWin = () => {
    onWin(finalStats);
  };

  const handleLose = () => {
    onLose(finalStats);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-red-500" />
            Combat Encounter
          </DialogTitle>
          <DialogDescription>
            Resolve this battle manually, then enter your final stats and outcome.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Enemy Information */}
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              {enemy.name}
            </h3>
            {enemy.description && (
              <p className="text-sm text-muted-foreground mb-3">{enemy.description}</p>
            )}
            {enemy.stats && Object.keys(enemy.stats).length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(enemy.stats).map(([statName, value]) => (
                  <div key={statName} className="text-sm">
                    <span className="font-medium">{statName}:</span> {value}
                  </div>
                ))}
              </div>
            )}
            {(enemy.hayat || enemy.attack || enemy.rank) && (
              <div className="grid grid-cols-2 gap-2 text-sm">
                {enemy.hayat && (
                  <div>
                    <span className="font-medium">Health:</span> {enemy.hayat}
                  </div>
                )}
                {enemy.attack && (
                  <div>
                    <span className="font-medium">Attack:</span> {enemy.attack}
                  </div>
                )}
                {enemy.rank && (
                  <div>
                    <span className="font-medium">Rank:</span> {enemy.rank}
                  </div>
                )}
              </div>
            )}
            {enemy.note && (
              <p className="text-xs text-muted-foreground mt-2 italic">{enemy.note}</p>
            )}
          </div>

          {/* Player Stats Input */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-500" />
              Your Final Stats After Battle:
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(playerStats).map(([statName, currentValue]) => (
                <div key={statName} className="space-y-1">
                  <Label htmlFor={`stat-${statName}`} className="text-sm">
                    {statName}
                  </Label>
                  <Input
                    id={`stat-${statName}`}
                    type="number"
                    defaultValue={currentValue}
                    onChange={(e) => handleStatChange(statName, e.target.value)}
                    className="h-9"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
            <strong>Instructions:</strong> Fight this battle manually (using dice, another system, or your imagination). 
            Enter your final stats above, then click "Victory" if you won or "Defeat" if you lost.
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onCancel} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleLose}
            className="w-full sm:w-auto"
          >
            I Was Defeated
          </Button>
          <Button
            variant="default"
            onClick={handleWin}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
          >
            I Won!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
