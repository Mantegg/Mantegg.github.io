import { EnemyDef } from '@/types/gamebook';
import { ValidationError } from '@/types/builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface EnemiesEditorProps {
  enemies: EnemyDef[];
  onAdd: (enemyId: string, enemyDef: EnemyDef) => void;
  onUpdate: (enemyId: string, updates: Partial<EnemyDef>) => void;
  onDelete: (enemyId: string) => void;
  errors: ValidationError[];
}

export const EnemiesEditor = ({ enemies, onAdd, onUpdate, onDelete }: EnemiesEditorProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEnemy, setEditingEnemy] = useState<EnemyDef | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    stats: {} as Record<string, number>,
  });
  const [newStatName, setNewStatName] = useState('');
  const [newStatValue, setNewStatValue] = useState('10');

  const openAddDialog = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      stats: {},
    });
    setEditingEnemy(null);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (enemy: EnemyDef) => {
    setFormData({
      id: enemy.id,
      name: enemy.name,
      description: enemy.description || '',
      stats: enemy.stats || {},
    });
    setEditingEnemy(enemy);
    setIsAddDialogOpen(true);
  };

  const addStat = () => {
    if (newStatName.trim() && !formData.stats[newStatName]) {
      setFormData({
        ...formData,
        stats: { ...formData.stats, [newStatName.trim()]: parseInt(newStatValue) || 0 },
      });
      setNewStatName('');
      setNewStatValue('10');
    }
  };

  const updateStat = (name: string, value: number) => {
    setFormData({
      ...formData,
      stats: { ...formData.stats, [name]: value },
    });
  };

  const deleteStat = (name: string) => {
    const { [name]: _, ...rest } = formData.stats;
    setFormData({ ...formData, stats: rest });
  };

  const handleSave = () => {
    if (!formData.id.trim() || !formData.name.trim()) return;

    const enemyDef: EnemyDef = {
      id: formData.id.trim(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      stats: Object.keys(formData.stats).length > 0 ? formData.stats : undefined,
    };

    if (editingEnemy) {
      onUpdate(editingEnemy.id, enemyDef);
    } else {
      onAdd(formData.id.trim(), enemyDef);
    }

    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Enemies</h2>
          <p className="text-muted-foreground">Define enemies for combat encounters</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Enemy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEnemy ? 'Edit Enemy' : 'Add New Enemy'}</DialogTitle>
              <DialogDescription>
                Define an enemy with custom stats for combat
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="enemy-id">
                  Enemy ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="enemy-id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="goblin_warrior"
                  disabled={!!editingEnemy}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enemy-name">
                  Display Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="enemy-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Goblin Warrior"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="enemy-desc">Description</Label>
                <Textarea
                  id="enemy-desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="A fierce goblin wielding a rusty sword"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Enemy Stats</Label>
                <div className="border rounded-md p-4 space-y-2">
                  {Object.entries(formData.stats).map(([name, value]) => (
                    <div key={name} className="flex items-center gap-2">
                      <div className="flex-1">
                        <Label className="text-xs">{name}</Label>
                        <Input
                          type="number"
                          value={value}
                          onChange={(e) => updateStat(name, parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteStat(name)}
                        className="mt-5"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex gap-2 pt-2 border-t">
                    <Input
                      placeholder="Stat name (e.g., SKILL)"
                      value={newStatName}
                      onChange={(e) => setNewStatName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addStat()}
                    />
                    <Input
                      type="number"
                      placeholder="Value"
                      value={newStatValue}
                      onChange={(e) => setNewStatValue(e.target.value)}
                      className="w-24"
                      onKeyDown={(e) => e.key === 'Enter' && addStat()}
                    />
                    <Button onClick={addStat} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!formData.id.trim() || !formData.name.trim()}>
                {editingEnemy ? 'Save Changes' : 'Add Enemy'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {enemies.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No enemies defined yet</p>
            <p className="text-sm text-muted-foreground mt-2">Click "Add Enemy" to create your first enemy</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {enemies.map((enemy) => (
            <Card key={enemy.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{enemy.name}</CardTitle>
                    <CardDescription className="font-mono text-xs mt-1">{enemy.id}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(enemy)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(enemy.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {(enemy.description || enemy.stats) && (
                <CardContent className="text-sm space-y-2">
                  {enemy.description && (
                    <p className="text-muted-foreground">{enemy.description}</p>
                  )}
                  {enemy.stats && Object.keys(enemy.stats).length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {Object.entries(enemy.stats).map(([stat, value]) => (
                        <span key={stat} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                          {stat}: {value}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
