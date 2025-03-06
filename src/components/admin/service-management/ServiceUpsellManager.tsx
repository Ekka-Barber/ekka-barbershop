
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from 'lucide-react';
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
        <h2 className="text-xl font-semibold">Upsell Relationships</h2>
        
        <AddUpsellDialog 
          isOpen={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          allServices={allServices}
          addUpsellMutation={addUpsellMutation}
        >
          <Button variant="outline" className="flex items-center gap-2">
            <Link className="w-4 h-4" />
            Add Upsell Relation
          </Button>
        </AddUpsellDialog>
      </div>
      
      <p className="text-muted-foreground">Manage upsell relationships between services. Only services with upsells are shown.</p>
      
      {!servicesWithUpsells || servicesWithUpsells.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-center text-muted-foreground">
            <p>No services with upsell relationships found.</p>
            <p className="text-sm mt-2">Use the "Add Upsell Relation" button to create new upsell relationships.</p>
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
