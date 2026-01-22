import { useCallback, useState } from 'react';
import { Upload, FileJson, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GamebookData } from '@/types/gamebook';

interface WelcomeScreenProps {
  onLoadStory: (data: GamebookData) => void;
}

const sampleTemplate: GamebookData = {
  title: "Sample Adventure",
  pages: [
    {
      id: 1,
      text: "You stand at the entrance of a mysterious cave. The darkness within beckons you forward, while the safety of the sunlit forest lies behind.",
      choices: [
        { text: "Enter the cave", nextPageId: 2 },
        { text: "Return to the forest", nextPageId: 3 }
      ]
    },
    {
      id: 2,
      text: "Inside the cave, you discover a glowing crystal. As you approach, it pulses with an ethereal light.",
      addItems: ["Glowing Crystal"],
      statChanges: [{ name: "Magic", value: 5 }],
      choices: [
        { text: "Take the crystal", nextPageId: 4 },
        { text: "Leave it alone", nextPageId: 5 }
      ]
    },
    {
      id: 3,
      text: "You decide the cave is too dangerous. Perhaps another day. The end.",
      choices: []
    },
    {
      id: 4,
      text: "The crystal fills you with power! You've completed the adventure. The end.",
      choices: []
    },
    {
      id: 5,
      text: "You leave the crystal behind and exit the cave. Some mysteries are best left unsolved. The end.",
      choices: []
    }
  ]
};

export function WelcomeScreen({ onLoadStory }: WelcomeScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateGamebook = (data: unknown): data is GamebookData => {
    if (!data || typeof data !== 'object') return false;
    const obj = data as Record<string, unknown>;
    if (!Array.isArray(obj.pages)) return false;
    return obj.pages.every((page: unknown) => {
      if (!page || typeof page !== 'object') return false;
      const p = page as Record<string, unknown>;
      return typeof p.id === 'number' && typeof p.text === 'string' && Array.isArray(p.choices);
    });
  };

  const handleFile = useCallback((file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        if (!validateGamebook(data)) {
          setError('Invalid gamebook format. Please ensure your JSON has a "pages" array with valid page objects.');
          return;
        }
        onLoadStory(data);
      } catch {
        setError('Failed to parse JSON file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, [onLoadStory]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      handleFile(file);
    } else {
      setError('Please drop a valid JSON file.');
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const downloadTemplate = useCallback(() => {
    const blob = new Blob([JSON.stringify(sampleTemplate, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gamebook-template.json';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-serif font-bold text-foreground">Interactive Gamebook</h1>
          <p className="text-muted-foreground text-lg">Upload your story and begin your adventure</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              Load Your Story
            </CardTitle>
            <CardDescription>
              Upload a JSON file containing your gamebook pages and choices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-foreground font-medium mb-2">Drag & drop your JSON file here</p>
              <p className="text-muted-foreground text-sm mb-4">or</p>
              <label>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <Button variant="outline" asChild>
                  <span className="cursor-pointer">Browse Files</span>
                </Button>
              </label>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>JSON Format Guide</CardTitle>
            <CardDescription>Your gamebook JSON should follow this structure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
{`{
  "title": "Your Story Title",
  "pages": [
    {
      "id": 1,
      "text": "Story text here...",
      "choices": [
        { "text": "Choice 1", "nextPageId": 2 },
        { "text": "Choice 2", "nextPageId": 3 }
      ],
      "addItems": ["Sword"],
      "statChanges": [{ "name": "HP", "value": 10 }]
    }
  ]
}`}
            </pre>
            <Button variant="secondary" onClick={downloadTemplate} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download Sample Template
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
