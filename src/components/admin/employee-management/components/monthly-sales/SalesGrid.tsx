import React from 'react';
import { SalesInputCard } from './SalesInputCard';
import { Employee } from '@/types/employee';
import { AnimatePresence, motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface SalesGridProps {
  employees: Employee[];
  salesInputs: Record<string, string>;
  onSalesChange: (employeeId: string, value: string) => void;
  selectedDate: Date;
  isLoading: boolean;
}

export const SalesGrid: React.FC<SalesGridProps> = ({
  employees,
  salesInputs,
  onSalesChange,
  selectedDate,
  isLoading
}) => {
  // Animation variants for grid items
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24 
      } 
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-card rounded-lg border shadow-sm p-4 space-y-4">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center justify-center py-10 text-center"
      >
        <div className="text-3xl font-semibold">No employees found</div>
        <p className="text-muted-foreground mt-2">
          There are no employees to display in the selected branch.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence mode="wait">
        {employees.map((employee) => (
          <motion.div 
            key={employee.id}
            variants={itemVariants}
            exit={{ opacity: 0, y: -10 }}
            layout
          >
            <SalesInputCard 
              employee={employee} 
              salesValue={salesInputs[employee.id] || ''} 
              onChange={(value) => onSalesChange(employee.id, value)}
              selectedDate={selectedDate}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

export default SalesGrid; 