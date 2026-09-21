import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_CARDS,
  normalizeCards,
  normalizeCategoryName,
  normalizeCurrency,
  normalizeHidden,
  normalizeSortOrder,
  normalizeTaxRate,
  normalizeCategoryType,
} from "./settings.ts";

test("normalizeCards: accepts the default order", () => {
  const r = normalizeCards(DEFAULT_CARDS);
  assert.equal(r.ok, true);
  if (r.ok) assert.deepEqual(r.value, DEFAULT_CARDS);
});

test("normalizeCards: preserves custom order", () => {
  const order = ["tax", "hero", "breakdown", "trend", "money"];
  const r = normalizeCards(order);
  assert.equal(r.ok, true);
  if (r.ok) assert.deepEqual(r.value, order);
});

test("normalizeCards: rejects subset? no — subsets are valid", () => {
  const r = normalizeCards(["hero", "tax"]);
  assert.equal(r.ok, true);
});

test("normalizeCards: rejects unknown token", () => {
  const r = normalizeCards(["bogus", "hero"]);
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /unknown card token/);
});

test("normalizeCards: rejects duplicates", () => {
  const r = normalizeCards(["hero", "hero"]);
  assert.equal(r.ok, false);
  if (!r.ok) assert.match(r.error, /duplicate/);
});

test("normalizeCards: rejects empty and non-arrays", () => {
  assert.equal(normalizeCards([]).ok, false);
  assert.equal(normalizeCards("hero").ok, false);
  assert.equal(normalizeCards(null).ok, false);
});

test("normalizeCards: rejects more than five sections", () => {
  const r = normalizeCards(["hero", "money", "tax", "breakdown", "trend", "hero"]);
  assert.equal(r.ok, false);
});

test("normalizeTaxRate: valid bounds", () => {
  assert.equal(normalizeTaxRate(0).ok, true);
  assert.equal(normalizeTaxRate(23.5).ok, true);
  assert.equal(normalizeTaxRate(100).ok, true);
});

test("normalizeTaxRate: rejects out of range / non-numbers", () => {
  assert.equal(normalizeTaxRate(-1).ok, false);
  assert.equal(normalizeTaxRate(101).ok, false);
  assert.equal(normalizeTaxRate("23").ok, false);
  assert.equal(normalizeTaxRate(NaN).ok, false);
  assert.equal(normalizeTaxRate(null).ok, false);
});

test("normalizeCurrency: USD allowed, everything else rejected", () => {
  assert.equal(normalizeCurrency("USD").ok, true);
  assert.equal(normalizeCurrency("EUR").ok, false);
  assert.equal(normalizeCurrency(123).ok, false);
});

test("normalizeCategoryName: trims and length-checks", () => {
  const r = normalizeCategoryName("  Subscriptions  ");
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.value, "Subscriptions");
  assert.equal(normalizeCategoryName("").ok, false);
  assert.equal(normalizeCategoryName("   ").ok, false);
  assert.equal(normalizeCategoryName("x".repeat(51)).ok, false);
});

test("normalizeCategoryType / hidden / sortOrder", () => {
  assert.equal(normalizeCategoryType("IN").ok, true);
  assert.equal(normalizeCategoryType("OUT").ok, true);
  assert.equal(normalizeCategoryType("in").ok, false);
  assert.equal(normalizeHidden(true).ok, true);
  assert.equal(normalizeHidden("yes").ok, false);
  assert.equal(normalizeSortOrder(7).ok, true);
  assert.equal(normalizeSortOrder(-1).ok, false);
  assert.equal(normalizeSortOrder(1.5).ok, false);
  assert.equal(normalizeSortOrder("7").ok, false);
});