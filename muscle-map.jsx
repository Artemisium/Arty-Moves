// ═══════════════════════════════════════════════════════════════════════════
// Anatomical Muscle Map — v3
// Proper silhouette outline + distinct curved muscle-group shapes layered on top.
// Lean/athletic proportions, readable at 56–72px.
// ═══════════════════════════════════════════════════════════════════════════

// viewBox 100 × 200. Head ~16 wide, shoulders ~44, waist ~26, hips ~36.

// ───────────────────────────────────────────────────────────────────────────
// FRONT — full body silhouette path (single continuous outline)
// ───────────────────────────────────────────────────────────────────────────

const FRONT_SILHOUETTE =
  "M50,2" +
  " C57,2 63,8 63,16 C63,22 60,27 56,29" +                       // head
  " C56,31 57,33 58,34 L60,34" +                                 // neck L
  " C68,35 74,39 77,46 L79,54" +                                 // shoulder R cap
  " C81,58 82,64 81,70" +                                        // bicep R outer
  " C82,76 82,84 81,92 L80,100" +                                // forearm R
  " C81,104 79,106 77,105" +                                     // wrist R
  " C76,100 74,94 72,88" +                                       // forearm R inner
  " L70,78 C70,74 69,70 68,66" +                                 // bicep R inner
  " L66,58 L65,52" +                                             // torso R upper
  " C68,62 70,74 69,86 L68,94" +                                 // lat R / side
  " L67,106 L66,118 L65,130" +                                   // hip R
  " C66,134 66,140 66,146 L66,158" +                             // quad R outer
  " C65,166 64,174 63,182 L62,190 L66,192 L66,196" +             // calf R / foot R
  " L54,196 L54,192 L55,184" +                                   // inner foot R
  " C55,178 54,168 53,160 L52,148" +                             // inner calf R
  " C51,140 50,132 50,124" +                                     // inner thigh R
  " L50,124" +                                                   // crotch
  " C50,132 49,140 48,148 L47,160" +                             // inner calf L
  " C46,168 45,178 45,184 L46,192 L46,196" +                     // foot L
  " L34,196 L34,192 L38,190 L37,182" +                           // calf L
  " C36,174 35,166 35,158 L34,146" +                             // quad L outer
  " C34,140 34,134 34,130" +                                     // hip L
  " L33,118 L32,106 L31,94 L30,86" +                             // lat L / side
  " C29,74 31,62 34,52 L35,58 L34,66" +                          // torso L upper
  " C33,70 32,74 31,78 L30,88" +                                 // bicep L inner
  " C28,94 26,100 25,105" +                                      // forearm L
  " C23,106 21,104 22,100 L21,92" +                              // wrist L
  " C20,84 20,76 21,70" +                                        // bicep L outer
  " C20,64 21,58 23,54 L25,46" +                                 // shoulder L cap
  " C28,39 34,35 42,34 L44,34" +                                 // neck R
  " C45,33 46,31 46,29" +                                        // neck
  " C42,27 39,22 39,16 C39,8 43,2 50,2 Z";

const BACK_SILHOUETTE = FRONT_SILHOUETTE; // same body shape

// ───────────────────────────────────────────────────────────────────────────
// FRONT muscle groups — each is a curved shape sitting inside the silhouette
// ───────────────────────────────────────────────────────────────────────────

