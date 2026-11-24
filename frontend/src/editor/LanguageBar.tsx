import { useState } from "react";
import { Languages, Plus, X } from "lucide-react";
import { useEditor } from "../store/editor";
import { useRegistry } from "../store/registry";
import { LanguagePicker } from "../components/LanguagePicker";
import { buildLayer } from "../lib/docFactory";

export default function LanguageBar() {
  const doc = useEditor((s) => s.doc);
  const setPrimaryLocale = useEditor((s) => s.setPrimaryLocale);
  const addLanguageLayer = useEditor((s) => s.addLanguageLayer);
  const removeLanguageLayer = useEditor((s) => s.removeLanguageLayer);
  const { languages } = useRegistry();
  const [adding, setAdding] = useState(false);
  const [pending, setPending] = useState<string[]>([]);

  if (!doc) return null;
  const nameOf = (loc: string) => languages.find((l) => l.locale === loc)?.name || loc;

  const confirmAdd = async () => {
    for (const loc of pending) {
      if (doc.languages.find((l) => l.locale === loc)) continue;
      const layer = await buildLayer(loc, languages.find((l) => l.locale === loc));
      addLanguageLayer(layer);
    }
    setPending([]);
    setAdding(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-stone-300 bg-ivory/90 px-4 py-2">
      <Languages size={16} className="text-maroon" />
      <span className="text-xs text-stone-500">Showing:</span>
      {doc.languages.length === 0 && <span className="text-xs text-stone-400">No language layers</span>}
      {doc.languages.map((l) => (
        <span
          key={l.locale}
          className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs ${
            l.locale === doc.primaryLocale ? "bg-maroon text-ivory" : "bg-white text-maroon"
          }`}
        >
          <button onClick={() => setPrimaryLocale(l.locale)} title="Show this language">
            {nameOf(l.locale)}
            {l.direction === "rtl" && <span className="ml-1 text-[9px] text-gold-pale">RTL</span>}
            {l.verified === false && <span className="ml-1 text-[9px] text-amber-300">unverified</span>}
          </button>
          {doc.languages.length > 1 && (
            <button onClick={() => removeLanguageLayer(l.locale)} title="Remove language">
              <X size={11} />
            </button>
          )}
        </span>
      ))}
      <button className="flex items-center gap-1 rounded-full border border-maroon/30 px-3 py-1 text-xs text-maroon hover:bg-white" onClick={() => setAdding((a) => !a)}>
        <Plus size={12} /> Add language
      </button>

      {adding && (
        <div className="absolute left-1/2 top-28 z-30 w-96 -translate-x-1/2 rounded-xl border border-stone-200 bg-white p-4 shadow-2xl">
          <h3 className="mb-2 font-display text-lg text-maroon">Add languages</h3>
          <LanguagePicker selected={pending} onChange={setPending} max={6} />
          <div className="mt-3 flex justify-end gap-2">
            <button className="btn-ghost py-1.5" onClick={() => { setAdding(false); setPending([]); }}>
              Cancel
            </button>
            <button className="btn-primary py-1.5" onClick={confirmAdd} disabled={pending.length === 0}>
              Add {pending.length || ""}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
