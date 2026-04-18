import { useState, useMemo } from "react";

const C = {
  bg: "#060608", surface: "#0c0c10", border: "#2a2a30", borderLight: "#3a3a42",
  accent: "#8af0c0", green: "#8af0c0", yellow: "#f0e68a", blue: "#8ac8f0",
  purple: "#c8a0f0", red: "#f08a8a", orange: "#f0b88a",
  text: "#d0d0d4", textMid: "#78787e", textDim: "#48484e",
};

const RACES = [
  { name: "Hyrox Singles Open Toronto", date: new Date("2026-10-04"), priority: "A", color: C.accent },
  { name: "Toronto Waterfront Marathon", date: new Date("2026-10-18"), priority: "B", color: C.blue },
];

const PHASES = {
  base: { label: "Base", color: C.green, dates: "Now → Jun 20", strengthFocus: "Max strength — heavy compounds, build to 405 DL", runFocus: "Frequency rebuild, aerobic base, easy volume" },
  build: { label: "Build", color: C.yellow, dates: "Jun 20 → Aug 15", strengthFocus: "Hyrox-specific, endurance sets — build to 225×20 squat", runFocus: "Hyrox run splits, tempo, threshold work" },
  peak: { label: "Peak", color: C.orange, dates: "Aug 15 → Sep 20", strengthFocus: "Race simulations, maintain strength", runFocus: "Race pace, sharpening" },
  taper: { label: "Taper", color: C.purple, dates: "Sep 20 → Oct 4", strengthFocus: "Volume reduction, neural priming", runFocus: "Volume cut 40-60%" },
  recovery: { label: "Recovery", color: C.blue, dates: "As needed", strengthFocus: "Light movement, mobility", runFocus: "Easy jogs or rest" },
};

const HYROX_FINISHERS = [
  { name: "Sled Push", proWeight: "152 kg", halfDist: "12.5m" },
  { name: "Sled Pull", proWeight: "103 kg", halfDist: "12.5m" },
  { name: "Burpee Broad Jump", proWeight: "BW", halfDist: "40m" },
  { name: "Farmers Carry", proWeight: "2×32 kg", halfDist: "100m" },
  { name: "Sandbag Lunges", proWeight: "30 kg", halfDist: "50m" },
  { name: "Wall Balls", proWeight: "9 kg", halfDist: "50 reps" },
];

function pickRandomFinishers(n = 2) {
  return [...HYROX_FINISHERS].sort(() => 0.5 - Math.random()).slice(0, n);
}

// ——— Progressive overload: earn reps across weeks, bump weight next block ———
// Each exercise defines: baseReps (start of block), topReps (end of block), weightBump (for next block)
// W1 = baseReps, W2 = baseReps+1, W3 = topReps, W4 = deload at 70%
// Next Block: weight += weightBump, reps reset to baseReps

function applyWeek(exercise, week) {
  const e = { ...exercise };
  if (week === 1) return e;
  if (week === 4) {
    e.weight = e.weight > 0 ? Math.round(e.weight * 0.7) : 0;
    e.sets = Math.max(e.sets - 1, 2);
    e.reps = e.baseReps;
    return e;
  }
  // W2 and W3: earn reps
  const repSteps = e.topReps - e.baseReps;
  if (week === 2) {
    e.reps = e.baseReps + Math.ceil(repSteps / 2);
  } else if (week === 3) {
    e.reps = e.topReps;
  }
  return e;
}

function applyBlock(exercise, block) {
  const e = { ...exercise };
  if (block <= 1 || e.weight === 0) return e;
  e.weight = e.weight + (e.weightBump * (block - 1));
  return e;
}

