// ============================================================================
// Real-Debrid Status • Stremio Addon (Info card, no play)
// Developed by A1337User  — simplified & commented for easy self-hosting
// ---------------------------------------------------------------------------
// Quick Start (Local):
//   1) Install deps:  npm i stremio-addon-sdk node-fetch
//   2) Start server:  RD_TOKEN=YOUR_RD_TOKEN node index.js
//      (or paste token in Stremio → Addon → Configure after installing)
//   3) Add to Stremio: http://127.0.0.1:7000/manifest.json
//
// Notes:
// - Token priority: Config page token > RD_TOKEN environment variable.
// - Caching reduces API spam (5 minutes).
// ============================================================================

import sdk from "stremio-addon-sdk";
const { addonBuilder, serveHTTP } = sdk;
import fetch from "node-fetch";

import fs from "fs";
import path from "path";


// Link to RD site on the card (false = hide the external button)
const NO_LINK = false;

// --- Real-Debrid API endpoints & cache settings ---
const RD_API_USER = "https://api.real-debrid.com/rest/1.0/user";
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// --- Read and Embedding our logo
const logoPath = path.join(process.cwd(), "assets", "logo.png");
let LOGO_DATA_URL = null;
try {
  const b64 = fs.readFileSync(logoPath).toString("base64");
  LOGO_DATA_URL = `data:image/png;base64,${b64}`;
  console.log("[logo] embedded from", logoPath);
} catch (e) {
  console.warn("[logo] could not read logo at", logoPath, e.message);
}


// --- Tiny in-memory cache (keyed by RD token) -------------------------------
const cache = new Map();
const setCache = (k, v, ttl = DEFAULT_CACHE_TTL) =>
  cache.set(k, { value: v, exp: Date.now() + ttl });
const getCache = (k) => {
  const rec = cache.get(k);
  if (!rec) return null;
  if (rec.exp > Date.now()) return rec.value;
  cache.delete(k);
  return null;
};

// --- Lightweight helpers ----------------------------------------------------
const bool = (v) => v === true || v === "true" || v === 1 || v === "1";

// Friendly, lightweight “value” lines to keep the card human
const QUOTES = [
  "Wallet whisper: ‘…do it.’",
  "Costs less than your ‘forgot to cancel’ fee.",
  "Cheaper than losing the remote—again.",
  "Your coffee costs more—and doesn’t stream anything.",
  "If it were free, we’d be suspicious.",
  "Less than a parking meter, way more adventure.",
  "ROI = Return On ‘one more episode.’",
  "Cheaper than FOMO.",
  "Cheaper than the snacks you're currently eating."
];
const pickQuote = () => QUOTES[Math.floor(Math.random() * QUOTES.length)];

