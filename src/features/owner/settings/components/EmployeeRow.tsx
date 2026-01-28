import { Pencil, Trash2, Calendar, Clock } from 'lucide-react';

import { useIsMobile } from '@shared/hooks/use-mobile';
import type { EmployeeWithBranch } from '@/features/owner/employees/types';
import { Avatar, AvatarFallback, AvatarImage } from '@shared/ui/components/avatar';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';
import { TableCell, TableRow } from '@shared/ui/components/table';

import {
  isEmployeeActiveOnDate,
  calculateEmployeeTenure,
} from '@/features/owner/employees/hooks/useEmployeeData';

interface EmployeeRowProps {
  employee: EmployeeWithBranch;
  onEdit: (employee: EmployeeWithBranch) => void;
  onDelete: (id: string | null) => void;
  forceDesktop?: boolean; // Force desktop table rendering
}

export const EmployeeRow = ({
  employee,
  onEdit,
  onDelete,
  forceDesktop = false,
}: EmployeeRowProps) => {
  const isMobile = useIsMobile();
  const shouldRenderMobile = isMobile && !forceDesktop;

  // Calculate employee status and tenure
  const isActive = isEmployeeActiveOnDate(employee);
  const tenure = calculateEmployeeTenure(
    employee.start_date ?? '',
    employee.end_date ?? undefined
  );
  const roleLabel = employee.role
    ? employee.role.replace(/_/g, ' ')
    : 'Unknown';
  const avatarLetter = employee.name?.charAt?.(0) ?? '?';

  const formatTenure = (
    tenure: {
      totalMonths: number;
      years: number;
      months: number;
      days: number;
      isActive: boolean;
    } | null
  ) => {
    if (!tenure) return 'N/A';
    if (tenure.years > 0) {
      return `${tenure.years}y ${tenure.months}m`;
    }
    return `${tenure.totalMonths}m`;
  };

  const getStatusBadge = () => (
    <Badge variant={isActive ? 'default' : 'secondary'} className="text-xs">
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );

  if (shouldRenderMobile) {
    return (
      <div className="border rounded-lg p-4 mb-3 shadow-sm bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-grow min-w-0">
            <Avatar>
              <AvatarImage src={employee.photo_url || undefined} />
              <AvatarFallback>{avatarLetter}</AvatarFallback>
            </Avatar>
            <div className="flex-grow min-w-0">
              <h3 className="text-md font-semibold truncate">
                {employee.name}
              </h3>
              <p className="text-xs text-muted-foreground capitalize truncate">
                {roleLabel}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-1 text-sm">
          <div className="text-muted-foreground truncate">
            <span className="font-medium text-foreground">Branch:</span>{' '}
            {employee.branches?.name || 'N/A'}
          </div>

          {employee.sponsors && (
            <div className="text-muted-foreground truncate">
              <span className="font-medium text-foreground">Sponsor:</span>{' '}
              {employee.sponsors.name_ar} ({employee.sponsors.cr_number})
            </div>
          )}

          {employee.start_date && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span className="text-xs">
                Started: {new Date(employee.start_date ?? '').toLocaleDateString()}
              </span>
            </div>
          )}

          {tenure && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span className="text-xs">Tenure: {formatTenure(tenure)}</span>
            </div>
          )}

          {employee.end_date && (
            <div className="flex items-center gap-1 text-red-600">
              <Calendar className="h-3 w-3" />
              <span className="text-xs">
                Ended: {new Date(employee.end_date ?? '').toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <div className="flex space-x-2 pt-3 border-t mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(employee)}
            className="flex-1"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(employee.id)}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TableRow className={!isActive ? 'opacity-60' : ''}>
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={employee.photo_url || undefined} />
            <AvatarFallback>{avatarLetter}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{employee.name}</span>
            {tenure && (
              <span className="text-xs text-muted-foreground">
                {formatTenure(tenure)} tenure
              </span>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="capitalize hidden sm:table-cell">
        <div className="flex flex-col gap-1">
          <span>{roleLabel}</span>
          {getStatusBadge()}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="flex flex-col gap-1">
          <span>{employee.branches?.name || 'No branch'}</span>
          {employee.start_date && (
            <span className="text-xs text-muted-foreground">
              Since {new Date(employee.start_date).toLocaleDateString()}
            </span>
          )}
          {employee.end_date && (
            <span className="text-xs text-red-600">
              Until {new Date(employee.end_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        {employee.sponsors ? (
          <div className="flex flex-col gap-1">
            <span className="text-sm">{employee.sponsors.name_ar}</span>
            <span className="text-xs text-muted-foreground">
              {employee.sponsors.cr_number}
            </span>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">No sponsor</span>
        )}
      </TableCell>
      <TableCell className="w-[100px]">
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(employee)}
            aria-label="Edit employee"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(employee.id)}
            aria-label="Delete employee"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