// ——— Base phase: max strength templates ———
function getBaseWorkouts(phase) {
  const wu = [{ name: "Row 500m", note: "Easy pace" }, { name: "SkiErg 500m", note: "Easy pace" }];

  if (phase === "base") return {
    push: { label: "Push Day", icon: "🏋️", warmup: wu, exercises: [
      { name: "Bench Press", sets: 5, reps: 3, baseReps: 3, topReps: 5, weight: 170, weightBump: 10, unit: "lbs", note: "→ 225", tier: "compound" },
      { name: "Overhead Press", sets: 4, reps: 3, baseReps: 3, topReps: 5, weight: 115, weightBump: 5, unit: "lbs", note: "→ 155", tier: "compound" },
      { name: "Incline DB Press", sets: 3, reps: 6, baseReps: 6, topReps: 8, weight: 55, weightBump: 5, unit: "lbs", note: "Each hand", tier: "accessory" },
      { name: "Weighted Dips", sets: 3, reps: 5, baseReps: 5, topReps: 8, weight: 35, weightBump: 5, unit: "lbs", note: "", tier: "accessory" },
      { name: "Lateral Raises", sets: 3, reps: 12, baseReps: 12, topReps: 16, weight: 20, weightBump: 5, unit: "lbs", note: "", tier: "isolation" },
    ]},
    pull: { label: "Pull Day", icon: "💪", warmup: wu, exercises: [
      { name: "Deadlift", sets: 5, reps: 3, baseReps: 3, topReps: 5, weight: 365, weightBump: 10, unit: "lbs", note: "→ 405", tier: "compound" },
      { name: "Weighted Chin-ups", sets: 4, reps: 3, baseReps: 3, topReps: 5, weight: 55, weightBump: 5, unit: "lbs", note: "", tier: "compound" },
      { name: "Barbell Row", sets: 4, reps: 5, baseReps: 5, topReps: 8, weight: 175, weightBump: 5, unit: "lbs", note: "", tier: "accessory" },
      { name: "Face Pulls", sets: 3, reps: 12, baseReps: 12, topReps: 16, weight: 30, weightBump: 5, unit: "lbs", note: "Cable", tier: "isolation" },
      { name: "Hammer Curls", sets: 3, reps: 8, baseReps: 8, topReps: 12, weight: 35, weightBump: 5, unit: "lbs", note: "Each hand", tier: "isolation" },
    ]},
    legs: { label: "Leg Day", icon: "🦵", warmup: wu, exercises: [
      { name: "Back Squat", sets: 5, reps: 3, baseReps: 3, topReps: 5, weight: 255, weightBump: 10, unit: "lbs", note: "→ 315", tier: "compound" },
      { name: "Romanian Deadlift", sets: 4, reps: 5, baseReps: 5, topReps: 8, weight: 225, weightBump: 10, unit: "lbs", note: "", tier: "compound" },
      { name: "Walking Lunges", sets: 3, reps: 8, baseReps: 8, topReps: 12, weight: 50, weightBump: 5, unit: "lbs", note: "Each leg, DBs", tier: "accessory" },
      { name: "Leg Press", sets: 3, reps: 6, baseReps: 6, topReps: 10, weight: 360, weightBump: 20, unit: "lbs", note: "", tier: "accessory" },
      { name: "Calf Raises", sets: 4, reps: 12, baseReps: 12, topReps: 16, weight: 135, weightBump: 10, unit: "lbs", note: "Standing", tier: "isolation" },
    ]},
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

// ——— Components ———
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

function ExerciseRow({ baseEx, weekEx }) {
  const weightDisplay = weekEx.weight > 0 ? `${weekEx.weight} ${weekEx.unit}` : weekEx.unit;
  const repChanged = weekEx.reps !== baseEx.reps;
  const weightChanged = weekEx.weight !== baseEx.weight;
  const setChanged = weekEx.sets !== baseEx.sets;
  const isDeload = weekEx.weight < baseEx.weight;
  const tierColors = { compound: C.accent, accessory: C.yellow, isolation: C.textDim };

  return (<div style={{ padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 4 }}>
      <div>
        <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 14, color: C.text }}>{weekEx.name}</p>
        <div style={{ display: "flex", gap: 6, marginTop: 2, alignItems: "center" }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, color: tierColors[weekEx.tier], border: `1px solid ${tierColors[weekEx.tier]}33`, padding: "0px 4px", textTransform: "uppercase", letterSpacing: 1 }}>{weekEx.tier}</span>
          {weekEx.note && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim }}>{weekEx.note}</span>}
        </div>
      </div>
    </div>
    <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, color: repChanged ? C.green : C.accent }}>
        {weekEx.sets}×{weekEx.reps}
      </span>
      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 15, color: weightChanged ? (isDeload ? C.blue : C.green) : C.text }}>
        {weightDisplay}
      </span>
      {(repChanged || weightChanged || setChanged) && (
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: isDeload ? C.blue : C.green, border: `1px solid ${isDeload ? C.blue : C.green}33`, padding: "1px 6px" }}>
          {isDeload ? "↓ " : "↑ "}
          {repChanged && `${weekEx.reps > baseEx.reps ? "+" : ""}${weekEx.reps - baseEx.reps}rep `}
          {weightChanged && `${weekEx.weight > baseEx.weight ? "+" : ""}${weekEx.weight - baseEx.weight}lbs `}
          {setChanged && `${weekEx.sets - baseEx.sets}set`}
        </span>
      )}
    </div>
    {/* Rep range indicator */}
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
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

