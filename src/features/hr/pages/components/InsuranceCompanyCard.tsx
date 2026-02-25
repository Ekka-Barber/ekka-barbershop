import { Building2, ChevronDown, ChevronUp, ExternalLink, MapPin, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { motion, AnimatePresence, useReducedMotion } from '@shared/lib/motion';
import type { InsuranceCompany, InsuranceHospital } from '@shared/types/domains';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';

interface InsuranceCompanyCardProps {
  company: InsuranceCompany;
  hospitals: InsuranceHospital[];
  onEdit: (company: InsuranceCompany) => void;
  onDelete: (id: string) => void;
  onAddHospital: (companyId: string) => void;
  onEditHospital: (hospital: InsuranceHospital) => void;
  onDeleteHospital: (id: string) => void;
  isLoading: boolean;
}

export const InsuranceCompanyCard: React.FC<InsuranceCompanyCardProps> = ({
  company,
  hospitals,
  onEdit,
  onDelete,
  onAddHospital,
  onEditHospital,
  onDeleteHospital,
  isLoading,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const companyHospitals = hospitals.filter((h) => h.company_id === company.id);

  return (
    <Card className="overflow-hidden border-[#e2ceab] bg-white/85 shadow-[0_18px_40px_-30px_rgba(80,60,30,0.5)]" dir="rtl">
      <CardHeader className="cursor-pointer border-b border-[#f0e2c8] px-4 py-3" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[#e9b353]/20 p-2">
              <Building2 className="h-5 w-5 text-[#9a6d2d]" />
            </div>
            <div>
              <CardTitle className="text-base text-[#3a3020]">{company.name}</CardTitle>
              <div className="mt-1 flex items-center gap-3 text-sm text-[#6a5a40]">
                {company.contact_phone && (
                  <span className="flex items-center gap-1" dir="ltr">
                    <Phone className="h-3 w-3" />
                    {company.contact_phone}
                  </span>
                )}
                <Badge variant="outline" className="border-[#d6c4a8] bg-[#fff8e8] text-[#6a5a40]">
                  {companyHospitals.length} مستشفى
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddHospital(company.id);
              }}
              className="h-8 border-[#d6c4a8] bg-[#fff8e8] text-[#6a5a40] hover:bg-[#fff0d5]"
            >
              <Plus className="me-1 h-3.5 w-3.5" />
              مستشفى
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(company);
              }}
              disabled={isLoading}
              className="h-8 w-8 p-0 text-[#7a6b55] hover:bg-[#fff4df] hover:text-[#5a4a30]"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('هل أنت متأكد من حذف هذه الشركة؟ سيتم حذف جميع المستشفيات المرتبطة بها.')) {
                  onDelete(company.id);
                }
              }}
              disabled={isLoading}
              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <div className="ms-2 text-[#92734a]">
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </div>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 1 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <CardContent className="border-t border-[#f0e2c8] p-4">
              {companyHospitals.length === 0 ? (
                <div className="py-6 text-center text-[#7a6b55]">
                  <MapPin className="mx-auto mb-2 h-8 w-8 text-[#d6c4a8]" />
                  <p>لا توجد مستشفيات مسجلة لهذه الشركة</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onAddHospital(company.id)}
                    className="mt-3 border-[#d6c4a8] text-[#6a5a40]"
                  >
                    <Plus className="me-1 h-3.5 w-3.5" />
                    إضافة مستشفى
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {companyHospitals.map((hospital) => (
                    <div
                      key={hospital.id}
                      className="flex items-center justify-between rounded-xl border border-[#ebdcc2] bg-[#fffbf4] p-3 transition-all hover:shadow-[0_4px_12px_rgba(233,179,83,0.2)]"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-[#e9b353]/10 p-1.5">
                          <MapPin className="h-4 w-4 text-[#9a6d2d]" />
                        </div>
                        <div>
                          <p className="font-medium text-[#3a3020]">{hospital.name}</p>
                          <Badge variant="outline" className="mt-1 border-[#d6c4a8] bg-[#fff8e8] text-[#6a5a40]">
                            {hospital.city}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {hospital.google_maps_url && (
                          <a
                            href={hospital.google_maps_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md p-1.5 text-[#2563eb] hover:bg-blue-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditHospital(hospital)}
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
                              onDeleteHospital(hospital.id);
                            }
                          }}
                          disabled={isLoading}
                          className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
