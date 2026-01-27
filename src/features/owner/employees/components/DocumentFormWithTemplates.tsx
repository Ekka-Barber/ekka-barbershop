import { Sparkles, FileText, ArrowRight, CheckCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/components/dialog';
import { Separator } from '@shared/ui/components/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@shared/ui/components/tabs';

import { DocumentTemplates, DocumentTemplate } from '../templates';
import type {
  EmployeeDocumentWithStatus,
  Employee,
  DocumentFormData,
} from '../types';

import { DocumentForm } from './DocumentForm';


interface DocumentFormWithTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: DocumentFormData) => Promise<void>;
  editingDocument?: EmployeeDocumentWithStatus | null;
  employees: Employee[];
  isLoading?: boolean;
}

export const DocumentFormWithTemplates: React.FC<
  DocumentFormWithTemplatesProps
> = ({
  isOpen,
  onClose,
  onSubmit,
  editingDocument,
  employees,
  isLoading = false,
}) => {
  const [selectedTemplate, setSelectedTemplate] =
    useState<DocumentTemplate | null>(null);
  const [showTemplateSelector, setShowTemplateSelector] = useState(true);
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (isOpen && !editingDocument) {
      setSelectedTemplate(null);
      setShowTemplateSelector(true);
      setFormData({});
    } else if (editingDocument) {
      setShowTemplateSelector(false);
      setSelectedTemplate(null);
    }
  }, [isOpen, editingDocument]);

  const handleTemplateSelect = (template: DocumentTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      ...template.defaultValues,
      // Keep any existing form data
      ...formData,
    });
    setShowTemplateSelector(false);
  };

  const handleFormSubmit = async (submitData: DocumentFormData) => {
    await onSubmit(submitData);
    // Reset state after successful submission
    setSelectedTemplate(null);
    setShowTemplateSelector(true);
    setFormData({});
  };

  const handleSkipTemplate = () => {
    setSelectedTemplate(null);
    setShowTemplateSelector(false);
  };

  const handleBackToTemplates = () => {
    setShowTemplateSelector(true);
    setSelectedTemplate(null);
  };

  const isEditing = !!editingDocument;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            {selectedTemplate && (
              <>
                <Sparkles className="h-5 w-5 text-info" />
                {selectedTemplate.name}
              </>
            )}
            {!selectedTemplate && !isEditing && (
              <>
                <FileText className="h-5 w-5" />
                Add New Document
              </>
            )}
            {isEditing && (
              <>
                <FileText className="h-5 w-5" />
                Edit Document
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {selectedTemplate && (
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-info/10 text-info"
                >
                  Template: {selectedTemplate.category}
                </Badge>
                <span>{selectedTemplate.description}</span>
              </div>
            )}
            {!selectedTemplate &&
              !isEditing &&
              'Choose a template for standardized document creation or create a custom document'}
            {isEditing && 'Make changes to the document information'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {!isEditing && showTemplateSelector && (
            <Tabs defaultValue="templates" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="templates"
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Use Template
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Custom Document
                </TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="mt-4">
                <DocumentTemplates onTemplateSelect={handleTemplateSelect} />
              </TabsContent>

              <TabsContent value="custom" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Create Custom Document
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Create a document without using a predefined template.
                      You&apos;ll need to fill in all the required information
                      manually.
                    </p>
                    <Button onClick={handleSkipTemplate} className="w-full">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Continue with Custom Document
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}

          {(!showTemplateSelector || isEditing) && (
            <div className="space-y-4">
              {selectedTemplate && (
                <Card className="bg-info/10 border-info/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-info/15 rounded-lg">
                          {selectedTemplate.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">
                            Using Template: {selectedTemplate.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedTemplate.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-info" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleBackToTemplates}
                          className="text-info hover:text-info/80"
                        >
                          Change Template
                        </Button>
                      </div>
                    </div>

                    {selectedTemplate.requiredFields.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border/60">
                        <h4 className="text-sm font-medium text-foreground mb-2">
                          Template Requirements:
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedTemplate.requiredFields.map((field) => (
                            <Badge
                              key={field}
                              variant="outline"
                              className="text-xs bg-background text-info"
                            >
                              {field
                                .replace(/_/g, ' ')
                                .replace(/\b\w/g, (l) => l.toUpperCase())}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              <Separator />

              <DocumentForm
                open={true}
                onCancel={onClose}
                onSubmit={handleFormSubmit}
                document={editingDocument}
                employees={employees}
                isLoading={isLoading}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
