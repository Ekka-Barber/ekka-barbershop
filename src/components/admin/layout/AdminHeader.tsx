import { Button } from '@/components/ui/button';
import { ShieldAlert, Menu } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSidebar } from '@/components/ui/sidebar/SidebarContext';

export const AdminHeader = () => {
  const isMobile = useIsMobile();
  const { toggleSidebar } = useSidebar();

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
    <header className="sticky top-0 z-10 border-b bg-white p-3 sm:p-4 shadow-sm">
      <div className="mx-auto flex justify-between items-center max-w-full overflow-hidden">
        <div className="flex items-center min-w-0 flex-1">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="mr-2 md:hidden text-gray-700 hover:bg-gray-100 touch-manipulation"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}

          <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Admin Dashboard</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <ShieldAlert className="h-4 w-4 ml-2 text-amber-500 flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">Remember to handle sensitive data carefully. Only share access with authorized personnel.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {typeof branchCount === 'number' && (
            <span className="ml-3 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20 flex-shrink-0">
              {branchCount} {branchCount === 1 ? 'Branch' : 'Branches'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 ml-4">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/customer'}
            className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 text-sm sm:text-base touch-manipulation"
            size={isMobile ? "sm" : "default"}
          >
            {isMobile ? "Back" : "Back to Site"}
          </Button>
        </div>
      </div>
    </header>
  );
};
