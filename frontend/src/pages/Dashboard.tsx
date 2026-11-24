import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Copy, Trash2, Pencil, LayoutGrid, Calendar, Sparkles, FileText, LogOut, LogIn } from "lucide-react";
import { api } from "../api";
import { useRegistry } from "../store/registry";
import { useAuth } from "../store/auth";
import type { Occasion, ProjectSummary } from "../types";
import { Brand } from "../components/Brand";

// Dashboard occasion categories (icons are emoji for a light footprint).
const CATEGORY_CARDS: { label: string; category: string; emoji: string }[] = [
  { label: "Wedding Invitations", category: "Wedding", emoji: "💍" },
  { label: "Birthday Invitations", category: "Birthday", emoji: "🎂" },
  { label: "Family Celebrations", category: "Family", emoji: "👨‍👩‍👧" },
  { label: "Religious Events", category: "Religious", emoji: "🕉️" },
  { label: "Corporate Events", category: "Corporate", emoji: "🏢" },
  { label: "Social & Cultural", category: "Social", emoji: "🎭" },
  { label: "Greeting Cards", category: "Greeting", emoji: "💌" },
  { label: "Custom Design", category: "Custom", emoji: "🎨" },
];

function AccountMenu() {
  const { user, authRequired, logout } = useAuth();
  const nav = useNavigate();
  if (user) {
    return (
      <div className="flex items-center gap-2" data-testid="account-menu">
        <span className="hidden text-sm text-maroon/70 sm:inline" title={user.email}>
          {user.name}
          {user.role === "admin" && <span className="ml-1 rounded bg-gold/20 px-1 text-[10px] text-gold">admin</span>}
        </span>
        <button className="btn-ghost py-1.5" onClick={async () => { await logout(); nav("/login"); }}>
          <LogOut size={15} /> Logout
        </button>
      </div>
    );
  }
  if (authRequired) {
    return <Link to="/login" className="btn-ghost"><LogIn size={15} /> Sign in</Link>;
  }
  return null; // guest/local mode: no auth UI
}

function CreatePanel() {
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    api.listOccasions().then(setOccasions).catch(() => setOccasions([]));
  }, []);
  const byCategory = (c: string) => occasions.filter((o) => o.category === c);

  return (
    <section className="mb-8">
      <h2 className="mb-3 font-display text-2xl text-maroon">Create something new</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {CATEGORY_CARDS.map((c) => (
          <div key={c.category} className="card p-3">
            <button
              className="flex w-full items-center gap-2 text-left"
              onClick={() => setOpen(open === c.category ? null : c.category)}
            >
              <span className="text-2xl" aria-hidden>{c.emoji}</span>
              <span className="font-display text-base font-semibold text-maroon">{c.label}</span>
            </button>
            {open === c.category && (
              <div className="mt-2 flex flex-col gap-1 border-t border-gold/20 pt-2">
                {byCategory(c.category).map((o) => (
                  <Link key={o.id} to={`/new?occasion=${o.id}`} className="rounded px-2 py-1 text-sm text-maroon/80 hover:bg-ivory">
                    {o.name}
                  </Link>
                ))}
                {byCategory(c.category).length === 0 && <p className="px-2 text-xs text-maroon/40">Coming soon</p>}
              </div>
            )}
          </div>
        ))}
        <Link to="/build" className="card flex items-center gap-2 bg-gradient-to-br from-gold/15 to-gold/5 p-3">
          <Sparkles size={22} className="text-gold" />
          <span className="font-display text-base font-semibold text-maroon">Build Your Own</span>
        </Link>
        <Link to="/new?occasion=custom&blank=1" className="card flex items-center gap-2 p-3">
          <FileText size={22} className="text-maroon/60" />
          <span className="font-display text-base font-semibold text-maroon">Blank Canvas</span>
        </Link>
      </div>
    </section>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const { languages, load } = useRegistry();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      setProjects(await api.listProjects({ q: q || undefined, language: lang || undefined }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);
  useEffect(() => {
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, lang]);

  const langName = useMemo(() => {
    const map = new Map(languages.map((l) => [l.locale, l.name]));
    return (loc: string) => map.get(loc) || loc;
  }, [languages]);

  const duplicate = async (id: string) => {
    await api.duplicateProject(id);
    refresh();
  };
  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await api.deleteProject(id);
    refresh();
  };

  return (
    <div className="bg-paper min-h-screen">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gold/20 bg-ivory/70 px-6 py-4 backdrop-blur">
        <Brand />
        <div className="flex items-center gap-3">
          <Link to="/templates" className="btn-ghost">
            <LayoutGrid size={16} /> Templates
          </Link>
          <Link to="/new" className="btn-primary">
            <Plus size={16} /> Create New Invitation
          </Link>
          <AccountMenu />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8 rounded-2xl bg-gradient-to-br from-maroon to-maroon-dark p-8 text-ivory shadow-card">
          <h1 className="font-display text-4xl font-semibold">Create beautiful invitations</h1>
          <p className="mt-2 max-w-xl text-lg italic text-gold-pale">
            for life's most beautiful beginning — in any language you love.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/new" className="btn-gold">
              <Plus size={16} /> Start a new card
            </Link>
            <Link to="/templates" className="btn border border-gold-pale/40 text-gold-pale hover:bg-white/10">
              Browse 15 templates
            </Link>
          </div>
        </section>

        <CreatePanel />

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h2 className="mr-auto font-display text-2xl text-maroon">My Invitations</h2>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-maroon/40" />
            <input
              className="input pl-9"
              placeholder="Search projects…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search projects"
            />
          </div>
          <select className="input w-auto" value={lang} onChange={(e) => setLang(e.target.value)} aria-label="Filter by language">
            <option value="">All languages</option>
            {languages.map((l) => (
              <option key={l.locale} value={l.locale}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <p className="text-maroon/60">Loading…</p>
        ) : projects.length === 0 ? (
          <div className="card flex flex-col items-center gap-3 p-12 text-center">
            <p className="text-lg text-maroon/70">No invitations yet.</p>
            <Link to="/new" className="btn-primary">
              <Plus size={16} /> Create your first invitation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <div key={p.id} className="card group flex flex-col overflow-hidden">
                <button
                  onClick={() => nav(`/editor/${p.id}`)}
                  className="relative flex h-44 items-center justify-center bg-gradient-to-br from-ivory to-gold-pale/30"
                >
                  {p.thumbnail_path ? (
                    <img src={p.thumbnail_path} alt={p.project_name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-display text-xl text-maroon/60">
                      {p.groom_name || "Groom"} &amp; {p.bride_name || "Bride"}
                    </span>
                  )}
                </button>
                <div className="flex flex-1 flex-col gap-1 p-4">
                  <h3 className="font-display text-lg font-semibold text-maroon">{p.project_name}</h3>
                  <p className="flex items-center gap-2 text-sm text-maroon/60">
                    <Calendar size={13} /> {p.wedding_date || "Date TBD"} · {langName(p.language)}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button className="btn-ghost flex-1 py-1.5" onClick={() => nav(`/editor/${p.id}`)}>
                      <Pencil size={14} /> Edit
                    </button>
                    <button className="btn-ghost px-3 py-1.5" title="Duplicate" onClick={() => duplicate(p.id)}>
                      <Copy size={14} />
                    </button>
                    <button
                      className="btn px-3 py-1.5 text-red-700 hover:bg-red-50"
                      title="Delete"
                      onClick={() => remove(p.id, p.project_name)}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
