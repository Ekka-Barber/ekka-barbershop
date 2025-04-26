import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Copy, FileCode, AlertCircle } from 'lucide-react';
import { FormulaPlan } from '@/lib/salary/types/salary';
import { FormulaValidator } from '@/lib/salary/utils/FormulaValidator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Editor, { useMonaco } from '@monaco-editor/react';
import { editor } from 'monaco-editor';

interface FormulaPlanJsonEditorProps {
  plan: FormulaPlan;
  onChange: (updatedPlan: FormulaPlan) => void;
}

export const FormulaPlanJsonEditor = ({ plan, onChange }: FormulaPlanJsonEditorProps) => {
  const monaco = useMonaco();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const [copied, setCopied] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [validationResults, setValidationResults] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>({ isValid: true, errors: [], warnings: [] });
  const [activeTab, setActiveTab] = useState<string>('editor');
  
  // Format for display and set initial value
  const jsonString = JSON.stringify(plan, null, 2);
  
  // Setup Monaco editor once it's loaded
  useEffect(() => {
    if (monaco) {
      // Set JSON validation options
      monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: true,
        schemas: [
          {
            uri: 'http://myserver/formula-plan-schema.json',
            fileMatch: ['*'],
            schema: {
              type: 'object',
              required: ['variables', 'steps', 'outputVariable'],
              properties: {
                variables: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                      name: { type: 'string' },
                      description: { type: 'string' },
                      defaultValue: { type: 'number' },
                      source: { type: 'string', enum: ['constant', 'employee', 'sales', 'transaction'] },
                      dataType: { type: 'string', enum: ['number', 'boolean', 'date', 'text'] },
                      path: { type: 'string' },
                      category: { type: 'string' }
                    }
                  }
                },
                steps: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['id', 'operation'],
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      description: { type: 'string' },
                      operation: {
                        oneOf: [
                          { type: 'string' },
                          { 
                            type: 'object',
                            required: ['type', 'parameters'],
                            properties: {
                              type: { type: 'string' },
                              parameters: { 
                                type: 'array'
                              }
                            }
                          }
                        ]
                      },
                      result: { type: 'string' }
                    }
                  }
                },
                outputVariable: { type: 'string' }
              }
            }
          }
        ]
      });
    }
  }, [monaco]);
  
  // Handle editor mount
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Additional editor setup
    editor.updateOptions({
      tabSize: 2,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on'
    });
  };
  
  // Copy JSON to clipboard
  const handleCopy = () => {
    const json = editorRef.current?.getValue() || jsonString;
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Copied to clipboard',
      description: 'JSON has been copied to your clipboard',
    });
  };
  
  // Apply changes from editor
  const handleApplyChanges = () => {
    try {
      const value = editorRef.current?.getValue();
      if (!value) {
        setJsonError('Editor is empty');
        return;
      }
      
      // Parse and validate JSON
      const parsedPlan = JSON.parse(value) as FormulaPlan;
      
      // Validate with FormulaValidator
      const validationResult = FormulaValidator.validateFormulaPlan(parsedPlan);
      
      // Map validation errors and warnings to string arrays
      const errors = validationResult.errors.map(err => err.message);
      const warnings = validationResult.warnings.map(warn => warn.message);
      
      setValidationResults({
        isValid: validationResult.isValid,
        errors,
        warnings
      });
      
      if (!validationResult.isValid) {
        setActiveTab('validation');
        return;
      }
      
      // Call parent onChange with validated plan
      onChange(parsedPlan);
      
      toast({
        title: 'Changes applied',
        description: 'Your formula plan has been updated',
      });
    } catch (error) {
      console.error('JSON parse error:', error);
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
      setActiveTab('validation');
    }
  };
  
  // Format the JSON in the editor
  const handleFormat = () => {
    try {
      const value = editorRef.current?.getValue();
      if (!value) return;
      
      const parsedJson = JSON.parse(value);
      const formatted = JSON.stringify(parsedJson, null, 2);
      
      editorRef.current?.setValue(formatted);
      
      toast({
        title: 'JSON formatted',
        description: 'Your formula JSON has been properly formatted',
      });
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'Invalid JSON');
      setActiveTab('validation');
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Formula JSON Editor</CardTitle>
            <CardDescription>
              Advanced editing of formula JSON structure
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={handleCopy}
            >
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={handleFormat}
            >
              <FileCode className="h-4 w-4 mr-1" />
              Format
            </Button>
            <Button 
              size="sm"
              className="h-8 px-3"
              onClick={handleApplyChanges}
            >
              <Check className="h-4 w-4 mr-1" />
              Apply Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="validation" className="relative">
              Validation
              {(jsonError || validationResults.errors.length > 0) && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  !
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="mt-0">
            <div className="border rounded-md overflow-hidden">
              <Editor
                height="500px"
                defaultLanguage="json"
                defaultValue={jsonString}
                onMount={handleEditorDidMount}
                options={{
                  readOnly: false,
                  minimap: { enabled: false }
                }}
                theme="vs-dark"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="validation" className="mt-0">
            <div className="space-y-4 p-4 border rounded-md">
              {jsonError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>JSON Error</AlertTitle>
                  <AlertDescription>{jsonError}</AlertDescription>
                </Alert>
              )}
              
              {!jsonError && validationResults.errors.length === 0 && validationResults.warnings.length === 0 && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <Check className="h-4 w-4" />
                  <AlertTitle>Valid Formula JSON</AlertTitle>
                  <AlertDescription>
                    Your formula JSON is valid and can be applied.
                  </AlertDescription>
                </Alert>
              )}
              
              {validationResults.errors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-red-800">Errors:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {validationResults.errors.map((error, index) => (
                      <li key={`error-${index}`} className="text-sm text-red-600">
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {validationResults.warnings.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-amber-800">Warnings:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {validationResults.warnings.map((warning, index) => (
                      <li key={`warning-${index}`} className="text-sm text-amber-600">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 