function FinisherCard({ finisher }) {
  return (<div style={{ padding: "10px 12px", border: `1px solid ${C.orange}22`, borderLeft: `2px solid ${C.orange}`, marginBottom: 4 }}>
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.orange }}>{finisher.name}</span>
      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textDim }}>{finisher.halfDist}</span>
    </div>
    <p style={{ margin: "2px 0 0", fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textDim }}>Pro weight: {finisher.proWeight}</p>
  </div>);
}

// ——— Main ———
export default function App() {
  const [mode, setMode] = useState("strength");
  const [phase, setPhase] = useState("base");
  const [week, setWeek] = useState(1);
  const [block, setBlock] = useState(1);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [finishers, setFinishers] = useState({});

  const now = new Date();
  const phaseInfo = PHASES[phase];
  const templates = useMemo(() => getBaseWorkouts(phase), [phase]);

  // Apply block (weight bumps) then week (rep progression)
  const workouts = useMemo(() => {
    const result = {};
    Object.entries(templates).forEach(([key, w]) => {
      result[key] = {
        ...w,
        exercises: w.exercises.map(ex => {
          const blocked = applyBlock(ex, block);
          return applyWeek(blocked, week);
        }),
        finishers: finishers[key] || pickRandomFinishers(2),
      };
    });
    return result;
  }, [templates, week, block, phase, finishers]);

  // Base exercises with block applied (for diff display)
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

  function nextBlock() {
    setBlock(b => b + 1);
    setWeek(1);
  }

  function prevBlock() {
    if (block > 1) { setBlock(b => b - 1); setWeek(1); }
  }

  function resetBlocks() {
    setBlock(1); setWeek(1); setActiveWorkout(null); setFinishers({});
  }

  return (
    <div style={{ width: "100%", maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: C.bg }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
      <style>{`* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; } body { margin: 0; background: ${C.bg}; } @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      <div style={{ padding: "48px 16px 40px" }}>

        {/* Race countdowns */}
        <div style={{ marginBottom: 20 }}>
          {RACES.map((race, i) => {
            const days = Math.ceil((race.date - now) / 86400000);
            return (<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${C.border}` }}>
              <div>
                <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 11, color: race.color }}>{race.name}</p>
                <p style={{ margin: "2px 0 0", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim }}>{race.date.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })} · {race.priority} Race</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, fontFamily: "'Space Mono', monospace", fontSize: 20, color: race.color, lineHeight: 1 }}>{days}</p>
                <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim }}>days ({Math.round(days / 7)}w)</p>
              </div>
            </div>);
          })}
        </div>

        {/* Mode */}
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          <Pill active={mode === "strength"} color={C.purple} onClick={() => { setMode("strength"); setActiveWorkout(null); }}>Strength</Pill>
          <Pill active={mode === "run"} color={C.green} onClick={() => { setMode("run"); setActiveWorkout(null); }}>Run</Pill>
        </div>

        {/* Phase */}
        <div style={{ marginBottom: 12 }}>
          <p style={{ margin: "0 0 6px", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5 }}>Phase</p>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {Object.entries(PHASES).map(([key, p]) => (<Pill key={key} active={phase === key} color={p.color} onClick={() => { setPhase(key); resetBlocks(); }}>{p.label}</Pill>))}
          </div>
        </div>

        {/* Phase info */}
        <div style={{ padding: 12, border: `1px solid ${C.border}`, borderLeft: `2px solid ${phaseInfo.color}`, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: phaseInfo.color }}>{phaseInfo.label} Phase</span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim }}>{phaseInfo.dates}</span>
          </div>
          <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textMid, lineHeight: 1.5 }}>{mode === "strength" ? phaseInfo.strengthFocus : phaseInfo.runFocus}</p>
        </div>

        {/* Block selector */}
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

        {/* Week selector */}
        <div style={{ marginBottom: 20 }}>
          <p style={{ margin: "0 0 6px", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5 }}>Week</p>
          <div style={{ display: "flex", gap: 4 }}>{[1, 2, 3, 4].map(w => <WeekPill key={w} week={w} activeWeek={week} onClick={setWeek} />)}</div>
          {week === 1 && <p style={{ margin: "6px 0 0", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textMid }}>Base reps @ block {block} weight</p>}
          {week === 2 && <p style={{ margin: "6px 0 0", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.green }}>↑ Earning reps — midway to top set</p>}
          {week === 3 && <p style={{ margin: "6px 0 0", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.green }}>↑ Top set — hit all target reps, earn the weight bump</p>}
          {week === 4 && <p style={{ margin: "6px 0 0", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.blue }}>↓ Deload: 70% weight, −1 set — recover for next block</p>}
        </div>

        {/* Workout picker */}
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

        {/* Active workout */}
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

            {/* Warmup */}
            <div style={{ marginBottom: 8 }}>
              <p style={{ margin: "0 0 8px", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>Warmup</p>
              {workouts[activeWorkout].warmup.map((w, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.textMid }}>{w.name}</span>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.textDim }}>{w.note}</span>
                </div>
              ))}
            </div>

            {/* Exercises */}
            <div style={{ marginBottom: 8 }}>
              <p style={{ margin: "0 0 4px", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>Working Sets</p>
              {workouts[activeWorkout].exercises.map((ex, i) => (
                <ExerciseRow key={i} baseEx={baseForDiff[activeWorkout].exercises[i]} weekEx={ex} />
              ))}
            </div>

            {/* Finishers */}
            {workouts[activeWorkout].finishers?.length > 0 && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, borderBottom: `1px solid ${C.border}`, paddingBottom: 4 }}>
                  <p style={{ margin: 0, fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: 1.5 }}>Hyrox Finishers — Half Dist, Pro Weight</p>
                  <button onClick={() => setFinishers(p => ({ ...p, [activeWorkout]: pickRandomFinishers(2) }))} style={{ background: "none", border: `1px solid ${C.orange}33`, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 9, color: C.orange, padding: "2px 8px" }}>🎲 reroll</button>
                </div>
                {workouts[activeWorkout].finishers.map((f, i) => <FinisherCard key={i} finisher={f} />)}
              </div>
            )}

            {/* Next block CTA */}
            {week === 3 && (
              <div style={{ marginTop: 20, padding: 14, border: `1px solid ${C.green}33`, textAlign: "center" }}>
                <p style={{ margin: "0 0 8px", fontFamily: "'DM Mono', monospace", fontSize: 10, color: C.green }}>Hit all top set reps? Earn the next block.</p>
                <button onClick={nextBlock} style={{ padding: "10px 24px", border: `1px solid ${C.green}`, background: `${C.green}15`, cursor: "pointer", fontFamily: "'Space Mono', monospace", fontSize: 13, color: C.green }}>
                  → Start Block {block + 1}
                </button>
              </div>
            )}
          </div>
        )}

        {mode === "run" && (
          <div style={{ padding: 40, textAlign: "center", animation: "fadeIn 0.3s ease" }}>
            <p style={{ fontFamily: "'Space Mono', monospace", fontSize: 16, color: C.textDim }}>🏃</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: C.textDim, marginTop: 8 }}>Run workouts coming from training plan + MemPalace</p>
          </div>
        )}
      </div>
    </div>
  );
}
