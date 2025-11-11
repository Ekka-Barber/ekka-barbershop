import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "@/lib/motion";
import { Sparkles, Scissors, Crown } from "lucide-react";
import clsx from "clsx";

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

  return (
    <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1a1a1a] via-[#252525] to-[#2a2a2a] px-5 py-8 text-white shadow-[0_40px_120px_-60px_rgba(0,0,0,0.7)] sm:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[#D6B35A]/20 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-[#4a4a4a]/60 blur-[120px]" />
        <div className="absolute left-6 top-6 h-16 w-16 rounded-full border border-white/15" />
        <div className="absolute bottom-8 right-10 flex h-20 w-20 items-center justify-center rounded-full border border-[#D6B35A]/40">
          <Scissors className="h-7 w-7 text-[#D6B35A]" />
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={clsx(
              "relative flex items-center gap-5 rounded-[28px] border border-white/15 bg-white/10/5 px-5 py-4 backdrop-blur-xl shadow-[0_45px_120px_-60px_rgba(26,26,26,0.9)]",
              isRTL ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/20 to-white/5 p-2 shadow-[0_25px_50px_-35px_rgba(0,0,0,0.8)]">
              <img
                src="/lovable-uploads/7eb81221-fbf5-4b1d-8327-eb0e707236d8.png"
                alt={t("customer1.hero.logo.alt")}
                className="h-full w-full object-contain"
                loading="lazy"
                width={80}
                height={80}
              />
              <span className="absolute inset-0 rounded-3xl ring-1 ring-white/20" />
            </div>
            <div
              className={clsx(
                "flex flex-col",
                isRTL ? "items-end text-right" : "items-start text-left"
              )}
            >
              <span className="text-xs font-semibold uppercase tracking-[0.45em] text-[#FCEED1]/70">
                {t("customer1.hero.logo.caption")}
              </span>
              <span className="mt-1 text-lg font-bold uppercase tracking-[0.3em] text-white">
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
              "inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.5em] text-[#FCEED1]",
              isRTL && "flex-row-reverse tracking-[0.3em]"
            )}
          >
            <Sparkles className="h-4 w-4 text-[#FBC252]" />
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
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onPrimaryAction}
              className="group flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#D6B35A] to-[#C79A2A] text-base font-semibold text-[#181C27] shadow-[0_20px_40px_-20px_rgba(198,152,56,0.7)] transition"
            >
              {t("customer1.hero.primary")}
              <Crown className="h-5 w-5 transition group-hover:translate-x-1" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onSecondaryAction}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-full border border-white/15 bg-white/5 text-base font-semibold text-white transition hover:border-white/25 hover:bg-white/10"
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
            "relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-8 text-white backdrop-blur-xl",
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
              <p className="text-lg font-semibold leading-relaxed text-slate-50">
                {t("customer1.hero.card.copy")}
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-200">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold text-[#FBC252]">+150</p>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-300">
                    {t("customer1.hero.card.stat1")}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
                  <p className="text-2xl font-bold text-[#FBC252]">4.9</p>
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
