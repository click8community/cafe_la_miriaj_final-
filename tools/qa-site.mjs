import { chromium } from "playwright";

const baseUrl = process.env.QA_BASE_URL ?? "http://127.0.0.1:5174";
const pageKeys = ["home", "about", "menu", "events", "gallery", "places"];
const failures = [];
const passes = [];

function pass(name) {
  passes.push(name);
  console.log(`PASS  ${name}`);
}

function fail(name, detail) {
  failures.push({ name, detail: String(detail) });
  console.error(`FAIL  ${name}: ${detail}`);
}

function check(name, condition, detail = "condition was false") {
  if (condition) {
    pass(name);
  } else {
    fail(name, detail);
  }
}

async function waitForHash(page, hash) {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if ((await page.evaluate(() => window.location.hash)) === hash) return;
    await page.waitForTimeout(100);
  }
  throw new Error(`Timed out waiting for ${hash}`);
}

async function waitForScroll(page, minimumY) {
  for (let attempt = 0; attempt < 70; attempt += 1) {
    if ((await page.evaluate(() => window.scrollY)) >= minimumY) return;
    await page.waitForTimeout(100);
  }
  const actualY = await page.evaluate(() => window.scrollY);
  throw new Error(`Timed out waiting for scroll >= ${minimumY}; reached ${actualY}`);
}

async function unique(locator, name) {
  const count = await locator.count();
  check(`${name} is unique`, count === 1, `found ${count}`);
  return count === 1;
}

async function clickButton(page, name) {
  const button = page.getByRole("button", { name, exact: true });
  if (!(await unique(button, `"${name}" button`))) return false;
  await button.click();
  return true;
}

async function goto(page, pageKey) {
  await page.goto(`${baseUrl}/#${pageKey}`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(120);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});

await context.addInitScript(() => {
  window.__qaOpenedUrls = [];
  window.open = (url) => {
    window.__qaOpenedUrls.push(String(url));
    return null;
  };
});

const page = await context.newPage();
const consoleErrors = [];
const failedRequests = [];

page.on("console", (message) => {
  if (message.type() === "error") consoleErrors.push(message.text());
});
page.on("pageerror", (error) => consoleErrors.push(error.message));
page.on("requestfailed", (request) => {
  const url = request.url();
  if (!url.startsWith("tel:") && !url.startsWith("mailto:")) {
    failedRequests.push(`${request.failure()?.errorText ?? "failed"} ${url}`);
  }
});

