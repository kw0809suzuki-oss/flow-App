import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { TossArea } from "@/components/box/TossArea";
import { CategoryChip } from "@/components/box/CategoryChip";
import { ItemSheet } from "@/components/box/ItemSheet";
import { addItemTo, deleteItemFrom, loadItems, type BoxItem } from "@/lib/box-storage";
import { classify, formatRelative } from "@/lib/classify";

const labels: Record<string, string> = { buy: "買うかも", todo: "やること", go: "行きたい", curious: "気になる", record: "記録", mystery: "謎" };
const DISPLAY_LIMIT = 20;
const OBSERVE_LIMIT = 40;

export default function App() {
  const [items, setItems] = useState<BoxItem[]>(() => loadItems());
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<BoxItem | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);

  const handleToss = (text: string, image: string | null) => {
    const item: BoxItem = { id: crypto.randomUUID(), text, image, createdAt: Date.now(), category: classify(text, image !== null) };
    setItems((current) => addItemTo(current, item));
    setFreshId(item.id);
    window.setTimeout(() => setFreshId(null), 600);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, DISPLAY_LIMIT);

    const found: BoxItem[] = [];
    for (const item of items) {
      if (item.text.toLowerCase().includes(q)) found.push(item);
      if (found.length >= DISPLAY_LIMIT) break;
    }
    return found;
  }, [items, query]);

  const observation = useMemo(() => {
    if (items.length === 0) return { stage: "観測待ち", title: "まだ何も起きてない", body: "何個かポイすると、BOXが勝手に観測を始める。", note: "最初は状態を見る。", stats: [] as string[] };

    const sample = items.slice(0, OBSERVE_LIMIT);
    const now = Date.now();
    const counts = new Map<string, number>();
    const recentCounts = new Map<string, number>();
    let today = 0;
    let old = 0;
    let photos = 0;

    for (const item of sample) {
      const age = now - item.createdAt;
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
      if (age < 3 * 86400000) recentCounts.set(item.category, (recentCounts.get(item.category) ?? 0) + 1);
      if (age < 86400000) today += 1;
      if (age >= 3 * 86400000) old += 1;
      if (item.image) photos += 1;
    }

    const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    const [top, topCount] = ranked[0];
    const topLabel = labels[top] ?? top;

    if (items.length < 4) return { stage: "1｜状態を見る", title: "BOXが育ちはじめた", body: `いまは「${topLabel}」っぽい断片が多め。まだ意味は決めない。`, note: "もう少し溜まると、断片どうしの関係を見始める。", stats: [`全部 ${items.length}件`, `今日 ${today}件`] };

    if (items.length < 8 || old === 0) {
      const second = ranked[1];
      const relation = second ? `「${topLabel}」と「${labels[second[0]] ?? second[0]}」が並んで出てる。` : `「${topLabel}」が${topCount}件まとまってきた。`;
      return { stage: "2｜関係を見る", title: "断片どうしがつながり始めた", body: relation, note: `直近${sample.length}件だけを軽く観測している。`, stats: [`全部 ${items.length}件`, `種類 ${ranked.length}`, `写真 ${photos}件`] };
    }

    const recentRanked = [...recentCounts.entries()].sort((a, b) => b[1] - a[1]);
    const recentLabel = recentRanked[0] ? labels[recentRanked[0][0]] ?? recentRanked[0][0] : topLabel;
    return { stage: "3｜変化を見る", title: "BOXの流れが見えてきた", body: `直近では「${recentLabel}」が前に出てきてる。`, note: `全件ではなく、直近${sample.length}件だけを観測している。`, stats: [`全部 ${items.length}件`, `観測 ${sample.length}件`, `今日 ${today}件`] };
  }, [items]);

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
      <header className="flex items-center gap-3 pt-6"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-card text-2xl shadow-sm">📦</div><div className="min-w-0"><h1 className="truncate text-lg font-extrabold tracking-wide text-foreground">なんちゃってBOX</h1><p className="text-xs text-muted-foreground">整理はあと。多分。</p></div></header>
      <p className="mt-6 text-center text-3xl font-extrabold tracking-wide text-foreground">考えずに、<span className="text-primary">ポイ。</span></p>
      <div className="mt-4"><TossArea onToss={handleToss} /></div>

      <section className="mt-5 rounded-3xl border border-border bg-card p-5 shadow-sm" aria-label="BOXの観測">
        <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold tracking-wider text-muted-foreground">{observation.stage}</p><span className="text-xl" aria-hidden>👀</span></div>
        <h2 className="mt-2 text-lg font-extrabold text-foreground">{observation.title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-foreground">{observation.body}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{observation.note}</p>
        {observation.stats.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{observation.stats.map((s) => <span key={s} className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{s}</span>)}</div>}
      </section>

      <div className="relative mt-6"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="あれ何だっけ？" aria-label="BOXの中を検索" className="h-12 w-full rounded-full border border-border bg-card pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring/50" /></div>

      <main className="mt-4 flex-1">{filtered.length === 0 ? <div className="mt-10 text-center"><p className="text-5xl" aria-hidden>📦</p><p className="mt-3 text-sm text-muted-foreground">{items.length === 0 ? "まだ空っぽ。なんでも投げ込んでみて。" : "それっぽいの、入ってないみたい。"}</p></div> : <ul className="flex flex-col gap-3" aria-label="BOXの中身">{filtered.map((item) => <li key={item.id} className={item.id === freshId ? "animate-toss-in" : ""}><button type="button" onClick={() => setSelected(item)} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-3xl border border-border bg-card p-4 text-left shadow-sm transition-transform active:scale-[0.98]"><div className="flex min-w-0 flex-col gap-1.5"><div className="flex items-center gap-2"><CategoryChip category={item.category} /><span className="truncate text-xs text-muted-foreground">{formatRelative(item.createdAt)}</span></div><p className="truncate text-sm text-foreground">{item.text || "（写真だけ）"}</p></div>{item.image && <img src={item.image} alt="" loading="lazy" decoding="async" className="h-14 w-14 shrink-0 rounded-xl border border-border object-cover" />}</button></li>)}</ul>}</main>
      <footer className="mt-8 text-center text-xs text-muted-foreground">表示は最新20件。観測は直近40件。データはこの端末の中だけに保存されるよ</footer>
      {selected && <ItemSheet item={selected} onClose={() => setSelected(null)} onDelete={(id) => setItems((current) => deleteItemFrom(current, id))} />}
    </div>
  );
}
