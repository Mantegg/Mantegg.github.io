import { useState, useMemo } from 'react';
import { User, Sparkles, Settings2, Swords, Wand2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { GamebookData, CharacterProfile } from '@/types/gamebook';

interface CharacterSetupProps {
  gamebookData: GamebookData;
  onComplete: (playerName: string, stats: Record<string, number>, inventory: string[], variables: Record<string, any>) => void;
}

type CreationMode = 'sliders' | 'profiles' | 'both';

export function CharacterSetup({ gamebookData, onComplete }: CharacterSetupProps) {
  const presets = gamebookData.presets;
  const playerConfig = gamebookData.player;
  const items = gamebookData.items || [];
  
  // Determine creation mode
  const creationMode: CreationMode = playerConfig?.creationMode || 'both';
  const allowCustomName = playerConfig?.allowCustomName !== false;
  const totalStatPoints = playerConfig?.totalStatPoints;
  const useStats = playerConfig?.useStats || [];
  const profiles = presets?.profiles || [];
  
  // Get stat presets for the stats we're using
  const statPresets = presets?.stats || {};
  const availableStats = useStats.filter(statId => statPresets[statId]);
  
  // State
  const [playerName, setPlayerName] = useState('');
  const [selectedTab, setSelectedTab] = useState<'sliders' | 'profiles'>(
    creationMode === 'profiles' ? 'profiles' : 'sliders'
  );
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
    playerConfig?.defaultProfile || (profiles.length > 0 ? profiles[0].id : null)
  );
  
  // Initialize custom stats with defaults
  const [customStats, setCustomStats] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const statId of availableStats) {
      const preset = statPresets[statId];
      initial[statId] = preset?.default || 0;
    }
    return initial;
  });

  // Calculate point-buy totals
  const pointsUsed = useMemo(() => {
    if (!totalStatPoints) return 0;
    let total = 0;
    for (const statId of availableStats) {
      total += customStats[statId] || 0;
    }
    return total;
  }, [customStats, availableStats, totalStatPoints]);

  const pointsRemaining = totalStatPoints ? totalStatPoints - pointsUsed : null;

  // Handle stat slider changes with point-buy validation
  const handleStatChange = (statId: string, value: number) => {
    const preset = statPresets[statId];
    if (!preset) return;

    // Clamp to min/max
    value = Math.max(preset.min, Math.min(preset.max, value));

    // If point-buy is enabled, check if we have enough points
    if (totalStatPoints) {
      const currentValue = customStats[statId];
      const delta = value - currentValue;
      
      if (delta > 0 && pointsRemaining !== null && pointsRemaining < delta) {
        // Not enough points
        return;
      }
    }

    setCustomStats(prev => ({ ...prev, [statId]: value }));
  };

  // Get selected profile
  const selectedProfile = profiles.find(p => p.id === selectedProfileId);

  // Handle completion
  const handleComplete = () => {
    let finalStats: Record<string, number> = {};
    let finalInventory: string[] = [];
    let finalVariables: Record<string, any> = {};

    if (selectedTab === 'profiles' && selectedProfile) {
      // Use profile data
      finalStats = { ...selectedProfile.stats };
      finalInventory = [...selectedProfile.inventory];
      finalVariables = { ...selectedProfile.variables };
    } else {
      // Use custom slider stats
      finalStats = { ...customStats };
      finalInventory = playerConfig?.startingItems || [];
      finalVariables = playerConfig?.startingVariables || {};
    }

    const name = allowCustomName && playerName ? playerName : 'Adventurer';
    onComplete(name, finalStats, finalInventory, finalVariables);
  };

  // Validation
  const canProceed = useMemo(() => {
    if (selectedTab === 'profiles') {
      return selectedProfile !== null;
    } else {
      // Check point-buy is valid
      if (pointsRemaining !== null && pointsRemaining !== 0) {
        return false;
      }
      return availableStats.length > 0;
    }
  }, [selectedTab, selectedProfile, pointsRemaining, availableStats]);

  const title = gamebookData.meta?.title || gamebookData.title || 'New Adventure';
  const author = gamebookData.meta?.author;

  // Profile icons
  const profileIcons: Record<string, any> = {
    warrior: Shield,
    fighter: Swords,
    mage: Wand2,
    wizard: Wand2,
    rogue: User,
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif font-bold text-foreground">{title}</h1>
          {author && (
            <p className="text-muted-foreground">by {author}</p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Create Your Character
            </CardTitle>
            <CardDescription>
              {creationMode === 'sliders' && 'Customize your character stats'}
              {creationMode === 'profiles' && 'Choose a character profile'}
              {creationMode === 'both' && 'Choose a profile or customize your stats'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Player Name */}
            {allowCustomName && (
              <div className="space-y-2">
                <Label htmlFor="playerName">Character Name</Label>
                <Input
                  id="playerName"
                  placeholder="Enter your character's name..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>
            )}

            {/* Creation Mode Tabs */}
            {creationMode === 'both' ? (
              <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'sliders' | 'profiles')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="sliders">
                    <Settings2 className="h-4 w-4 mr-2" />
                    Custom Stats
                  </TabsTrigger>
                  <TabsTrigger value="profiles">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Profiles
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="sliders" className="space-y-4 mt-4">
                  {renderSliders()}
                </TabsContent>
                
                <TabsContent value="profiles" className="space-y-4 mt-4">
                  {renderProfiles()}
                </TabsContent>
              </Tabs>
            ) : creationMode === 'profiles' ? (
              renderProfiles()
            ) : (
              renderSliders()
            )}

            <Button 
              className="w-full" 
              size="lg"
              onClick={handleComplete}
              disabled={!canProceed}
            >
              Begin Adventure
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Render custom stat sliders
  function renderSliders() {
    if (availableStats.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No stats available for customization
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {totalStatPoints && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Stat Points</span>
            <span className={`text-lg font-bold ${pointsRemaining === 0 ? 'text-green-600 dark:text-green-400' : pointsRemaining! < 0 ? 'text-destructive' : 'text-foreground'}`}>
              {pointsRemaining} / {totalStatPoints}
            </span>
          </div>
        )}
        
        <div className="space-y-4">
          {availableStats.map(statId => {
            const preset = statPresets[statId];
            const value = customStats[statId];
            
            return (
              <div key={statId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{preset.name || statId}</span>
                    {preset.description && (
                      <p className="text-xs text-muted-foreground">{preset.description}</p>
                    )}
                  </div>
                  <Badge variant="secondary">
                    {value}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <Slider
                    value={[value]}
                    min={preset.min}
                    max={preset.max}
                    step={1}
                    onValueChange={([v]) => handleStatChange(statId, v)}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Min: {preset.min}</span>
                    <span>Max: {preset.max}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {totalStatPoints && pointsRemaining !== 0 && (
          <div className={`text-sm text-center ${pointsRemaining! < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
            {pointsRemaining! < 0 ? 'You have exceeded the stat point limit!' : `You must spend all ${pointsRemaining} remaining points`}
          </div>
        )}
      </div>
    );
  }

  // Render profile selection
  function renderProfiles() {
    if (profiles.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          No character profiles available
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {profiles.map(profile => {
          const isSelected = profile.id === selectedProfileId;
          const IconComponent = profileIcons[profile.id.toLowerCase()] || User;
          
          return (
            <button
              key={profile.id}
              onClick={() => setSelectedProfileId(profile.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{profile.name}</h3>
                  {profile.description && (
                    <p className="text-sm text-muted-foreground mt-1">{profile.description}</p>
                  )}
                  
                  {/* Stats */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {Object.entries(profile.stats).map(([statId, value]) => {
                      const preset = statPresets[statId];
                      return (
                        <Badge key={statId} variant="outline" className="text-xs">
                          {preset?.name || statId}: {value}
                        </Badge>
                      );
                    })}
                  </div>
                  
                  {/* Starting Items */}
                  {profile.inventory.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Starting Items:</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.inventory.map(itemId => {
                          const item = items.find(i => i.id === itemId);
                          return (
                            <Badge key={itemId} variant="secondary" className="text-xs">
                              {item?.name || itemId}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
}