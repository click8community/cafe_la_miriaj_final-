import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, MutableRefObject } from "react";

type PageKey = "home" | "about" | "menu" | "events" | "gallery" | "places";

type PageSpec = {
  key: PageKey;
  label: string;
  src: string;
  width: number;
  height: number;
  contentHeight: number;
};

type PlaceSectionAction =
  | "placeEntrance"
  | "placeSnooker"
  | "placeWorkspace"
  | "placeKiosk"
  | "placeGaming"
  | "placeProjector";

type HotspotAction =
  | PageKey
  | PlaceSectionAction
  | "contact"
  | "reserve"
  | "instagram"
  | "facebook"
  | "twitter"
  | "phone"
  | "eventPhone"
  | "email"
  | "map"
  | "exploreCafe"
  | "menuList";

type Hotspot = {
  label: string;
  action: HotspotAction;
  x: number;
  y: number;
  width: number;
  height: number;
};

type ImageOverlay = {
  kind: "image";
  label: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type VisualOverlay = ImageOverlay;

type HeaderNavItem = {
  label: string;
  action: PageKey | "contact";
  x: number;
  width: number;
};

type EventTemplate = {
  title: string;
  weekday: number;
  hour: number;
  minute: number;
  timeLabel: string;
};

type ExploreCafeZone = {
  id: string;
  name: string;
  description: string;
  action: HotspotAction;
  x: number;
  y: number;
  width: number;
  height: number;
};

const pages: Record<PageKey, PageSpec> = {
  home: {
    key: "home",
    label: "Home",
    src: "/figma-exports/frame-8728.png?v=6",
    width: 1728,
    height: 11422,
    contentHeight: 10460,
  },
  about: {
    key: "about",
    label: "About",
    src: "/figma-exports/about-page.png",
    width: 1728,
    height: 4011,
    contentHeight: 3290,
  },
  menu: {
    key: "menu",
    label: "Menu",
    src: "/figma-exports/menu-page.png?v=2",
    width: 1728,
    height: 3858,
    contentHeight: 2760,
  },
  events: {
    key: "events",
    label: "Events",
    src: "/figma-exports/events-page.png",
    width: 1728,
    height: 3593,
    contentHeight: 2444,
  },
  gallery: {
    key: "gallery",
    label: "Gallery",
    src: "/figma-exports/gallery-page.png",
    width: 1728,
    height: 4282,
    contentHeight: 4862,
  },
  places: {
    key: "places",
    label: "Rooftop",
    src: "/figma-exports/places-page.png",
    width: 1728,
    height: 4525,
    contentHeight: 4525,
  },
};

const headerNavItems: HeaderNavItem[] = [
  { label: "Home", action: "home", x: 0, width: 92 },
  { label: "About", action: "about", x: 0, width: 105 },
  { label: "Menu", action: "menu", x: 0, width: 92 },
  { label: "Events", action: "events", x: 0, width: 118 },
  { label: "Gallery", action: "gallery", x: 0, width: 135 },
  { label: "Contact", action: "contact", x: 0, width: 132 },
];

const instagramUrl = "https://www.instagram.com/cafe_la_mirajh_/";
const facebookUrl = "https://www.facebook.com/search/top?q=Cafe%20La%20Mirajh";
const twitterUrl = "https://twitter.com/search?q=%22Cafe%20La%20Mirajh%22";
const mapUrl = "https://www.google.com/maps/dir/?api=1&destination=13.0865409%2C80.2205116";
const phoneHref = "tel:+918778823007";
const eventPhoneHref = phoneHref;
const emailHref = "mailto:hello@cafelamirajh.com";

const pageHotspots: Partial<Record<PageKey, Hotspot[]>> = {
  home: [
    { label: "Discover The Experience", action: "exploreCafe", x: 72, y: 1390, width: 280, height: 48 },
    { label: "Explore Cafe Specials", action: "menuList", x: 72, y: 1772, width: 245, height: 62 },
    { label: "More about Mirajh", action: "about", x: 1110, y: 8610, width: 265, height: 62 },
    { label: "Check our Instagram", action: "instagram", x: 608, y: 9038, width: 420, height: 86 },
    { label: "Reserve your spot", action: "eventPhone", x: 1058, y: 9054, width: 235, height: 94 },
    { label: "See full event calendar", action: "events", x: 1322, y: 9058, width: 330, height: 82 },
  ],
  about: [
    { label: "Instagram", action: "instagram", x: 1550, y: 3868, width: 58, height: 58 },
    { label: "Facebook", action: "facebook", x: 1620, y: 3868, width: 58, height: 58 },
  ],
  menu: [
    { label: "View kiosk menu", action: "menuList", x: 934, y: 2650, width: 410, height: 90 },
  ],
  events: [
    { label: "Movie night booking", action: "eventPhone", x: 105, y: 1990, width: 620, height: 132 },
    { label: "Match screening booking", action: "eventPhone", x: 105, y: 2135, width: 620, height: 132 },
    { label: "Film shoot booking", action: "eventPhone", x: 105, y: 2280, width: 620, height: 132 },
  ],
  gallery: [
    { label: "Follow on Instagram", action: "instagram", x: 1310, y: 2628, width: 340, height: 80 },
  ],
  places: [
    { label: "Reserve entrance", action: "reserve", x: 78, y: 965, width: 210, height: 68 },
    { label: "Reserve snooker", action: "reserve", x: 78, y: 1665, width: 210, height: 68 },
    { label: "Reserve workspace", action: "reserve", x: 78, y: 2390, width: 210, height: 68 },
    { label: "Reserve kiosk", action: "reserve", x: 78, y: 3140, width: 210, height: 68 },
    { label: "Reserve gaming", action: "reserve", x: 78, y: 3870, width: 210, height: 68 },
    { label: "Reserve projector", action: "reserve", x: 78, y: 4380, width: 210, height: 68 },
  ],
};

const visualOverlays: Partial<Record<PageKey, VisualOverlay[]>> = {
  home: [
    {
      kind: "image",
      label: "Live at Mirajh event photo",
      src: "/figma-exports/live-at-mirajh-event-photo.png?v=1",
      x: 840,
      y: 7677,
      width: 888,
      height: 708,
    },
  ],
};

const carouselPhotos = Array.from(
  { length: 15 },
  (_, index) => `/cafe-photos/photo-${String(index + 1).padStart(2, "0")}.jpg`,
);

const homeGalleryCarousel = {
  x: 638,
  y: 6032,
  width: 1090,
  height: 400,
  cardWidth: 269,
  gap: 30,
};

const homeGalleryControls = [
  {
    label: "Previous gallery photos",
    direction: -1,
    x: 44,
    y: 6314,
    width: 154,
    height: 82,
  },
  {
    label: "Next gallery photos",
    direction: 1,
    x: 205,
    y: 6314,
    width: 165,
    height: 82,
  },
] as const;

const homeEventsDivider = {
  top: 8386,
  width: 1728,
  height: 2,
};

const upcomingEventCards = {
  top: 8512,
  width: 1728,
  height: 460,
  bodyTop: 22,
  bodyHeight: 438,
  cardWidth: 262,
  iconLeft: 104,
  iconSize: 56,
  cards: [
    { name: "Match Screenings", x: 46 },
    { name: "Movie Nights", x: 322 },
    { name: "Open Mic Nights", x: 597 },
    { name: "Race Nights", x: 872 },
    { name: "Community Events", x: 1148 },
    { name: "Special Celebrations", x: 1423 },
  ],
};

const heroExploreCafeButton = {
  x: 82,
  y: 872,
  width: 346,
  height: 77,
  targetY: 3310,
};

const exploreCafeExperience = {
  top: 3308,
  width: 1728,
  height: 1080,
  model: {
    x: 270,
    y: 288,
    width: 1190,
    height: 682,
  },
};

const exploreCafeZones: ExploreCafeZone[] = [
  {
    id: "entrance",
    name: "Entrance",
    description:
      "Your journey above the city begins here. A grand welcome setting the tone for the evening ahead.",
    action: "placeEntrance",
    x: 910,
    y: 340,
    width: 250,
    height: 300,
  },
  {
    id: "workspace",
    name: "Workspace",
    description:
      "Productivity with a panoramic view. High-speed WiFi and comfortable seating above the noise.",
    action: "placeWorkspace",
    x: 800,
    y: 548,
    width: 110,
    height: 210,
  },
  {
    id: "seating",
    name: "Seating",
    description:
      "Comfortable table seating for coffee, conversations and long evenings above the city.",
    action: "reserve",
    x: 548,
    y: 338,
    width: 370,
    height: 226,
  },
  {
    id: "projector",
    name: "Projector",
    description:
      "Movie nights, match screenings and live events under the sky. Settle in for the big screen experience.",
    action: "placeProjector",
    x: 304,
    y: 320,
    width: 220,
    height: 480,
  },
  {
    id: "kiosk",
    name: "Kiosk",
    description:
      "Craft brews, fresh juices and signature drinks, ready when you are. Walk up and order your favorite.",
    action: "placeKiosk",
    x: 294,
    y: 808,
    width: 408,
    height: 148,
  },
  {
    id: "lounge-seating",
    name: "Lounge Seating",
    description:
      "Relaxed sofa seating for coffee, conversation and unhurried evenings above the city.",
    action: "reserve",
    x: 1170,
    y: 350,
    width: 278,
    height: 390,
  },
  {
    id: "snooker",
    name: "Snooker",
    description:
      "Sharpen your cue and challenge a friend. Premium tables in a relaxed, intimate atmosphere.",
    action: "placeSnooker",
    x: 1138,
    y: 754,
    width: 276,
    height: 180,
  },
];

const placeSectionTargets: Record<
  PlaceSectionAction,
  { label: string; targetY: number }
> = {
  placeEntrance: { label: "Entrance", targetY: 540 },
  placeSnooker: { label: "Snooker", targetY: 1210 },
  placeWorkspace: { label: "Workspace", targetY: 1870 },
  placeKiosk: { label: "Kiosk", targetY: 2570 },
  placeGaming: { label: "PS5 Gaming", targetY: 3250 },
  placeProjector: { label: "Projector", targetY: 3900 },
};

function isPlaceSectionAction(action: HotspotAction): action is PlaceSectionAction {
  return action in placeSectionTargets;
}

const homeRooftopEscapePhoto = {
  x: 1080,
  y: 1337,
  width: 571,
  height: 768,
  src: "/cafe-photos/photo-15.jpg",
};

const instagramStorySection = {
  top: 2472,
  width: 1728,
  height: 2390,
};

const instagramStoryPhotos = Array.from(
  { length: 17 },
  (_, index) => `/figma-exports/instagram-story/instagram-${String(index + 1).padStart(2, "0")}.jpg`,
);

const actualMenuPages = Array.from(
  { length: 12 },
  (_, index) => `/menu/cafe-la-mirajh-menu-${String(index + 1).padStart(2, "0")}.png`,
);

const actualMenuCategories = [
  {
    key: "all",
    label: "All",
    subtitle: "12 pages",
    pages: actualMenuPages,
  },
  {
    key: "bar",
    label: "Bar",
    subtitle: "1 page",
    pages: actualMenuPages.slice(0, 1),
  },
  {
    key: "food",
    label: "Food",
    subtitle: "6 pages",
    pages: actualMenuPages.slice(1, 7),
  },
  {
    key: "beverages",
    label: "Beverages",
    subtitle: "5 pages",
    pages: actualMenuPages.slice(7),
  },
] as const;

const actualMenuSection = {
  x: 0,
  y: 748,
  width: 1728,
  height: 1412,
};

const figmaMenuSection = {
  x: 0,
  y: 750,
  width: 1728,
  height: 760,
};

const figmaMenuCategories = [
  {
    key: "pizza",
    label: "Pizza",
    items: [
      {
        name: "Margherita Pizza",
        price: "₹349",
      },
      {
        name: "Garden Fresh Pizza",
        price: "₹399",
      },
      {
        name: "Mexican Pizza",
        price: "₹429",
      },
      {
        name: "Chicken Fest Pizza",
        price: "₹449",
      },
    ],
  },
  {
    key: "pasta",
    label: "Pasta",
    items: [
      {
        name: "Tangy Arrabbiata Pasta",
        price: "₹279",
      },
      {
        name: "White Sauce Alfredo Pasta",
        price: "₹299",
      },
      {
        name: "Creamy Makhani Pasta (Pink Sauce)",
        price: "₹279",
      },
      {
        name: "Mac & Cheese Pasta",
        price: "₹349",
      },
    ],
  },
  {
    key: "drinks",
    label: "Drinks",
    items: [
      {
        name: "Classic Mint Mojito",
        price: "₹149",
      },
      {
        name: "Chilly Guava",
        price: "₹179",
      },
      {
        name: "Cold Brew",
        price: "₹240",
      },
      {
        name: "Cold Coffee Frappe",
        price: "₹219",
      },
    ],
  },
  {
    key: "shakes",
    label: "Shakes",
    items: [
      {
        name: "Oreo Thick Shake",
        price: "₹219",
      },
      {
        name: "Cold Milo",
        price: "₹239",
      },
      {
        name: "Chocolate Overloaded",
        price: "₹249",
      },
      {
        name: "Ferrero Rocher Shake",
        price: "₹289",
      },
    ],
  },
] as const;

const kioskMenuFeature = {
  x: 0,
  y: 2160,
  width: 1728,
  height: 698,
  image: "/cafe-photos/photo-05.jpg",
};

const heroMoodSwitcher = {
  top: 152,
  width: 1728,
  height: 948,
};

const aboutHeroReplacement = {
  top: 150,
  width: 1728,
  height: 800,
  image: "/cafe-photos/photo-15.jpg",
};

const aboutStoryPhoto = {
  x: 1008,
  y: 1070,
  width: 600,
  height: 700,
  image: "/figma-exports/instagram-story/instagram-05.jpg",
};

const aboutCommunityPhotos = {
  top: 2234,
  width: 1728,
  height: 334,
  imageHeight: 302,
  iconTop: 272,
  iconLeft: 42,
  iconSize: 64,
  cards: [
    {
      title: "Origin Stories",
      x: 120,
      width: 469,
      image: "/cafe-photos/photo-14.jpg",
      position: "center center",
    },
    {
      title: "Brewing Together",
      x: 630,
      width: 469,
      image: "/cafe-photos/photo-05.jpg",
      position: "center center",
    },
    {
      title: "The Third Place",
      x: 1139,
      width: 469,
      image: "/cafe-photos/photo-15.jpg",
      position: "center 54%",
    },
  ],
};

const aboutReservationCta = {
  top: 2860,
  width: 1728,
  height: 430,
};

const eventsHeroReplacement = {
  top: 152,
  width: 1728,
  height: 800,
  image: "/figma-exports/events-match-projector.jpg",
};

const currentEventsTimeline = {
  x: 108,
  y: 1998,
  width: 656,
  height: 410,
};

const currentEventTemplates: EventTemplate[] = [
  {
    title: "Movie Night: Rooftop Cinema",
    weekday: 5,
    hour: 20,
    minute: 0,
    timeLabel: "8:00 PM",
  },
  {
    title: "Match Screening: Live Sports Night",
    weekday: 6,
    hour: 19,
    minute: 0,
    timeLabel: "7:00 PM",
  },
  {
    title: "Film Shoot Open Day",
    weekday: 0,
    hour: 10,
    minute: 0,
    timeLabel: "10:00 AM",
  },
];

const heroMoods = [
  {
    key: "day",
    label: "Day",
    image: "/cafe-photos/photo-15.jpg",
    icon: "/figma-exports/mood-icons/day.png?v=1",
  },
  {
    key: "sunset",
    label: "Sunset",
    image: "/cafe-photos/photo-03.jpg",
    icon: "/figma-exports/mood-icons/sunset.png?v=1",
  },
  {
    key: "night",
    label: "Night",
    image: "",
    icon: "/figma-exports/mood-icons/night.png?v=1",
  },
] as const;

const bookingWidget = {
  x: 0,
  y: 9250,
  width: 1728,
  height: 1210,
};

const bookingSpots = [
  {
    id: "table",
    name: "Table Reservation",
    people: "2-4 people",
    detail: "360° panoramic view",
    image: "/cafe-photos/photo-15.jpg",
    tags: ["Best sunset view", "Private seating"],
    popular: true,
  },
  {
    id: "workspace",
    name: "Workspace",
    people: "1-2 people",
    detail: "High-speed WiFi",
    image: "/figma-exports/experience-work-photo.png",
    tags: ["High-speed WiFi", "Power outlets"],
  },
  {
    id: "gaming",
    name: "Gaming Booth",
    people: "4-6 people",
    detail: "Gaming consoles",
    image: "/figma-exports/experience-gaming-photo.png",
    tags: ["Gaming consoles", "Group seating"],
    popular: true,
  },
] as const;

const bookingDates = Array.from({ length: 3 }, (_, index) => {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + index);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});
const bookingTimes = ["6:00 PM - Sunset Time", "7:30 PM - Night View", "9:00 PM - Late Lounge"];
const bookingGuests = ["2 Guests", "3 Guests", "4 Guests", "6 Guests"];

