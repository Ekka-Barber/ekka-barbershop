import { Building2, Phone, Plus, Pencil, Trash2 } from 'lucide-react';

import type { InsuranceCompany } from '@shared/types/domains';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent } from '@shared/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/components/table';

interface InsuranceCompaniesTableProps {
  companies: InsuranceCompany[];
  onEdit: (company: InsuranceCompany) => void;
  onDelete: (id: string) => void;
  onViewHospitals: (company: InsuranceCompany) => void;
  isLoading: boolean;
}

export const InsuranceCompaniesTable: React.FC<InsuranceCompaniesTableProps> = ({
  companies,
  onEdit,
  onDelete,
  onViewHospitals,
  isLoading,
}) => {
  if (companies.length === 0) {
    return (
      <Card className="border-[#e2ceab] bg-white/80" dir="rtl">
        <CardContent className="py-12 text-center text-[#7a6b55]">
          <Building2 className="mx-auto mb-3 h-12 w-12 text-[#d6c4a8]" />
          <p className="text-lg font-medium">لا توجد شركات تأمين مسجلة</p>
          <p className="mt-1 text-sm">قم بإضافة شركة تأمين جديدة للبدء</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-[#e2ceab] bg-white/85 shadow-[0_18px_40px_-30px_rgba(80,60,30,0.5)]" dir="rtl">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="bg-[#faf5eb] font-semibold text-[#5a4a30]">اسم الشركة</TableHead>
                <TableHead className="bg-[#faf5eb] font-semibold text-[#5a4a30]">رقم الهاتف</TableHead>
                <TableHead className="bg-[#faf5eb] text-center font-semibold text-[#5a4a30]">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((company) => (
                <TableRow
                  key={company.id}
                  className="border-b border-[#f5ecd8] hover:bg-[#fffbf4]"
                >
                  <TableCell className="font-medium text-[#3a3020]">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-[#e9b353]" />
                      {company.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {company.contact_phone ? (
                      <div className="flex items-center gap-1 text-[#5a4a30]" dir="ltr">
                        <Phone className="h-3.5 w-3.5" />
                        {company.contact_phone}
                      </div>
                    ) : (
                      <span className="text-[#a89a84]">غير متوفر</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewHospitals(company)}
                        className="h-8 border-[#d6c4a8] bg-[#fff8e8] text-[#6a5a40] hover:bg-[#fff0d5]"
                      >
                        <Plus className="me-1 h-3.5 w-3.5" />
                        المستشفيات
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(company)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0 text-[#7a6b55] hover:bg-[#fff4df] hover:text-[#5a4a30]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('هل أنت متأكد من حذف هذه الشركة؟ سيتم حذف جميع المستشفيات المرتبطة بها.')) {
                            onDelete(company.id);
                          }
                        }}
                        disabled={isLoading}
                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
