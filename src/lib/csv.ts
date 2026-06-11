/**
 * CSV import parsing (PRD Phase 6) — pure, testable. Parses a transactions CSV
 * into normalized rows + a list of per-line errors. Account resolution (name →
 * id) happens later in the server action, not here.
 *
 * Expected header (Spanish, order-independent): fecha, tipo, importe, categoria,
 * cuenta, nota. `tipo` accepts Spanish words (ingreso/gasto/aportación/retirada).
 */
export type TxType = "income" | "expense" | "contribution" | "withdrawal";

export interface ParsedRow {
  date: string; // YYYY-MM-DD
  type: TxType;
  amount: number;
  category: string | null;
  accountName: string;
  note: string | null;
}

export interface ParseError {
  line: number; // 1-based, including header
  message: string;
}

export interface ParseResult {
  rows: ParsedRow[];
  errors: ParseError[];
}

const TYPE_MAP: Record<string, TxType> = {
  ingreso: "income",
  income: "income",
  gasto: "expense",
  expense: "expense",
  aportacion: "contribution",
  aportación: "contribution",
  contribution: "contribution",
  retirada: "withdrawal",
  withdrawal: "withdrawal",
};

/** Split a single CSV line into fields, honoring double-quoted values. */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

/** True when y-m-d is a real calendar date. */
function isRealDate(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12 || d < 1 || d > 31) return false;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

/** Normalize a date string (YYYY-MM-DD or DD/MM/YYYY) to YYYY-MM-DD, or null. */
function parseDate(raw: string): string | null {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (iso) {
    const [, y, m, d] = iso;
    return isRealDate(+y, +m, +d) ? raw : null;
  }
  const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
  if (dmy) {
    const [, d, m, y] = dmy;
    return isRealDate(+y, +m, +d) ? `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}` : null;
  }
  return null;
}

/** Parse an amount accepting "1234.56" or Spanish "1.234,56" / "1234,56". */
function parseAmount(raw: string): number {
  let s = raw.replace(/\s/g, "").replace(/€/g, "");
  if (s.includes(",") && s.includes(".")) {
    // Assume "." thousands, "," decimal (es-ES).
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",")) {
    s = s.replace(",", ".");
  }
  return Number(s);
}

export function parseTransactionsCsv(text: string): ParseResult {
  const rows: ParsedRow[] = [];
  const errors: ParseError[] = [];

  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
  if (lines.length === 0) {
    return { rows, errors: [{ line: 0, message: "El archivo está vacío." }] };
  }

  const header = splitCsvLine(lines[0]).map((h) => h.toLowerCase());
  const col = (name: string) => header.indexOf(name);
  const idx = {
    fecha: col("fecha"),
    tipo: col("tipo"),
    importe: col("importe"),
    categoria: col("categoria"),
    cuenta: col("cuenta"),
    nota: col("nota"),
  };

  for (const key of ["fecha", "tipo", "importe", "cuenta"] as const) {
    if (idx[key] === -1) {
      errors.push({ line: 1, message: `Falta la columna obligatoria "${key}".` });
    }
  }
  if (errors.length > 0) return { rows, errors };

  for (let i = 1; i < lines.length; i++) {
    const fields = splitCsvLine(lines[i]);
    const lineNo = i + 1;

    const date = parseDate(fields[idx.fecha] ?? "");
    if (!date) {
      errors.push({ line: lineNo, message: `Fecha no válida: "${fields[idx.fecha] ?? ""}".` });
      continue;
    }

    const type = TYPE_MAP[(fields[idx.tipo] ?? "").toLowerCase()];
    if (!type) {
      errors.push({ line: lineNo, message: `Tipo no válido: "${fields[idx.tipo] ?? ""}".` });
      continue;
    }

    const amount = parseAmount(fields[idx.importe] ?? "");
    if (!Number.isFinite(amount) || amount <= 0) {
      errors.push({ line: lineNo, message: `Importe no válido: "${fields[idx.importe] ?? ""}".` });
      continue;
    }

    const accountName = (fields[idx.cuenta] ?? "").trim();
    if (!accountName) {
      errors.push({ line: lineNo, message: "Falta la cuenta." });
      continue;
    }

    rows.push({
      date,
      type,
      amount,
      category: idx.categoria !== -1 ? (fields[idx.categoria]?.trim() || null) : null,
      accountName,
      note: idx.nota !== -1 ? (fields[idx.nota]?.trim() || null) : null,
    });
  }

  return { rows, errors };
}
