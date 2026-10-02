import { useEffect } from "react";

/** One mobile dialog, one scroll owner; never transform the page underneath. */
export function useChapterDrawer(open:boolean,close:(open:boolean)=>void){
 useEffect(()=>{
  const rail=document.getElementById("chapter-rail");
  if(!rail)return;
  const media=matchMedia("(max-width:900px)");
  const update=()=>{rail.inert=media.matches&&!open;if(!media.matches&&open)close(false);};
  update();media.addEventListener("change",update);
  return()=>media.removeEventListener("change",update);
 },[open,close]);
 useEffect(()=>{
  if(!open||!matchMedia("(max-width:900px)").matches)return;
  const rail=document.getElementById("chapter-rail");
  if(!rail)return;
  const trigger=document.querySelector<HTMLElement>(".mobile-rail-toggle");
  const previousOverflow=document.documentElement.style.overflowY;
  const background=[...document.querySelectorAll<HTMLElement>("main,.site-header")];
  const previousInert=background.map(element=>element.inert);
  background.forEach(element=>element.inert=true);
  document.documentElement.style.overflowY="hidden";
  rail.setAttribute("role","dialog");rail.setAttribute("aria-modal","true");
  const focusable=()=>[...rail.querySelectorAll<HTMLElement>("button,a[href],input,select,[tabindex='0']")].filter(element=>!element.hasAttribute("disabled")&&element.getClientRects().length>0);
  focusable()[0]?.focus({preventScroll:true});
  const onKey=(event:KeyboardEvent)=>{
   if(event.key==="Escape"){event.preventDefault();close(false);}
   if(event.key!=="Tab")return;
   const items=focusable(),first=items[0],last=items.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  };
  document.addEventListener("keydown",onKey);
  return()=>{
   document.removeEventListener("keydown",onKey);
   document.documentElement.style.overflowY=previousOverflow;
   background.forEach((element,index)=>element.inert=previousInert[index]);
   rail.removeAttribute("role");rail.removeAttribute("aria-modal");
   if(trigger?.isConnected)trigger.focus({preventScroll:true});
  };
 },[open,close]);
}
