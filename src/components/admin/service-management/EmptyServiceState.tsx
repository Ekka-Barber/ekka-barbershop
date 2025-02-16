
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryDialog } from "../CategoryDialog";
import { ServiceDialog } from "../ServiceDialog";

export const EmptyServiceState = () => {
  return (
    <div className="text-center py-12 space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">No Services Added Yet</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Get started by creating a category and adding services to organize your business offerings.
        </p>
      </div>
      <div className="flex justify-center gap-4">
        <CategoryDialog
          categories={[]}
          trigger={
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          }
        />
        <ServiceDialog
          categories={[]}
          trigger={
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" /> Add Service
            </Button>
          }
        />
      </div>
    </div>
  );
};
