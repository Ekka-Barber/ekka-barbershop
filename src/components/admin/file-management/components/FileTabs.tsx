
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FileTabsProps {
  activeTab: string;
  handleTabChange: (value: string) => void;
  fileCounts: {
    menu: number;
    offers: number;
    total: number;
  };
}

export const FileTabs = ({ activeTab, handleTabChange, fileCounts }: FileTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList>
          <TabsTrigger value="all" className="relative" onClick={(e) => e.preventDefault()}>
            All Files
            <span className="ml-1 text-xs bg-muted rounded-full w-5 h-5 inline-flex items-center justify-center">
              {fileCounts.total}
            </span>
          </TabsTrigger>
          <TabsTrigger value="menu" className="relative" onClick={(e) => e.preventDefault()}>
            Menu
            <span className="ml-1 text-xs bg-muted rounded-full w-5 h-5 inline-flex items-center justify-center">
              {fileCounts.menu}
            </span>
          </TabsTrigger>
          <TabsTrigger value="offers" className="relative" onClick={(e) => e.preventDefault()}>
            Offers
            <span className="ml-1 text-xs bg-muted rounded-full w-5 h-5 inline-flex items-center justify-center">
              {fileCounts.offers}
            </span>
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
};
