
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface AdminHeaderProps {
  onSearch?: (searchTerm: string) => void;
}

export const AdminHeader = ({ onSearch }: AdminHeaderProps) => {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b h-16 px-4 flex items-center justify-between">
      <div className="w-full md:w-1/3">
        {onSearch && (
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search..."
              className="w-full pl-10 h-9 text-sm"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <Button
          variant="outline"
          onClick={() => navigate('/customer')}
        >
          Back to Site
        </Button>
      </div>
    </header>
  );
};
