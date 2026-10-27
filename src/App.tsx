import { useEffect, useMemo, useState } from "react";

/**
 * UNISA — Spin-off Showcase
 *
 * - Catalogo caricato a runtime da public/unisa-spinoffs.json (fallback: DEMO_SPINOFFS)
 * - Ricerca, filtri per stato e categoria, ordinamento
 * - Scheda di dettaglio con link condivisibile (?s=<id>)
 * - Sezioni "Il percorso" (come proporre uno spin-off) e "Contatti"
 */

const UNISA_BLUE = "#0B3D91";
const UNISA_BLUE_DARK = "#072B66";
const UNISA_GOLD = "#F2B705";

const UNIVERSITY_NAME = "Università degli Studi di Salerno";
const PLATFORM_NAME = "Spin-off UNISA";

const UNIVERSITY_LOGO_URL = `${import.meta.env.BASE_URL}logo_unisa.png`;
const DATA_URL = `${import.meta.env.BASE_URL}unisa-spinoffs.json`;

const LINKS = {
  unisa: "https://www.unisa.it",
  instagram: "https://www.instagram.com/unisalerno/",
  x: "https://x.com/unisalerno",
};

export type IncubatorStatus = "Incubazione" | "Fuoriusciti";

export type Spinoff = {
  id: string;
  name: string;
  category: string;
  incubatorStatus: IncubatorStatus;
  tagline?: string;
  description?: string;
  founded?: number | null;
  department?: string | null;
  website?: string;
  email?: string;
  image?: string;
};

// Usato solo se il JSON non è raggiungibile
const DEMO_SPINOFFS: Spinoff[] = [
  {
    id: "4achem-s-r-l",
    name: "4ACHEM S.r.l.",
    category: "Chimica & Nuovi Materiali",
    incubatorStatus: "Incubazione",
    tagline: "Soluzioni avanzate per materiali e processi.",
  },
  {
    id: "ai4health-s-r-l",
    name: "AI4HEALTH S.r.l.",
    category: "Salute & Biomedicale",
    incubatorStatus: "Fuoriusciti",
    tagline: "AI per diagnostica e soluzioni cliniche.",
  },
];

const ALL = "Tutte";

const STATUS_OPTIONS: Array<{ value: "All" | IncubatorStatus; label: string; short: string }> = [
  { value: "All", label: "Tutti", short: "Tutti" },
  { value: "Incubazione", label: "In incubazione", short: "Incubazione" },
  { value: "Fuoriusciti", label: "Fuoriusciti", short: "Fuoriusciti" },
];

type SortKey = "az" | "za" | "recent";

// Colore per categoria: [badge, pallino]
const CATEGORY_STYLE: Record<string, [string, string]> = {
  "Chimica & Nuovi Materiali": ["bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200", "bg-fuchsia-500"],
  Robotica: ["bg-indigo-50 text-indigo-700 ring-indigo-200", "bg-indigo-500"],
  "Salute & Biomedicale": ["bg-rose-50 text-rose-700 ring-rose-200", "bg-rose-500"],
  "Informatica & Sistemi di Telecomunicazione": ["bg-sky-50 text-sky-700 ring-sky-200", "bg-sky-500"],
  "Agritech & Foodtech": ["bg-lime-50 text-lime-700 ring-lime-200", "bg-lime-500"],
  "Servizi dell'Innovazione": ["bg-emerald-50 text-emerald-700 ring-emerald-200", "bg-emerald-500"],
  "Energia & Sistemi di Alimentazione": ["bg-teal-50 text-teal-700 ring-teal-200", "bg-teal-500"],
  "Macchinari & Attrezzature": ["bg-amber-50 text-amber-700 ring-amber-200", "bg-amber-500"],
  "Automotive & Trasporti": ["bg-violet-50 text-violet-700 ring-violet-200", "bg-violet-500"],
  "Ambiente & Sostenibilità": ["bg-green-50 text-green-700 ring-green-200", "bg-green-500"],
  "Edifici, Costruzioni & Architettura": ["bg-orange-50 text-orange-700 ring-orange-200", "bg-orange-500"],
  "Industry 4.0": ["bg-yellow-50 text-yellow-800 ring-yellow-200", "bg-yellow-500"],
  "Da classificare": ["bg-slate-50 text-slate-600 ring-slate-200", "bg-slate-400"],
};

