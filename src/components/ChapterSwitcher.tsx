import type { MouseEvent } from "react";
import { chapterHref, navigateToChapter } from "../lib/chapterNavigation";
const labels=["晶体结构","衍射与倒格子","晶体结合","晶格振动","声子热学","自由电子气","能带","半导体","费米面与金属","超导","抗磁与顺磁","磁有序","磁共振","集体电子激发","光学与激子","介电与铁电","表面与界面","纳米结构","非晶固体","点缺陷","位错","合金"];
const groups=[{label:"结构与晶格 · 01–05",start:0,end:5},{label:"电子与超导 · 06–10",start:5,end:10},{label:"磁性、光学与介电 · 11–16",start:10,end:16},{label:"低维、无序与缺陷 · 17–22",start:16,end:22}];
export function ChapterSwitcher({current,compact=false}:{current:number;compact?:boolean}) {
 const change=(event:MouseEvent<HTMLAnchorElement>,chapter:number)=>{
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();navigateToChapter(chapter);
 };
 return <div className={"chapter-picker "+(compact?"is-compact":"")}>
  <nav className={"chapter-switcher "+(compact?"is-compact":"")} aria-label="选择学习章节">
   {labels.slice(0,6).map((label,i)=><a key={i} href={chapterHref(i+1)} onClick={event=>change(event,i+1)} className={current===i+1?"is-current":""} aria-current={current===i+1?"page":undefined} title={"第 "+(i+1)+" 章 · "+label}><span>{String(i+1).padStart(2,"0")}</span>{!compact&&<small>{label}</small>}</a>)}
  </nav>
  <label className={"chapter-select "+(compact?"is-compact":"")}><span>全部 22 章 · 按主题分组</span><select aria-label="选择全部章节" value={current} onChange={event=>navigateToChapter(Number(event.target.value))}>{groups.map(group=><optgroup key={group.label} label={group.label}>{labels.slice(group.start,group.end).map((label,index)=>{const number=group.start+index+1;return <option key={number} value={number}>{String(number).padStart(2,"0")+" · "+label}</option>})}</optgroup>)}</select></label>
 </div>;
}
