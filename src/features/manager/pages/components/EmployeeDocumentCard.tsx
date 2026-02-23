import {
  Badge,
  Building2,
  ChevronDown,
  ChevronUp,
  FileText,
  MapPin,
  Shield,
  User,
} from 'lucide-react';
import { useState } from 'react';

import type { EmployeeWithDocuments } from '@/features/manager/hooks/useEmployeeDocumentsData';
import { motion, useReducedMotion } from '@shared/lib/motion';
import { Badge as UIBadge } from '@shared/ui/components/badge';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const getEmployeeStatusColor = (employee: EmployeeWithDocuments) => {
  if (employee.document_counts.expired > 0 || employee.insurance?.status === 'expired') {
    return 'border-l-4 border-l-red-500';
  }
  if (employee.document_counts.expiring_soon > 0 || employee.insurance?.status === 'expiring_soon') {
    return 'border-l-4 border-l-amber-500';
  }
  return 'border-l-4 border-l-emerald-500';
};

interface EmployeeDocumentCardProps {
  employee: EmployeeWithDocuments;
}

export const EmployeeDocumentCard = ({ employee }: EmployeeDocumentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  const hasIssues =
    employee.document_counts.expired > 0 ||
    employee.document_counts.expiring_soon > 0 ||
    employee.insurance?.status === 'expired' ||
    employee.insurance?.status === 'expiring_soon';

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <div
        className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md ${getEmployeeStatusColor(
          employee
        )}`}
        dir="rtl"
      >
        <div
          className="p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            {employee.photo_url ? (
              <img
                src={employee.photo_url}
                alt={employee.name_ar || employee.name}
                className="h-14 w-14 rounded-xl object-cover border border-gray-200"
              />
            ) : (
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-500" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 truncate">
                  {employee.name_ar || employee.name}
                </h3>
                {employee.role && (
                  <UIBadge variant="outline" className="text-xs">
                    {employee.role}
                  </UIBadge>
                )}
              </div>
              {employee.branch_name && (
                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{employee.branch_name}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {employee.document_counts.expired > 0 && (
                  <UIBadge variant="destructive" className="text-xs">
                    {employee.document_counts.expired} منتهي
                  </UIBadge>
                )}
                {employee.document_counts.expiring_soon > 0 && (
                  <UIBadge className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                    {employee.document_counts.expiring_soon} قريب
                  </UIBadge>
                )}
                {employee.document_counts.valid > 0 && !hasIssues && (
                  <UIBadge className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                    {employee.documents.length} ساري
                  </UIBadge>
                )}
              </div>

              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={{
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0,
          }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.2,
            ease: 'easeInOut',
          }}
          style={{ overflow: 'hidden' }}
        >
          <div className="px-4 pb-4 border-t border-gray-100 pt-4">
            {employee.documents.length === 0 && !employee.insurance && (
              <div className="py-6 text-center">
                <FileText className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">لا توجد مستندات مسجلة</p>
              </div>
            )}

            {employee.documents.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  المستندات ({employee.documents.length})
                </h4>
                <div className="space-y-2">
                  {employee.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        doc.status === 'expired'
                          ? 'bg-red-50 border-red-100'
                          : doc.status === 'expiring_soon'
                            ? 'bg-amber-50 border-amber-100'
                            : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                          doc.status === 'expired'
                            ? 'bg-red-100 text-red-600'
                            : doc.status === 'expiring_soon'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        <FileText className="h-4 w-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-gray-900 text-sm truncate">
                            {doc.document_name}
                          </span>
                          {doc.document_type_name_ar && (
                            <span className="text-xs text-gray-500">
                              ({doc.document_type_name_ar})
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <UIBadge
                            variant="outline"
                            className={`text-xs ${
                              doc.status === 'expired'
                                ? 'border-red-200 text-red-700'
                                : doc.status === 'expiring_soon'
                                  ? 'border-amber-200 text-amber-700'
                                  : 'border-emerald-200 text-emerald-700'
                            }`}
                          >
                            {doc.status === 'expired'
                              ? 'منتهي'
                              : doc.status === 'expiring_soon'
                                ? 'ينتهي قريباً'
                                : 'ساري'}
                          </UIBadge>
                          {doc.document_number && (
                            <span className="text-xs text-gray-500">
                              رقم: {doc.document_number}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-left min-w-[80px]">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(doc.expiry_date)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {doc.days_remaining !== null &&
                            (doc.days_remaining < 0
                              ? `منذ ${Math.abs(doc.days_remaining)} يوم`
                              : `بعد ${doc.days_remaining} يوم`)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {employee.insurance && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  التأمين الطبي
                </h4>
                <div
                  className={`p-3 rounded-lg border ${
                    employee.insurance.status === 'expired'
                      ? 'bg-red-50 border-red-100'
                      : employee.insurance.status === 'expiring_soon'
                        ? 'bg-amber-50 border-amber-100'
                        : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center ${
                          employee.insurance.status === 'expired'
                            ? 'bg-red-100 text-red-600'
                            : employee.insurance.status === 'expiring_soon'
                              ? 'bg-amber-100 text-amber-600'
                              : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        <Shield className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          {employee.insurance.company?.name || 'شركة التأمين'}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <UIBadge
                            variant="outline"
                            className={`text-xs ${
                              employee.insurance.status === 'expired'
                                ? 'border-red-200 text-red-700'
                                : employee.insurance.status === 'expiring_soon'
                                  ? 'border-amber-200 text-amber-700'
                                  : 'border-emerald-200 text-emerald-700'
                            }`}
                          >
                            {employee.insurance.status === 'expired'
                              ? 'منتهي'
                              : employee.insurance.status === 'expiring_soon'
                                ? 'ينتهي قريباً'
                                : 'ساري'}
                          </UIBadge>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(employee.insurance.expiry_date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {employee.insurance.days_remaining !== null &&
                          (employee.insurance.days_remaining < 0
                            ? `منذ ${Math.abs(employee.insurance.days_remaining)} يوم`
                            : `بعد ${employee.insurance.days_remaining} يوم`)}
                      </div>
                    </div>
                  </div>

                  {employee.insurance.hospitals.length > 0 && (
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <p className="text-xs text-gray-500 mb-2">المستشفيات المتاحة:</p>
                      <div className="space-y-1.5">
                        {employee.insurance.hospitals.map((hospital) => (
                          <div
                            key={hospital.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-700">{hospital.name}</span>
                            <span className="text-gray-400 text-xs">({hospital.city})</span>
                            {hospital.google_maps_url && (
                              <a
                                href={hospital.google_maps_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 text-xs hover:underline mr-auto"
                                onClick={(e) => e.stopPropagation()}
                              >
                                الخريطة
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!employee.insurance && employee.documents.length > 0 && (
              <div className="p-3 rounded-lg border border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3 text-gray-500">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">لا يوجد تأمين طبي مسجل</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
