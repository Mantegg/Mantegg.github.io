import { ItemDef } from '@/types/gamebook';
import { ValidationError } from '@/types/builder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ItemsEditorProps {
  items: ItemDef[];
  onAdd: (itemId: string, itemDef: ItemDef) => void;
  onUpdate: (itemId: string, updates: Partial<ItemDef>) => void;
  onDelete: (itemId: string) => void;
  errors: ValidationError[];
}

export const ItemsEditor = ({ items, onAdd, onUpdate, onDelete }: ItemsEditorProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ItemDef | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    type: 'consumable' as ItemDef['type'],
    visible: true,
    shopPrice: 0,
  });

  const openAddDialog = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      type: 'consumable',
      visible: true,
      shopPrice: 0,
    });
    setEditingItem(null);
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (item: ItemDef) => {
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description || '',
      type: item.type || 'consumable',
      visible: item.visible ?? true,
      shopPrice: item.shopPrice || 0,
    });
    setEditingItem(item);
    setIsAddDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.id.trim() || !formData.name.trim()) return;

    const itemDef: ItemDef = {
      id: formData.id.trim(),
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      type: formData.type,
      visible: formData.visible,
      shopPrice: formData.shopPrice > 0 ? formData.shopPrice : undefined,
    };

    if (editingItem) {
      onUpdate(editingItem.id, itemDef);
    } else {
      onAdd(formData.id.trim(), itemDef);
    }

    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Items</h2>
          <p className="text-muted-foreground">Define items that can appear in your story</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Edit Item' : 'Add New Item'}</DialogTitle>
              <DialogDescription>
                Define an item that players can collect or purchase
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="item-id">
                  Item ID <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="item-id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="health_potion"
                  disabled={!!editingItem}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-name">
                  Display Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="item-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Health Potion"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-desc">Description</Label>
                <Textarea
                  id="item-desc"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Restores 10 health points"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="consumable">Consumable</SelectItem>
                    <SelectItem value="key">Key</SelectItem>
                    <SelectItem value="clue">Clue</SelectItem>
                    <SelectItem value="token">Token</SelectItem>
                    <SelectItem value="flag">Flag</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="item-visible">Visible in Inventory</Label>
                <Switch
                  id="item-visible"
                  checked={formData.visible}
                  onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-price">Shop Price (optional)</Label>
                <Input
                  id="item-price"
                  type="number"
                  value={formData.shopPrice}
                  onChange={(e) => setFormData({ ...formData, shopPrice: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={!formData.id.trim() || !formData.name.trim()}>
                {editingItem ? 'Save Changes' : 'Add Item'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No items defined yet</p>
            <p className="text-sm text-muted-foreground mt-2">Click "Add Item" to create your first item</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <CardDescription className="font-mono text-xs mt-1">{item.id}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {(item.description || item.type || item.shopPrice) && (
                <CardContent className="text-sm space-y-1">
                  {item.description && (
                    <p className="text-muted-foreground">{item.description}</p>
                  )}
                  <div className="flex gap-2 flex-wrap mt-2">
                    {item.type && (
                      <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">
                        {item.type}
                      </span>
                    )}
                    {item.shopPrice && (
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                        Price: {item.shopPrice}
                      </span>
                    )}
                    {!item.visible && (
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded text-xs">
                        Hidden
                      </span>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
