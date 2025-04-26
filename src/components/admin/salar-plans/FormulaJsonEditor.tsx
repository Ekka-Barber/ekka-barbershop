import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormulaPlan } from "@/lib/salary/types/salary";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FormulaJsonEditorProps {
  initialValue: FormulaPlan | undefined;
  onSave: (formula: FormulaPlan) => Promise<void>;
}

export const FormulaJsonEditor = ({
  initialValue,
  onSave,
}: FormulaJsonEditorProps) => {
  const [jsonValue, setJsonValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialValue) {
      setJsonValue(JSON.stringify(initialValue, null, 2));
      setIsValid(true);
    } else {
      setJsonValue(
        JSON.stringify(
          {
            type: "formula",
            steps: [],
          },
          null,
          2
        )
      );
      setIsValid(true);
    }
  }, [initialValue]);

  const validateJson = (value: string): boolean => {
    try {
      const parsed = JSON.parse(value);
      
      // Basic validation for FormulaPlan structure
      if (typeof parsed !== "object") {
        setError("JSON must be an object");
        return false;
      }
      
      if (parsed.type !== "formula") {
        setError("Formula must have type 'formula'");
        return false;
      }
      
      if (!Array.isArray(parsed.steps)) {
        setError("Formula must contain a 'steps' array");
        return false;
      }
      
      setError(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
      return false;
    }
  };

  const handleJsonChange = (value: string) => {
    setJsonValue(value);
    const valid = validateJson(value);
    setIsValid(valid);
  };

  const handleSave = async () => {
    if (!isValid) return;
    
    try {
      setIsLoading(true);
      const formulaData = JSON.parse(jsonValue) as FormulaPlan;
      await onSave(formulaData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error saving formula");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          value={jsonValue}
          onChange={(e) => handleJsonChange(e.target.value)}
          className="font-mono min-h-[400px] text-sm"
          placeholder="Enter formula JSON configuration..."
        />
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invalid JSON</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isValid && !error && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Valid JSON</AlertTitle>
            <AlertDescription className="text-green-600">
              The formula JSON is correctly formatted
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!isValid || isLoading}
          className="w-full sm:w-auto"
        >
          {isLoading ? "Saving..." : "Save Formula"}
        </Button>
      </div>
    </div>
  );
}; 
