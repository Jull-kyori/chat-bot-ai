"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownAZ, ArrowLeft, ArrowUpRight, Check, Code2, Copy, Download,
  FileText, FolderKanban, LayoutGrid, List, Palette, Plus, Presentation,
  Search, Sparkles, Trash2, Plug, X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { cn } from "@/lib/utils";

type Section = "projects" | "artifacts" | "code" | "plugins";
type Project = { id: string; name: string; description: string; createdAt: string };
type Artifact = { id: string; name: string; kind: "Dokumen" | "Slide" | "Desain"; content: string; updatedAt: string };
type Snippet = { id: string; name: string; language: string; content: string };

const ITEMS = [
  { href: "/projects", key: "projects", label: "Proyek", icon: FolderKanban },
  { href: "/artifacts", key: "artifacts", label: "Artefak", icon: FileText },
  { href: "/code", key: "code", label: "Code", icon: Code2 },
  { href: "/plugins", key: "plugins", label: "Plugin", icon: Plug },
] as const;

const PLUGINS = [
  { name: "Google Drive", category: "Produktivitas", description: "Cari dan ringkas file dari Google Drive." },
  { name: "Gmail", category: "Email & pesan", description: "Bantu menulis dan merangkum email." },
  { name: "Google Calendar", category: "Produktivitas", description: "Atur agenda dan cari waktu yang tersedia." },
  { name: "Notion", category: "Catatan", description: "Cari dan rangkum catatan workspace Notion." },
  { name: "Canva", category: "Desain & media", description: "Mulai ide desain dan materi visual." },
  { name: "Slack", category: "Email & pesan", description: "Temukan konteks dari percakapan tim." },
  { name: "GitHub", category: "Kode", description: "Bantu memahami repositori dan pull request." },
  { name: "Google Sheets", category: "Produktivitas", description: "Buat ringkasan dari data spreadsheet." },
  { name: "Figma", category: "Desain & media", description: "Jelajahi file dan ide desain produk." },
  { name: "Zapier", category: "Otomatisasi", description: "Rancang alur kerja otomatis." },
];