const FRONT_MUSCLES = {
  // Trapezius (upper, visible from front as the slope from neck to shoulder)
  traps: "M46,30 C46,32 47,33 48,34 L52,34 C53,33 54,32 54,30 C58,31 62,33 64,35 L62,40 C58,38 54,37 50,37 C46,37 42,38 38,40 L36,35 C38,33 42,31 46,30 Z",

  // Deltoids — rounded shoulder caps (front head)
  deltL: "M36,36 C29,38 25,44 24,52 C24,56 25,58 27,59 C31,59 34,57 36,54 C37,48 37,42 38,38 Z",
  deltR: "M64,36 C71,38 75,44 76,52 C76,56 75,58 73,59 C69,59 66,57 64,54 C63,48 63,42 62,38 Z",

  // Pectoralis major — two teardrop slabs meeting at sternum
  pecL: "M38,40 C43,39 47,39 49,40 L49,56 C48,58 45,59 41,57 C37,55 34,50 34,46 C34,42 36,40 38,40 Z",
  pecR: "M62,40 C57,39 53,39 51,40 L51,56 C52,58 55,59 59,57 C63,55 66,50 66,46 C66,42 64,40 62,40 Z",

  // Biceps
  bicepL: "M26,60 C23,62 22,66 22,72 C22,78 23,82 25,82 C28,82 30,78 30,72 L30,64 C29,60 27,59 26,60 Z",
  bicepR: "M74,60 C77,62 78,66 78,72 C78,78 77,82 75,82 C72,82 70,78 70,72 L70,64 C71,60 73,59 74,60 Z",

  // Forearms
  forearmL: "M24,84 C22,86 21,92 21,98 C22,103 24,106 26,106 C28,106 29,102 29,98 L29,86 C28,84 25,83 24,84 Z",
  forearmR: "M76,84 C78,86 79,92 79,98 C78,103 76,106 74,106 C72,106 71,102 71,98 L71,86 C72,84 75,83 76,84 Z",

  // Abdominal region — six-pack grid (read as "abs" as a whole)
  abs: "M42,58 L49,58 L49,66 L42,66 Z M51,58 L58,58 L58,66 L51,66 Z M42,68 L49,68 L49,76 L42,76 Z M51,68 L58,68 L58,76 L51,76 Z M42,78 L49,78 L49,86 L42,86 Z M51,78 L58,78 L58,86 L51,86 Z",
  absOutline: "M40,56 L60,56 L60,88 L40,88 Z",

  // Obliques — slanted shapes on the sides of the core
  obliqueL: "M34,58 C33,68 33,78 35,86 L39,86 L40,58 Z",
  obliqueR: "M66,58 C67,68 67,78 65,86 L61,86 L60,58 Z",

  // Serratus — visible hatch between pec and oblique
  serratusL: "M34,50 L38,52 L38,56 L34,56 Z M34,58 L38,60 L38,62 L34,62 Z",
  serratusR: "M66,50 L62,52 L62,56 L66,56 Z M66,58 L62,60 L62,62 L66,62 Z",

  // Hip flexor / inguinal
  hipL: "M36,88 C37,94 42,97 48,97 L48,102 L36,102 Z",
  hipR: "M64,88 C63,94 58,97 52,97 L52,102 L64,102 Z",

  // Quadriceps — outer (vastus lateralis), mid (rectus femoris), inner (vastus medialis)
  quadOuterL: "M33,104 C31,118 31,132 33,146 L38,146 C38,134 39,120 39,106 L33,104 Z",
  quadMidL:   "M40,106 L47,106 L47,148 L40,148 Z",
  quadInnerL: "M48,108 L50,108 L50,146 L48,146 Z",
  quadOuterR: "M67,104 C69,118 69,132 67,146 L62,146 C62,134 61,120 61,106 L67,104 Z",
  quadMidR:   "M60,106 L53,106 L53,148 L60,148 Z",
  quadInnerR: "M52,108 L50,108 L50,146 L52,146 Z",

  // Knee caps
  kneeL: "M36,149 L46,149 L46,155 L36,155 Z",
  kneeR: "M54,149 L64,149 L64,155 L54,155 Z",

  // Calves (gastrocnemius + tibialis combined for front view)
  calfL: "M34,158 C33,170 34,180 37,190 L44,190 L44,158 Z",
  calfR: "M66,158 C67,170 66,180 63,190 L56,190 L56,158 Z",

  // Shins (tibialis anterior) — inner front strip of lower leg
  shinL: "M39,158 L43,158 L43,189 L40,189 Z",
  shinR: "M61,158 L57,158 L57,189 L60,189 Z",
};

const FRONT_GROUPS = {
  traps:    ["traps"],
  delts:    ["deltL", "deltR"],
  pecs:     ["pecL", "pecR"],
  biceps:   ["bicepL", "bicepR"],
  forearms: ["forearmL", "forearmR"],
  abs:      ["abs", "absOutline"],
  obliques: ["obliqueL", "obliqueR", "serratusL", "serratusR"],
  hips:     ["hipL", "hipR"],
  quads:    ["quadOuterL", "quadMidL", "quadInnerL", "quadOuterR", "quadMidR", "quadInnerR"],
  calves:   ["calfL", "calfR"],
  shins:    ["shinL", "shinR"],
};

const FRONT_STRUCTURAL_NAMES = ["kneeL", "kneeR"];

// ───────────────────────────────────────────────────────────────────────────
// BACK muscle groups
// ───────────────────────────────────────────────────────────────────────────

