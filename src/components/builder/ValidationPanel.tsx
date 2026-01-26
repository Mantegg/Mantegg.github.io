import { ValidationError } from '@/types/builder';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ValidationPanelProps {
  errors: ValidationError[];
  onSelectError: (pageId: string | undefined) => void;
}

export const ValidationPanel = ({ errors, onSelectError }: ValidationPanelProps) => {
  const errorCount = errors.filter(e => e.type === 'error').length;
  const warningCount = errors.filter(e => e.type === 'warning').length;

  return (
    <div className="h-48 bg-card border-t">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-sm">Problems</h3>
          <div className="flex items-center gap-3 text-sm">
            {errorCount > 0 && (
              <span className="flex items-center gap-1 text-destructive">
                <AlertCircle className="h-3 w-3" />
                {errorCount} error{errorCount !== 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 text-yellow-600">
                <AlertTriangle className="h-3 w-3" />
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100%-40px)]">
        <div className="p-2 space-y-1">
          {errors.map((error) => (
            <div
              key={error.id}
              className="px-3 py-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors text-sm"
              onClick={() => onSelectError(error.pageId)}
            >
              <div className="flex items-start gap-2">
                {error.type === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{error.message}</p>
                  {error.pageId && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Page: {error.pageId}
                      {error.field && ` • Field: ${error.field}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
