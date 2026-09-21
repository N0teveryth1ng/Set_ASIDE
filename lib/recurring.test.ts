import { test } from "node:test";
import assert from "node:assert/strict";
import {
  clampDayInMonth,
  isRealDate,
  monthKey,
  occurrenceDates,
  parseTemplateInput,
  parseTemplatePatch,
  type TemplateSchedule,
} from "./recurring.ts";

test("clampDayInMonth keeps a normal day", () => {
  assert.equal(clampDayInMonth("2026-07", 10), "2026-07-10");
});

test("clampDayInMonth clamps day 31 in February", () => {
  assert.equal(clampDayInMonth("2026-02", 31), "2026-02-28");
});

test("clampDayInMonth handles a leap-year February", () => {
  assert.equal(clampDayInMonth("2028-02", 31), "2028-02-29");
});

test("clampDayInMonth pads single-digit days", () => {
  assert.equal(clampDayInMonth("2026-01", 5), "2026-01-05");
});

test("clampDayInMonth clamps day 31 in April", () => {
  assert.equal(clampDayInMonth("2026-04", 31), "2026-04-30");
});

test("monthKey returns the YYYY-MM prefix", () => {
  assert.equal(monthKey("2026-10-21"), "2026-10");
});

test("isRealDate rejects impossible dates", () => {
  assert.equal(isRealDate("2026-02-30"), false);
  assert.equal(isRealDate("2026-13-01"), false);
  assert.equal(isRealDate("2026-02-28"), true);
});

test("occurrenceDates emits every month in the range", () => {
  const schedule: TemplateSchedule = {
    dayOfMonth: 10,
    startDate: "2026-01-01",
    endDate: null,
  };
  assert.deepEqual(occurrenceDates(schedule, "2026-01-01", "2026-03-31"), [
    "2026-01-10",
    "2026-02-10",
    "2026-03-10",
  ]);
});

test("occurrenceDates skips the first month when the day is before the start date", () => {
  const schedule: TemplateSchedule = {
    dayOfMonth: 10,
    startDate: "2026-01-15",
    endDate: null,
  };
  assert.deepEqual(occurrenceDates(schedule, "2026-01-01", "2026-03-31"), [
    "2026-02-10",
    "2026-03-10",
  ]);
});

test("occurrenceDates skips the boundary month when the occurrence predates startDate", () => {
  const schedule: TemplateSchedule = {
    dayOfMonth: 15,
    startDate: "2026-01-20",
    endDate: null,
  };
  assert.deepEqual(occurrenceDates(schedule, "2026-01-01", "2026-03-31"), [
    "2026-02-15",
    "2026-03-15",
  ]);
});

test("occurrenceDates excludes an endDate-clamped occurrence that lands after endDate", () => {
  const schedule: TemplateSchedule = {
    dayOfMonth: 31,
    startDate: "2026-01-15",
    endDate: "2026-02-20",
  };
  assert.deepEqual(occurrenceDates(schedule, "2026-01-01", "2026-02-28"), [
    "2026-01-31",
  ]);
});

test("occurrenceDates includes the end month when the occurrence equals endDate", () => {
  const schedule: TemplateSchedule = {
    dayOfMonth: 10,
    startDate: "2026-01-10",
    endDate: "2026-02-10",
  };
  assert.deepEqual(occurrenceDates(schedule, "2026-01-01", "2026-04-30"), [
    "2026-01-10",
    "2026-02-10",
  ]);
});

test("occurrenceDates crosses year boundaries", () => {
  const schedule: TemplateSchedule = {
    dayOfMonth: 31,
    startDate: "2025-12-31",
    endDate: null,
  };
  assert.deepEqual(occurrenceDates(schedule, "2025-12-01", "2026-02-28"), [
    "2025-12-31",
    "2026-01-31",
    "2026-02-28",
  ]);
});

test("occurrenceDates keeps a day-of-month that exists in a short month", () => {
  const schedule: TemplateSchedule = {
    dayOfMonth: 28,
    startDate: "2026-01-28",
    endDate: null,
  };
  assert.deepEqual(occurrenceDates(schedule, "2026-02-01", "2026-02-28"), [
    "2026-02-28",
  ]);
});

test("occurrenceDates returns nothing when the through date predates startDate", () => {
  const schedule: TemplateSchedule = {
    dayOfMonth: 10,
    startDate: "2026-06-01",
    endDate: null,
  };
  assert.deepEqual(occurrenceDates(schedule, "2026-01-01", "2026-05-31"), []);
});

test("parseTemplateInput rejects a non-object body", () => {
  const parsed = parseTemplateInput("nope");
  assert.equal(parsed.ok, false);
});

test("parseTemplateInput validates amountCents", () => {
  const base = {
    amountCents: 1000,
    dayOfMonth: 1,
    startDate: "2026-01-01",
  };
  const parsed = parseTemplateInput({ ...base, amountCents: 0 });
  assert.equal(parsed.ok, false);
  if (!parsed.ok) assert.match(parsed.errors[0], /amountCents/);
});

test("parseTemplateInput validates dayOfMonth bounds", () => {
  const base = {
    amountCents: 1000,
    startDate: "2026-01-01",
  };
  assert.equal(parseTemplateInput({ ...base, dayOfMonth: 0 }).ok, false);
  assert.equal(parseTemplateInput({ ...base, dayOfMonth: 32 }).ok, false);
  assert.equal(parseTemplateInput({ ...base, dayOfMonth: 1 }).ok, true);
});

test("parseTemplateInput rejects an endDate before startDate", () => {
  const parsed = parseTemplateInput({
    amountCents: 1000,
    dayOfMonth: 1,
    startDate: "2026-02-01",
    endDate: "2026-01-31",
  });
  assert.equal(parsed.ok, false);
  if (!parsed.ok) assert.match(parsed.errors.join("; "), /endDate/);
});

test("parseTemplateInput accepts an open endDate", () => {
  const parsed = parseTemplateInput({
    amountCents: 1000,
    dayOfMonth: 15,
    startDate: "2026-01-01",
    endDate: null,
  });
  assert.equal(parsed.ok, true);
  if (parsed.ok) assert.equal(parsed.value.endDate, null);
});

test("parseTemplateInput applies an active default of true", () => {
  const parsed = parseTemplateInput({
    amountCents: 1000,
    dayOfMonth: 15,
    startDate: "2026-01-01",
  });
  assert.equal(parsed.ok, true);
  if (parsed.ok) assert.equal(parsed.value.active, true);
});

test("parseTemplatePatch validates active when present", () => {
  const parsed = parseTemplatePatch({ active: "yes" });
  assert.equal(parsed.ok, false);
  if (!parsed.ok) assert.match(parsed.errors[0], /active/);
});

test("parseTemplatePatch only picks fields present in the body", () => {
  const parsed = parseTemplatePatch({ note: "  " });
  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.deepEqual(Object.keys(parsed.fields), ["note"]);
    assert.equal(parsed.fields.note, null);
  }
});

test("parseTemplatePatch accepts clearing endDate to null", () => {
  const parsed = parseTemplatePatch({ endDate: null });
  assert.equal(parsed.ok, true);
  if (parsed.ok) assert.equal(parsed.fields.endDate, null);
});