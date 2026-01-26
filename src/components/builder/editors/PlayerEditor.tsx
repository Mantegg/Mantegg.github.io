import { PlayerConfig, GamePresets, CharacterProfile } from '@/types/gamebook';
import { ValidationError } from '@/types/builder';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { User, Sliders, Info } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface PlayerEditorProps {
  player?: PlayerConfig;
  presets: GamePresets;
  items: Array<{ id: string; name: string }>;
  onUpdate: (player: PlayerConfig) => void;
  errors: ValidationError[];
}

export const PlayerEditor = ({ player, presets, items, onUpdate, errors }: PlayerEditorProps) => {
  const config = player || {};
  const availableStats = Object.keys(presets.stats || {});
  const availableProfiles = presets.profiles || [];

  const updateConfig = (updates: Partial<PlayerConfig>) => {
    onUpdate({ ...config, ...updates });
  };

  const toggleStat = (statId: string) => {
    const useStats = config.useStats || [];
    if (useStats.includes(statId)) {
      updateConfig({ useStats: useStats.filter(id => id !== statId) });
    } else {
      updateConfig({ useStats: [...useStats, statId] });
    }
  };

  const toggleItem = (itemId: string) => {
    const startingItems = config.startingItems || [];
    if (startingItems.includes(itemId)) {
      updateConfig({ startingItems: startingItems.filter(id => id !== itemId) });
    } else {
      updateConfig({ startingItems: [...startingItems, itemId] });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Player Setup</h2>
        <p className="text-muted-foreground">
          Configure how players create their characters and what they start with.
        </p>
      </div>

      {/* Character Creation Mode */}
      <Card>
        <CardHeader>
          <CardTitle>Character Creation</CardTitle>
          <CardDescription>
            Choose how players will create their characters at the start of the story.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="creation-mode" className="mb-2 block">Creation Mode</Label>
            <Select
              value={config.creationMode || 'both'}
              onValueChange={(value: any) => updateConfig({ creationMode: value })}
            >
              <SelectTrigger id="creation-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sliders">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4" />
                    <span>Sliders Only - Players assign stats manually</span>
                  </div>
                </SelectItem>
                <SelectItem value="profiles">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profiles Only - Players choose from presets</span>
                  </div>
                </SelectItem>
                <SelectItem value="both">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <Sliders className="h-4 w-4" />
                    <span>Both - Players can choose or customize</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="allow-name"
              checked={config.allowCustomName !== false}
              onCheckedChange={(checked) => updateConfig({ allowCustomName: checked })}
            />
            <Label htmlFor="allow-name" className="cursor-pointer">
              Allow players to name their character
            </Label>
          </div>

          {config.creationMode === 'sliders' || config.creationMode === 'both' ? (
            <div>
              <Label htmlFor="stat-points" className="mb-2 block">
                Total Stat Points (Optional)
              </Label>
              <Input
                id="stat-points"
                type="number"
                value={config.totalStatPoints || ''}
                onChange={(e) => updateConfig({ totalStatPoints: parseInt(e.target.value) || undefined })}
                placeholder="Leave empty for no limit"
              />
              <p className="text-xs text-muted-foreground mt-1">
                If set, players must distribute this many points across all stats.
              </p>
            </div>
          ) : null}

          {availableProfiles.length === 0 && (config.creationMode === 'profiles' || config.creationMode === 'both') && (
            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <Info className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-700 dark:text-yellow-400">No profiles defined</p>
                <p className="text-muted-foreground">
                  Go to the Presets tab and create character profiles for players to choose from.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Stats to Use</CardTitle>
          <CardDescription>
            Select which stats from presets will be available for characters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {availableStats.length > 0 ? (
            <>
              {availableStats.map((statId) => {
                const stat = presets.stats?.[statId];
                if (!stat) return null;
                const isSelected = (config.useStats || []).includes(statId);

                return (
                  <div key={statId} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`stat-${statId}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleStat(statId)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={`stat-${statId}`} className="cursor-pointer font-semibold">
                        {stat.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {stat.description || `Range: ${stat.min}-${stat.max}, Default: ${stat.default}`}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">Min: {stat.min}</Badge>
                        <Badge variant="outline" className="text-xs">Max: {stat.max}</Badge>
                        <Badge variant="secondary" className="text-xs">Default: {stat.default}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium">No stats defined</p>
                <p>Go to the Presets tab and create stats for your characters.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Starting Items */}
      <Card>
        <CardHeader>
          <CardTitle>Starting Items (Default)</CardTitle>
          <CardDescription>
            Items all players start with (unless using a profile with different items).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {items.length > 0 ? (
            <>
              {items.map((item) => {
                const isSelected = (config.startingItems || []).includes(item.id);

                return (
                  <div key={item.id} className="flex items-center space-x-3 p-2 border rounded">
                    <Checkbox
                      id={`item-${item.id}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleItem(item.id)}
                    />
                    <Label htmlFor={`item-${item.id}`} className="flex-1 cursor-pointer">
                      {item.name}
                      <span className="text-xs text-muted-foreground ml-2">({item.id})</span>
                    </Label>
                  </div>
                );
              })}
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No items available. Create items in the Items tab.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Default Profile */}
      {availableProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Default Profile (Optional)</CardTitle>
            <CardDescription>
              Profile to use if character creation is skipped or disabled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select
              value={config.defaultProfile || '_none'}
              onValueChange={(value) => updateConfig({ defaultProfile: value === '_none' ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="No default profile" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">No default profile</SelectItem>
                {availableProfiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Configuration Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>Creation Mode:</strong> {
              config.creationMode === 'sliders' ? 'Sliders (Manual)' :
              config.creationMode === 'profiles' ? 'Profiles (Presets)' :
              'Both (Player Choice)'
            }
          </div>
          <div>
            <strong>Custom Names:</strong> {config.allowCustomName !== false ? 'Allowed' : 'Disabled'}
          </div>
          <div>
            <strong>Stats Available:</strong> {(config.useStats || []).length} selected
          </div>
          <div>
            <strong>Starting Items:</strong> {(config.startingItems || []).length} items
          </div>
          {config.defaultProfile && (
            <div>
              <strong>Default Profile:</strong> {
                availableProfiles.find(p => p.id === config.defaultProfile)?.name || 'Unknown'
              }
            </div>
          )}
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm">
              {errors.map((error, i) => (
                <li key={i} className="text-destructive">{error.message}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
