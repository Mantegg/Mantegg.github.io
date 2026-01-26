import { useCallback, useState } from 'react';
import { Upload, FileJson, Download, AlertCircle, AlertTriangle, CheckCircle, Hammer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GamebookData, ValidationError } from '@/types/gamebook';
import { validateGamebookStructure, validateGamebook } from '@/lib/gamebook-validator';
import { useNavigate } from 'react-router-dom';

interface WelcomeScreenProps {
  onLoadStory: (data: GamebookData) => void;
}

const sampleTemplate: GamebookData = {
  meta: {
    title: "Sample Adventure",
    author: "Demo Author",
    version: "1.0",
    storyId: "550e8400-e29b-41d4-a716-446655440999"
  },
  player: {
    stats: {
      "Health": 10,
      "Luck": 5
    },
    variables: {
      "has_key": false,
      "solved_puzzle": false
    },
    startingItems: ["torch"]
  },
  items: [
    { id: "torch", name: "Torch", visible: true, type: "consumable" },
    { id: "ancient_key", name: "Ancient Key", visible: true, type: "key" }
  ],
  sections: [
    { id: 0, name: "Introduction" },
    { id: 1, name: "The Cave" },
    { id: 2, name: "Endings" }
  ],
  pages: [
    {
      id: 1,
      section: 0,
      text: "You stand at the entrance of a mysterious cave. The darkness within beckons you forward, while the safety of the sunlit forest lies behind.",
      choices: [
        { text: "Enter the cave", nextPageId: 2 },
        { text: "Return to the forest", nextPageId: 3 }
      ]
    },
    {
      id: 2,
      section: 1,
      text: "Inside the cave, you discover a puzzle inscribed on the wall. What is 7 + 8?",
      choices: [
        {
          text: "Solve the puzzle",
          input: { type: "number", prompt: "Enter your answer", answer: 15 },
          effects: { variables: { "solved_puzzle": true }, itemsAdd: ["ancient_key"] },
          nextPageId: 4,
          failurePageId: 5
        },
        { text: "Leave the cave", nextPageId: 1 }
      ]
    },
    {
      id: 3,
      section: 2,
      text: "You decide the cave is too dangerous. Perhaps another day.",
      ending: { type: "soft" },
      choices: []
    },
    {
      id: 4,
      section: 1,
      text: "The wall slides open, revealing a hidden chamber. You found an Ancient Key!",
      choices: [
        {
          text: "Enter the final chamber",
          nextPageId: 6,
          conditions: { items: ["ancient_key"] }
        },
        { text: "Return to entrance", nextPageId: 1 }
      ]
    },
    {
      id: 5,
      section: 1,
      text: "The puzzle rejects your answer. The wall remains sealed.",
      choices: [
        { text: "Try again", nextPageId: 2 },
        { text: "Leave", nextPageId: 1 }
      ]
    },
    {
      id: 6,
      section: 2,
      text: "Using the Ancient Key, you unlock the final chamber. Inside lies the treasure of ages. You have completed the adventure!",
      ending: { type: "hard" },
      choices: []
    }
  ]
};

export function WelcomeScreen({ onLoadStory }: WelcomeScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<ValidationError[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    setError(null);
    setWarnings([]);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Parse JSON
        let data: unknown;
        try {
          data = JSON.parse(content);
        } catch {
          setError('Failed to parse JSON file. Please check for syntax errors.');
          return;
        }
        
        // Early structure validation - fail fast with clear messages
        const structureCheck = validateGamebookStructure(data);
        if (!structureCheck.valid) {
          setError(structureCheck.error || 'Invalid gamebook file.');
          return;
        }

        const gamebookData = data as GamebookData;

        // Run detailed validation
        const validation = validateGamebook(gamebookData);
        
        if (!validation.valid) {
          const errors = validation.errors.filter(e => e.type === 'error');
          setError(errors.map(e => `${e.message}${e.context ? ` (${e.context})` : ''}`).join('\n'));
          return;
        }

        // Show warnings but proceed
        const warningsList = validation.errors.filter(e => e.type === 'warning');
        if (warningsList.length > 0) {
          setWarnings(warningsList);
        }

        onLoadStory(gamebookData);
      } catch {
        setError('An unexpected error occurred while processing the file.');
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
    if (file && (file.type === 'application/json' || file.name.endsWith('.json'))) {
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

  const loadSampleStory = useCallback(() => {
    onLoadStory(sampleTemplate);
  }, [onLoadStory]);

  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <Button onClick={() => navigate('/builder')} size="lg" className="gap-2">
          <Hammer className="h-5 w-5" />
          Story Builder
        </Button>
      </div>
      
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
                <AlertDescription className="whitespace-pre-wrap">{error}</AlertDescription>
              </Alert>
            )}

            {warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Warnings (story will still load):</p>
                  <ul className="text-sm list-disc list-inside">
                    {warnings.slice(0, 5).map((w, i) => (
                      <li key={i}>{w.message}</li>
                    ))}
                    {warnings.length > 5 && <li>...and {warnings.length - 5} more</li>}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" onClick={downloadTemplate} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button variant="default" onClick={loadSampleStory} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Try Sample Story
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>JSON Format (Spec v1)</CardTitle>
            <CardDescription>Author-defined stats and simple structure</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "meta": { "title": "...", "author": "...", "version": "1.0" },
  "player": {
    "stats": { "Health": 10, "Focus": 5 },
    "variables": { "flag_a": false },
    "inventory": []
  },
  "items": [
    { "id": "key", "name": "Ancient Key", "visible": true }
  ],
  "pages": [{
    "id": 1, "text": "**Bold** and _italic_ text...",
    "choices": [{
      "text": "Choice text", "nextPageId": 2,
      "effects": { "stats": { "Health": -1 }, "itemsAdd": ["key"] }
    }]
  }]
}`}
            </pre>
            <p className="text-xs text-muted-foreground">
              Stats are author-defined numeric values. Effects apply raw deltas. 
              Text supports **bold**, _italic_, and line breaks.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
