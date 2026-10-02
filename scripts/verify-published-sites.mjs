import { chromium } from "@playwright/test";
import fs from "node:fs";
const main = process.env.COURSE_URL || "https://tinsense.github.io/Solid-state-learning/";
const portal = process.env.PORTAL_URL || "https://tinsense.github.io/";
const proxyURL = process.env.HTTPS_PROXY ? new URL(process.env.HTTPS_PROXY) : undefined;
const proxy = proxyURL ? {server:proxyURL.origin,username:decodeURIComponent(proxyURL.username),password:decodeURIComponent(proxyURL.password)} : undefined;
const browser = await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),...(proxy?{proxy}:{})});
const page = await browser.newPage({viewport:{width:390,height:844}});
const results=[];
fs.mkdirSync("tmp",{recursive:true});
try {
 for(const chapter of [1,3,6,14,22]){
  const errors=[];const handler=error=>errors.push(error.message);page.on("pageerror",handler);
  const response=await page.goto(main+"?chapter="+chapter,{waitUntil:"domcontentloaded"});
  await page.locator(".hero-module").waitFor({state:"visible"});
  await page.waitForFunction(()=>{const gl=document.querySelector(".studio-glass-shared-canvas")?.getContext("webgl2");return !!gl?.getParameter(gl.CURRENT_PROGRAM);});
  const count=await page.getByLabel("选择全部章节").first().locator("option").count();
  const data=await page.evaluate(()=>{
   const gl=document.querySelector(".studio-glass-shared-canvas")?.getContext("webgl2");
   return {overflow:document.documentElement.scrollWidth-innerWidth,program:!!gl?.getParameter(gl.CURRENT_PROGRAM),glError:gl?.getError(),formulaFallbacks:document.querySelectorAll(".formula code").length};
  });
  await page.getByRole("button",{name:"展开公式索引"}).click();
  const image=page.locator(".atlas-card img").first();await image.waitFor({state:"visible"});
  await page.waitForFunction(()=>document.querySelector(".atlas-card img")?.naturalWidth>0);
  const atlas=await page.locator(".atlas-card").count();
  const zoom=page.locator(".atlas-zoom").first();await zoom.click();
  const zoomWorks=await zoom.getAttribute("aria-expanded")==="true";
  const nestedSurfaces=await page.locator('[data-glass-layer="surface"]').evaluateAll(elements=>elements.filter(element=>element.parentElement?.closest('[data-glass-layer="surface"]')).length);
  await page.getByRole("button",{name:"章节目录",exact:true}).click();
  const drawer=page.getByRole("dialog");await drawer.waitFor({state:"visible"});
  const drawerWorks=await page.locator("main").evaluate(element=>element.inert)&&await drawer.locator("optgroup").count()===4;
  if(chapter===6){
   for(const theme of ["light","dark"]){
    await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
    await page.waitForTimeout(350);
    await page.screenshot({path:`tmp/live-mobile-directory-${theme}.png`});
   }
  }
  await page.getByRole("button",{name:"关闭章节目录"}).click();
  await page.locator(".atlas-card").first().scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>document.querySelector(".studio-glass-shared-canvas")?.style.visibility!=="hidden");
  const scrollAligned=await page.evaluate(()=>{
   const canvas=document.querySelector(".studio-glass-shared-canvas"),rect=canvas.getBoundingClientRect();
   const gl=canvas.getContext("webgl2"),program=gl.getParameter(gl.CURRENT_PROGRAM);
   const shader=gl.getUniform(program,gl.getUniformLocation(program,"u_rects[0]"));
   const header=document.querySelector(".site-header").getBoundingClientRect();
   return rect.left===0&&rect.top===0&&[header.left,header.top,header.width,header.height].every((value,i)=>Math.abs(shader[i]-value)<.2);
  });
  results.push({kind:"course",chapter,status:response.status(),chapters:count,atlas,zoomWorks,drawerWorks,nestedSurfaces,scrollAligned,errors,...data});
  page.off("pageerror",handler);
  if(chapter===14)await page.screenshot({path:"tmp/live-mobile-equation-atlas.png"});
 }
 const manifest=await page.request.get(main+"formulas/index.json");
 const formulas=await manifest.json();
 if(formulas.length!==1026)throw new Error("Published formula manifest is stale: "+formulas.length);
 for(const route of ["","metal-bde/","metal-bde-square/","metal-formation-energy/","about/"]){
  const errors=[];const handler=error=>errors.push(error.message);page.on("pageerror",handler);
  const response=await page.goto(new URL(route,portal).href,{waitUntil:"domcontentloaded"});
  await page.locator("#site-glass-optics").waitFor({state:"attached"});
  await page.waitForFunction(()=>{const gl=document.querySelector("#site-glass-optics")?.getContext("webgl2");return !!gl?.getParameter(gl.CURRENT_PROGRAM);});
  const data=await page.evaluate(()=>{
   const gl=document.querySelector("#site-glass-optics").getContext("webgl2");
   return {overflow:document.documentElement.scrollWidth-innerWidth,program:!!gl?.getParameter(gl.CURRENT_PROGRAM),glError:gl?.getError()};
  });
  results.push({kind:"portal",route,status:response.status(),errors,...data});
  page.off("pageerror",handler);
  if(!route)await page.screenshot({path:"tmp/live-mobile-portal.png"});
 }
 fs.writeFileSync("tmp/published-sites-audit.json",JSON.stringify(results,null,2));
 const failed=results.filter(item=>item.status!==200||item.overflow>1||!item.program||item.glError!==0||item.errors.length||item.formulaFallbacks||item.kind==="course"&&(item.chapters!==22||!item.zoomWorks||!item.drawerWorks||item.nestedSurfaces||!item.scrollAligned));
 console.log(JSON.stringify({formulaCount:formulas.length,checks:results.length,failed},null,2));
 if(failed.length)process.exitCode=1;
}finally{await browser.close();}
