import { useState } from 'react';
import { Save, FolderOpen, Trash2, Plus, QrCode, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SaveSlot } from '@/types/gamebook';
import QRCodeLib from 'qrcode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface SaveLoadPanelProps {
  saveSlots: SaveSlot[];
  onSave: (slotId: number, name: string) => void;
  onLoad: (slot: SaveSlot) => void;
  onDelete: (slotId: number) => void;
  maxSlots: number;
  onExportSave?: (slot: SaveSlot) => string; // Returns share code
}

export function SaveLoadPanel({ saveSlots, onSave, onLoad, onDelete, maxSlots, onExportSave }: SaveLoadPanelProps) {
  const [saveName, setSaveName] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SaveSlot | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [shareCode, setShareCode] = useState('');
  const [copied, setCopied] = useState(false);

  const getNextSlotId = () => {
    const usedIds = saveSlots.map(s => s.id);
    for (let i = 1; i <= maxSlots; i++) {
      if (!usedIds.includes(i)) return i;
    }
    return 1; // Overwrite first slot if all full
  };

  const handleSave = () => {
    const slotId = getNextSlotId();
    onSave(slotId, saveName || `Save ${slotId}`);
    setSaveName('');
    setSaveDialogOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = async (slot: SaveSlot) => {
    if (!onExportSave) return;
    
    setSelectedSlot(slot);
    const code = onExportSave(slot);
    setShareCode(code);
    
    // Generate QR code
    try {
      const qrUrl = await QRCodeLib.toDataURL(code, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(qrUrl);
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
    
    setExportDialogOpen(true);
    setCopied(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${selectedSlot?.name || 'save'}-qr.png`;
    link.click();
  };

  const handleDownloadJSON = () => {
    if (!selectedSlot) return;
    
    const blob = new Blob([JSON.stringify(selectedSlot.state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedSlot.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save / Load
        </h3>
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" disabled={saveSlots.length >= maxSlots}>
              <Plus className="h-3 w-3 mr-1" />
              New Save
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Game</DialogTitle>
              <DialogDescription>
                Enter a name for your save file.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Save name..."
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            />
            <DialogFooter>
              <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {saveSlots.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No saved games</p>
      ) : (
        <div className="space-y-2">
          {saveSlots.map((slot) => (
            <div
              key={slot.id}
              className="bg-muted rounded-md p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm truncate">{slot.name}</div>
                  <div className="text-xs text-muted-foreground">{formatDate(slot.savedAt)}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-7 w-7"
                    onClick={() => onLoad(slot)}
                    title="Load"
                  >
                    <FolderOpen className="h-3 w-3" />
                  </Button>
                  {onExportSave && (
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="h-7 w-7"
                      onClick={() => handleExport(slot)}
                      title="Export/Share"
                    >
                      <QrCode className="h-3 w-3" />
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Delete">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Save?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete "{slot.name}".
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(slot.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {slot.pagePreview}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        {saveSlots.length}/{maxSlots} slots used
      </p>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export Save - {selectedSlot?.name}</DialogTitle>
            <DialogDescription>
              Share this save across your devices or with others
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* QR Code */}
            {qrCodeUrl && (
              <div className="flex flex-col items-center space-y-2">
                <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 border rounded" />
                <p className="text-xs text-muted-foreground text-center">
                  Scan with your other device
                </p>
                <Button variant="outline" size="sm" onClick={handleDownloadQR} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download QR Image
                </Button>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Share Code */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Share Code</label>
              <div className="flex gap-2">
                <Input value={shareCode} readOnly className="font-mono text-xs" />
                <Button variant="outline" size="icon" onClick={handleCopyCode}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy and paste this code on another device
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* JSON Download */}
            <Button variant="outline" onClick={handleDownloadJSON} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download as JSON File
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
