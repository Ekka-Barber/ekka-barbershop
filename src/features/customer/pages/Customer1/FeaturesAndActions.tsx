import clsx from "clsx";
import { Crown, Clock3, Star, ArrowUpRight } from "lucide-react";

import { getIcon } from "@shared/lib/icons";
import { motion } from "@shared/lib/motion";
import type { Tables } from "@shared/types/supabase";

import { useLanguage } from "@/contexts/LanguageContext";

type UiElement = Tables<'ui_elements'>;

interface FeaturesAndActionsProps {
  actions: UiElement[];
  onAction: (element: UiElement) => void;
  animatingElements: string[];
}



export const FeaturesAndActions = ({
  actions,
  onAction,
  animatingElements,
}: FeaturesAndActionsProps) => {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const features = [
    {
      id: "atelier",
      title: t("customer1.highlights.item1.title"),
      copy: t("customer1.highlights.item1.copy"),
      Icon: Crown,
      color: "#efc780", // Gold
      bgColor: "from-[#efc780]/10 to-[#efc780]/5",
      borderColor: "border-[#efc780]/30",
    },
    {
      id: "rituals",
      title: t("customer1.highlights.item2.title"),
      copy: t("customer1.highlights.item2.copy"),
      Icon: Star,
      color: "#9CA3AF", // Gray
      bgColor: "from-[#9CA3AF]/10 to-[#9CA3AF]/5",
      borderColor: "border-[#9CA3AF]/30",
    },
    {
      id: "timing",
      title: t("customer1.highlights.item3.title"),
      copy: t("customer1.highlights.item3.copy"),
      Icon: Clock3,
      color: "#10B981", // Green
      bgColor: "from-[#10B981]/10 to-[#10B981]/5",
      borderColor: "border-[#10B981]/30",
    },
  ];

  return (
    <section className="space-y-8">
      {/* Features Section */}
      <div className="space-y-6">
        <header className={clsx(isRTL ? "text-right" : "text-left")}>
          <p className="text-xs font-semibold uppercase tracking-[0.6em] text-[#9CA3AF]">
            {t("customer1.highlights.title")}
          </p>
          <h2 className="mt-3 text-4xl font-bold text-white">
            {t("customer1.features.title")}
          </h2>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map(({ id, title, copy, Icon, color, bgColor, borderColor }, index) => (
            <motion.article
              key={id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0, transition: { delay: index * 0.08, duration: 0.5 } }}
              className={clsx(
                "relative overflow-hidden rounded-3xl border bg-gradient-to-br p-[1px] shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)]",
                borderColor
              )}
            >
              <div className={clsx(
                "relative h-full rounded-[calc(1.5rem-1px)] bg-gradient-to-br p-6",
                bgColor
              )}>
                <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full opacity-20 blur-[110px]" style={{ backgroundColor: color }} />
                <div
                  className={clsx(
                    "relative flex h-full flex-col gap-4",
                    isRTL ? "text-right" : "text-left"
                  )}
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border backdrop-blur" style={{ borderColor: color, backgroundColor: `${color}20` }}>
                    <Icon className="h-6 w-6" style={{ color }} />
                  </span>
                  <h3 className="text-base font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-200">{copy}</p>
                  <div
                    className={clsx(
                      "mt-auto flex items-center text-xs font-semibold uppercase tracking-[0.35em] opacity-70",
                      isRTL && "flex-row-reverse tracking-[0.2em]"
                    )}
                    style={{ color }}
                  >
                    {t("customer1.highlights.cta")}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Actions Section */}
      <div className="space-y-6">
        <header className={clsx(isRTL ? "text-right" : "text-left")}>
          <h3 className="text-3xl font-semibold text-white">
            {t("customer1.quick.actions.title")}
          </h3>
          <p className="mt-2 text-sm text-slate-300">
            {t("customer1.quick.actions.subtitle")}
          </p>
        </header>

        {actions.length === 0 ? (
          <section className="overflow-hidden rounded-3xl border border-dashed border-white/10 bg-gradient-to-br from-white/5 to-transparent p-10 text-center text-sm text-slate-300">
            <div className="relative">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(214,179,90,0.15),_transparent_55%)]" />
              <p>{t("customer1.quick.actions.empty")}</p>
            </div>
          </section>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                      ? { opacity: 1, y: 0, transition: { delay: index * 0.04 + 0.2, duration: 0.4 } }
                      : { opacity: 1, y: 0 }
                  }
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.99 }}
                  className={clsx(
                    "group relative overflow-hidden rounded-3xl border border-white/10 bg-[#1f1f1f] p-5 text-left text-white transition-all",
                    "shadow-[0_25px_60px_-40px_rgba(31,31,31,0.8)]",
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
                    <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-[#efc780]/40 bg-[#efc780]/15 text-[#FBD77F] shadow-inner">
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
        )}
      </div>
    </section>
  );
};
