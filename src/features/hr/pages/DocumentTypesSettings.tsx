import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import {
  useCreateDocumentType,
  useDeleteDocumentType,
  useDocumentTypes,
  useUpdateDocumentType,
} from '@features/hr/hooks/useDocumentTypes';

import type { DocumentTypeConfig } from '@shared/types/hr.types';
import { Alert, AlertDescription } from '@shared/ui/components/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/ui/components/alert-dialog';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@shared/ui/components/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@shared/ui/components/dialog';

import { DocumentTypeForm } from './components/DocumentTypeForm';

const COLOR_CLASSES: Record<string, string> = {
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  blue: 'bg-blue-100 text-blue-800 border-blue-200',
  amber: 'bg-amber-100 text-amber-800 border-amber-200',
  red: 'bg-red-100 text-red-800 border-red-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  gray: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const DocumentTypesSettings: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState<DocumentTypeConfig | null>(null);
  const [deletingType, setDeletingType] = useState<DocumentTypeConfig | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const { data: documentTypes, isLoading, error } = useDocumentTypes(showInactive);
  const createMutation = useCreateDocumentType();
  const updateMutation = useUpdateDocumentType();
  const deleteMutation = useDeleteDocumentType();

  const handleSubmit = async (
    data: Omit<DocumentTypeConfig, 'id' | 'created_at' | 'updated_at'>
  ) => {
    try {
      if (editingType) {
        await updateMutation.mutateAsync({
          id: editingType.id,
          updates: data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      setShowForm(false);
      setEditingType(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async () => {
    if (!deletingType) return;
    try {
      await deleteMutation.mutateAsync(deletingType.id);
      setDeletingType(null);
    } catch {
      // Error handled by mutation
    }
  };

  const handleEdit = (type: DocumentTypeConfig) => {
    setEditingType(type);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingType(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingType(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-[#f0e2c8] rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white/50 rounded-xl border border-[#e2ceab] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="border-red-200 bg-red-50">
        <AlertDescription>
          خطأ في تحميل أنواع المستندات. يرجى تحديث الصفحة.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-[#2f261b]">
            إعدادات أنواع المستندات
          </h2>
          <p className="text-sm text-[#7a684e] mt-1">
            إدارة أنواع المستندات ومدد الصلاحية والتنبيهات
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowInactive(!showInactive)}
            className="border-[#dcc49c] text-[#5a4830] hover:bg-[#fff8ea]"
          >
            {showInactive ? 'إخفاء غير النشط' : 'عرض غير النشط'}
          </Button>
          <Button
            onClick={handleAdd}
            className="bg-[#e9b353] text-white hover:bg-[#deaa4f]"
          >
            <Plus className="h-4 w-4 ms-1.5" />
            إضافة نوع جديد
          </Button>
        </div>
      </div>

      {/* Document Types Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {documentTypes?.map((type) => (
          <Card
            key={type.id}
            className={`border-[#e2ceab] bg-white/90 transition-all hover:shadow-lg ${
              !type.is_active ? 'opacity-60' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      COLOR_CLASSES[type.color || 'blue']
                    }`}
                  />
                  <div>
                    <CardTitle className="text-base text-[#2f261b]">
                      {type.name_ar}
                    </CardTitle>
                    {type.name_en && (
                      <p className="text-xs text-[#7a684e]" dir="ltr">
                        {type.name_en}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(type)}
                    className="h-8 w-8 rounded-lg text-[#5a4830] hover:bg-[#f5e7ce]"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {type.is_active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingType(type)}
                      className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="border-[#dcc49c] bg-[#fffdfa] text-xs"
                >
                  {type.default_duration_months} شهر صلاحية
                </Badge>
                <Badge
                  variant="outline"
                  className="border-[#dcc49c] bg-[#fffdfa] text-xs"
                >
                  تنبيه قبل {type.notification_threshold_days} يوم
                </Badge>
                {type.requires_document_number && (
                  <Badge
                    variant="outline"
                    className="border-[#dcc49c] bg-[#fffdfa] text-xs"
                  >
                    يتطلب رقم
                  </Badge>
                )}
                {!type.is_active && (
                  <Badge variant="secondary" className="text-xs">
                    غير نشط
                  </Badge>
                )}
              </div>
              <p className="text-xs text-[#7a684e] mt-2" dir="ltr">
                Code: {type.code}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {documentTypes?.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-dashed border-[#e4cda7] bg-[#fffaf1]/80 px-6 py-10">
            <p className="text-lg font-semibold text-[#2f261b]">
              لا توجد أنواع مستندات
            </p>
            <p className="mt-2 text-sm text-[#7b6850]">
              أضف نوع مستند جديد للبدء في إدارة المستندات
            </p>
            <Button
              onClick={handleAdd}
              className="mt-4 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
            >
              <Plus className="h-4 w-4 ms-1.5" />
              إضافة نوع جديد
            </Button>
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto border-[#e2ceab]">
          <DialogHeader>
            <DialogTitle className="text-[#2f261b]">
              {editingType ? 'تعديل نوع المستند' : 'إضافة نوع مستند جديد'}
            </DialogTitle>
          </DialogHeader>
          <DocumentTypeForm
            initialData={editingType || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={
              createMutation.isPending || updateMutation.isPending
            }
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingType}
        onOpenChange={() => setDeletingType(null)}
      >
        <AlertDialogContent className="border-[#e2ceab] bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#2f261b]">
              تأكيد إلغاء التفعيل
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#7a684e]">
              هل أنت متأكد من إلغاء تفعيل نوع المستند &quot;{deletingType?.name_ar}&quot;؟
              <br />
              لن يظهر هذا النوع في القوائم المنسدلة للمستندات الجديدة.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="border-[#dcc49c] text-[#5a4830] hover:bg-[#fff8ea]">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'جاري الإلغاء...' : 'إلغاء التفعيل'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
