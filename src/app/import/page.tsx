import { Nav } from "@/components/ui/Nav";
import { ImportCsv } from "@/components/import/ImportCsv";

export const dynamic = "force-dynamic";

export default function ImportPage() {
  return (
    <main className="mx-auto max-w-md px-5 pb-16 pt-2">
      <Nav active="accounts" />
      <h1 className="mt-3 text-xl font-bold">Importar movimientos</h1>
      <p className="text-sm text-gray-500">
        Trae tu historial desde un CSV (por ejemplo, exportado de tu banco y adaptado a estas
        columnas).
      </p>
      <div className="mt-4">
        <ImportCsv />
      </div>
    </main>
  );
}
