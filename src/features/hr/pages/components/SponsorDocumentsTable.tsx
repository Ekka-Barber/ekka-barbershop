import {
  AlertTriangle,
  Clock,
  Download,
  Edit,
  ExternalLink,
  FileText,
  Trash2,
} from 'lucide-react';

import { motion, useReducedMotion } from '@shared/lib/motion';
import type { SponsorDocumentWithStatus } from '@shared/types/domains';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';
import { Skeleton } from '@shared/ui/components/skeleton';

interface SponsorDocumentsTableProps {
  documents: SponsorDocumentWithStatus[];
  onEdit: (document: SponsorDocumentWithStatus) => void;
  onDelete: (document: SponsorDocumentWithStatus) => void;
  isLoading?: boolean;
  sponsorName?: string;
}

const getStatusBadge = (status: 'valid' | 'expiring_soon' | 'expired', daysRemaining: number | null) => {
  switch (status) {
    case 'expired':
      return (
        <Badge className="gap-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-100">
          <AlertTriangle className="h-3 w-3" />
          منتهي
        </Badge>
      );
    case 'expiring_soon':
      return (
        <Badge className="gap-1 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-100">
          <Clock className="h-3 w-3" />
          ينتهي خلال {daysRemaining} يوم
        </Badge>
      );
    default:
      return (
        <Badge className="gap-1 rounded-lg bg-green-100 text-green-700 hover:bg-green-100">
          <FileText className="h-3 w-3" />
          ساري
        </Badge>
      );
  }
};

export const SponsorDocumentsTable: React.FC<SponsorDocumentsTableProps> = ({
  documents,
  onEdit,
  onDelete,
  isLoading = false,
  sponsorName,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const handleOpenFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className="overflow-hidden border-[#e2ceab] bg-white/90 shadow-[0_20px_42px_-30px_rgba(82,60,28,0.45)]" dir="rtl">
      <CardHeader className="border-b border-[#f0e2c8] px-6 py-4">
        <CardTitle className="text-lg text-[#2f261b]">
          {sponsorName ? `مستندات ${sponsorName}` : 'مستندات الكفلاء'}
        </CardTitle>
        <p className="text-sm text-[#7a684e]">
          إدارة المستندات الرسمية للكفلاء مع تتبع تواريخ الانتهاء.
        </p>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        {isLoading ? (
          <div className="space-y-3 py-1">
            {[0, 1, 2].map((item) => (
              <div
                key={`doc-skeleton-${item}`}
                className="rounded-2xl border border-[#ead8b8] bg-gradient-to-r from-[#fffdf9] to-[#fff7ea] p-4"
              >
                <div className="space-y-3">
                  <Skeleton className="h-5 w-44 bg-[#ead4ac]/55" />
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <Skeleton className="h-14 w-full rounded-xl bg-[#ead4ac]/45" />
                    <Skeleton className="h-14 w-full rounded-xl bg-[#ead4ac]/40" />
                    <Skeleton className="h-14 w-full rounded-xl bg-[#ead4ac]/35" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="py-8">
            <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-[#e4cda7] bg-[#fffaf1]/80 px-6 py-10 text-center">
              <FileText className="mb-3 h-12 w-12 text-[#c9a66b]" />
              <h3 className="text-lg font-semibold text-[#2f261b]">لا توجد مستندات</h3>
              <p className="mt-2 max-w-sm text-sm leading-6 text-[#7b6850]">
                أضف مستندات الكفيل مثل السجل التجاري ورخصة المحل ورمز QR.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: shouldReduceMotion ? 0 : index * 0.05,
                  ease: 'easeOut',
                }}
                className="rounded-2xl border border-[#ead8b8] bg-gradient-to-r from-[#fffdf9] to-[#fff7ea] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-30px_rgba(82,60,28,0.7)]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-[#c9a66b]" />
                      <h3 className="text-lg font-semibold text-[#2f261b]">
                        {doc.document_type.name_ar}
                      </h3>
                      {getStatusBadge(doc.status, doc.days_remaining)}
                    </div>
                    <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
                      <div className="rounded-xl border border-[#ebdcc2] bg-white/80 px-3 py-2">
                        <p className="mb-1 text-xs font-medium text-[#78654c]">اسم الملف</p>
                        <p className="truncate text-[#3e3020]">{doc.file_name}</p>
                      </div>
                      <div className="rounded-xl border border-[#ebdcc2] bg-white/80 px-3 py-2">
                        <p className="mb-1 text-xs font-medium text-[#78654c]">تاريخ الإصدار</p>
                        <p className="font-mono text-[#3e3020]">{doc.issue_date}</p>
                      </div>
                      <div className="rounded-xl border border-[#ebdcc2] bg-white/80 px-3 py-2">
                        <p className="mb-1 text-xs font-medium text-[#78654c]">تاريخ الانتهاء</p>
                        <p className="font-mono text-[#3e3020]">{doc.expiry_date}</p>
                      </div>
                    </div>
                    {doc.notes && (
                      <p className="mt-2 text-sm text-[#6f5b40]">
                        <span className="font-medium">ملاحظات:</span> {doc.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 md:flex-col">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenFile(doc.file_url)}
                      aria-label="عرض الملف"
                      className="h-9 w-9 rounded-xl text-[#5a4830] hover:bg-[#f5e7ce]"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenFile(doc.file_url)}
                      aria-label="تحميل الملف"
                      className="h-9 w-9 rounded-xl text-[#5a4830] hover:bg-[#f5e7ce]"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(doc)}
                      aria-label="تعديل المستند"
                      className="h-9 w-9 rounded-xl text-[#5a4830] hover:bg-[#f5e7ce]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(doc)}
                      aria-label="حذف المستند"
                      className="h-9 w-9 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
