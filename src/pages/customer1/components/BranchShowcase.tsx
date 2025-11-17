import { useLanguage } from "@/contexts/LanguageContext";
import { Branch } from "@/types/branch";
import { MapPin, MessageCircle, Compass } from "lucide-react";
import clsx from "clsx";
import { motion } from "@/lib/motion";

interface BranchShowcaseProps {
  mainBranch?: Branch | null;
  onViewAllBranches: () => void;
  onOpenMaps: (url: string | null) => void;
}

export const BranchShowcase = ({
  mainBranch,
  onViewAllBranches,
  onOpenMaps,
}: BranchShowcaseProps) => {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  if (!mainBranch) {
    return null;
  }

  const formattedAddress =
    language === "ar" ? mainBranch.address_ar : mainBranch.address;
  const branchName = language === "ar" ? mainBranch.name_ar : mainBranch.name;
  const phoneNumber = mainBranch.whatsapp_number;

  const handleWhatsApp = () => {
    if (!phoneNumber) return;
    const sanitized = phoneNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${sanitized}`, "_blank");
  };

  return (
    <section className="space-y-6">
      <header className={clsx(isRTL ? "text-right" : "text-left")}>
        <h2 className="text-3xl font-semibold text-white">
          {t("customer1.branch.title")}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          {t("customer1.branch.subtitle")}
        </p>
      </header>

      <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#1f1f1f] p-6 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(214,179,90,0.2),_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(50,50,50,0.75),_transparent_55%)]" />
          <div className="absolute inset-0 opacity-[0.08] [background-size:140px_140px] [background-image:linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.25)_1px,transparent_1px)]" />
        </div>

        <div
          className={clsx(
            "relative grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]",
            isRTL && "lg:grid-flow-col lg:auto-cols-fr"
          )}
        >
          <div className="space-y-4">
            <div
              className={clsx(
                "flex w-max items-center gap-2 rounded-full border border-[#F4D47A]/40 bg-[#F4D47A]/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-[#FCE9AE]",
                isRTL && "flex-row-reverse tracking-[0.25em]"
              )}
            >
              <Compass className="h-4 w-4 text-[#FCE9AE]" />
              {t("customer1.branch.main")}
            </div>

            <div className={clsx("space-y-2", isRTL ? "text-right" : "text-left")}>
              <h3 className="text-2xl font-semibold text-white">{branchName}</h3>
              {formattedAddress && (
                <p className="text-base leading-relaxed text-slate-200/90">
                  {formattedAddress}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenMaps(mainBranch.google_maps_url)}
                className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-[#F4D47A]/60 bg-[#F4D47A] text-sm font-medium text-[#1A1F2D] shadow-[0_25px_45px_-25px_rgba(244,212,122,0.85)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4D47A]/70"
              >
                <MapPin className="h-5 w-5" />
                {t("customer1.branch.primary")}
              </motion.button>

              {phoneNumber && (
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsApp}
                  className="flex h-14 items-center justify-center gap-3 rounded-2xl border border-white/15 bg-white/8 text-sm font-medium text-white transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <MessageCircle className="h-5 w-5" />
                  {t("customer1.branch.secondary")}
                </motion.button>
              )}
            </div>

            <motion.button
              type="button"
              onClick={onViewAllBranches}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={clsx(
                "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#FCE9AE] transition hover:text-[#FDF3C7]",
                isRTL && "flex-row-reverse tracking-[0.25em]"
              )}
            >
              <span>{t("customer1.branch.view.all")}</span>
              <Compass className="h-4 w-4" />
            </motion.button>
          </div>

          <div className="relative rounded-[28px] border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.18),_transparent_70%)] opacity-60" />
            <div className="relative flex h-full flex-col justify-between gap-4">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                  {t("customer1.branch.hours.title")}
                </p>
                <p className="text-4xl font-bold text-[#F4D47A]">
                  {t("customer1.branch.hours.value")}
                </p>
                <p className="text-sm text-slate-200">
                  {t("customer1.branch.hours.copy")}
                </p>
              </div>
              <div className="space-y-2 text-xs text-slate-300">
                <p>{t("customer1.branch.perk1")}</p>
                <p>{t("customer1.branch.perk2")}</p>
                <p>{t("customer1.branch.perk3")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
