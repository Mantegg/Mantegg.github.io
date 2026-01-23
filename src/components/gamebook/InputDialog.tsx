import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ChoiceInput } from '@/types/gamebook';

interface InputDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  input: ChoiceInput;
  onSubmit: (correct: boolean) => void;
}

export function InputDialog({ open, onOpenChange, input, onSubmit }: InputDialogProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    let isCorrect = false;

    if (input.type === 'number') {
      const numValue = parseFloat(value);
      isCorrect = !isNaN(numValue) && numValue === input.answer;
    } else {
      // Case-insensitive string comparison
      isCorrect = value.trim().toLowerCase() === String(input.answer).toLowerCase();
    }

    if (!isCorrect) {
      setError(true);
      setTimeout(() => setError(false), 500);
    }

    setValue('');
    onSubmit(isCorrect);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Input Required
          </DialogTitle>
          <DialogDescription>
            {input.prompt}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="puzzle-input">Your Answer</Label>
            <Input
              id="puzzle-input"
              type={input.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className={error ? 'border-destructive animate-shake' : ''}
              placeholder={input.type === 'number' ? 'Enter a number...' : 'Enter your answer...'}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
