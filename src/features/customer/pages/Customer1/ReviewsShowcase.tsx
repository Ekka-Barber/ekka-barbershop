import clsx from "clsx";
import { Quote } from "lucide-react";

import { useReviews } from "@features/customer/components/hooks/useReviews";

import { motion } from "@shared/lib/motion";
import { Review } from "@shared/services/reviewsService";
import { CachedAvatar } from "@shared/ui/components/cached-avatar";
import { Skeleton } from "@shared/ui/components/skeleton";


import { useLanguage } from "@/contexts/LanguageContext";

export const ReviewsShowcase = () => {
  const { language, t } = useLanguage();
  const { displayedReviews, isLoading, error } = useReviews(language);
  const isRTL = language === "ar";

  const featuredReviews = displayedReviews.slice(0, 3);

  const renderCard = (review: Review, index: number) => {
    return (
      <motion.article
        key={`${review.author_name}-${index}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0, transition: { delay: index * 0.08 } }}
        className="relative overflow-hidden rounded-3xl border border-[#10B981]/20 bg-gradient-to-br from-[#10B981]/5 to-[#1f1f1f] p-6 text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_70%)] opacity-100" />
        <div className="relative flex h-full flex-col gap-4">
          <div
            className={clsx(
              "flex items-center gap-3",
              isRTL && "flex-row-reverse text-right"
            )}
          >
            <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10">
              <CachedAvatar
                googleAvatarUrl={review.profile_photo_url || null}
                cachedAvatarUrl={review.cached_avatar_url || null}
                authorName={review.author_name}
                className="h-full w-full"
                fallbackClassName="bg-white/10 text-white/80 text-lg font-semibold"
                size={48}
              />
              <div className="absolute inset-0 rounded-full ring-1 ring-white/10" />
            </div>
            <div className="flex min-w-0 flex-col">
              <p className="text-sm font-semibold text-white">
                {review.author_name}
              </p>
              <p className="text-xs text-slate-300">
                {language === "ar"
                  ? review.branch_name_ar ?? review.branch_name
                  : review.branch_name}
              </p>
            </div>
            <Quote
              className={clsx(
                "h-6 w-6 text-[#FBD77F]/90",
                isRTL ? "mr-auto rotate-180" : "ml-auto"
              )}
            />
          </div>

          <p className="text-sm leading-relaxed text-slate-200">
            {review.text}
          </p>
        </div>
      </motion.article>
    );
  };

  return (
    <section className="space-y-6">
      <header className={clsx(isRTL ? "text-right" : "text-left")}>
        <h2 className="text-3xl font-semibold text-white">
          {t("customer1.reviews.title")}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          {t("customer1.reviews.subtitle")}
        </p>
      </header>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <Skeleton
              key={item}
              className="h-44 rounded-3xl bg-white/5"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-sm text-red-100">
          {t("error.occurred")}
        </div>
      ) : featuredReviews.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-center text-sm text-slate-300">
          {t("customer1.reviews.empty")}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {featuredReviews.map(renderCard)}
        </div>
      )}
    </section>
  );
};
