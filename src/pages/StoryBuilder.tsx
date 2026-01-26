import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoryBuilder } from '@/hooks/useStoryBuilder';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft, Play, Save, Download, Upload, AlertTriangle } from 'lucide-react';
import { BuilderSidebar } from '@/components/builder/BuilderSidebar';
import { FormEditor } from '@/components/builder/FormEditor';
import { VisualEditor } from '@/components/builder/VisualEditor';
import { PreviewMode } from '@/components/builder/PreviewMode';
import { ValidationPanel } from '@/components/builder/ValidationPanel';
import { StartDialog } from '@/components/builder/StartDialog';

export const StoryBuilder = () => {
  const navigate = useNavigate();
  const builder = useStoryBuilder();
  const [showStartDialog, setShowStartDialog] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const handleBack = () => {
    if (builder.state.isDirty) {
      setShowExitDialog(true);
    } else {
      navigate('/');
    }
  };

  const confirmExit = () => {
    builder.clearLocalStorage();
    navigate('/');
  };

  const handleExport = () => {
    const { data, errors, hasErrors } = builder.exportAsJSON();
    
    if (hasErrors) {
      setShowExportDialog(true);
    } else {
      doExport(data);
    }
  };

  const doExport = (data: any) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.meta?.title || 'story'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (builder.state.isDirty) {
      setShowImportDialog(true);
    } else {
      doImport();
    }
  };

  const doImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          builder.loadStory(data);
          setShowImportDialog(false);
        } catch (error) {
          console.error('Failed to import:', error);
        }
      }
    };
    input.click();
  };

  const handleSave = () => {
    builder.saveToLocalStorage();
  };

  return (
    <ThemeProvider>
      <div className="h-screen flex flex-col bg-background">
        {/* Top Bar */}
        <div className="h-14 border-b flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-lg font-semibold">{builder.state.gamebookData.meta?.title || 'Untitled Story'}</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleImport}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="default" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          <Tabs value={builder.state.mode} onValueChange={(value) => builder.setMode(value as any)} className="w-full h-full flex flex-col">
            <div className="border-b px-4 flex-shrink-0">
              <TabsList>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">
                  <Play className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="editor" className="flex-1 flex overflow-hidden m-0 data-[state=inactive]:hidden">
              <BuilderSidebar
                selectedSection={builder.state.selectedSection}
                onSelectSection={builder.setSelectedSection}
                gamebookData={builder.state.gamebookData}
                selectedPageId={builder.state.selectedPageId}
                onSelectPage={builder.setSelectedPageId}
                onAddPage={builder.addPage}
                errors={builder.state.errors}
              />
              
              <div className="flex-1 flex overflow-hidden">
                {/* Left: Form Editor */}
                <div className="w-1/2 border-r overflow-auto">
                  <FormEditor
                    section={builder.state.selectedSection}
                    gamebookData={builder.state.gamebookData}
                    selectedPageId={builder.state.selectedPageId}
                    errors={builder.state.errors}
                    onUpdateMeta={builder.updateMeta}
                    onUpdatePlayer={builder.updatePlayer}
                    onUpdatePresets={builder.updatePresets}
                    onUpdateSections={builder.updateSections}
                    onUpdatePage={builder.updatePage}
                    onAddPage={builder.addPage}
                    onDeletePage={builder.deletePage}
                    onDuplicatePage={builder.duplicatePage}
                    onAddChoice={builder.addChoice}
                    onUpdateChoice={builder.updateChoice}
                    onDeleteChoice={builder.deleteChoice}
                    onAddItem={builder.addItem}
                    onUpdateItem={builder.updateItem}
                    onDeleteItem={builder.deleteItem}
                    onAddEnemy={builder.addEnemy}
                    onUpdateEnemy={builder.updateEnemy}
                    onDeleteEnemy={builder.deleteEnemy}
                  />
                </div>

                {/* Right: Visual Editor */}
                <div className="w-1/2 overflow-hidden bg-muted/20">
                  <VisualEditor
                    gamebookData={builder.state.gamebookData}
                    selectedPageId={builder.state.selectedPageId}
                    onSelectPage={builder.setSelectedPageId}
                    onAddChoice={builder.addChoice}
                    onUpdateChoice={builder.updateChoice}
                    errors={builder.state.errors}
                  />
                </div>
              </div>

              {/* Validation Panel (bottom) */}
              {builder.state.errors.length > 0 && (
                <div className="border-t">
                  <ValidationPanel errors={builder.state.errors} onSelectError={(pageId) => builder.setSelectedPageId(pageId)} />
                </div>
              )}
            </TabsContent>

            <TabsContent value="preview" className="flex-1 flex flex-col overflow-hidden m-0 data-[state=inactive]:hidden">
              <PreviewMode
                gamebookData={builder.state.gamebookData}
                selectedPageId={builder.state.selectedPageId}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Start Dialog */}
        <StartDialog
          open={showStartDialog}
          onClose={() => setShowStartDialog(false)}
          onStartBlank={() => {
            setShowStartDialog(false);
          }}
          onStartTemplate={() => {
            // Load a template
            setShowStartDialog(false);
          }}
          onImport={() => {
            doImport();
            setShowStartDialog(false);
          }}
          hasUnsavedWork={builder.hasUnsavedWork()}
          onLoadUnsaved={() => {
            builder.loadFromLocalStorage();
            setShowStartDialog(false);
          }}
        />

        {/* Exit Confirmation Dialog */}
        <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Are you sure you want to leave? Your changes will be lost.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmExit} className="bg-destructive text-destructive-foreground">
                Leave Without Saving
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Import Warning Dialog */}
        <AlertDialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Import New Story</AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Importing a new story will discard your current work. Do you want to continue?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={doImport}>Import Anyway</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Export with Errors Dialog */}
        <AlertDialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Story Has Errors
              </AlertDialogTitle>
              <AlertDialogDescription>
                Your story has validation errors. The exported file may not work correctly. Do you want to export anyway?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                doExport(builder.state.gamebookData);
                setShowExportDialog(false);
              }}>
                Export Anyway
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ThemeProvider>
  );
};