const BACK_MUSCLES = {
  // Upper traps — kite from neck to shoulders
  trapsU: "M50,30 C48,34 47,38 46,42 L50,48 L54,42 C53,38 52,34 50,30 Z M50,30 L36,37 C40,40 43,43 46,42 Z M50,30 L64,37 C60,40 57,43 54,42 Z",

  // Mid traps / rhomboids — between shoulder blades
  trapsM: "M40,44 L60,44 L60,58 L40,58 Z",

  // Rear delts
  rearDeltL: "M36,36 C29,38 25,44 24,52 C24,56 25,58 27,59 C31,59 34,57 36,54 C37,48 37,42 38,38 Z",
  rearDeltR: "M64,36 C71,38 75,44 76,52 C76,56 75,58 73,59 C69,59 66,57 64,54 C63,48 63,42 62,38 Z",

  // Lats — big wings from armpit tapering to waist
  latL: "M37,42 C33,54 30,68 32,80 C34,82 38,82 42,80 L42,46 Z",
  latR: "M63,42 C67,54 70,68 68,80 C66,82 62,82 58,80 L58,46 Z",

  // Spinal erectors — columns down center-low back
  erectorL: "M44,60 L49,60 L49,88 L44,88 Z",
  erectorR: "M51,60 L56,60 L56,88 L51,88 Z",

  // Triceps
  tricepL: "M26,60 C23,62 22,66 22,72 C22,78 23,82 25,82 C28,82 30,78 30,72 L30,64 C29,60 27,59 26,60 Z",
  tricepR: "M74,60 C77,62 78,66 78,72 C78,78 77,82 75,82 C72,82 70,78 70,72 L70,64 C71,60 73,59 74,60 Z",

  // Forearms (same as front)
  forearmL: "M24,84 C22,86 21,92 21,98 C22,103 24,106 26,106 C28,106 29,102 29,98 L29,86 C28,84 25,83 24,84 Z",
  forearmR: "M76,84 C78,86 79,92 79,98 C78,103 76,106 74,106 C72,106 71,102 71,98 L71,86 C72,84 75,83 76,84 Z",

  // Glutes — two rounded curves
  gluteL: "M36,90 C33,96 33,104 36,110 C40,112 46,110 49,106 L49,92 Z",
  gluteR: "M64,90 C67,96 67,104 64,110 C60,112 54,110 51,106 L51,92 Z",

  // Hamstrings (biceps femoris / semi-) — divided into inner + outer
  hamOuterL: "M33,112 C31,126 31,140 33,148 L39,148 L39,114 Z",
  hamInnerL: "M41,114 L48,114 L48,148 L41,148 Z",
  hamOuterR: "M67,112 C69,126 69,140 67,148 L61,148 L61,114 Z",
  hamInnerR: "M59,114 L52,114 L52,148 L59,148 Z",

  // Knee backs
  kneeL: "M35,151 L48,151 L48,156 L35,156 Z",
  kneeR: "M52,151 L65,151 L65,156 L52,156 Z",

  // Calves — gastrocnemius two heads
  calfOuterL: "M33,158 C31,170 32,182 35,190 L40,190 L40,158 Z",
  calfInnerL: "M41,158 L46,158 L46,190 L41,190 Z",
  calfOuterR: "M67,158 C69,170 68,182 65,190 L60,190 L60,158 Z",
  calfInnerR: "M59,158 L54,158 L54,190 L59,190 Z",
};

const BACK_GROUPS = {
  trapsU:    ["trapsU"],
  trapsM:    ["trapsM"],
  rearDelts: ["rearDeltL", "rearDeltR"],
  lats:      ["latL", "latR"],
  erectors:  ["erectorL", "erectorR"],
  triceps:   ["tricepL", "tricepR"],
  forearms:  ["forearmL", "forearmR"],
  glutes:    ["gluteL", "gluteR"],
  hams:      ["hamOuterL", "hamInnerL", "hamOuterR", "hamInnerR"],
  calves:    ["calfOuterL", "calfInnerL", "calfOuterR", "calfInnerR"],
};

const BACK_STRUCTURAL_NAMES = ["kneeL", "kneeR"];

// ───────────────────────────────────────────────────────────────────────────
// Exercise mapping (unchanged logic)
// ───────────────────────────────────────────────────────────────────────────

