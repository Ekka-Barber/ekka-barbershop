export const SectionSeparator = () => {
  return (
    <div className="relative py-8 sm:py-10">
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#efc780]/30 to-transparent blur-sm" />
      <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#efc780]/60 to-[#e39f26]/40 shadow-[0_0_12px_rgba(214,179,90,0.4)]" />
    </div>
  );
};
