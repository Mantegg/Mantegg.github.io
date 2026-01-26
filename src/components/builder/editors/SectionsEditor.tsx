import { Section } from '@/types/gamebook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, BookOpen } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

interface SectionsEditorProps {
  sections: Section[];
  pages: Array<{ id: number | string; section?: number | string; title?: string }>;
  onUpdate: (sections: Section[]) => void;
}

export function SectionsEditor({ sections, pages, onUpdate }: SectionsEditorProps) {
  const [newSectionName, setNewSectionName] = useState('');

  const addSection = () => {
    if (newSectionName.trim()) {
      const maxId = sections.length > 0 
        ? Math.max(...sections.map(s => typeof s.id === 'number' ? s.id : parseInt(String(s.id)) || 0))
        : 0;
      
      const newSection: Section = {
        id: maxId + 1,
        name: newSectionName.trim(),
        title: newSectionName.trim(),
      };

      onUpdate([...sections, newSection]);
      setNewSectionName('');
    }
  };

  const updateSection = (id: number | string, updates: Partial<Section>) => {
    onUpdate(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteSection = (id: number | string) => {
    onUpdate(sections.filter(s => s.id !== id));
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newSections.length) {
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      onUpdate(newSections);
    }
  };

  const getPagesInSection = (sectionId: number | string) => {
    return pages.filter(p => p.section === sectionId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Sections</h2>
        <p className="text-muted-foreground">
          Organize your story into chapters or sections. Pages can be assigned to sections for better organization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Story Sections</CardTitle>
          <CardDescription>
            Sections help organize your pages into chapters, acts, or logical groups.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Section */}
          <div className="flex gap-2">
            <Input
              placeholder="Section name (e.g., Chapter 1, Prologue)"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addSection()}
            />
            <Button onClick={addSection} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Section
            </Button>
          </div>

          <Separator />

          {/* Section List */}
          <div className="space-y-2">
            {sections.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground mb-2">No sections defined yet.</p>
                <p className="text-sm text-muted-foreground">
                  Sections are optional but help organize large stories.
                </p>
              </div>
            ) : (
              sections.map((section, index) => {
                const pagesInSection = getPagesInSection(section.id);
                
                return (
                  <Card key={section.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        {/* Drag Handle */}
                        <div className="flex flex-col gap-1 pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSection(index, 'up')}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                            title="Move up"
                          >
                            <GripVertical className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSection(index, 'down')}
                            disabled={index === sections.length - 1}
                            className="h-6 w-6 p-0"
                            title="Move down"
                          >
                            <GripVertical className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Section Info */}
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">ID: {section.id}</Badge>
                              <Badge variant="secondary">
                                {pagesInSection.length} {pagesInSection.length === 1 ? 'page' : 'pages'}
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs">Section Name (ID)</Label>
                              <Input
                                value={section.name || ''}
                                onChange={(e) => updateSection(section.id, { name: e.target.value })}
                                placeholder="Section identifier"
                                className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Display Title</Label>
                              <Input
                                value={section.title || ''}
                                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                placeholder="Display title"
                                className="h-8"
                              />
                            </div>
                          </div>

                          {/* Pages in this section */}
                          {pagesInSection.length > 0 && (
                            <div className="pt-2">
                              <Label className="text-xs text-muted-foreground">Pages in this section:</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {pagesInSection.slice(0, 10).map(page => (
                                  <Badge key={page.id} variant="outline" className="text-xs">
                                    {page.title || `Page ${page.id}`}
                                  </Badge>
                                ))}
                                {pagesInSection.length > 10 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{pagesInSection.length - 10} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSection(section.id)}
                          className="h-8 w-8 p-0 text-destructive"
                          title="Delete section"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>

          {sections.length > 0 && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Assign pages to sections in the Page Editor to organize your story.
                You can also use section IDs in choice navigation with the <code className="px-1 py-0.5 bg-muted rounded text-xs">to</code> field.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">How to Use Sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <strong>1. Organize Pages:</strong>
            <p className="text-muted-foreground">Assign pages to sections in the Page Editor using the section dropdown.</p>
          </div>
          <div>
            <strong>2. Navigate by Section:</strong>
            <p className="text-muted-foreground">
              In choice navigation, use <code className="px-1 py-0.5 bg-muted rounded text-xs">to: "sectionId"</code> to jump to a section.
            </p>
          </div>
          <div>
            <strong>3. Structure Your Story:</strong>
            <p className="text-muted-foreground">
              Use sections for chapters, acts, or different story branches (e.g., "Chapter 1", "Dark Path", "Epilogue").
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
