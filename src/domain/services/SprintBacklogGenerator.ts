import { chatCompletion } from "../../lib/ai";
import type { FullTestPlan, Finding } from "../entities/types";

export interface SprintBacklogCSV {
  sprint_nombre: string;
  duracion_sprint_dias: number;
  objetivo_sprint: string;
  definition_of_done: string[];
  notas: string;
  user_stories_csv: string;   // CSV de historias de usuario
  tasks_csv: string;           // CSV de tareas técnicas
}

function buildPrompt(plan: FullTestPlan): string {
  const findings: Finding[] = plan.findings || [];

  const findingsText = findings
    .map(
      (f, i) =>
        `Hallazgo ${i + 1}:
  - Problema: ${f.problem}
  - Severidad: ${f.severity}
  - Prioridad: ${f.priority}
  - Recomendación: ${f.recommendation}
  - Evidencia: ${f.evidence}
  - Frecuencia: ${f.frequency}`
    )
    .join("\n\n");

  return `Eres un Product Owner experto en metodologías ágiles Scrum. Basándote en los hallazgos de una evaluación de usabilidad, genera un Sprint Backlog.

 CONTEXTO DEL PRODUCTO:
- Producto: ${plan.product_name}
- Módulo: ${plan.module_name || "No especificado"}
- Objetivo del test: ${plan.objective || "No definido"}
- Perfil de usuario: ${plan.user_profile || "No definido"}
- Metodología: SCRUM

 HALLAZGOS DEL TEST DE USABILIDAD:
 ${findingsText || "No se encontraron hallazgos en este test."}

 REGLAS ESTRICTAS:
 - Genera como MÁXIMO 6 user stories y como MÁXIMO 12 tareas técnicas.
 - Cada bloque CSV debe comenzar con su línea de HEADER, seguida de las filas de datos.
 - NO uses JSON, NO markdown, NO explicaciones. Solo texto plano con los DOS CSVs.
 - El separador entre bloques es UNA LÍNEA VACÍA.
 - Los campos Description que contengan comas o saltos de línea deben ir entre comillas dobles.
 - Assignee en tareas siempre vacío ("").
 - El primer campo (ID) es numérico secuencial: 1, 2, 3...

 FORMATO EXACTO DE RESPUESTA:

 [CSV 1: HISTORIAS DE USUARIO]
 ID,Name,Type,Priority,Estimate,Status,Description
 1,"Como [rol], quiero [acción] para [beneficio]. CRITERIOS: 1. [criterio] | 2. [criterio]",feature,Alta,3,To Do,"Descripción detallada"
 ...

 [CSV 2: TAREAS TÉCNICAS]
 ID,Name,Assignee,Estimate,Status
 1,Tarea técnica 1,"",4h,To Do
 ...`;
}

function parseResponse(content: string): SprintBacklogCSV {
  // Remove markdown code blocks if present
  let text = content.trim();
  if (text.startsWith("```csv")) text = text.slice(5);
  else if (text.startsWith("```")) text = text.slice(3);
  if (text.endsWith("```")) text = text.slice(0, -3);
  text = text.trim();

  // Split by the second CSV marker or by blank line + ID, pattern
  const csv2Marker = "[CSV 2: TAREAS TÉCNICAS]";
  let separatorIndex = text.indexOf(csv2Marker);

  let usPart = text;
  let tasksPart = "";

  if (separatorIndex !== -1) {
    // Take everything BEFORE the [CSV 2...] marker as US part
    // But also remove the [CSV 1...] header line if present
    usPart = text.substring(0, separatorIndex).trim();
    tasksPart = text.substring(separatorIndex + csv2Marker.length).trim();
  } else {
    // Try splitting by blank line + "ID," pattern
    const parts = text.split(/\n\n(?=ID,)/);
    if (parts.length >= 2) {
      usPart = parts[0];
      tasksPart = parts.slice(1).join("\n");
    }
  }

  // Strip CSV 1 marker from usPart if present (AI sometimes includes it)
  const csv1Marker = "[CSV 1: HISTORIAS DE USUARIO]";
  if (usPart.includes(csv1Marker)) {
    usPart = usPart.substring(usPart.indexOf(csv1Marker) + csv1Marker.length).trim();
  }

  // Strip CSV 2 marker from tasksPart if present
  if (tasksPart.includes(csv2Marker)) {
    tasksPart = tasksPart.substring(tasksPart.indexOf(csv2Marker) + csv2Marker.length).trim();
  }

  // Parse CSVs - skip header line (ID,Name,...)
  const parseCSV = (raw: string): string[][] => {
    const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return [];
    const rows: string[][] = [];
    let currentRow = "";

    for (const line of lines) {
      // Skip the header row
      if (line.match(/^ID,Name,/i) || line.match(/^ID,Name,/)) continue;
      currentRow += (currentRow ? "\n" : "") + line;
      const quoteCount = (currentRow.match(/"/g) || []).length;
      if (quoteCount % 2 === 0) {
        rows.push(currentRow.split(","));
        currentRow = "";
      }
    }
    return rows;
  };

  const usRows = parseCSV(usPart);
  const taskRows = parseCSV(tasksPart);

  // Extract sprint metadata from the first user story row if available
  const sprintNombre = usRows[0]?.[1] || "Sprint 1";
  const duracion = 14;
  const objetivo = "";

  // Build user stories CSV
  const usHeader = "ID,Name,Type,Priority,Estimate,Status,Description";
  const usCsvRows = [usHeader];
  usRows.forEach((row) => {
    if (row.length >= 7) {
      usCsvRows.push(row.join(","));
    }
  });

  // Build tasks CSV
  const tasksHeader = "ID,Name,Assignee,Estimate,Status";
  const tasksCsvRows = [tasksHeader];
  taskRows.forEach((row) => {
    if (row.length >= 5) {
      tasksCsvRows.push(row.join(","));
    }
  });

  return {
    sprint_nombre: sprintNombre,
    duracion_sprint_dias: duracion,
    objetivo_sprint: objetivo,
    definition_of_done: [],
    notas: "",
    user_stories_csv: usCsvRows.join("\n"),
    tasks_csv: tasksCsvRows.join("\n"),
  };
}

export async function generateSprintBacklog(plan: FullTestPlan): Promise<SprintBacklogCSV> {
  const content = await chatCompletion(
    [{ role: "user", content: buildPrompt(plan) }],
    {
      model: "MiniMax-M2.7",
      temperature: 0.3,
      max_tokens: 8192,
      system:
        "Eres un Product Owner experto en Scrum. Generas Sprint Backlogs en DOS bloques de CSV separados. Solo CSV, sin JSON, sin markdown, sin explicaciones. Cada bloque comienza con su header de columnas.",
    }
  );

  return parseResponse(content);
}