try {
  for (const pageKey of pageKeys) {
    await goto(page, pageKey);
    const brokenImages = await page.locator("img").evaluateAll((images) =>
      images
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.getAttribute("src")),
    );
    check(`${pageKey} page images load`, brokenImages.length === 0, brokenImages.join(", "));
  }

  const navTargets = [
    ["Home", "home"],
    ["About", "about"],
    ["Menu", "menu"],
    ["Events", "events"],
    ["Gallery", "gallery"],
  ];

  for (const [label, target] of navTargets) {
    await goto(page, target === "home" ? "about" : "home");
    if (await clickButton(page, label)) {
      await waitForHash(page, `#${target}`);
      pass(`${label} navigation opens #${target}`);
    }
  }

  await goto(page, "about");
  if (await clickButton(page, "Go to home")) {
    await waitForHash(page, "#home");
    pass("Header logo opens Home");
  }

  for (const pageKey of pageKeys) {
    await goto(page, pageKey);
    if (await clickButton(page, "Contact")) {
      await page.waitForFunction(() => {
        const footer = document.querySelector("#contact-footer");
        return footer && Math.abs(footer.getBoundingClientRect().top) < 80;
      }, { timeout: 5000 });
      pass(`Contact navigation reaches the ${pageKey} footer`);
    }
  }

  await goto(page, "about");
  if (await clickButton(page, "Make a Reservation")) {
    await waitForHash(page, "#home");
    await waitForScroll(page, 7000);
    pass("About reservation CTA reaches table booking");
  }

  await goto(page, "home");
  if (await clickButton(page, "Reserve Table")) {
    await waitForHash(page, "#home");
    await waitForScroll(page, 7000);
    pass("Header Reserve Table reaches table booking");
  }

  await goto(page, "home");
  for (const mood of ["day", "sunset", "night"]) {
    const label = `Show cafe in ${mood}`;
    if (await clickButton(page, label)) {
      const pressed = await page.getByRole("button", { name: label, exact: true })
        .getAttribute("aria-pressed");
      check(`Hero ${mood} mode activates`, pressed === "true", `aria-pressed=${pressed}`);
    }
  }
  check(
    "Night mode restores the original Figma hero",
    (await page.locator(".hero-mood-photo").count()) === 0,
    "replacement photo remained visible",
  );

  await goto(page, "home");
  if (await clickButton(page, "Explore the cafe")) {
    await waitForScroll(page, 2500);
    pass("Explore the Cafe button reaches the floor plan");
  }

  const cafeZones = [
    "Entrance",
    "Workspace",
    "Seating",
    "Projector",
    "Kiosk",
    "Lounge Seating",
    "Snooker",
  ];
  for (const zone of cafeZones) {
    const label = `Explore ${zone}`;
    if (await clickButton(page, label)) {
      await page.waitForFunction(
        (expectedZone) =>
          document.querySelector(".explore-cafe-detail h3")?.textContent?.trim() === expectedZone,
        zone,
        { timeout: 3000 },
      );
      pass(`${zone} floor-plan detail opens`);
      if (zone === "Entrance") {
        const sectionBox = await page.locator(".explore-cafe-experience").boundingBox();
        const detailBox = await page.locator(".explore-cafe-detail").boundingBox();
        check(
          "Floor-plan detail covers the full Explore the Cafe section",
          sectionBox &&
            detailBox &&
            Math.abs(sectionBox.x - detailBox.x) < 1 &&
            Math.abs(sectionBox.y - detailBox.y) < 1 &&
            Math.abs(sectionBox.width - detailBox.width) < 1 &&
            Math.abs(sectionBox.height - detailBox.height) < 1,
          `section=${JSON.stringify(sectionBox)} detail=${JSON.stringify(detailBox)}`,
        );
      }
      if (await clickButton(page, "Back to floor plan")) {
        await page.waitForFunction(
          () => !document.querySelector(".explore-cafe-detail"),
          { timeout: 3000 },
        );
        pass(`${zone} floor-plan detail closes`);
      }
    }
  }

  if (await clickButton(page, "Explore Entrance")) {
    await page.waitForFunction(() => Boolean(document.querySelector(".explore-cafe-detail")), {
      timeout: 3000,
    });
    if (await clickButton(page, "Reserve this space")) {
      await waitForScroll(page, 7000);
      pass("Floor-plan reservation reaches table booking");
    }
  }

  const eventCards = [
    "View Match Screenings events",
    "View Movie Nights events",
    "View Open Mic Nights events",
    "View Race Nights events",
    "View Community Events events",
    "View Special Celebrations events",
  ];
  for (const label of eventCards) {
    await goto(page, "home");
    if (await clickButton(page, label)) {
      await waitForHash(page, "#events");
      pass(`${label} opens Events`);
    }
  }

  await goto(page, "home");
  const carousel = page.locator(".home-gallery-carousel-nudge");
  const initialTransform = await carousel.getAttribute("style");
  if (await clickButton(page, "Next gallery photos")) {
    const movedTransform = await carousel.getAttribute("style");
    check(
      "Gallery next control moves the carousel",
      movedTransform !== initialTransform,
      `${initialTransform} -> ${movedTransform}`,
    );
  }
  if (await clickButton(page, "Previous gallery photos")) {
    const restoredTransform = await carousel.getAttribute("style");
    check(
      "Gallery previous control moves the carousel back",
      restoredTransform === initialTransform,
      `${restoredTransform} !== ${initialTransform}`,
    );
  }

  await goto(page, "menu");
  const menuExpectations = {
    Pizza: "Margherita Pizza",
    Pasta: "Tangy Arrabbiata Pasta",
    Drinks: "Classic Mint Mojito",
    Shakes: "Oreo Thick Shake",
  };
  for (const [tabName, firstItem] of Object.entries(menuExpectations)) {
    const tab = page.getByRole("tab", { name: tabName, exact: true });
    if (await unique(tab, `${tabName} menu tab`)) {
      await tab.click();
      check(
        `${tabName} menu tab activates`,
        (await tab.getAttribute("aria-selected")) === "true",
      );
      check(
        `${tabName} menu content updates`,
        (await page.locator(".figma-menu-item h3").allTextContents()).includes(firstItem),
        `${firstItem} was not rendered`,
      );
    }
  }
  if (await clickButton(page, "Explore the Menu")) {
    await waitForScroll(page, 500);
    pass("Kiosk menu button returns to the menu list");
  }

  const eventTitles = [
    "Movie Night: Rooftop Cinema",
    "Match Screening: Live Sports Night",
    "Film Shoot Open Day",
  ];
  for (const title of eventTitles) {
    await goto(page, "events");
    if (await clickButton(page, `Book a table for ${title}`)) {
      await waitForHash(page, "#home");
      await waitForScroll(page, 7000);
      pass(`${title} arrow reaches table booking`);
    }
  }

  await goto(page, "home");
  const tableCard = page.getByRole("button", { name: /Table Reservation/ });
  if (await unique(tableCard, "Table Reservation booking card")) {
    await tableCard.click();
    check(
      "Booking spot selection updates",
      (await tableCard.getAttribute("aria-pressed")) === "true",
    );
  }
  if (await clickButton(page, "Continue to Date & Time")) {
    check(
      "Booking advances to date and time",
      (await page.getByRole("heading", { name: "Select Date & Time", exact: true }).count()) === 1,
    );
  }

  const dateSelect = page.locator(".booking-select-field select").nth(0);
  const timeSelect = page.locator(".booking-select-field select").nth(1);
  const guestSelect = page.locator(".booking-select-field select").nth(2);
  const dateValues = await dateSelect.locator("option").allTextContents();
  check(
    "Booking dates are current",
    dateValues.some((value) => value.includes(String(new Date().getFullYear()))) &&
      !dateValues.some((value) => value.includes("January 2026")),
    dateValues.join(", "),
  );
  await dateSelect.selectOption({ index: 1 });
  await timeSelect.selectOption({ index: 1 });
  await guestSelect.selectOption({ label: "4 Guests" });

  if (await clickButton(page, "Back")) {
    check(
      "Booking Back returns to spot selection",
      (await page.getByRole("heading", { name: "Choose Your Spot", exact: true }).count()) === 1,
    );
  }
  if (await clickButton(page, "Continue to Date & Time")) {
    pass("Booking can advance again after going back");
  }
  if (await clickButton(page, "Continue")) {
    check(
      "Booking review opens",
      (await page.getByRole("heading", { name: "Confirm Booking", exact: true }).count()) === 1,
    );
    check(
      "Booking review keeps selected guests",
      (await page.locator(".booking-review-list").textContent()).includes("4 Guests"),
    );
  }
  if (await clickButton(page, "Confirm Booking")) {
    check(
      "Booking confirmation appears",
      (await page.getByText("Booking Confirmed!", { exact: true }).count()) === 1,
    );
  }
  if (await clickButton(page, "Make Another Booking")) {
    check(
      "Make Another Booking resets the form",
      (await page.getByRole("heading", { name: "Choose Your Spot", exact: true }).count()) === 1,
    );
  }

  await goto(page, "gallery");
  const instagramLink = page.getByRole("link", {
    name: "Follow Cafe La Mirajh on Instagram",
    exact: true,
  });
  if (await unique(instagramLink, "Gallery Instagram link")) {
    const href = await instagramLink.getAttribute("href");
    const target = await instagramLink.getAttribute("target");
    check(
      "Gallery Instagram button opens the cafe account",
      href?.includes("instagram.com/cafe_la_mirajh_") && target === "_blank",
      `${href} target=${target}`,
    );
  }

  const reserveButtons = [
    "Reserve entrance",
    "Reserve snooker",
    "Reserve workspace",
    "Reserve kiosk",
    "Reserve gaming",
    "Reserve projector",
  ];
  for (const label of reserveButtons) {
    await goto(page, "places");
    if (await clickButton(page, label)) {
      await waitForHash(page, "#home");
      await waitForScroll(page, 7000);
      pass(`${label} reaches table booking`);
    }
  }

  await goto(page, "home");
  for (const [label, expected] of [
    ["Open location in maps", "google.com/maps"],
    ["Open map directions", "google.com/maps"],
    ["Instagram", "instagram.com/cafe_la_mirajh_"],
    ["Facebook", "facebook.com"],
    ["Twitter", "twitter.com"],
  ]) {
    if (await clickButton(page, label)) {
      const opened = await page.evaluate(() => window.__qaOpenedUrls.at(-1));
      check(`${label} opens the expected destination`, opened?.includes(expected), opened);
    }
  }

  for (const [label, status] of [
    ["Call Cafe La Mirajh", "Phone link opened"],
    ["Email Cafe La Mirajh", "Email opened"],
  ]) {
    await goto(page, "home");
    if (label === "Call Cafe La Mirajh") {
      const phoneButton = page.getByRole("button", { name: label, exact: true });
      check(
        "Footer displays the original cafe phone number",
        (await phoneButton.innerText()).trim() === "+91 87788 23007",
        await phoneButton.innerText(),
      );
    }
    if (await clickButton(page, label)) {
      const liveStatus = await page.locator(".sr-only").textContent();
      check(`${label} triggers its action`, liveStatus?.includes(status), liveStatus);
    }
  }

  await goto(page, "home");
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForFunction(() => document.querySelector(".site-header")?.classList.contains("is-hidden"));
  pass("Header hides while scrolling down");
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForFunction(() => !document.querySelector(".site-header")?.classList.contains("is-hidden"));
  pass("Header returns while scrolling up");

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const mobilePage = await mobileContext.newPage();
  for (const pageKey of pageKeys) {
    await mobilePage.goto(`${baseUrl}/#${pageKey}`, { waitUntil: "networkidle" });
    const dimensions = await mobilePage.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    check(
      `${pageKey} has no mobile horizontal overflow`,
      dimensions.document <= dimensions.viewport,
      `${dimensions.document}px > ${dimensions.viewport}px`,
    );
  }
  await mobileContext.close();

  check("No browser console errors", consoleErrors.length === 0, consoleErrors.join("\n"));
  check("No failed asset requests", failedRequests.length === 0, failedRequests.join("\n"));
} catch (error) {
  fail("QA runner completed", error.stack ?? error);
} finally {
  await context.close();
  await browser.close();
}

console.log(`\n${passes.length} checks passed, ${failures.length} failed.`);
if (failures.length > 0) {
  process.exitCode = 1;
}
