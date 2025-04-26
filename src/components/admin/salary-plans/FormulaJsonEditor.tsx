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
            variables: [],
            steps: [],
            outputVariable: "totalSalary"
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
      
      if (!Array.isArray(parsed.steps)) {
        setError("Formula must contain a 'steps' array");
        return false;
      }
      
      if (!Array.isArray(parsed.variables)) {
        setError("Formula must contain a 'variables' array");
        return false;
      }
      
      if (!parsed.outputVariable) {
        setError("Formula must specify an outputVariable");
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
    <div className="space-y-4 px-1">
      <div className="space-y-3">
        <Textarea
          value={jsonValue}
          onChange={(e) => handleJsonChange(e.target.value)}
          className="font-mono text-xs sm:text-sm w-full min-h-[300px] sm:min-h-[400px] h-[50vh] sm:h-[60vh] resize-y"
          placeholder="Enter formula JSON configuration..."
        />
        
        {error && (
          <Alert variant="destructive" className="text-xs sm:text-sm">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Invalid JSON</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {isValid && !error && (
          <Alert className="bg-green-50 border-green-200 text-xs sm:text-sm">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle className="text-green-700">Valid JSON</AlertTitle>
            <AlertDescription className="text-green-600">
              The formula JSON is correctly formatted
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="flex justify-end mt-4">
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