const categoryStyle = (c: string) => CATEGORY_STYLE[c] || CATEGORY_STYLE["Da classificare"];

const STATUS_BADGE: Record<IncubatorStatus, string> = {
  Incubazione: "bg-green-50 text-green-700 ring-green-200",
  Fuoriusciti: "bg-amber-50 text-amber-800 ring-amber-200",
};

const STATUS_LABEL: Record<IncubatorStatus, string> = {
  Incubazione: "In incubazione",
  Fuoriusciti: "Fuoriuscito",
};

const unsplash = (id: string) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=1200&auto=format&fit=crop`;

const CATEGORY_IMAGE: Record<string, string> = {
  "Chimica & Nuovi Materiali": unsplash("1532187863486-abf9dbad1b69"),
  Robotica: unsplash("1518770660439-4636190af475"),
  "Salute & Biomedicale": unsplash("1576086213369-97a306d36557"),
  "Informatica & Sistemi di Telecomunicazione": unsplash("1519389950473-47ba0277781c"),
  "Agritech & Foodtech": unsplash("1501004318641-b39e6451bec6"),
  "Servizi dell'Innovazione": unsplash("1542222024-c39e2281f121"),
  "Energia & Sistemi di Alimentazione": unsplash("1509395176047-4a66953fd231"),
  "Ambiente & Sostenibilità": unsplash("1501630834273-4b5604d2ee31"),
  "Edifici, Costruzioni & Architettura": unsplash("1503387762-592deb58ef4e"),
  "Industry 4.0": unsplash("1518770660439-4636190af475"),
  ALTRO: unsplash("1519389950473-47ba0277781c"),
};

function normalizeSpinoff(raw: any): Spinoff | null {
  if (!raw) return null;
  const id = String(raw.id ?? "").trim();
  const name = String(raw.name ?? "").trim();
  if (!id || !name) return null;

  const category = String(raw.category ?? "").trim() || "Da classificare";
  const incubatorStatus: IncubatorStatus =
    raw.incubatorStatus === "Incubazione" ? "Incubazione" : "Fuoriusciti";
  const clean = (v: unknown) => {
    const s = typeof v === "string" ? v.trim() : "";
    return s && s !== "—" ? s : "";
  };
  const founded = Number(raw.founded);

  return {
    id,
    name,
    category,
    incubatorStatus,
    tagline: clean(raw.tagline) || "Spin-off universitario UNISA",
    description: clean(raw.description),
    founded: Number.isFinite(founded) && founded > 1900 ? founded : null,
    department: clean(raw.department) || null,
    website: clean(raw.website),
    email: clean(raw.email),
    image: clean(raw.image) || CATEGORY_IMAGE[category] || CATEGORY_IMAGE.ALTRO,
  };
}

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function readSelectedId() {
  return new URLSearchParams(window.location.search).get("s");
}

function writeSelectedId(id: string | null) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("s", id);
  else url.searchParams.delete("s");
  window.history.replaceState(null, "", url);
}

export default function App() {
  const [spinoffs, setSpinoffs] = useState<Spinoff[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [category, setCategory] = useState<string>(ALL);
  const [status, setStatus] = useState<"All" | IncubatorStatus>("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("az");
  const [activeId, setActiveId] = useState<string | null>(readSelectedId);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(DATA_URL, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const normalized = (Array.isArray(data) ? data : [])
          .map(normalizeSpinoff)
          .filter(Boolean) as Spinoff[];
        if (normalized.length === 0) throw new Error("Catalogo vuoto");
        setSpinoffs(normalized);
      } catch (err) {
        if (controller.signal.aborted) return;
        setSpinoffs(DEMO_SPINOFFS.map(normalizeSpinoff).filter(Boolean) as Spinoff[]);
        setLoadError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>([[ALL, spinoffs.length]]);
    for (const s of spinoffs) map.set(s.category, (map.get(s.category) || 0) + 1);
    return map;
  }, [spinoffs]);

  const categories = useMemo(() => {
    const list = Array.from(categoryCounts.keys())
      .filter((c) => c !== ALL && c !== "Da classificare")
      .sort((a, b) => a.localeCompare(b, "it"));
    if (categoryCounts.has("Da classificare")) list.push("Da classificare");
    return [ALL, ...list];
  }, [categoryCounts]);

  const statusCounts = useMemo(() => {
    const incubazione = spinoffs.filter((s) => s.incubatorStatus === "Incubazione").length;
    return {
      All: spinoffs.length,
      Incubazione: incubazione,
      Fuoriusciti: spinoffs.length - incubazione,
    };
  }, [spinoffs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = spinoffs.filter((s) => {
      const okCat = category === ALL || s.category === category;
      const okStatus = status === "All" || s.incubatorStatus === status;
      const okQ =
        !q ||
        [s.name, s.tagline, s.description, s.category, s.department]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q));
      return okCat && okStatus && okQ;
    });
    return list.sort((a, b) => {
      if (sort === "recent") return (b.founded ?? 0) - (a.founded ?? 0) || a.name.localeCompare(b.name, "it");
      const cmp = a.name.localeCompare(b.name, "it");
      return sort === "za" ? -cmp : cmp;
    });
  }, [spinoffs, category, status, query, sort]);

  const active = useMemo(
    () => spinoffs.find((s) => s.id === activeId) ?? null,
    [spinoffs, activeId]
  );

  const openSpinoff = (id: string | null) => {
    setActiveId(id);
    writeSelectedId(id);
  };

  const filtersActive = category !== ALL || status !== "All" || query !== "";
  const resetFilters = () => {
    setCategory(ALL);
    setStatus("All");
    setQuery("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <TopHeader />

      <Hero
        total={spinoffs.length}
        incubazione={statusCounts.Incubazione}
        fuoriusciti={statusCounts.Fuoriusciti}
        categories={categories.length - 1}
        loading={loading}
      />

      <section id="catalogo" className="scroll-mt-20 max-w-6xl mx-auto px-4 pt-14 pb-20">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: UNISA_BLUE }}>
              Catalogo
            </p>
            <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
              Esplora gli spin-off
            </h2>
          </div>
          <p className="text-sm text-slate-500" aria-live="polite">
            {loading ? "Caricamento…" : `${filtered.length} di ${spinoffs.length} risultati`}
          </p>
        </div>

        {/* Ricerca e filtri */}
        <div className="mt-6 rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm p-4 md:p-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <label className="flex-1 flex items-center gap-2 rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 focus-within:ring-2 focus-within:ring-blue-600">
              <SearchIcon className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="sr-only">Cerca spin-off</span>
              <input
                type="search"
                className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-slate-400"
                placeholder="Cerca per nome, settore o parola chiave…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="grid grid-cols-3 sm:inline-flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Stato incubazione">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatus(opt.value)}
                    aria-pressed={status === opt.value}
                    className={
                      "whitespace-nowrap rounded-lg px-2 sm:px-3 py-1.5 text-sm font-medium transition " +
                      (status === opt.value
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-600 hover:text-slate-900")
                    }
                  >
                    <span className="sm:hidden">{opt.short}</span>
                    <span className="hidden sm:inline">{opt.label}</span>
                    <span className="ml-1.5 text-xs text-slate-400">{statusCounts[opt.value]}</span>
                  </button>
                ))}
              </div>

              <label className="sr-only" htmlFor="sort">Ordina</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="rounded-xl bg-white ring-1 ring-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="az">Nome A–Z</option>
                <option value="za">Nome Z–A</option>
                <option value="recent">Più recenti</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Categoria">
            {categories.map((c) => {
              const selected = category === c;
              return (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  aria-pressed={selected}
                  className={
                    "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-left text-sm transition ring-1 " +
                    (selected
                      ? "text-white ring-transparent"
                      : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-300 hover:bg-slate-50")
                  }
                  style={selected ? { background: UNISA_BLUE } : undefined}
                >
                  {c !== ALL && (
                    <span className={"h-2 w-2 rounded-full " + (selected ? "bg-white" : categoryStyle(c)[1])} />
                  )}
                  {c}
                  <span className={"text-xs " + (selected ? "text-white/70" : "text-slate-400")}>
                    {categoryCounts.get(c) ?? 0}
                  </span>
                </button>
              );
            })}
            {filtersActive && (
              <button
                onClick={resetFilters}
                className="ml-auto text-sm font-medium text-slate-500 hover:text-slate-900 underline-offset-4 hover:underline"
              >
                Azzera filtri
              </button>
            )}
          </div>

          {loadError && (
            <p className="mt-4 rounded-xl bg-amber-50 ring-1 ring-amber-200 px-3 py-2 text-sm text-amber-800">
              Impossibile caricare il catalogo completo: è mostrata una selezione di esempio.
            </p>
          )}
        </div>

        <div className="mt-8">
          {loading ? (
            <SkeletonGrid />
          ) : filtered.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((s) => (
                <SpinoffCard key={s.id} spinoff={s} onOpen={() => openSpinoff(s.id)} />
              ))}
            </div>
          )}
        </div>
      </section>

      <ProcessSection />
      <ContactSection />
      <Footer />

      {active && <DetailModal spinoff={active} onClose={() => openSpinoff(null)} />}
    </div>
  );
}

const NAV = [
  { id: "catalogo", label: "Catalogo" },
  { id: "percorso", label: "Il percorso" },
  { id: "contatti", label: "Contatti" },
];

function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <a href="#top" className="flex items-center gap-3" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
      <img src={UNIVERSITY_LOGO_URL} alt="" className="h-10 w-10 rounded-full bg-white object-contain" />
      <span className="leading-tight">
        <span className={"block text-sm font-semibold " + (inverted ? "text-white" : "text-slate-900")}>
          {PLATFORM_NAME}
        </span>
        <span className={"block text-xs " + (inverted ? "text-white/60" : "text-slate-500")}>
          {UNIVERSITY_NAME}
        </span>
      </span>
    </a>
  );
}

function TopHeader() {
  const [open, setOpen] = useState(false);

  const go = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
        <Logo />

        <nav className="hidden md:flex items-center gap-1 text-sm">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={(e) => { e.preventDefault(); go(n.id); }}
              className="rounded-lg px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {n.label}
            </a>
          ))}
          <a
            href="#percorso"
            onClick={(e) => { e.preventDefault(); go("percorso"); }}
            className="ml-2 rounded-full px-4 py-2 font-medium text-white shadow-sm hover:opacity-90"
            style={{ background: UNISA_BLUE }}
          >
            Proponi uno spin-off
          </a>
        </nav>

        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ring-slate-200 text-slate-700"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Chiudi menu" : "Apri menu"}
        >
          {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-1">
          {NAV.map((n) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={(e) => { e.preventDefault(); go(n.id); }}
              className="rounded-lg px-3 py-2.5 text-slate-700 hover:bg-slate-100"
            >
              {n.label}
            </a>
          ))}
          <a
            href="#percorso"
            onClick={(e) => { e.preventDefault(); go("percorso"); }}
            className="mt-1 rounded-full px-4 py-2.5 text-center font-medium text-white"
            style={{ background: UNISA_BLUE }}
          >
            Proponi uno spin-off
          </a>
        </nav>
      )}
    </header>
  );
}

function Hero({
  total,
  incubazione,
  fuoriusciti,
  categories,
  loading,
}: {
  total: number;
  incubazione: number;
  fuoriusciti: number;
  categories: number;
  loading: boolean;
}) {
  const fmt = (n: number) => (loading ? "–" : String(n));

  return (
    <section
      id="top"
      className="relative overflow-hidden text-white"
      style={{ background: `linear-gradient(135deg, ${UNISA_BLUE_DARK} 0%, ${UNISA_BLUE} 60%, #1d5bc4 100%)` }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: `radial-gradient(600px circle at 85% 0%, ${UNISA_GOLD}33, transparent 70%)` }}
      />
      <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24 grid lg:grid-cols-[1.3fr_1fr] gap-12 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/20 px-3 py-1 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: UNISA_GOLD }} />
            Terza Missione · Trasferimento Tecnologico
          </span>

          <h1 className="mt-5 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
            Dall'eccellenza accademica{" "}
            <span style={{ color: UNISA_GOLD }}>al mercato</span>
          </h1>

          <p className="mt-5 max-w-xl text-base md:text-lg text-white/80 leading-relaxed">
            L'Università degli Studi di Salerno valorizza le conoscenze e le tecnologie sviluppate
            dai propri ricercatori sostenendo la nascita di imprese innovative: gli spin-off.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => scrollToId("catalogo")}
              className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg hover:brightness-105"
              style={{ background: UNISA_GOLD, color: UNISA_BLUE_DARK }}
            >
              Esplora il catalogo
              <ArrowIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollToId("percorso")}
              className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold ring-1 ring-white/40 hover:bg-white/10"
            >
              Come proporre uno spin-off
            </button>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-3">
          <Stat value={fmt(total)} label="Spin-off nel catalogo" />
          <Stat value={fmt(categories)} label="Settori" />
          <Stat value={fmt(incubazione)} label="In incubazione" />
          <Stat value={fmt(fuoriusciti)} label="Fuoriusciti" />
        </dl>
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/10 ring-1 ring-white/15 backdrop-blur p-5">
      <dt className="text-sm text-white/70">{label}</dt>
      <dd className="mt-1 text-4xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function CoverImage({ src, alt, className }: { src?: string; alt: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        className={className + " flex items-center justify-center"}
        style={{ background: `linear-gradient(135deg, ${UNISA_BLUE}, ${UNISA_BLUE_DARK})` }}
      >
        <span className="text-3xl font-semibold text-white/80">{alt.charAt(0)}</span>
      </div>
    );
  }
  return <img src={src} alt="" loading="lazy" className={className} onError={() => setFailed(true)} />;
}

