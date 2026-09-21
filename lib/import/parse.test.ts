import { test } from "node:test";
import assert from "node:assert/strict";
import { parseCsvTable } from "./parse.ts";

test("parseCsvTable: splits rows and trims cells, keeps blank rows", () => {
  const rows = parseCsvTable('Amount,Date\n1200,2026-09-15\n ,  \n\n75,9/3/2026');
  assert.deepEqual(rows, [
    ["Amount", "Date"],
    ["1200", "2026-09-15"],
    ["", ""],
    [""],
    ["75", "9/3/2026"],
  ]);
});

test("parseCsvTable: strips a leading BOM", () => {
  const rows = parseCsvTable("\uFEFFA,B\n1,2");
  assert.equal(rows[0][0], "A");
});

test("parseCsvTable: handles quoted cells with embedded commas", () => {
  const rows = parseCsvTable('A,B\n"1200","Client, invoice"\n');
  assert.deepEqual(rows[1], ["1200", "Client, invoice"]);
});