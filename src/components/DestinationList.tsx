import { CATEGORIES, DESTINATIONS, localized, type Destination } from "@/data/destinations";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface DestinationListProps {
  query: string;
  onQuery: (q: string) => void;
  category: string;
  onCategory: (c: string) => void;
  onSelect: (d: Destination) => void;
  selectedId?: string;
}

export const DestinationList = ({
  query,
  onQuery,
  category,
  onCategory,
  onSelect,
  selectedId,
}: DestinationListProps) => {
  const { t, lang } = useI18n();

  const filtered = DESTINATIONS.filter((d) => {
    const matchesCat = category === "all" || d.category === category;
    const name = localized(d.name, lang).toLowerCase();
    const desc = localized(d.description, lang).toLowerCase();
    const matchesQ = !query || name.includes(query.toLowerCase()) || desc.includes(query.toLowerCase());
    return matchesCat && matchesQ;
  });

  return (
    <section aria-label="Destinations">
      <label className="relative block">
        <span className="sr-only">{t.searchPlaceholder}</span>
        <span className="pointer-events-none absolute start-5 top-1/2 -translate-y-1/2 text-xl">
          🔍
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="h-14 w-full rounded-2xl border-2 border-border bg-card ps-12 pe-4 text-base font-semibold text-foreground placeholder:font-normal placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/20"
        />
      </label>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {CATEGORIES.map((c) => {
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onCategory(c.id)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-bold transition-bounce",
                active
                  ? "border-primary bg-primary text-primary-foreground shadow-elevated"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              )}
            >
              <span aria-hidden>{c.emoji}</span>
              {t[c.key]}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 space-y-3">
        {filtered.length === 0 && (
          <li className="rounded-2xl border-2 border-dashed border-border p-8 text-center text-muted-foreground">
            {t.noResults}
          </li>
        )}
        {filtered.map((d) => {
          const active = selectedId === d.id;
          return (
            <li key={d.id}>
              <button
                type="button"
                onClick={() => onSelect(d)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-2xl border-2 bg-card p-4 text-start transition-smooth",
                  active
                    ? "border-primary shadow-elevated"
                    : "border-border hover:border-primary/40 hover:shadow-soft"
                )}
              >
                <div
                  className={cn(
                    "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl",
                    d.category === "emergency"
                      ? "bg-secondary/15"
                      : d.category === "clinic"
                        ? "bg-primary/10"
                        : d.category === "service"
                          ? "bg-accent/25"
                          : "bg-muted"
                  )}
                  aria-hidden
                >
                  {d.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold text-foreground">
                    {localized(d.name, lang)}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {localized(d.floor, lang)} · {localized(d.wing, lang)}
                  </p>
                </div>
                <div className="shrink-0 text-end">
                  <p className="text-base font-extrabold text-primary">
                    {d.walkMinutes} {t.min}
                  </p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {t.walk}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
