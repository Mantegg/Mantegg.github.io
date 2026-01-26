import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Sparkles, Upload, FolderOpen } from 'lucide-react';

interface StartDialogProps {
  open: boolean;
  onClose: () => void;
  onStartBlank: () => void;
  onStartTemplate: () => void;
  onImport: () => void;
  hasUnsavedWork: boolean;
  onLoadUnsaved: () => void;
}

export const StartDialog = ({
  open,
  onClose,
  onStartBlank,
  onStartTemplate,
  onImport,
  hasUnsavedWork,
  onLoadUnsaved,
}: StartDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Your Story</DialogTitle>
          <DialogDescription>
            Choose how you want to start building your interactive gamebook
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {hasUnsavedWork && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <FolderOpen className="h-5 w-5" />
                  Continue Previous Project
                </CardTitle>
                <CardDescription>
                  You have unsaved work from a previous session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={onLoadUnsaved} className="w-full" size="lg">
                  Load Previous Work
                </Button>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={onStartBlank}>
              <CardHeader>
                <FileText className="h-10 w-10 mb-2 text-muted-foreground" />
                <CardTitle className="text-lg">Blank Story</CardTitle>
                <CardDescription className="text-sm">
                  Start from scratch with an empty template
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={onStartTemplate}>
              <CardHeader>
                <Sparkles className="h-10 w-10 mb-2 text-muted-foreground" />
                <CardTitle className="text-lg">Use Template</CardTitle>
                <CardDescription className="text-sm">
                  Start with a pre-made story structure
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="cursor-pointer hover:border-primary transition-colors" onClick={onImport}>
              <CardHeader>
                <Upload className="h-10 w-10 mb-2 text-muted-foreground" />
                <CardTitle className="text-lg">Import JSON</CardTitle>
                <CardDescription className="text-sm">
                  Upload an existing story file to edit
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
