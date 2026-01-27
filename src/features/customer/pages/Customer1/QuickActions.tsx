import clsx from "clsx";
import { ArrowUpRight } from "lucide-react";

import { getIcon } from "@shared/lib/icons";
import { motion } from "@shared/lib/motion";
import type { Tables } from "@shared/types/supabase";

import { useLanguage } from "@/contexts/LanguageContext";

type UiElement = Tables<'ui_elements'>;

interface QuickActionsProps {
  actions: UiElement[];
  onAction: (element: UiElement) => void;
  animatingElements: string[];
}



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
          const Icon = getIcon(action.icon);
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
                "shadow-[0_30px_70px_-30px_rgba(10,16,32,0.8),0_10px_30px_-10px_rgba(232,198,111,0.15)]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#efc780]/70",
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
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[#efc780]/40 bg-[#efc780]/15 text-[#FBD77F] shadow-inner gold-glow-sm">
                  <Icon className="h-6 w-6" />
                </span>
                <div className="flex min-w-0 flex-col gap-2">
                  <span className="text-lg font-medium leading-tight text-white">
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
                     <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
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
