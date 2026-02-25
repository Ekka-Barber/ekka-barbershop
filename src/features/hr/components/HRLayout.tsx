import {
  FileText,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useLogout } from '@shared/hooks/auth/useLogout';
import { AnimatePresence, motion, useReducedMotion } from '@shared/lib/motion';
import { cn } from '@shared/lib/utils';
import { Badge } from '@shared/ui/components/badge';
import { Button } from '@shared/ui/components/button';

interface HRLayoutProps {
  children: React.ReactNode;
}

type HRTab = 'employees' | 'documents' | 'sponsors' | 'settings';

const HR_TABS: Array<{
  id: HRTab;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'employees',
    label: 'الموظفون',
    description: 'الملفات الوظيفية',
    icon: Users,
  },
  {
    id: 'documents',
    label: 'المستندات',
    description: 'الصلاحيات والتجديد',
    icon: FileText,
  },
  {
    id: 'sponsors',
    label: 'الكفلاء',
    description: 'بيانات الشركات',
    icon: ShieldCheck,
  },
  {
    id: 'settings',
    label: 'الإعدادات',
    description: 'أنواع المستندات',
    icon: Settings,
  },
];

const isHRTab = (value: string | null): value is HRTab => {
  return value === 'employees' || value === 'documents' || value === 'sponsors' || value === 'settings';
};

const getActiveTab = (value: string | null): HRTab => {
  if (isHRTab(value)) {
    return value;
  }

  return 'employees';
};

export const HRLayout: React.FC<HRLayoutProps> = ({ children }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  const logout = useLogout();

  const activeTab = getActiveTab(searchParams.get('tab'));

  const handleTabChange = (tab: HRTab) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('tab', tab);
    setSearchParams(nextSearchParams, { replace: true });
    setMobileNavOpen(false);
  };

  return (
    <div
      dir="rtl"
      className="relative h-[100dvh] min-h-[100dvh] overflow-hidden bg-gradient-to-b from-[#fffaf2] via-[#f8f1e3] to-[#efe3cc] text-[#1f1d1a]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -start-10 h-72 w-72 rounded-full bg-[#e9b353]/25 blur-3xl" />
        <div className="absolute top-44 end-0 h-64 w-64 rounded-full bg-[#0f766e]/20 blur-3xl" />
        <div className="absolute bottom-0 start-1/3 h-80 w-80 rounded-full bg-[#d8b072]/20 blur-3xl" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col lg:flex-row">
        <motion.aside
          initial={shouldReduceMotion ? false : { opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="hidden w-[320px] shrink-0 border-s border-[#d7c19b]/70 bg-white/65 p-6 backdrop-blur-xl lg:flex lg:flex-col lg:gap-5 lg:overflow-y-auto"
        >
          <div className="rounded-3xl border border-[#d8c19a]/80 bg-gradient-to-br from-[#fff7e8] to-white p-5 shadow-[0_18px_45px_-28px_rgba(88,64,30,0.45)]">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#d8bf94] bg-[#fff4de] px-3 py-1 text-xs font-semibold text-[#8c6327]">
              <Sparkles className="h-3.5 w-3.5" />
              لوحة الموارد البشرية
            </div>
            <h1 className="text-2xl font-semibold leading-tight text-[#2f261b]">
              مركز التحكم الذكي
            </h1>
            <p className="mt-2 text-sm leading-6 text-[#5f4f39]">
              تجربة مصممة خصيصا لإدارة الموظفين والمستندات والكفلاء بسرعة ودقة.
            </p>
          </div>

          <div className="space-y-2">
            {HR_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    'group w-full rounded-2xl border px-4 py-3 text-start transition-all duration-300',
                    isActive
                      ? 'border-[#d8b072] bg-white shadow-[0_14px_32px_-24px_rgba(88,64,30,0.55)]'
                      : 'border-transparent bg-[#fff7e9]/70 hover:border-[#dcc39a] hover:bg-white/90'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-xl border transition-colors',
                        isActive
                          ? 'border-[#e7c78b] bg-[#fff0d2] text-[#7d5a24]'
                          : 'border-[#e8d9bc] bg-white text-[#7a6a52]'
                      )}
                    >
                      <TabIcon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#2f261b]">{tab.label}</p>
                      <p className="text-xs text-[#786754]">{tab.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-auto rounded-2xl border border-[#d6be95]/80 bg-[#fffaf0]/95 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#5f4f39]">
              <ShieldCheck className="h-4 w-4 text-[#8c6327]" />
              نطاق صلاحيات الموارد البشرية
            </div>
            <p className="text-base font-semibold text-[#2f261b]">تشغيلي فقط</p>
            <p className="mt-1 text-xs leading-5 text-[#7a6a52]">
              الواجهة مخصصة للموارد البشرية بدون أدوات مالية أو تغيير نطاق بيانات الفروع.
            </p>
          </div>
        </motion.aside>

        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto overscroll-y-contain momentum-scroll touch-action-pan-y">
          <header className="sticky top-0 z-30 border-b border-[#d7c19b]/70 bg-[#fff8eb]/85 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-xl border border-[#dac39c] bg-white/80 lg:hidden"
                  onClick={() => setMobileNavOpen((current) => !current)}
                >
                  {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>

                <img
                  src="/logo_Header/logo12.svg"
                  alt="Ekka Barbershop Logo"
                  className="h-10"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      '/lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.webp';
                  }}
                />
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.22em] text-[#8c6327]">
                    إكّه | الموارد البشرية
                  </p>
                  <h2 className="text-base font-semibold text-[#2f261b] sm:text-lg">
                    منصة الإدارة البشرية
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Badge className="h-10 rounded-xl border border-[#d6be95] bg-white px-3 text-[#5e4a2f] hover:bg-white">
                  وضع الموارد البشرية
                </Badge>
                <Button
                  type="button"
                  variant="outline"
                  onClick={logout}
                  className="flex h-10 min-h-[44px] items-center gap-2 rounded-xl border-[#d4b47d] bg-white px-3 text-[#4b3a25] hover:bg-[#fff1d8]"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">تسجيل الخروج</span>
                </Button>
              </div>
            </div>

            <AnimatePresence initial={false}>
              {mobileNavOpen && (
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="border-t border-[#e0ccaa] px-4 pb-4 pt-3 lg:hidden"
                >
                  <div className="flex flex-col gap-2">
                    {HR_TABS.map((tab) => {
                      const TabIcon = tab.icon;
                      const isActive = activeTab === tab.id;

                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => handleTabChange(tab.id)}
                          className={cn(
                            'flex items-center justify-between rounded-xl border px-3 py-2.5 text-start transition-all duration-200',
                            isActive
                              ? 'border-[#d8b072] bg-white text-[#2f261b]'
                              : 'border-[#e3d2b4]/80 bg-[#fff7e9]/80 text-[#6f5f47] hover:bg-white/90'
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <TabIcon className="h-4 w-4" />
                            <span className="text-sm font-medium">{tab.label}</span>
                          </div>
                          {isActive && <Badge className="bg-[#e9b353] text-white">نشط</Badge>}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <section className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </section>
        </main>
      </div>
    </div>
  );
};
