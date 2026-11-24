import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { api } from "../api";
import { useRegistry } from "../store/registry";
import { LanguagePicker } from "../components/LanguagePicker";
import { Brand } from "../components/Brand";
import { buildDesignFromTemplate, buildBlankDesign } from "../lib/docFactory";
import type { Occasion, OccasionField, Template, WeddingDetails } from "../types";

/** Renders a single occasion field by type (the dynamic form engine). */
function FieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: OccasionField;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  const common = { className: "input", value, placeholder: field.placeholder };
  let control: React.ReactNode;
  if (field.type === "multiline") {
    control = <textarea {...common} className="input min-h-24" onChange={(e) => onChange(e.target.value)} />;
  } else if (field.type === "select") {
    control = (
      <select {...common} onChange={(e) => onChange(e.target.value)}>
        <option value="">Select…</option>
        {(field.options || []).map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    );
  } else if (field.type === "boolean") {
    control = (
      <input type="checkbox" checked={value === "true"} onChange={(e) => onChange(String(e.target.checked))} className="h-5 w-5" />
    );
  } else {
    const htmlType =
      field.type === "date" ? "date" : field.type === "time" ? "time" : field.type === "datetime" ? "datetime-local"
      : field.type === "email" ? "email" : field.type === "phone" ? "tel" : field.type === "url" ? "url" : "text";
    control = <input {...common} type={htmlType} onChange={(e) => onChange(e.target.value)} />;
  }
  return (
    <label className="block">
      <span className="label">
        {field.label} {field.required && <span className="text-red-600">*</span>}
      </span>
      {control}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export default function Wizard() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const occasionId = params.get("occasion") || "marriage";
  const templateId = params.get("template");
  const blank = params.get("blank") === "1";
  const { load, languages } = useRegistry();

  const [occasion, setOccasion] = useState<Occasion | null>(null);
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<WeddingDetails>({});
  const [locales, setLocales] = useState<string[]>(["en-IN"]);
  const [template, setTemplate] = useState<Template | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    load();
    api.getOccasion(occasionId).then(setOccasion).catch(() => setOccasion(null));
    if (templateId) api.getTemplate(templateId).then(setTemplate).catch(() => setTemplate(null));
  }, [load, occasionId, templateId]);

  // Group fields into wizard steps by their `group`, preserving field order.
  const groups = useMemo(() => {
    if (!occasion) return [] as { name: string; fields: OccasionField[] }[];
    const order: string[] = [];
    const map = new Map<string, OccasionField[]>();
    for (const fld of occasion.fields) {
      if (!map.has(fld.group)) {
        map.set(fld.group, []);
        order.push(fld.group);
      }
      map.get(fld.group)!.push(fld);
    }
    return order.map((name) => ({ name, fields: map.get(name)! }));
  }, [occasion]);

  const stepTitles = useMemo(() => [...groups.map((g) => g.name), "Language & Format"], [groups]);
  const isLanguageStep = step === groups.length;

  const set = (k: string) => (v: string) => setDetails((d) => ({ ...d, [k]: v }));

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s < groups.length) {
      for (const fld of groups[s].fields) {
        if (fld.required && !String(details[fld.key] || "").trim()) {
          e[fld.key] = `${fld.label} is required`;
        }
      }
    } else if (locales.length === 0) {
      e.locales = "Select at least one language";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, stepTitles.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const projectName = () => {
    if (details.groom_name && details.bride_name) return `${details.groom_name} & ${details.bride_name}`;
    const firstVal =
      occasion?.fields.map((f) => details[f.key]).find((v) => v && v.trim()) || occasion?.name || "Untitled";
    return `${firstVal}${occasion && occasion.id !== "marriage" ? ` — ${occasion.name}` : ""}`;
  };

  const finish = async () => {
    if (!validateStep(groups.length)) return;
    setBusy(true);
    try {
      const primary = locales[0];
      let tpl = template;
      if (!tpl && !blank) {
        // Pick an occasion-compatible template, else a sensible default.
        const compatible = await api.listTemplates({ occasion: occasionId }).catch(() => []);
        const id = compatible[0]?.id || (occasionId === "marriage" ? "royal-traditional" : "event-modern");
        tpl = await api.getTemplate(id).catch(() => null);
      }
      const design = tpl
        ? await buildDesignFromTemplate(tpl, details, locales, languages)
        : await buildBlankDesign(details, locales, languages);
      const project = await api.createProject({
        project_name: projectName(),
        occasion_id: occasionId,
        project_type: occasion?.card_types[0] || "invitation",
        groom_name: details.groom_name,
        bride_name: details.bride_name,
        wedding_date: details.wedding_date || details.event_date,
        language: primary,
        template_id: tpl?.id ?? null,
        project_data: { design, occasion: { id: occasionId, name: occasion?.name } },
      });
      nav(`/editor/${project.id}`);
    } finally {
      setBusy(false);
    }
  };

  if (!occasion) {
    return (
      <div className="bg-paper flex min-h-screen items-center justify-center text-maroon">Loading occasion…</div>
    );
  }

  return (
    <div className="bg-paper min-h-screen">
      <header className="flex items-center justify-between border-b border-gold/20 bg-ivory/70 px-6 py-4">
        <Brand small />
        <Link to="/" className="btn-ghost">
          <ArrowLeft size={16} /> Cancel
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-8">
        <p className="mb-2 text-sm text-gold">
          {occasion.category} · {occasion.name}
        </p>
        <div className="mb-6 flex items-center gap-2">
          {stepTitles.map((s, i) => (
            <div key={s + i} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                  i <= step ? "bg-maroon text-ivory" : "bg-white text-maroon/40"
                }`}
              >
                {i < step ? <Check size={15} /> : i + 1}
              </div>
              {i < stepTitles.length - 1 && <div className={`h-0.5 flex-1 ${i < step ? "bg-maroon" : "bg-maroon/15"}`} />}
            </div>
          ))}
        </div>

        <div className="card p-6">
          <h1 className="mb-1 font-display text-2xl text-maroon">{stepTitles[step]}</h1>
          {template && <p className="mb-4 text-sm text-gold">Template: {template.template_name}</p>}

          <div className="space-y-4">
            {!isLanguageStep &&
              groups[step].fields.map((fld) => (
                <FieldInput
                  key={fld.key}
                  field={fld}
                  value={String(details[fld.key] || "")}
                  onChange={set(fld.key)}
                  error={errors[fld.key]}
                />
              ))}
            {isLanguageStep && (
              <div>
                <p className="mb-3 text-sm text-maroon/70">
                  Pick one or more languages. Content is filled per language and fully editable.
                </p>
                <LanguagePicker selected={locales} onChange={setLocales} />
                {errors.locales && <p className="mt-2 text-xs text-red-600">{errors.locales}</p>}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button className="btn-ghost" onClick={back} disabled={step === 0}>
              <ArrowLeft size={16} /> Back
            </button>
            {!isLanguageStep ? (
              <button className="btn-primary" onClick={next}>
                Next <ArrowRight size={16} />
              </button>
            ) : (
              <button className="btn-gold" onClick={finish} disabled={busy}>
                {busy ? "Creating…" : "Create invitation"} <Check size={16} />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
