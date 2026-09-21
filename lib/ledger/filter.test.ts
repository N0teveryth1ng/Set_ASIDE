import { test } from "node:test";
import assert from "node:assert/strict";
import { withoutHiddenCategories } from "./filter.ts";

const hiddenId = "cat-hidden";

function row(category: unknown) {
  return { id: "e", amountCents: 1, date: "2026-09-01", note: null, category };
}

test("keeps uncategorized rows even when a hidden set exists", () => {
  const rows = [row(null), row(undefined)];
  assert.equal(withoutHiddenCategories(rows, new Set([hiddenId])).length, 2);
});

test("drops rows whose category is in the hidden set", () => {
  const rows = [row({ id: hiddenId, name: "Software", type: "OUT" }), row({ id: "other", name: "Merch", type: "IN" })];
  const kept = withoutHiddenCategories(rows, new Set([hiddenId]));
  assert.equal(kept.length, 1);
  assert.equal(kept[0].category, (rows[1] as { category: unknown }).category);
});

test("supports the PostgREST embed-as-array shape", () => {
  const rows = [row([{ id: hiddenId, name: "Software", type: "OUT" }])];
  assert.equal(withoutHiddenCategories(rows, new Set([hiddenId])).length, 0);
});

test("malformed embeds are treated as uncategorized and kept", () => {
  const rows = [row({ id: 7, name: 123, type: "weird" })];
  assert.equal(withoutHiddenCategories(rows, new Set([hiddenId])).length, 1);
});