import type { MouseEvent } from "react";
import { chapterHref, navigateToChapter } from "../lib/chapterNavigation";
const labels=["晶体结构","衍射与倒格子","晶体结合","晶格振动","声子热学","自由电子气","能带","半导体","费米面与金属","超导","抗磁与顺磁","磁有序","磁共振","集体电子激发","光学与激子","介电与铁电","表面与界面","纳米结构","非晶固体","点缺陷","位错","合金"];
export function ChapterSwitcher({current,compact=false}:{current:number;compact?:boolean}) {
 const change=(event:MouseEvent<HTMLAnchorElement>,chapter:number)=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();navigateToChapter(chapter);
 };
 return <div className={"chapter-picker "+(compact?"is-compact":"")}>
  <nav className={"chapter-switcher "+(compact?"is-compact":"")} aria-label="选择学习章节">
   {labels.slice(0,6).map((label,i)=><a key={i} href={chapterHref(i+1)} onClick={event=>change(event,i+1)} className={current===i+1?"is-current":""} aria-current={current===i+1?"page":undefined} title={"第 "+(i+1)+" 章 · "+label}><span>{String(i+1).padStart(2,"0")}</span>{!compact&&<small>{label}</small>}</a>)}
  </nav>
  <label className={"chapter-select "+(compact?"is-compact":"")}><span>全部 22 章</span><select aria-label="选择全部章节" value={current} onChange={event=>navigateToChapter(Number(event.target.value))}>{labels.map((label,i)=><option key={i} value={i+1}>{String(i+1).padStart(2,"0")+" · "+label}</option>)}</select></label>
 </div>;
}
