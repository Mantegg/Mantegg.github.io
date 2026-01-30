import { useCallback, useState } from 'react';
import { Upload, FileJson, Download, AlertCircle, AlertTriangle, CheckCircle, Hammer, Code2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GamebookData, ValidationError } from '@/types/gamebook';
import { validateGamebookStructure, validateGamebook } from '@/lib/gamebook-validator';
import { useNavigate } from 'react-router-dom';

interface WelcomeScreenProps {
  onLoadStory: (data: GamebookData) => void;
}

const sampleTemplate: GamebookData = {
  meta: {
    title: "The Dragon's Lair",
    author: "Demo Author",
    version: "1.0",
    storyId: "550e8400-e29b-41d4-a716-446655440999"
  },
  presets: {
    stats: {
      "health": {
        name: "Health",
        min: 1,
        max: 30,
        default: 20,
        description: "Your life force"
      },
      "attack": {
        name: "Attack",
        min: 1,
        max: 10,
        default: 5,
        description: "Your combat prowess"
      },
      "gold": {
        name: "Gold",
        min: 0,
        max: 9999,
        default: 50,
        description: "Your currency"
      }
    },
    variables: {
      "has_key": false,
      "defeated_goblin": false,
      "bought_sword": false
    }
  },
  player: {
    creationMode: "sliders",
    allowCustomName: true,
    useStats: ["health", "attack", "gold"],
    startingItems: ["torch"],
    startingVariables: {
      "has_key": false,
      "defeated_goblin": false,
      "bought_sword": false,
      "gold": 50
    }
  },
  items: [
    { id: "torch", name: "Torch", visible: true, type: "consumable", description: "Lights your way" },
    { id: "health_potion", name: "Health Potion", visible: true, type: "consumable", description: "Restores 10 health", effects: { stats: { "health": 10 } } },
    { id: "iron_sword", name: "Iron Sword", visible: true, type: "key", description: "A sturdy blade (+2 Attack)" },
    { id: "ancient_key", name: "Ancient Key", visible: true, type: "key", description: "Opens the dragon's chamber" },
    { id: "dragon_scale", name: "Dragon Scale", visible: true, type: "quest", description: "Proof of your victory" }
  ],
  enemies: [
    {
      id: "goblin",
      name: "Cave Goblin",
      health: 15,
      attack: 3,
      description: "A small but vicious creature"
    },
    {
      id: "dragon",
      name: "Ancient Dragon",
      health: 40,
      attack: 8,
      description: "A fearsome beast guarding legendary treasure"
    }
  ],
  sections: [
    { id: 0, name: "Village" },
    { id: 1, name: "The Cave" },
    { id: 2, name: "Dragon's Lair" },
    { id: 3, name: "Endings" }
  ],
  pages: [
    {
      id: 1,
      section: 0,
      title: "The Village Square",
      text: "You arrive at a small village on the edge of a dangerous mountain. The villagers speak of a dragon's treasure deep within a cave, but also of the perils that guard it.\n\nA merchant's stall stands nearby, and the dark cave entrance looms in the distance.",
      choices: [
        { text: "Visit the merchant", nextPageId: 2 },
        { text: "Enter the cave", nextPageId: 3 }
      ]
    },
    {
      id: 2,
      section: 0,
      title: "The Merchant's Stall",
      text: "The merchant greets you with a friendly smile. His wares are spread across a wooden table.",
      shop: {
        currency: "gold",
        items: [
          { itemId: "health_potion", price: 20, quantity: 3 },
          { itemId: "iron_sword", price: 30, quantity: 1 }
        ]
      },
      choices: [
        { text: "Return to village square", nextPageId: 1 },
        { text: "Head to the cave", nextPageId: 3 }
      ]
    },
    {
      id: 3,
      section: 1,
      title: "Cave Entrance",
      text: "The cave mouth yawns before you, dark and foreboding. Your torch flickers in the cold draft from within.",
      choices: [
        { text: "Venture deeper", nextPageId: 4 },
        { text: "Return to village", nextPageId: 1 }
      ]
    },
    {
      id: 4,
      section: 1,
      title: "The Goblin's Chamber",
      text: "A Cave Goblin blocks your path! It brandishes a crude dagger and snarls at you.",
      choices: [
        {
          text: "Fight the Goblin",
          combat: { 
            enemyId: "goblin",
            winPageId: 5,
            losePageId: 8
          },
          effects: { variables: { "defeated_goblin": true } }
        },
        { text: "Flee back to entrance", nextPageId: 3, effects: { stats: { "health": -2 } } }
      ]
    },
    {
      id: 5,
      section: 1,
      title: "Victory Over the Goblin",
      text: "You have defeated the Cave Goblin! Among its possessions, you find an Ancient Key.",
      effects: {
        itemsAdd: ["ancient_key"]
      },
      choices: [
        { text: "Continue deeper", nextPageId: 6 },
        { text: "Return to village to heal", nextPageId: 1 }
      ]
    },
    {
      id: 6,
      section: 1,
      title: "The Locked Door",
      text: "You reach a massive iron door covered in ancient runes. It requires a key to open.",
      choices: [
        {
          text: "Use the Ancient Key",
          nextPageId: 7,
          conditions: { items: ["ancient_key"] }
        },
        { text: "Go back", nextPageId: 3 }
      ]
    },
    {
      id: 7,
      section: 2,
      title: "The Dragon's Chamber",
      text: "The door opens with a thunderous groan. Before you lies an enormous chamber filled with gold and treasure. In the center, coiled atop a mountain of coins, sleeps the Ancient Dragon.\n\nThe dragon stirs as you enter...",
      choices: [
        {
          text: "Challenge the Dragon",
          combat: { 
            enemyId: "dragon",
            winPageId: 9,
            losePageId: 10
          },
          note: "This will be a difficult battle! Make sure you have enough health and attack power."
        },
        { text: "Retreat while you can", nextPageId: 6 }
      ]
    },
    {
      id: 8,
      section: 1,
      title: "Defeated by the Goblin",
      text: "The goblin's blade finds its mark, and you fall to the cave floor. Darkness takes you...",
      ending: { type: "soft" },
      choices: []
    },
    {
      id: 9,
      section: 3,
      title: "Dragon Slayer",
      text: "Against all odds, you have slain the Ancient Dragon! Its scales shimmer as it falls, and you claim a single Dragon Scale as proof of your incredible victory.\n\nThe treasure is yours. You are now a legend!",
      effects: {
        itemsAdd: ["dragon_scale"],
        stats: { "gold": 1000 }
      },
      ending: { type: "hard" },
      choices: []
    },
    {
      id: 10,
      section: 3,
      title: "The Dragon's Wrath",
      text: "The Ancient Dragon proves too powerful. Its flames consume you, and your adventure ends here in fire and ash...",
      ending: { type: "soft" },
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
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          setError('Failed to parse JSON file. Please check for syntax errors.');
          return;
        }
        
        // Early structure validation - fail fast with clear messages
        const structureCheck = validateGamebookStructure(data);
        if (!structureCheck.valid) {
          console.error('Structure validation failed:', structureCheck.error);
          setError(structureCheck.error || 'Invalid gamebook file.');
          return;
        }

        const gamebookData = data as GamebookData;

        // Run detailed validation
        const validation = validateGamebook(gamebookData);
        
        if (!validation.valid) {
          const errors = validation.errors.filter(e => e.type === 'error');
          console.error('Validation errors:', errors);
          setError(errors.map(e => `${e.message}${e.context ? ` (${e.context})` : ''}`).join('\n'));
          return;
        }

        // Show warnings but proceed
        const warningsList = validation.errors.filter(e => e.type === 'warning');
        if (warningsList.length > 0) {
          setWarnings(warningsList);
        }

        console.log('Loading gamebook:', gamebookData.meta?.title);
        console.log('About to call onLoadStory with:', gamebookData);
        console.log('onLoadStory function:', onLoadStory);
        onLoadStory(gamebookData);
        console.log('onLoadStory called successfully');
      } catch (err) {
        console.error('Unexpected error:', err);
        setError('An unexpected error occurred while processing the file.');
      }
    };
    reader.onerror = () => {
      console.error('FileReader error');
      setError('Failed to read the file.');
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
    if (file) {
      // Check file extension instead of MIME type (more reliable)
      if (file.name.endsWith('.json')) {
        handleFile(file);
      } else {
        setError('Please drop a valid JSON file (.json extension required).');
      }
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
    <div className="min-h-screen bg-background flex items-center justify-center p-2 sm:p-4">
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
        <Button onClick={() => navigate('/builder')} size="sm" className="gap-1 sm:gap-2 sm:text-base text-sm">
          <Hammer className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden xs:inline">Story </span>Builder
        </Button>
      </div>
      
      <div className="w-full max-w-6xl space-y-4 sm:space-y-6">
        <div className="text-center space-y-1 sm:space-y-2 pt-12 sm:pt-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-foreground">E-GameBook</h1>
          <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Upload your story and begin your adventure</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Load Story Card */}
          <Card className="h-fit">
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
                className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${
                  isDragging 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <Upload className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-2 sm:mb-4" />
                <p className="text-foreground font-medium mb-1 sm:mb-2 text-sm sm:text-base">Drag & drop your JSON file here</p>
                <p className="text-muted-foreground text-xs sm:text-sm mb-2 sm:mb-4">or</p>
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

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="secondary" onClick={downloadTemplate} className="flex-1 text-sm sm:text-base">
                  <Download className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Download </span>Template
                </Button>
                <Button variant="default" onClick={loadSampleStory} className="flex-1 text-sm sm:text-base">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Try </span>Sample Story
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* JSON Format & Preview Card */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>JSON Format & Preview</CardTitle>
              <CardDescription>View the structure or see what it looks like</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="json" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="json" className="gap-2">
                    <Code2 className="h-4 w-4" />
                    JSON
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Preview
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="json" className="space-y-3 mt-4">
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-[400px]">
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
                </TabsContent>
                
                <TabsContent value="preview" className="space-y-4 mt-4">
                  <div className="bg-muted/50 p-6 rounded-lg space-y-4 border border-border">
                    <div className="bg-background p-4 rounded-lg">
                      <p className="text-sm leading-relaxed">
                        You stand at the entrance of a <strong>mysterious cave</strong>. The darkness within beckons you forward, while the safety of the sunlit forest lies behind.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Button variant="default" className="w-full justify-start">
                        Enter the cave
                      </Button>
                      <Button variant="outline" className="w-full justify-start opacity-50 cursor-not-allowed">
                        <span>Unlock the gate</span>
                        <span className="ml-auto text-xs text-muted-foreground">Requires: Ancient Key</span>
                      </Button>
                    </div>
                    
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground text-center">
                        This is how your story will appear to readers
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