const MUSCLE_MAP = {
  "Bench Press":       { front: { p: ["pecs"], s: ["delts"], st: ["abs", "traps"] }, back: { p: [], s: ["triceps"], st: [] }, showBack: false },
  "Overhead Press":    { front: { p: ["delts"], s: ["pecs", "traps"], st: ["abs", "obliques"] }, back: { p: ["trapsU"], s: ["rearDelts", "triceps"], st: ["erectors"] }, showBack: false },
  "Deadlift":          { front: { p: [], s: ["quads"], st: ["forearms", "abs", "traps"] }, back: { p: ["erectors", "hams", "glutes"], s: ["lats", "trapsM"], st: ["calves"] }, showBack: true },
  "Back Squat":        { front: { p: ["quads"], s: [], st: ["abs", "obliques", "calves"] }, back: { p: ["glutes"], s: ["hams", "erectors"], st: ["trapsM"] }, showBack: true },
  "Barbell Row":       { front: { p: [], s: ["biceps"], st: ["forearms", "abs"] }, back: { p: ["lats", "trapsM"], s: ["rearDelts", "erectors"], st: [] }, showBack: true },
  "Weighted Chin-ups": { front: { p: [], s: ["biceps"], st: ["forearms", "abs"] }, back: { p: ["lats"], s: ["trapsM", "rearDelts"], st: [] }, showBack: true },
  "Weighted Dips":     { front: { p: ["pecs"], s: ["delts"], st: ["abs"] }, back: { p: [], s: ["triceps"], st: [] }, showBack: false },
  "Walking Lunges":    { front: { p: ["quads"], s: [], st: ["abs", "obliques", "forearms"] }, back: { p: ["glutes"], s: ["hams", "calves"], st: ["erectors"] }, showBack: true },
  "Incline DB Press":  { front: { p: ["pecs", "delts"], s: [], st: ["abs"] }, back: { p: [], s: ["triceps"], st: [] }, showBack: false },
  "Lateral Raises":    { front: { p: ["delts"], s: [], st: ["traps"] }, back: { p: [], s: ["trapsU"], st: [] }, showBack: false },
  "Face Pulls":        { front: { p: [], s: [], st: ["forearms"] }, back: { p: ["rearDelts", "trapsM"], s: ["trapsU"], st: [] }, showBack: true },
  "Hammer Curls":      { front: { p: ["biceps", "forearms"], s: [], st: [] }, back: { p: [], s: [], st: [] }, showBack: false },
  "Romanian Deadlift": { front: { p: [], s: [], st: ["forearms", "abs"] }, back: { p: ["hams", "glutes", "erectors"], s: ["trapsM"], st: [] }, showBack: true },
  "Leg Press":         { front: { p: ["quads"], s: [], st: [] }, back: { p: ["glutes"], s: ["hams"], st: [] }, showBack: false },
  "Calf Raises":       { front: { p: ["calves", "shins"], s: [], st: [] }, back: { p: ["calves"], s: [], st: [] }, showBack: false },
  "Push-ups":          { front: { p: ["pecs", "delts"], s: [], st: ["abs", "obliques"] }, back: { p: [], s: ["triceps"], st: [] }, showBack: false },
  "DB Shoulder Press": { front: { p: ["delts"], s: ["pecs"], st: ["abs"] }, back: { p: [], s: ["triceps"], st: [] }, showBack: false },
  "Pull-ups":          { front: { p: [], s: ["biceps"], st: ["forearms", "abs"] }, back: { p: ["lats"], s: ["trapsM", "rearDelts"], st: [] }, showBack: true },
  "DB Rows":           { front: { p: [], s: ["biceps"], st: ["forearms"] }, back: { p: ["lats"], s: ["rearDelts", "trapsM"], st: [] }, showBack: true },
  "Goblet Squat":      { front: { p: ["quads"], s: [], st: ["abs", "obliques"] }, back: { p: ["glutes"], s: ["hams"], st: [] }, showBack: false },
};

// ───────────────────────────────────────────────────────────────────────────
// Color schemes
// ───────────────────────────────────────────────────────────────────────────

