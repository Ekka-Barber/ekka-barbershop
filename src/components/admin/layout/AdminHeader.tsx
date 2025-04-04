
import { Button } from '@/components/ui/button';

export const AdminHeader = () => {
  return (
    <header className="sticky top-0 z-10 border-b p-4 bg-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
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
