import { Archive, Edit, RotateCcw, Users } from 'lucide-react';

import { motion, useReducedMotion } from '@shared/lib/motion';
import type { EmployeeRole, HREmployee } from '@shared/types/hr.types';
import { Avatar } from '@shared/ui/components/avatar';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';
import { Skeleton } from '@shared/ui/components/skeleton';

interface EmployeeTableProps {
  employees: HREmployee[];
  onEdit: (employee: HREmployee) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  isLoading?: boolean;
}

const ROLE_LABELS: Record<EmployeeRole, string> = {
  manager: 'مدير',
  barber: 'حلاق',
  receptionist: 'استقبال',
  cleaner: 'تنظيف',
  massage_therapist: 'معالج مساج',
  hammam_specialist: 'متخصص حمام',
};

const formatDate = (date: string | null) => {
  if (!date) {
    return '-';
  }

  return new Date(date).toLocaleDateString('ar-SA');
};

const isEmployeeActive = (employee: HREmployee) => {
  if (employee.is_archived) {
    return false;
  }

  if (!employee.end_date) {
    return true;
  }

  return new Date(employee.end_date) >= new Date();
};

const getEmployeeDisplayName = (employee: HREmployee) => employee.name_ar || employee.name;

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onEdit,
  onDelete,
  onRestore,
  isLoading = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Card className="overflow-hidden border-[#e2ceab] bg-white/90 shadow-[0_20px_42px_-30px_rgba(82,60,28,0.45)]" dir="rtl">
      <CardHeader className="border-b border-[#f0e2c8] px-6 py-4">
        <CardTitle className="text-lg text-[#2f261b]">قائمة الموظفين</CardTitle>
        <p className="text-sm text-[#7a684e]">
          متابعة حالة الموظفين، التعديل، والأرشفة من مكان واحد.
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        {isLoading ? (
          <div className="space-y-3 py-1">
            {[0, 1, 2].map((item) => (
              <div
                key={`employee-skeleton-${item}`}
                className="rounded-2xl border border-[#ead8b8] bg-gradient-to-r from-[#fffdf9] to-[#fff7ea] p-4"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full bg-[#edd6ac]/60" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40 bg-[#ead4ac]/55" />
                    <Skeleton className="h-3 w-24 bg-[#ead4ac]/45" />
                    <Skeleton className="h-3 w-32 bg-[#ead4ac]/40" />
                  </div>
                  <div className="hidden gap-2 md:flex">
                    <Skeleton className="h-8 w-8 rounded-lg bg-[#ead4ac]/50" />
                    <Skeleton className="h-8 w-8 rounded-lg bg-[#ead4ac]/40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : employees.length === 0 ? (
          <div className="py-8">
            <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-[#e4cda7] bg-[#fffaf1]/80 px-6 py-10 text-center">
              <div className="mb-3 rounded-full border border-[#e7c78b] bg-[#fff1d5] p-3 text-[#8a6126]">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-[#2f261b]">لا يوجد موظفون حاليا</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#7b6850]">
                ابدأ بإضافة موظف جديد ليظهر في لوحة الموارد البشرية مع البيانات والصورة الشخصية.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {employees.map((employee, index) => {
              const isActive = isEmployeeActive(employee);

              return (
                <motion.div
                  key={employee.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: shouldReduceMotion ? 0 : index * 0.05,
                    ease: 'easeOut',
                  }}
                  className="flex items-center justify-between rounded-2xl border border-[#ead8b8] bg-gradient-to-r from-[#fffdf9] to-[#fff7ea] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-30px_rgba(82,60,28,0.7)]"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    {employee.photo_url ? (
                      <img
                        src={employee.photo_url}
                        alt={`صورة الموظف ${getEmployeeDisplayName(employee)}`}
                        className="h-12 w-12 rounded-[22%] border border-[#e5cc9e] object-cover shadow-[0_4px_12px_rgba(233,179,83,0.4)]"
                      />
                    ) : (
                      <Avatar
                        name={getEmployeeDisplayName(employee)}
                        size={48}
                        className="h-12 w-12 border border-[#e5cc9e]"
                      />
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="truncate font-medium">{getEmployeeDisplayName(employee)}</h3>
                        {isActive ? (
                          <Badge variant="secondary" className="text-xs">
                            نشط
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            مؤرشف
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-[#69563e]">{ROLE_LABELS[employee.role]}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {employee.email || 'بدون بريد إلكتروني'}
                      </p>
                      <p className="mt-1 text-[11px] text-[#8f7a5d]">
                        {employee.photo_url ? 'الصورة الشخصية مضافة' : 'الصورة الشخصية غير مضافة'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="hidden min-w-[120px] rounded-xl border border-[#ecdabc] bg-white/80 px-3 py-2 text-xs text-[#77644c] md:block">
                      <p className="font-semibold text-[#5f4c34]">البدء: {formatDate(employee.start_date)}</p>
                      <p className="mt-1">الانتهاء: {formatDate(employee.end_date)}</p>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(employee)}
                        aria-label="تعديل الموظف"
                        className="h-9 w-9 rounded-xl text-[#5a4830] hover:bg-[#f5e7ce]"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {employee.is_archived ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRestore?.(employee.id)}
                          disabled={!onRestore}
                          aria-label="استعادة الموظف"
                          className="h-9 w-9 rounded-xl text-green-700 hover:bg-green-50 hover:text-green-800"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(employee.id)}
                          aria-label="أرشفة الموظف"
                          className="h-9 w-9 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          <Archive className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
