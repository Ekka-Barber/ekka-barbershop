import { FileUp, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import type { Sponsor, SponsorDocumentWithStatus } from '@shared/types/domains';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent } from '@shared/ui/components/card';

import {
  useSponsorDocumentTypes,
  useSponsorDocumentsWithStatus,
} from '../../hooks/useSponsorDocuments';

import { SponsorDocumentForm } from './SponsorDocumentForm';
import { SponsorDocumentsTable } from './SponsorDocumentsTable';

interface SponsorDocumentManagementProps {
  sponsor: Sponsor;
  onBack: () => void;
}

export const SponsorDocumentManagement: React.FC<SponsorDocumentManagementProps> = ({
  sponsor,
  onBack,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<SponsorDocumentWithStatus | null>(null);

  const { data: documentTypes = [], isLoading: isLoadingTypes } = useSponsorDocumentTypes();
  const {
    documentsQuery,
    createDocument,
    updateDocument,
    deleteDocument,
    isLoading,
  } = useSponsorDocumentsWithStatus(sponsor.id);

  const documents = documentsQuery.data ?? [];

  const handleSubmit = async (formData: Parameters<typeof createDocument.mutateAsync>[0]) => {
    try {
      await createDocument.mutateAsync(formData);
      toast.success('تمت إضافة المستند بنجاح.');
      setShowForm(false);
    } catch {
      toast.error('تعذر حفظ المستند.');
    }
  };

  const handleUpdate = async (data: Parameters<typeof updateDocument.mutateAsync>[0]) => {
    try {
      await updateDocument.mutateAsync(data);
      toast.success('تم تحديث المستند بنجاح.');
      setShowForm(false);
      setEditingDocument(null);
    } catch {
      toast.error('تعذر تحديث المستند.');
    }
  };

  const handleDelete = async (doc: Parameters<typeof deleteDocument.mutateAsync>[0]) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستند؟')) {
      return;
    }

    try {
      await deleteDocument.mutateAsync(doc);
      toast.success('تم حذف المستند بنجاح.');
    } catch {
      toast.error('تعذر حذف المستند.');
    }
  };

  const handleEdit = (doc: typeof documents[0]) => {
    setEditingDocument(doc);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingDocument(null);
  };

  return (
    <div className="space-y-4" dir="rtl">
      <Card className="border-[#e2ceab] bg-white/85 shadow-[0_18px_40px_-30px_rgba(80,60,30,0.5)]">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={onBack}
                className="h-9 w-9 rounded-xl text-[#5a4830] hover:bg-[#f5e7ce]"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-[#2f261b]">{sponsor.name_ar}</h2>
                <p className="text-sm text-[#6f5b40]">
                  السجل التجاري: {sponsor.cr_number} | الرقم الموحد: {sponsor.unified_number}
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setEditingDocument(null);
                setShowForm((current) => !current);
              }}
              className="h-11 bg-[#e9b353] text-white hover:bg-[#deaa4f]"
            >
              <FileUp className="ms-2 h-4 w-4" />
              {showForm ? 'إغلاق النموذج' : 'إضافة مستند'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <SponsorDocumentForm
          sponsor={sponsor}
          documentTypes={documentTypes}
          onSubmit={handleSubmit}
          onUpdate={handleUpdate}
          onCancel={handleCancel}
          editingDocument={editingDocument}
          isSubmitting={createDocument.isPending || updateDocument.isPending}
          isLoadingTypes={isLoadingTypes}
        />
      )}

      <SponsorDocumentsTable
        documents={documents}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />
    </div>
  );
};
