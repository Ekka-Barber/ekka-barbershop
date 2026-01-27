import { useQueryClient } from "@tanstack/react-query";
import { ChevronUp, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

import { useLogout } from "@shared/hooks/auth/useLogout";
import { useToast } from "@shared/hooks/use-toast";
import { accessCodeStorage } from '@shared/lib/access-code/storage';
import { supabase } from "@shared/lib/supabase/client";
import { Button } from "@shared/ui/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/ui/components/select";

import MainLayout from "@/features/manager/components/layouts/MainLayout";
import MonthProvider from "@/features/manager/context/MonthContext";
import { EmployeesHeader } from "@/features/manager/employees/EmployeesHeader";
import { EmployeesList } from "@/features/manager/employees/EmployeesList";
import { EmployeesLoading } from "@/features/manager/employees/EmployeesLoading";
import { useEmployeeData } from "@/features/manager/hooks/useEmployeeData";
import { useMonthContext } from "@/features/manager/hooks/useMonthContext";


const Employees: React.FC = () => {
  return (
    <MonthProvider>
      <EmployeesContent />
    </MonthProvider>
  );
};

const EmployeesContent: React.FC = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { selectedMonth } = useMonthContext();
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const { employees, isLoading, branchData } = useEmployeeData(selectedMonth, selectedBranchId);
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([]);
  const logout = useLogout();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['employees'] });
      await queryClient.invalidateQueries({ queryKey: ['branch'] });
      toast({ title: "تم التحديث", description: "تم تحديث بيانات الموظفين بنجاح" });
    } catch (error) {
      console.error('Refresh error:', error);
      toast({ variant: "destructive", title: "خطأ في التحديث", description: "حدث خطأ أثناء تحديث البيانات" });
    } finally {
      setIsRefreshing(false);
    }
  }, [queryClient, toast]);



  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Load branches for super filter
  useEffect(() => {
    const loadBranches = async () => {
      const accessCode = accessCodeStorage.getManagerAccessCode();
      if (accessCode !== 'ma225') return;
      const { data } = await supabase.from('branches').select('id,name').order('name');
      if (data) setBranches(data);
    };
    loadBranches();
  }, []);

  const handleLogout = () => logout();

  if (isLoading) {
    return (
      <MainLayout>
        <EmployeesLoading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>


      <div className="px-4 md:px-6 py-4" dir="rtl">
        {/* Super branch filter */}
        {branchData?.branch_id === '__ALL__' && (
          <div className="mb-4">
            <label className="block mb-2 text-sm text-gray-700">تصفية حسب الفرع</label>
            <Select onValueChange={(v) => setSelectedBranchId(v === 'ALL' ? null : v)}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="كل الفروع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">كل الفروع</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <EmployeesHeader 
          totalEmployees={employees?.length || 0}
          onLogout={handleLogout}
          searchQuery=""
          onSearchChange={() => {}}
          isLoading={isLoading || isRefreshing}
        />
        
        {/* Refresh button for desktop */}
        <div className="flex justify-end mb-4 md:block hidden">
          <Button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-ekka-gold hover:bg-ekka-gold/90"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
        </div>
        
        <EmployeesList
          employees={employees || []}
          searchQuery=""
          onUpdate={handleRefresh}
        />

        {/* Scroll to top button */}
        <Button 
          className={`fixed bottom-6 left-6 rounded-full p-3 bg-ekka-gold/90 hover:bg-ekka-gold transition-all shadow-lg text-white ${showScrollButton ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
          size="icon"
          onClick={scrollToTop}
        >
          <ChevronUp className="h-5 w-5" />
        </Button>
      </div>
    </MainLayout>
  );
};

export default Employees;
