import {chromium} from "@playwright/test";
import fs from "node:fs";
const base=process.env.COURSE_URL||"http://127.0.0.1:4173/Solid-state-learning/";
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||"C:/Program Files/Google/Chrome/Application/chrome.exe"});
const results=[];
fs.mkdirSync("tmp",{recursive:true});
try {
 for(const width of [320,390,1440])for(const theme of ["light","dark"])for(const driver of width===390?["wheel","touch"]:["wheel"]){
  const page=await browser.newPage({viewport:{width,height:844},hasTouch:driver==="touch",isMobile:driver==="touch"});
  const touch=driver==="touch"?await page.context().newCDPSession(page):null;
  await page.goto(base,{waitUntil:"networkidle"});
  await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);
  await page.waitForTimeout(150);
  await page.evaluate(()=>{
   window.opticsFrames=[];window.opticsRecording=true;
   const sample=()=>{
    if(!window.opticsRecording)return;
    const canvas=document.querySelector(".studio-glass-shared-canvas"),gl=canvas.getContext("webgl2"),program=gl.getParameter(gl.CURRENT_PROGRAM);
    const count=gl.getUniform(program,gl.getUniformLocation(program,"u_count"));
    const rects=Array.from({length:count},(_,i)=>Array.from(gl.getUniform(program,gl.getUniformLocation(program,`u_rects[${i}]`))));
    const panels=[...document.querySelectorAll('[data-glass-layer="surface"]')].filter(el=>!["fixed","sticky"].includes(getComputedStyle(el).position)).map(el=>({el,r:el.getBoundingClientRect()})).filter(({r})=>r.width>3&&r.height>3&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth);
    const errors=panels.map(({el,r})=>{const local=el.querySelector(':scope > .studio-glass-optics')?.getBoundingClientRect();return local?Math.max(Math.abs(r.left-local.left),Math.abs(r.top-local.top),Math.abs(r.width-local.width)):Infinity;});
    window.opticsFrames.push({y:scrollY,globalOverlay:getComputedStyle(canvas).visibility==="visible",error:Math.max(0,...errors),missing:panels.filter(({el})=>!el.querySelector(':scope > .studio-glass-optics')).map(({el})=>el.className)});
    requestAnimationFrame(sample);
   };requestAnimationFrame(sample);
  });
  for(const delta of [180,240,320,-160,-220]){
   if(touch){
    const startY=delta>0?650:250;
    await touch.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:15,y:startY}]});
    for(let step=1;step<=12;step++){
     await touch.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x:15,y:startY-delta*step/12}]});
     await page.waitForTimeout(16);
    }
    await touch.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
   }
   else await page.mouse.wheel(0,delta);
   await page.waitForTimeout(90);
  }
  await page.screenshot({path:`tmp/scroll-${width}-${theme}-${driver}.png`});
  const frames=await page.evaluate(()=>{window.opticsRecording=false;return window.opticsFrames;});
  const result={width,theme,driver,frames:frames.length,positions:new Set(frames.map(x=>x.y)).size,globalOverlay:frames.filter(x=>x.globalOverlay).length,maxError:Math.max(...frames.map(x=>x.error)),missing:[...new Set(frames.flatMap(x=>x.missing))]};
  results.push(result);await page.close();
 }
 fs.writeFileSync("tmp/scroll-optics.json",JSON.stringify(results,null,2));
 const failed=results.filter(item=>item.globalOverlay||item.maxError>.5||item.positions<4);
 console.log(JSON.stringify({checks:results.length,failed,results},null,2));if(failed.length)process.exitCode=1;
} finally {await browser.close();}
