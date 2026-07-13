/* tracker-calc.js — pure, testable math for the Health tracker.
   Works in the browser (sets window.TrackerCalc) and in Node (module.exports)
   so the same functions the page renders with are the ones under test.
   No DOM, no network — just numbers and dates. */
(function (root) {
  "use strict";

  // Locked from the goal sheet (33.4% body fat anchor).
  const START_WEIGHT = 258.4;
  const GOAL_WEIGHT = 202.5;
  const LEAN_MASS = 172.1;
  const START_BF = 33.4;
  const GOAL_BF = 15;
  const TOTAL_LOSS = START_WEIGHT - GOAL_WEIGHT;

  // 6-month commitment window.
  const GRID_START = "2026-06-25"; // default plan start; overridable per user

  const MILESTONES = [
    { label: "First 10 lb", weight: 248.4 },
    { label: "First 20 lb", weight: 238.4 },
    { label: "Halfway (28 lb)", weight: 230.4 },
    { label: "First 40 lb", weight: 218.4 },
    { label: "Goal — 56 lb", weight: 202.5 },
  ];

  function ymd(d) {
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  function fromKey(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  function addDays(date, n) {
    const x = new Date(date);
    x.setDate(x.getDate() + n);
    return x;
  }

  function daysBetween(aKey, bKey) {
    return Math.round((fromKey(bKey) - fromKey(aKey)) / 86400000);
  }

  function calcBF(weight) {
    return ((weight - LEAN_MASS) / weight) * 100;
  }

  function fatMass(weight) {
    return weight - LEAN_MASS;
  }

  function weeksToGoal(weight, pace) {
    return Math.max(0, Math.ceil((weight - GOAL_WEIGHT) / pace));
  }

  // Program schedule: lifting days are Mon/Wed/Fri (see workout.html).
  const WORKOUT_WEEKDAYS = [1, 3, 5];

  function isWorkoutWeekday(dayKey) {
    return WORKOUT_WEEKDAYS.includes(fromKey(dayKey).getDay());
  }

  // A day counts toward the plan when it matches the program actually being run:
  // - a fasted day (16h+ fasting that day, computed by the page) counts on its own;
  //   demanding a workout mid water-fast would punish the most disciplined days
  // - otherwise "ate clean" is always required, "worked out" only on Mon/Wed/Fri
  function isPlanDay(dayEntry, dayKey, fastedDays) {
    if (fastedDays && fastedDays.has(dayKey)) return true;
    const meal = !!(dayEntry && dayEntry.meal);
    const workout = !!(dayEntry && dayEntry.workout);
    return meal && (workout || !isWorkoutWeekday(dayKey));
  }

  // Consecutive plan-days ending today (or yesterday if today isn't done yet).
  function planStreak(daily, todayKey, fastedDays) {
    let streak = 0;
    let d = fromKey(todayKey);
    if (!isPlanDay(daily[todayKey], todayKey, fastedDays)) d = addDays(d, -1);
    for (let i = 0; i < 400; i++) {
      const key = ymd(d);
      if (isPlanDay(daily[key], key, fastedDays)) {
        streak++;
        d = addDays(d, -1);
      } else {
        break;
      }
    }
    return streak;
  }

  // One cell per calendar day from start..end inclusive.
  // status: done | missed (past, not a plan day) | today | future
  function gridCells(startKey, endKey, daily, todayKey, fastedDays) {
    const end = fromKey(endKey);
    const today = fromKey(todayKey);
    const cells = [];
    let cur = fromKey(startKey);
    while (cur <= end) {
      const key = ymd(cur);
      let status;
      if (isPlanDay(daily[key], key, fastedDays)) status = "done";
      else if (+cur === +today) status = "today";
      else if (cur < today) status = "missed";
      else status = "future";
      cells.push({ key, status, weekday: cur.getDay(), date: cur.getDate(), month: cur.getMonth() });
      cur = addDays(cur, 1);
    }
    return cells;
  }

  function addMonths(key, n) {
    const d = fromKey(key);
    d.setMonth(d.getMonth() + n);
    return ymd(d);
  }

  function sixMonthEnd(startKey) {
    return addMonths(startKey, 6);
  }

  function gridSummary(cells, startKey, todayKey) {
    const total = cells.length;
    const done = cells.filter(c => c.status === "done").length;
    const offset = daysBetween(startKey, todayKey); // today - start
    const started = offset >= 0;
    return {
      total,
      done,
      started,
      dayNumber: started ? Math.min(total, offset + 1) : 0,
      daysUntilStart: started ? 0 : -offset,
    };
  }

  function estDateLabel(startKey, weeks) {
    return addDays(fromKey(startKey), weeks * 7)
      .toLocaleDateString("en-US", { month: "short", year: "numeric" });
  }

  function milestoneDate(targetWeight, startKey, pace) {
    const weeks = Math.ceil((START_WEIGHT - targetWeight) / pace);
    return estDateLabel(startKey, weeks);
  }

  const api = {
    ymd, fromKey, addDays, addMonths, daysBetween,
    calcBF, fatMass, weeksToGoal,
    isPlanDay, isWorkoutWeekday, planStreak, gridCells, gridSummary, sixMonthEnd,
    estDateLabel, milestoneDate,
    MILESTONES,
    consts: { START_WEIGHT, GOAL_WEIGHT, LEAN_MASS, START_BF, GOAL_BF, TOTAL_LOSS, GRID_START },
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.TrackerCalc = api;
})(typeof window !== "undefined" ? window : globalThis);
