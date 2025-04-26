
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit, Trash } from "lucide-react";
import FormulaPlanConfig, { FormulaPlanData } from '@/components/admin/salary-plans/FormulaPlanConfig';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Update Plan interface to include compatible index signature
interface Plan {
  id: string;
  name: string;
  baseAmount: number;
  formulaType: string;
  percentage: number;
  minAmount?: number;
  maxAmount?: number;
  description?: string;
  isActive: boolean;
  [key: string]: string | number | boolean | undefined;
}

interface FormulaSalaryPlanListProps {
  plans?: Plan[];
  onSavePlan?: (plan: FormulaPlanData & { id?: string }) => void;
  onDeletePlan?: (planId: string) => void;
}

const FormulaSalaryPlanList = ({
  plans = [],
  onSavePlan,
  onDeletePlan,
}: FormulaSalaryPlanListProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  const handleAddNew = () => {
    setIsCreating(true);
    setEditingPlan(null);
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setIsCreating(false);
  };

  const handleDeleteConfirm = (planId: string) => {
    setPlanToDelete(null);
    onDeletePlan?.(planId);
  };

  const handleSave = (planData: FormulaPlanData) => {
    if (editingPlan) {
      onSavePlan?.({ ...planData, id: editingPlan.id });
    } else {
      onSavePlan?.(planData);
    }
    setEditingPlan(null);
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingPlan(null);
    setIsCreating(false);
  };

  if (isCreating || editingPlan) {
    return (
      <FormulaPlanConfig
        planId={editingPlan?.id}
        defaultValues={editingPlan || {}}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Formula-based Salary Plans</h3>
        <Button onClick={handleAddNew} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" /> Add Plan
        </Button>
      </div>

      {plans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No formula plans created yet</p>
            <Button onClick={handleAddNew} variant="outline">
              Create First Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={plan.isActive ? "" : "opacity-60"}>
              <CardHeader className="pb-2">
                <CardTitle className="text-md">{plan.name}</CardTitle>
                <CardDescription>
                  Base: {plan.baseAmount.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Type:</span>
                    <span className="font-medium capitalize">{plan.formulaType}</span>
                  </div>
                  {plan.formulaType === 'percentage' && (
                    <div className="flex justify-between mb-1">
                      <span>Percentage:</span>
                      <span className="font-medium">{plan.percentage}%</span>
                    </div>
                  )}
                  {(plan.minAmount !== undefined || plan.maxAmount !== undefined) && (
                    <div className="flex justify-between">
                      <span>Range:</span>
                      <span className="font-medium">
                        {plan.minAmount !== undefined ? plan.minAmount.toLocaleString() : 'No min'} - 
                        {plan.maxAmount !== undefined ? plan.maxAmount.toLocaleString() : 'No max'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 pt-2">
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleEdit(plan)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-destructive"
                  onClick={() => setPlanToDelete(plan.id)}
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog 
        open={planToDelete !== null} 
        onOpenChange={(isOpen) => !isOpen && setPlanToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the salary plan and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => planToDelete && handleDeleteConfirm(planToDelete)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FormulaSalaryPlanList;
