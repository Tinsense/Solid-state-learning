import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
const root = process.env.SITE_REPO || path.resolve("../Tinsense.github.io");
const baseURL = process.env.SITE_URL || "http://127.0.0.1:8000/";
const walk = dir => fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry => {
 if(entry.name.startsWith(".")||entry.name==="node_modules")return [];
 const full=path.join(dir,entry.name);
 return entry.isDirectory()?walk(full):entry.name.endsWith(".html")?[full]:[];
});
const files=walk(root);
const browser=await chromium.launch({...(process.env.CHROME_PATH ? {executablePath:process.env.CHROME_PATH} : {}),headless:true});
const results=[];
for(const viewport of [{width:390,height:844},{width:1440,height:900}]){
 const page=await browser.newPage({viewport});
 for(const file of files){
  const relative=path.relative(root,file).replaceAll("\\","/");
  const errors=[];const handler=error=>errors.push(error.message);page.on("pageerror",handler);
  const response=await page.goto(new URL(relative,baseURL).href,{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>document.querySelector("#site-glass-optics"),{timeout:15000});
  for(const theme of ["light","dark"]){
   await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;document.documentElement.classList.toggle("dark-mode",theme==="dark");},theme);
   await page.waitForTimeout(120);
   const data=await page.evaluate(()=>{
    const canvas=document.querySelector("#site-glass-optics"),gl=canvas.getContext("webgl2");
    return {overflow:document.documentElement.scrollWidth-innerWidth,canvasCount:document.querySelectorAll("#site-glass-optics").length,glError:gl?.getError(),program:!!gl?.getParameter(gl.CURRENT_PROGRAM)};
   });
   results.push({page:relative,width:viewport.width,theme,status:response.status(),errors:[...errors],...data});
  }
  page.off("pageerror",handler);
 }
 await page.close();
}
await browser.close();
fs.mkdirSync("tmp",{recursive:true});
fs.writeFileSync("tmp/independent-sites-audit.json",JSON.stringify(results,null,2));
const failed=results.filter(item=>item.overflow>1||item.errors.length||item.status!==200||item.canvasCount!==1||item.glError!==0||!item.program);
console.log(JSON.stringify({pages:files.length,checks:results.length,failed},null,2));
if(failed.length)process.exitCode=1;
