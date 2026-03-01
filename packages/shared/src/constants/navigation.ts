import {
  Users,
  Building,
  CreditCard,
  Coins,
  ShieldCheck,
  FileText,
  QrCode,
  Layout,
  Home,
  TrendingUp,
  Calendar,
} from 'lucide-react';

import { NavigationSection } from '@shared/types/navigation';

export const NAVIGATION_CONFIG: NavigationSection[] = [
  {
    id: 'workspace',
    label: 'Workspace',
    items: [
      {
        id: 'overview',
        label: 'Overview',
        icon: Home,
        path: '/owner',
        description: 'Dashboard & Metrics',
      },
    ],
  },
  {
    id: 'workforce',
    label: 'Workforce Management',
    items: [
      {
        id: 'employees',
        label: 'Employee List',
        icon: Users,
        path: '/owner/employees',
        description: 'Staff & Roles',
        tabs: [
          {
            id: 'sales',
            label: 'Performance',
            icon: TrendingUp,
            description: 'Sales & KPIs',
          },
          {
            id: 'salaries',
            label: 'Payroll Center',
            icon: Coins,
            description: 'Salaries & Compensation',
          },
          {
            id: 'leave',
            label: 'Leave & Attendance',
            icon: Calendar,
            description: 'Time Off Management',
          },
          {
            id: 'loans',
            label: 'Loans & Deductions',
            icon: CreditCard,
            description: 'Financial Adjustments',
          },
          {
            id: 'bonuses',
            label: 'Bonuses',
            icon: Coins,
            description: 'Bonus Management',
          },
          {
            id: 'deductions',
            label: 'Deductions',
            icon: CreditCard,
            description: 'Salary Deductions',
          },
        ],
      },
    ],
  },
  {
    id: 'operations',
    label: 'Studio Operations',
    items: [
      {
        id: 'branches',
        label: 'Branches',
        icon: Building,
        path: '/owner/admin?tab=branches',
        description: 'Locations & Settings',
      },
      {
        id: 'sponsors',
        label: 'Sponsors',
        icon: ShieldCheck,
        path: '/owner/admin?tab=sponsors',
        description: 'Sponsorships & Contracts',
      },
      {
        id: 'qrcodes',
        label: 'QR Codes',
        icon: QrCode,
        path: '/owner/admin?tab=qrcodes',
        description: 'Entry Points & Analytics',
      },
    ],
  },
  {
    id: 'system',
    label: 'System & Assets',
    items: [
      {
        id: 'files',
        label: 'Files',
        icon: FileText,
        path: '/owner/admin?tab=files',
        description: 'Documents & Media',
      },
      {
        id: 'ui',
        label: 'UI Elements',
        icon: Layout,
        path: '/owner/admin?tab=ui-elements',
        description: 'Visual Customization',
      },
    ],
  },
];
