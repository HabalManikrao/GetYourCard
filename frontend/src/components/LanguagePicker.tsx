import { useMemo, useState } from "react";
import { Search, X, Check } from "lucide-react";
import { useRegistry } from "../store/registry";

interface Props {
  selected: string[];
  onChange: (locales: string[]) => void;
  max?: number;
}

/** Searchable, multi-select language picker backed by the dynamic registry. */
export function LanguagePicker({ selected, onChange, max = 4 }: Props) {
  const { languages } = useRegistry();
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const ql = q.trim().toLowerCase();
    if (!ql) return languages;
    return languages.filter(
      (l) =>
        l.name.toLowerCase().includes(ql) ||
        l.native_name.toLowerCase().includes(ql) ||
        l.locale.toLowerCase().includes(ql),
    );
  }, [q, languages]);

  const toggle = (locale: string) => {
    if (selected.includes(locale)) onChange(selected.filter((l) => l !== locale));
    else if (selected.length < max) onChange([...selected, locale]);
  };

  const byLocale = useMemo(() => new Map(languages.map((l) => [l.locale, l])), [languages]);

  return (
    <div>
      {selected.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {selected.map((loc, i) => {
            const l = byLocale.get(loc);
            return (
              <span
                key={loc}
                className="flex items-center gap-1.5 rounded-full bg-maroon px-3 py-1 text-sm text-ivory"
              >
                {i === 0 && <span className="text-[10px] text-gold-pale">PRIMARY</span>}
                {l?.name} <span className="opacity-60">{l?.native_name}</span>
                {l?.direction === "rtl" && <span className="text-[10px] text-gold-pale">RTL</span>}
                <button onClick={() => toggle(loc)} aria-label={`Remove ${l?.name}`}>
                  <X size={13} />
                </button>
              </span>
            );
          })}
        </div>
      )}
      <div className="relative mb-2">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon/40" />
        <input
          className="input pl-9"
          placeholder="Search 40+ languages…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search languages"
        />
      </div>
      <div className="max-h-56 overflow-y-auto rounded-lg border border-maroon/10 bg-white">
        {results.map((l) => {
          const on = selected.includes(l.locale);
          const disabled = !on && selected.length >= max;
          return (
            <button
              key={l.locale}
              disabled={disabled}
              onClick={() => toggle(l.locale)}
              className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-ivory disabled:opacity-40 ${
                on ? "bg-gold/10" : ""
              }`}
            >
              <span>
                <span className="font-medium text-maroon">{l.name}</span>{" "}
                <span className="text-maroon/50">{l.native_name}</span>
              </span>
              <span className="flex items-center gap-2 text-xs text-maroon/40">
                {l.direction === "rtl" && <span className="rounded bg-blush/20 px-1">RTL</span>}
                <span>{l.locale}</span>
                {on && <Check size={14} className="text-gold" />}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-maroon/50">
        Choose up to {max}. The first is the primary language. You can add more and translate later.
      </p>
    </div>
  );
}
