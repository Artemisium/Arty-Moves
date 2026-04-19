# Weekly Log Tab — Feature Spec

**Purpose.** Close the feedback loop between `Arty-Moves` (what's planned) and the Garmin pipeline (what actually happened). The Log tab is where Artem marks each session's status / RPE / notes on Sunday night, then exports the week as JSON for the `garmin_weekly_pull.py` script to consume.

**File touched:** `Arty-Moves Hub.html` — single-file React app with Babel standalone.

**Applied via:** `apply_log_tab.py` (idempotent patcher). Re-run safely after any regeneration of `Arty-Moves Hub.html` to re-apply the patch.

---

## What the patch adds

### 1. New tab in `TABS` array
```js
{ id: "log", label: "Weekly Log", icon: "📋" },
```
Appended after `rundev`. Becomes the 6th tab in both desktop top-nav and mobile bottom-nav (the existing tab-rendering code handles this automatically).

### 2. New case in `renderContent` switch
```js
if (tab === "log") return <WeeklyLog />;
```
Dispatches to the new component.

### 3. New `WeeklyLog` component + helpers
Injected right before `// ─── APP SHELL`. Includes:

- **`getIsoWeek(date)`** — computes `{ year, week }` per ISO 8601 week-numbering rules.
- **`getWeekInfo(offset = 0)`** — returns `{ id: "YYYY-Www", year, week, dates[7], start, end }` for the current week + `offset` weeks (negative = past).
- **`LOG_STATUS`** — 5 status chips: `completed` (green), `partial` (yellow), `missed` (red), `rest` (textMid), `swapped` (blue).
- **Parsers** for pulling structured data out of the display strings in `WEEK[]`, `D1`, `D2`:
  - `parseHrCeiling(targetStr)` → integer bpm (e.g. `"HR <150"` → `150`)
  - `parseWeightLbs(weightStr)` → float (e.g. `"315 lbs"` → `315.0`)
  - `parseDurationMin(durationStr)` → upper-bound minutes (e.g. `"30–40 min"` → `40`)
  - `parseSets(setsStr)` → integer (e.g. `"4×3→5×5"` → `4`)
  - `parseRepsTarget(setsStr)` → string after `×` (e.g. `"4×3→5×5"` → `"3→5×5"`)
- **`mapPlanEntry(weekEntry, date)`** — converts a `WEEK[i]` entry into a schema-v1 `plan[]` object. Handles run/longrun, strength (pulls full lift list from `D1` or `D2`), bike, flex.
- **`buildExportPayload(weekInfo, logData)`** — assembles the full JSON payload matching `base-phase-weekly-export-v1`.
- **`defaultLogData(weekInfo)`** — skeleton log state (all 7 days unlogged).
- **`WeeklyLog()`** — the component itself.

---

## Component UX

### Header bar
- `← [YYYY-Www] →` for week navigation. "Today" button appears when `weekOffset !== 0`.
- Shows ISO week id (e.g. `2026-W16`).

### Summary + export
- `N/7 sessions logged · start → end`
- `Export Week ↓` button — triggers JSON download to `~/Downloads/arty-moves-{week_id}.json`.

### Per-day card (7 cards, Mon→Sun)
Each card shows the planned session pulled from `WEEK[i]`:
- Day + date + icon + session name + target string (read-only, from plan)
- **Status chips** (tap to toggle): Done / Partial / Missed / Rest / Swapped
- **RPE slider** (0–10, 0 = unset)
- **Notes** free-text input

Changes autosave to `localStorage` under `arty-export-week-{week_id}`. Each week gets its own key — log data persists per week and doesn't blow away when navigating.

---

## Export schema — `base-phase-weekly-export-v1`

```json
{
  "schema_version": "base-phase-weekly-export-v1",
  "week_id": "2026-W16",
  "week_start": "2026-04-13",
  "week_end": "2026-04-19",
  "exported_at": "2026-04-19T21:30:00.000Z",
  "plan": [
    {
      "day": "Mon",
      "date": "2026-04-13",
      "type": "run",
      "session_name": "Easy Run",
      "framework_basis": "Daniels Phase I base + Uphill Athlete HR cap",
      "target": { "duration_min": 40, "hr_ceiling_bpm": 150, "notes": "5–6 km · HR <150" }
    },
    {
      "day": "Tue",
      "date": "2026-04-14",
      "type": "strength",
      "session_name": "D1 · Pull & Carry",
      "block_id": "D1",
      "framework_basis": "Viada concurrent ordering + Zatsiorsky W1→W3 rep accumulation",
      "target": {
        "session_name": "D1 · Pull & Carry",
        "lifts": [
          { "name": "Deadlift", "sets": 4, "reps_target": "3→5×5", "weight_lbs": 315, "tier": "compound", "note": "Ramp 135→225→275" },
          ...
        ],
        "finishers": [{ "text": "Sled Pull — 153 kg · 12.5m · 2 sets" }, ...]
      }
    },
    ...
  ],
  "reconciliation": [
    { "plan_day": "Mon", "plan_type": "run", "status": "completed", "adherence_notes": "" },
    ...
  ],
  "subjective_notes": [
    { "plan_day": "Mon", "rpe": 5, "felt": "legs heavy early, HR sat under 148", "flags": [] },
    ...
  ],
  "meta": { "phase": "base", "source_app": "arty-moves", "athlete": "Artem Kobelev" }
}
```

The Python script `garmin_weekly_pull.py` reads this file from `~/Downloads/arty-moves-*.json` and merges it with Garmin activity + wellness data to produce the final `Exports/YYYY-Www.json` used by the coaching skills.

---

## localStorage keys used

- `arty-hub-tab` — currently active tab id (existing, unchanged)
- `arty-climb-logs` — climbing session log (existing, unchanged)
- **`arty-export-week-{week_id}`** — new: per-week log data. One key per ISO week (e.g. `arty-export-week-2026-W16`).

---

## If the app gets regenerated

1. Run `python apply_log_tab.py` again — patcher will re-apply cleanly.
2. If the regenerated app has no `{ id: "rundev", ...}` in `TABS` (anchor changed), the patcher will error out loudly. Update the anchor strings at the top of `apply_log_tab.py`:
   - `TABS_ANCHOR` — last entry of `TABS` before our insertion
   - `SWITCH_ANCHOR` — last `if (tab === ...)` line before our insertion
   - `APP_SHELL_ANCHOR` — comment right before the App component

No other changes should be needed — the component is self-contained and only depends on globals that are always present (`WEEK`, `D1`, `D2`, `C`, `mono`, `space`, `Eyebrow`, `fmtDate`, `useState`, `useMemo`, `useEffect`).
