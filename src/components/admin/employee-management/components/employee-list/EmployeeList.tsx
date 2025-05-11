import React from 'react';
import { EmployeeListProps } from '../../types';
import { Pagination } from "@/components/ui/pagination";

export const EmployeeList: React.FC<EmployeeListProps> = ({ 
  employees,
  isLoading, 
  pagination,
  onEmployeeSelect,
  selectedEmployee,
  onPageChange
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No employees found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedEmployee === employee.id
                ? "bg-primary/10 border-primary"
                : "hover:bg-gray-50"
            }`}
            onClick={() => onEmployeeSelect(employee.id)}
          >
            <div className="flex items-center space-x-3">
              {employee.photo_url ? (
                <img
                  src={employee.photo_url}
                  alt={employee.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-lg font-medium">
                    {employee.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-medium">{employee.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{employee.role}</p>
              </div>
            </div>
            {employee.is_archived && (
              <div className="mt-2">
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  Archived
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default EmployeeList;
