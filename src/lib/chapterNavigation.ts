export const CHAPTER_CHANGE_EVENT = "kittel:chapter-change";

export function chapterHref(chapter: number) {
  const url = new URL(window.location.href);
  if (chapter === 3) url.searchParams.delete("chapter");
  else url.searchParams.set("chapter", String(chapter));
  url.hash = "";
  return `${url.pathname}${url.search}`;
}

export function readChapter() {
  const value = Number(new URLSearchParams(window.location.search).get("chapter") || 3);
  return [1, 2, 3, 4, 5].includes(value) ? value : 3;
}

export function navigateToChapter(chapter: number) {
  if (chapter === readChapter()) return;
  const commit = () => {
    window.history.pushState({ chapter }, "", chapterHref(chapter));
    window.dispatchEvent(new CustomEvent<number>(CHAPTER_CHANGE_EVENT, { detail: chapter }));
  };
  const transitionDocument = document as Document & { startViewTransition?: (update: () => void) => unknown };
  if (transitionDocument.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    transitionDocument.startViewTransition(commit);
  } else commit();
}
