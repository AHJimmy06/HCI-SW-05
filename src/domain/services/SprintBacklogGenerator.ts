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

  return `Actúa como un Senior Product Owner y Agile Coach experto en Scrum. Tu misión es transformar hallazgos de pruebas de usabilidad en un Sprint Backlog accionable.

CONTEXTO DEL PRODUCTO:
- Producto: ${plan.product_name}
- Módulo: ${plan.module_name || "No especificado"}
- Objetivo del test: ${plan.objective || "No definido"}
- Perfil de usuario: ${plan.user_profile || "No definido"}

HALLAZGOS DE USABILIDAD (Prioriza según severidad y recomendación):
${findingsText || "No se encontraron hallazgos específicos. Genera historias base para mejorar la usabilidad general del módulo."}

TAREA:
Genera un Sprint Backlog que incluya Historias de Usuario (US) y Tareas Técnicas asociadas. Las US deben seguir el formato "Como [rol], quiero [acción] para [beneficio]" e incluir Criterios de Aceptación (AC).

REGLAS DE FORMATO (CRÍTICO):
1. Responde ÚNICAMENTE con los bloques CSV. SIN texto introductorio, SIN conclusiones, SIN bloques de código markdown.
2. Usa exactamente estos encabezados de columna.
3. Separador de bloques: Una línea vacía entre el bloque de Historias y el de Tareas.
4. Escapado: Si un campo contiene comas, encuádralo entre comillas dobles (").
5. Cantidad: Entre 3 y 6 Historias de Usuario, y entre 6 y 12 Tareas Técnicas.

ESTRUCTURA EXACTA:

[CSV 1: HISTORIAS DE USUARIO]
ID,Name,Type,Priority,Estimate,Status,Description
1,"Como [rol], quiero [acción] para [beneficio]. AC: 1. [criterio] | 2. [criterio]",feature,Alta,3,To Do,"Descripción basada en el hallazgo"
...

[CSV 2: TAREAS TÉCNICAS]
ID,Name,Assignee,Estimate,Status
1,Tarea técnica para implementar la US1,"",4h,To Do
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