// --- Real-Debrid: read current user/premium state ---------------------------
async function fetchRDUser(token) {
  // Most users will have OAuth access_token (device flow) — standard header:
  let res = await fetch(RD_API_USER, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Fallback for legacy/private tokens (query param)
  if (res.status === 401) {
    res = await fetch(`${RD_API_USER}?auth_token=${encodeURIComponent(token)}`);
  }

  if (res.status === 401) throw new Error("bad_token");
  if (res.status === 403) throw new Error("forbidden");
  if (res.status === 429) throw new Error("rate_limited");
  if (!res.ok) throw new Error("rd_error");

  return res.json();
}

// Convert RD premium info → readable “days left” + ISO date
function computeDaysLeft({ premium, expiration }) {
  // Some RD payloads give “premium” as seconds remaining
  if (typeof premium === "number" && premium > 0) {
    const days = Math.ceil(premium / 86400);
    const iso = new Date(Date.now() + premium * 1000).toISOString();
    return { days, iso };
  }
  // Some give an explicit expiration date
  if (expiration) {
    const exp = new Date(expiration);
    const days = Math.max(0, Math.ceil((exp - Date.now()) / 86400000));
    return { days, iso: exp.toISOString() };
  }
  return { days: 0, iso: null };
}

// Build one clean info card for Streams tab
function buildStatusCard(user, { showUsername }) {
  const { days, iso } = computeDaysLeft(user);
  const dateStr = iso ? iso.slice(0, 10) : "—";

  // Default: active premium
  let title = `✅ Premium: ${dateStr} (${days} D)`;
  let lines = [
    //"───────────────",
    `⭐ Premium until: ${dateStr}`,
    `⏳ Days remaining: ${days} D`,
  ];
  if (showUsername && user?.username) lines.push(`👤 @${user.username}`);
    //"───────────────";

  // Warn when renewal time is near
  if (days <= 14 && days > 0) {
    title = `⏰ Renew soon: ${days} D left`;
    lines = [
      "───────────────",
      "⏰ Renew soon",
      `⏳ Days remaining: ${days} D`,
      "💡 Please renew at real-debrid.com before it’s too late.",
      `💬 ${pickQuote()}`,
      ...(showUsername && user?.username ? [`👤 @${user.username}`] : []),
      "───────────────",
    ];
  }

  // Expired / not premium
  if (!(user?.type === "premium") || days === 0) {
    title = "❌ Expired";
    lines = [
      "───────────────",
      "❌ EXPIRED",
      "👉 Please login and renew at real-debrid.com",
      "🚫 DO NOT WATCH ANYTHING UNTIL YOU DO",
      `💬 ${pickQuote()}`,
      ...(showUsername && user?.username ? [`👤 @${user.username}`] : []),
      "───────────────",
    ];
  }

  return { title, description: lines.join("\n") };
}

// ============================================================================
// Manifest — minimal config (only token), one content type (movie)
// TIP: Want it also on series? Change `types: ["movie"]` to
//      `types: ["movie", "series"]`.
// ============================================================================
const manifest = {
  id: "a1337user.rdstatus.overlay",
  version: "1.0.0",
  name: "Real-Debrid Status",
  description:
    "Info card with Real-Debrid days remaining + renewal warnings. Developed by A1337User.",
  resources: ["stream"],
  types: ["movie", "series", "channel", "tv"], // <-- Tweak here: ["movie", "series", "channel", "tv"] to appear on both
  catalogs: [],
  behaviorHints: { configurable: true, configurationRequired: false },
  logo: LOGO_DATA_URL || "https://raw.githubusercontent.com/ARandomAddonDev/Stremio-RD-Status/refs/heads/main/assets/logo.png", // fallback
  config: [
    {
      name: "rd_token",
      type: "text",
      required: false,
      title: "Real-Debrid Token",
      description:
        "Paste your OAuth access_token (Device flow) or private API token.",
    },
    // Keep one toggle users often ask for
    {
      name: "show_username",
      type: "select",
      options: [
        { value: "true", name: "Show @username" },
        { value: "false", name: "Hide @username" },
      ],
      default: "true",
      title: "Username",
    },
  ],
};

const builder = new addonBuilder(manifest);

// ============================================================================
// Stream handler — returns a single “info card” into the Streams tab
// ============================================================================
builder.defineStreamHandler(async (args) => {
  const cfg = args?.config || {};

  // 1) Prefer Configure page token; 2) fallback to ENV RD_TOKEN
  const tokenFromConfig = (cfg.rd_token || "").trim();
  const tokenFromEnv = (process.env.RD_TOKEN || "").trim();
  const token = tokenFromConfig || tokenFromEnv;

  const showUser = bool(cfg.show_username ?? "true");

  // No token? Return a friendly diagnostic card so users know what to do.
  if (!token) {
    const help = [
      "Paste your RD token in Configure (preferred).",
      "Or set ENV RD_TOKEN before starting the server.",
    ].join("\n");
    return {
      streams: [
        {
          name: "⭐ RD Status",
          title: "⚙️ Configure your RD token",
          description: `───────────────\n${help}\n───────────────`,
          behaviorHints: { notWebReady: false },
          ...(NO_LINK ? {} : { externalUrl: "https://real-debrid.com/" }),
        },
      ],
      cacheMaxAge: 90,
      staleRevalidate: 180,
      staleError: 180,
    };
  }

  try {
    // Cache by token; avoids hammering RD API
    let user = getCache(token);
    if (!user) {
      user = await fetchRDUser(token);
      setCache(token, user); // 5 min default
    }

    const card = buildStatusCard(user, { showUsername: showUser });
    return {
      streams: [
        {
          name: "⭐ RD Status",
          title: card.title,
          description: card.description,
          behaviorHints: { notWebReady: false },
          ...(NO_LINK ? {} : { externalUrl: "https://real-debrid.com/" }),
        },
      ],
      cacheMaxAge: 300,
      staleRevalidate: 300,
      staleError: 300,
    };
  } catch (e) {
    let msg = "───────────────\nStatus unavailable.\n───────────────";
    if (e.message === "bad_token")
      msg = "───────────────\nInvalid/expired token.\n───────────────";
    else if (e.message === "forbidden")
      msg = "───────────────\nPermission denied / account locked.\n───────────────";
    else if (e.message === "rate_limited")
      msg = "───────────────\nRate limited. Try again later.\n───────────────";

    return {
      streams: [
        {
          name: "⭐ RD Status",
          title: "⚠️ Real-Debrid: status unavailable",
          description: msg,
          behaviorHints: { notWebReady: false },
          ...(NO_LINK ? {} : { externalUrl: "https://real-debrid.com/" }),
        },
      ],
      cacheMaxAge: 180,
      staleRevalidate: 300,
      staleError: 300,
    };
  }
});

// ============================================================================
// HTTP server — defaults to localhost:7000
// ============================================================================
const PORT = Number(process.env.PORT || 7000);
serveHTTP(builder.getInterface(), { port: PORT, hostname: "0.0.0.0" });

console.log(`RD add-on on http://127.0.0.1:${PORT}/manifest.json`);
