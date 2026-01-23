import { useState, useMemo } from 'react';
import { User, Sparkles, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { GamebookData, GamePresets, PlayerConfig } from '@/types/gamebook';

interface CharacterSetupProps {
  gamebookData: GamebookData;
  onComplete: (playerName: string, stats: Record<string, number>) => void;
}

export function CharacterSetup({ gamebookData, onComplete }: CharacterSetupProps) {
  const presets = gamebookData.presets;
  const playerConfig = gamebookData.player;
  const statPresets = presets?.stats || {};
  const statNames = Object.keys(statPresets);

  const [playerName, setPlayerName] = useState('');
  const [useCustomStats, setUseCustomStats] = useState(false);
  const [customStats, setCustomStats] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const [name, preset] of Object.entries(statPresets)) {
      initial[name] = preset.default;
    }
    return initial;
  });

  const defaultStats = useMemo(() => {
    const stats: Record<string, number> = {};
    for (const [name, preset] of Object.entries(statPresets)) {
      stats[name] = preset.default;
    }
    return stats;
  }, [statPresets]);

  const poolUsed = useMemo(() => {
    if (!useCustomStats) return 0;
    let used = 0;
    for (const [name, value] of Object.entries(customStats)) {
      const defaultVal = statPresets[name]?.default || 0;
      used += value - defaultVal;
    }
    return used;
  }, [customStats, statPresets, useCustomStats]);

  const poolTotal = playerConfig?.customPool || 0;
  const poolRemaining = poolTotal - poolUsed;

  const handleStatChange = (statName: string, value: number) => {
    const preset = statPresets[statName];
    if (!preset) return;

    const currentValue = customStats[statName];
    const delta = value - currentValue;

    // Check pool limits
    if (delta > 0 && poolRemaining < delta) {
      value = currentValue + poolRemaining;
    }

    // Clamp to min/max
    value = Math.max(preset.min, Math.min(preset.max, value));

    setCustomStats(prev => ({ ...prev, [statName]: value }));
  };

  const handleComplete = () => {
    const finalStats = useCustomStats ? customStats : defaultStats;
    onComplete(playerName || 'Adventurer', finalStats);
  };

  const canCustomize = playerConfig?.statMode === 'custom' || playerConfig?.statMode === 'preset_or_custom';
  const mustCustomize = playerConfig?.statMode === 'custom';
  const hasStats = statNames.length > 0;

  const title = gamebookData.meta?.title || gamebookData.title || 'New Adventure';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold text-foreground">{title}</h1>
          {gamebookData.meta?.author && (
            <p className="text-muted-foreground">by {gamebookData.meta.author}</p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Character Setup
            </CardTitle>
            <CardDescription>
              Configure your character before starting the adventure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Player Name */}
            <div className="space-y-2">
              <Label htmlFor="playerName">Your Name</Label>
              <Input
                id="playerName"
                placeholder="Enter your name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
              />
            </div>

            {/* Stat Mode Selection */}
            {hasStats && canCustomize && !mustCustomize && (
              <div className="space-y-3">
                <Label>Stat Configuration</Label>
                <div className="flex gap-2">
                  <Button
                    variant={!useCustomStats ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setUseCustomStats(false)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Use Presets
                  </Button>
                  <Button
                    variant={useCustomStats ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setUseCustomStats(true)}
                  >
                    <Settings2 className="h-4 w-4 mr-2" />
                    Customize
                  </Button>
                </div>
              </div>
            )}

            {/* Stats Display / Allocation */}
            {hasStats && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Stats</Label>
                  {useCustomStats && poolTotal > 0 && (
                    <span className={`text-sm font-medium ${poolRemaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      Points: {poolRemaining} / {poolTotal}
                    </span>
                  )}
                </div>
                
                <div className="space-y-4">
                  {statNames.map(statName => {
                    const preset = statPresets[statName];
                    const value = useCustomStats ? customStats[statName] : defaultStats[statName];
                    
                    return (
                      <div key={statName} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{statName}</span>
                          <span className="text-muted-foreground">
                            {value} / {preset.max}
                          </span>
                        </div>
                        {useCustomStats ? (
                          <Slider
                            value={[value]}
                            min={preset.min}
                            max={preset.max}
                            step={1}
                            onValueChange={([v]) => handleStatChange(statName, v)}
                          />
                        ) : (
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${(value / preset.max) * 100}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleComplete}
              disabled={useCustomStats && poolRemaining < 0}
            >
              Begin Adventure
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
