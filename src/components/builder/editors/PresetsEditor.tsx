import { GamePresets, StatPreset, CharacterProfile } from '@/types/gamebook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, TrendingUp, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';

interface PresetsEditorProps {
  presets: GamePresets;
  items: Array<{ id: string; name: string }>; // Available items for profiles
  onUpdate: (presets: GamePresets) => void;
}

export function PresetsEditor({ presets, items, onUpdate }: PresetsEditorProps) {
  const [newStatId, setNewStatId] = useState('');
  const [newStatName, setNewStatName] = useState('');
  const [newVarName, setNewVarName] = useState('');
  const [newProfileName, setNewProfileName] = useState('');

  // === STATS ===
  const addStat = () => {
    if (newStatId.trim() && newStatName.trim() && !presets.stats?.[newStatId.trim()]) {
      onUpdate({
        ...presets,
        stats: {
          ...(presets.stats || {}),
          [newStatId.trim()]: { 
            name: newStatName.trim(),
            min: 1, 
            max: 10, 
            default: 5 
          }
        }
      });
      setNewStatId('');
      setNewStatName('');
    }
  };

  const updateStat = (id: string, field: keyof StatPreset, value: number | string) => {
    if (!presets.stats?.[id]) return;
    onUpdate({
      ...presets,
      stats: {
        ...presets.stats,
        [id]: { ...presets.stats[id], [field]: value }
      }
    });
  };

  const deleteStat = (id: string) => {
    if (!presets.stats) return;
    const newStats = { ...presets.stats };
    delete newStats[id];
    onUpdate({ ...presets, stats: newStats });
  };

  // === VARIABLES ===
  const addVariable = () => {
    if (newVarName.trim() && !presets.variables?.[newVarName.trim()]) {
      onUpdate({
        ...presets,
        variables: {
          ...(presets.variables || {}),
          [newVarName.trim()]: 0
        }
      });
      setNewVarName('');
    }
  };

  const updateVariable = (name: string, value: boolean | number | string) => {
    onUpdate({
      ...presets,
      variables: {
        ...(presets.variables || {}),
        [name]: value
      }
    });
  };

  const deleteVariable = (name: string) => {
    if (!presets.variables) return;
    const newVars = { ...presets.variables };
    delete newVars[name];
    onUpdate({ ...presets, variables: newVars });
  };

  // === PROFILES ===
  const addProfile = () => {
    if (newProfileName.trim()) {
      const newProfile: CharacterProfile = {
        id: newProfileName.trim().toLowerCase().replace(/\s+/g, '_'),
        name: newProfileName.trim(),
        stats: {},
        inventory: [],
      };
      
      onUpdate({
        ...presets,
        profiles: [...(presets.profiles || []), newProfile]
      });
      setNewProfileName('');
    }
  };

  const updateProfile = (id: string, updates: Partial<CharacterProfile>) => {
    if (!presets.profiles) return;
    onUpdate({
      ...presets,
      profiles: presets.profiles.map(p => p.id === id ? { ...p, ...updates } : p)
    });
  };

  const updateProfileStat = (profileId: string, statId: string, value: number) => {
    if (!presets.profiles) return;
    onUpdate({
      ...presets,
      profiles: presets.profiles.map(p => 
        p.id === profileId 
          ? { ...p, stats: { ...p.stats, [statId]: value } }
          : p
      )
    });
  };

  const deleteProfile = (id: string) => {
    if (!presets.profiles) return;
    onUpdate({
      ...presets,
      profiles: presets.profiles.filter(p => p.id !== id)
    });
  };

  const addItemToProfile = (profileId: string, itemId: string) => {
    if (!presets.profiles) return;
    onUpdate({
      ...presets,
      profiles: presets.profiles.map(p =>
        p.id === profileId
          ? { ...p, inventory: [...(p.inventory || []), itemId] }
          : p
      )
    });
  };

  const removeItemFromProfile = (profileId: string, itemId: string) => {
    if (!presets.profiles) return;
    onUpdate({
      ...presets,
      profiles: presets.profiles.map(p =>
        p.id === profileId
          ? { ...p, inventory: (p.inventory || []).filter(id => id !== itemId) }
          : p
      )
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Presets</h2>
        <p className="text-muted-foreground">
          Define stats, variables, and character profiles for your story.
        </p>
      </div>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">
            <TrendingUp className="h-4 w-4 mr-2" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
          <TabsTrigger value="profiles">
            <User className="h-4 w-4 mr-2" />
            Profiles
          </TabsTrigger>
        </TabsList>

        {/* STATS TAB */}
        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stat Definitions</CardTitle>
              <CardDescription>
                Define stats like Health, Strength, Magic, etc. These will be available for players and enemies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Stat */}
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Stat ID (e.g., health, strength)"
                  value={newStatId}
                  onChange={(e) => setNewStatId(e.target.value)}
                />
                <Input
                  placeholder="Display Name (e.g., Health, Strength)"
                  value={newStatName}
                  onChange={(e) => setNewStatName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addStat()}
                />
              </div>
              <Button onClick={addStat} size="sm" className="w-full">
                <Plus className="h-4 w-4 mr-1" />
                Add Stat
              </Button>

              <Separator />

              {/* Stat List */}
              <div className="space-y-3">
                {Object.entries(presets.stats || {}).map(([id, stat]) => (
                  <Card key={id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <Label className="text-xs text-muted-foreground">ID: {id}</Label>
                          <Input
                            value={stat.name}
                            onChange={(e) => updateStat(id, 'name', e.target.value)}
                            placeholder="Display name"
                            className="mt-1 mb-2"
                          />
                          <Textarea
                            value={stat.description || ''}
                            onChange={(e) => updateStat(id, 'description', e.target.value)}
                            placeholder="Optional description"
                            className="h-16 text-xs"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteStat(id)}
                          className="h-8 w-8 p-0 text-destructive ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <Label className="text-xs">Min</Label>
                          <Input
                            type="number"
                            value={stat.min}
                            onChange={(e) => updateStat(id, 'min', parseInt(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Max</Label>
                          <Input
                            type="number"
                            value={stat.max}
                            onChange={(e) => updateStat(id, 'max', parseInt(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Default</Label>
                          <Input
                            type="number"
                            value={stat.default}
                            onChange={(e) => updateStat(id, 'default', parseInt(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {Object.keys(presets.stats || {}).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No stats defined. Add your first stat above.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* VARIABLES TAB */}
        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Variable Presets</CardTitle>
              <CardDescription>
                Define global variables (booleans, numbers, or strings) for tracking story state.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Variable */}
              <div className="flex gap-2">
                <Input
                  placeholder="Variable name (e.g., questCompleted)"
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addVariable()}
                />
                <Button onClick={addVariable} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              <Separator />

              {/* Variable List */}
              <div className="space-y-2">
                {Object.entries(presets.variables || {}).map(([name, value]) => (
                  <div key={name} className="flex items-center gap-2 p-2 border rounded">
                    <Label className="flex-1 font-medium">{name}</Label>
                    <Input
                      value={String(value)}
                      onChange={(e) => {
                        const val = e.target.value;
                        // Try to parse as number or boolean
                        if (val === 'true') updateVariable(name, true);
                        else if (val === 'false') updateVariable(name, false);
                        else if (!isNaN(Number(val))) updateVariable(name, Number(val));
                        else updateVariable(name, val);
                      }}
                      className="w-32 h-8"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteVariable(name)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {Object.keys(presets.variables || {}).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No variables defined. Add your first variable above.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PROFILES TAB */}
        <TabsContent value="profiles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Character Profiles</CardTitle>
              <CardDescription>
                Create premade character profiles with preset stats and starting items (e.g., Warrior, Mage, Thief).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Profile */}
              <div className="flex gap-2">
                <Input
                  placeholder="Profile name (e.g., Warrior, Mage)"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addProfile()}
                />
                <Button onClick={addProfile} size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Profile
                </Button>
              </div>

              <Separator />

              {/* Profile List */}
              <div className="space-y-4">
                {(presets.profiles || []).map((profile) => (
                  <Card key={profile.id} className="border-2">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Input
                            value={profile.name}
                            onChange={(e) => updateProfile(profile.id, { name: e.target.value })}
                            className="font-bold text-lg mb-2"
                          />
                          <Textarea
                            value={profile.description || ''}
                            onChange={(e) => updateProfile(profile.id, { description: e.target.value })}
                            placeholder="Profile description (optional)"
                            className="h-16 text-sm"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProfile(profile.id)}
                          className="h-8 w-8 p-0 text-destructive ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Stats */}
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Stats</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(presets.stats || {}).map(([statId, stat]) => (
                            <div key={statId} className="flex items-center gap-2">
                              <Label className="text-xs flex-1">{stat.name}</Label>
                              <Input
                                type="number"
                                value={profile.stats?.[statId] || stat.default}
                                onChange={(e) => updateProfileStat(profile.id, statId, parseInt(e.target.value) || stat.default)}
                                className="h-8 w-20"
                                min={stat.min}
                                max={stat.max}
                              />
                            </div>
                          ))}
                          {Object.keys(presets.stats || {}).length === 0 && (
                            <p className="text-xs text-muted-foreground col-span-2">
                              No stats defined. Add stats in the Stats tab first.
                            </p>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Starting Items */}
                      <div>
                        <Label className="text-sm font-semibold mb-2 block">Starting Items</Label>
                        <div className="space-y-2">
                          <Select
                            onValueChange={(itemId) => addItemToProfile(profile.id, itemId)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Add item..." />
                            </SelectTrigger>
                            <SelectContent>
                              {items.filter(item => !(profile.inventory || []).includes(item.id)).map(item => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                              {items.filter(item => !(profile.inventory || []).includes(item.id)).length === 0 && (
                                <SelectItem value="_none" disabled>No items available</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                          <div className="flex flex-wrap gap-1">
                            {(profile.inventory || []).map(itemId => {
                              const item = items.find(i => i.id === itemId);
                              return (
                                <div key={itemId} className="flex items-center gap-1 bg-secondary px-2 py-1 rounded text-xs">
                                  <span>{item?.name || itemId}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeItemFromProfile(profile.id, itemId)}
                                    className="h-4 w-4 p-0 hover:bg-destructive/20"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              );
                            })}
                            {(profile.inventory || []).length === 0 && (
                              <p className="text-xs text-muted-foreground">No starting items</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(presets.profiles || []).length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground mb-2">No profiles defined yet.</p>
                    <p className="text-sm text-muted-foreground">
                      Profiles allow players to choose premade characters with preset stats and items.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
