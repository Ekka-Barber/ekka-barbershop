import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AdminHeader = () => {
  // Fetch branch count for status badge
  const { data: branchCount } = useQuery({
    queryKey: ['branchCount'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('branches')
        .select('*', { count: 'exact', head: true });
        
      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <header className="sticky top-0 z-10 border-b p-4 bg-white">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ShieldAlert className="h-4 w-4 ml-2 text-amber-500" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">Remember to handle sensitive data carefully. Only share access with authorized personnel.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {typeof branchCount === 'number' && (
            <span className="ml-3 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
              {branchCount} {branchCount === 1 ? 'Branch' : 'Branches'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/customer'}
          >
            Back to Site
          </Button>
        </div>
      </div>
    </header>
  );
};
