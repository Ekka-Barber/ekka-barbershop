
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Settings, 
  Scissors, 
  FileText, 
  Link2, 
  QrCode, 
  BarChart2,
  Users,
  Calendar,
  ChevronRight
} from "lucide-react";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isSidebarOpen: boolean;
}

const SidebarItem = ({ icon: Icon, label, isActive, onClick, isSidebarOpen }: SidebarItemProps) => {
  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 px-3 transition-all",
              isActive 
                ? "bg-accent text-accent-foreground font-medium" 
                : "hover:bg-accent/50",
              isSidebarOpen ? "text-left" : "justify-center px-3"
            )}
            onClick={onClick}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {isSidebarOpen && <span>{label}</span>}
          </Button>
        </TooltipTrigger>
        {!isSidebarOpen && (
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
};

export const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('services');
  
  // Extract the active tab from the URL or use a default
  useEffect(() => {
    const path = location.pathname.split('/').pop();
    if (path && path !== 'admin') {
      setActiveTab(path);
    } else {
      setActiveTab('services');
    }
  }, [location]);

  const navigationItems = [
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'urls', label: 'URLs', icon: Link2 },
    { id: 'qrcodes', label: 'QR Codes', icon: QrCode },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavigate = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/admin/${tabId}`);
  };

  return (
    <div 
      className={cn(
        "h-screen bg-background flex flex-col border-r transition-all duration-300 pb-4",
        isSidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex items-center h-16 px-3 border-b">
        {isSidebarOpen ? (
          <h1 className="text-lg font-semibold">
            Admin Dashboard
          </h1>
        ) : (
          <LayoutDashboard className="h-5 w-5 mx-auto" />
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navigationItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            isActive={activeTab === item.id}
            onClick={() => handleNavigate(item.id)}
            isSidebarOpen={isSidebarOpen}
          />
        ))}
      </div>
      
      <div className="px-2 mt-auto pt-4 border-t">
        <Button
          variant="ghost"
          size="icon"
          className="w-full justify-center"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <ChevronRight className={cn(
            "h-5 w-5 transition-transform",
            isSidebarOpen ? "rotate-180" : ""
          )} />
        </Button>
      </div>
    </div>
  );
};
