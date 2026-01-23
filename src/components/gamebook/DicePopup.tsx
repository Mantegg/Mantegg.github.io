import { useState } from 'react';
import { Dices } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DiceType, DiceRollResult } from '@/types/gamebook';
import { cn } from '@/lib/utils';

interface DicePopupProps {
  stats?: Record<string, number>;
}

const DICE_TYPES: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

function rollDice(type: DiceType): number {
  const max = parseInt(type.slice(1));
  return Math.floor(Math.random() * max) + 1;
}

export function DicePopup({ stats = {} }: DicePopupProps) {
  const [open, setOpen] = useState(false);
  const [diceType, setDiceType] = useState<DiceType>('d6');
  const [quantity, setQuantity] = useState(1);
  const [selectedStat, setSelectedStat] = useState<string>('');
  const [result, setResult] = useState<DiceRollResult | null>(null);

  const statNames = Object.keys(stats);

  const handleRoll = () => {
    const rolls: number[] = [];
    for (let i = 0; i < quantity; i++) {
      rolls.push(rollDice(diceType));
    }
    const total = rolls.reduce((sum, r) => sum + r, 0);

    const newResult: DiceRollResult = {
      dice: diceType,
      quantity,
      rolls,
      total,
    };

    if (selectedStat && stats[selectedStat] !== undefined) {
      newResult.statName = selectedStat;
      newResult.statValue = stats[selectedStat];
      newResult.success = total <= stats[selectedStat];
    }

    setResult(newResult);
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Dice Roller">
          <Dices className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dices className="h-5 w-5" />
            Dice Roller
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Dice Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Dice Type</Label>
              <Select value={diceType} onValueChange={(v) => setDiceType(v as DiceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DICE_TYPES.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
              />
            </div>
          </div>

          {/* Stat Selection (optional) */}
          {statNames.length > 0 && (
            <div className="space-y-2">
              <Label>Test Against Stat (Optional)</Label>
              <Select value={selectedStat} onValueChange={setSelectedStat}>
                <SelectTrigger>
                  <SelectValue placeholder="None - Just roll" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None - Just roll</SelectItem>
                  {statNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name} ({stats[name]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Success if total ≤ stat value
              </p>
            </div>
          )}

          {/* Roll Button */}
          <Button onClick={handleRoll} className="w-full" size="lg">
            <Dices className="h-4 w-4 mr-2" />
            Roll {quantity}{diceType.toUpperCase()}
          </Button>

          {/* Result Display */}
          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-center space-y-3">
              {/* Individual Rolls */}
              <div className="flex flex-wrap justify-center gap-2">
                {result.rolls.map((roll, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-background border-2 border-primary rounded flex items-center justify-center font-bold text-lg"
                  >
                    {roll}
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="text-2xl font-bold">
                Total: {result.total}
              </div>

              {/* Stat Test Result */}
              {result.statName && (
                <div
                  className={cn(
                    'text-lg font-semibold px-4 py-2 rounded',
                    result.success
                      ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                      : 'bg-red-500/20 text-red-700 dark:text-red-400'
                  )}
                >
                  {result.total} vs {result.statName} ({result.statValue})
                  <span className="block text-xl mt-1">
                    {result.success ? '✓ Success!' : '✗ Failure'}
                  </span>
                </div>
              )}

              <Button variant="outline" size="sm" onClick={handleReset}>
                Roll Again
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground text-center">
            This is a tool only. Results do not affect the game automatically.
            <br />
            Choose your next action based on the outcome.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
