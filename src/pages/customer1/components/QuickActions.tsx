import { useLanguage } from "@/contexts/LanguageContext";
import type { Database } from "@/integrations/supabase/types";
import * as Icons from "lucide-react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";
import { motion } from "@/lib/motion";

type UiElement = Database["public"]["Tables"]["ui_elements"]["Row"];

interface QuickActionsProps {
  actions: UiElement[];
  onAction: (element: UiElement) => void;
  animatingElements: string[];
}

const resolveIcon = (iconName: string | null): LucideIcon => {
  if (iconName && Icons[iconName as keyof typeof Icons]) {
    return Icons[iconName as keyof typeof Icons] as LucideIcon;
  }
  return Icons.Sparkles;
};

export const QuickActions = ({
  actions,
  onAction,
  animatingElements,
}: QuickActionsProps) => {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  if (actions.length === 0) {
    return (
      <section className="overflow-hidden rounded-3xl border border-dashed border-white/10 bg-gradient-to-br from-white/5 to-transparent p-10 text-center text-sm text-slate-300">
        <div className="relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(214,179,90,0.15),_transparent_55%)]" />
          <p>{t("customer1.quick.actions.empty")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <header className={clsx(isRTL ? "text-right" : "text-left")}>
        <h2 className="text-2xl font-semibold text-white">
          {t("customer1.quick.actions.title")}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          {t("customer1.quick.actions.subtitle")}
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {actions.map((action, index) => {
          const Icon = resolveIcon(action.icon);
          const isVisible = animatingElements.includes(action.id);

          return (
            <motion.button
              key={action.id}
              type="button"
              onClick={() => onAction(action)}
              initial={{ opacity: 0, y: 14 }}
              animate={
                isVisible
                  ? { opacity: 1, y: 0, transition: { delay: index * 0.04 } }
                  : { opacity: 1, y: 0 }
              }
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              className={clsx(
                "group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0F172D] p-5 text-left text-white transition-all",
                "shadow-[0_25px_60px_-40px_rgba(10,16,32,0.8)]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B35A]/70",
                isRTL && "text-right"
              )}
              aria-label={
                language === "ar"
                  ? action.display_name_ar ?? action.display_name
                  : action.display_name
              }
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(214,179,90,0.18),_transparent_65%)] opacity-90 transition-opacity group-hover:opacity-100" />
              <div
                className={clsx(
                  "relative flex items-start gap-4",
                  isRTL && "flex-row-reverse"
                )}
              >
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[#D6B35A]/40 bg-[#D6B35A]/15 text-[#FBD77F] shadow-inner">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="text-lg font-semibold leading-tight text-white">
                    {language === "ar"
                      ? action.display_name_ar
                      : action.display_name}
                  </span>
                  {action.description && (
                    <span className="text-sm text-slate-300">
                      {language === "ar"
                        ? action.description_ar
                        : action.description}
                    </span>
                  )}
                  <span
                    className={clsx(
                      "mt-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#FBD77F]/80",
                      isRTL && "flex-row-reverse tracking-[0.25em]"
                    )}
                  >
                    {t("customer1.quick.actions.cta")}
                    <Icons.ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
};

