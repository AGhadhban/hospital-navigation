import { useState } from "react";
import { START_POINTS, localized } from "@/data/destinations";
import { useI18n } from "@/i18n/I18nProvider";

const qrUrl = (data: string, size = 260) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=8&data=${encodeURIComponent(data)}`;

export const QRCodesPanel = () => {
  const { t, lang } = useI18n();
  const [copied, setCopied] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const handleCopy = async (link: string, id: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(id);
      setTimeout(() => setCopied(null), 1400);
    } catch {
      /* noop */
    }
  };

  return (
    <section className="mt-8 rounded-3xl border-2 border-dashed border-border bg-card p-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 text-start"
      >
        <div className="min-w-0">
          <h3 className="font-serif text-lg font-extrabold text-foreground">
            📱 {t.qrCodes}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">{t.qrHint}</p>
        </div>
        <span className="text-xl">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-full bg-hero px-4 py-2 text-xs font-extrabold text-primary-foreground shadow-soft"
            >
              {t.print}
            </button>
          </div>

          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {START_POINTS.map((s) => {
              const link = `${origin}/?start=${s.id}`;
              return (
                <li
                  key={s.id}
                  className="flex flex-col items-center gap-3 rounded-2xl border-2 border-border bg-soft p-4 text-center"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{s.icon}</span>
                    <span className="text-sm font-extrabold text-foreground">
                      {localized(s.name, lang)}
                    </span>
                  </div>
                  <img
                    src={qrUrl(link)}
                    alt={`QR for ${localized(s.name, lang)}`}
                    width={180}
                    height={180}
                    className="h-40 w-40 rounded-xl bg-white p-2 shadow-soft"
                    loading="lazy"
                  />
                  <p className="text-[11px] font-bold text-muted-foreground">
                    {t.scanToStart}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopy(link, s.id)}
                    className="w-full truncate rounded-full border-2 border-border bg-card px-3 py-1.5 text-[11px] font-bold text-foreground transition-smooth hover:border-primary/50"
                    title={link}
                  >
                    {copied === s.id ? t.copied : `${t.copyLink} · /?start=${s.id}`}
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
};