const SCHEMES = {
  heat:      { label: "Heat map",    bg: "transparent", neutral: "#2a2a2e", outline: "#50505a", skin: "#1a1a1e",
               ramp: i => i >= 0.85 ? "#ef2b2b" : i >= 0.5 ? "#f08415" : i >= 0.15 ? "#f4c430" : null },
  electric:  { label: "Electric",    bg: "transparent", neutral: "#242430", outline: "#45455a", skin: "#15151c",
               ramp: i => i >= 0.85 ? "#a855f7" : i >= 0.5 ? "#3b82f6" : i >= 0.15 ? "#22d3ee" : null },
  acid:      { label: "Acid",        bg: "#0a0f08",     neutral: "#2a3424", outline: "#3e4a30", skin: "#151c12",
               ramp: i => i >= 0.85 ? "#c0ff00" : i >= 0.5 ? "#7fe000" : i >= 0.15 ? "#4a9a00" : null },
  mono:      { label: "Monochrome",  bg: "transparent", neutral: "#2a2a2a", outline: "#48484a", skin: "#161616",
               ramp: i => i >= 0.85 ? "#ffffff" : i >= 0.5 ? "#aaaaaa" : i >= 0.15 ? "#707070" : null },
  blueprint: { label: "Blueprint",   bg: "#0a2342",     neutral: "#1f4066", outline: "#4a7ab0", skin: "#0f2f56",
               ramp: i => i >= 0.85 ? "#7fdbff" : i >= 0.5 ? "#4fb8e8" : i >= 0.15 ? "#3385b8" : null },
  riso:      { label: "Risograph",   bg: "#f4ead5",     neutral: "#2c3e8c", outline: "#1e2a5f", skin: "#e8dcba",
               ramp: i => i >= 0.85 ? "#ee3560" : i >= 0.5 ? "#f07090" : i >= 0.15 ? "#f4a8b8" : null },
  thermal:   { label: "Thermal",     bg: "#0a0015",     neutral: "#1a0a2a", outline: "#3a1860", skin: "#0f0820",
               ramp: i => i >= 0.85 ? "#fff5c8" : i >= 0.5 ? "#ff66a6" : i >= 0.15 ? "#7a3aaa" : null },
  terminal:  { label: "Terminal",    bg: "#050a05",     neutral: "#0f2010", outline: "#1f4020", skin: "#081408",
               ramp: i => i >= 0.85 ? "#33ff66" : i >= 0.5 ? "#33ff6699" : i >= 0.15 ? "#33ff6644" : null },
  forest:    { label: "Forest",      bg: "transparent", neutral: "#2e3d30", outline: "#485a45", skin: "#1a221c",
               ramp: i => i >= 0.85 ? "#2d5a2f" : i >= 0.5 ? "#5a7a3f" : i >= 0.15 ? "#8a9a52" : null },
  blood:     { label: "Blood",       bg: "transparent", neutral: "#2a1a1a", outline: "#4a2828", skin: "#180e0e",
               ramp: i => i >= 0.85 ? "#8b0000" : i >= 0.5 ? "#b22222" : i >= 0.15 ? "#d95555" : null },
  lava:      { label: "Lava",        bg: "#0a0405",     neutral: "#1c0f10", outline: "#3a1818", skin: "#110808",
               ramp: i => i >= 0.85 ? "#ffd700" : i >= 0.5 ? "#ff5a1f" : i >= 0.15 ? "#8b1a1a" : null },
  pastel:    { label: "Pastel",      bg: "transparent", neutral: "#3a3a42", outline: "#55555f", skin: "#1e1e24",
               ramp: i => i >= 0.85 ? "#ffb5a7" : i >= 0.5 ? "#c4e0c1" : i >= 0.15 ? "#c8b6e2" : null },
  signal:    { label: "Signal",      bg: "transparent", neutral: "#2a2a2e", outline: "#45454d", skin: "#161618",
               ramp: i => i >= 0.85 ? "#8af0c0" : i >= 0.5 ? "#8af0c0aa" : i >= 0.15 ? "#8af0c055" : null },
};

// ───────────────────────────────────────────────────────────────────────────
// Rendering
// ───────────────────────────────────────────────────────────────────────────

function getGroupIntensity(groupName, side, data) {
  if (!data || !data[side]) return 0;
  const d = data[side];
  if (d.p?.includes(groupName)) return 1;
  if (d.s?.includes(groupName)) return 0.55;
  if (d.st?.includes(groupName)) return 0.25;
  return 0;
}

