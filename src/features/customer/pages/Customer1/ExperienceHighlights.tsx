import clsx from "clsx";
import { Crown, Clock3, Star } from "lucide-react";

import { useLanguage } from "@/contexts/LanguageContext";

export const ExperienceHighlights = () => {
  const { t, language } = useLanguage();
  const isRTL = language === "ar";

  const highlights = [
    {
      id: "atelier",
      title: t("customer1.highlights.item1.title"),
      copy: t("customer1.highlights.item1.copy"),
      Icon: Crown,
    },
    {
      id: "rituals",
      title: t("customer1.highlights.item2.title"),
      copy: t("customer1.highlights.item2.copy"),
      Icon: Star,
    },
    {
      id: "timing",
      title: t("customer1.highlights.item3.title"),
      copy: t("customer1.highlights.item3.copy"),
      Icon: Clock3,
    },
  ];

  return (
    <section className="flex flex-col gap-8">
      <header className={clsx(isRTL ? "text-right" : "text-left")}>
        <p className="text-xs font-semibold uppercase tracking-[0.6em] text-[#8EA4E3]">
          {t("customer1.highlights.title")}
        </p>
      </header>
       <div className="grid gap-6 lg:grid-cols-3">
        {highlights.map(({ id, title, copy, Icon }) => (
          <article
            key={id}
            className="relative overflow-hidden rounded-3xl border border-[#efc780]/40 bg-gradient-to-br from-[#efc780]/10 via-[#efc780]/5 to-[#2a2a2a] p-[1px]"
          >
            <div className="relative h-full rounded-[calc(1.5rem-1px)] bg-gradient-to-br from-[#252525] to-[#1f1f1f] p-7 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9),0_10px_30px_-10px_rgba(232,198,111,0.15)]">
              <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#efc780]/15 blur-[110px] gold-glow-blur" />
              <div
                className={clsx(
                  "relative flex h-full flex-col gap-4",
                  isRTL ? "text-right" : "text-left"
                )}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#efc780]/50 bg-[#efc780]/10 backdrop-blur gold-glow-sm">
                  <Icon className="h-6 w-6 text-[#FCD885]" />
                </span>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="text-sm leading-relaxed text-slate-200">{copy}</p>
                <div
                  className={clsx(
                    "mt-auto flex items-center text-xs font-semibold uppercase tracking-[0.35em] text-[#FCD885]/70",
                    isRTL && "flex-row-reverse tracking-[0.2em]"
                  )}
                >
                  {t("customer1.highlights.cta")}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
