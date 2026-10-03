import { useEffect, useId, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { chapterHref, navigateToChapter } from "../lib/chapterNavigation";

const labels=["晶体结构","衍射与倒格子","晶体结合","晶格振动","声子热学","自由电子气","能带","半导体","费米面与金属","超导","抗磁与顺磁","磁有序","磁共振","集体电子激发","光学与激子","介电与铁电","表面与界面","纳米结构","非晶固体","点缺陷","位错","合金"];
const groups=[{label:"结构与晶格",start:0,end:5},{label:"电子与超导",start:5,end:10},{label:"磁性、光学与介电",start:10,end:16},{label:"低维、无序与缺陷",start:16,end:22}];

export function ChapterSwitcher({current,compact=false}:{current:number;compact?:boolean}) {
  const [open,setOpen]=useState(false);
  const trigger=useRef<HTMLButtonElement>(null),panel=useRef<HTMLElement>(null);
  const id=useId();
  const [left,setLeft]=useState(250);
  useEffect(()=>setOpen(false),[current]);
  useEffect(()=>{
    if(!open)return;
    const align=()=>setLeft(Math.max(16,Math.min(trigger.current?.getBoundingClientRect().left??250,innerWidth-556)));
    align();addEventListener("resize",align);
    const previousOverflow=document.documentElement.style.overflowY;
    document.documentElement.style.overflowY="hidden";
    const background=[...document.querySelectorAll<HTMLElement>("#root > *, .studio-glass-shared-canvas")].filter(el=>!el.matches(".studio-glass-shared-canvas,.lattice-atmosphere"));
    const inert=background.map(el=>el.inert);background.forEach(el=>el.inert=true);
    panel.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus({preventScroll:true});
    return()=>{
      removeEventListener("resize",align);
      document.documentElement.style.overflowY=previousOverflow;
      background.forEach((el,i)=>el.inert=inert[i]);
      trigger.current?.focus({preventScroll:true});
    };
  },[open]);
  const keyboard=(event:KeyboardEvent<HTMLElement>)=>{
    if(event.key==="Escape"){event.preventDefault();setOpen(false);return;}
    const items=[...panel.current!.querySelectorAll<HTMLElement>("button,a[href]")];
    const index=items.indexOf(document.activeElement as HTMLElement);
    if(event.key==="Tab"){
      if(event.shiftKey&&index===0){event.preventDefault();items.at(-1)?.focus();}
      if(!event.shiftKey&&index===items.length-1){event.preventDefault();items[0]?.focus();}
    }
    if(["ArrowDown","ArrowUp","Home","End"].includes(event.key)){
      event.preventDefault();const next=event.key==="Home"?1:event.key==="End"?items.length-1:(index+(event.key==="ArrowDown"?1:-1)+items.length)%items.length;items[next]?.focus();
    }
  };
  const change=(event:MouseEvent<HTMLAnchorElement>,chapter:number)=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();setOpen(false);navigateToChapter(chapter);
  };
  return <div className={"chapter-picker "+(compact?"is-compact":"")}>
    <button ref={trigger} type="button" className="chapter-menu-trigger" aria-label={`切换章节，当前第 ${current} 章`} aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={()=>setOpen(!open)}>
      <span className="chapter-trigger-number">{String(current).padStart(2,"0")}</span><span className="chapter-trigger-label">{labels[current-1]}</span><span className="chapter-trigger-mobile">切换章节</span><svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true"><path d="m5 7 5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
    </button>
    {open&&createPortal(<><div className="chapter-menu-scrim" onClick={()=>setOpen(false)} aria-hidden="true"/>
      <section ref={panel} id={id} className="chapter-menu" role="dialog" aria-modal="true" aria-labelledby={id+"-title"} style={{left}} onKeyDown={keyboard}>
        <div className="chapter-menu-heading"><div><span>EXPLORE KITTEL</span><h2 id={id+"-title"}>选择学习章节</h2></div><button type="button" aria-label="关闭章节切换菜单" onClick={()=>setOpen(false)}>×</button></div>
        <nav className="chapter-menu-list" aria-label="全部 22 章">{groups.map(group=><section className="chapter-menu-group" key={group.label}><h3>{group.label}<span>{String(group.start+1).padStart(2,"0")}—{group.end}</span></h3><div>{labels.slice(group.start,group.end).map((label,index)=>{const chapter=group.start+index+1;return <a key={chapter} href={chapterHref(chapter)} aria-current={current===chapter?"page":undefined} onClick={event=>change(event,chapter)}><span>{String(chapter).padStart(2,"0")}</span><strong>{label}</strong>{current===chapter&&<i aria-hidden="true">✓</i>}</a>;})}</div></section>)}</nav>
      </section></>,document.body)}
  </div>;
}
