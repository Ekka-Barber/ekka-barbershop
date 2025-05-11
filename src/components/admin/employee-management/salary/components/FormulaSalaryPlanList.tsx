import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import FormulaPlanConfig from '@/components/admin/salary-plans/FormulaPlanConfig';
import { useToast } from '@/components/ui/use-toast';

const FormulaSalaryPlanList = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const handleAddNew = () => {
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  const handleSave = async () => {
    toast({
      title: "Plan created",
      description: "Your formula salary plan has been created successfully."
    });
    setIsCreating(false);
  };

  if (isCreating) {
    return (
      <FormulaPlanConfig
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
      
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10 text-center">
          <div className="max-w-md">
            <h3 className="text-xl font-semibold mb-2">New Formula Builder Available</h3>
            <p className="text-muted-foreground mb-6">
              You can now create powerful, customizable salary formulas with our new simplified formula builder.
            </p>
            <Button onClick={handleAddNew} className="mx-auto">
              <PlusCircle className="h-4 w-4 mr-2" /> Create Your First Formula Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FormulaSalaryPlanList;
