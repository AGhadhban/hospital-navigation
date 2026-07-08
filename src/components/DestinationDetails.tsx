import type { Destination } from "@/data/destinations";
import { localized } from "@/data/destinations";
import { useI18n } from "@/i18n/I18nProvider";

interface DestinationDetailsProps {
  destination: Destination;
}

export const DestinationDetails = ({ destination }: DestinationDetailsProps) => {
  const { t, lang } = useI18n();
  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold ${
            destination.isOpen24
              ? "bg-success/15 text-success"
              : "bg-primary/10 text-primary"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
          </span>
          {destination.isOpen24 ? t.open24 : t.openToday}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/30 px-3 py-1 text-xs font-extrabold text-foreground">
          <span>{destination.phone}</span>
        </span>
        <a
          href={`tel:${destination.phone.replace(/\s/g, "")}`}
          className="ms-auto inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-extrabold text-secondary-foreground shadow-warm"
        >
          {t.call}
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border-2 border-border bg-card p-3">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
            {t.hours}
          </p>
          <p className="mt-1 text-sm font-bold leading-snug text-foreground">
            🕒 {localized(destination.hours, lang)}
          </p>
        </div>
        <div className="rounded-2xl border-2 border-border bg-card p-3">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground">
            {t.phone}
          </p>
          <p className="mt-1 text-sm font-bold leading-snug text-foreground" dir="ltr">
            ☎️ {destination.phone}
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-soft p-4">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary">
          {t.helpfulTips}
        </p>
        <ul className="mt-2 space-y-1.5">
          {destination.tips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground">
              <span aria-hidden className="text-secondary">•</span>
              <span>{localized(tip, lang)}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};
