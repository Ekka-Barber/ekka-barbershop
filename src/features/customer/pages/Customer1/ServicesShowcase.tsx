import clsx from "clsx";
import { Sparkles, Gift } from "lucide-react";

import { motion } from "@shared/lib/motion";
import type { Tables } from "@shared/types/supabase";

import { useLanguage } from "@/contexts/LanguageContext";

type UiElement = Tables<"ui_elements">;

interface ServicesShowcaseProps {
  loyaltyElement?: UiElement;
  eidElement?: UiElement;
  onLoyaltyActivate?: () => void;
  onOpenEidDialog?: () => void;
}

export const ServicesShowcase = ({
  loyaltyElement,
  eidElement,
  onLoyaltyActivate,
  onOpenEidDialog,
}: ServicesShowcaseProps) => {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  if (!loyaltyElement && !eidElement) {
    return null;
  }

  return (
    <section className="space-y-6">
      <header className={clsx(isRTL ? "text-right" : "text-left")}>
        <h2 className="text-3xl font-semibold text-white">
          {t("customer1.services.title")}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          {t("customer1.services.subtitle")}
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {loyaltyElement && (
          <motion.div
            key={loyaltyElement.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.5 } }}
            className="relative overflow-hidden rounded-[30px] border border-[#efc780]/40 bg-gradient-to-br from-[#efc780]/10 via-[#efc780]/5 to-[#2a2a2a] p-[1px]"
          >
            <div className="relative h-full overflow-hidden rounded-[29px] bg-gradient-to-br from-[#252525] to-[#1f1f1f] p-8">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#efc780]/25 blur-[120px] gold-glow-blur" />
                <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-[#efc780]/20 blur-[120px] gold-glow-md" />
              </div>

              <div
                className={clsx(
                  "relative flex flex-col gap-6 text-white",
                  isRTL ? "text-right" : "text-left"
                )}
              >
                <span className="inline-flex w-max items-center gap-2 rounded-full border border-[#efc780]/40 bg-[#efc780]/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#FCE9AE]">
                  <Sparkles className="h-4 w-4 text-[#FCE9AE]" />
                  {t("customer1.services.loyalty.badge")}
                </span>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold leading-snug">
                    {language === "ar"
                      ? loyaltyElement.display_name_ar
                      : loyaltyElement.display_name}
                  </h3>
                  {loyaltyElement.description && (
                    <p className="text-sm text-slate-200/90">
                      {language === "ar"
                        ? loyaltyElement.description_ar
                        : loyaltyElement.description}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.4em] text-[#FCE9AE]/70">
                  <span>{t("customer1.services.loyalty.perk1")}</span>
                  <span className="h-2 w-2 rounded-full bg-[#FCE9AE]/40" />
                  <span>{t("customer1.services.loyalty.perk2")}</span>
                  <span className="h-2 w-2 rounded-full bg-[#FCE9AE]/40" />
                  <span>{t("customer1.services.loyalty.perk3")}</span>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ y: onLoyaltyActivate ? -2 : 0 }}
                  whileTap={{ scale: onLoyaltyActivate ? 0.98 : 1 }}
                  onClick={() => onLoyaltyActivate?.()}
                  disabled={!onLoyaltyActivate}
                  className={clsx(
                    "rounded-full border border-[#FCE9AE]/50 bg-[#FCE9AE] px-6 py-3 text-sm font-medium text-[#1A1F2D] shadow-[0_20px_40px_-25px_rgba(244,212,122,0.9)]",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FCE9AE]/80"
                  )}
                >
                  {t("customer1.services.loyalty.cta")}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {eidElement && (
          <motion.div
            key={eidElement.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.5 } }}
            className="relative overflow-hidden rounded-[30px] border border-[#9CA3AF]/40 bg-gradient-to-br from-[#9CA3AF]/10 via-[#9CA3AF]/5 to-[#2a2a2a] p-[1px]"
          >
            <div className="relative h-full overflow-hidden rounded-[29px] bg-gradient-to-br from-[#2a2a2a] via-[#252525] to-[#1f1f1f] p-8">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -bottom-10 left-1/3 h-48 w-48 rounded-full bg-[#9CA3AF]/20 blur-[130px]" />
                <div className="absolute -top-12 right-4 h-32 w-32 rounded-full bg-[#D1D5DB]/10 blur-[100px]" />
              </div>

              <div
                className={clsx(
                  "relative flex h-full flex-col gap-6 text-white",
                  isRTL ? "text-right" : "text-left"
                )}
              >
                <span className="inline-flex w-max items-center gap-2 rounded-full border border-[#D1D5DB]/40 bg-[#D1D5DB]/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#E5E7EB]">
                  <Gift className="h-4 w-4 text-[#E5E7EB]" />
                  {t("customer1.services.eid.badge")}
                </span>

                <div className="space-y-3">
                  <h3 className="text-xl font-semibold leading-snug">
                    {language === "ar"
                      ? eidElement.display_name_ar
                      : eidElement.display_name}
                  </h3>
                  {eidElement.description && (
                    <p className="text-sm text-slate-200/90">
                      {language === "ar"
                        ? eidElement.description_ar
                        : eidElement.description}
                    </p>
                  )}
                </div>

                <ul
                  className={clsx(
                    "space-y-2 text-sm text-slate-200/90",
                    isRTL && "text-right"
                  )}
                >
                  <li>• {t("customer1.services.eid.perk1")}</li>
                  <li>• {t("customer1.services.eid.perk2")}</li>
                  <li>• {t("customer1.services.eid.perk3")}</li>
                </ul>

                <div className="mt-auto flex flex-wrap items-center gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ y: onOpenEidDialog ? -2 : 0 }}
                    whileTap={{ scale: onOpenEidDialog ? 0.98 : 1 }}
                    onClick={() => onOpenEidDialog?.()}
                    disabled={!onOpenEidDialog}
                    className="rounded-full border border-[#D1D5DB]/50 bg-transparent px-6 py-3 text-sm font-medium text-[#F3F4F6] backdrop-blur focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D1D5DB]/70"
                  >
                    {t("customer1.services.eid.cta")}
                  </motion.button>
                  <span className="text-xs uppercase tracking-[0.35em] text-[#E5E7EB]/70">
                    {t("customer1.services.eid.caption")}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
