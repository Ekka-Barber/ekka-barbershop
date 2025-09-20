import React from 'react';
import { Home, FileText, QrCode, Layout, TrendingUp } from 'lucide-react';
import { 
  Sidebar, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { useSidebar } from '@/components/ui/sidebar/SidebarContext';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const { isMobile, setOpenMobile } = useSidebar();

  const navigationItems = [
    { id: 'services', label: 'Services', icon: <Home /> },
    { id: 'branches', label: 'Branches', icon: <Home /> },
    { id: 'files', label: 'Files', icon: <FileText /> },
    { id: 'qrcodes', label: 'QR Codes', icon: <QrCode /> },
    { id: 'ui-elements', label: 'UI Elements', icon: <Layout /> },
    { id: 'google-ads', label: 'Google Ads', icon: <TrendingUp /> },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    // On mobile, close sidebar after a brief delay for better UX
    if (isMobile) {
      setTimeout(() => setOpenMobile(false), 200);
    }
  };

  return (
    <Sidebar className="border-r bg-white">
      <div className="flex h-14 items-center border-b px-4 bg-white">
        <h2 className="text-lg font-semibold">Admin</h2>
      </div>
      <div className="flex-1 overflow-auto py-2 bg-white">
        <SidebarMenu>
          {navigationItems.map((item) => (
            <SidebarMenuItem key={item.id} className="px-2 bg-white">
              <SidebarMenuButton
                onClick={() => handleTabClick(item.id)}
                isActive={activeTab === item.id}
                tooltip={item.label}
                className={cn(
                  "font-medium transition-colors duration-200",
                  activeTab === item.id
                    ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600"
                    : "hover:bg-gray-100 text-gray-900",
                  "touch-manipulation" // Better touch handling on mobile
                )}
              >
                <span className={cn(
                  "mr-2 flex h-5 w-5 items-center justify-center",
                  activeTab === item.id ? "text-blue-700" : "text-gray-500"
                )}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </div>
    </Sidebar>
  );
}; 