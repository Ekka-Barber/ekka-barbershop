import { useState, useRef } from 'react';
import { FormulaStep } from '@/lib/salary/types/salary';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  DragHandleDots2Icon 
} from '@radix-ui/react-icons';
import { 
  GripVertical, 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  AlertCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Alert,
  AlertDescription 
} from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface DraggableStepListProps {
  steps: FormulaStep[];
  validationErrors?: {[stepId: string]: string[]};
  onStepChange: (updatedSteps: FormulaStep[]) => void;
  onEditStep: (stepId: string) => void;
  onDeleteStep: (stepId: string) => void;
}

export const DraggableStepList = ({
  steps,
  validationErrors = {},
  onStepChange,
  onEditStep,
  onDeleteStep
}: DraggableStepListProps) => {
  const [draggedStep, setDraggedStep] = useState<FormulaStep | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  // Move step up or down in the list
  const moveStep = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === steps.length - 1)) {
      return;
    }
    
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the steps
    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    
    onStepChange(newSteps);
  };
  
  // Check if a step has validation errors
  const hasErrors = (stepId: string): boolean => {
    return !!validationErrors[stepId] && validationErrors[stepId].length > 0;
  };
  
  // Get validation errors for a step
  const getErrors = (stepId: string): string[] => {
    return validationErrors[stepId] || [];
  };
  
  // Handle drag start
  const handleDragStart = (e: React.DragEvent, step: FormulaStep) => {
    setDraggedStep(step);
    // Add some styling to show what's being dragged
    e.currentTarget.classList.add('opacity-50');
  };
  
  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedStep(null);
    setDragOverIndex(null);
    e.currentTarget.classList.remove('opacity-50');
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedStep && dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };
  
  // Handle drop
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (!draggedStep) return;
    
    const draggedIndex = steps.findIndex(s => s.id === draggedStep.id);
    if (draggedIndex === targetIndex) return;
    
    // Create new array and move the step
    const newSteps = [...steps];
    newSteps.splice(draggedIndex, 1);
    newSteps.splice(targetIndex, 0, draggedStep);
    
    onStepChange(newSteps);
    setDraggedStep(null);
    setDragOverIndex(null);
  };
  
  // Helper to get the type of operation as a string
  const getOperationType = (step: FormulaStep): string => {
    if (typeof step.operation === 'string') {
      return 'Variable Reference';
    }
    
    if (typeof step.operation === 'number') {
      return 'Constant';
    }
    
    if (typeof step.operation === 'object' && step.operation !== null) {
      return step.operation.type.charAt(0).toUpperCase() + step.operation.type.slice(1);
    }
    
    return 'Unknown';
  };
  
  return (
    <div className="space-y-4">
      {steps.length === 0 ? (
        <div className="text-center p-8 border border-dashed rounded-md text-muted-foreground">
          No steps yet. Add a step to build your formula.
        </div>
      ) : (
        steps.map((step, index) => (
          <div 
            key={step.id}
            className={cn(
              "relative transition-all",
              dragOverIndex === index ? "translate-y-2" : ""
            )}
            draggable
            onDragStart={(e) => handleDragStart(e, step)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
          >
            <Card className={cn(
              "border shadow-sm hover:shadow-md transition-all",
              hasErrors(step.id) ? "border-red-300" : "",
              dragOverIndex === index ? "border-blue-300" : ""
            )}>
              <CardHeader className="py-3 px-4 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center">
                  <div className="mr-2 cursor-move">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="font-medium flex items-center">
                      {step.name}
                      {hasErrors(step.id) && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <AlertCircle className="h-4 w-4 text-red-500 ml-2" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                {getErrors(step.id).map((error, i) => (
                                  <div key={i}>{error}</div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getOperationType(step)}
                      </Badge>
                      {step.result && (
                        <span className="text-xs">
                          Result: <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{step.result}</code>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => moveStep(index, 'up')}
                    disabled={index === 0}
                    className="h-7 w-7"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => moveStep(index, 'down')}
                    disabled={index === steps.length - 1}
                    className="h-7 w-7"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onEditStep(step.id)}
                    className="h-7 w-7"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onDeleteStep(step.id)}
                    className="h-7 w-7 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="py-2 px-4">
                {step.description ? (
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground">No description</p>
                )}
              </CardContent>
            </Card>
          </div>
        ))
      )}
    </div>
  );
}; 