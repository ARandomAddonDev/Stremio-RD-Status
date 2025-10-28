# Real-Debrid Status — Stremio Add-on
*Developed by **A1337User***  

A tiny, self-hosted Stremio add-on that shows your **Real-Debrid premium days remaining** as a card in the **Streams** tab.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Requirements](#requirements)
- [Folder Location](#folder-location)
- [Quick Start (Windows • CMD as Administrator)](#quick-start-windows--cmd-as-administrator)
- [Install in Stremio Web/Desktop](#install-in-stremio-webdesktop)
- [Test the Card](#test-the-card)
- [Nuke & Fix (Wrong Token / Stuck State)](#nuke--fix-wrong-token--stuck-state)
- [Troubleshooting](#troubleshooting)
- [Notes & Tips](#notes--tips)
- [Credits](#credits)
- [License](#license)

---

## Overview
This add-on renders a single **info card** in the **Streams** tab for movies series, channel, and tv indicating:
- ✅ **Active** premium until *YYYY-MM-DD*  
- ⏰ **Renew soon** when ≤ 14 days remain  
- ❌ **Expired** when 0 days remain or no premium

It works locally and does **not** require a remote server.

### Screenshot:

![Real-Debrid Status](./Real-Debrid%20Status.png)

---

## Features
- **Local self-hosting** with Node.js
- **Configurable token** via Stremio **Configure** page
- **ENV fallback** using `RD_TOKEN`
- **Simple one-file** setup (`index.js`)
- **Minimal friction**: designed for copy-paste testing and use

---

## Requirements
- **Windows** (these steps use `CMD`)
- **Node.js** (LTS recommended) → https://nodejs.org
- Your **Real-Debrid API token**
  - You can paste it in Stremio **Configure**, or set it as an **environment variable** (`RD_TOKEN`).

> [!IMPORTANT]
> If a token is saved in **Configure**, it will be used. Otherwise, the server falls back to the `RD_TOKEN` environment variable.

---

## Folder Location
Use your real path. Example path used in these instructions:

C:\Users\a1337user\Desktop\Stremio Addons\Development\DaysRemaining


---

## Quick Start (Windows • CMD as Administrator)

1. **Open CMD** → **Run as Administrator**

2. **Change directory** to your add-on folder:
```cmd
cd "C:\Users\a1337user\Desktop\Stremio Addons\Development\DaysRemaining"
```

3. It is recommended to Restart Node (Nuke node process):
  ```cmd
  taskkill /IM node.exe /F
  ```

4. **(First time only)** Install dependencies:
  ```cmd
  npm init -y
  npm i stremio-addon-sdk node-fetch
  ```

5. **Start the add-on** with your RD token:

  ```cmd
  set RD_TOKEN=PASTE_REALDEBRID_API_TOKEN_HERE && node index.js
  ```

6. You should see:

  ```cmd
  RD add-on on http://127.0.0.1:7000/manifest.json
  ```
---

[!TIP]
If port 7000 is busy, use another:

```cmd
set PORT=7010 && set RD_TOKEN=PASTE_REALDEBRID_API_TOKEN_HERE && node index.js
```
Then install from:
 ```cmd
http://127.0.0.1:7010/manifest.json
```

## Install in Stremio Web/Desktop
### Using Stremio Web (requested flow)

1. Open:
 ```cmd
https://web.stremio.com/#/addons?
```

2. Click Install via URL (or the + Add icon).

3. Paste your local URL (shown in the console), for example:
 ```cmd
http://127.0.0.1:7000/manifest.json
```

4. Click the add-on card → Configure.

5. Paste your Real-Debrid Token in the Real-Debrid Token field → Save.

6. Click Install.

7. Your browser may prompt to Open Stremio (desktop app) → click Open Stremio → then click Install again in the app.

## Using Stremio Desktop (recommended for localhost)

1. Open the Stremio Desktop app.

2. Go to Add-ons → Community → Install via URL.

3. Paste:
 ```cmd
http://127.0.0.1:7000/manifest.json
```

4. Click the add-on → Configure → paste your Real-Debrid Token → Save → Install.

[!NOTE]
If Stremio Web blocks http:// localhost (mixed content), switch to the Desktop app for local testing.

---

## Test the Card

1. Open any movie (or series, if you enabled it) in Stremio.

2. Go to the Streams tab.

3. Look for ⭐ RD Status.

### Expected titles:

✅ Premium: YYYY-MM-DD (XX D) — active premium

⏰ Renew soon: XX D left — 14 days or less

❌ Expired — no premium or time left

---

## Nuke & Fix (Wrong Token / Stuck State)
1) Kill Node (clean restart)
 ```cmd
taskkill /IM node.exe /F
```

2) Clear the environment token (optional)

If you set RD_TOKEN in the current CMD session, clear it:
 ```cmd
set RD_TOKEN=
```

3) Relaunch with the correct token
 ```cmd
cd "C:\Users\theva\Desktop\Stremio Addons\Development\DaysRemaining"
set RD_TOKEN=PASTE_CORRECT_TOKEN_HERE && node index.js
```

4) If Stremio looks stale

Uninstall the add-on and reinstall via URL, or

Bump manifest.version in index.js (e.g., 1.4.0 → 1.4.1) and restart Node.

---

## Troubleshooting

[!WARNING]
“Configure your RD token” card
No token detected. Paste a token in Configure, or launch with RD_TOKEN.

Config feels ignored
- Ensure you installed from the same URL/port you’re running.
- Uninstall duplicates of the add-on (old ports/IDs).
- Keep manifest.id stable between runs.
- Clear RD_TOKEN so you’re only testing the Configure token.

Port already in use
```cmd
set PORT=7010 && set RD_TOKEN=YOUR_TOKEN && node index.js
```

Then install from:
```cmd
http://127.0.0.1:7010/manifest.json
```


Stremio Web (browser) can’t reach localhost

- Use Stremio Desktop for local testing, or run your add-on over HTTPS.

---

## Notes & Tips

- Where it appears: in the Streams tab as an info card (no playback links).
- Movies vs Series: the default manifest uses types: ["movie"] to reduce noise.
  To also show on series, edit index.js:

```cmd
// In the manifest:
types: ["movie", "series"]
```

- Token safety: treat your RD token like a password.
- Do not commit it to Git. Prefer the Configure page or a temporary RD_TOKEN per session.

---

## Credits

- Developed by A1337User
- Built with stremio-addon-sdk
 + node-fetch

---

## License

This project is provided “as-is,” without warranty of any kind. Review and adapt to your use-case and jurisdiction. See LICENSE if provided.


