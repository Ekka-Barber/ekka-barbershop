
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UpsellServiceList } from './upsell/UpsellServiceList';
import { AddUpsellDialog } from './upsell/AddUpsellDialog';
import { useUpsellMutations } from './upsell/useUpsellMutations';
import { useServiceUpsells } from './upsell/useServiceUpsells';

export const ServiceUpsellManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const { 
    servicesWithUpsells, 
    isLoading,
    allServices
  } = useServiceUpsells();

  const {
    addUpsellMutation,
    updateUpsellMutation,
    deleteUpsellMutation
  } = useUpsellMutations({ 
    onSuccess: () => {
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['services-with-upsells'] });
    } 
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Upsell Relationships</h2>
        <Card>
          <CardContent className="p-4">
            <Skeleton className="h-12 w-full mb-4" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Upsell Relationships</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Create relationships between services to offer discounted upsell options
          </p>
        </div>
        
        <AddUpsellDialog 
          isOpen={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          allServices={allServices}
          addUpsellMutation={addUpsellMutation}
        >
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Upsell Relation
          </Button>
        </AddUpsellDialog>
      </div>
      
      {!servicesWithUpsells || servicesWithUpsells.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mb-3">
              <Link className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No Upsell Relationships</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-4">
              Create your first upsell relationship to offer discounted services when customers purchase specific main services.
            </p>
            <AddUpsellDialog 
              isOpen={isAddDialogOpen} 
              onOpenChange={setIsAddDialogOpen}
              allServices={allServices}
              addUpsellMutation={addUpsellMutation}
            >
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create First Relationship
              </Button>
            </AddUpsellDialog>
          </CardContent>
        </Card>
      ) : (
        <UpsellServiceList 
          servicesWithUpsells={servicesWithUpsells}
          onUpdateDiscount={(id, discount) => updateUpsellMutation.mutate({ id, discount })}
          onDeleteUpsell={(id) => deleteUpsellMutation.mutate(id)}
        />
      )}
    </div>
  );
};
