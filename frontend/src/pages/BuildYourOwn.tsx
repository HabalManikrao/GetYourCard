import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Check } from "lucide-react";
import { api } from "../api";
import { Brand } from "../components/Brand";
import type { FieldType, OccasionField } from "../types";

const FIELD_TYPES: FieldType[] = [
  "text", "multiline", "date", "time", "datetime", "address", "phone", "email", "url", "select", "boolean", "list",
];
const CARD_TYPES = ["invitation", "greeting", "announcement", "event", "thank-you", "save-the-date"];

function slug(label: string, used: Set<string>): string {
  let base = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "field";
  let key = base;
  let i = 2;
  while (used.has(key)) key = `${base}_${i++}`;
  return key;
}

export default function BuildYourOwn() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [cardType, setCardType] = useState("invitation");
  const [fields, setFields] = useState<Omit<OccasionField, "key" | "group">[]>([
    { label: "Title", type: "text", required: true },
    { label: "Message", type: "multiline", required: false },
    { label: "Date", type: "date", required: false },
  ]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addField = () => setFields((f) => [...f, { label: "", type: "text", required: false }]);
  const update = (i: number, patch: Partial<Omit<OccasionField, "key" | "group">>) =>
    setFields((f) => f.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const remove = (i: number) => setFields((f) => f.filter((_, idx) => idx !== i));

  const save = async () => {
    setError(null);
    if (!name.trim()) return setError("Please name your occasion.");
    const valid = fields.filter((f) => f.label.trim());
    if (valid.length === 0) return setError("Add at least one field.");
    setBusy(true);
    try {
      const used = new Set<string>();
      const field_schema: OccasionField[] = valid.map((f) => ({
        key: slug(f.label, used),
        label: f.label.trim(),
        type: f.type,
        required: f.required,
        group: "Details",
      }));
      field_schema.forEach((f) => used.add(f.key));
      const created = await api.createCustomOccasion({
        name: name.trim(),
        category: "Custom",
        card_types: [cardType],
        field_schema,
      });
      nav(`/new?occasion=${created.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-paper min-h-screen">
      <header className="flex items-center justify-between border-b border-gold/20 bg-ivory/70 px-6 py-4">
        <Brand small />
        <Link to="/" className="btn-ghost"><ArrowLeft size={16} /> Dashboard</Link>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h1 className="font-display text-3xl text-maroon">Build Your Own</h1>
        <p className="mb-6 text-maroon/60">Define a custom occasion with your own content fields.</p>

        <div className="card space-y-4 p-6">
          <label className="block">
            <span className="label">Occasion name *</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Community Celebration" />
          </label>
          <label className="block">
            <span className="label">Card type</span>
            <select className="input w-auto" value={cardType} onChange={(e) => setCardType(e.target.value)}>
              {CARD_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>

          <div>
            <p className="label">Content fields</p>
            <div className="space-y-2">
              {fields.map((f, i) => (
                <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-stone-200 bg-white p-2">
                  <input
                    className="input flex-1 py-1.5"
                    value={f.label}
                    placeholder="Field label (e.g. Host name)"
                    onChange={(e) => update(i, { label: e.target.value })}
                  />
                  <select className="input w-auto py-1.5" value={f.type} onChange={(e) => update(i, { type: e.target.value as FieldType })}>
                    {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <label className="flex items-center gap-1 text-xs text-maroon/70">
                    <input type="checkbox" checked={f.required} onChange={(e) => update(i, { required: e.target.checked })} /> required
                  </label>
                  <button className="rounded p-1.5 text-red-700 hover:bg-red-50" onClick={() => remove(i)} aria-label="Remove field">
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <button className="btn-ghost mt-2 py-1.5" onClick={addField}><Plus size={14} /> Add field</button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex justify-end">
            <button className="btn-gold" onClick={save} disabled={busy}>
              {busy ? "Saving…" : "Save & start designing"} <Check size={16} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
