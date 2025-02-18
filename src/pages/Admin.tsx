
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceCategoryList from '@/components/admin/ServiceCategoryList';
import { FileManagement } from '@/components/admin/FileManagement';
import QRCodeManager from "@/components/admin/QRCodeManager";
import { UpsellVisualization } from "@/components/admin/service-management/UpsellVisualization";

const Admin = () => {
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="w-full flex flex-col sm:grid sm:grid-cols-3 gap-2 sm:gap-0 h-auto sm:h-10">
            <TabsTrigger 
              value="services"
              className="w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Services & Categories
            </TabsTrigger>
            <TabsTrigger 
              value="files"
              className="w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              File Management
            </TabsTrigger>
            <TabsTrigger 
              value="qr"
              className="w-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              QR Code Links
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="space-y-8 mt-6">
            <ServiceCategoryList />
            <UpsellVisualization />
          </TabsContent>
          
          <TabsContent value="files">
            <FileManagement />
          </TabsContent>

          <TabsContent value="qr">
            <QRCodeManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
