import { useI18n, type Lang } from "@/i18n/I18nProvider";

export const LanguageToggle = () => {
  const { lang, setLang } = useI18n();
  const opts: { id: Lang; label: string }[] = [
    { id: "en", label: "EN" },
    { id: "ar", label: "ع" },
  ];
  return (
    <div className="flex items-center gap-1 rounded-full border-2 border-border bg-card p-1 shadow-soft">
      {opts.map((o) => {
        const active = lang === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => setLang(o.id)}
            aria-pressed={active}
            aria-label={`Switch to ${o.id === "ar" ? "Arabic" : "English"}`}
            className={`flex h-8 min-w-[34px] items-center justify-center rounded-full px-2.5 text-xs font-extrabold transition-bounce ${
              active
                ? "bg-primary text-primary-foreground shadow-elevated"
                : "text-foreground hover:bg-muted"
            }`}
            style={{ fontFamily: o.id === "ar" ? "'Noto Naskh Arabic', serif" : undefined }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
};
