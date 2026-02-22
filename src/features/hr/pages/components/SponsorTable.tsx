import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  Edit,
  ExternalLink,
  FileText,
  FileUp,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';

import { motion, AnimatePresence, useReducedMotion } from '@shared/lib/motion';
import type { SponsorDocumentType, SponsorDocumentWithStatus } from '@shared/types/domains';
import type { HRSponsor } from '@shared/types/hr.types';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/ui/components/select';
import { Skeleton } from '@shared/ui/components/skeleton';

interface SponsorTableProps {
  sponsors: HRSponsor[];
  onEdit: (sponsor: HRSponsor) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  documentTypes: SponsorDocumentType[];
  getDocumentsForSponsor: (sponsorId: string) => SponsorDocumentWithStatus[] | undefined;
  onUploadDocument: (sponsorId: string, formData: FormData) => Promise<void>;
  onDeleteDocument: (doc: SponsorDocumentWithStatus) => Promise<void>;
  isUploading: boolean;
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

export const SponsorTable: React.FC<SponsorTableProps> = ({
  sponsors,
  onEdit,
  onDelete,
  isLoading = false,
  documentTypes,
  getDocumentsForSponsor,
  onUploadDocument,
  onDeleteDocument,
  isUploading,
}) => {
  const [expandedSponsorId, setExpandedSponsorId] = useState<string | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadFormData, setUploadFormData] = useState({
    document_type_id: '',
    file: null as File | null,
    issue_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    duration_months: 12,
  });
  const shouldReduceMotion = useReducedMotion();

  const toggleExpand = (sponsorId: string) => {
    setExpandedSponsorId(expandedSponsorId === sponsorId ? null : sponsorId);
    setShowUploadForm(false);
    resetUploadForm();
  };

  const resetUploadForm = () => {
    setUploadFormData({
      document_type_id: '',
      file: null,
      issue_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      duration_months: 12,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFormData((prev) => ({ ...prev, file }));
    }
  };

  const handleSubmitUpload = async (sponsorId: string) => {
    if (!uploadFormData.file || !uploadFormData.document_type_id) return;

    const formData = new FormData();
    formData.append('file', uploadFormData.file);
    formData.append('sponsor_id', sponsorId);
    formData.append('document_type_id', uploadFormData.document_type_id);
    formData.append('issue_date', uploadFormData.issue_date);
    formData.append('expiry_date', uploadFormData.expiry_date);
    formData.append('duration_months', String(uploadFormData.duration_months));

    await onUploadDocument(sponsorId, formData);
    resetUploadForm();
    setShowUploadForm(false);
  };

  const handleDeleteDocument = async (doc: SponsorDocumentWithStatus) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستند؟')) return;
    await onDeleteDocument(doc);
  };

  const openFile = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const updateExpiryDate = (issueDate: string, months: number) => {
    const issue = new Date(issueDate);
    const expiry = new Date(issue);
    expiry.setMonth(expiry.getMonth() + months);
    return expiry.toISOString().split('T')[0];
  };