const sharedHeader = {
  src: "/figma-exports/shared-header-seal.png?v=1",
  width: 1728,
  height: 152,
};

const siteHeaderLayout = {
  width: 1728,
  height: 168,
  logo: {
    x: 103,
    y: 33,
    width: 96,
    height: 96,
  },
  nav: {
    x: 400,
    y: 72,
    width: 840,
    height: 48,
  },
  reserve: {
    x: 1392,
    y: 50,
    width: 258,
    height: 70,
  },
};

const sharedFooter = {
  src: "/figma-exports/shared-footer.png?v=2",
  width: 1728,
  height: 1202,
};

const sharedFooterPhone = {
  x: 150,
  y: 598,
  width: 230,
  height: 42,
};

function getContentOffset(pageKey: PageKey) {
  return pageKey === "places" ? sharedHeader.height : 0;
}

function getFooterTop(pageKey: PageKey) {
  return getContentOffset(pageKey) + pages[pageKey].contentHeight;
}

const sharedFooterHotspots: Hotspot[] = [
  { label: "Open location in maps", action: "map", x: 72, y: 400, width: 455, height: 145 },
  { label: "Email Cafe La Mirajh", action: "email", x: 72, y: 700, width: 460, height: 120 },
  { label: "Open map directions", action: "map", x: 938, y: 328, width: 738, height: 650 },
  { label: "Instagram", action: "instagram", x: 72, y: 978, width: 64, height: 64 },
  { label: "Facebook", action: "facebook", x: 148, y: 978, width: 64, height: 64 },
  { label: "Twitter", action: "twitter", x: 224, y: 978, width: 64, height: 64 },
];

