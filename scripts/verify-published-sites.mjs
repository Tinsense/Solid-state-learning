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
  results.push({kind:"course",chapter,status:response.status(),chapters:count,atlas,errors,...data});
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
 const failed=results.filter(item=>item.status!==200||item.overflow>1||!item.program||item.glError!==0||item.errors.length||item.formulaFallbacks||item.kind==="course"&&item.chapters!==22);
 console.log(JSON.stringify({formulaCount:formulas.length,checks:results.length,failed},null,2));
 if(failed.length)process.exitCode=1;
}finally{await browser.close();}
