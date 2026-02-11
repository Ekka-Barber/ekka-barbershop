import { Edit, Trash2 } from 'lucide-react';

import { motion, useReducedMotion } from '@shared/lib/motion';
import type { HRSponsor } from '@shared/types/hr.types';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';
import { Skeleton } from '@shared/ui/components/skeleton';

interface SponsorTableProps {
  sponsors: HRSponsor[];
  onEdit: (sponsor: HRSponsor) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
}

export const SponsorTable: React.FC<SponsorTableProps> = ({
  sponsors,
  onEdit,
  onDelete,
  isLoading = false,
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Card className="overflow-hidden border-[#e2ceab] bg-white/90 shadow-[0_20px_42px_-30px_rgba(82,60,28,0.45)]" dir="rtl">
      <CardHeader className="border-b border-[#f0e2c8] px-6 py-4">
        <CardTitle className="text-lg text-[#2f261b]">قائمة الكفلاء</CardTitle>
        <p className="text-sm text-[#7a684e]">
          إدارة البيانات النظامية للكفلاء وربطها بملفات الموظفين.
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        {isLoading ? (
          <div className="space-y-3 py-1">
            {[0, 1, 2].map((item) => (
              <div
                key={`sponsor-skeleton-${item}`}
                className="rounded-2xl border border-[#ead8b8] bg-gradient-to-r from-[#fffdf9] to-[#fff7ea] p-4"
              >
                <div className="space-y-3">
                  <Skeleton className="h-5 w-44 bg-[#ead4ac]/55" />
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Skeleton className="h-14 w-full rounded-xl bg-[#ead4ac]/45" />
                    <Skeleton className="h-14 w-full rounded-xl bg-[#ead4ac]/40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sponsors.length === 0 ? (
          <div className="py-8">
            <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-[#e4cda7] bg-[#fffaf1]/80 px-6 py-10 text-center">
              <h3 className="text-lg font-semibold text-[#2f261b]">لا توجد بيانات كفلاء</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#7b6850]">
                أضف بيانات الكفيل لربطها مع ملفات الموظفين وإدارة الأرقام النظامية بسهولة.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {sponsors.map((sponsor, index) => (
              <motion.div
                key={sponsor.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: shouldReduceMotion ? 0 : index * 0.05,
                  ease: 'easeOut',
                }}
                className="flex items-center justify-between rounded-2xl border border-[#ead8b8] bg-gradient-to-r from-[#fffdf9] to-[#fff7ea] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-30px_rgba(82,60,28,0.7)]"
              >
                <div className="min-w-0 flex-1">
                  <h3 className="mb-2 text-lg font-semibold text-[#2f261b]">{sponsor.name_ar}</h3>
                  <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                    <div className="rounded-xl border border-[#ebdcc2] bg-white/80 px-3 py-2">
                      <p className="mb-1 text-xs font-medium text-[#78654c]">رقم السجل التجاري</p>
                      <p className="font-mono text-[#3e3020]">{sponsor.cr_number}</p>
                    </div>
                    <div className="rounded-xl border border-[#ebdcc2] bg-white/80 px-3 py-2">
                      <p className="mb-1 text-xs font-medium text-[#78654c]">الرقم الموحد</p>
                      <p className="font-mono text-[#3e3020]">{sponsor.unified_number}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(sponsor)}
                    aria-label="تعديل الكفيل"
                    className="h-9 w-9 rounded-xl text-[#5a4830] hover:bg-[#f5e7ce]"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(sponsor.id)}
                    aria-label="حذف الكفيل"
                    className="h-9 w-9 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
