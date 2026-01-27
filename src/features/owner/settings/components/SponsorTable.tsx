import { Edit2, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

import { Button } from '@shared/ui/components/button';
import { Input } from '@shared/ui/components/input';
import { Label } from '@shared/ui/components/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shared/ui/components/table';

interface Sponsor {
  id: string;
  name_ar: string;
  cr_number: string;
  unified_number: string;
  created_at: string;
  updated_at: string;
}

interface SponsorTableProps {
  sponsors: Sponsor[];
  onEdit: (sponsor: Sponsor) => void;
  onDelete: (sponsor: Sponsor) => void;
  onSubmit: (e: React.FormEvent) => void;
  onAssignEmployee: (sponsorId: string, employeeId: string) => void;
  onUnassignEmployee: (employeeId: string) => void;
  employeesBySponsor: Record<string, Array<{ id: string; name: string; name_ar?: string | null; branches?: { name: string | null; name_ar: string | null } | null }>>;
  unassignedEmployees: Array<{ id: string; name: string; name_ar?: string | null; branches?: { name: string | null; name_ar: string | null } | null }>;
  isAssigning?: boolean;
  nameAr: string;
  setNameAr: (value: string) => void;
  crNumber: string;
  setCrNumber: (value: string) => void;
  unifiedNumber: string;
  setUnifiedNumber: (value: string) => void;
  expandedSponsorId: string | null;
  setExpandedSponsorId: (id: string | null) => void;
}

export const SponsorTable = ({
  sponsors,
  onEdit,
  onDelete,
  onSubmit,
  onAssignEmployee,
  onUnassignEmployee,
  employeesBySponsor,
  unassignedEmployees,
  isAssigning = false,
  nameAr,
  setNameAr,
  crNumber,
  setCrNumber,
  unifiedNumber,
  setUnifiedNumber,
  expandedSponsorId,
  setExpandedSponsorId,
}: SponsorTableProps) => {
  const toggleExpanded = (sponsor: Sponsor) => {
    const nextId = expandedSponsorId === sponsor.id ? null : sponsor.id;
    setExpandedSponsorId(nextId);
    if (nextId) {
      // Prefill form when expanding a sponsor
      onEdit(sponsor);
    }
  };

  if (sponsors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        لا توجد كفلاء مسجلة
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12" />
            <TableHead>اسم الكفيل</TableHead>
            <TableHead>رقم السجل التجاري</TableHead>
            <TableHead>الرقم الموحد</TableHead>
            <TableHead className="w-24">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sponsors.map((sponsor) => (
            <TableRow key={sponsor.id}>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpanded(sponsor)}
                  className="p-1 h-6 w-6"
                >
                  {expandedSponsorId === sponsor.id ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </Button>
              </TableCell>
              <TableCell className="font-medium">{sponsor.name_ar}</TableCell>
              <TableCell>{sponsor.cr_number}</TableCell>
              <TableCell>{sponsor.unified_number}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(sponsor)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(sponsor)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Inline Edit Form */}
      {expandedSponsorId && (
        <div className="border-t bg-muted/50 p-4">
          <div className="mb-4 space-y-2">
            <div className="font-semibold text-sm">الموظفون تحت الكفيل</div>
            <div className="space-y-2">
              {(employeesBySponsor[expandedSponsorId] || []).map((emp) => (
                <div
                  key={emp.id}
                  className="flex items-center justify-between rounded-md border bg-white px-3 py-2"
                >
                  <div className="flex flex-col text-sm">
                    <span>{emp.name_ar || emp.name}</span>
                    {emp.branches ? (
                      <span className="text-xs text-muted-foreground">
                        فرع: {emp.branches.name_ar || emp.branches.name || ''}
                      </span>
                    ) : null}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnassignEmployee(emp.id)}
                    disabled={isAssigning}
                  >
                    إزالة
                  </Button>
                </div>
              ))}
              {(employeesBySponsor[expandedSponsorId] || []).length === 0 && (
                <div className="text-sm text-muted-foreground">لا يوجد موظفون مرتبطون</div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-2 items-end">
              <div className="flex-1">
                <Label htmlFor="assign-employee">إسناد موظف للكفيل</Label>
                <select
                  id="assign-employee"
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  defaultValue=""
                  disabled={isAssigning}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      onAssignEmployee(expandedSponsorId, value);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">اختر موظفاً غير مرتبط</option>
                  {unassignedEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name_ar || emp.name} {emp.branches ? `- ${emp.branches.name_ar || emp.branches.name || ''}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name-ar">اسم الكفيل</Label>
                <Input
                  id="edit-name-ar"
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-cr-number">رقم السجل التجاري</Label>
                <Input
                  id="edit-cr-number"
                  value={crNumber}
                  onChange={(e) => setCrNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unified-number">الرقم الموحد</Label>
                <Input
                  id="edit-unified-number"
                  value={unifiedNumber}
                  onChange={(e) => setUnifiedNumber(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setExpandedSponsorId(null)}
              >
                إلغاء
              </Button>
              <Button type="submit">تحديث</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
