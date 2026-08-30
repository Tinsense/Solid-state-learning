import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  page.on("pageerror", (error) => console.log("PAGE ERROR", error.message));
});

test("首页、目录和公式推导可用", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /从一条势能曲线/ })).toBeVisible();

  if (await page.getByRole("button", { name: "章节目录" }).isVisible()) {
    await page.getByRole("button", { name: "章节目录" }).click();
  }
  await page.locator(".chapter-rail nav button").filter({ hasText: "惰性气体晶体" }).click();
  await expect(page.locator("#inert-gas")).toBeInViewport();

  const firstDerivation = page.locator("#derivation-london");
  await firstDerivation.getByRole("button", { name: /逐步展开推导/ }).click();
  await expect(firstDerivation.getByText("Step 1 / 5")).toBeVisible();
  await firstDerivation.getByRole("button", { name: /下一步/ }).click();
  await expect(firstDerivation.getByText("展开两原子的库仑能")).toBeVisible();
  expect(errors).toEqual([]);
});

test("Lennard-Jones 与 Madelung slider 实时更新", async ({ page }) => {
  await page.goto("/");
  const lj = page.getByTestId("lj-slider");
  await lj.scrollIntoViewIfNeeded();
  await lj.evaluate((element: HTMLInputElement) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(element, "1.5"); element.dispatchEvent(new Event("input", { bubbles: true })); });
  await expect(page.getByTestId("lj-value")).toHaveText("1.500");

  const madelung = page.getByTestId("madelung-slider");
  await madelung.scrollIntoViewIfNeeded();
  const before = await page.getByTestId("madelung-value").textContent();
  await madelung.evaluate((element: HTMLInputElement) => { Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(element, "30"); element.dispatchEvent(new Event("input", { bubbles: true })); });
  await expect(page.getByTestId("madelung-value")).not.toHaveText(before || "");
});

test("弹性波方向、模式和概念题可以操作", async ({ page }) => {
  await page.goto("/");
  const explorer = page.getByTestId("wave-explorer");
  await explorer.scrollIntoViewIfNeeded();
  await explorer.getByRole("button", { name: "[111]" }).click();
  await explorer.getByRole("button", { name: "T₁" }).click();
  await expect(explorer.getByText("u ∥ [1 −1 0]", { exact: false })).toBeVisible();
  await explorer.getByRole("button", { name: "播放" }).click();
  await expect(explorer.getByRole("button", { name: "暂停" })).toBeVisible();

  const check = page.locator("#check-wave-polarization");
  await check.scrollIntoViewIfNeeded();
  await check.locator(".choice-grid button").filter({ hasText: "[1 −1 0]" }).click();
  await expect(check.getByText("判断正确")).toBeVisible();
});

test("页面在当前视口没有整体横向滚动", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (overflow > 1) {
    const offenders = await page.evaluate(() => [...document.querySelectorAll<HTMLElement>("body *")].map((element) => ({ tag: element.tagName, cls: element.className?.toString().slice(0, 80), parent: element.parentElement?.className?.toString().slice(0,80), grand: element.parentElement?.parentElement?.className?.toString().slice(0,80), right: Math.round(element.getBoundingClientRect().right), width: Math.round(element.getBoundingClientRect().width) })).filter((item) => item.right > document.documentElement.clientWidth + 1).sort((a,b)=>b.right-a.right).slice(0,15));
    console.log("Horizontal overflow offenders", offenders);
  }
  expect(overflow).toBeLessThanOrEqual(1);
});

test("晶格场、正文模块与任务栏使用共享 Studio WebGL2 玻璃", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-glass-engine", "shared-webgl2");
  const scene = page.getByTestId("lattice-atmosphere");
  await expect(scene).toBeVisible();
  const header = page.locator(".site-header");
  await expect(header).toHaveAttribute("data-liquid-glass", "shared-webgl2");
  const canvas = page.locator(".studio-glass-shared-canvas");
  await expect(canvas).toBeVisible();
  expect(await canvas.evaluate((element: HTMLCanvasElement) => element.width * element.height)).toBeGreaterThan(1);

  const primary = page.getByRole("button", { name: /开始学习/ });
  await expect(primary).toHaveAttribute("data-liquid-glass", "shared-webgl2");

  const segmented = page.locator(".segmented").first();
  await segmented.scrollIntoViewIfNeeded();
  const figure = segmented.locator("xpath=ancestor::figure");
  await expect(figure).toHaveAttribute("data-liquid-glass", "shared-webgl2");
  expect(await figure.evaluate((element) => getComputedStyle(element).backdropFilter)).toContain("blur(");
  const metrics = await segmented.evaluate((element) => ({
    overflowX: getComputedStyle(element).overflowX,
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth
  }));
  expect(metrics.overflowX).not.toMatch(/auto|scroll/);
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);

  if (testInfo.project.name === "mobile") {
    const menu = page.getByRole("button", { name: "章节目录" });
    await expect(menu).toBeVisible();
    const position = await menu.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { top: rect.top, bottomGap: window.innerHeight - rect.bottom, viewport: window.innerHeight };
    });
    expect(position.top).toBeGreaterThan(position.viewport * .65);
    expect(position.bottomGap).toBeGreaterThanOrEqual(8);
    await expect(page.getByRole("heading", { name: /从一条势能曲线/ })).toBeVisible();
  }
});

