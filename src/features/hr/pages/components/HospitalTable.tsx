import { ExternalLink, MapPin, Pencil, Trash2 } from 'lucide-react';

import type { InsuranceHospital } from '@shared/types/domains';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/components/table';

interface HospitalTableProps {
  hospitals: InsuranceHospital[];
  onEdit: (hospital: InsuranceHospital) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export const HospitalTable: React.FC<HospitalTableProps> = ({
  hospitals,
  onEdit,
  onDelete,
  isLoading,
}) => {
  if (hospitals.length === 0) {
    return (
      <Card className="border-[#e2ceab] bg-white/80" dir="rtl">
        <CardContent className="py-8 text-center text-[#7a6b55]">
          لا توجد مستشفيات مسجلة لهذه الشركة
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-[#e2ceab] bg-white/80 shadow-sm" dir="rtl">
      <CardHeader className="border-b border-[#f0e2c8] pb-3">
        <CardTitle className="text-base text-[#4a3f2f]">المستشفيات المعتمدة</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="bg-[#faf5eb] font-semibold text-[#5a4a30]">المستشفى</TableHead>
                <TableHead className="bg-[#faf5eb] font-semibold text-[#5a4a30]">المدينة</TableHead>
                <TableHead className="bg-[#faf5eb] font-semibold text-[#5a4a30]">الموقع</TableHead>
                <TableHead className="bg-[#faf5eb] text-center font-semibold text-[#5a4a30]">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hospitals.map((hospital) => (
                <TableRow
                  key={hospital.id}
                  className="border-b border-[#f5ecd8] hover:bg-[#fffbf4]"
                >
                  <TableCell className="font-medium text-[#3a3020]">{hospital.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#d6c4a8] bg-[#fff8e8] text-[#6a5a40]">
                      <MapPin className="me-1 h-3 w-3" />
                      {hospital.city}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {hospital.google_maps_url ? (
                      <a
                        href={hospital.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#2563eb] hover:underline"
                      >
                        عرض الخريطة
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[#a89a84]">غير متوفر</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(hospital)}
                        disabled={isLoading}
                        className="h-8 w-8 p-0 text-[#7a6b55] hover:bg-[#fff4df] hover:text-[#5a4a30]"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('هل أنت متأكد من حذف هذا المستشفى؟')) {
                            onDelete(hospital.id);
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
