import { Page, Choice, ItemDef, EnemyDef, PageEffects, ShopItem, ChoiceConditions } from '@/types/gamebook';
import { ValidationError } from '@/types/builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Copy, Save, Sword, ShoppingCart, Zap, Lock } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

// Helper component for editing choice effects
const ChoiceEffectsEditor = ({ choice, items, onUpdate }: { choice: Choice; items: ItemDef[]; onUpdate: (effects: PageEffects | undefined) => void }) => {
  const effects = choice.effects || {};
  const [newStatName, setNewStatName] = useState('');
  const [newStatValue, setNewStatValue] = useState('0');
  
  const addStat = () => {
    if (newStatName.trim()) {
      onUpdate({
        ...effects,
        stats: { ...(effects.stats || {}), [newStatName.trim()]: parseInt(newStatValue) || 0 }
      });
      setNewStatName('');
      setNewStatValue('0');
    }
  };

  const removeStat = (name: string) => {
    const newStats = { ...effects.stats };
    delete newStats[name];
    onUpdate({ ...effects, stats: Object.keys(newStats).length > 0 ? newStats : undefined });
  };

  const addItem = (itemId: string) => {
    onUpdate({
      ...effects,
      itemsAdd: [...(effects.itemsAdd || []), itemId]
    });
  };

  const removeAddedItem = (itemId: string) => {
    onUpdate({
      ...effects,
      itemsAdd: (effects.itemsAdd || []).filter(id => id !== itemId)
    });
  };

  const addRemovedItem = (itemId: string) => {
    onUpdate({
      ...effects,
      itemsRemove: [...(effects.itemsRemove || []), itemId]
    });
  };

  const removeRemovedItem = (itemId: string) => {
    onUpdate({
      ...effects,
      itemsRemove: (effects.itemsRemove || []).filter(id => id !== itemId)
    });
  };

  return (
    <div className="space-y-3 pl-4 border-l-2">
      {/* Stat Changes */}
      <div className="space-y-2">
        <Label className="text-sm">Stat Changes</Label>
        {effects.stats && Object.entries(effects.stats).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(effects.stats).map(([name, value]) => (
              <Badge key={name} variant="secondary" className="gap-1">
                {name}: {value > 0 ? '+' : ''}{value}
                <button onClick={() => removeStat(name)} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Stat name"
            value={newStatName}
            onChange={(e) => setNewStatName(e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Value"
            value={newStatValue}
            onChange={(e) => setNewStatValue(e.target.value)}
            className="w-24"
          />
          <Button type="button" size="sm" onClick={addStat}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Add Items */}
      <div className="space-y-2">
        <Label className="text-sm">Add Items</Label>
        {effects.itemsAdd && effects.itemsAdd.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {effects.itemsAdd.map((itemId) => (
              <Badge key={itemId} variant="default" className="gap-1">
                {items.find(i => i.id === itemId)?.name || itemId}
                <button onClick={() => removeAddedItem(itemId)} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            ))}
          </div>
        )}
        <Select onValueChange={addItem}>
          <SelectTrigger>
            <SelectValue placeholder="Add item to inventory" />
          </SelectTrigger>
          <SelectContent>
            {items.filter(item => !effects.itemsAdd?.includes(item.id)).map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Remove Items */}
      <div className="space-y-2">
        <Label className="text-sm">Remove Items</Label>
        {effects.itemsRemove && effects.itemsRemove.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {effects.itemsRemove.map((itemId) => (
              <Badge key={itemId} variant="destructive" className="gap-1">
                {items.find(i => i.id === itemId)?.name || itemId}
                <button onClick={() => removeRemovedItem(itemId)} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            ))}
          </div>
        )}
        <Select onValueChange={addRemovedItem}>
          <SelectTrigger>
            <SelectValue placeholder="Remove item from inventory" />
          </SelectTrigger>
          <SelectContent>
            {items.filter(item => !effects.itemsRemove?.includes(item.id)).map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

// Helper component for editing choice conditions
const ChoiceConditionsEditor = ({ choice, items, onUpdate }: { choice: Choice; items: ItemDef[]; onUpdate: (conditions: any) => void }) => {
  const conditions = choice.conditions || {};
  const [newStatName, setNewStatName] = useState('');
  const [newStatMin, setNewStatMin] = useState('0');

  const addStatCondition = () => {
    if (newStatName.trim()) {
      onUpdate({
        ...conditions,
        stats: { ...(conditions.stats || {}), [newStatName.trim()]: { gte: parseInt(newStatMin) || 0 } }
      });
      setNewStatName('');
      setNewStatMin('0');
    }
  };

  const removeStatCondition = (name: string) => {
    const newStats = { ...conditions.stats };
    delete newStats[name];
    onUpdate({ ...conditions, stats: Object.keys(newStats).length > 0 ? newStats : undefined });
  };

  const addItemRequirement = (itemId: string) => {
    onUpdate({
      ...conditions,
      items: [...(conditions.items || []), itemId]
    });
  };

  const removeItemRequirement = (itemId: string) => {
    onUpdate({
      ...conditions,
      items: (conditions.items || []).filter((id: string) => id !== itemId)
    });
  };

  return (
    <div className="space-y-3 pl-4 border-l-2">
      {/* Item Requirements */}
      <div className="space-y-2">
        <Label className="text-sm">Required Items</Label>
        {conditions.items && conditions.items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {conditions.items.map((itemId: string) => (
              <Badge key={itemId} variant="secondary" className="gap-1">
                {items.find(i => i.id === itemId)?.name || itemId}
                <button onClick={() => removeItemRequirement(itemId)} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            ))}
          </div>
        )}
        <Select onValueChange={addItemRequirement}>
          <SelectTrigger>
            <SelectValue placeholder="Require item" />
          </SelectTrigger>
          <SelectContent>
            {items.filter(item => !conditions.items?.includes(item.id)).map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stat Requirements */}
      <div className="space-y-2">
        <Label className="text-sm">Required Stats</Label>
        {conditions.stats && Object.entries(conditions.stats).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(conditions.stats).map(([name, condition]: [string, any]) => (
              <Badge key={name} variant="secondary" className="gap-1">
                {name} ≥ {condition.gte || condition.min || 0}
                <button onClick={() => removeStatCondition(name)} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            placeholder="Stat name"
            value={newStatName}
            onChange={(e) => setNewStatName(e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Min value"
            value={newStatMin}
            onChange={(e) => setNewStatMin(e.target.value)}
            className="w-24"
          />
          <Button type="button" size="sm" onClick={addStatCondition}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

interface PageEditorProps {
  page?: Page;
  pageId: number | string;
  pages: Page[];
  items: ItemDef[];
  enemies: EnemyDef[];
  onUpdate: (pageId: number | string, updates: Partial<Page>) => void;
  onAddChoice: (pageId: number | string, choice: Choice) => void;
  onUpdateChoice: (pageId: number | string, choiceIndex: number, updates: Partial<Choice>) => void;
  onDeleteChoice: (pageId: number | string, choiceIndex: number) => void;
  onDuplicate: (pageId: number | string) => number | string | null;
  onDelete: (pageId: number | string) => void;
  errors: ValidationError[];
}

export const PageEditor = ({
  page,
  pageId,
  pages,
  items,
  enemies,
  onUpdate,
  onAddChoice,
  onUpdateChoice,
  onDeleteChoice,
  onDuplicate,
  onDelete,
  errors,
}: PageEditorProps) => {
  const [expandedChoices, setExpandedChoices] = useState<Set<number>>(new Set());
  
  const toggleAdvanced = (index: number) => {
    setExpandedChoices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Helper function to get page preview text
  const getPagePreview = (p: Page) => {
    const title = p.title ? `${p.title} - ` : '';
    const text = p.text ? p.text.substring(0, 60).replace(/\n/g, ' ') : '';
    const preview = text.length > 60 ? text + '...' : text;
    return `Page ${p.id}${title ? ` - ${title}` : ''}${preview ? `: ${preview}` : ''}`;
  };
  
  if (!page) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Page not found</p>
      </div>
    );
  }

  const addNewChoice = () => {
    onAddChoice(pageId, {
      text: 'New choice',
      nextPageId: undefined,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Page Editor</h2>
          <p className="text-sm text-muted-foreground font-mono mt-1">ID: {pageId}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => onDuplicate(pageId)}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Page</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure? This will permanently delete this page and may break links from other pages.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(pageId)} className="bg-destructive text-destructive-foreground">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Content</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="page-title">Page Title (optional)</Label>
            <Input
              id="page-title"
              value={page.title || ''}
              onChange={(e) => onUpdate(pageId, { title: e.target.value })}
              placeholder="Optional title for this page"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page-text">
              Text Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="page-text"
              value={page.text || ''}
              onChange={(e) => onUpdate(pageId, { text: e.target.value })}
              placeholder="Enter the story text for this page..."
              rows={8}
              className="font-serif"
            />
            <p className="text-xs text-muted-foreground">
              Use \\n\\n for paragraphs. Rich text editor coming soon!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Shop Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Shop Configuration
            </CardTitle>
            <Switch
              checked={!!page.shop}
              onCheckedChange={(checked) => {
                if (checked) {
                  onUpdate(pageId, { shop: { currency: 'gold', items: [] } });
                } else {
                  onUpdate(pageId, { shop: undefined });
                }
              }}
            />
          </div>
        </CardHeader>
        {page.shop && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Currency Variable Name</Label>
              <Input
                value={page.shop.currency || ''}
                onChange={(e) => onUpdate(pageId, {
                  shop: { ...page.shop!, currency: e.target.value }
                })}
                placeholder="e.g., gold, coins, credits"
              />
              <p className="text-xs text-muted-foreground">
                The stat/variable name used as currency
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Items for Sale</Label>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    const newItem: ShopItem = { itemId: '', price: 10 };
                    onUpdate(pageId, {
                      shop: { ...page.shop!, items: [...page.shop!.items, newItem] }
                    });
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>

              {page.shop.items.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  No items for sale. Add items to create a shop.
                </p>
              ) : (
                <div className="space-y-2">
                  {page.shop.items.map((shopItem, idx) => (
                    <Card key={idx} className="bg-muted/30">
                      <CardContent className="pt-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 space-y-2">
                            <Select
                              value={shopItem.itemId || 'none'}
                              onValueChange={(value) => {
                                const updatedItems = [...page.shop!.items];
                                updatedItems[idx] = { ...updatedItems[idx], itemId: value === 'none' ? '' : value };
                                onUpdate(pageId, { shop: { ...page.shop!, items: updatedItems } });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select item" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">-- Select item --</SelectItem>
                                {items.map((item) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <div className="flex gap-2">
                              <div className="flex-1">
                                <Label className="text-xs">Price</Label>
                                <Input
                                  type="number"
                                  value={shopItem.price}
                                  onChange={(e) => {
                                    const updatedItems = [...page.shop!.items];
                                    updatedItems[idx] = { ...updatedItems[idx], price: parseInt(e.target.value) || 0 };
                                    onUpdate(pageId, { shop: { ...page.shop!, items: updatedItems } });
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <Label className="text-xs">Stock (optional)</Label>
                                <Input
                                  type="number"
                                  value={shopItem.quantity || ''}
                                  onChange={(e) => {
                                    const updatedItems = [...page.shop!.items];
                                    updatedItems[idx] = { ...updatedItems[idx], quantity: e.target.value ? parseInt(e.target.value) : undefined };
                                    onUpdate(pageId, { shop: { ...page.shop!, items: updatedItems } });
                                  }}
                                  placeholder="Unlimited"
                                />
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const updatedItems = page.shop!.items.filter((_, i) => i !== idx);
                              onUpdate(pageId, { shop: { ...page.shop!, items: updatedItems } });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Choices</CardTitle>
            <Button type="button" onClick={addNewChoice} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Choice
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!page.choices || page.choices.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">
              No choices yet. Add a choice to continue the story.
            </p>
          ) : (
            page.choices.map((choice, index) => {
              const showAdvanced = expandedChoices.has(index);
              
              return (
                <Card key={`${pageId}-choice-${index}`} className="bg-muted/50">
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm">Choice {index + 1}</h4>
                        {choice.combat && <Badge variant="destructive"><Sword className="h-3 w-3 mr-1" />Combat</Badge>}
                        {choice.conditions && <Badge variant="secondary"><Lock className="h-3 w-3 mr-1" />Conditional</Badge>}
                        {choice.effects && <Badge variant="default"><Zap className="h-3 w-3 mr-1" />Effects</Badge>}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteChoice(pageId, index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label>Choice Text <span className="text-destructive">*</span></Label>
                      <Input
                        value={choice.text || ''}
                        onChange={(e) => onUpdateChoice(pageId, index, { text: e.target.value })}
                        placeholder="Button text the player sees"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Next Page</Label>
                      <Select
                        value={String(choice.nextPageId || choice.to || 'none')}
                        onValueChange={(value) => {
                          if (value === 'none') {
                            onUpdateChoice(pageId, index, { nextPageId: undefined });
                          } else {
                            const pageIdValue = isNaN(parseInt(value)) ? value : parseInt(value);
                            onUpdateChoice(pageId, index, { nextPageId: pageIdValue as any });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select target page" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-- No destination --</SelectItem>
                          {pages.map((p) => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {getPagePreview(p)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator />

                    {/* Combat Setup */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="flex items-center gap-2">
                          <Sword className="h-4 w-4" />
                          Combat Encounter
                        </Label>
                        <Switch
                          checked={!!choice.combat}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              onUpdateChoice(pageId, index, {
                                combat: { enemyId: '', winPageId: 'none', losePageId: 'none' }
                              });
                            } else {
                              onUpdateChoice(pageId, index, { combat: undefined });
                            }
                          }}
                        />
                      </div>

                      {choice.combat && (
                        <div className="pl-6 space-y-3 pt-2 border-l-2 border-primary">
                          <div className="space-y-2">
                            <Label>Enemy</Label>
                            <Select
                              value={choice.combat.enemyId || 'none'}
                              onValueChange={(value) => onUpdateChoice(pageId, index, {
                                combat: { ...choice.combat!, enemyId: value === 'none' ? '' : value }
                              })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select enemy" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">-- Select enemy --</SelectItem>
                                {enemies.map((enemy) => (
                                  <SelectItem key={enemy.id} value={enemy.id}>
                                    {enemy.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Victory Page</Label>
                            <Select
                              value={String(choice.combat.winPageId || 'none')}
                              onValueChange={(value) => {
                                const pageIdValue = value === 'none' ? 'none' : (isNaN(parseInt(value)) ? value : parseInt(value));
                                onUpdateChoice(pageId, index, {
                                  combat: { ...choice.combat!, winPageId: pageIdValue as any }
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Page after winning" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">-- Select page --</SelectItem>
                                {pages.map((p) => (
                                  <SelectItem key={p.id} value={String(p.id)}>
                                    {getPagePreview(p)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Defeat Page</Label>
                            <Select
                              value={String(choice.combat.losePageId || 'none')}
                              onValueChange={(value) => {
                                const pageIdValue = value === 'none' ? 'none' : (isNaN(parseInt(value)) ? value : parseInt(value));
                                onUpdateChoice(pageId, index, {
                                  combat: { ...choice.combat!, losePageId: pageIdValue as any }
                                });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Page after losing" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">-- Select page --</SelectItem>
                                {pages.map((p) => (
                                  <SelectItem key={p.id} value={String(p.id)}>
                                    {getPagePreview(p)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Advanced Options Toggle */}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => toggleAdvanced(index)}
                    >
                      {showAdvanced ? 'Hide' : 'Show'} Advanced Options (Effects & Conditions)
                    </Button>

                    {showAdvanced && (
                      <div className="space-y-4 p-4 border rounded-md bg-background">
                        {/* Effects Editor */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            Effects (when choice is selected)
                          </Label>
                          <ChoiceEffectsEditor
                            choice={choice}
                            items={items}
                            onUpdate={(effects) => onUpdateChoice(pageId, index, { effects })}
                          />
                        </div>

                        <Separator />

                        {/* Conditions Editor */}
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Conditions (requirements to show/enable)
                          </Label>
                          <ChoiceConditionsEditor
                            choice={choice}
                            items={items}
                            onUpdate={(conditions) => onUpdateChoice(pageId, index, { conditions })}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button">
          <Save className="h-4 w-4 mr-2" />
          Changes Auto-Saved
        </Button>
      </div>
    </div>
  );
};
