import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseImportFile } from "@/lib/import/parse";
import {
  detectHeaderAndMapping,
  prepareImportRows,
  type ColumnMapping,
} from "@/lib/import/validate";

const MAX_FILE_BYTES = 2 * 1024 * 1024;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A file is required" }, { status: 400 });
  }
  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json({ error: "File must be 2 MB or smaller" }, { status: 400 });
  }

  const useAuto = form.get("useAuto") === "1";

  let mapping: ColumnMapping;
  let skipRows: number;
  if (useAuto) {
    mapping = { amount: 0, date: 1, category: null, note: null };
    skipRows = 0;
  } else {
    try {
      mapping = JSON.parse(String(form.get("mapping") ?? "")) as ColumnMapping;
    } catch {
      return NextResponse.json({ error: "Mapping is required" }, { status: 400 });
    }
    skipRows = Number(form.get("skipRows") ?? 0);
    if (!Number.isInteger(skipRows) || skipRows < 0) {
      return NextResponse.json({ error: "skipRows must be a non-negative integer" }, { status: 400 });
    }
  }

  const ext = file.name.split(".").pop()?.toLowerCase();
  const payload =
    ext === "xlsx" || ext === "xls"
      ? { buffer: await file.arrayBuffer() }
      : { text: await file.text() };
  const { rows } = parseImportFile(file.name, payload);

  const { data: categories } = await supabase
    .from("Category")
    .select("id,name,type")
    .eq("userId", user.id)
    .order("name");

  const auto = detectHeaderAndMapping(rows, categories ?? []);
  if (useAuto) {
    mapping = auto.mapping;
    skipRows = auto.hasHeader ? 1 : 0;
  }

  const prepared = prepareImportRows(rows, mapping, skipRows, categories ?? []);

  return NextResponse.json({
    fileName: file.name,
    rowCount: rows.length,
    firstRow: rows[0] ?? [],
    parsedRows: rows,
    categories: categories ?? [],
    auto,
    rows: prepared,
    summary: {
      total: prepared.length,
      ok: prepared.filter((r) => r.status === "ok").length,
      warning: prepared.filter((r) => r.status === "warning").length,
      error: prepared.filter((r) => r.status === "error").length,
      blank: prepared.filter((r) => r.status === "blank").length,
    },
  });
}