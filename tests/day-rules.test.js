// Day-rule regression tests: node tests/day-rules.test.js
// Guards the fast-aware + rest-aware plan-day logic added 2026-07-13.
const T = require("../tracker-calc.js");

let failures = 0;
function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    failures++;
    console.error("FAIL " + label + " — expected " + expected + ", got " + actual);
  } else {
    console.log("ok   " + label);
  }
}

// 2026-07-13 is a Monday (workout day); 2026-07-11 is a Saturday (rest day).
const MON = "2026-07-13", TUE = "2026-07-14", SAT = "2026-07-11", SUN = "2026-07-12";
const none = new Set();

assertEqual(T.isWorkoutWeekday(MON), true, "Mon is a workout weekday");
assertEqual(T.isWorkoutWeekday(SAT), false, "Sat is a rest weekday");

// Workout day rules
assertEqual(T.isPlanDay({ workout: true, meal: true }, MON, none), true, "Mon: both tapped counts");
assertEqual(T.isPlanDay({ workout: false, meal: true }, MON, none), false, "Mon: meal only does not count");
assertEqual(T.isPlanDay({ workout: true, meal: false }, MON, none), false, "Mon: workout only does not count");
assertEqual(T.isPlanDay(undefined, MON, new Set([MON])), true, "Mon: fasted day counts with no taps");

// Rest day rules
assertEqual(T.isPlanDay({ meal: true }, SAT, none), true, "Sat: meal alone counts (no workout required)");
assertEqual(T.isPlanDay({ workout: true }, SAT, none), false, "Sat: workout alone does not count (meal required)");
assertEqual(T.isPlanDay(undefined, SAT, none), false, "Sat: empty day does not count");
assertEqual(T.isPlanDay(undefined, SAT, new Set([SAT])), true, "Sat: fasted day counts");

// Streak: fasted Mon + Tue after a clean-eaten Sunday, checked Wednesday morning (nothing yet Wed)
const daily = { [SUN]: { meal: true } };
const fasted = new Set([MON, TUE]);
assertEqual(T.planStreak(daily, "2026-07-15", fasted), 3, "streak: Sun meal + fasted Mon/Tue = 3 by Wed morning");

// Grid: fasting day renders done, empty past rest day renders missed
const cells = T.gridCells(SAT, TUE, daily, "2026-07-15", fasted);
const byKey = Object.fromEntries(cells.map(c => [c.key, c.status]));
assertEqual(byKey[SAT], "missed", "grid: empty past Sat = missed");
assertEqual(byKey[SUN], "done", "grid: Sun meal-only = done (rest day)");
assertEqual(byKey[MON], "done", "grid: fasted Mon = done");
assertEqual(byKey[TUE], "done", "grid: fasted Tue = done");

// Legacy call shape (no fastedDays arg) must not throw and stays strict
assertEqual(T.isPlanDay({ workout: true, meal: true }, MON), true, "legacy: no fasted set, both tapped");
assertEqual(T.isPlanDay({ meal: true }, MON), false, "legacy: no fasted set, Mon meal only");

if (failures) { console.error(failures + " failure(s)"); process.exit(1); }
console.log("All day-rule tests passed.");
