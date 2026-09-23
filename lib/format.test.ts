import { test } from "node:test";
import assert from "node:assert/strict";
import { pluralize } from "./format.ts";

test("pluralize: uses singular for 1", () => {
  assert.equal(pluralize(1, "entry"), "1 entry");
});

test("pluralize: auto-pluralizes consonant+y with ies", () => {
  assert.equal(pluralize(3, "category"), "3 categories");
});

test("pluralize: auto-pluralizes x/s/ch with es", () => {
  assert.equal(pluralize(3, "itemx"), "3 itemxes");
});

test("pluralize: uses explicit plural form", () => {
  assert.equal(pluralize(3, "category", "categories"), "3 categories");
});