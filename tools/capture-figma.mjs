import { chromium } from "playwright";

const fileKey = "7oM5PvnUhRWMHEpy8HkdEX";
const nodeId = process.env.FIGMA_NODE_ID ?? "3312-646";
const output = process.env.FIGMA_OUTPUT ?? "public/figma-exports/figma-edge-view.png";
const waitMs = Number(process.env.FIGMA_WAIT_MS ?? 20000);
const width = Number(process.env.FIGMA_VIEWPORT_WIDTH ?? 1920);
const height = Number(process.env.FIGMA_VIEWPORT_HEIGHT ?? 1080);
const url = `https://www.figma.com/design/${fileKey}/Main?node-id=${nodeId}&p=f`;

const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
});

const page = await browser.newPage({
  viewport: { width, height },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36 Edg/151.0.0.0",
});

await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(waitMs);
await page.screenshot({
  path: output,
  fullPage: false,
});
console.log(await page.title());
console.log(page.url());
console.log(output);

await browser.close();
