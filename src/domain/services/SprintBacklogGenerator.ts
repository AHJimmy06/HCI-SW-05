import { chatCompletion } from "../../lib/ai";
import type { FullTestPlan, SprintBacklog, BacklogUserStory, BacklogTask } from "../entities/types";

function buildPrompt(plan: FullTestPlan): string {
  const findings = (plan.findings || [])
    .map(
      (f, i) =>
        `Hallazgo ${i + 1}:
  - Problema: ${f.problem}
  - Severidad: ${f.severity}
  - Prioridad: ${f.priority}
  - Recomendación: ${f.recommendation}`
    )
    .join("\n\n");

  return `Actúa como un Senior Product Owner y Agile Coach experto en Scrum. Tu misión es transformar hallazgos de pruebas de usabilidad en un Sprint Backlog accionable y profesional.

CONTEXTO DEL PRODUCTO:
- Producto: ${plan.product_name}
- Módulo: ${plan.module_name || "No especificado"}
- Objetivo del test: ${plan.objective || "No definido"}
- Perfil de usuario: ${plan.user_profile || "No definido"}

HALLAZGOS DE USABILIDAD (Prioriza según severidad y recomendación):
${findings || "No se encontraron hallazgos específicos. Genera historias base para mejorar la usabilidad general del módulo."}

TAREA:
Genera un objeto JSON que represente el Sprint Backlog. Las Historias de Usuario (US) deben seguir el formato "Como [rol], quiero [acción] para [beneficio]".

REGLAS DE FORMATO (CRÍTICO):
1. Responde ÚNICAMENTE con el objeto JSON. SIN texto introductorio, SIN bloques de código markdown, SIN explicaciones.
2. Cantidad: Entre 3 y 6 Historias de Usuario, y las tareas técnicas necesarias para implementarlas.
3. Prioridad: Debe ser "Alta", "Media" o "Baja".
4. Tipo: Debe ser "feature", "bugfix", "improvement" o "spike".

ESQUEMA JSON REQUERIDO:
{
  "sprint_nombre": "Sprint 1: [Nombre descriptivo]",
  "objetivo_sprint": "Breve descripción del objetivo del sprint",
  "historias_usuario": [
    {
      "id": "US1",
      "titulo": "Título conciso",
      "descripcion": "Como [rol], quiero [acción] para [beneficio]",
      "criterio_aceptacion": ["Criterio 1", "Criterio 2", "Criterio 3"],
      "prioridad": "Alta",
      "esfuerzo": "3 pts",
      "tipo": "feature"
    }
  ],
  "tareas_tecnicas": [
    {
      "id": "T1",
      "descripcion": "Descripción de la tarea técnica",
      "estimado_horas": 4
    }
  ]
}`;
}

export async function generateSprintBacklog(plan: FullTestPlan): Promise<SprintBacklog> {
  const content = await chatCompletion(
    [{ role: "user", content: buildPrompt(plan) }],
    {
      model: "MiniMax-M2.7",
      temperature: 0.3,
      max_tokens: 8192,
      system:
        "Eres un Product Owner experto en Scrum. Generas Sprint Backlogs exclusivamente en formato JSON estricto. No incluyas explicaciones ni bloques de código.",
    }
  );

  try {
    // Clean potential markdown blocks
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) cleanContent = cleanContent.slice(7);
    else if (cleanContent.startsWith("```")) cleanContent = cleanContent.slice(3);
    if (cleanContent.endsWith("```")) cleanContent = cleanContent.slice(0, -3);
    cleanContent = cleanContent.trim();

    const parsed = JSON.parse(cleanContent);

    // Basic validation / Default values
    return {
      sprint_nombre: parsed.sprint_nombre || "Sprint 1",
      objetivo_sprint: parsed.objetivo_sprint || "",
      historias_usuario: (parsed.historias_usuario || []).map((us: Partial<BacklogUserStory>, i: number) => ({
        id: us.id || `US${i + 1}`,
        titulo: us.titulo || "Sin título",
        descripcion: us.descripcion || "",
        criterio_aceptacion: Array.isArray(us.criterio_aceptacion) ? us.criterio_aceptacion : [],
        prioridad: (us.prioridad && ["Alta", "Media", "Baja"].includes(us.prioridad)) ? us.prioridad : "Media",
        esfuerzo: us.esfuerzo || "1 pt",
        tipo: (us.tipo && ["feature", "bugfix", "improvement", "spike"].includes(us.tipo)) ? us.tipo : "feature"
      })),
      tareas_tecnicas: (parsed.tareas_tecnicas || []).map((t: Partial<BacklogTask>, i: number) => ({
        id: t.id || `T${i + 1}`,
        descripcion: t.descripcion || "Sin descripción",
        estimado_horas: typeof t.estimado_horas === 'number' ? t.estimado_horas : 0
      }))
    };
  } catch {
    console.error("Error parsing AI response as JSON:", content);
    throw new Error("La IA no devolvió un formato válido. Reintenta la generación.");
  }
}
