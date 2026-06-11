"use client";

import { useState, useTransition } from "react";
import { importTransactionsCsv, type ImportResult } from "@/app/actions/import";
import { parseTransactionsCsv } from "@/lib/csv";

const EXAMPLE = `fecha,tipo,importe,categoria,cuenta,nota
2026-06-01,ingreso,3200,Nómina,Efectivo,sueldo
2026-06-03,gasto,850,Vivienda,Efectivo,
2026-06-05,aportación,600,,Inversiones,`;

export function ImportCsv() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, startTransition] = useTransition();

  const preview = text.trim() ? parseTransactionsCsv(text) : null;

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then(setText);
  }

  function submit() {
    setResult(null);
    startTransition(async () => {
      const r = await importTransactionsCsv(text);
      setResult(r);
      if (r.imported > 0) setText("");
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl shadow-neu-inset p-4">
        <p className="text-sm text-ink/60">
          Sube un archivo CSV o pega su contenido. Columnas:{" "}
          <code className="text-xs">fecha, tipo, importe, categoria, cuenta, nota</code>. El tipo
          puede ser <em>ingreso, gasto, aportación o retirada</em>. La cuenta debe coincidir con una
          de tus cuentas.
        </p>
        <input type="file" accept=".csv,text/csv" onChange={onFile} className="mt-3 block text-sm" />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={EXAMPLE}
          rows={8}
          className="mt-3 w-full rounded-xl shadow-neu-inset p-3 font-mono text-xs"
        />
      </div>

      {preview && (
        <div className="rounded-2xl bg-surface p-4 text-sm">
          <p className="font-semibold">
            {preview.rows.length} movimiento(s) válido(s)
            {preview.errors.length > 0 && `, ${preview.errors.length} con error`}
          </p>
          {preview.errors.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-red-600">
              {preview.errors.slice(0, 5).map((e, i) => (
                <li key={i}>Línea {e.line}: {e.message}</li>
              ))}
              {preview.errors.length > 5 && <li>…y {preview.errors.length - 5} más</li>}
            </ul>
          )}
        </div>
      )}

      <button
        onClick={submit}
        disabled={pending || !preview || preview.rows.length === 0}
        className="w-full rounded-xl bg-teal py-3 font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Importando…" : `Importar ${preview?.rows.length ?? 0} movimiento(s)`}
      </button>

      {result && (
        <div className="rounded-2xl shadow-neu-sm bg-surface p-4 text-sm">
          <p className="font-semibold text-ink">
            ✓ {result.imported} movimiento(s) importado(s).
          </p>
          {result.unknownAccounts.length > 0 && (
            <p className="mt-1 text-amber-700">
              Cuentas no encontradas (omitidas): {result.unknownAccounts.join(", ")}. Créalas en
              Cuentas y vuelve a importar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
