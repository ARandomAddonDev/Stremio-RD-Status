Real-Debrid Status (Simple) — Stremio Add-on

Developed by A1337User

A tiny, self-hosted Stremio add-on that shows your Real-Debrid premium days remaining as a card in the Streams tab.

✅ What you’ll get

Clear status card (Active / Renew Soon / Expired)

Works locally with Stremio Web/Desktop

Fast setup — a single index.js

🧰 Requirements

Windows (instructions below use CMD)

Node.js (LTS recommended) — https://nodejs.org

Your Real-Debrid API token

Tip: The token entered in Configure (inside Stremio) will be used if present. Otherwise, the RD_TOKEN environment variable is used.

🚀 Quick Start (Windows • CMD as Administrator)

Open CMD → Run as Administrator

Go to your folder (adjust the path if needed):

cd "C:\Users\theva\Desktop\Stremio Addons\Development\DaysRemaining"


Start the add-on with your RD token (one-liner):

set RD_TOKEN=PASTE_REALDEBRID_API_TOKEN_HERE && node index.js


You should see:

RD add-on on http://127.0.0.1:7000/manifest.json


Install in Stremio Web
Open: https://web.stremio.com/#/addons? → Install via URL → paste:

http://127.0.0.1:7000/manifest.json


Press “Configure” in the add-on card
Paste your Real-Debrid Token again in the Real-Debrid Token field → Save.

Press “Install”
Stremio Web will prompt to open the Stremio application → click Open Stremio → finally click Install inside the app.

Test it
Open any movie/series → Streams tab → look for ⭐ RD Status.
It should show your Real-Debrid account stats (days remaining / expiration date).

📌 Notes

Config vs ENV: If a token is saved in Configure, it takes priority. If not, the add-on uses RD_TOKEN from your CMD session.

Localhost: The add-on runs at http://127.0.0.1:7000/manifest.json. Keep CMD open while testing.

Where it appears: In the Streams tab as an info card (no playback links).

🧯 “Nuke & Fix” (wrong token or stuck state)

If you pasted the wrong token or things seem stale, do this:

Kill Node (close/restart the server):

taskkill /IM node.exe /F


Clear the environment token (optional, if you set it earlier):

set RD_TOKEN=


Restart with the correct token:

cd "C:\Users\theva\Desktop\Stremio Addons\Development\DaysRemaining"
set RD_TOKEN=PASTE_CORRECT_TOKEN_HERE && node index.js


(If still stale) In Stremio Web/Desktop: Uninstall the add-on → Install via URL again.
Advanced: You can also bump manifest.version in index.js to force a refresh.

🧪 What you should see (expected titles)

✅ Premium: YYYY-MM-DD (XX D) — active

⏰ Renew soon: XX D left — 14 days or less

❌ Expired — no premium time left

🛠 Troubleshooting

“Configure your RD token” card shows up
→ No token detected. Paste it in Configure or relaunch with RD_TOKEN.

Config seems ignored

Make sure you installed from the same URL/port you’re running.

Uninstall duplicate copies of the add-on.

Keep manifest.id stable between runs.

If you set RD_TOKEN in CMD, it’s fine — but the Configure token should still take effect once saved.

Port already in use

set PORT=7010 && set RD_TOKEN=YOUR_TOKEN && node index.js


Then install from:

http://127.0.0.1:7010/manifest.json

📂 Project Structure (minimal)
DaysRemaining/
└─ index.js

🙌 Credits

Developed by A1337User

Built with stremio-addon-sdk + node-fetch

🔐 Token Safety

Treat your Real-Debrid token like a password.

Do not commit it to GitHub.

Prefer entering it in Stremio Configure, or set it per-session via RD_TOKEN in CMD.

Happy streaming — and may your “Renew Soon” never catch you off-guard!