function BodyView({ view, data, scheme }) {
  const muscles = view === "back" ? BACK_MUSCLES : FRONT_MUSCLES;
  const groups = view === "back" ? BACK_GROUPS : FRONT_GROUPS;
  const structural = view === "back" ? BACK_STRUCTURAL_NAMES : FRONT_STRUCTURAL_NAMES;
  const silhouette = view === "back" ? BACK_SILHOUETTE : FRONT_SILHOUETTE;

  // Per-region intensity
  const regionIntensity = {};
  Object.entries(groups).forEach(([gName, regions]) => {
    const i = getGroupIntensity(gName, view, data);
    regions.forEach(r => {
      regionIntensity[r] = Math.max(regionIntensity[r] || 0, i);
    });
  });

  // Head circle on top of silhouette for clearer face
  return (
    <>
      {/* Body silhouette — skin color fill, outline stroke */}
      <path d={silhouette} fill={scheme.skin} stroke={scheme.outline} strokeWidth="0.6" strokeLinejoin="round" />

      {/* Neutral muscle outlines — drawn underneath so they show where nothing is activated */}
      {Object.entries(muscles).filter(([k]) => !structural.includes(k)).map(([k, d]) => {
        const i = regionIntensity[k] || 0;
        if (i > 0) return null; // worked muscles drawn in next layer
        return (
          <path
            key={k}
            d={d}
            fill={scheme.neutral}
            stroke={scheme.outline}
            strokeWidth="0.3"
            strokeLinejoin="round"
            strokeOpacity="0.6"
          />
        );
      })}

      {/* Worked muscles, in ascending intensity */}
      {Object.entries(muscles)
        .filter(([k]) => !structural.includes(k) && (regionIntensity[k] || 0) > 0)
        .sort(([a], [b]) => (regionIntensity[a] || 0) - (regionIntensity[b] || 0))
        .map(([k, d]) => {
          const i = regionIntensity[k];
          const fill = scheme.ramp(i);
          return (
            <path
              key={k}
              d={d}
              fill={fill}
              stroke={scheme.outline}
              strokeWidth="0.35"
              strokeLinejoin="round"
              strokeOpacity="0.7"
            />
          );
        })}

      {/* Structural (knees) on top */}
      {structural.map(k => muscles[k] && (
        <path key={k} d={muscles[k]} fill="none" stroke={scheme.outline} strokeWidth="0.4" strokeOpacity="0.6" />
      ))}

      {/* Center sternum + belly-button indicator for front */}
      {view === "front" && (
        <line x1="50" y1="40" x2="50" y2="88" stroke={scheme.outline} strokeWidth="0.3" strokeOpacity="0.5" />
      )}
      {view === "back" && (
        <line x1="50" y1="30" x2="50" y2="90" stroke={scheme.outline} strokeWidth="0.3" strokeOpacity="0.5" />
      )}
    </>
  );
}

function MuscleMap({ exercise, scheme = "heat", size = 56 }) {
  const data = MUSCLE_MAP[exercise];
  const s = SCHEMES[scheme] || SCHEMES.heat;
  if (!data) return <div style={{ width: size, height: Math.round(size * 2.0) }} />;
  const showBack = data.showBack && data.back;
  const h = Math.round(size * 2.0);

  const Wrap = ({ children }) => (
    <div style={{
      background: s.bg,
      padding: s.bg !== "transparent" ? 4 : 0,
      borderRadius: s.bg !== "transparent" ? 3 : 0,
      display: "inline-flex",
      gap: 3,
      alignItems: "center",
    }}>{children}</div>
  );

  if (showBack) {
    const halfW = Math.round(size * 0.55);
    const halfH = Math.round(halfW * 2.0);
    return (
      <Wrap>
        <svg viewBox="0 0 100 200" width={halfW} height={halfH} style={{ display: "block" }}>
          <BodyView view="front" data={data} scheme={s} />
        </svg>
        <svg viewBox="0 0 100 200" width={halfW} height={halfH} style={{ display: "block" }}>
          <BodyView view="back" data={data} scheme={s} />
        </svg>
      </Wrap>
    );
  }

  const backDominant = data.back && data.back.p && data.back.p.length > 0 &&
                       (!data.front || !data.front.p || data.front.p.length === 0);
  const view = backDominant ? "back" : "front";

  return (
    <Wrap>
      <svg viewBox="0 0 100 200" width={size} height={h} style={{ display: "block" }}>
        <BodyView view={view} data={data} scheme={s} />
      </svg>
    </Wrap>
  );
}

const MUSCLE_SCHEMES = Object.entries(SCHEMES).map(([id, s]) => ({
  id,
  label: s.label,
  swatch: s.ramp(1) || "#888",
}));
const MUSCLE_VARIANTS = MUSCLE_SCHEMES;

Object.assign(window, { MuscleMap, MUSCLE_SCHEMES, MUSCLE_VARIANTS, MUSCLE_MAP, SCHEMES });
