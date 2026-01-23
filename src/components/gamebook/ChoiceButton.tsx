import { ChevronRight, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Choice } from '@/types/gamebook';

interface ChoiceButtonProps {
  choice: Choice;
  canChoose: boolean;
  requirements?: string[];
  hasInput?: boolean;
  onClick: () => void;
}

export function ChoiceButton({ choice, canChoose, requirements = [], hasInput, onClick }: ChoiceButtonProps) {
  const isLocked = !canChoose;
  const showRequirements = isLocked && requirements.length > 0;

  const button = (
    <Button
      variant="outline"
      className={`w-full justify-between text-left h-auto py-4 px-5 font-normal transition-all ${
        isLocked ? 'opacity-60' : 'hover:bg-accent'
      }`}
      disabled={isLocked}
      onClick={onClick}
    >
      <span className="flex-1">{choice.text}</span>
      {isLocked ? (
        <Lock className="h-4 w-4 ml-2 flex-shrink-0 text-muted-foreground" />
      ) : (
        <ChevronRight className="h-4 w-4 ml-2 flex-shrink-0" />
      )}
    </Button>
  );

  if (showRequirements) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{button}</div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-1">
              {requirements.map((req, i) => (
                <p key={i} className="text-sm">{req}</p>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
}