  return (
    <Card className="overflow-hidden border-[#e2ceab] bg-white/90 shadow-[0_20px_42px_-30px_rgba(82,60,28,0.45)]" dir="rtl">
      <CardHeader className="border-b border-[#f0e2c8] px-6 py-4">
        <CardTitle className="text-lg text-[#2f261b]">قائمة الكفلاء</CardTitle>
        <p className="text-sm text-[#7a684e]">
          إدارة بيانات الكفلاء ومستنداتهم الرسمية (السجل التجاري، الرخص، رمز QR) مع تتبع تواريخ الانتهاء.
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
            {sponsors.map((sponsor, index) => {
              const isExpanded = expandedSponsorId === sponsor.id;
              const documents = getDocumentsForSponsor(sponsor.id) ?? [];

              return (
                <motion.div
                  key={sponsor.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.25,
                    delay: shouldReduceMotion ? 0 : index * 0.05,
                    ease: 'easeOut',
                  }}
                  className="rounded-2xl border border-[#ead8b8] bg-gradient-to-r from-[#fffdf9] to-[#fff7ea] transition-all duration-300 hover:shadow-[0_18px_30px_-30px_rgba(82,60,28,0.7)]"
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-[#2f261b]">{sponsor.name_ar}</h3>
                        {documents.length > 0 && (
                          <Badge className="rounded-lg bg-[#e9b353]/20 text-[#9a6d2d]">
                            {documents.length} مستندات
                          </Badge>
                        )}
                        {documents.some((d) => d.status !== 'valid') && (
                          <Badge className="rounded-lg bg-red-100 text-red-700">
                                            <AlertTriangle className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
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
                        onClick={() => toggleExpand(sponsor.id)}
                        aria-label="مستندات الكفيل"
                        className="h-9 w-9 rounded-xl text-[#5a4830] hover:bg-[#f5e7ce]"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
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
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[#ead8b8] px-4 pb-4 pt-4">
                          <div className="mb-3 flex items-center justify-between">
                            <h4 className="text-sm font-semibold text-[#3e3020]">المستندات</h4>
                            <Button
                              size="sm"
                              onClick={() => setShowUploadForm(!showUploadForm)}
                              className="h-8 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
                            >
                              <FileUp className="ms-1 h-3.5 w-3.5" />
                              {showUploadForm ? 'إغلاق' : 'إضافة مستند'}
                            </Button>
                          </div>

                          {showUploadForm && (
                            <div className="mb-4 rounded-xl border border-[#d4c4a5] bg-white/60 p-4">
                              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div className="space-y-1.5">
                                  <Label className="text-xs text-[#5a4830]">نوع المستند</Label>
                                  <Select
                                    value={uploadFormData.document_type_id}
                                    onValueChange={(value) => {
                                      setUploadFormData((prev) => ({
                                        ...prev,
                                        document_type_id: value,
                                        duration_months: 12,
                                        expiry_date: updateExpiryDate(prev.issue_date, 12),
                                      }));
                                    }}
                                  >
                                    <SelectTrigger className="h-9 border-[#dcc49c] bg-white text-sm">
                                      <SelectValue placeholder="اختر النوع" />
                                    </SelectTrigger>
                                    <SelectContent dir="rtl">
                                      {documentTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                          {type.name_ar}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div className="space-y-1.5">
                                  <Label className="text-xs text-[#5a4830]">الملف</Label>
                                  <Input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={handleFileChange}
                                    className="h-9 border-[#dcc49c] bg-white text-sm file:ms-2 file:h-7 file:rounded-lg file:border-0 file:bg-[#e9b353] file:px-3 file:text-xs file:text-white"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <Label className="text-xs text-[#5a4830]">تاريخ الإصدار</Label>
                                  <Input
                                    type="date"
                                    value={uploadFormData.issue_date}
                                    onChange={(e) => {
                                      const newDate = e.target.value;
                                      setUploadFormData((prev) => ({
                                        ...prev,
                                        issue_date: newDate,
                                        expiry_date: updateExpiryDate(newDate, prev.duration_months),
                                      }));
                                    }}
                                    className="h-9 border-[#dcc49c] bg-white text-sm"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <Label className="text-xs text-[#5a4830]">تاريخ الانتهاء</Label>
                                  <Input
                                    type="date"
                                    value={uploadFormData.expiry_date}
                                    onChange={(e) =>
                                      setUploadFormData((prev) => ({
                                        ...prev,
                                        expiry_date: e.target.value,
                                      }))
                                    }
                                    className="h-9 border-[#dcc49c] bg-white text-sm"
                                  />
                                </div>
                              </div>

                              <div className="mt-3 flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setShowUploadForm(false);
                                    resetUploadForm();
                                  }}
                                  className="h-8 border-[#cfb180] text-[#5a4830]"
                                >
                                  إلغاء
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmitUpload(sponsor.id)}
                                  disabled={!uploadFormData.file || !uploadFormData.document_type_id || isUploading}
                                  className="h-8 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
                                >
                                  {isUploading ? 'جاري...' : 'رفع'}
                                </Button>
                              </div>
                            </div>
                          )}

                          {documents.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-[#d4c4a5] bg-white/40 py-6 text-center">
                              <FileText className="mx-auto mb-2 h-8 w-8 text-[#c9a66b]/60" />
                              <p className="text-sm text-[#7a684e]">لا توجد مستندات</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between rounded-xl border border-[#ebdcc2] bg-white/80 p-3"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="h-5 w-5 text-[#c9a66b]" />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-[#3e3020]">
                                          {doc.document_type.name_ar}
                                        </span>
                                        {getStatusBadge(doc.status, doc.days_remaining)}
                                      </div>
                                      <p className="text-xs text-[#78654c]">
                                        ينتهي: {doc.expiry_date}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openFile(doc.file_url)}
                                      className="h-8 w-8 rounded-lg text-[#5a4830]"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openFile(doc.file_url)}
                                      className="h-8 w-8 rounded-lg text-[#5a4830]"
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteDocument(doc)}
                                      className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
