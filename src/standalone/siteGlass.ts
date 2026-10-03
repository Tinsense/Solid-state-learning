import { startGlassSystem } from "../lib/glassEngine";
import { startLatticeWallpaper } from "../lib/latticeWallpaper";

const selectors=".site-header,.liquid-panel,.project-card,.tool-strip a,.card,.phase-panel,.reported-strip,.stats > div,.note-grid article,.header-wrapper,.home-post-item,.post-content-container,.post-content,.page-content,.archive-list,.category-list,.tag-list,.page-main-content-middle .main-content,.liquid-button,.top-action,.tip";
const start=()=>{
  if(document.querySelector("[data-wallpaper-version]"))return;
  const root=document.documentElement;
  const legacy=!root.dataset.theme;
  const theme=()=>{if(legacy)root.dataset.theme=document.body.classList.contains("dark-mode")?"dark":"light";};
  theme();
  const style=document.createElement("link");style.rel="stylesheet";style.href="/css/site-glass.css";style.dataset.siteGlassStyle="";document.head.append(style);
  const canvas=document.createElement("canvas");canvas.id="site-lattice-background";canvas.className="lattice-atmosphere";canvas.setAttribute("aria-hidden","true");document.body.prepend(canvas);
  startLatticeWallpaper(canvas);startGlassSystem(selectors);
  const optics=document.querySelector<HTMLCanvasElement>(".studio-glass-shared-canvas");if(optics)optics.id="site-glass-optics";
  if(legacy)new MutationObserver(theme).observe(document.body,{attributes:true,attributeFilter:["class"]});
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
