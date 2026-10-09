import {chromium} from "@playwright/test";
import fs from "node:fs";
import {createHash} from "node:crypto";
const course=process.env.COURSE_URL||"http://127.0.0.1:5173/Solid-state-learning/";
const portal=process.env.PORTAL_URL||"http://127.0.0.1:8000/";
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||"C:/Program Files/Google/Chrome/Application/chrome.exe"});
fs.mkdirSync("tmp",{recursive:true});const result=[];
try{
 for(const width of [390,1440]){
  const page=await browser.newPage({viewport:{width,height:900}});
  for(const [name,url] of [["course",course],["portal",portal],["tool",portal+"metal-bde/"],["map",portal+"metal-bde-square/"]]){
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto(url,{waitUntil:"networkidle"});
   await page.waitForFunction(()=>document.querySelector(".studio-glass-shared-canvas")?.dataset.opticsVersion);
   for(const theme of ["light","dark"]){
    await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);await page.waitForTimeout(400);
    const material=await page.locator('main [data-glass-layer="surface"]:not(.liquid-button,.top-action,.header-link,.tool-strip a)').first().evaluate(el=>{
     const style=getComputedStyle(el),canvas=document.querySelector(".studio-glass-shared-canvas"),gl=canvas.getContext("webgl2"),program=gl.getParameter(gl.CURRENT_PROGRAM);
     return {blur:style.backdropFilter.replace(/url\([^)]*\)/g,"url(lens)"),source:el.dataset.refractionSource,presentation:canvas.dataset.presentation,fill:style.backgroundColor,radius:style.borderRadius,shader:gl.getAttachedShaders(program).map(shader=>gl.getShaderSource(shader)).join("\n"),version:canvas.dataset.opticsVersion,wallpaper:document.querySelector(".lattice-atmosphere").dataset.wallpaperVersion,overflow:document.documentElement.scrollWidth-innerWidth};
    });
    material.shader=createHash("sha256").update(material.shader).digest("hex");
    result.push({name,width,theme,...material,errors});
    await page.screenshot({path:`tmp/material-${name}-${width}-${theme}.png`});
    if(name==="course"){
     await page.getByRole("button",{name:/切换章节，当前/}).click();await page.waitForTimeout(250);
     await page.screenshot({path:`tmp/menu-${width}-${theme}.png`});
     await page.getByRole("button",{name:"关闭章节切换菜单"}).click();
    }
   }
  }
  await page.close();
 }
 const failures=result.filter(item=>item.errors.length||item.overflow>1||item.version!=="crystal-glass-14"||item.source!=="dom-backdrop"||item.presentation!=="native-backdrop"||item.wallpaper!=="orbital-point-cloud-12"||["blur","fill","radius","shader"].some(key=>item[key]!==result.find(other=>other.name==="course"&&other.width===item.width&&other.theme===item.theme)[key]));
 fs.writeFileSync("tmp/material-parity.json",JSON.stringify(result,null,2));console.log(JSON.stringify({checks:result.length,failures},null,2));if(failures.length)process.exitCode=1;
}finally{await browser.close();}
