import { Input } from "@/components/ui/input";
import { useTestPlan } from "../context/TestPlanContext";
import { BookOpen, MessageSquare, CheckCircle2, AlertCircle, HelpCircle, ArrowRightCircle } from "lucide-react";

export function ModeratorGuidePage() {
  const { data, updatePlan, updateTasks } = useTestPlan();

  const handleTaskChange = (index: number, field: string, value: string) => {
    const newTasks = [...data.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    updateTasks(newTasks);
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <header className="px-6 py-8 border-b border-surface-100 bg-brand-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-900 flex items-center gap-2">
              <BookOpen className="text-brand-600" aria-hidden="true" />
              Guía de Moderación
            </h1>
            <p className="mt-1 text-surface-600 max-w-2xl">
              Esta guía te ayudará a conducir la sesión de manera consistente y ética, asegurando que el participante se sienta cómodo.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-brand-700 font-medium bg-brand-100/50 px-3 py-1.5 rounded-full border border-brand-200">
            <CheckCircle2 size={16} />
            HCI Best Practice: Evalúa el sistema, no al usuario
          </div>
        </div>
      </header>

      <div className="p-6 space-y-10">
        {/* Sección 1: Inicio de la sesión */}
        <section aria-labelledby="intro-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-75">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
              <MessageSquare size={18} />
            </div>
            <h2 id="intro-heading" className="text-xl font-bold text-surface-900">
              Protocolo de Inicio
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Agradecimiento", desc: "Agradece sinceramente su tiempo y participación.", icon: <CheckCircle2 className="text-green-600" size={20} /> },
              { title: "Enfoque del Test", desc: "Explica claramente que se evalúa la interfaz, no sus capacidades.", icon: <AlertCircle className="text-brand-600" size={20} /> },
              { title: "Think Aloud", desc: "Pide que exprese sus pensamientos y dudas en voz alta constantemente.", icon: <HelpCircle className="text-accent-600" size={20} /> },
              { title: "Secuencia", desc: "Lee una tarea a la vez y espera a que termine antes de seguir.", icon: <ArrowRightCircle className="text-brand-600" size={20} /> },
              { title: "Neutralidad", desc: "Evita dar pistas o ayudar, salvo que haya un bloqueo total.", icon: <AlertCircle className="text-accent-600" size={20} /> }
            ].map((step, index) => (
              <div key={index} className="p-4 rounded-xl border border-surface-200 bg-surface-50/30 hover:shadow-soft transition-all">
                <div className="flex items-center gap-2 mb-2 font-bold text-surface-900">
                  {step.icon}
                  {step.title}
                </div>
                <p className="text-sm text-surface-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sección 2: Tareas del Moderador */}
        <section aria-labelledby="tasks-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
              <BookOpen size={18} />
            </div>
            <h2 id="tasks-heading" className="text-xl font-bold text-surface-900">
              Tareas y Preguntas de Seguimiento
            </h2>
          </div>

          <div className="rounded-xl border border-surface-200 overflow-hidden shadow-soft bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-200">
                    <th className="px-4 py-3 font-semibold text-surface-700 w-16 text-center">ID</th>
                    <th className="px-4 py-3 font-semibold text-surface-700 w-[35%]">Guion para el participante</th>
                    <th className="px-4 py-3 font-semibold text-surface-700 w-[35%]">Pregunta de seguimiento (Moderador)</th>
                    <th className="px-4 py-3 font-semibold text-surface-700">Criterio de éxito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {data.tasks.map((task, index) => (
                    <tr key={index} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-4 py-4 font-bold text-brand-700 bg-brand-50/30 text-center">{task.task_label}</td>
                      <td className="px-4 py-4 text-surface-800 leading-relaxed italic">
                        {task.scenario || <span className="text-surface-400 italic font-normal">No se ha definido un escenario en el Plan.</span>}
                      </td>
                      <td className="px-2 py-4">
                        <Input 
                          id={`followup-${index}`}
                          value={task.follow_up_question || ''}
                          aria-label={`Pregunta de seguimiento para la tarea ${task.task_label}`}
                          onChange={(e) => handleTaskChange(index, 'follow_up_question', e.target.value)}
                          className="bg-white border-surface-200 focus:ring-brand-500" 
                          placeholder="Ej. ¿Qué esperabas encontrar en este botón?"
                        />
                      </td>
                      <td className="px-4 py-4 text-surface-600 text-xs">
                        <div className="flex items-start gap-1">
                          <CheckCircle2 size={14} className="mt-0.5 text-brand-500 shrink-0" />
                          <span>{task.success_criteria || "Sin criterio definido"}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Sección 3: Cierre de la Sesión */}
        <section aria-labelledby="closing-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-200 pb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
              <MessageSquare size={18} />
            </div>
            <h2 id="closing-heading" className="text-xl font-bold text-surface-900">
              Cierre y Entrevista Final
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="closing_easy" className="text-sm font-semibold text-surface-700 flex items-center gap-1">
                ¿Qué fue lo más fácil?
              </label>
              <textarea 
                id="closing_easy"
                value={data.plan.closing_easy}
                onChange={(e) => updatePlan('closing_easy', e.target.value)}
                className="w-full h-32 p-3 bg-white border border-surface-200 rounded-xl shadow-soft focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm" 
                placeholder="Anota las respuestas positivas del usuario..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="closing_confusing" className="text-sm font-semibold text-surface-700">
                ¿Qué fue lo más confuso?
              </label>
              <textarea 
                id="closing_confusing"
                value={data.plan.closing_confusing}
                onChange={(e) => updatePlan('closing_confusing', e.target.value)}
                className="w-full h-32 p-3 bg-white border border-surface-200 rounded-xl shadow-soft focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm" 
                placeholder="Identifica los puntos de fricción..."
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="closing_change" className="text-sm font-semibold text-surface-700">
                ¿Qué cambiarías primero?
              </label>
              <textarea 
                id="closing_change"
                value={data.plan.closing_change}
                onChange={(e) => updatePlan('closing_change', e.target.value)}
                className="w-full h-32 p-3 bg-white border border-surface-200 rounded-xl shadow-soft focus:ring-2 focus:ring-brand-500 outline-none transition-all text-sm" 
                placeholder="Prioridades de mejora según el usuario..."
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
