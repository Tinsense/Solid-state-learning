import { useEffect, useState } from "react";

type Entry = { id: string; chapter: number; number: string; page: number; src: string; width: number; height: number };
let cached: Promise<Entry[]> | undefined;
const load = () => cached ??= fetch(`${import.meta.env.BASE_URL}formulas/index.json`).then(response => {
  if (!response.ok) throw new Error("公式索引暂时无法加载");
  return response.json() as Promise<Entry[]>;
}).catch(error => { cached = undefined; throw error; });

export function EquationAtlas({ chapter }: { chapter: number }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState("all");
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let live = true;
    load().then(data => { if (live) setEntries(data.filter(item => item.chapter === chapter)); })
      .catch(reason => { if (live) setError(String(reason.message)); });
    return () => { live = false; };
  }, [chapter]);
  const pages = [...new Set(entries.map(item => item.page))];
  const filtered = entries.filter(item => (!query || item.number.includes(query.trim().replace(/[()式]/g, ""))) && (page === "all" || item.page === Number(page)));
  return <section id="equation-atlas" className="section-shell content-section equation-atlas">
    <p className="overline">EQUATION ATLAS · 原书核对</p>
    <h2>从式号找回完整公式。</h2>
    <p className="atlas-intro">本章索引收录 {entries.length || "…"} 个原书编号数学展示，包括正文、补充推算与习题中编号的式子。数学符号直接保留原式，避免旧 PDF 字体转写造成上下标错误；讲解与推导采用上方中文课程。未编号的中间计算请结合对应推导阅读。</p>
    <p className="atlas-intro">注意原书并列使用 SI 和 CGS 单位。出现 c、4π 或真空常数时，先核对式子标注的单位制，再与本站采用 SI 的实验比较；不能直接混用数值。</p>
    <div className="atlas-controls">
      <label>查找式号<input aria-label="查找原书式号" placeholder="例如 24 或 24a" value={query} onChange={event => { setQuery(event.target.value); setOpen(true); }}/></label>
      <label>原书页码<select aria-label="筛选公式页码" value={page} onChange={event => { setPage(event.target.value); setOpen(true); }}><option value="all">全部页码</option>{pages.map(number => <option key={number} value={number}>p. {number}</option>)}</select></label>
      <button className="liquid-button secondary" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? "收起公式索引" : "展开公式索引"}</button>
    </div>
    {error && <p role="alert">{error}，请刷新后重试。</p>}
    {open && <div className="atlas-grid">{filtered.map(item => <article className="atlas-card liquid-panel" key={item.id} id={item.id}>
      <div className="atlas-caption"><strong>第 {chapter} 章 · 式 ({item.number})</strong><span>p. {item.page}</span></div>
      <img loading="lazy" src={`${import.meta.env.BASE_URL}${item.src}`} width={item.width} height={item.height} alt={`Kittel 第 ${chapter} 章第 ${item.page} 页，编号 (${item.number}) 的原始数学公式`}/>
    </article>)}{!filtered.length && <p>没有匹配的式号或页码。</p>}</div>}
  </section>;
}
