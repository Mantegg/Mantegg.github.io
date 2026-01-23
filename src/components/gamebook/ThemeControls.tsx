import { Sun, Moon, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/contexts/ThemeContext';

const PRESET_GRADIENTS = [
  { name: 'Default', value: null },
  { name: 'Ocean', value: 'linear-gradient(135deg, hsl(200 80% 10%), hsl(210 70% 20%), hsl(220 60% 25%))' },
  { name: 'Forest', value: 'linear-gradient(135deg, hsl(140 50% 10%), hsl(150 40% 18%), hsl(160 35% 22%))' },
  { name: 'Sunset', value: 'linear-gradient(135deg, hsl(20 70% 15%), hsl(35 60% 20%), hsl(50 50% 25%))' },
  { name: 'Mystic', value: 'linear-gradient(135deg, hsl(270 60% 12%), hsl(280 50% 18%), hsl(290 40% 22%))' },
  { name: 'Midnight', value: 'linear-gradient(135deg, hsl(220 80% 8%), hsl(230 70% 12%), hsl(240 60% 16%))' },
];

export function ThemeControls() {
  const { mode, toggleMode, backgroundGradient, setBackgroundGradient, defaultGradient } = useTheme();

  const gradients = defaultGradient
    ? [{ name: 'Story Default', value: defaultGradient }, ...PRESET_GRADIENTS]
    : PRESET_GRADIENTS;

  return (
    <div className="flex items-center gap-2">
      {/* Quick Dark/Light Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleMode}
        title={mode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {mode === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      {/* Gradient Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="icon" title="Theme Settings">
            <Palette className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="font-medium">Dark Mode</Label>
              <Switch
                id="dark-mode"
                checked={mode === 'dark'}
                onCheckedChange={(checked) => toggleMode()}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-medium">Background</Label>
              <div className="grid grid-cols-3 gap-2">
                {gradients.map((gradient) => (
                  <button
                    key={gradient.name}
                    onClick={() => setBackgroundGradient(gradient.value)}
                    className={`
                      h-10 rounded border-2 transition-all text-[10px] font-medium
                      ${backgroundGradient === gradient.value
                        ? 'border-primary ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50'
                      }
                    `}
                    style={{
                      background: gradient.value || 'hsl(var(--background))',
                      color: gradient.value ? 'white' : 'hsl(var(--foreground))',
                    }}
                    title={gradient.name}
                  >
                    {gradient.name.length <= 7 ? gradient.name : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
