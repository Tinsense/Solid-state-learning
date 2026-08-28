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

test("任务栏使用 Studio WebGL2 玻璃且分段控件没有横向滑轨", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-glass-engine", "webgl2-studio");
  const scene = page.getByTestId("crystal-atmosphere");
  await expect(scene).toHaveAttribute("data-scene-engine", "webgl2-shared-scene");
  const header = page.locator(".site-header");
  await expect(header).toHaveAttribute("data-liquid-glass", "webgl2-studio");
  await expect(header).toHaveAttribute("data-scene-source", "shared-crystal-field");
  const canvas = header.locator(":scope > .studio-glass-canvas");
  await expect(canvas).toBeVisible();
  expect(await canvas.evaluate((element: HTMLCanvasElement) => element.width * element.height)).toBeGreaterThan(1);

  const primary = page.getByRole("button", { name: /开始学习/ });
  await expect(primary).toHaveAttribute("data-liquid-glass", "webgl2-studio");
  await expect(primary).toHaveAttribute("data-scene-source", "shared-crystal-field");

  const segmented = page.locator(".segmented").first();
  await segmented.scrollIntoViewIfNeeded();
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
