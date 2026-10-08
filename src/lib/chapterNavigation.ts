import { flushSync } from "react-dom";
import { loadCompanionRoute } from "./chapterRouteLoader";

export const CHAPTER_CHANGE_EVENT = "kittel:chapter-change";
export const sectionScrollBehavior = ():ScrollBehavior => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

export function chapterHref(chapter: number) {
  const url = new URL(window.location.href);
  if (chapter === 3) url.searchParams.delete("chapter");
  else url.searchParams.set("chapter", String(chapter));
  url.hash = "";
  return `${url.pathname}${url.search}`;
}

export function readChapter() {
  const value = Number(new URLSearchParams(window.location.search).get("chapter") || 3);
  return Number.isInteger(value) && value >= 1 && value <= 22 ? value : 3;
}

type ChapterTransition={finished:Promise<void>;ready?:Promise<void>;updateCallbackDone?:Promise<void>;skipTransition:()=>void};
let pendingChapter=0;
let activeTransition:ChapterTransition|undefined;
export function cancelChapterNavigation(){pendingChapter++;activeTransition?.skipTransition();}
export async function navigateToChapter(chapter: number) {
  if (!Number.isInteger(chapter)||chapter<1||chapter>22)return;
  const request=++pendingChapter;
  activeTransition?.skipTransition();
  if(chapter===readChapter())return;
  if(chapter!==3)await loadCompanionRoute();
  if(request!==pendingChapter)return;
  activeTransition?.skipTransition();
  document.documentElement.dataset.chapterDirection=chapter>readChapter()?"forward":"backward";
  const commit = () => {
    if(request!==pendingChapter)return;
    window.history.pushState({ chapter }, "", chapterHref(chapter));
    flushSync(()=>window.dispatchEvent(new CustomEvent<number>(CHAPTER_CHANGE_EVENT, { detail: chapter })));
  };
  const transitionDocument = document as Document & { startViewTransition?: (update: () => void|Promise<void>) => ChapterTransition };
  if (transitionDocument.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    activeTransition=transitionDocument.startViewTransition(async()=>{
      commit();
      // Synchronize incoming glass geometry before its transition snapshot.
      await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
    });
    void activeTransition.ready?.catch(()=>{});
    void activeTransition.updateCallbackDone?.catch(()=>{});
    void activeTransition.finished.catch(()=>{});
  } else {
    commit();
    if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      document.querySelector("main")?.animate([{opacity:.5},{opacity:1}],{duration:180,easing:"ease-out"});
  }
}
