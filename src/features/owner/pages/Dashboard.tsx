import { format } from 'date-fns';
import { Calendar, Users, UserCheck, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

import { TIME } from '@shared/constants/time';
import { cn } from '@shared/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@shared/ui/components/card';

import {
  isEmployeeActiveOnDate,
  getActiveEmployeesForPeriod,
} from '@/features/owner/employees/hooks/useEmployeeData';
import { useEmployees } from '@/features/owner/employees/hooks/useEmployees';
import { getPayrollWindow } from '@/features/owner/employees/utils';


interface IndexProps {
  selectedBranch: string;
}

const Index = ({ selectedBranch }: IndexProps) => {
  const { data: employees = [] } = useEmployees();

  // Filter employees based on selected branch
  const filteredEmployees =
    selectedBranch === 'all'
      ? employees
      : employees.filter((emp) => emp.branch_id === selectedBranch);

  const payrollMonthKey = format(new Date(), 'yyyy-MM');
  const { windowStart, windowEnd } = getPayrollWindow(payrollMonthKey);
  const payrollWindowLabel = `${format(windowStart, 'MMM d')} – ${format(
    windowEnd,
    'MMM d'
  )}`;
  const windowActiveEmployees = getActiveEmployeesForPeriod(
    filteredEmployees,
    windowStart,
    windowEnd
  ).length;

  // Calculate employee statistics
  const totalEmployees = filteredEmployees.length;
  const activeEmployees = filteredEmployees.filter((emp) =>
    isEmployeeActiveOnDate(emp)
  ).length;

  // Role distribution
  const roleCounts = filteredEmployees.reduce(
    (acc, emp) => {
      const role = emp.role.replace('_', ' ');
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Recent hires
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - TIME.DAYS_PER_MONTH_APPROX);
  const recentHires = filteredEmployees.filter((emp) => {
    if (!emp.start_date) return false;
    const startDate = new Date(emp.start_date);
    return startDate >= thirtyDaysAgo;
  }).length;

  return (
    <div className="flex flex-col gap-8 md:gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          Employee Dashboard
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-muted-foreground">
          <p className="text-lg">Overview of your workforce and operations</p>
          <span className="hidden sm:inline text-muted-foreground/30">•</span>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-sm font-medium text-primary">
            <Calendar className="h-3.5 w-3.5" />
            Payroll: {payrollWindowLabel}
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Force',
            value: totalEmployees,
            sub: `${selectedBranch === 'all' ? 'All branches' : 'Current branch'}`,
            icon: Users,
            color: 'text-primary',
            bg: 'bg-primary/5',
            border: 'border-primary/10',
          },
          {
            title: 'In-Payroll',
            value: windowActiveEmployees,
            sub: 'Counted for this period',
            icon: Calendar,
            color: 'text-amber-500',
            bg: 'bg-amber-500/5',
            border: 'border-amber-500/10',
          },
          {
            title: 'Active Now',
            value: activeEmployees,
            sub: 'On active contracts',
            icon: UserCheck,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/5',
            border: 'border-emerald-500/10',
          },
          {
            title: 'New Hires',
            value: recentHires,
            sub: 'Joined in last 30 days',
            icon: Users,
            color: 'text-blue-500',
            bg: 'bg-blue-500/5',
            border: 'border-blue-500/10',
          },
        ].map((item, i) => (
          <Card key={i} className="group hover:shadow-lg transition-all duration-300 border-border/50 overflow-hidden relative">
            <div className={cn("absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 transition-transform group-hover:scale-125", item.bg)} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {item.title}
                </CardTitle>
                <div className={cn("p-2 rounded-xl transition-colors", item.bg, item.color)}>
                  <item.icon className="h-4 w-4" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight mb-1">{item.value}</div>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Content Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Role Distribution */}
        <Card className="lg:col-span-2 border-border/50 shadow-sm">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg font-bold">Workforce Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
              {Object.entries(roleCounts).map(([role, count], i) => (
                <div key={role} className="flex flex-col items-center gap-2 group animate-in zoom-in duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="relative">
                    <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <span className="text-2xl font-bold">{Number(count)}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-background" />
                  </div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center">
                    {role}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-border/50 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="border-b border-border/50 bg-muted/30">
            <CardTitle className="text-lg font-bold">Operations</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="flex flex-col">
              <Link
                to="/owner/employees"
                className="flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors border-b border-border/50 group"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Staff Authority</div>
                  <p className="text-xs text-muted-foreground">Manage contracts and records</p>
                </div>
              </Link>
              <Link
                to="/owner/employees?tab=salaries"
                className="flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors border-b border-border/50 group"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Payroll Center</div>
                  <p className="text-xs text-muted-foreground">Process monthly payroll</p>
                </div>
              </Link>
              <Link
                to="/owner/management"
                className="flex items-center gap-4 p-5 hover:bg-muted/50 transition-colors group"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-500/10 flex items-center justify-center text-slate-600 group-hover:scale-110 transition-transform">
                  <Settings className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">System Core</div>
                  <p className="text-xs text-muted-foreground">Configure system preferences</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
