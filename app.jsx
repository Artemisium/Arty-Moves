// Arty-Moves app — browser-Babel version of workout-database.jsx
// (import stripped; useState/useMemo pulled from window.React)
const { useState, useMemo, useEffect } = React;

// ────────────────────────────────────────
// Themes — swap via Tweaks panel
// ────────────────────────────────────────
const THEMES = /*EDITMODE-BEGIN*/{
  "theme": "signal",
  "showMountain": true,
  "muscleScheme": "heat"
}/*EDITMODE-END*/;

const PALETTES = {
  // Signal — the original pastel green-on-black
  signal: {
    label: "Signal", bg: "#060608", surface: "#0c0c10",
    border: "#2a2a30", borderLight: "#3a3a42",
    accent: "#8af0c0", green: "#8af0c0", yellow: "#f0e68a", blue: "#8ac8f0",
    purple: "#c8a0f0", red: "#f08a8a", orange: "#f0b88a",
    text: "#d0d0d4", textMid: "#78787e", textDim: "#48484e",
    mountainTint: "rgba(138,240,192,0.06)",
  },
  // Cyan HUD — cool, high-tech, blueprint feel
  hud: {
    label: "HUD", bg: "#04070c", surface: "#0a0f18",
    border: "#1a2430", borderLight: "#2a3a4c",
    accent: "#6ff2ff", green: "#5cffb0", yellow: "#f8d76a", blue: "#6ff2ff",
    purple: "#a89cff", red: "#ff7a8a", orange: "#ffb870",
    text: "#e4f0ff", textMid: "#7a90a8", textDim: "#3d5068",
    mountainTint: "rgba(111,242,255,0.08)",
  },
  // Terminal Amber — phosphor CRT vibe
  amber: {
    label: "Amber", bg: "#0a0806", surface: "#120e0a",
    border: "#2a2218", borderLight: "#3e3020",
    accent: "#ffb347", green: "#e8d860", yellow: "#ffb347", blue: "#f0a070",
    purple: "#d8a068", red: "#ff7050", orange: "#ff9030",
    text: "#f5e6d0", textMid: "#8a7860", textDim: "#5a4830",
    mountainTint: "rgba(255,179,71,0.07)",
  },
  // Ion Magenta — cyberpunk race monitor
  ion: {
    label: "Ion", bg: "#05060d", surface: "#0c0d1a",
    border: "#222438", borderLight: "#363a56",
    accent: "#ff4fd8", green: "#58f0a8", yellow: "#ffd75c", blue: "#4fc8ff",
    purple: "#ff4fd8", red: "#ff4f7a", orange: "#ff944f",
    text: "#ece6ff", textMid: "#8a84b0", textDim: "#4a4668",
    mountainTint: "rgba(255,79,216,0.07)",
  },
  // Stealth — monochrome graphite, almost no chroma
  stealth: {
    label: "Stealth", bg: "#0a0a0b", surface: "#131315",
    border: "#22222a", borderLight: "#34343e",
    accent: "#e6e6ea", green: "#b8e8d0", yellow: "#e0dcb0", blue: "#b0d0e8",
    purple: "#d0c0e8", red: "#e8a8a8", orange: "#e8c8a8",
    text: "#f0f0f3", textMid: "#84848e", textDim: "#4a4a54",
    mountainTint: "rgba(255,255,255,0.04)",
  },
};

// C is rebound at runtime to the active palette
let C = PALETTES.signal;

const RACES = [
  { name: "Hyrox Singles Open Toronto", date: new Date("2026-10-04"), priority: "A", colorKey: "accent" },
  { name: "Toronto Waterfront Marathon", date: new Date("2026-10-18"), priority: "B", colorKey: "blue" },
];

const PHASES = {
  base: { label: "Base", color: C.green, dates: "Now → Jun 20", strengthFocus: "Max strength — heavy compounds, build to 405 DL", runFocus: "Frequency rebuild, aerobic base, easy volume" },
  build: { label: "Build", color: C.yellow, dates: "Jun 20 → Aug 15", strengthFocus: "Hyrox-specific, endurance sets — build to 225×20 squat", runFocus: "Hyrox run splits, tempo, threshold work" },
  peak: { label: "Peak", color: C.orange, dates: "Aug 15 → Sep 20", strengthFocus: "Race simulations, maintain strength", runFocus: "Race pace, sharpening" },
  taper: { label: "Taper", color: C.purple, dates: "Sep 20 → Oct 4", strengthFocus: "Volume reduction, neural priming", runFocus: "Volume cut 40-60%" },
  recovery: { label: "Recovery", color: C.blue, dates: "As needed", strengthFocus: "Light movement, mobility", runFocus: "Easy jogs or rest" },
};

const HYROX_FINISHERS = [
  { name: "Sled Push", proWeight: "202 kg", halfDist: "12.5m" },
  { name: "Sled Pull", proWeight: "153 kg", halfDist: "12.5m" },
  { name: "Burpee Broad Jump", proWeight: "BW", halfDist: "40m" },
  { name: "Farmers Carry", proWeight: "2×32 kg", halfDist: "100m" },
  { name: "Sandbag Lunges", proWeight: "30 kg", halfDist: "50m" },
  { name: "Wall Balls", proWeight: "9 kg", halfDist: "50 reps" },
];

function pickRandomFinishers(n = 2) {
  return [...HYROX_FINISHERS].sort(() => 0.5 - Math.random()).slice(0, n);
}

function applyWeek(exercise, week) {
  const e = { ...exercise };
  if (week === 4) {
    // Per-exercise deload override wins if present
    if (e.deload) {
      e.sets = e.deload.sets ?? e.sets;
      e.reps = e.deload.reps ?? e.baseReps;
      e.weight = e.deload.weight ?? (e.weight > 0 ? Math.round(e.weight * 0.7) : 0);
      if (e.deload.note) e.note = e.deload.note;
      e.isDeload = true;
      return e;
    }
    // Generic fallback
    e.weight = e.weight > 0 ? Math.round(e.weight * 0.7) : 0;
    e.sets = Math.max(e.sets - 1, 2);
    e.reps = e.baseReps;
    e.isDeload = true;
    return e;
  }
  // Per-week overrides (e.g. Deadlift sets 4/5/5, Bench 4×5→4×3→3×5)
  if (e.setsByWeek && e.setsByWeek[week - 1] != null) e.sets = e.setsByWeek[week - 1];
  if (e.repsByWeek && e.repsByWeek[week - 1] != null) {
    e.reps = e.repsByWeek[week - 1];
  } else if (week > 1) {
    const repSteps = e.topReps - e.baseReps;
    if (week === 2) e.reps = e.baseReps + Math.ceil(repSteps / 2);
    else if (week === 3) e.reps = e.topReps;
  }
  if (e.weightByWeek && e.weightByWeek[week - 1] != null) e.weight = e.weightByWeek[week - 1];
  return e;
}

