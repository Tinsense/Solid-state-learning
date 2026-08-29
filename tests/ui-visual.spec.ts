import { test, expect } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`${theme} desktop glass visual`, async ({ page }) => {
    await page.addInitScript((value) => localStorage.setItem("kittel-theme", value), theme);
    await page.setViewportSize({ width: 1404, height: 744 });
    await page.goto("/");
    await page.waitForTimeout(800);
    await page.evaluate(() => scrollTo(0, 360));
    await page.waitForTimeout(400);
    const primary = page.locator(".hero-actions .primary");
    await expect(primary.locator("svg")).toBeVisible();
    console.log(theme, await primary.evaluate((node) => ({
      background: getComputedStyle(node).backgroundColor,
      backdrop: getComputedStyle(node).backdropFilter,
      canvasOpacity: getComputedStyle(node.querySelector("canvas") as Element).opacity
    })));
    const surfaces = await page.locator(".studio-glass-canvas").evaluateAll((canvases) => canvases.map((node) => {
      const canvas = node as HTMLCanvasElement;
      return { width: canvas.width, height: canvas.height, lost: canvas.getContext("webgl2")?.isContextLost() ?? true };
    }));
    expect(surfaces.filter((surface) => surface.lost)).toHaveLength(0);
    await page.screenshot({ path: `tmp/visuals/${theme}-desktop-before.png`, fullPage: false });
    await page.getByTestId("lattice-atmosphere").evaluate((node) => {
      const source = node as HTMLCanvasElement;
      const snapshot = document.createElement("img");
      snapshot.src = source.toDataURL("image/png");
      snapshot.style.cssText = "position:fixed;inset:0;width:100vw;height:100vh;z-index:99999";
      document.body.append(snapshot);
    });
    await page.screenshot({ path: `tmp/visuals/${theme}-ionic-canvas.png`, fullPage: false });
    await page.locator("main, header, aside, .mobile-rail-toggle, .context-rail").evaluateAll((nodes) => nodes.forEach((node) => ((node as HTMLElement).style.visibility = "hidden")));
    await page.screenshot({ path: `tmp/visuals/${theme}-ionic-field.png`, fullPage: false });
  });
}
