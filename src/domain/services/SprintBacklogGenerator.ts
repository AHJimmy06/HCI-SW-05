import { chatCompletion } from "../../lib/ai";
import type { FullTestPlan, SprintBacklog, BacklogUserStory, BacklogTask } from "../entities/types";

function buildPrompt(plan: FullTestPlan): string {
  const tasks = (plan.tasks || [])
    .map((t, i) => `Tarea ${i + 1} [ID: ${t.task_label}]: ${t.scenario}`)
    .join("\n");

  const observations = (plan.observations || [])
    .filter(o => !o.success || o.detected_problem)
    .slice(0, 10) // Limit to top 10 relevant observations to save context
    .map(o => `- Problema en ${o.task_id || "tarea desconocida"}: ${o.detected_problem || o.key_comments}`)
    .join("\n");

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

  return `Actúa como un Senior Product Owner y Agile Coach experto en Scrum. Tu misión es transformar un proceso completo de pruebas de usabilidad en un Sprint Backlog accionable y técnico.

CONTEXTO DEL PRODUCTO:
- Producto: ${plan.product_name}
- Módulo: ${plan.module_name || "No especificado"}
- Objetivo del test: ${plan.objective || "No definido"}

1. GUÍA DE TAREAS (Lo que se evaluó):
${tasks || "No hay tareas definidas."}

2. REGISTRO DE OBSERVACIONES (Puntos críticos detectados en campo):
${observations || "No hay observaciones específicas registradas."}

3. SÍNTESIS DE HALLAZGOS (Consolidación de problemas):
${findings || "Genera historias base para mejorar la usabilidad general del módulo."}

TAREA:
Genera un objeto JSON que represente el Sprint Backlog. Las Historias de Usuario (US) deben seguir el formato "Como [rol], quiero [acción] para [beneficio]".
Es CRÍTICO que cada Historia de Usuario incluya su propio desglose de Tareas Técnicas necesarias para su implementación.
Sugiere una duración de sprint (en días) y notas de organización (asignaciones sugeridas o consideraciones de equipo).

REGLAS DE FORMATO (CRÍTICO):
1. Responde ÚNICAMENTE con el objeto JSON. SIN texto introductorio, SIN bloques de código markdown, SIN explicaciones.
2. Cantidad: Entre 3 y 6 Historias de Usuario.
3. Tareas Técnicas: Cada Historia de Usuario DEBE tener entre 2 y 4 tareas técnicas anidadas.
4. Prioridad: Debe ser "Alta", "Media" o "Baja".

ESQUEMA JSON REQUERIDO:
{
  "sprint_nombre": "Sprint 1: [Nombre descriptivo]",
  "objetivo_sprint": "Breve descripción del objetivo",
  "duracion_sprint_dias": 14,
  "notas_organizacion": "Asignaciones sugeridas y notas de equipo",
  "historias_usuario": [
    {
      "id": "US1",
      "titulo": "Título conciso",
      "descripcion": "Como [rol], quiero [acción] para [beneficio]",
      "criterio_aceptacion": ["Criterio 1", "Criterio 2"],
      "prioridad": "Alta",
      "esfuerzo": "3 pts",
      "tipo": "feature",
      "tareas_tecnicas": [
        {
          "id": "T1.1",
          "descripcion": "Descripción técnica",
          "estimado_horas": 4
        }
      ]
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
        "Eres un Product Owner experto en Scrum. Generas Sprint Backlogs exclusivamente en formato JSON estricto con tareas técnicas anidadas dentro de cada historia de usuario. No incluyas explicaciones ni bloques de código.",
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
      duracion_sprint_dias: parsed.duracion_sprint_dias || 14,
      notas_organizacion: parsed.notas_organizacion || "",
      historias_usuario: (parsed.historias_usuario || []).map((us: Partial<BacklogUserStory>, i: number) => {
        const storyId = us.id || `US${i + 1}`;
        return {
          id: storyId,
          titulo: us.titulo || "Sin título",
          descripcion: us.descripcion || "",
          criterio_aceptacion: Array.isArray(us.criterio_aceptacion) ? us.criterio_aceptacion : [],
          prioridad: (us.prioridad && ["Alta", "Media", "Baja"].includes(us.prioridad)) ? us.prioridad : "Media",
          esfuerzo: us.esfuerzo || "1 pt",
          tipo: (us.tipo && ["feature", "bugfix", "improvement", "spike"].includes(us.tipo)) ? us.tipo : "feature",
          tareas_tecnicas: (us.tareas_tecnicas || []).map((t: Partial<BacklogTask>, j: number) => ({
            id: t.id || `T${i + 1}.${j + 1}`,
            descripcion: t.descripcion || "Sin descripción",
            estimado_horas: typeof t.estimado_horas === 'number' ? t.estimado_horas : 0
          }))
        };
      })
    };
  } catch {
    console.error("Error parsing AI response as JSON:", content);
    throw new Error("La IA no devolvió un formato válido. Reintenta la generación.");
  }
}
