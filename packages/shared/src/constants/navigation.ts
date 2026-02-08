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
        label: 'Staff Authority',
        icon: Users,
        path: '/owner/employees',
        description: 'Personnel & Access',
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
        label: 'Studio Network',
        icon: Building,
        path: '/owner/admin?tab=branches',
        description: 'Locations & Operations',
      },
      {
        id: 'sponsors',
        label: 'Partner Hub',
        icon: ShieldCheck,
        path: '/owner/admin?tab=sponsors',
        description: 'Sponsorships & Contracts',
      },
      {
        id: 'qrcodes',
        label: 'Smart Codes',
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
        label: 'Asset Library',
        icon: FileText,
        path: '/owner/admin?tab=files',
        description: 'Documents & Media',
      },
      {
        id: 'ui',
        label: 'Interface Lab',
        icon: Layout,
        path: '/owner/admin?tab=ui-elements',
        description: 'Visual Customization',
      },
    ],
  },
];

export const HR_NAVIGATION_CONFIG: NavigationSection[] = [
  {
    id: 'hr-workspace',
    label: 'الموارد البشرية',
    items: [
      {
        id: 'hr-management',
        label: 'إدارة الموارد البشرية',
        icon: Users,
        path: '/hr',
        description: 'الموظفون والمستندات والكفلاء',
        tabs: [
          {
            id: 'employees',
            label: 'الموظفون',
            icon: Users,
            description: 'إدارة بيانات الموظفين',
          },
          {
            id: 'documents',
            label: 'المستندات',
            icon: FileText,
            description: 'متابعة المستندات والصلاحيات',
          },
          {
            id: 'sponsors',
            label: 'الكفلاء',
            icon: ShieldCheck,
            description: 'إدارة بيانات الكفلاء',
          },
        ],
      },
    ],
  },
];
