import {test,expect} from "@playwright/test";

test("玻璃章节菜单支持键盘、同页切章，侧栏只含本章目录",async({page})=>{
 await page.goto("/?chapter=3");
 const trigger=page.getByRole("button",{name:/切换章节，当前/});
 await trigger.click();
 const menu=page.getByRole("dialog",{name:"选择学习章节"});
 await expect(menu).toBeVisible();
 await expect(menu.locator("a")).toHaveCount(22);
 await expect(menu.locator('[aria-current="page"]')).toBeFocused();
 await expect(menu).toHaveAttribute("data-glass-layer","surface");
 expect(await menu.evaluate(el=>getComputedStyle(el).backdropFilter)).toContain("blur(");
 const bounds=await menu.boundingBox();
 expect(bounds!.x).toBeGreaterThanOrEqual(10);
 expect(bounds!.x+bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width-10);
 await page.keyboard.press("End");
 await expect(menu.getByRole("link",{name:/22.*合金/})).toBeFocused();
 await page.keyboard.press("Escape");
 await expect(trigger).toBeFocused();
 expect(await page.locator("main").evaluate(el=>el.inert)).toBe(false);
 await expect(page.locator("#chapter-rail .chapter-picker,#chapter-rail select")).toHaveCount(0);
 await trigger.click();
 await menu.getByRole("link",{name:/06.*自由电子气/}).click();
 await expect(page).toHaveURL(/chapter=6/);
 await expect(page.getByTestId("chapter-hero-6")).toBeVisible();
});

test("壁纸真实变化，减少动态效果时冻结",async({page})=>{
 await page.goto("/");
 const canvas=page.locator("canvas.lattice-atmosphere");
 await expect(canvas).toHaveAttribute("data-wallpaper-version","rotating-lattice-5");
 const sample=()=>canvas.evaluate(el=>{
  const canvas=el as HTMLCanvasElement;
  const data=canvas.getContext("2d")!.getImageData(0,0,canvas.width,canvas.height).data;
  let sum=0;for(let i=0;i<data.length;i+=116)sum=(sum*31+data[i])>>>0;return sum;
 });
 const a=await sample();await page.waitForTimeout(180);expect(await sample()).not.toBe(a);
 await page.emulateMedia({reducedMotion:"reduce"});await page.waitForTimeout(150);
 const b=await sample();await page.waitForTimeout(180);expect(await sample()).toBe(b);
});
