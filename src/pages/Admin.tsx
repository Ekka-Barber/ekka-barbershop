import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ServiceCategoryList from '@/components/admin/ServiceCategoryList';
import { FileManagement } from '@/components/admin/FileManagement';

const Admin = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Services & Categories</TabsTrigger>
            <TabsTrigger value="files">File Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="space-y-8 mt-6">
            <ServiceCategoryList />
          </TabsContent>
          
          <TabsContent value="files">
            <FileManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;