function SpinoffCard({ spinoff, onOpen }: { spinoff: Spinoff; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="group flex flex-col text-left rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
    >
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <CoverImage
          src={spinoff.image}
          alt={spinoff.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span
          className={
            "absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-medium ring-1 " +
            STATUS_BADGE[spinoff.incubatorStatus]
          }
        >
          {STATUS_LABEL[spinoff.incubatorStatus]}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <span className={"self-start rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 " + categoryStyle(spinoff.category)[0]}>
          {spinoff.category}
        </span>
        <h3 className="mt-3 text-lg font-semibold leading-snug">{spinoff.name}</h3>
        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{spinoff.tagline}</p>
        <span
          className="mt-auto pt-4 inline-flex items-center gap-1 text-sm font-medium"
          style={{ color: UNISA_BLUE }}
        >
          Scopri di più
          <ArrowIcon className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}

function DetailModal({ spinoff, onClose }: { spinoff: Spinoff; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard non disponibile */
    }
  };

  const website = spinoff.website && !/^https?:\/\//.test(spinoff.website)
    ? `https://${spinoff.website}`
    : spinoff.website;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-3xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 ring-1 ring-slate-200 text-slate-600 hover:text-slate-900"
          aria-label="Chiudi"
          autoFocus
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr]">
          <CoverImage src={spinoff.image} alt={spinoff.name} className="h-52 md:h-full w-full object-cover bg-slate-100" />

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 " + categoryStyle(spinoff.category)[0]}>
                {spinoff.category}
              </span>
              <span className={"rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 " + STATUS_BADGE[spinoff.incubatorStatus]}>
                {STATUS_LABEL[spinoff.incubatorStatus]}
              </span>
            </div>

            <h2 id="modal-title" className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight">
              {spinoff.name}
            </h2>
            <p className="mt-1 text-slate-500">{spinoff.tagline}</p>

            {spinoff.description && (
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">{spinoff.description}</p>
            )}

            <dl className="mt-6 grid grid-cols-2 gap-3">
              <InfoBox label="Anno di costituzione" value={spinoff.founded ? String(spinoff.founded) : "Non indicato"} />
              <InfoBox label="Dipartimento" value={spinoff.department || "Non indicato"} />
            </dl>

            <div className="mt-6 flex flex-wrap gap-2">
              {website && (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  style={{ background: UNISA_BLUE }}
                >
                  Visita il sito
                  <ExternalIcon className="h-4 w-4" />
                </a>
              )}
              {spinoff.email && (
                <a
                  href={`mailto:${spinoff.email}`}
                  className="inline-flex items-center gap-2 rounded-full ring-1 ring-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Scrivi al team
                </a>
              )}
              <button
                onClick={share}
                className="inline-flex items-center gap-2 rounded-full ring-1 ring-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {copied ? "Link copiato ✓" : "Copia link"}
              </button>
            </div>

            {!website && !spinoff.email && (
              <p className="mt-4 text-xs text-slate-400">Sito web e contatti non ancora disponibili per questo spin-off.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-2.5">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-hidden>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden animate-pulse">
          <div className="h-44 bg-slate-200" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-24 rounded bg-slate-200" />
            <div className="h-5 w-2/3 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <SearchIcon className="mx-auto h-8 w-8 text-slate-300" />
      <h3 className="mt-3 font-semibold">Nessun risultato</h3>
      <p className="mt-1 text-sm text-slate-500">Prova una ricerca diversa o azzera i filtri.</p>
      <button
        onClick={onReset}
        className="mt-4 rounded-full ring-1 ring-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Azzera filtri
      </button>
    </div>
  );
}

const STEPS = [
  {
    title: "Idea e gruppo di ricerca",
    text: "Docenti, ricercatori e dottorandi individuano un risultato della ricerca con potenziale applicativo e costituiscono il team proponente.",
  },
  {
    title: "Supporto dell'Ufficio TT",
    text: "L'Ufficio Trasferimento Tecnologico e Terza Missione affianca i proponenti con assistenza amministrativa, giuridica e legale e nella stesura del business plan.",
  },
  {
    title: "Valutazione della Commissione",
    text: "La Commissione Spin-off e Trasferimento Tecnologico valuta la proposta secondo il Regolamento di Ateneo e ne indirizza lo sviluppo strategico.",
  },
  {
    title: "Costituzione e crescita",
    text: "Lo spin-off viene costituito e può accedere al percorso di incubazione e alle reti di collaborazione dell'Ateneo con enti e imprese.",
  },
];

function ProcessSection() {
  return (
    <section id="percorso" className="scroll-mt-16 bg-white border-y border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: UNISA_BLUE }}>
            Il percorso
          </p>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
            Come nasce uno spin-off UNISA
          </h2>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Gli spin-off sono società fondate da personale dell'Ateneo per trasformare i risultati della
            ricerca in prodotti e servizi per il mercato.
          </p>
        </div>

        <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-2xl bg-slate-50 ring-1 ring-slate-200 p-6">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold"
                style={{ background: UNISA_GOLD, color: UNISA_BLUE_DARK }}
              >
                {i + 1}
              </span>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{s.text}</p>
            </li>
          ))}
        </ol>

        <div
          className="mt-10 rounded-3xl p-8 md:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-white"
          style={{ background: `linear-gradient(135deg, ${UNISA_BLUE_DARK}, ${UNISA_BLUE})` }}
        >
          <div>
            <h3 className="text-xl md:text-2xl font-semibold">Hai un progetto da proporre?</h3>
            <p className="mt-2 text-white/80 max-w-xl">
              Consulta il portale di Ateneo per il regolamento e la modulistica, oppure contatta l'Ufficio
              Trasferimento Tecnologico e Terza Missione.
            </p>
          </div>
          <a
            href={LINKS.unisa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg hover:brightness-105"
            style={{ background: UNISA_GOLD, color: UNISA_BLUE_DARK }}
          >
            Vai al portale UNISA
            <ExternalIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contatti" className="scroll-mt-16 max-w-6xl mx-auto px-4 py-20">
      <div className="grid gap-10 lg:grid-cols-2 items-start">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: UNISA_BLUE }}>
            Contatti
          </p>
          <h2 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
            Ufficio Trasferimento Tecnologico e Terza Missione
          </h2>
          <p className="mt-3 text-slate-600 leading-relaxed">
            Per informazioni sugli spin-off, sulle collaborazioni con imprese ed enti o per segnalare
            aggiornamenti al catalogo, fai riferimento ai canali ufficiali dell'Ateneo.
          </p>
        </div>

        <div className="grid gap-3">
          <ContactRow title={UNIVERSITY_NAME} detail="Via Giovanni Paolo II, 132 · 84084 Fisciano (SA)" />
          <ContactRow title="Portale di Ateneo" detail="www.unisa.it" href={LINKS.unisa} />
          <ContactRow title="Instagram" detail="@unisalerno" href={LINKS.instagram} />
          <ContactRow title="X" detail="@unisalerno" href={LINKS.x} />
        </div>
      </div>
    </section>
  );
}

