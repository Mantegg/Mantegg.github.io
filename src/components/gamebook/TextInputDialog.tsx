import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import type { Choice } from '@/types/gamebook';

interface TextInputDialogProps {
  isOpen: boolean;
  prompt: NonNullable<Choice['prompt']>;
  onSubmit: (value: string) => void;
  onCancel: () => void;
}

export function TextInputDialog({ isOpen, prompt, onSubmit, onCancel }: TextInputDialogProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const validate = () => {
    if (prompt.validation?.required && !value.trim()) {
      setError('This field is required');
      return false;
    }

    if (prompt.validation?.minLength && value.length < prompt.validation.minLength) {
      setError(`Minimum ${prompt.validation.minLength} characters required`);
      return false;
    }

    if (prompt.validation?.maxLength && value.length > prompt.validation.maxLength) {
      setError(`Maximum ${prompt.validation.maxLength} characters allowed`);
      return false;
    }

    if (prompt.validation?.pattern) {
      try {
        const regex = new RegExp(prompt.validation.pattern);
        if (!regex.test(value)) {
          setError('Invalid format');
          return false;
        }
      } catch {
        // Invalid regex pattern, skip validation
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(value);
      setValue('');
      setError('');
    }
  };

  const handleClose = () => {
    setValue('');
    setError('');
    onCancel();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{prompt.question}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="input">Your Answer</Label>
            <Input
              id="input"
              type={prompt.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError('');
              }}
              placeholder={prompt.placeholder}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              autoFocus
            />
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          {prompt.validation && (
            <div className="text-xs text-muted-foreground space-y-1">
              {prompt.validation.required && <p>• Required field</p>}
              {prompt.validation.minLength && <p>• Minimum {prompt.validation.minLength} characters</p>}
              {prompt.validation.maxLength && <p>• Maximum {prompt.validation.maxLength} characters</p>}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
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