function applyBlock(exercise, block) {
  const e = { ...exercise };
  if (block <= 1 || e.weight === 0) return e;
  e.weight = e.weight + (e.weightBump * (block - 1));
  return e;
}

function getBaseWorkouts(phase) {
  const wu = [
    { name: "Row 500m", note: "@ 2:00/500m easy" },
    { name: "SkiErg 500m", note: "@ 2:00/500m easy" },
    { name: "Mobility circuit", note: "" },
  ];

  if (phase === "base") return {
    d1: { label: "Pull & Carry", icon: "💪", warmup: wu, exercises: [
      { name: "Deadlift", sets: 4, reps: 3, baseReps: 3, topReps: 5, weight: 315, weightBump: 10, unit: "lbs",
        note: "Ramp 135 → 225 · 1×5 @ 275 bridge · then work sets @ 315",
        setsByWeek: [4, 5, 5], repsByWeek: [3, 4, 5], tier: "compound",
        deload: { sets: 3, reps: 5, weight: 225, note: "1×10 @ 135 warmup · then 3×5 @ 225" } },
      { name: "Overhead Press", sets: 4, reps: 5, baseReps: 5, topReps: 7, weight: 95, weightBump: 5, unit: "lbs",
        note: "", tier: "compound",
        deload: { sets: 3, reps: 5, weight: 75 } },
      { name: "Barbell Row", sets: 3, reps: 6, baseReps: 6, topReps: 8, weight: 135, weightBump: 5, unit: "lbs",
        note: "", tier: "accessory",
        deload: { sets: 3, reps: 8, weight: 115 } },
      { name: "Walking Lunges", sets: 3, reps: 10, baseReps: 10, topReps: 14, weight: 24, weightBump: 2, unit: "kg",
        note: "Each leg, 2×24 kg KBs", tier: "accessory",
        deload: { sets: 3, reps: 8, weight: 24 } },
    ], fixedFinishers: [
      { name: "Sled Pull", proWeight: "153 kg", halfDist: "12.5m" },
      { name: "Farmers Carry", proWeight: "2×32 kg", halfDist: "50m" },
    ], deloadFinisherNote: "Open weight"},
    d2: { label: "Push & Squat", icon: "🏋️", warmup: wu, exercises: [
      { name: "Bench Press", sets: 4, reps: 5, baseReps: 5, topReps: 5, weight: 135, weightBump: 5, unit: "lbs",
        note: "Ramp sets per week", tier: "compound",
        setsByWeek: [4, 4, 3], repsByWeek: [5, 3, 5], weightByWeek: [135, 155, 155],
        deload: { sets: 3, reps: 5, weight: 155, note: "1×10 @ 95 warmup · then 3×5 @ 155" } },
      { name: "Back Squat", sets: 4, reps: 3, baseReps: 3, topReps: 5, weight: 225, weightBump: 10, unit: "lbs",
        note: "Ramp 135 → 185", tier: "compound",
        setsByWeek: [4, 4, 4], repsByWeek: [3, 4, 5],
        deload: { sets: 4, reps: 3, weight: 225, note: "Same as W1 — neural maintenance" } },
      { name: "Weighted Chin-ups", sets: 3, reps: 5, baseReps: 5, topReps: 7, weight: 20, weightBump: 5, unit: "lbs",
        note: "+20 lbs", tier: "accessory",
        deload: { sets: 3, reps: 5, weight: 10, note: "+10 lbs" } },
      { name: "Weighted Dips", sets: 3, reps: 8, baseReps: 8, topReps: 10, weight: 20, weightBump: 5, unit: "lbs",
        note: "+20 lbs", tier: "accessory",
        deload: { sets: 3, reps: 8, weight: 10, note: "+10 lbs" } },
    ], fixedFinishers: [
      { name: "Sled Push", proWeight: "202 kg", halfDist: "12.5m" },
      { name: "Wall Balls", proWeight: "9 kg", halfDist: "25 reps" },
    ], deloadFinisherNote: "Open weight"},
  };

  if (phase === "build") return {
    push: { label: "Push — Endurance", icon: "🏋️", warmup: wu, exercises: [
      { name: "Bench Press", sets: 3, reps: 12, baseReps: 12, topReps: 15, weight: 135, weightBump: 10, unit: "lbs", note: "→ 185×15", tier: "compound" },
      { name: "Overhead Press", sets: 3, reps: 10, baseReps: 10, topReps: 12, weight: 85, weightBump: 5, unit: "lbs", note: "", tier: "compound" },
      { name: "Push-ups", sets: 3, reps: 25, baseReps: 25, topReps: 35, weight: 0, weightBump: 0, unit: "BW", note: "Minimal rest", tier: "accessory" },
      { name: "DB Shoulder Press", sets: 3, reps: 12, baseReps: 12, topReps: 15, weight: 35, weightBump: 5, unit: "lbs", note: "Each hand", tier: "accessory" },
    ]},
    pull: { label: "Pull — Endurance", icon: "💪", warmup: wu, exercises: [
      { name: "Deadlift", sets: 2, reps: 15, baseReps: 15, topReps: 20, weight: 225, weightBump: 10, unit: "lbs", note: "→ 275×20", tier: "compound" },
      { name: "Pull-ups", sets: 4, reps: 12, baseReps: 12, topReps: 20, weight: 0, weightBump: 0, unit: "BW", note: "→ 4×20", tier: "compound" },
      { name: "Barbell Row", sets: 3, reps: 12, baseReps: 12, topReps: 15, weight: 135, weightBump: 5, unit: "lbs", note: "", tier: "accessory" },
      { name: "DB Rows", sets: 3, reps: 15, baseReps: 15, topReps: 20, weight: 50, weightBump: 5, unit: "lbs", note: "Each hand", tier: "accessory" },
    ]},
    legs: { label: "Legs — Endurance", icon: "🦵", warmup: wu, exercises: [
      { name: "Back Squat", sets: 2, reps: 15, baseReps: 15, topReps: 20, weight: 185, weightBump: 10, unit: "lbs", note: "→ 225×20", tier: "compound" },
      { name: "Walking Lunges", sets: 3, reps: 15, baseReps: 15, topReps: 20, weight: 35, weightBump: 5, unit: "lbs", note: "Each leg, DBs", tier: "accessory" },
      { name: "Goblet Squat", sets: 3, reps: 15, baseReps: 15, topReps: 20, weight: 55, weightBump: 5, unit: "lbs", note: "", tier: "accessory" },
      { name: "Wall Sit", sets: 3, reps: 45, baseReps: 45, topReps: 60, weight: 0, weightBump: 0, unit: "sec", note: "", tier: "accessory" },
      { name: "Box Jumps", sets: 3, reps: 12, baseReps: 12, topReps: 15, weight: 0, weightBump: 0, unit: "BW", note: "24 inch", tier: "accessory" },
    ]},
  };

  return {
    full: { label: phase === "recovery" ? "Recovery" : "Race Prep", icon: phase === "recovery" ? "🧘" : "🏁", warmup: wu, exercises: phase === "recovery"
      ? [
        { name: "Goblet Squat", sets: 2, reps: 10, baseReps: 10, topReps: 10, weight: 35, weightBump: 0, unit: "lbs", note: "Light", tier: "accessory" },
        { name: "Band Pull-aparts", sets: 3, reps: 15, baseReps: 15, topReps: 15, weight: 0, weightBump: 0, unit: "BW", note: "", tier: "isolation" },
        { name: "Dead Bugs", sets: 3, reps: 10, baseReps: 10, topReps: 10, weight: 0, weightBump: 0, unit: "BW", note: "Each side", tier: "isolation" },
      ] : [
        { name: "Deadlift", sets: 3, reps: 3, baseReps: 3, topReps: 3, weight: 335, weightBump: 0, unit: "lbs", note: "Maintain", tier: "compound" },
        { name: "Back Squat", sets: 3, reps: 3, baseReps: 3, topReps: 3, weight: 225, weightBump: 0, unit: "lbs", note: "Maintain", tier: "compound" },
        { name: "Bench Press", sets: 3, reps: 5, baseReps: 5, topReps: 5, weight: 165, weightBump: 0, unit: "lbs", note: "Maintain", tier: "compound" },
        { name: "Weighted Chin-ups", sets: 3, reps: 5, baseReps: 5, topReps: 5, weight: 45, weightBump: 0, unit: "lbs", note: "Maintain", tier: "compound" },
      ]
    },
  };
}

