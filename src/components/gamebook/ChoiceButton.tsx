import { ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Choice } from '@/types/gamebook';

interface ChoiceButtonProps {
  choice: Choice;
  canChoose: boolean;
  onClick: () => void;
}

export function ChoiceButton({ choice, canChoose, onClick }: ChoiceButtonProps) {
  return (
    <Button
      variant="outline"
      className="w-full justify-between text-left h-auto py-4 px-5 font-normal"
      disabled={!canChoose}
      onClick={onClick}
    >
      <span className="flex-1">{choice.text}</span>
      {canChoose ? (
        <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
      ) : (
        <Lock className="h-4 w-4 ml-2 flex-shrink-0 text-muted-foreground" />
      )}
    </Button>
  );
}
