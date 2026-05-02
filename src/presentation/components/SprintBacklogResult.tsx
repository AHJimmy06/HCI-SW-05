import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Zap, Download, X, Copy, Check, FileText
} from "lucide-react";
import type { SprintBacklogCSV } from "../../domain/entities/types";
import { useState } from "react";

interface Props {
  backlog: SprintBacklogCSV | null;
  open: boolean;
  onClose: () => void;
  productName: string;
}

const PRIORITY_COLOR: Record<string, string> = {
  Crítica: "bg-red-600 text-white",
  Alta:    "bg-amber-500 text-white",
  Media:   "bg-blue-500 text-white",
  Baja:    "bg-slate-400 text-white",
};

function parseCSVBlock(csv: string): { headers: string[]; rows: string[][] } {
  const lines = csv.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const rows: string[][] = [];

  let currentRow = "";
  for (const line of lines.slice(1)) {
    currentRow += (currentRow ? "\n" : "") + line;
    const quotes = (currentRow.match(/"/g) || []).length;
    if (quotes % 2 === 0) {
      const values = currentRow.split(",").map((v) => v.trim().replace(/^"|"$/g, "").replace(/""/g, '"'));
      rows.push(values);
      currentRow = "";
    }
  }

  return { headers, rows };
}

function CSVRows({ csv }: { csv: string }) {
  const { headers, rows } = parseCSVBlock(csv);
  if (!headers.length) return null;

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {headers.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-bold text-slate-600 uppercase tracking-wider">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              {row.map((cell, ci) => {
                const isPriority = headers[ci] === "Priority";
                const isStatus = headers[ci] === "Status";
                return (
                  <td key={ci} className="px-3 py-2 text-slate-700">
                    {isPriority ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_COLOR[cell] || "bg-slate-100"}`}>
                        {cell}
                      </span>
                    ) : isStatus ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {cell}
                      </span>
                    ) : (
                      <span className="leading-relaxed">{cell}</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SprintBacklogResult({ backlog, open, onClose, productName }: Props) {
  const [copied, setCopied] = useState<"us" | "tasks" | null>(null);

  if (!backlog) return null;

  const handleExportUS = () => {
    const blob = new Blob([backlog.user_stories_csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SprintBacklog_${productName.replace(/\s+/g, "_")}_HistoriasUsuario.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportTasks = () => {
    const blob = new Blob([backlog.tasks_csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SprintBacklog_${productName.replace(/\s+/g, "_")}_TareasTecnicas.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async (type: "us" | "tasks") => {
    const text = type === "us" ? backlog.user_stories_csv : backlog.tasks_csv;
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2500);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl w-[94vw] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText size={18} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                {backlog.sprint_nombre || "Sprint Backlog"}
              </DialogTitle>
              <p className="text-xs text-slate-500">Sprint Backlog generado por IA • Formato CSV para Notion</p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Objetivo */}
          <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
              <Zap size={10} className="inline mr-1" />
              Objetivo del Sprint
            </p>
            <p className="text-sm text-slate-800 leading-relaxed">
              {backlog.objetivo_sprint || "No definido"}
            </p>
          </div>

          {/* Instrucciones Notion */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-start gap-3">
              <FileText size={20} className="text-slate-700 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-900 mb-1">Cómo importar a Notion</p>
                <ol className="text-xs text-slate-600 leading-relaxed space-y-1">
                  <li>1. Crea dos databases en Notion: <strong>"Historias de Usuario"</strong> y <strong>"Tareas Técnicas"</strong></li>
                  <li>2. En cada database, crea las columnas: ID, Name, Type, Priority, Estimate, Status, Description (para US) o ID, Name, Assignee, Estimate, Status (para Tasks)</li>
                  <li>3. En cada database, usá <strong>Import → CSV</strong> y subí los archivos exportados</li>
                  <li>4. Relacioná las dos databases usando la propiedad <strong>ID</strong></li>
                </ol>
              </div>
            </div>
          </div>

          {/* Historias de Usuario */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Historias de Usuario
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {parseCSVBlock(backlog.user_stories_csv).rows.length} registros
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy("us")}
                  className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900 gap-1"
                >
                  {copied === "us" ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  {copied === "us" ? "¡Copiado!" : "Copiar CSV"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportUS}
                  className="h-7 px-2 text-xs border-slate-300 text-slate-700 hover:bg-slate-50 gap-1"
                >
                  <Download size={12} />
                  Descargar CSV
                </Button>
              </div>
            </div>
            <CSVRows csv={backlog.user_stories_csv} />
          </div>

          {/* Tareas Técnicas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tareas Técnicas
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {parseCSVBlock(backlog.tasks_csv).rows.length} registros
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy("tasks")}
                  className="h-7 px-2 text-xs text-slate-600 hover:text-slate-900 gap-1"
                >
                  {copied === "tasks" ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
                  {copied === "tasks" ? "¡Copiado!" : "Copiar CSV"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportTasks}
                  className="h-7 px-2 text-xs border-slate-300 text-slate-700 hover:bg-slate-50 gap-1"
                >
                  <Download size={12} />
                  Descargar CSV
                </Button>
              </div>
            </div>
            <CSVRows csv={backlog.tasks_csv} />
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-slate-200 shrink-0">
          <div className="flex flex-row items-center gap-3 w-full justify-end">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <X size={14} className="mr-2" />
              Cerrar
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