function Pill({ children, color = C.accent, active = false, onClick }) {
  return (<button onClick={onClick} style={{ padding: "5px 12px", border: `1px solid ${active ? color : C.border}`, background: active ? `${color}15` : "transparent", cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 10, color: active ? color : C.textDim, textTransform: "uppercase", letterSpacing: 1.5 }}>{children}</button>);
}

function WeekPill({ week, activeWeek, onClick }) {
  const isDeload = week === 4;
  const color = isDeload ? C.blue : week === 1 ? C.textMid : C.green;
  const active = activeWeek === week;
  const labels = { 1: "Baseline", 2: "+Reps", 3: "Top Set", 4: "Deload" };
  return (<button onClick={() => onClick(week)} style={{ flex: 1, padding: "10px 8px", border: `1px solid ${active ? color : C.border}`, background: active ? `${color}15` : "transparent", cursor: "pointer", textAlign: "center" }}>
    <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 16, color: active ? color : C.textDim }}>W{week}</p>
    <p style={{ margin: "2px 0 0", fontFamily: "'DM Mono', monospace", fontSize: 8, color: active ? color : C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>{labels[week]}</p>
  </button>);
}

// Stepper button used in set logging rows
function Step({ children, color = C.textMid, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 26, height: 26, padding: 0,
        border: `1px solid ${disabled ? C.border : color + "55"}`,
        background: "transparent",
        cursor: disabled ? "default" : "pointer",
        fontFamily: "'DM Mono', monospace", fontSize: 12,
        color: disabled ? C.textDim : color,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}
    >{children}</button>
  );
}

// ─────────────────────────────────────────────────────────────
// ActiveSet — one set at a time, symmetric rep / weight columns
// ─────────────────────────────────────────────────────────────
function Column({ label, valueColor, children }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <span style={{
        fontFamily: "'DM Mono', monospace", fontSize: 8,
        color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5,
      }}>{label}</span>
      {children}
    </div>
  );
}

function ActiveSet({ idx, total, target, log, onUpdate, onLog, unit }) {
  const reps = log?.reps ?? target.reps;
  const weight = log?.weight ?? target.weight;
  const hasWeight = target.weight > 0;
  const repDelta = reps - target.reps;
  const wDelta = weight - target.weight;

  const stepBtn = (content, onClick, color) => (
    <button onClick={onClick} style={{
      width: 36, height: 36, padding: 0,
      border: `1px solid ${color}55`, background: "transparent",
      cursor: "pointer",
      fontFamily: "'DM Mono', monospace", fontSize: 13,
      color, display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>{content}</button>
  );

  const value = (val, unitStr, delta) => (
    <div style={{
      minWidth: 62, textAlign: "center",
      fontFamily: "'Space Mono', monospace", fontSize: 22, lineHeight: 1,
      color: delta === 0 ? C.text : (delta > 0 ? C.green : C.blue),
    }}>
      {val}
      <span style={{ fontSize: 9, color: C.textDim, marginLeft: 3, letterSpacing: 1, textTransform: "uppercase" }}>{unitStr}</span>
    </div>
  );

  return (
    <div style={{ border: `1px solid ${C.borderLight}`, padding: "12px 10px", marginTop: 8 }}>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.accent, textTransform: "uppercase", letterSpacing: 1.5 }}>
          Set {idx + 1} <span style={{ color: C.textDim }}>/ {total}</span>
        </span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: C.textDim, letterSpacing: 1, textTransform: "uppercase" }}>
          Target {target.reps}{hasWeight ? ` · ${target.weight} ${unit}` : ""}
        </span>
      </div>

      {/* two symmetric columns */}
      <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
        <Column label="Reps">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {stepBtn("−", () => onUpdate({ reps: Math.max(0, reps - 1) }), C.blue)}
            {value(reps, "rep", repDelta)}
            {stepBtn("+", () => onUpdate({ reps: reps + 1 }), C.green)}
          </div>
        </Column>

        {hasWeight && <div style={{ width: 1, background: C.border, margin: "0 4px" }} />}

        {hasWeight && (
          <Column label="Weight">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {stepBtn("−5", () => onUpdate({ weight: Math.max(0, weight - 5) }), C.blue)}
              {value(weight, unit, wDelta)}
              {stepBtn("+5", () => onUpdate({ weight: weight + 5 }), C.green)}
            </div>
          </Column>
        )}
      </div>

      {/* log button — full-width, cohesive with brand */}
      <button
        onClick={onLog}
        style={{
          width: "100%", marginTop: 12, padding: "10px 12px",
          border: `1px solid ${C.green}`, background: `${C.green}15`,
          cursor: "pointer",
          fontFamily: "'Space Mono', monospace", fontSize: 12,
          color: C.green, letterSpacing: 1.5, textTransform: "uppercase",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <span>Log Set {idx + 1}</span>
        <span style={{ fontSize: 14 }}>✓</span>
      </button>
    </div>
  );
}