function ContactRow({ title, detail, href }: { title: string; detail: string; href?: string }) {
  const body = (
    <>
      <div>
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="text-sm text-slate-500">{detail}</div>
      </div>
      {href && <ExternalIcon className="h-4 w-4 text-slate-400 group-hover:text-slate-700" />}
    </>
  );
  const cls = "group flex items-center justify-between gap-4 rounded-2xl bg-white ring-1 ring-slate-200 px-5 py-4";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls + " hover:ring-slate-300 hover:shadow-sm transition"}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

function Footer() {
  return (
    <footer style={{ background: UNISA_BLUE_DARK }} className="text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 grid gap-8 md:grid-cols-[2fr_1fr_1fr]">
        <div>
          <Logo inverted />
          <p className="mt-4 max-w-sm text-sm text-white/60 leading-relaxed">
            Vetrina degli spin-off universitari dell'Università degli Studi di Salerno, con filtri per
            settore e stato di incubazione.
          </p>
        </div>
        <div>
          <div className="text-sm font-semibold">Navigazione</div>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            {NAV.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} onClick={(e) => { e.preventDefault(); scrollToId(n.id); }} className="hover:text-white">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold">Ateneo</div>
          <ul className="mt-3 space-y-2 text-sm text-white/60">
            <li><a href={LINKS.unisa} target="_blank" rel="noopener noreferrer" className="hover:text-white">unisa.it</a></li>
            <li><a href={LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">Instagram</a></li>
            <li><a href={LINKS.x} target="_blank" rel="noopener noreferrer" className="hover:text-white">X</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-5 text-xs text-white/50">
          © {new Date().getFullYear()} {UNIVERSITY_NAME}
        </div>
      </div>
    </footer>
  );
}

// --- Icone (inline SVG) ---
type IconProps = { className?: string };
const svg = (d: string) => ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
    <path d={d} />
  </svg>
);
const SearchIcon = svg("M21 21l-4.35-4.35M11 18a7 7 0 1 1 0-14 7 7 0 0 1 0 14z");
const ArrowIcon = svg("M5 12h14M13 6l6 6-6 6");
const ExternalIcon = svg("M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5");
const MenuIcon = svg("M4 7h16M4 12h16M4 17h16");
const CloseIcon = svg("M6 6l12 12M18 6L6 18");
