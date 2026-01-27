import { useState } from 'react';
import { Upload, QrCode, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GamebookData } from '@/types/gamebook';
import { Html5Qrcode } from 'html5-qrcode';

interface SaveLoadStartScreenProps {
  gamebookData: GamebookData;
  onStartNew: () => void;
  onLoadSave: (saveData: any) => void;
}

export function SaveLoadStartScreen({ gamebookData, onStartNew, onLoadSave }: SaveLoadStartScreenProps) {
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleImportCode = () => {
    setError(null);
    
    try {
      // Try to decode the share code
      const decoded = decodeShareCode(importCode.trim());
      
      // Validate story ID matches
      if (decoded.storyId !== gamebookData.meta?.storyId) {
        setError('This save is for a different story. Please load the correct story first.');
        return;
      }
      
      // Load the save
      onLoadSave(decoded.saveData);
      setShowImportDialog(false);
    } catch (err) {
      setError('Invalid save code. Please check and try again.');
      console.error('Import error:', err);
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    
    try {
      const text = await file.text();
      const decoded = JSON.parse(text);
      
      // Validate story ID
      if (decoded.storyId !== gamebookData.meta?.storyId) {
        setError('This save is for a different story.');
        return;
      }
      
      onLoadSave(decoded.saveData);
      setShowImportDialog(false);
    } catch (err) {
      setError('Failed to read save file.');
      console.error('File import error:', err);
    }
  };

  const startQRScan = async () => {
    setIsScanning(true);
    setError(null);
    
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      
      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // Stop scanning
          html5QrCode.stop().then(() => {
            setIsScanning(false);
            setShowQRScanner(false);
            
            // Process the QR code
            try {
              const decoded = decodeShareCode(decodedText);
              
              if (decoded.storyId !== gamebookData.meta?.storyId) {
                setError('This save is for a different story.');
                return;
              }
              
              onLoadSave(decoded.saveData);
              setShowImportDialog(false);
            } catch (err) {
              setError('Invalid QR code.');
            }
          });
        },
        (errorMessage) => {
          // Ignore scan errors (just means no QR code detected yet)
        }
      );
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      setIsScanning(false);
      console.error('QR scan error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif font-bold text-foreground">
            {gamebookData.meta?.title || 'Interactive Gamebook'}
          </h1>
          <p className="text-muted-foreground text-lg">
            by {gamebookData.meta?.author || 'Unknown Author'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Start New Game */}
          <Card className="hover:border-primary transition-colors cursor-pointer" onClick={onStartNew}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5" />
                Start New Game
              </CardTitle>
              <CardDescription>
                Begin a fresh adventure from the beginning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Create your character and start your journey
              </p>
            </CardContent>
          </Card>

          {/* Import Save */}
          <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => setShowImportDialog(true)}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Save
              </CardTitle>
              <CardDescription>
                Continue from a previous save
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Load save via QR code, share code, or file
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Import Save</DialogTitle>
              <DialogDescription>
                Choose how you want to import your save
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* QR Code Scanner */}
              {showQRScanner ? (
                <div className="space-y-4">
                  <div id="qr-reader" className="w-full"></div>
                  <Button variant="outline" className="w-full" onClick={() => {
                    setShowQRScanner(false);
                    setIsScanning(false);
                  }}>
                    Cancel Scan
                  </Button>
                </div>
              ) : (
                <>
                  {/* QR Scan Button */}
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={startQRScan}
                    disabled={isScanning}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Scan QR Code
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  {/* Share Code Input */}
                  <div className="space-y-2">
                    <Label htmlFor="share-code">Paste Share Code</Label>
                    <Input
                      id="share-code"
                      placeholder="EGBK-XXXX-XXXX-XXXX"
                      value={importCode}
                      onChange={(e) => setImportCode(e.target.value)}
                    />
                    <Button className="w-full" onClick={handleImportCode} disabled={!importCode.trim()}>
                      Import from Code
                    </Button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="file-import">Upload Save File</Label>
                    <Input
                      id="file-import"
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                    />
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Helper function to decode share codes
function decodeShareCode(code: string): { storyId: string; saveData: any } {
  // Remove prefix and dashes
  const cleaned = code.replace(/^EGBK[:-]?/i, '').replace(/-/g, '');
  
  // Try direct JSON parse first (for file imports)
  if (code.startsWith('{')) {
    return JSON.parse(code);
  }
  
  // Decompress from base64
  const LZString = require('lz-string');
  const decompressed = LZString.decompressFromBase64(cleaned);
  
  if (!decompressed) {
    throw new Error('Failed to decompress save data');
  }
  
  return JSON.parse(decompressed);
}