// ──────────────────────────────────────────
// Date helpers + workout-type color map
// ──────────────────────────────────────────
function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function startOfWeek(d) {
  // Monday = 0 .. Sunday = 6
  const day = (d.getDay() + 6) % 7;
  const r = new Date(d);
  r.setDate(r.getDate() - day);
  r.setHours(0, 0, 0, 0);
  return r;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Color mapping for workout keys (palette.<key>)
const WORKOUT_COLOR_KEY = {
  push: "purple",
  pull: "blue",
  legs: "orange",
  full: "green",
  d1: "blue",    // Base Day 1 — Pull & Carry
  d2: "purple",  // Base Day 2 — Push & Squat
};

const DOW_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

// Pill({ children, color = C.accent, active = false, onClick }) already exists below

function ExerciseRow({ baseEx, weekEx, sets, lastWeek, onUpdateSet, onToggleSetLog, muscleScheme = "heat" }) {
  const weightDisplay = weekEx.weight > 0 ? `${weekEx.weight} ${weekEx.unit}` : weekEx.unit;
  const repChanged = weekEx.reps !== baseEx.reps;
  const weightChanged = weekEx.weight !== baseEx.weight;
  const setChanged = weekEx.sets !== baseEx.sets;
  const isDeload = weekEx.weight < baseEx.weight;
  const tierColors = { compound: C.accent, accessory: C.yellow, isolation: C.textDim };
  const loggedCount = sets.filter(s => s.logged).length;
  const allDone = loggedCount === weekEx.sets;

  return (<div style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 4, gap: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 14, color: allDone ? C.green : C.text }}>{weekEx.name}</p>
        <div style={{ display: "flex", gap: 6, marginTop: 2, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: tierColors[weekEx.tier], border: `1px solid ${tierColors[weekEx.tier]}33`, padding: "0px 4px", textTransform: "uppercase", letterSpacing: 1 }}>{weekEx.tier}</span>
          {weekEx.note && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim }}>{weekEx.note}</span>}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
        {typeof MuscleMap !== "undefined" && (
          <MuscleMap exercise={weekEx.name} scheme={muscleScheme} size={56} />
        )}
        <span style={{
          fontFamily: "'DM Mono', monospace", fontSize: 9,
          color: allDone ? C.green : (loggedCount > 0 ? C.yellow : C.textDim),
          border: `1px solid ${(allDone ? C.green : loggedCount > 0 ? C.yellow : C.textDim)}33`,
          padding: "1px 6px", letterSpacing: 1,
        }}>{loggedCount}/{weekEx.sets}</span>
      </div>
    </div>
    <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 6, flexWrap: "wrap" }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>Target</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: repChanged ? C.green : C.accent }}>
          {weekEx.sets}×{weekEx.reps}
        </span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, color: weightChanged ? (isDeload ? C.blue : C.green) : C.text }}>
          {weightDisplay}
        </span>
      </div>
      {lastWeek && (
        <>
          <span style={{ color: C.border, fontSize: 11 }}>│</span>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>Last wk</span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: C.textMid }}>
              {lastWeek.length}×{Math.max(...lastWeek.map(s => s.reps))}
            </span>
            {weekEx.weight > 0 && (
              <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: C.textMid }}>
                {Math.max(...lastWeek.map(s => s.weight))} {weekEx.unit}
              </span>
            )}
          </div>
        </>
      )}
    </div>
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 6 }}>
      {(repChanged || weightChanged || setChanged) && (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: isDeload ? C.blue : C.green, border: `1px solid ${isDeload ? C.blue : C.green}33`, padding: "1px 6px" }}>
          {isDeload ? "↓ " : "↑ "}
          {repChanged && `${weekEx.reps > baseEx.reps ? "+" : ""}${weekEx.reps - baseEx.reps}rep `}
          {weightChanged && `${weekEx.weight > baseEx.weight ? "+" : ""}${weekEx.weight - baseEx.weight}lbs `}
          {setChanged && `${weekEx.sets - baseEx.sets}set`}
        </span>
      )}
    </div>

    {/* Logged-set history: small stamped lines */}
    {sets.some(s => s.logged) && (
      <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 2 }}>
        {sets.map((s, i) => s.logged && (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 8,
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            color: C.textMid,
          }}>
            <span style={{ color: C.green, width: 10 }}>✓</span>
            <span style={{ color: C.textDim, width: 18 }}>S{i + 1}</span>
            <span style={{ color: C.text }}>{s.reps}<span style={{ color: C.textDim }}> rep</span></span>
            {weekEx.weight > 0 && (
              <span style={{ color: C.text }}>{s.weight}<span style={{ color: C.textDim }}> {weekEx.unit}</span></span>
            )}
            {(s.reps !== weekEx.reps || s.weight !== weekEx.weight) && (
              <span style={{ color: s.reps > weekEx.reps || s.weight > weekEx.weight ? C.green : C.blue, fontSize: 9 }}>
                {s.reps !== weekEx.reps ? `${s.reps > weekEx.reps ? "+" : ""}${s.reps - weekEx.reps}r ` : ""}
                {s.weight !== weekEx.weight ? `${s.weight > weekEx.weight ? "+" : ""}${s.weight - weekEx.weight}` : ""}
              </span>
            )}
          </div>
        ))}
      </div>
    )}

    {/* Active set — one at a time */}
    {!allDone && (() => {
      const nextIdx = sets.findIndex(s => !s.logged);
      const ni = nextIdx === -1 ? 0 : nextIdx;
      return (
        <ActiveSet
          idx={ni}
          total={weekEx.sets}
          target={{ reps: weekEx.reps, weight: weekEx.weight }}
          log={sets[ni]}
          unit={weekEx.unit}
          onUpdate={(patch) => onUpdateSet(ni, patch)}
          onLog={() => onToggleSetLog(ni)}
        />
      );
    })()}

    {allDone && (
      <div style={{
        marginTop: 8, padding: "8px 10px",
        border: `1px solid ${C.green}33`, background: `${C.green}10`,
        fontFamily: "'DM Mono', monospace", fontSize: 10,
        color: C.green, letterSpacing: 1, textTransform: "uppercase",
        textAlign: "center",
      }}>
        All {weekEx.sets} sets logged
      </div>
    )}

    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
      <div style={{ flex: 1, height: 3, border: `1px solid ${C.border}`, position: "relative" }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${((weekEx.reps - weekEx.baseReps) / Math.max(weekEx.topReps - weekEx.baseReps, 1)) * 100}%`,
          background: `${C.green}55`, borderRight: `1px solid ${C.green}`,
        }} />
      </div>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: C.textDim, flexShrink: 0 }}>
        {weekEx.baseReps}→{weekEx.topReps}
      </span>
    </div>
  </div>);
}

function FinisherCard({ finisher, log, onToggleSet, numSets = 2, deloadNote }) {
  const done = log || {};
  const doneCount = Array.from({ length: numSets }).filter((_, i) => done[i]).length;
  const allDone = doneCount === numSets;
  return (<div style={{
    padding: "10px 12px",
    border: `1px solid ${allDone ? C.green : C.orange}33`,
    borderLeft: `2px solid ${allDone ? C.green : C.orange}`,
    background: allDone ? `${C.green}08` : "transparent",
    marginBottom: 4,
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: allDone ? C.green : C.orange }}>{finisher.name}</span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textDim }}>{finisher.halfDist}</span>
    </div>
    <p style={{ margin: "2px 0 6px", fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textDim }}>
      {deloadNote ? <span style={{ color: C.blue }}>{deloadNote}</span> : <>Pro weight: {finisher.proWeight}</>}
    </p>
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: numSets }).map((_, i) => (
        <button key={i} onClick={() => onToggleSet && onToggleSet(i)} style={{
          flex: 1, padding: "6px 4px",
          border: `1px solid ${done[i] ? C.green : C.border}`,
          background: done[i] ? `${C.green}15` : "transparent",
          cursor: "pointer",
          fontFamily: "'DM Mono', monospace", fontSize: 10,
          color: done[i] ? C.green : C.textMid,
          letterSpacing: 1, textTransform: "uppercase",
        }}>{done[i] ? "✓ " : ""}Set {i + 1}</button>
      ))}
    </div>
  </div>);
}

function WeekCalendar({ workoutLogs, phaseColorMap, onSelectDate, selectedDate, weekOffset, setWeekOffset, hideNav }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const base = startOfWeek(today);
  base.setDate(base.getDate() + weekOffset * 7);
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i);
    return d;
  });
  const monthLabel = (() => {
    const first = days[0], last = days[6];
    if (first.getMonth() === last.getMonth()) return first.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    return `${first.toLocaleDateString("en-US", { month: "short" })} → ${last.toLocaleDateString("en-US", { month: "short" })}`;
  })();

  return (
    <div>
      {!hideNav && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <button onClick={() => setWeekOffset(w => w - 1)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMid, fontFamily: "'DM Mono', monospace", fontSize: 12, padding: "0 4px" }}>←</button>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5 }}>
            {weekOffset === 0 ? "This week" : weekOffset === -1 ? "Last week" : weekOffset === 1 ? "Next week" : monthLabel}
          </span>
          <button onClick={() => setWeekOffset(w => w + 1)} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMid, fontFamily: "'DM Mono', monospace", fontSize: 12, padding: "0 4px" }}>→</button>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
        {days.map((d, i) => {
          const ds = fmtDate(d);
          const log = workoutLogs[ds];
          const isToday = isSameDay(d, today);
          const isSelected = selectedDate && isSameDay(d, parseDate(selectedDate));
          const isFuture = d > today;
          const color = log ? C[log.colorKey] || C.accent : null;
          return (
            <button
              key={i}
              onClick={() => onSelectDate && onSelectDate(ds)}
              disabled={isFuture && !onSelectDate}
              style={{
                aspectRatio: "1 / 1",
                border: `1px solid ${isSelected ? C.accent : color ? `${color}55` : isToday ? C.borderLight : C.border}`,
                background: isSelected ? `${C.accent}1a` : color ? `${color}18` : "transparent",
                cursor: onSelectDate ? (isFuture ? "default" : "pointer") : "default",
                padding: 2,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Mono', monospace",
                opacity: isFuture ? 0.35 : 1,
                position: "relative",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span style={{ fontSize: 8, color: isSelected ? C.accent : color || (isToday ? C.text : C.textDim), letterSpacing: 1 }}>{DOW_LABELS[i]}</span>
              <span style={{ fontSize: 13, color: isSelected ? C.accent : color || (isToday ? C.text : C.textMid), fontFamily: "'Space Mono', monospace" }}>{d.getDate()}</span>
              {log && <span style={{ fontSize: 9, lineHeight: 1, marginTop: 1 }}>{log.icon}</span>}
              {isToday && !log && !isSelected && <span style={{ position: "absolute", top: 2, right: 3, width: 3, height: 3, background: C.accent, borderRadius: "50%" }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PhaseLegend({ phase, templates, mode }) {
  // Only strength mode has templates with keys
  if (mode !== "strength" || !templates) return null;
  const entries = Object.entries(templates).map(([key, w]) => {
    const colorKey = key === "full"
      ? (phase === "recovery" ? "blue" : "orange")
      : (WORKOUT_COLOR_KEY[key] || "accent");
    return { key, label: w.label, icon: w.icon, color: C[colorKey] };
  });
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
      {entries.map((e) => (
        <div key={e.key} style={{ display: "flex", alignItems: "center", gap: 4, padding: "2px 6px", border: `1px solid ${e.color}33`, background: `${e.color}0d` }}>
          <span style={{ width: 6, height: 6, background: e.color, display: "inline-block" }} />
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMid, letterSpacing: 1 }}>
            {e.icon} {e.label.toUpperCase()}
          </span>
        </div>
      ))}
    </div>
  );
}

function DatePickerPopover({ workoutLogs, selectedDate, onSelectDate, onClose }) {
  const [wo, setWo] = useState(0);
  return (
    <div style={{
      position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 20,
      background: C.surface, border: `1px solid ${C.borderLight}`, padding: 12,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5 }}>Pick date</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 14, lineHeight: 1 }}>×</button>
      </div>
      <WeekCalendar
        workoutLogs={workoutLogs}
        selectedDate={selectedDate}
        onSelectDate={onSelectDate}
        weekOffset={wo}
        setWeekOffset={setWo}
      />
      <button
        onClick={() => { onSelectDate(fmtDate(new Date())); setWo(0); }}
        style={{ marginTop: 8, width: "100%", background: "none", border: `1px solid ${C.border}`, color: C.textMid, fontFamily: "'DM Mono', monospace", fontSize: 10, padding: "6px 8px", cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" }}
      >
        Today
      </button>
    </div>
  );
}

function LogWorkoutPanel({ workoutKey, workout, phase, block, week, workoutLogs, onLog, onRemove }) {
  const [showPicker, setShowPicker] = useState(false);
  const [pickedDate, setPickedDate] = useState(null); // null = will use today
  const colorKey = workoutKey === "full"
    ? (phase === "recovery" ? "blue" : "orange")
    : (WORKOUT_COLOR_KEY[workoutKey] || "accent");
  const color = C[colorKey];

  const effectiveDate = pickedDate || fmtDate(new Date());
  const existing = workoutLogs[effectiveDate];
  const alreadyLoggedSame = existing && existing.workoutKey === workoutKey && existing.phase === phase && existing.block === block && existing.week === week;

  function handleLog() {
    onLog(effectiveDate, workoutKey, {
      label: workout.label,
      icon: workout.icon,
      colorKey,
      phase, block, week,
    });
    setPickedDate(null);
    setShowPicker(false);
  }

  const displayDate = (() => {
    const d = parseDate(effectiveDate);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    if (isSameDay(d, today)) return "Today";
    const y = new Date(today); y.setDate(y.getDate() - 1);
    if (isSameDay(d, y)) return "Yesterday";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  })();

  return (
    <div style={{ marginTop: 20, padding: 14, border: `1px solid ${color}33`, borderLeft: `2px solid ${color}`, position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, letterSpacing: 1.5, textTransform: "uppercase" }}>Log session</span>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMid }}>
          {workout.icon} {workout.label}
        </span>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: alreadyLoggedSame ? 8 : 0, alignItems: "stretch" }}>
        <button
          onClick={() => setShowPicker(s => !s)}
          style={{
            flex: "0 0 auto", padding: "8px 10px",
            border: `1px solid ${pickedDate ? color : C.border}`,
            background: pickedDate ? `${color}12` : "transparent",
            color: pickedDate ? color : C.textMid,
            fontFamily: "'DM Mono', monospace", fontSize: 10,
            letterSpacing: 1, textTransform: "uppercase", cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          📅 {displayDate}
        </button>
        <button
          onClick={handleLog}
          style={{
            flex: 1, padding: "8px 12px",
            border: `1px solid ${color}`,
            background: `${color}18`,
            color: color,
            fontFamily: "'Space Mono', monospace", fontSize: 13,
            letterSpacing: 1, cursor: "pointer",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          {alreadyLoggedSame ? "✓ Re-log" : "Log workout →"}
        </button>
      </div>

      {alreadyLoggedSame && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim }}>
          <span>Logged {displayDate.toLowerCase()}</span>
          <button onClick={() => onRemove(effectiveDate)} style={{ background: "none", border: "none", color: C.red, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 9, padding: 0, letterSpacing: 1 }}>remove</button>
        </div>
      )}

      {showPicker && (
        <DatePickerPopover
          workoutLogs={workoutLogs}
          selectedDate={pickedDate}
          onSelectDate={(ds) => {
            const today = fmtDate(new Date());
            setPickedDate(ds === today ? null : ds);
            setShowPicker(false);
          }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

function ArtyMovesApp() {
  const [theme, setTheme] = useState(THEMES.theme || "signal");
  const [showMountain, setShowMountain] = useState(THEMES.showMountain !== false);
  const [muscleScheme, setMuscleScheme] = useState(THEMES.muscleScheme || "heat");
  const [showTweaks, setShowTweaks] = useState(false);

  // Rebind C at every render so every component below sees the active palette
  C = PALETTES[theme] || PALETTES.signal;

  useEffect(() => {
    function onMsg(e) {
      if (e.data?.type === "__activate_edit_mode") setShowTweaks(true);
      if (e.data?.type === "__deactivate_edit_mode") setShowTweaks(false);
    }
    window.addEventListener("message", onMsg);
    window.parent.postMessage({ type: "__edit_mode_available" }, "*");
    return () => window.removeEventListener("message", onMsg);
  }, []);

  function applyTheme(t) {
    setTheme(t);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { theme: t } }, "*");
  }
  function applyMountain(v) {
    setShowMountain(v);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { showMountain: v } }, "*");
  }
  function applyMuscleScheme(v) {
    setMuscleScheme(v);
    window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { muscleScheme: v } }, "*");
  }

  const [mode, setMode] = useState("strength");
  const [phase, setPhase] = useState("base");
  const [week, setWeek] = useState(1);
  const [block, setBlock] = useState(1);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [finishers, setFinishers] = useState({});
  // logs[workoutKey][exerciseIdx][setIdx] = { reps, weight, logged }
  const [logs, setLogs] = useState(() => {
    try {
      const raw = localStorage.getItem("arty-detailed-logs");
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  });
  // finisherLogs[phase/block/week][workoutKey][finisherIdx][setIdx] = true
  const [finisherLogs, setFinisherLogs] = useState(() => {
    try {
      const raw = localStorage.getItem("arty-finisher-logs");
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  });

  // workoutLogs[YYYY-MM-DD] = { workoutKey, label, icon, colorKey, phase, block, week, loggedAt }
  const [workoutLogs, setWorkoutLogs] = useState(() => {
    try {
      const raw = localStorage.getItem("arty-workout-logs");
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  });

  useEffect(() => {
    try { localStorage.setItem("arty-workout-logs", JSON.stringify(workoutLogs)); } catch (e) {}
  }, [workoutLogs]);

  useEffect(() => {
    try { localStorage.setItem("arty-detailed-logs", JSON.stringify(logs)); } catch (e) {}
  }, [logs]);

  useEffect(() => {
    try { localStorage.setItem("arty-finisher-logs", JSON.stringify(finisherLogs)); } catch (e) {}
  }, [finisherLogs]);

  function logWorkoutForDate(dateStr, workoutKey, meta) {
    setWorkoutLogs(prev => ({
      ...prev,
      [dateStr]: { workoutKey, ...meta, loggedAt: Date.now() },
    }));
  }

  function removeWorkoutLog(dateStr) {
    setWorkoutLogs(prev => {
      const next = { ...prev };
      delete next[dateStr];
      return next;
    });
  }

  // Calendar strip navigation state
  const [calWeekOffset, setCalWeekOffset] = useState(0);

  function getLastWeekSets(wKey, exIdx) {
    if (week <= 1) return null;
    const key = `${phase}/${block}/${week - 1}`;
    const exLogs = logs[key]?.[wKey]?.[exIdx] || [];
    const logged = exLogs.filter(s => s && s.logged);
    if (logged.length === 0) return null;
    return logged;
  }

  function logKey() { return `${phase}/${block}/${week}`; }

  function getSets(wKey, exIdx, targetSets, targetReps, targetWeight) {
    const key = logKey();
    const exLogs = logs[key]?.[wKey]?.[exIdx] || [];
    return Array.from({ length: targetSets }).map((_, i) => exLogs[i] || { reps: targetReps, weight: targetWeight, logged: false });
  }

  function updateSet(wKey, exIdx, setIdx, patch) {
    const key = logKey();
    setLogs(prev => {
      const cur = JSON.parse(JSON.stringify(prev));
      cur[key] = cur[key] || {};
      cur[key][wKey] = cur[key][wKey] || {};
      cur[key][wKey][exIdx] = cur[key][wKey][exIdx] || [];
      const ex = workouts[wKey].exercises[exIdx];
      const existing = cur[key][wKey][exIdx][setIdx] || { reps: ex.reps, weight: ex.weight, logged: false };
      cur[key][wKey][exIdx][setIdx] = { ...existing, ...patch };
      return cur;
    });
  }

  function toggleSetLog(wKey, exIdx, setIdx) {
    const key = logKey();
    setLogs(prev => {
      const cur = JSON.parse(JSON.stringify(prev));
      cur[key] = cur[key] || {};
      cur[key][wKey] = cur[key][wKey] || {};
      cur[key][wKey][exIdx] = cur[key][wKey][exIdx] || [];
      const ex = workouts[wKey].exercises[exIdx];
      const existing = cur[key][wKey][exIdx][setIdx] || { reps: ex.reps, weight: ex.weight, logged: false };
      cur[key][wKey][exIdx][setIdx] = { ...existing, logged: !existing.logged };
      return cur;
    });
  }

  function getFinisherLog(wKey, fIdx) {
    const key = logKey();
    return finisherLogs[key]?.[wKey]?.[fIdx] || {};
  }

  function toggleFinisherSet(wKey, fIdx, setIdx) {
    const key = logKey();
    setFinisherLogs(prev => {
      const cur = JSON.parse(JSON.stringify(prev));
      cur[key] = cur[key] || {};
      cur[key][wKey] = cur[key][wKey] || {};
      cur[key][wKey][fIdx] = cur[key][wKey][fIdx] || {};
      cur[key][wKey][fIdx][setIdx] = !cur[key][wKey][fIdx][setIdx];
      return cur;
    });
  }

  const now = new Date();
  const phaseInfo = PHASES[phase];
  const templates = useMemo(() => getBaseWorkouts(phase), [phase]);

  const workouts = useMemo(() => {
    const result = {};
    Object.entries(templates).forEach(([key, w]) => {
      result[key] = {
        ...w,
        exercises: w.exercises.map(ex => {
          const blocked = applyBlock(ex, block);
          return applyWeek(blocked, week);
        }),
        finishers: w.fixedFinishers || finishers[key] || pickRandomFinishers(2),
        hasFixedFinishers: !!w.fixedFinishers,
      };
    });
    return result;
  }, [templates, week, block, phase, finishers]);

  const baseForDiff = useMemo(() => {
    const result = {};
    Object.entries(templates).forEach(([key, w]) => {
      result[key] = {
        ...w,
        exercises: w.exercises.map(ex => applyBlock(ex, block)),
      };
    });
    return result;
  }, [templates, block]);

  function nextBlock() { setBlock(b => b + 1); setWeek(1); }
  function prevBlock() { if (block > 1) { setBlock(b => b - 1); setWeek(1); } }
  function resetBlocks() { setBlock(1); setWeek(1); setActiveWorkout(null); setFinishers({}); }

  return (
    <div style={{ width: "100%", maxWidth: 430, margin: "0 auto", minHeight: "100%", background: C.bg, position: "relative" }}>
      {showMountain && (
        <>
          <div style={{
            position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
            backgroundImage: "url(assets/mountains-wireframe.webp)",
            backgroundSize: "cover", backgroundPosition: "center 30%",
            backgroundRepeat: "no-repeat",
            opacity: 0.35, mixBlendMode: "screen",
          }} />
          <div style={{
            position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
            background: `linear-gradient(180deg, ${C.bg}40 0%, ${C.bg}cc 45%, ${C.bg} 75%)`,
          }} />
          <div style={{
            position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
            background: C.mountainTint,
            mixBlendMode: "overlay",
          }} />
        </>
      )}
      <div style={{ position: "relative", zIndex: 1, padding: "56px 16px 40px" }}>
        <div style={{ marginBottom: 20 }}>
          {RACES.map((race, i) => {
            const days = Math.ceil((race.date - now) / 86400000);
            return (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 11, color: C[race.colorKey] }}>{race.name}</p>
                <p style={{ margin: "2px 0 0", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim }}>{race.date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })} · {race.priority} Race</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 20, color: C[race.colorKey], lineHeight: 1 }}>{days}</p>
                <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim }}>days ({Math.round(days / 7)}w)</p>
              </div>
            </div>);
          })}
        </div>

        {/* Weekly calendar strip */}
        <div style={{ marginBottom: 16, padding: "10px 12px", border: `1px solid ${C.border}` }}>
          <WeekCalendar
            workoutLogs={workoutLogs}
            weekOffset={calWeekOffset}
            setWeekOffset={setCalWeekOffset}
          />
          <PhaseLegend phase={phase} templates={templates} mode={mode} />
        </div>

        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          <Pill active={mode === "strength"} color={C.purple} onClick={() => { setMode("strength"); setActiveWorkout(null); }}>Strength</Pill>
          <Pill active={mode === "run"} color={C.green} onClick={() => { setMode("run"); setActiveWorkout(null); }}>Run</Pill>
        </div>

        <div style={{ marginBottom: 12 }}>
          <p style={{ margin: "0 0 6px", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5 }}>Phase</p>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {Object.entries(PHASES).map(([key, p]) => (<Pill key={key} active={phase === key} color={p.color} onClick={() => { setPhase(key); resetBlocks(); }}>{p.label}</Pill>))}
          </div>
        </div>

        <div style={{ padding: 12, border: `1px solid ${C.border}`, borderLeft: `2px solid ${phaseInfo.color}`, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: phaseInfo.color }}>{phaseInfo.label} Phase</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim }}>{phaseInfo.dates}</span>
          </div>
          <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMid, lineHeight: 1.5 }}>{mode === "strength" ? phaseInfo.strengthFocus : phaseInfo.runFocus}</p>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: `1px solid ${C.border}`, marginBottom: 8 }}>
          <button onClick={prevBlock} disabled={block <= 1} style={{ background: "none", border: `1px solid ${block > 1 ? C.accent : C.border}33`, cursor: block > 1 ? "pointer" : "default", fontFamily: "'DM Mono', monospace", fontSize: 12, color: block > 1 ? C.accent : C.textDim, padding: "4px 10px" }}>←</button>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 18, color: C.accent }}>Block {block}</p>
            <p style={{ margin: "2px 0 0", fontFamily: "'DM Mono', monospace", fontSize: 8, color: C.textDim, textTransform: "uppercase", letterSpacing: 1 }}>
              {block === 1 ? "Starting weights" : `+${block - 1} weight bumps from baseline`}
            </p>
          </div>
          <button onClick={nextBlock} style={{ background: "none", border: `1px solid ${C.green}33`, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.green, padding: "4px 10px" }}>→ Next</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 6px", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5 }}>Week</p>
          <div style={{ display: "flex", gap: 4 }}>{[1, 2, 3, 4].map(w => <WeekPill key={w} week={w} activeWeek={week} onClick={setWeek} />)}</div>
          {week === 1 && <p style={{ margin: "6px 0 0", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMid }}>Base reps @ block {block} weight</p>}
          {week === 2 && <p style={{ margin: "6px 0 0", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.green }}>↑ Earning reps — midway to top set</p>}
          {week === 3 && <p style={{ margin: "6px 0 0", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.green }}>↑ Top set — hit all target reps, earn the weight bump</p>}
          {week === 4 && <p style={{ margin: "6px 0 0", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.blue }}>↓ Deload: 70% weight, −1 set — recover for next block</p>}
        </div>

        {mode === "strength" && !activeWorkout && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <p style={{ margin: "0 0 10px", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5 }}>Choose Workout</p>
            {Object.entries(workouts).map(([key, w]) => (
              <button key={key} onClick={() => setActiveWorkout(key)} style={{ width: "100%", padding: "16px", border: `1px solid ${C.border}`, borderLeft: `2px solid ${C.purple}44`, background: "transparent", cursor: "pointer", textAlign: "left", marginBottom: 4, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: C.text }}>{w.icon} {w.label}</span>
                  <p style={{ margin: "4px 0 0", fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textDim }}>{w.exercises.length} exercises · {w.finishers?.length || 0} finishers</p>
                </div>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: C.textDim }}>→</span>
              </button>
            ))}
          </div>
        )}

        {mode === "strength" && activeWorkout && workouts[activeWorkout] && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <button onClick={() => setActiveWorkout(null)} style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 0", marginBottom: 8 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.accent }}>← back</span>
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h2 style={{ fontFamily: "'Space Mono', monospace", fontSize: 18, color: C.text, margin: 0, fontWeight: 400 }}>{workouts[activeWorkout].icon} {workouts[activeWorkout].label}</h2>
              <div style={{ display: "flex", gap: 4 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.purple, border: `1px solid ${C.purple}33`, padding: "2px 6px", textTransform: "uppercase", letterSpacing: 1 }}>B{block}</span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: week === 4 ? C.blue : week === 1 ? C.textMid : C.green, border: `1px solid ${week === 4 ? C.blue : C.accent}33`, padding: "2px 6px", textTransform: "uppercase", letterSpacing: 1 }}>
                  W{week} {week === 4 ? "deload" : week === 3 ? "top set" : week === 2 ? "+reps" : "base"}
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 8 }}>
              <p style={{ margin: "0 0 8px", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>Warmup</p>
              {workouts[activeWorkout].warmup.map((w, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.textMid }}>{w.name}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textDim }}>{w.note}</span>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 8 }}>
              <p style={{ margin: "0 0 4px", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>Working Sets</p>
              {workouts[activeWorkout].exercises.map((ex, i) => (
                <ExerciseRow
                  key={i}
                  baseEx={baseForDiff[activeWorkout].exercises[i]}
                  weekEx={ex}
                  sets={getSets(activeWorkout, i, ex.sets, ex.reps, ex.weight)}
                  lastWeek={getLastWeekSets(activeWorkout, i)}
                  onUpdateSet={(setIdx, patch) => updateSet(activeWorkout, i, setIdx, patch)}
                  onToggleSetLog={(setIdx) => toggleSetLog(activeWorkout, i, setIdx)}
                  muscleScheme={muscleScheme}
                />
              ))}
            </div>

            {workouts[activeWorkout].finishers?.length > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>
                  <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5 }}>Hyrox Finishers — Half Dist, Pro Weight</p>
                  {workouts[activeWorkout].hasFixedFinishers ? (
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.orange, border: `1px solid ${C.orange}33`, padding: "2px 8px", letterSpacing: 1 }}>PROGRAMMED</span>
                  ) : (
                    <button onClick={() => setFinishers(p => ({ ...p, [activeWorkout]: pickRandomFinishers(2) }))} style={{ background: "none", border: `1px solid ${C.orange}33`, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.orange, padding: "2px 8px" }}>🎲 reroll</button>
                  )}
                </div>
                {workouts[activeWorkout].finishers.map((f, i) => (
                  <FinisherCard
                    key={i}
                    finisher={f}
                    log={getFinisherLog(activeWorkout, i)}
                    onToggleSet={(setIdx) => toggleFinisherSet(activeWorkout, i, setIdx)}
                    numSets={week === 4 ? 1 : 2}
                    deloadNote={week === 4 ? "Deload: 1 set, ~60% pace" : null}
                  />
                ))}
              </div>
            )}

            {week === 3 && (
              <div style={{ marginTop: 20, padding: 14, border: `1px solid ${C.green}33`, textAlign: "center" }}>
                <p style={{ margin: "0 0 8px", fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.green }}>Hit all top set reps? Earn the next block.</p>
                <button onClick={nextBlock} style={{ padding: "10px 24px", border: `1px solid ${C.green}`, background: `${C.green}15`, cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: 13, color: C.green }}>
                  → Start Block {block + 1}
                </button>
              </div>
            )}

            <LogWorkoutPanel
              workoutKey={activeWorkout}
              workout={workouts[activeWorkout]}
              phase={phase}
              block={block}
              week={week}
              workoutLogs={workoutLogs}
              onLog={logWorkoutForDate}
              onRemove={removeWorkoutLog}
            />
          </div>
        )}

        {mode === "run" && (
          <div style={{ padding: 40, textAlign: "center", animation: "fadeIn 0.3s ease" }}>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, color: C.textDim }}>🏃</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.textDim, marginTop: 8 }}>Run workouts coming from training plan + MemPalace</p>
          </div>
        )}
      </div>

      {/* Tweaks panel — portaled to body so fixed positioning escapes device frame */}
      {showTweaks && ReactDOM.createPortal((
        <div style={{
          position: "fixed", right: 12, bottom: 12, zIndex: 9999,
          width: 220, padding: 12,
          background: C.surface, border: `1px solid ${C.borderLight}`,
          boxShadow: "0 0 0 1px rgba(0,0,0,0.6), 0 10px 40px rgba(0,0,0,0.5)",
          fontFamily: "'DM Mono', monospace",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 9, color: C.accent, letterSpacing: 1.5, textTransform: "uppercase" }}>Tweaks</span>
            <button onClick={() => setShowTweaks(false)} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 14 }}>×</button>
          </div>
          <p style={{ margin: "0 0 6px", fontSize: 8, color: C.textDim, letterSpacing: 1, textTransform: "uppercase" }}>Color scheme</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
            {Object.entries(PALETTES).map(([k, p]) => (
              <button key={k} onClick={() => applyTheme(k)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 8px",
                background: theme === k ? `${p.accent}15` : "transparent",
                border: `1px solid ${theme === k ? p.accent : C.border}`,
                cursor: "pointer", textAlign: "left",
                fontFamily: "'DM Mono', monospace",
              }}>
                <span style={{ width: 10, height: 10, background: p.accent, flexShrink: 0 }} />
                <span style={{ width: 10, height: 10, background: p.blue, flexShrink: 0 }} />
                <span style={{ width: 10, height: 10, background: p.orange, flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: theme === k ? p.accent : C.text, flex: 1 }}>{p.label}</span>
              </button>
            ))}
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: C.text, cursor: "pointer" }}>
            <input type="checkbox" checked={showMountain} onChange={e => applyMountain(e.target.checked)} style={{ accentColor: C.accent }} />
            Mountain background
          </label>

          <p style={{ margin: "10px 0 6px", fontSize: 8, color: C.textDim, letterSpacing: 1, textTransform: "uppercase" }}>Muscle map scheme</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {(typeof MUSCLE_SCHEMES !== "undefined" ? MUSCLE_SCHEMES : []).map((v) => (
              <button key={v.id} onClick={() => applyMuscleScheme(v.id)} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "4px 8px",
                background: muscleScheme === v.id ? `${C.accent}15` : "transparent",
                border: `1px solid ${muscleScheme === v.id ? C.accent : C.border}`,
                cursor: "pointer", textAlign: "left",
                fontFamily: "'DM Mono', monospace",
              }}>
                <span style={{ width: 10, height: 10, background: v.swatch, flexShrink: 0, borderRadius: 1 }} />
                <span style={{ fontSize: 9, color: muscleScheme === v.id ? C.accent : C.text, flex: 1, letterSpacing: 0.8, textTransform: "uppercase" }}>{v.label}</span>
              </button>
            ))}
          </div>
        </div>
      ), document.body)}
    </div>
  );
}

window.ArtyMovesApp = ArtyMovesApp;