function pageFromHash(): PageKey {
  const value = window.location.hash.replace("#", "") as PageKey;
  return value in pages ? value : "home";
}

export function App() {
  const [activePage, setActivePage] = useState<PageKey>(() => pageFromHash());
  const [status, setStatus] = useState("");
  const pendingScroll = useRef<number | null>(null);

  useEffect(() => {
    const onHashChange = () => setActivePage(pageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const page = pages[activePage];
  const hotspots = useMemo(() => {
    return (pageHotspots[activePage] ?? []).filter(
      (hotspot) => hotspot.y < pages[activePage].contentHeight,
    );
  }, [activePage]);
  const overlays = visualOverlays[activePage] ?? [];

  function navigate(action: HotspotAction) {
    const openExternal = (url: string, statusMessage: string) => {
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus(statusMessage);
    };

    const openPageAt = (targetPage: PageKey, targetY: number, statusMessage: string) => {
      pendingScroll.current = targetY;
      window.location.hash = targetPage;
      setActivePage(targetPage);
      setStatus(statusMessage);

      if (activePage === targetPage) {
        requestAnimationFrame(() => {
          const image = document.querySelector<HTMLImageElement>(".page-image");
          const scale = image ? image.clientWidth / pages[targetPage].width : 1;
          pendingScroll.current = null;
          window.scrollTo({ top: targetY * scale, left: 0, behavior: "smooth" });
        });
      }
    };

    if (isPlaceSectionAction(action)) {
      const target = placeSectionTargets[action];
      openPageAt("places", target.targetY, `${target.label} opened`);
      return;
    }

    if (action === "contact") {
      openPageAt(activePage, getFooterTop(activePage), "Contact footer opened");
      return;
    }

    if (action === "reserve") {
      openPageAt("home", bookingWidget.y, "Booking section opened");
      return;
    }

    if (action === "exploreCafe") {
      openPageAt("home", heroExploreCafeButton.targetY, "Cafe section opened");
      return;
    }

    if (action === "menuList") {
      openPageAt("menu", 760, "Kiosk menu opened");
      return;
    }

    if (action === "instagram") {
      openExternal(instagramUrl, "Instagram opened");
      return;
    }

    if (action === "facebook") {
      openExternal(facebookUrl, "Facebook opened");
      return;
    }

    if (action === "twitter") {
      openExternal(twitterUrl, "Twitter opened");
      return;
    }

    if (action === "map") {
      openExternal(mapUrl, "Directions opened");
      return;
    }

    if (action === "phone" || action === "eventPhone") {
      window.location.href = action === "eventPhone" ? eventPhoneHref : phoneHref;
      setStatus("Phone link opened");
      return;
    }

    if (action === "email") {
      window.location.href = emailHref;
      setStatus("Email opened");
      return;
    }

    pendingScroll.current = null;
    window.location.hash = action;
    setActivePage(action);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    setStatus(`${pages[action].label} opened`);
  }

  return (
    <main className="site-frame" style={{ "--page-width": `${page.width}px` } as CSSProperties}>
      <FigmaPage
        key={page.key}
        page={page}
        hotspots={hotspots}
        overlays={overlays}
        onNavigate={navigate}
        pendingScroll={pendingScroll}
        activePage={activePage}
      />
      <p className="sr-only" aria-live="polite">
        {status}
      </p>
    </main>
  );
}

function FigmaPage({
  page,
  hotspots,
  overlays,
  onNavigate,
  pendingScroll,
  activePage,
}: {
  page: PageSpec;
  hotspots: Hotspot[];
  overlays: VisualOverlay[];
  onNavigate: (action: Hotspot["action"]) => void;
  pendingScroll: MutableRefObject<number | null>;
  activePage: PageKey;
}) {
  const shellRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [scale, setScale] = useState(1);
  const contentOffset = getContentOffset(page.key);
  const contentBottom = contentOffset + page.contentHeight;

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const updateScale = () => setScale(image.clientWidth / page.width);
    updateScale();

    const observer = new ResizeObserver(updateScale);
    observer.observe(image);
    return () => observer.disconnect();
  }, [page.width]);

  useEffect(() => {
    const target = pendingScroll.current;

    requestAnimationFrame(() => {
      const imageScale = imageRef.current ? imageRef.current.clientWidth / page.width : 1;
      window.scrollTo({
        top: (target ?? 0) * imageScale,
        left: 0,
        behavior: target === null ? "auto" : "smooth",
      });

      if (target !== null) {
        pendingScroll.current = null;
      }
    });
  }, [page.key, page.width, pendingScroll]);

  return (
    <div ref={shellRef} className="page-shell">
      <div className="page-image-clip" style={{ height: contentBottom * scale }}>
        <img
          ref={imageRef}
          className="page-image"
          src={page.src}
          alt={`${page.label} page exported exactly from the Figma file`}
          width={page.width}
          height={page.height}
          draggable={false}
          style={contentOffset ? { marginTop: contentOffset * scale } : undefined}
        />
      </div>
      <img
        id="contact-footer"
        className="shared-footer-image"
        src={sharedFooter.src}
        alt="Cafe La Miraj contact footer"
        width={sharedFooter.width}
        height={sharedFooter.height}
        draggable={false}
      />
      <button
        className="shared-footer-phone"
        type="button"
        aria-label="Call Cafe La Mirajh"
        style={{
          left: sharedFooterPhone.x * scale,
          top: (contentBottom + sharedFooterPhone.y) * scale,
          width: sharedFooterPhone.width * scale,
          height: sharedFooterPhone.height * scale,
          fontSize: 22 * scale,
        }}
        onClick={() => onNavigate("phone")}
      >
        +91 87788 23007
      </button>
      {overlays.map((overlay) => (
        <VisualOverlayLayer
          key={overlay.label}
          overlay={overlay}
          scale={scale}
          yOffset={contentOffset}
        />
      ))}
      {page.key === "home" && <HeroMoodSwitcher scale={scale} />}
      {page.key === "home" && <HeroExploreCafeButton scale={scale} onNavigate={onNavigate} />}
      {page.key === "home" && <HomeRooftopEscapePhoto scale={scale} />}
      {page.key === "home" && (
        <ExploreCafeExperience scale={scale} onNavigate={onNavigate} />
      )}
      {page.key === "about" && <AboutHeroReplacement scale={scale} />}
      {page.key === "about" && <AboutStoryPhoto scale={scale} />}
      {page.key === "about" && <AboutCommunityPhotos scale={scale} />}
      {page.key === "about" && (
        <AboutReservationCta scale={scale} onNavigate={onNavigate} />
      )}
      {page.key === "events" && <EventsHeroReplacement scale={scale} />}
      {page.key === "events" && <CurrentEventsTimeline scale={scale} onNavigate={onNavigate} />}
      {page.key === "gallery" && <InstagramStorySection scale={scale} />}
      {page.key === "menu" && <FigmaMenuSection scale={scale} />}
      {page.key === "menu" && <KioskMenuFeature scale={scale} onNavigate={onNavigate} />}
      {page.key === "home" && <HomeGalleryCarousel scale={scale} />}
      {page.key === "home" && <HomeEventsDivider scale={scale} />}
      {page.key === "home" && (
        <UpcomingEventCards scale={scale} onNavigate={onNavigate} />
      )}
      {page.key === "home" && <VirtualTableBooking scale={scale} />}
      <HeaderNav activePage={activePage} scale={scale} onNavigate={onNavigate} />
      {hotspots.map((hotspot) => (
        <button
          key={`${hotspot.label}-${hotspot.x}-${hotspot.y}`}
          className="hotspot"
          type="button"
          aria-label={hotspot.label}
          style={{
            left: hotspot.x * scale,
            top: (contentOffset + hotspot.y) * scale,
            width: hotspot.width * scale,
            height: hotspot.height * scale,
          }}
          onClick={() => onNavigate(hotspot.action)}
        />
      ))}
      {sharedFooterHotspots.map((hotspot) => (
        <button
          key={`shared-footer-${hotspot.label}`}
          className="hotspot"
          type="button"
          aria-label={hotspot.label}
          style={{
            left: hotspot.x * scale,
            top: (contentBottom + hotspot.y) * scale,
            width: hotspot.width * scale,
            height: hotspot.height * scale,
          }}
          onClick={() => onNavigate(hotspot.action)}
        />
      ))}
    </div>
  );
}

type FigmaMenuCategoryKey = (typeof figmaMenuCategories)[number]["key"];

function FigmaMenuSection({ scale }: { scale: number }) {
  const [activeCategoryKey, setActiveCategoryKey] =
    useState<FigmaMenuCategoryKey>("pizza");
  const activeCategory =
    figmaMenuCategories.find((category) => category.key === activeCategoryKey) ??
    figmaMenuCategories[0];

  return (
    <section
      className="figma-menu-section"
      aria-label="Cafe La Mirajh featured menu"
      style={{
        left: figmaMenuSection.x * scale,
        top: figmaMenuSection.y * scale,
        width: figmaMenuSection.width,
        height: figmaMenuSection.height,
        transform: `scale(${scale})`,
      }}
    >
      <div className="figma-menu-tabs" role="tablist" aria-label="Menu categories">
        {figmaMenuCategories.map((category) => {
          const isActive = category.key === activeCategory.key;

          return (
            <button
              className={`figma-menu-tab${isActive ? " is-active" : ""}`}
              key={category.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="figma-menu-items"
              onClick={() => setActiveCategoryKey(category.key)}
            >
              {category.label}
            </button>
          );
        })}
      </div>

      <div
        className="figma-menu-items"
        id="figma-menu-items"
        role="tabpanel"
        aria-live="polite"
      >
        {activeCategory.items.map((item) => (
          <article className="figma-menu-item" key={item.name}>
            <div className="figma-menu-item-heading">
              <h3>{item.name}</h3>
              <span aria-hidden="true" />
              <strong>{item.price}</strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function AboutReservationCta({
  scale,
  onNavigate,
}: {
  scale: number;
  onNavigate: (action: Hotspot["action"]) => void;
}) {
  return (
    <section
      className="about-reservation-cta"
      aria-labelledby="about-reservation-title"
      style={{
        top: aboutReservationCta.top * scale,
        width: aboutReservationCta.width,
        height: aboutReservationCta.height,
        transform: `scale(${scale})`,
      }}
    >
      <h2 id="about-reservation-title">
        Reserve your table in the <span>Sky</span>
      </h2>
      <p>Open Daily: 10:00 AM - 11:00 PM · Reservations: +91 87788 23007</p>
      <button type="button" onClick={() => onNavigate("reserve")}>
        Make a Reservation
      </button>
    </section>
  );
}

function AboutCommunityPhotos({ scale }: { scale: number }) {
  return (
    <div
      className="about-community-photos"
      aria-label="Cafe La Mirajh community"
      style={{
        top: aboutCommunityPhotos.top * scale,
        width: aboutCommunityPhotos.width,
        height: aboutCommunityPhotos.height,
        transform: `scale(${scale})`,
      }}
    >
      {aboutCommunityPhotos.cards.map((card) => (
        <div
          className="about-community-photo"
          key={card.title}
          style={{
            left: card.x,
            width: card.width,
            height: aboutCommunityPhotos.imageHeight,
          }}
        >
          <img
            src={card.image}
            alt={`${card.title} at Cafe La Mirajh`}
            draggable={false}
            style={{ objectPosition: card.position }}
          />
          <span
            className="about-community-photo-icon"
            aria-hidden="true"
            style={{
              left: aboutCommunityPhotos.iconLeft,
              top: aboutCommunityPhotos.iconTop,
              width: aboutCommunityPhotos.iconSize,
              height: aboutCommunityPhotos.iconSize,
            }}
          />
        </div>
      ))}
    </div>
  );
}

function AboutStoryPhoto({ scale }: { scale: number }) {
  return (
    <div
      className="about-story-photo"
      style={{
        left: aboutStoryPhoto.x * scale,
        top: aboutStoryPhoto.y * scale,
        width: aboutStoryPhoto.width,
        height: aboutStoryPhoto.height,
        transform: `scale(${scale})`,
      }}
    >
      <img
        src={aboutStoryPhoto.image}
        alt="Cafe La Mirajh guests sharing time in the rooftop lounge"
        draggable={false}
      />
    </div>
  );
}

function AboutHeroReplacement({ scale }: { scale: number }) {
  return (
    <section
      className="about-hero-replacement"
      aria-label="Cafe La Mirajh rooftop interior"
      style={{
        top: aboutHeroReplacement.top * scale,
        width: aboutHeroReplacement.width,
        height: aboutHeroReplacement.height,
        transform: `scale(${scale})`,
      }}
    >
      <img
        src={aboutHeroReplacement.image}
        alt="The actual Cafe La Mirajh rooftop interior with lounge seating and projector"
        draggable={false}
      />
      <div className="about-hero-shade" aria-hidden="true" />
      <div className="about-hero-copy">
        <p>Established 2024</p>
        <h1>
          A Legacy of <span>Excellence</span>
        </h1>
        <div>
          Our journey started with a simple vision: to create a space that transcends
          <br />
          the ordinary and touches the clouds.
        </div>
      </div>
    </section>
  );
}

function KioskMenuFeature({
  scale,
  onNavigate,
}: {
  scale: number;
  onNavigate: (action: Hotspot["action"]) => void;
}) {
  return (
    <section
      className="kiosk-menu-feature"
      aria-label="The Cafe Kiosk"
      style={{
        left: kioskMenuFeature.x * scale,
        top: kioskMenuFeature.y * scale,
        width: kioskMenuFeature.width,
        height: kioskMenuFeature.height,
        transform: `scale(${scale})`,
      }}
    >
      <img
        className="kiosk-menu-photo"
        src={kioskMenuFeature.image}
        alt="Cafe La Mirajh kiosk counter"
        draggable={false}
      />
      <div className="kiosk-menu-copy">
        <p>The Kiosk</p>
        <h2>The Cafe Kiosk</h2>
        <div className="kiosk-menu-description">
          <span>
            The kiosk is the working heart of Cafe la Mirajh - where fresh coffee,
            coolers, shakes, and quick bites are prepared right in front of you.
          </span>
          <span>Built for fast service, warm light, and that first rooftop welcome.</span>
        </div>
        <button className="kiosk-menu-button" type="button" onClick={() => onNavigate("menuList")}>
          Explore the Menu
        </button>
      </div>
    </section>
  );
}

type ActualMenuCategoryKey = (typeof actualMenuCategories)[number]["key"];

function ActualMenuSection({ scale }: { scale: number }) {
  const [activeCategoryKey, setActiveCategoryKey] = useState<ActualMenuCategoryKey>("all");
  const activeCategory =
    actualMenuCategories.find((category) => category.key === activeCategoryKey) ??
    actualMenuCategories[0];

  return (
    <section
      className="actual-menu-section"
      aria-label="Cafe La Mirajh actual menu"
      style={{
        left: actualMenuSection.x * scale,
        top: actualMenuSection.y * scale,
        width: actualMenuSection.width,
        height: actualMenuSection.height,
        transform: `scale(${scale})`,
      }}
    >
      <div className="actual-menu-header">
        <div>
          <p className="actual-menu-kicker">Menu</p>
          <h2 className="actual-menu-title">Cafe La Mirajh Menu</h2>
        </div>
        <div className="actual-menu-tabs" role="tablist" aria-label="Menu categories">
          {actualMenuCategories.map((category) => {
            const isActive = category.key === activeCategory.key;

            return (
              <button
                className={`actual-menu-tab${isActive ? " is-active" : ""}`}
                key={category.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategoryKey(category.key)}
              >
                <span>{category.label}</span>
                <small>{category.subtitle}</small>
              </button>
            );
          })}
        </div>
      </div>

      <div className="actual-menu-pages" aria-live="polite">
        {activeCategory.pages.map((pageSrc, index) => (
          <a
            className="actual-menu-page"
            href={pageSrc}
            key={`${activeCategory.key}-${pageSrc}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${activeCategory.label} menu page ${index + 1}`}
          >
            <img
              className="actual-menu-page-image"
              src={pageSrc}
              alt={`${activeCategory.label} menu page ${index + 1}`}
              draggable={false}
            />
          </a>
        ))}
      </div>
    </section>
  );
}

type HeroMoodKey = (typeof heroMoods)[number]["key"];

function HeroExploreCafeButton({
  scale,
  onNavigate,
}: {
  scale: number;
  onNavigate: (action: Hotspot["action"]) => void;
}) {
  return (
    <button
      className="hero-explore-cafe-button"
      type="button"
      aria-label="Explore the cafe"
      style={{
        left: heroExploreCafeButton.x * scale,
        top: heroExploreCafeButton.y * scale,
        width: heroExploreCafeButton.width * scale,
        height: heroExploreCafeButton.height * scale,
        fontSize: 25 * scale,
      }}
      onClick={() => onNavigate("exploreCafe")}
    >
      Explore the Cafe
    </button>
  );
}

function HomeRooftopEscapePhoto({ scale }: { scale: number }) {
  return (
    <img
      className="home-rooftop-escape-photo"
      src={homeRooftopEscapePhoto.src}
      alt="Rooftop lounge seating and projector at Cafe La Mirajh"
      draggable={false}
      style={{
        left: homeRooftopEscapePhoto.x * scale,
        top: homeRooftopEscapePhoto.y * scale,
        width: homeRooftopEscapePhoto.width * scale,
        height: homeRooftopEscapePhoto.height * scale,
      }}
    />
  );
}

function ExploreCafeExperience({
  scale,
  onNavigate,
}: {
  scale: number;
  onNavigate: (action: Hotspot["action"]) => void;
}) {
  const [activeZoneId, setActiveZoneId] = useState<string | null>(null);
  const [dissolvingZoneId, setDissolvingZoneId] = useState<string | null>(null);
  const [detailZoneId, setDetailZoneId] = useState<string | null>(null);
  const transitionTimeout = useRef<number | null>(null);
  const activeZone = exploreCafeZones.find((zone) => zone.id === activeZoneId) ?? null;
  const detailZone = exploreCafeZones.find((zone) => zone.id === detailZoneId) ?? null;
  const detailMediaWidth = 1008;
  const detailMediaHeight = exploreCafeExperience.height;
  const detailZoom = 2;

  useEffect(() => {
    return () => {
      if (transitionTimeout.current !== null) {
        window.clearTimeout(transitionTimeout.current);
      }
    };
  }, []);

  const openZone = (zone: ExploreCafeZone) => {
    if (dissolvingZoneId) return;

    setActiveZoneId(zone.id);
    setDissolvingZoneId(zone.id);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    transitionTimeout.current = window.setTimeout(
      () => {
        setDetailZoneId(zone.id);
        setDissolvingZoneId(null);
        setActiveZoneId(null);
      },
      reduceMotion ? 80 : 720,
    );
  };

  return (
    <section
      className={`explore-cafe-experience${dissolvingZoneId ? " is-dissolving" : ""}${
        detailZone ? " is-showing-detail" : ""
      }`}
      aria-label="Interactive Cafe La Mirajh floor plan"
      style={{
        left: 0,
        top: exploreCafeExperience.top * scale,
        width: exploreCafeExperience.width,
        height: exploreCafeExperience.height,
        transform: `scale(${scale})`,
      }}
      onMouseLeave={() => {
        if (!dissolvingZoneId && !detailZone) setActiveZoneId(null);
      }}
    >
      {!detailZone && (
        <div className="explore-cafe-zone-map">
          {exploreCafeZones.map((zone) => (
            <button
              key={zone.id}
              className={`explore-cafe-zone${activeZoneId === zone.id ? " is-active" : ""}${
                dissolvingZoneId === zone.id ? " is-selected" : ""
              }`}
              type="button"
              aria-label={`Explore ${zone.name}`}
              aria-describedby={
                activeZoneId === zone.id ? "explore-cafe-zone-description" : undefined
              }
              style={{
                left: zone.x,
                top: zone.y,
                width: zone.width,
                height: zone.height,
              }}
              onMouseEnter={() => setActiveZoneId(zone.id)}
              onFocus={() => setActiveZoneId(zone.id)}
              onClick={() => openZone(zone)}
            >
              <span className="explore-cafe-zone-marker" aria-hidden="true">
                <span />
              </span>
              <span className="explore-cafe-zone-label">{zone.name}</span>
            </button>
          ))}
        </div>
      )}

      {!detailZone && (
        <div
          className="explore-cafe-instruction-replacement"
          aria-label="Click. Explore. Experience."
        >
          CLICK .
        </div>
      )}

      {activeZone && !detailZone && (
        <aside
          id="explore-cafe-zone-description"
          className="explore-cafe-zone-card"
          aria-live="polite"
        >
          <span>Signature space</span>
          <h3>{activeZone.name}</h3>
          <p>{activeZone.description}</p>
          <strong>Click the highlighted space to enter</strong>
        </aside>
      )}

      {detailZone && (
        <article
          className="explore-cafe-detail"
          aria-live="polite"
          style={{
            left: 0,
            top: 0,
            width: exploreCafeExperience.width,
            height: exploreCafeExperience.height,
          }}
        >
          <div className="explore-cafe-detail-copy">
            <span>Explore the cafe</span>
            <h3>{detailZone.name}</h3>
            <p>{detailZone.description}</p>
            <div className="explore-cafe-detail-actions">
              <button
                type="button"
                className="explore-cafe-detail-back"
                onClick={() => setDetailZoneId(null)}
              >
                Back to floor plan
              </button>
              <button
                type="button"
                className="explore-cafe-detail-reserve"
                onClick={() => onNavigate("reserve")}
              >
                Reserve this space
              </button>
            </div>
          </div>
          <div
            className="explore-cafe-detail-media"
            role="img"
            aria-label={`${detailZone.name} location in the Cafe La Mirajh floor plan`}
            style={{
              backgroundPosition: `${
                detailMediaWidth / 2 -
                (detailZone.x + detailZone.width / 2) * detailZoom
              }px ${
                detailMediaHeight / 2 -
                (exploreCafeExperience.top + detailZone.y + detailZone.height / 2) *
                  detailZoom
              }px`,
            }}
          />
        </article>
      )}

      <div
        className="explore-cafe-model-dissolve"
        aria-hidden="true"
        style={{
          left: exploreCafeExperience.model.x,
          top: exploreCafeExperience.model.y,
          width: exploreCafeExperience.model.width,
          height: exploreCafeExperience.model.height,
        }}
      >
        <div className="explore-cafe-model-erase" />
        <div className="explore-cafe-model-snapshot" />
        <div className="explore-cafe-model-grain" />
      </div>
    </section>
  );
}

function UpcomingEventCards({
  scale,
  onNavigate,
}: {
  scale: number;
  onNavigate: (action: Hotspot["action"]) => void;
}) {
  return (
    <div
      className="upcoming-event-cards"
      aria-label="Upcoming event categories"
      style={{
        left: 0,
        top: upcomingEventCards.top * scale,
        width: upcomingEventCards.width,
        height: upcomingEventCards.height,
        transform: `scale(${scale})`,
      }}
    >
      {upcomingEventCards.cards.map((card) => (
        <button
          className="upcoming-event-card"
          type="button"
          key={card.name}
          aria-label={`View ${card.name} events`}
          style={{
            left: card.x,
            width: upcomingEventCards.cardWidth,
            height: upcomingEventCards.height,
          }}
          onClick={() => onNavigate("events")}
        >
          <span
            className="upcoming-event-card-body"
            aria-hidden="true"
            style={{
              top: upcomingEventCards.bodyTop,
              width: upcomingEventCards.cardWidth,
              height: upcomingEventCards.bodyHeight,
              backgroundPosition: `-${card.x}px -${
                upcomingEventCards.top + upcomingEventCards.bodyTop
              }px`,
            }}
          />
          <span
            className="upcoming-event-card-icon"
            aria-hidden="true"
            style={{
              left: upcomingEventCards.iconLeft,
              width: upcomingEventCards.iconSize,
              height: upcomingEventCards.iconSize,
              backgroundPosition: `-${card.x + upcomingEventCards.iconLeft}px -${
                upcomingEventCards.top
              }px`,
            }}
          />
        </button>
      ))}
    </div>
  );
}

function HomeEventsDivider({ scale }: { scale: number }) {
  return (
    <div
      className="home-events-divider"
      aria-hidden="true"
      style={{
        left: 0,
        top: homeEventsDivider.top * scale,
        width: homeEventsDivider.width,
        height: homeEventsDivider.height,
        transform: `scale(${scale})`,
      }}
    />
  );
}

function getNextEventDate(now: Date, template: EventTemplate) {
  const next = new Date(now);
  next.setHours(template.hour, template.minute, 0, 0);

  const daysUntilEvent = (template.weekday - next.getDay() + 7) % 7;
  next.setDate(next.getDate() + daysUntilEvent);

  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 7);
  }

  return next;
}

function getCurrentEvents(now: Date) {
  return currentEventTemplates
    .map((template) => ({
      ...template,
      date: getNextEventDate(now, template),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function formatEventMonth(date: Date) {
  return date.toLocaleString("en-US", { month: "short" }).toUpperCase();
}

function formatEventDay(date: Date) {
  return date.toLocaleString("en-US", { day: "2-digit" });
}

function CurrentEventsTimeline({
  scale,
  onNavigate,
}: {
  scale: number;
  onNavigate: (action: Hotspot["action"]) => void;
}) {
  const [now, setNow] = useState(() => new Date());
  const events = useMemo(() => getCurrentEvents(now), [now]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section
      className="current-events-timeline"
      aria-label="Upcoming screenings updated from the current date and time"
      style={{
        left: currentEventsTimeline.x * scale,
        top: currentEventsTimeline.y * scale,
        width: currentEventsTimeline.width,
        height: currentEventsTimeline.height,
        transform: `scale(${scale})`,
      }}
    >
      {events.map((event) => (
        <div className="current-event-row" key={event.title}>
          <time className="current-event-date" dateTime={event.date.toISOString()}>
            <span>
              <strong>{formatEventMonth(event.date)}</strong>
              <b>{formatEventDay(event.date)}</b>
            </span>
            <small>{event.timeLabel}</small>
          </time>
          <span className="current-event-title">{event.title}</span>
          <button
            className="current-event-arrow"
            type="button"
            aria-label={`Book a table for ${event.title}`}
            onClick={() => onNavigate("reserve")}
          >
            &rarr;
          </button>
        </div>
      ))}
    </section>
  );
}

function InstagramStorySection({ scale }: { scale: number }) {
  return (
    <section
      className="instagram-story-section"
      aria-label="Cafe La Mirajh Instagram story"
      style={{
        left: 0,
        top: instagramStorySection.top * scale,
        width: instagramStorySection.width,
        height: instagramStorySection.height,
        transform: `scale(${scale})`,
      }}
    >
      <div className="instagram-story-copy">
        <h2>Follow the Story</h2>
        <p>@cafe_la_mirajh_</p>
      </div>
      <a
        className="instagram-story-button"
        href={instagramUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Follow Cafe La Mirajh on Instagram"
      >
        <span>Follow on Instagram</span>
        <i aria-hidden="true" />
      </a>
      <div className="instagram-story-rail" aria-label="Latest Instagram photos">
        {instagramStoryPhotos.map((src, index) => (
          <img
            key={src}
            className={`instagram-story-photo instagram-story-photo-${index + 1}`}
            src={src}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
        ))}
      </div>
    </section>
  );
}

function EventsHeroReplacement({ scale }: { scale: number }) {
  return (
    <section
      className="events-hero-replacement"
      aria-label="Cinematic experiences and match screenings"
      style={{
        left: 0,
        top: eventsHeroReplacement.top * scale,
        width: eventsHeroReplacement.width,
        height: eventsHeroReplacement.height,
        transform: `scale(${scale})`,
      }}
    >
      <img
        className="events-hero-photo"
        src={eventsHeroReplacement.image}
        alt=""
        aria-hidden="true"
        draggable={false}
      />
      <div className="events-hero-shade" aria-hidden="true" />
      <div className="events-hero-copy" aria-hidden="true">
        <p>Cinematic Experiences</p>
        <h1>
          An Evening of <span>Cinema &amp; Sport</span>
        </h1>
      </div>
    </section>
  );
}

function HeroMoodSwitcher({ scale }: { scale: number }) {
  const [activeMood, setActiveMood] = useState<HeroMoodKey>("night");
  const mood = heroMoods.find((item) => item.key === activeMood) ?? heroMoods[2];
  const showMoodPhoto = mood.key !== "night";

  return (
    <section
      className="hero-mood"
      aria-label="Cafe day, sunset and night views"
      style={{
        left: 0,
        top: heroMoodSwitcher.top * scale,
        width: heroMoodSwitcher.width,
        height: heroMoodSwitcher.height,
        transform: `scale(${scale})`,
      }}
    >
      {showMoodPhoto && (
        <>
          <img
            className="hero-mood-photo"
            src={mood.image}
            alt=""
            aria-hidden="true"
            draggable={false}
          />
          <div className="hero-mood-shade" aria-hidden="true" />
          <div className="hero-mood-copy">
            <p className="hero-mood-eyebrow">Chennai's Tallest Rooftop Cafe</p>
            <h1 className="hero-mood-title">
              <span>Above the City</span>
              <em>Beyond Ordinary</em>
            </h1>
            <p className="hero-mood-subtitle">
              A premium yet accessible rooftop escape
              <br />
              where every evening becomes a escape
            </p>
            <div className="hero-mood-features" aria-label="Cafe highlights">
              <span className="hero-mood-feature">
                <i className="hero-feature-icon hero-feature-coffee" aria-hidden="true" />
                Coffee
              </span>
              <span className="hero-feature-dot" aria-hidden="true" />
              <span className="hero-mood-feature">
                <i className="hero-feature-icon hero-feature-community" aria-hidden="true" />
                Community
              </span>
              <span className="hero-feature-dot" aria-hidden="true" />
              <span className="hero-mood-feature">
                <i className="hero-feature-icon hero-feature-convo" aria-hidden="true" />
                Convo
              </span>
            </div>
          </div>
        </>
      )}
      <div className="hero-mood-toggle" aria-label="Change cafe view">
        {heroMoods.map((item) => (
          <button
            key={item.key}
            className={`hero-mood-button hero-mood-button-${item.key}${
              activeMood === item.key ? " is-active" : ""
            }`}
            type="button"
            aria-label={`Show cafe in ${item.label.toLowerCase()}`}
            aria-pressed={activeMood === item.key}
            onClick={() => setActiveMood(item.key)}
          >
            <img className="hero-mood-icon" src={item.icon} alt="" aria-hidden="true" draggable={false} />
          </button>
        ))}
      </div>
    </section>
  );
}

function HeaderNav({
  activePage,
  scale,
  onNavigate,
}: {
  activePage: PageKey;
  scale: number;
  onNavigate: (action: Hotspot["action"]) => void;
}) {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let animationFrame = 0;

    function updateHeaderVisibility() {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (currentScrollY < 12) {
        setIsHidden(false);
      } else if (delta > 3 && currentScrollY > siteHeaderLayout.height * scale * 0.55) {
        setIsHidden(true);
      } else if (delta < -1) {
        setIsHidden(false);
      }

      lastScrollY.current = currentScrollY;
      animationFrame = 0;
    }

    function handleScroll() {
      if (animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateHeaderVisibility);
    }

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [scale]);

  useEffect(() => {
    setIsHidden(false);
    lastScrollY.current = window.scrollY;
  }, [activePage]);

  return (
    <header
      className={`site-header${isHidden ? " is-hidden" : ""}`}
      style={{
        width: siteHeaderLayout.width * scale,
        height: siteHeaderLayout.height * scale,
      }}
    >
      <button
        className="site-header-logo-button"
        type="button"
        aria-label="Go to home"
        style={{
          left: siteHeaderLayout.logo.x * scale,
          top: siteHeaderLayout.logo.y * scale,
          width: siteHeaderLayout.logo.width * scale,
          height: siteHeaderLayout.logo.height * scale,
        }}
        onClick={() => onNavigate("home")}
      >
        <img src="/figma-exports/miraj-logo-seal-transparent.png" alt="" draggable={false} />
      </button>

      <nav
        className="dynamic-nav"
        aria-label="Main navigation"
        style={{
          left: siteHeaderLayout.nav.x * scale,
          top: siteHeaderLayout.nav.y * scale,
          width: siteHeaderLayout.nav.width * scale,
          height: siteHeaderLayout.nav.height * scale,
        }}
      >
        {headerNavItems.map((item) => {
          const isActive = item.action === activePage;
          return (
            <button
              key={item.label}
              className={`dynamic-nav-link${isActive ? " is-active" : ""}`}
              type="button"
              aria-current={isActive ? "page" : undefined}
              style={{
                width: item.width * scale,
                height: siteHeaderLayout.nav.height * scale,
                fontSize: 28 * scale,
                lineHeight: `${siteHeaderLayout.nav.height * scale}px`,
              }}
              onClick={() => onNavigate(item.action)}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <button
        className="site-header-reserve-button"
        type="button"
        style={{
          left: siteHeaderLayout.reserve.x * scale,
          top: siteHeaderLayout.reserve.y * scale,
          width: siteHeaderLayout.reserve.width * scale,
          height: siteHeaderLayout.reserve.height * scale,
          fontSize: 25 * scale,
        }}
        onClick={() => onNavigate("reserve")}
      >
        Reserve Table
      </button>
    </header>
  );
}

function VisualOverlayLayer({
  overlay,
  scale,
  yOffset,
}: {
  overlay: VisualOverlay;
  scale: number;
  yOffset: number;
}) {
  return (
    <img
      className="visual-overlay visual-overlay-image"
      src={overlay.src}
      alt=""
      aria-hidden="true"
      draggable={false}
      style={{
        left: overlay.x * scale,
        top: (yOffset + overlay.y) * scale,
        width: overlay.width * scale,
        height: overlay.height * scale,
      }}
    />
  );
}

type BookingStep = 1 | 2 | 3;
type BookingSpotId = (typeof bookingSpots)[number]["id"];

function VirtualTableBooking({ scale }: { scale: number }) {
  const [step, setStep] = useState<BookingStep>(1);
  const [selectedSpot, setSelectedSpot] = useState<BookingSpotId>("workspace");
  const [selectedDate, setSelectedDate] = useState(bookingDates[0]);
  const [selectedTime, setSelectedTime] = useState(bookingTimes[0]);
  const [selectedGuests, setSelectedGuests] = useState(bookingGuests[0]);
  const [submitted, setSubmitted] = useState(false);

  const spot = bookingSpots.find((item) => item.id === selectedSpot) ?? bookingSpots[1];

  function goToStep(nextStep: BookingStep) {
    setSubmitted(false);
    setStep(nextStep);
  }

  function handlePrimaryAction() {
    if (step === 1) {
      goToStep(2);
      return;
    }

    if (step === 2) {
      goToStep(3);
      return;
    }

    setSubmitted(true);
  }

  function resetBooking() {
    setStep(1);
    setSelectedSpot("workspace");
    setSelectedDate(bookingDates[0]);
    setSelectedTime(bookingTimes[0]);
    setSelectedGuests(bookingGuests[0]);
    setSubmitted(false);
  }

  const primaryLabel =
    step === 1
      ? "Continue to Date & Time"
      : step === 2
        ? "Continue"
        : "Confirm Booking";

  return (
    <section
      className="booking-widget"
      aria-label="Virtual table booking"
      style={{
        left: bookingWidget.x * scale,
        top: bookingWidget.y * scale,
        width: bookingWidget.width,
        height: bookingWidget.height,
        transform: `scale(${scale})`,
      }}
    >
      <div className="booking-heading">
        <p className="booking-eyebrow">Reserve Your Spot</p>
        <h2 className="booking-title">
          Virtual <span>Table</span> Booking
        </h2>
        <p className="booking-subtitle">
          From booking your table to enjoying the vibe, every moment is tailored above the city.
        </p>
      </div>

      {!submitted && <div className="booking-stepper" aria-label="Booking progress">
        {[1, 2, 3].map((item, index) => {
          const currentStep = item as BookingStep;
          return (
            <div className="booking-stepper-item" key={item}>
              <button
                className={`booking-step${step === currentStep ? " is-active" : ""}${
                  step > currentStep ? " is-complete" : ""
                }`}
                type="button"
                aria-label={`Go to booking step ${item}`}
                aria-current={step === currentStep ? "step" : undefined}
                onClick={() => goToStep(currentStep)}
              >
                {step > currentStep ? "✓" : item}
              </button>
              {index < 2 && <span className="booking-step-line" aria-hidden="true" />}
            </div>
          );
        })}
      </div>}

      <div className="booking-stage" aria-live="polite">
        {step === 1 && (
          <>
            <h3 className="booking-stage-title">Choose Your Spot</h3>
            <div className="booking-cards">
              {bookingSpots.map((item) => {
                const isSelected = selectedSpot === item.id;
                return (
                  <button
                    className={`booking-card${isSelected ? " is-selected" : ""}`}
                    key={item.id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setSelectedSpot(item.id)}
                    style={{ backgroundImage: `url(${item.image})` }}
                  >
                    {item.popular && <span className="booking-popular">Popular</span>}
                    {isSelected && <span className="booking-card-check" aria-hidden="true" />}
                    <span className="booking-card-content">
                      <span className="booking-card-title">{item.name}</span>
                      <span className="booking-people">{item.people}</span>
                      <span className="booking-tags">
                        {item.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 2 && (
          <div className="booking-panel booking-form-panel">
            <h3 className="booking-stage-title">Select Date & Time</h3>
            <div className="booking-form-fields">
              <label className="booking-select-field">
                <span>Date</span>
                <select value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)}>
                  {bookingDates.map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </label>
              <label className="booking-select-field">
                <span>Time</span>
                <select value={selectedTime} onChange={(event) => setSelectedTime(event.target.value)}>
                  {bookingTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </label>
              <label className="booking-select-field">
                <span>Number of Guests</span>
                <select
                  value={selectedGuests}
                  onChange={(event) => setSelectedGuests(event.target.value)}
                >
                  {bookingGuests.map((guests) => (
                    <option key={guests} value={guests}>
                      {guests}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        )}

        {step === 3 && !submitted && (
          <div className="booking-panel booking-confirm-panel">
            <h3 className="booking-stage-title">Confirm Booking</h3>
            <div className="booking-review-card">
              <div className="booking-review-spot">
                <span className="booking-review-icon" aria-hidden="true" />
                <span>
                  <strong>{spot.name}</strong>
                  <small>{spot.detail}</small>
                </span>
              </div>
              <dl className="booking-review-list">
                <div>
                  <dt>Selected Date:</dt>
                  <dd>{selectedDate}</dd>
                </div>
                <div>
                  <dt>Time Slot:</dt>
                  <dd>{selectedTime}</dd>
                </div>
                <div>
                  <dt>Guests:</dt>
                  <dd>{selectedGuests}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {step === 3 && submitted && (
          <div className="booking-confirmed-card">
            <span className="booking-confirmed-check" aria-hidden="true" />
            <strong>Booking Confirmed!</strong>
            <p>We've sent you a confirmation SMS and email with your booking details.</p>
            <span className="booking-see-you">See you at Cafe La Mirajh!</span>
            <button className="booking-again" type="button" onClick={resetBooking}>
              Make Another Booking
            </button>
          </div>
        )}
      </div>

      {!submitted && <div className="booking-actions">
        {step > 1 && (
          <button className="booking-back" type="button" onClick={() => goToStep((step - 1) as BookingStep)}>
            Back
          </button>
        )}
        <button
          className="booking-primary"
          type="button"
          onClick={handlePrimaryAction}
          disabled={submitted}
        >
          {primaryLabel}
        </button>
      </div>}
    </section>
  );
}

function HomeGalleryCarousel({ scale }: { scale: number }) {
  const [manualOffset, setManualOffset] = useState(0);
  const cardStep = (homeGalleryCarousel.cardWidth + homeGalleryCarousel.gap) * scale;
  const cycleWidth =
    carouselPhotos.length * (homeGalleryCarousel.cardWidth + homeGalleryCarousel.gap) * scale;

  function moveGallery(direction: (typeof homeGalleryControls)[number]["direction"]) {
    setManualOffset((current) => current + direction);
  }

  return (
    <>
      <section
        className="home-gallery-carousel"
        aria-label="Cafe photo carousel"
        style={
          {
            left: homeGalleryCarousel.x * scale,
            top: homeGalleryCarousel.y * scale,
            width: homeGalleryCarousel.width * scale,
            height: homeGalleryCarousel.height * scale,
            "--carousel-card-width": `${homeGalleryCarousel.cardWidth * scale}px`,
            "--carousel-card-height": `${homeGalleryCarousel.height * scale}px`,
            "--carousel-gap": `${homeGalleryCarousel.gap * scale}px`,
            "--carousel-cycle-width": `${cycleWidth}px`,
          } as CSSProperties
        }
      >
        <div
          className="home-gallery-carousel-nudge"
          style={{
            transform: `translate3d(${-manualOffset * cardStep}px, 0, 0)`,
          }}
        >
          <div className="home-gallery-carousel-track">
            {[...carouselPhotos, ...carouselPhotos].map((src, index) => (
              <img
                key={`${src}-${index}`}
                className="home-gallery-carousel-photo"
                src={src}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
            ))}
          </div>
        </div>
      </section>
      {homeGalleryControls.map((control) => (
        <button
          key={control.label}
          className="gallery-carousel-control"
          type="button"
          aria-label={control.label}
          style={{
            left: control.x * scale,
            top: control.y * scale,
            width: control.width * scale,
            height: control.height * scale,
          }}
          onClick={() => moveGallery(control.direction)}
        />
      ))}
    </>
  );
}
