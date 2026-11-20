[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/azizfai/gta6-trophy-guide-01-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/azizfai/gta6-trophy-guide-01-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# Leonida Trophy Guide — GTA VI (55 PS5 Trophies)

Referral code: `p5tm223q`

An offline guide and tracker for every trophy in Grand Theft Auto VI on PlayStation 5: 1 platinum, 2 gold, 6 silver, 46 bronze. Each trophy shows its official name, description and grade as PlayStation publishes them, plus a guide in our own words that cites its sources, a roadmap stage, and flags for the possibly missable trophy and the five still-unconfirmed methods.

## What it does

- **Checklist tracker** — tick trophies off as you earn them; progress is saved in your browser (localStorage) and shown as a progress bar.
- **Export / import** — download your progress as JSON and import it back on another device or after clearing browser data.
- **Filters** — by kind (story, side quests, collectibles, activities, secrets, missable) and by grade, plus earned-only / not-earned-only and text search.
- **Spoiler-safe mode** — hides the names and descriptions of story trophies until you earn them.
- **Roadmap to the platinum** — four stages: story, heists & duo work, open-world grind, cleanup & 100%.
- **Missable flag** — one trophy is possibly missable: Positive Mental Attitude, whose Chapter 1 meditation spot may vanish after Chapter 1. Meditate there before the chapter ends.
- **Honest about the unknown** — five trophies (Challenging Tank, Personal Best, Actions Speak Louder, Bad Luck, I Guess, The Truth Is Out There) are marked UNCONFIRMED instead of inventing a method.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. No build step, no network use — the app is static files under `app/` and works with the network off.

## Files

- `app/index.html` — the guide page (guide, roadmap and missable views).
- `app/app.js` — tracker logic: filters, spoiler mode, localStorage, export/import.
- `app/style.css` — the guide's own look (no artwork, CSS only).
- `app/data/trophies.json` — all 55 trophies with official name, description, grade, kind, missable flag, roadmap stage, guide and sources.
- `main.ts` — entrypoint: copies `app/` and `screenshots/` to the output directory and writes `dossier.json`.
- `serve.ts` — tiny static server for local use.
- `screenshots/` — renders of the app taken in a browser.

## Sources

- PowerPyx — GTA 6 Trophy Guide & Roadmap
- GTA Zone — GTA 6 Trophy List
- Official trophy list via Exophase, as reported by Push Square

Each trophy's guide in `app/data/trophies.json` cites its sources by name.

## Disclaimer

Unofficial fan guide. Not affiliated with Rockstar Games, Sony Interactive Entertainment or PlayStation. No Rockstar artwork or logos are used. Trophy names and descriptions are as PlayStation publishes them.

## License

MIT — see `LICENSE`.
