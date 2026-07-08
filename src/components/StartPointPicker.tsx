import { useState } from "react";
import { START_POINTS, localized, type StartPoint } from "@/data/destinations";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

interface Props {
  value: StartPoint;
  onChange: (s: StartPoint) => void;
}

export const StartPointPicker = ({ value, onChange }: Props) => {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-5 rounded-2xl border-2 border-border bg-card p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-2xl">
          {value.icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
            {t.startingFrom}
          </p>
          <p className="truncate text-base font-extrabold text-foreground">
            {localized(value.name, lang)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="shrink-0 rounded-full border-2 border-border px-3 py-1.5 text-xs font-bold text-foreground transition-smooth hover:border-primary/50"
        >
          {t.changeStart}
        </button>
      </div>

      {open && (
        <div className="mt-4">
          <p className="text-xs font-bold text-muted-foreground">{t.pickStartHint}</p>
          <ul className="mt-3 space-y-2">
            {START_POINTS.map((s) => {
              const active = s.id === value.id;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(s);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border-2 p-3 text-start transition-smooth",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <span className="text-2xl">{s.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-extrabold text-foreground">
                        {localized(s.name, lang)}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {localized(s.description, lang)}
                      </span>
                    </span>
                    {active && <span className="text-primary">●</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
};
