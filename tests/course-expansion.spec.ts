import { test, expect } from "@playwright/test";
import { physicsModels } from "../src/content/physicsModels";
import katex from "katex";
import { companionChapters } from "../src/content/companionChapters";
import { derivations, exercises } from "../src/content/chapter3";
import { chapterEnhancements } from "../src/content/chapterEnhancements";

test("全部课程推导、实验与解答的数学源码可排版", () => {
 const formulas:string[]=[];
 for(const chapter of Object.values(companionChapters)){
  for(const unit of chapter.units){
   if(unit.formula)formulas.push(unit.formula.latex);
   for(const derivation of unit.derivations??[])formulas.push(derivation.result,...derivation.steps.map(step=>step.latex));
  }
  for(const exercise of chapter.exercises)if(exercise.solutionLatex)formulas.push(exercise.solutionLatex);
 }
 for(const derivation of Object.values(derivations))formulas.push(derivation.result,...derivation.steps.map(step=>step.latex));
 for(const exercise of exercises)if(exercise.solutionLatex)formulas.push(exercise.solutionLatex);
 for(const depth of Object.values(chapterEnhancements)){
  for(const step of depth.reasoning)if(step.latex)formulas.push(step.latex);
  if(depth.example.latex)formulas.push(depth.example.latex);
 }
 for(const models of Object.values(physicsModels))formulas.push(...models.map(model=>model.equation));
 for(const formula of formulas)expect(()=>katex.renderToString(formula,{throwOnError:true,trust:false,strict:"ignore"}),formula).not.toThrow();
});

test("新实验参数边界保持有限，关键极限正确", () => {
 for(const models of Object.values(physicsModels))for(const model of models){
  for(const mode of ["min","max","initial"] as const){
   const p=model.controls.map(item=>item[mode]);
   for(let i=0;i<=50;i++)for(const series of model.series){
    const x=model.domain[0]+(model.domain[1]-model.domain[0])*i/50;
    expect(Number.isFinite(series.evaluate(x,p))).toBe(true);
   }
  }
 }
 expect(physicsModels[7][0].series[0].evaluate(0,[0])-physicsModels[7][0].series[1].evaluate(0,[0])).toBe(0);
 expect(physicsModels[7][0].series[0].evaluate(0,[.2])-physicsModels[7][0].series[1].evaluate(0,[.2])).toBeCloseTo(.4);
 expect(physicsModels[10][0].series[0].evaluate(60,[60])).toBeCloseTo(1/Math.E);
 expect(physicsModels[12][0].series[0].evaluate(1.1,[])).toBe(0);
 expect(physicsModels[12][1].series[0].evaluate(0,[.5])).toBe(0);
 expect(physicsModels[14][0].series[0].evaluate(1,[0])).toBe(0);
 expect(physicsModels[16][1].series[0].evaluate(0,[])).toBe(1);
 expect(physicsModels[17][0].series[0].evaluate(0,[300,1])).toBe(0);
 expect(physicsModels[22][1].series[0].evaluate(1.2,[])).toBe(0);
});

for(let chapter=7;chapter<=22;chapter++)test("第 "+chapter+" 章课程、公式和交互可用",async({page})=>{
 const errors:string[]=[];page.on("pageerror",error=>errors.push(error.message));
 await page.goto("/?chapter="+chapter);
 await expect(page.getByTestId("chapter-hero-"+chapter)).toBeVisible();
 await expect(page.locator(".advanced-lab")).toHaveCount(2);
 await expect(page.locator(".formula code")).toHaveCount(0);
 await expect(page.locator(".derivation")).not.toHaveCount(0);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
 const lab=page.getByTestId("advanced-lab-"+chapter+"-0");
 const input=lab.locator("input[type=range]").first();
 await input.evaluate((element:HTMLInputElement)=>{
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(element,element.max);
  element.dispatchEvent(new Event("input",{bubbles:true}));
 });
 await expect(lab.locator("output")).toBeAttached();
 await page.getByRole("button",{name:"展开公式索引"}).click();
 const images=page.locator(".atlas-card img");
 await expect(images.first()).toBeVisible();
 await expect(images.first()).toHaveJSProperty("naturalWidth",await images.first().getAttribute("width").then(Number));
 expect(errors).toEqual([]);
});

for(let chapter=1;chapter<=6;chapter++)test("第 "+chapter+" 章公式索引在两种主题均可读取",async({page})=>{
  await page.goto("/?chapter="+chapter);
  const toggle=page.getByRole("button",{name:"展开公式索引"});
  await toggle.click();
  const image=page.locator(".atlas-card img").first();
  await expect(image).toBeVisible();
  await expect.poll(()=>image.evaluate((element:HTMLImageElement)=>element.naturalWidth)).toBeGreaterThan(0);
  const zoom=page.locator(".atlas-card").first().getByRole("button",{name:/放大查看式/});
  await zoom.click();
  await expect(zoom).toHaveAttribute("aria-expanded","true");
  expect(await page.locator(".atlas-image").first().evaluate(element=>getComputedStyle(element).overflowX)).toBe("auto");
  await zoom.click();
  await expect(zoom).toHaveAttribute("aria-expanded","false");
  for(const theme of ["light","dark"]){
   await page.evaluate(theme=>{document.documentElement.dataset.theme=theme;},theme);
   expect(await image.evaluate(element=>getComputedStyle(element).filter)).toBe(theme==="dark"?"invert(1)":"none");
   await expect(page.locator(".formula code")).toHaveCount(0);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(1);
  }
});

test("章节选择使用同页路由，手机目录不压暗正文",async({page},info)=>{
 await page.goto("/?chapter=7");
 await page.evaluate(()=>{(window as unknown as {sentinel:number}).sentinel=723;});
 await page.getByRole("button",{name:/切换章节，当前/}).click();
 await page.getByRole("dialog").getByRole("link",{name:/22.*合金/}).click();
 await expect(page.getByTestId("chapter-hero-22")).toBeVisible();
 expect(await page.evaluate(()=>(window as unknown as {sentinel:number}).sentinel)).toBe(723);
 if(info.project.name==="mobile"){
  await page.getByRole("button",{name:"章节目录"}).click();
  expect(await page.locator(".rail-scrim").evaluate(el=>getComputedStyle(el).backgroundColor)).toBe("rgba(0, 0, 0, 0)");
 }
});
