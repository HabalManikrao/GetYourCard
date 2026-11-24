import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check } from "lucide-react";
import { api } from "../api";
import type { Template } from "../types";
import { Brand } from "../components/Brand";

export default function TemplatesPage() {
  const nav = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [category, setCategory] = useState("");

  useEffect(() => {
    api.listTemplates().then(setTemplates);
  }, []);

  const categories = Array.from(new Set(templates.map((t) => t.category)));
  const shown = category ? templates.filter((t) => t.category === category) : templates;

  return (
    <div className="bg-paper min-h-screen">
      <header className="flex items-center justify-between gap-4 border-b border-gold/20 bg-ivory/70 px-6 py-4">
        <Brand small />
        <Link to="/" className="btn-ghost">
          <ArrowLeft size={16} /> Dashboard
        </Link>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <h1 className="font-display text-3xl text-maroon">Template Gallery</h1>
        <p className="mb-6 text-maroon/60">{templates.length} original designs — each works in any language.</p>

        <div className="mb-6 flex flex-wrap gap-2">
          <button
            className={`rounded-full px-3 py-1 text-sm ${!category ? "bg-maroon text-ivory" : "bg-white text-maroon"}`}
            onClick={() => setCategory("")}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={`rounded-full px-3 py-1 text-sm ${category === c ? "bg-maroon text-ivory" : "bg-white text-maroon"}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {shown.map((t) => (
            <div key={t.id} className="card overflow-hidden">
              <div className="aspect-[3/4] w-full bg-ivory">
                <img src={t.preview_path!} alt={t.template_name} className="h-full w-full object-contain" />
              </div>
              <div className="p-3">
                <h3 className="font-display text-base font-semibold text-maroon">{t.template_name}</h3>
                <p className="text-xs text-maroon/50">{t.category}</p>
                <p className="mt-1 flex flex-wrap gap-1 text-[10px] text-gold">
                  {t.supported_languages.slice(0, 4).map((l) => (
                    <span key={l} className="rounded bg-gold/10 px-1.5 py-0.5">
                      {l}
                    </span>
                  ))}
                </p>
                <button
                  className="btn-primary mt-3 w-full py-1.5 text-sm"
                  onClick={() => nav(`/new?template=${t.id}`)}
                >
                  <Check size={14} /> Use this template
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
