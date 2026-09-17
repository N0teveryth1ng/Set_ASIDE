import { test } from "node:test";
import assert from "node:assert/strict";
import { parseEntryInput } from "./entry-input.ts";

test("accepts a valid manual entry", () => {
  const res = parseEntryInput({
    amountCents: 420000,
    date: "2026-09-15",
    categoryId: "cat-1",
    note: "  Client invoice  ",
  });
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.value.amountCents, 420000);
    assert.equal(res.value.date, "2026-09-15");
    assert.equal(res.value.categoryId, "cat-1");
    assert.equal(res.value.note, "Client invoice");
  }
});

test("accepts an Uncategorized entry", () => {
  const res = parseEntryInput({ amountCents: 7777, date: "2026-09-14", categoryId: null });
  assert.equal(res.ok, true);
  if (res.ok) {
    assert.equal(res.value.categoryId, null);
    assert.equal(res.value.note, null);
  }
});

test("rejects a blank note as null", () => {
  const res = parseEntryInput({ amountCents: 1, date: "2026-09-14", note: "   " });
  assert.equal(res.ok, true);
  if (res.ok) assert.equal(res.value.note, null);
});

test("rejects zero, negative, and fractional amounts", () => {
  for (const bad of [0, -100, 100.5, -1]) {
    const res = parseEntryInput({ amountCents: bad, date: "2026-09-14", categoryId: null });
    assert.equal(res.ok, false, `amount ${bad}`);
  }
});

test("rejects non-number amounts (strings, floats via coercion, NaN)", () => {
  for (const bad of ["100", true, NaN, Infinity, 100.0000001]) {
    const res = parseEntryInput({ amountCents: bad, date: "2026-09-14" });
    assert.equal(res.ok, false, `amount ${String(bad)}`);
  }
});

test("rejects missing or malformed dates", () => {
  for (const bad of [undefined, "", "15/09/2026", "2026-9-15", "2026-02-31", "2026-13-01"]) {
    const res = parseEntryInput({ amountCents: 100, date: bad });
    assert.equal(res.ok, false, `date ${String(bad)}`);
  }
});

test("rejects empty or non-string categoryId", () => {
  for (const bad of ["", 42, {}]) {
    const res = parseEntryInput({ amountCents: 100, date: "2026-09-14", categoryId: bad });
    assert.equal(res.ok, false, `categoryId ${String(bad)}`);
  }
});

test("rejects oversized notes", () => {
  const res = parseEntryInput({
    amountCents: 100,
    date: "2026-09-14",
    note: "x".repeat(501),
  });
  assert.equal(res.ok, false);
});

test("rejects non-object bodies", () => {
  for (const bad of [null, "hello", 5, ["x"]]) {
    assert.equal(parseEntryInput(bad).ok, false, String(bad));
  }
});