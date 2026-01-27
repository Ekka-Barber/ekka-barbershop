
import { useMemo } from "react";
import React from "react";

import { EmployeeCard } from "@/features/manager/employees/EmployeeCard";
import { Employee, GroupedEmployees } from "@/features/manager/hooks/useEmployeeData";

interface EmployeesListProps {
  employees: Employee[] | undefined;
  searchQuery: string;
  onUpdate: () => void;
}

export const EmployeesList = React.memo<EmployeesListProps>(({ employees, searchQuery, onUpdate }) => {
  // Memoize filtered and grouped employees
  // Note: employees are already filtered for active status (not archived and no end date) at the database level
  const filteredAndGroupedEmployees = useMemo(() => {
    if (!employees || !Array.isArray(employees)) return {};

    const filtered = employees.filter(employee => {
      // Only filter by search query since active employee filtering is done at database level
      const searchLower = searchQuery.toLowerCase();
      return (
        employee.name.toLowerCase().includes(searchLower) ||
        (employee.name_ar && employee.name_ar.includes(searchQuery))
      );
    });

    return filtered.reduce((groups: GroupedEmployees, employee) => {
      const role = employee.role || 'employee';
      if (!groups[role]) {
        groups[role] = [];
      }
      groups[role].push(employee);
      return groups;
    }, {});
  }, [employees, searchQuery]);

  const getRoleTitle = useMemo(() => (role: string): string => {
    const roleTitles: Record<string, string> = {
      manager: "المدير",
      barber: "الحلاقين",
      receptionist: "موظفي الاستقبال",
      cleaner: "عمال النظافة",
      massage_therapist: "أخصائيي المساج",
      hammam_specialist: "أخصائيي الحمام"
    };
    return roleTitles[role] || role;
  }, []);

  if (Object.keys(filteredAndGroupedEmployees).length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50/50 rounded-lg border border-gray-100 shadow-inner">
        <p className="text-gray-500">
          {searchQuery 
            ? "لا يوجد موظفين مطابقين لبحثك"
            : "لا يوجد موظفين نشطين حالياً"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-8">
      {Object.entries(filteredAndGroupedEmployees).map(([role, roleEmployees]) => (
        <div key={role} className="animate-fade-in">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 border-r-4 pr-3 py-1 border-ekka-gold">
            {getRoleTitle(role)}
          </h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {roleEmployees.map((employee) => (
              <EmployeeCard 
                key={employee.id} 
                employee={employee}
                onUpdate={onUpdate}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

EmployeesList.displayName = 'EmployeesList';