for (const chapter of [1, 2, 4, 5]) {
  test(`第 ${chapter} 章可进入、推导可展开且无横向溢出`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(`/?chapter=${chapter}`);
    await expect(page.locator(".companion-hero h1")).toBeVisible();
    await expect(page.locator(".chapter-switcher a.is-current").first()).toContainText(String(chapter).padStart(2, "0"));
    const derivation = page.locator(".derivation").first();
    await derivation.getByRole("button", { name: /逐步展开推导/ }).click();
    await expect(derivation.locator(".derivation-step")).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    expect(errors).toEqual([]);
  });
}

test("页面四边与根背景连续，没有默认白边", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("kittel-theme", "light"));
  await page.goto("/?chapter=1");
  const root = await page.evaluate(() => ({
    htmlMargin: getComputedStyle(document.documentElement).margin,
    bodyMargin: getComputedStyle(document.body).margin,
    rootWidth: document.getElementById("root")!.getBoundingClientRect().width,
    viewport: window.innerWidth,
    lattice: (() => { const r = document.querySelector(".lattice-atmosphere")!.getBoundingClientRect(); return { left: r.left, top: r.top, right: r.right, bottom: r.bottom }; })()
  }));
  expect(root.htmlMargin).toBe("0px");
  expect(root.bodyMargin).toBe("0px");
  expect(Math.abs(root.rootWidth - root.viewport)).toBeLessThanOrEqual(1);
  expect(root.lattice.left).toBeLessThanOrEqual(-1);
  expect(root.lattice.top).toBeLessThanOrEqual(-1);
  expect(root.lattice.right).toBeGreaterThanOrEqual(root.viewport + 1);
});

test("科学互动模型通过解析值与极限检查", async ({ page }) => {
  await page.goto("/?chapter=1");
  const miller = page.locator(".companion-lab").filter({ hasText: "Miller 晶面构造器" });
  await expect(miller).toContainText("d=2.828 Å");
  await expect(miller).toContainText("z 截距∞");
  expect((await miller.locator(".miller-cube polygon").getAttribute("points"))?.split(" ").length).toBeGreaterThanOrEqual(4);

  await page.goto("/?chapter=2");
  const ewald = page.locator(".companion-lab").filter({ hasText: "倒空间衍射几何" });
  const geometry = await ewald.evaluate((element) => {
    const circle = element.querySelector<SVGCircleElement>("[data-testid=ewald-circle]")!;
    const origin = element.querySelector<SVGGElement>("[data-h='0'][data-k='0'] circle")!;
    const cx=Number(circle.getAttribute("cx")),cy=Number(circle.getAttribute("cy")),r=Number(circle.getAttribute("r"));
    const ox=Number(origin.getAttribute("cx")),oy=Number(origin.getAttribute("cy"));
    return Math.abs(Math.hypot(ox-cx,oy-cy)-r);
  });
  expect(geometry).toBeLessThan(1e-8);
  const factor = page.locator(".companion-lab").filter({ hasText: "结构因子与系统消光" });
  await expect(factor).toContainText("|S/f|=2.000");
  await factor.locator("input[type=range]").nth(2).evaluate((element:HTMLInputElement)=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value")!.set!.call(element,"1");element.dispatchEvent(new Event("input",{bubbles:true}))});
  await expect(factor).toContainText("|S/f|=0.000");

  await page.goto("/?chapter=5");
  const planck = page.locator(".companion-lab").filter({ hasText: "单一声子模的热占据" });
  await expect(planck).toContainText("平均占据 n̄0.08943");
  const heat = page.locator("#debye .companion-lab").filter({ hasText: "Debye 与 Einstein 热容" });
  await expect(heat).toContainText("Debye 数值积分0.368635");
});
