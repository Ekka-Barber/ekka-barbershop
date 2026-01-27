import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { Sparkles, Scissors, Crown, MapPin, Phone, Clock } from "lucide-react";

import { motion } from "@shared/lib/motion";
import { supabase } from "@shared/lib/supabase/client";

import { useLanguage } from "@/contexts/LanguageContext";

interface HeroSectionProps {
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
}

export const HeroSection = ({
  onPrimaryAction,
  onSecondaryAction,
}: HeroSectionProps) => {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  // Fetch main branch information for business details - Google Ads Compliance
  const { data: mainBranch } = useQuery({
    queryKey: ['main-branch'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('branches')
        .select('name, name_ar, address, address_ar, whatsapp_number')
        .eq('is_main', true)
        .single();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fallback business information for Google Ads compliance - ensures bots see same info as users
  const fallbackBusinessInfo = {
    address: "[Full Business Address]",
    address_ar: "[العنوان التجاري الكامل]",
    whatsapp_number: "[+966-XX-XXXXXXX]"
  };

  return (
    <section className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#1a1a1a] via-[#222222] to-[#1f1f1f] px-5 py-8 text-white shadow-[0_50px_140px_-60px_rgba(0,0,0,0.85),0_20px_60px_-30px_rgba(214,179,90,0.25)] sm:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#efc780]/30 blur-[160px] gold-glow-blur" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-[#3a3a3a]/70 blur-[140px]" />
        <div className="absolute left-6 top-6 h-16 w-16 rounded-full border border-white/20 gold-glow-sm" />
        <div className="absolute bottom-8 right-10 flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#efc780]/50 bg-[#efc780]/10 gold-glow-md">
          <Scissors className="h-7 w-7 text-[#efc780]" />
        </div>
      </div>

      <div
        className={clsx(
          "relative z-10 grid gap-6",
          "md:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)] md:items-center"
        )}
      >
        <div
          className={clsx(
            "space-y-5",
            isRTL ? "text-right md:order-2" : "text-left md:order-1"
          )}
        >
          {/* Business Information - Google Ads Compliance - Always visible */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={clsx(
              "mb-6 flex flex-wrap items-center gap-4 rounded-[24px] border border-white/15 bg-white/[0.05] px-6 py-4 backdrop-blur-xl shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6),0_10px_30px_-10px_rgba(232,198,111,0.15)]",
              isRTL ? "flex-row-reverse text-right" : "flex-row text-left"
            )}
          >
            <div className={clsx("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
              <MapPin className="h-4 w-4 text-[#efc780]" />
              <span className="text-sm text-white/90">
                {language === "ar"
                  ? (mainBranch?.address_ar || fallbackBusinessInfo.address_ar)
                  : (mainBranch?.address || fallbackBusinessInfo.address)
                }
              </span>
            </div>

            <div className={clsx("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
              <Phone className="h-4 w-4 text-[#efc780]" />
              <span className="text-sm text-white/90">
                {mainBranch?.whatsapp_number || fallbackBusinessInfo.whatsapp_number}
              </span>
            </div>

            <div className={clsx("flex items-center gap-2", isRTL ? "flex-row-reverse" : "flex-row")}>
              <Clock className="h-4 w-4 text-[#efc780]" />
              <span className="text-sm text-white/90">
                {t("customer1.branch.hours.value")}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={clsx(
              "relative flex items-center gap-5 rounded-[32px] border border-white/20 bg-white/[0.08] px-5 py-4 backdrop-blur-2xl shadow-[0_50px_130px_-60px_rgba(0,0,0,0.95),0_20px_50px_-20px_rgba(214,179,90,0.15)]",
              isRTL ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-[24px] border-2 border-white/25 bg-gradient-to-br from-white/25 to-white/10 p-2 shadow-[0_30px_60px_-35px_rgba(0,0,0,0.9),0_10px_30px_-10px_rgba(232,198,111,0.3)]">
              <img
                src="/lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.png"
                alt={t("customer1.hero.logo.alt")}
                className="h-full w-full object-contain"
                loading="eager"
                width={80}
                height={80}
              />
              <span className="absolute inset-0 rounded-[24px] ring-1 ring-white/30" />
            </div>
            <div
              className={clsx(
                "flex flex-col",
                isRTL ? "items-end text-right" : "items-start text-left"
              )}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.45em] text-[#FCEED1]/80">
                {t("customer1.hero.logo.caption")}
              </span>
              <span className="mt-1 text-lg font-bold uppercase tracking-[0.3em] text-white drop-shadow-[0_2px_10px_rgba(232,198,111,0.3)]">
                {t("customer1.hero.logo.title")}
              </span>
            </div>
            <motion.div
              className="absolute -bottom-px inset-x-5 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ transformOrigin: "center" }}
            />
          </motion.div>

          <span
            className={clsx(
              "inline-flex items-center gap-3 rounded-full bg-white/[0.12] border border-white/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.5em] text-[#FCEED1] shadow-[0_10px_30px_-10px_rgba(232,198,111,0.2)]",
              isRTL && "flex-row-reverse tracking-[0.3em]"
            )}
          >
            <Sparkles className="h-4 w-4 text-[#FBC252] drop-shadow-[0_0_8px_rgba(251,194,82,0.5)]" />
            {t("customer1.hero.tagline")}
          </span>

          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
              {t("customer1.hero.title")}
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg">
              {t("customer1.hero.description")}
            </p>
          </div>

          <div
            className={clsx(
              "flex flex-col gap-4 sm:flex-row sm:items-center",
              isRTL && "sm:flex-row-reverse"
            )}
          >
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onPrimaryAction}
              className="group flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#E8C66F] via-[#D6B35A] to-[#C79A2A] text-base font-semibold text-[#181C27] shadow-[0_25px_50px_-20px_rgba(232,198,111,0.8),0_10px_25px_-10px_rgba(214,179,90,0.4)] transition-all hover:shadow-[0_30px_60px_-20px_rgba(232,198,111,0.9),0_15px_35px_-10px_rgba(214,179,90,0.5)]"
            >
              {t("customer1.hero.primary")}
              <Crown className="h-5 w-5 transition-transform group-hover:translate-x-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={onSecondaryAction}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-full border-2 border-white/20 bg-white/[0.08] text-base font-medium text-white shadow-[0_15px_35px_-15px_rgba(255,255,255,0.1)] transition-all hover:border-white/30 hover:bg-white/[0.15] hover:shadow-[0_20px_45px_-15px_rgba(255,255,255,0.15)] backdrop-blur-sm"
            >
              {t("customer1.hero.secondary")}
            </motion.button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={clsx(
            "relative overflow-hidden rounded-[32px] border-2 border-white/15 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-8 text-white backdrop-blur-2xl shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6),0_10px_30px_-10px_rgba(232,198,111,0.15),inset_0_1px_2px_rgba(255,255,255,0.1)]",
            isRTL ? "md:order-1" : "md:order-2"
          )}
        >
          <div className="flex flex-col gap-6">
            <div
              className={clsx(
                "flex items-center justify-between text-sm uppercase tracking-[0.4em] text-slate-300/80",
                isRTL && "flex-row-reverse"
              )}
            >
              <span>{t("customer1.hero.card.title")}</span>
              <span className="text-[#FBC252]">Ekka</span>
            </div>

            <div className="space-y-5">
              <p className="text-lg font-semibold leading-relaxed text-slate-50 drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                {t("customer1.hero.card.copy")}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
                <div className="rounded-[20px] border-2 border-white/15 bg-white/[0.08] p-4 text-center shadow-[0_15px_35px_-15px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.1)] backdrop-blur-sm">
                  <p className="text-2xl font-bold text-[#FBC252] drop-shadow-[0_2px_10px_rgba(251,194,82,0.4)]">+150</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                    {t("customer1.hero.card.stat1")}
                  </p>
                </div>
                <div className="rounded-[20px] border-2 border-white/15 bg-white/[0.08] p-4 text-center shadow-[0_15px_35px_-15px_rgba(0,0,0,0.4),inset_0_1px_2px_rgba(255,255,255,0.1)] backdrop-blur-sm">
                  <p className="text-2xl font-bold text-[#FBC252] drop-shadow-[0_2px_10px_rgba(251,194,82,0.4)]">4.9</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                    {t("customer1.hero.card.stat2")}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-6 bottom-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
      </div>
    </section>
  );
};
