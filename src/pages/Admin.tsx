import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceCategoryList from '@/components/admin/ServiceCategoryList';
import { FileManagement } from '@/components/admin/FileManagement';
import QRCodeManager from "@/components/admin/QRCodeManager";
import NotificationManager from "@/components/admin/NotificationManager";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="services">Services & Categories</TabsTrigger>
            <TabsTrigger value="files">File Management</TabsTrigger>
            <TabsTrigger value="qr">QR Code Links</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="space-y-8 mt-6">
            <ServiceCategoryList />
          </TabsContent>
          
          <TabsContent value="files">
            <FileManagement />
          </TabsContent>

          <TabsContent value="qr">
            <QRCodeManager />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;