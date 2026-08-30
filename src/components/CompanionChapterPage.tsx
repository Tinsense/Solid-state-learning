import { useEffect, useState } from "react";
import type { CompanionChapter } from "../content/companionChapters";
import { useLiquidGlassSystem } from "../lib/liquidGlass";
import { ChapterSwitcher } from "./ChapterSwitcher";
import { CompanionFigure } from "./CompanionFigures";
import { Derivation } from "./Derivation";
import { FormulaCard, RichText } from "./Formula";
import { ConceptCheck, Exercise, ReadingCallout, SectionHeader, SourceNote } from "./Learning";
import { LatticeAtmosphere } from "./LatticeAtmosphere";
import { ScientificDeepDive } from "./ScientificLearning";
import { chapterDepth } from "../content/chapterDepth";

const ThemeIcon = ({ dark }: { dark: boolean }) => <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{dark ? <><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2m0 16v2M4.9 4.9l1.5 1.5m11.2 11.2 1.5 1.5M2 12h2m16 0h2M4.9 19.1l1.5-1.5m11.2-11.2 1.5-1.5"/></> : <path d="M20 15.6A8.5 8.5 0 0 1 8.4 4 8.5 8.5 0 1 0 20 15.6Z"/>}</svg>;

export function CompanionChapterPage({ chapter }: { chapter: CompanionChapter }) {
  useLiquidGlassSystem();
  const [theme, setTheme] = useState<"dark"|"light">(()=>(localStorage.getItem("kittel-theme") as "dark"|"light")||"dark");
  const [active,setActive]=useState("overview");
  const [railOpen,setRailOpen]=useState(false);
  const [completed,setCompleted]=useState<Set<string>>(()=>new Set(JSON.parse(localStorage.getItem(`kittel-progress-${chapter.number}`)||"[]")));

  useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem("kittel-theme",theme)},[theme]);
  useEffect(()=>{
    const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)setActive(visible.target.id)},{rootMargin:"-20% 0px -60%",threshold:[0,.15,.5]});
    [...chapter.units.map(u=>u.meta.id),"exercises"].forEach(id=>{const node=document.getElementById(id);if(node)observer.observe(node)});
    return()=>observer.disconnect();
  },[chapter]);
  const go=(id:string)=>{document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"});setRailOpen(false)};
  const complete=(id:string)=>setCompleted(previous=>{const next=new Set(previous);next.add(id);localStorage.setItem(`kittel-progress-${chapter.number}`,JSON.stringify([...next]));return next});
  const checks=chapter.units.filter(u=>u.check).length;
  const progress=checks?Math.round(completed.size/checks*100):0;

  return <>
    <LatticeAtmosphere/>
    <header className="site-header companion-header liquid-panel">
      <button className="brand" type="button" onClick={()=>go("overview")} aria-label="返回本章首页"><span className="brand-glyph" aria-hidden="true"><i/><i/><i/><i/></span><span><strong>晶格</strong><small>KITTEL · CHAPTER {String(chapter.number).padStart(2,"0")}</small></span></button>
      <ChapterSwitcher current={chapter.number} compact/>
      <div className="header-actions"><div className="chapter-title"><span>{String(chapter.number).padStart(2,"0")}</span><p>{chapter.english}</p></div><button className="top-action icon-only" type="button" onClick={()=>setTheme(theme==="dark"?"light":"dark")} aria-label="切换明暗主题"><ThemeIcon dark={theme==="dark"}/></button><button className="progress-chip top-action" type="button" onClick={()=>go("exercises")}><span className="mini-ring" style={{"--progress":`${progress*3.6}deg`} as React.CSSProperties}><b>{progress}</b></span><span>学习进度<small>{completed.size} / {checks} checks</small></span></button></div>
    </header>
    <button className="mobile-rail-toggle liquid-button" type="button" onClick={()=>setRailOpen(!railOpen)} aria-expanded={railOpen} aria-controls="chapter-rail"><span aria-hidden="true">{railOpen?"×":"☰"}</span><span>章节目录</span></button>
    {railOpen&&<button className="rail-scrim" type="button" aria-label="关闭目录" onClick={()=>setRailOpen(false)}/>} 
    <aside className={`chapter-rail companion-rail ${railOpen?"is-open":""}`} id="chapter-rail" aria-label={`第${chapter.number}章目录`}><div className="rail-label"><span>CH.</span><strong>{String(chapter.number).padStart(2,"0")}</strong></div><ChapterSwitcher current={chapter.number}/><nav>{chapter.units.map(item=><button key={item.meta.id} type="button" className={`rail-item ${active===item.meta.id?"is-active":""}`} onClick={()=>go(item.meta.id)}><span>{item.meta.index}</span><span>{item.meta.title}<small>{item.meta.english}</small></span></button>)}<button type="button" className={`rail-item ${active==="exercises"?"is-active":""}`} onClick={()=>go("exercises")}><span>06</span><span>章节练习<small>Exercises</small></span></button></nav><div className="rail-footer"><span>Based on</span><strong>Kittel · 8th ed.</strong><small>{chapter.pages}</small></div></aside>
    <main id="main-content" className="companion-main">
      <section className="companion-hero section-shell liquid-panel hero-module" aria-labelledby="chapter-heading"><div><p className="overline">INTERACTIVE ELECTRONIC TEXTBOOK · 中文精讲</p><h1 id="chapter-heading">{chapter.hero.split("\n").map((line,i)=><span key={line}>{line}{i===0&&<br/>}</span>)}</h1><p className="hero-lead">{chapter.lead}</p><div className="hero-actions"><button className="liquid-button primary hero-start-glass" type="button" onClick={()=>go(chapter.units[1].meta.id)}>开始学习 <span aria-hidden="true">→</span></button><button className="liquid-button secondary hero-map-glass" type="button" onClick={()=>go("map")}>先看知识地图</button></div></div><div className="chapter-orbit" aria-hidden="true"><span>{String(chapter.number).padStart(2,"0")}</span><i/><i/><i/><b>{chapter.english}</b></div><div className="hero-metrics">{chapter.metrics.map((metric,i)=>{const [value,...label]=metric.split(" ");return <div key={metric}><span>{label.join(" ")}</span><strong>{value}</strong><small>{i===0?"循序学习":i===1?"完整展开":"实时响应"}</small></div>})}</div><SourceNote>Kittel 8e, Chapter {chapter.number}, {chapter.pages}；内容为中文教学式重写，公式与结构按原书核对，插图均为本站重新绘制。</SourceNote></section>
      {chapter.units.map((item,index)=>{const depth=chapterDepth[`${chapter.number}:${item.meta.id}`];return <section key={item.meta.id} id={item.meta.id} className={`section-shell content-section ${index===0?"companion-first-unit":""}`}><SectionHeader section={item.meta}/><div className="prose">{item.paragraphs.map(p=><p key={p}><RichText>{p}</RichText></p>)}</div>{depth&&<ScientificDeepDive data={depth}/>} {item.formula&&<FormulaCard {...item.formula}/>} {item.figure&&<CompanionFigure type={item.figure}/>} {item.derivations?.map(d=><Derivation key={d.id} data={d}/>)} {item.callout&&<ReadingCallout title={item.callout.title}><p>{item.callout.body}</p></ReadingCallout>} {item.check&&<ConceptCheck {...item.check} onComplete={complete}/>} {item.meta.id==="map"&&<div className="chapter-summary"><h3>把这一章压缩成四句话</h3><ol>{chapter.summary.map((line,i)=><li key={line}><span>{String(i+1).padStart(2,"0")}</span><p>{line}</p></li>)}</ol></div>}<SourceNote>{item.meta.reference}</SourceNote></section>})}
      <section id="exercises" className="section-shell content-section"><SectionHeader section={{id:"exercises",index:"06",title:"章节练习",english:"Exercises",question:"你能否不看结论，自己重建本章的几何与物理链条？",reference:`Kittel 8e, Chapter ${chapter.number}, Problems`}}/><div className="exercise-list">{chapter.exercises.map(exercise=><Exercise key={exercise.id} exercise={exercise}/>)}</div><div className="completion-panel"><span className="overline">CHAPTER COMPLETE</span><h3>{completed.size===checks?"本章概念检查已完成。":`你已完成 ${completed.size} / ${checks} 个概念检查。`}</h3><p>建议先独立写出假设、坐标约定与守恒条件，再展开公式。</p><div className="completion-bar"><i style={{width:`${progress}%`}}/></div><button className="text-button" type="button" onClick={()=>go("overview")}>回到章首页 ↑</button></div><SourceNote>练习围绕原章核心概念重新编写，并非原书题目逐字复制。</SourceNote></section>
    </main>
    <aside className="context-rail" aria-label="当前学习位置"><span>{chapter.units.find(u=>u.meta.id===active)?.meta.index||"06"}</span><strong>{chapter.units.find(u=>u.meta.id===active)?.meta.english||"Exercises"}</strong><i/></aside>
  </>;
}