const readStore = <T,>(key: string, fallback: T): T => {
  try {
    const value = window.localStorage.getItem(`namabot-${key}`);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch { return fallback; }
};

function NavRail({ active }: { active: Section }) {
  return (
    <aside className="flex w-[248px] shrink-0 flex-col border-r border-border-subtle bg-bg-surface/90 px-3 py-4 max-lg:w-[72px] max-sm:hidden">
      <Link href="/chat" className="mb-7 flex h-9 items-center gap-2 px-2 max-lg:justify-center max-lg:px-0" aria-label="Kembali ke chat">
        <BrandLogo iconSize={22} textClassName="text-lg max-lg:hidden" />
      </Link>
      <Link href="/chat" className="mb-3 flex items-center gap-2.5 rounded-xl bg-bg-elevated px-3 py-2.5 text-sm font-medium text-text-primary transition hover:bg-bg-elevated-hover max-lg:justify-center max-lg:px-0">
        <Plus className="h-4 w-4" /><span className="max-lg:hidden">Buat baru</span>
      </Link>
      <nav className="space-y-1" aria-label="Navigasi workspace">
        <Link href="/chat" className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-text-secondary transition hover:bg-bg-elevated/70 hover:text-text-primary max-lg:justify-center max-lg:px-0" title="Cari"><Search className="h-4 w-4"/><span className="max-lg:hidden">Cari</span></Link>
        {ITEMS.map(({ href, key, label, icon: Icon }) => (
          <Link key={key} href={href} aria-current={active === key ? "page" : undefined} className={cn("flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition max-lg:justify-center max-lg:px-0", active === key ? "bg-bg-elevated text-text-primary" : "text-text-secondary hover:bg-bg-elevated/70 hover:text-text-primary")} title={label}>
            <Icon className="h-4 w-4"/><span className="max-lg:hidden">{label}</span>
          </Link>
        ))}
      </nav>
      <div className="mt-auto border-t border-border-subtle pt-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2 max-lg:justify-center max-lg:px-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-accent-coral/30 bg-accent-coral/15 text-xs font-semibold text-accent-coral">N</span>
          <div className="min-w-0 max-lg:hidden"><p className="truncate text-sm text-text-primary">Workspace Anda</p><p className="text-[11px] text-text-muted">Paket Free</p></div>
        </div>
      </div>
    </aside>
  );
}

function PageHeader({ title, description, children }: { title: string; description: string; children?: React.ReactNode }) {
  return <header className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h1 className="font-serif text-3xl tracking-tight text-text-primary">{title}</h1><p className="mt-2 text-sm text-text-secondary">{description}</p></div><div className="flex items-center gap-2">{children}</div></header>;
}

function ActionButton({ children, onClick, secondary = false }: { children: React.ReactNode; onClick: () => void; secondary?: boolean }) {
  return <button onClick={onClick} type="button" className={cn("inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition hover:-translate-y-0.5", secondary ? "border border-border-subtle bg-bg-surface text-text-primary hover:bg-bg-elevated" : "bg-bg-btn-primary text-text-btn-primary hover:bg-bg-btn-primary-hover")}>{children}</button>;
}

function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);
  useEffect(() => setProjects(readStore<Project[]>("projects", [])), []);
  const persist = (next: Project[]) => { setProjects(next); localStorage.setItem("namabot-projects", JSON.stringify(next)); };
  const filtered = projects.filter((project) => `${project.name} ${project.description}`.toLowerCase().includes(query.toLowerCase()));
  const create = (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const project = { id: crypto.randomUUID(), name: name.trim(), description: description.trim(), createdAt: new Date().toISOString() };
    persist([project, ...projects]); setSelected(project); setName(""); setDescription(""); setCreating(false);
  };
  return <>
    <PageHeader title="Proyek" description="Kumpulkan materi, instruksi, dan percakapan dalam satu ruang kerja.">
      <label className="relative hidden sm:block"><Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari proyek" className="w-44 rounded-xl border border-border-subtle bg-bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-coral/60"/></label>
      <ActionButton onClick={() => { setCreating(true); setSelected(null); }}><Plus className="h-4 w-4"/>Proyek baru</ActionButton>
    </PageHeader>
    {creating && <form onSubmit={create} className="mb-6 grid gap-3 rounded-2xl border border-border-subtle bg-bg-surface p-4 sm:grid-cols-[1fr_1.5fr_auto]"><input autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama proyek" className="rounded-xl border border-border-subtle bg-bg-main px-3 py-2 text-sm outline-none focus:border-accent-coral/60"/><input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi singkat (opsional)" className="rounded-xl border border-border-subtle bg-bg-main px-3 py-2 text-sm outline-none focus:border-accent-coral/60"/><div className="flex gap-2"><button className="rounded-xl bg-bg-btn-primary px-4 py-2 text-sm font-medium text-text-btn-primary">Simpan</button><button type="button" onClick={() => setCreating(false)} aria-label="Tutup" className="rounded-xl border border-border-subtle px-3 text-text-secondary"><X className="h-4 w-4"/></button></div></form>}
    {selected && <section className="mb-6 rounded-2xl border border-accent-coral/25 bg-accent-coral/5 p-5"><div className="flex justify-between gap-4"><div><p className="text-xs font-medium uppercase tracking-wider text-accent-coral">Ruang proyek</p><h2 className="mt-1 text-xl font-semibold">{selected.name}</h2><p className="mt-2 text-sm text-text-secondary">{selected.description || "Tambahkan materi dan instruksi khusus agar semua pekerjaan tetap terarah."}</p></div><button onClick={() => setSelected(null)} aria-label="Tutup detail" className="h-fit rounded-lg p-2 text-text-muted hover:bg-bg-elevated"><X className="h-4 w-4"/></button></div><div className="mt-5 flex flex-wrap gap-2"><Link href="/chat" className="rounded-xl bg-bg-btn-primary px-3 py-2 text-xs font-medium text-text-btn-primary">Mulai chat di proyek</Link><button onClick={() => { if (confirm(`Hapus proyek “${selected.name}”?`)) { persist(projects.filter((p) => p.id !== selected.id)); setSelected(null); } }} className="rounded-xl border border-border-subtle px-3 py-2 text-xs text-text-secondary">Hapus proyek</button></div></section>}
    {filtered.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((project) => <button key={project.id} onClick={() => setSelected(project)} className="group rounded-2xl border border-border-subtle bg-bg-surface p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-border-strong hover:bg-bg-elevated/50"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent-coral/12 text-accent-coral"><FolderKanban className="h-5 w-5"/></span><h2 className="mt-4 font-medium">{project.name}</h2><p className="mt-1 min-h-10 text-sm text-text-secondary">{project.description || "Belum ada deskripsi"}</p><div className="mt-4 flex items-center justify-between text-xs text-text-muted"><span>Dibuat {new Date(project.createdAt).toLocaleDateString("id-ID")}</span><ArrowUpRight className="h-4 w-4 opacity-0 transition group-hover:opacity-100"/></div></button>)}</div> : <EmptyState icon={<FolderKanban className="h-8 w-8"/>} title={query ? "Proyek tidak ditemukan" : "Ingin memulai proyek?"} body={query ? "Coba kata kunci yang berbeda." : "Unggah materi, atur instruksi khusus, dan kelola percakapan dalam satu tempat."} action={!query ? <ActionButton onClick={() => setCreating(true)}><Plus className="h-4 w-4"/>Proyek baru</ActionButton> : undefined}/>}
  </>;
}

function ArtifactPage() {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [kind, setKind] = useState<"Semua" | Artifact["kind"]>("Semua");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Artifact | null>(null);
  const [content, setContent] = useState("");
  useEffect(() => setArtifacts(readStore<Artifact[]>("artifacts", [])), []);
  const persist = (next: Artifact[]) => { setArtifacts(next); localStorage.setItem("namabot-artifacts", JSON.stringify(next)); };
  const create = (type: Artifact["kind"]) => { const item = { id: crypto.randomUUID(), name: `${type} tanpa judul`, kind: type, content: "", updatedAt: new Date().toISOString() }; persist([item, ...artifacts]); setEditing(item); setContent(""); };
  const save = () => { if (!editing) return; const updated = { ...editing, content, updatedAt: new Date().toISOString() }; persist(artifacts.map((item) => item.id === editing.id ? updated : item)); setEditing(null); };
  const visible = artifacts.filter((item) => (kind === "Semua" || item.kind === kind) && item.name.toLowerCase().includes(query.toLowerCase()));
  const typeMeta = { Dokumen: { icon: FileText, color: "bg-blue-500/25 text-blue-300" }, Slide: { icon: Presentation, color: "bg-orange-500/25 text-orange-300" }, Desain: { icon: Palette, color: "bg-violet-500/25 text-violet-300" } };
  return <>
    <PageHeader title="Artefak" description="Simpan dokumen, presentasi, dan ide desain yang Anda buat.">
      <label className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari artefak" className="w-40 rounded-xl border border-border-subtle bg-bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-coral/60 sm:w-48"/></label>
    </PageHeader>
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4"><div className="flex gap-1 rounded-xl bg-bg-surface p-1">{(["Semua", "Dokumen", "Slide", "Desain"] as const).map((tab) => <button key={tab} onClick={() => setKind(tab)} className={cn("rounded-lg px-3 py-1.5 text-xs transition", kind === tab ? "bg-bg-elevated text-text-primary" : "text-text-secondary hover:text-text-primary")}>{tab}</button>)}</div><span className="text-xs text-text-muted">{artifacts.length} item</span></div>
    <div className="mb-8"><p className="mb-3 text-xs font-medium text-text-secondary">Buat sesuatu yang baru</p><div className="flex flex-wrap gap-3">{(["Dokumen", "Slide", "Desain"] as const).map((type) => { const Icon = typeMeta[type].icon; return <button key={type} onClick={() => create(type)} className="group w-32 text-left"><span className={cn("flex h-24 items-center justify-center rounded-2xl transition group-hover:-translate-y-1 group-hover:brightness-110", typeMeta[type].color)}><Icon className="h-8 w-8"/></span><span className="mt-2 block text-sm text-text-primary">{type}</span></button>; })}</div></div>
    {visible.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{visible.map((item) => { const Icon = typeMeta[item.kind].icon; return <article key={item.id} className="group overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface transition hover:border-border-strong"><button onClick={() => { setEditing(item); setContent(item.content); }} className="flex h-40 w-full items-center justify-center bg-bg-elevated/60 text-text-muted transition group-hover:bg-bg-elevated"><Icon className="h-11 w-11 opacity-70"/></button><div className="flex items-center justify-between gap-2 border-t border-border-subtle px-4 py-3"><button onClick={() => { setEditing(item); setContent(item.content); }} className="min-w-0 text-left"><p className="truncate text-sm font-medium">{item.name}</p><p className="mt-0.5 text-xs text-text-muted">{item.kind} · {new Date(item.updatedAt).toLocaleDateString("id-ID")}</p></button><button onClick={() => persist(artifacts.filter((artifact) => artifact.id !== item.id))} aria-label={`Hapus ${item.name}`} className="rounded-lg p-2 text-text-muted opacity-0 hover:bg-bg-elevated hover:text-red-400 group-hover:opacity-100"><Trash2 className="h-4 w-4"/></button></div></article>; })}</div> : <EmptyState icon={<FileText className="h-8 w-8"/>} title="Belum ada artefak" body="Buat dokumen, slide, atau desain pertama Anda dari pilihan di atas."/>}
    {editing && <Modal title={editing.name} onClose={() => setEditing(null)}><label className="mb-3 block text-xs text-text-secondary">Nama artefak<input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="mt-1 w-full rounded-xl border border-border-subtle bg-bg-main px-3 py-2 text-sm text-text-primary outline-none focus:border-accent-coral/60"/></label><textarea autoFocus value={content} onChange={(e) => setContent(e.target.value)} placeholder={`Tulis isi ${editing.kind.toLowerCase()} Anda di sini...`} className="min-h-56 w-full resize-y rounded-xl border border-border-subtle bg-bg-main p-3 text-sm leading-6 text-text-primary outline-none focus:border-accent-coral/60"/><div className="mt-4 flex justify-end gap-2"><button onClick={() => setEditing(null)} className="rounded-xl px-3 py-2 text-sm text-text-secondary">Batal</button><button onClick={save} className="rounded-xl bg-bg-btn-primary px-4 py-2 text-sm font-medium text-text-btn-primary">Simpan</button></div></Modal>}
  </>;
}

function CodePage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [activeId, setActiveId] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => { const initial = readStore<Snippet[]>("snippets", []); setSnippets(initial); if (initial[0]) setActiveId(initial[0].id); }, []);
  const active = snippets.find((snippet) => snippet.id === activeId);
  const persist = (next: Snippet[]) => { setSnippets(next); localStorage.setItem("namabot-snippets", JSON.stringify(next)); };
  const update = (patch: Partial<Snippet>) => { if (active) persist(snippets.map((snippet) => snippet.id === active.id ? { ...snippet, ...patch } : snippet)); };
  const create = () => { const item = { id: crypto.randomUUID(), name: `Snippet ${snippets.length + 1}`, language: "typescript", content: "// Tulis atau tempel kode Anda di sini\n" }; persist([item, ...snippets]); setActiveId(item.id); };
  const copy = async () => { if (!active) return; await navigator.clipboard.writeText(active.content); setCopied(true); window.setTimeout(() => setCopied(false), 1600); };
  const download = () => { if (!active) return; const blob = new Blob([active.content], { type: "text/plain" }); const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = `${active.name.replace(/[^a-z0-9-_]/gi, "-")}.${active.language === "javascript" ? "js" : active.language === "python" ? "py" : "ts"}`; anchor.click(); URL.revokeObjectURL(url); };
  return <>
    <PageHeader title="Code" description="Tulis, simpan, dan kelola potongan kode dalam satu tempat."><ActionButton onClick={create}><Plus className="h-4 w-4"/>Snippet baru</ActionButton></PageHeader>
    <div className="grid min-h-[520px] overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface lg:grid-cols-[240px_1fr]"><aside className="border-b border-border-subtle p-3 lg:border-b-0 lg:border-r"><div className="mb-2 flex items-center justify-between px-2"><span className="text-xs font-medium text-text-secondary">Snippet tersimpan</span><button onClick={create} aria-label="Buat snippet" className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-elevated"><Plus className="h-4 w-4"/></button></div>{snippets.length ? snippets.map((snippet) => <button key={snippet.id} onClick={() => setActiveId(snippet.id)} className={cn("mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm", snippet.id === activeId ? "bg-bg-elevated text-text-primary" : "text-text-secondary hover:bg-bg-elevated/60")}><Code2 className="h-4 w-4 shrink-0"/><span className="truncate">{snippet.name}</span></button>) : <p className="px-2 py-5 text-xs leading-5 text-text-muted">Snippet tersimpan akan muncul di sini.</p>}</aside>
      {active ? <section className="flex min-w-0 flex-col"><div className="flex flex-wrap items-center gap-2 border-b border-border-subtle p-3"><input value={active.name} onChange={(e) => update({ name: e.target.value })} aria-label="Nama snippet" className="min-w-28 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-sm font-medium outline-none focus:border-border-subtle focus:bg-bg-main"/><select value={active.language} onChange={(e) => update({ language: e.target.value })} aria-label="Bahasa pemrograman" className="rounded-lg border border-border-subtle bg-bg-main px-2 py-1.5 text-xs text-text-secondary outline-none">{["typescript", "javascript", "python", "html", "css", "json", "sql"].map((language) => <option key={language}>{language}</option>)}</select><button onClick={() => void copy()} className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle px-2.5 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated">{copied ? <Check className="h-3.5 w-3.5"/> : <Copy className="h-3.5 w-3.5"/>}{copied ? "Tersalin" : "Salin"}</button><button onClick={download} className="inline-flex items-center gap-1.5 rounded-lg border border-border-subtle px-2.5 py-1.5 text-xs text-text-secondary hover:bg-bg-elevated"><Download className="h-3.5 w-3.5"/>Unduh</button><button onClick={() => { persist(snippets.filter((snippet) => snippet.id !== active.id)); const next = snippets.find((snippet) => snippet.id !== active.id); setActiveId(next?.id ?? ""); }} aria-label="Hapus snippet" className="rounded-lg p-1.5 text-text-muted hover:bg-bg-elevated hover:text-red-400"><Trash2 className="h-4 w-4"/></button></div><textarea spellCheck={false} value={active.content} onChange={(e) => update({ content: e.target.value })} className="min-h-[440px] flex-1 resize-none bg-[#151515] p-5 font-mono text-[13px] leading-6 text-[#d6deeb] outline-none" aria-label="Editor kode"/><div className="border-t border-border-subtle px-4 py-2 text-[11px] text-text-muted">Perubahan disimpan otomatis di browser ini</div></section> : <EmptyState icon={<Code2 className="h-8 w-8"/>} title="Ruang kerja kode" body="Buat snippet baru untuk mulai menulis dan menyimpan kode." action={<ActionButton onClick={create}><Plus className="h-4 w-4"/>Snippet baru</ActionButton>}/>}</div>
  </>;
}

function PluginPage() {
  const [installed, setInstalled] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Semua");
  const categories = ["Semua", ...Array.from(new Set(PLUGINS.map((plugin) => plugin.category)))];
  useEffect(() => setInstalled(readStore<string[]>("plugins", [])), []);
  const toggle = (name: string) => { const next = installed.includes(name) ? installed.filter((item) => item !== name) : [...installed, name]; setInstalled(next); localStorage.setItem("namabot-plugins", JSON.stringify(next)); };
  const visible = PLUGINS.filter((plugin) => (filter === "Semua" || plugin.category === filter) && `${plugin.name} ${plugin.description}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <PageHeader title="Plugin" description="Pilih integrasi untuk menyesuaikan pengalaman kerja Anda."><span className="rounded-full border border-border-subtle bg-bg-surface px-3 py-1.5 text-xs text-text-secondary">{installed.length} aktif</span></PageHeader>
    <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><label className="relative max-w-md flex-1"><Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted"/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari plugin" className="w-full rounded-xl border border-border-subtle bg-bg-surface py-2 pl-9 pr-3 text-sm outline-none focus:border-accent-coral/60"/></label><div className="flex flex-wrap gap-1.5">{categories.map((category) => <button key={category} onClick={() => setFilter(category)} className={cn("rounded-lg px-2.5 py-1.5 text-xs transition", filter === category ? "bg-bg-elevated text-text-primary" : "text-text-secondary hover:bg-bg-surface")}>{category}</button>)}</div></div>
    <div className="grid gap-3 md:grid-cols-2">{visible.map((plugin) => { const active = installed.includes(plugin.name); return <article key={plugin.name} className="flex items-start gap-3 rounded-2xl border border-border-subtle bg-bg-surface p-4 transition hover:border-border-strong"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-elevated text-accent-coral"><Plug className="h-5 w-5"/></span><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h2 className="text-sm font-medium">{plugin.name}</h2><p className="mt-1 text-xs leading-5 text-text-secondary">{plugin.description}</p></div><button onClick={() => toggle(plugin.name)} className={cn("shrink-0 rounded-lg border px-2.5 py-1.5 text-xs transition", active ? "border-accent-coral/25 bg-accent-coral/10 text-accent-coral hover:bg-red-500/10 hover:text-red-300" : "border-border-subtle text-text-secondary hover:bg-bg-elevated hover:text-text-primary")}>{active ? "Terpasang" : "Hubungkan"}</button></div><p className="mt-2 text-[10px] text-text-muted">{plugin.category} · Pengaturan disimpan di perangkat ini</p></div></article>; })}</div>
    {!visible.length && <EmptyState icon={<Plug className="h-8 w-8"/>} title="Plugin tidak ditemukan" body="Coba kata kunci atau kategori lain."/>}
    <p className="mt-6 rounded-xl border border-border-subtle/70 bg-bg-surface/50 p-3 text-xs leading-5 text-text-muted">Status plugin tersimpan di browser. Integrasi akun pihak ketiga akan tersedia setelah konektor layanan dikonfigurasi.</p>
  </>;
}

function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-bg-surface/40 px-6 py-10 text-center"><span className="mb-4 text-text-muted">{icon}</span><h2 className="font-serif text-xl">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">{body}</p>{action && <div className="mt-5">{action}</div>}</div>;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"><section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-2xl rounded-2xl border border-border-subtle bg-bg-surface p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-medium">{title}</h2><button onClick={onClose} aria-label="Tutup" className="rounded-lg p-1.5 text-text-secondary hover:bg-bg-elevated"><X className="h-4 w-4"/></button></div>{children}</section></div>;
}

export function WorkspaceHub({ section }: { section: Section }) {
  const title = ITEMS.find((item) => item.key === section)?.label ?? "Workspace";
  return <div className="flex h-dvh overflow-hidden bg-bg-chat text-text-primary"><NavRail active={section}/><main className="min-w-0 flex-1 overflow-y-auto"><div className="mx-auto min-h-full w-full max-w-6xl px-5 py-7 sm:px-8 lg:px-12"><Link href="/chat" className="mb-5 inline-flex items-center gap-1.5 text-xs text-text-muted transition hover:text-text-primary sm:hidden"><ArrowLeft className="h-3.5 w-3.5"/>Kembali ke chat</Link><div className="mb-5 flex items-center gap-2 text-xs text-text-muted"><Sparkles className="h-3.5 w-3.5 text-accent-coral"/>NamaBot Workspace<span className="opacity-50">/</span>{title}</div>{section === "projects" ? <ProjectPage/> : section === "artifacts" ? <ArtifactPage/> : section === "code" ? <CodePage/> : <PluginPage/>}</div></main></div>;
}
