import { Input } from "@/components/ui/input";
import { useTestPlan } from "../context/TestPlanContext";
import { BookOpen, MessageSquare, CheckCircle2, AlertCircle, HelpCircle, ArrowRightCircle } from "lucide-react";
import { NavigationButtons } from "../components/layout/NavigationButtons";

export function ModeratorGuidePage() {
  const { data, updateTasks, updatePlan } = useTestPlan();

  const handleTaskChange = (index: number, field: string, value: string) => {
    const newTasks = [...data.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    updateTasks(newTasks);
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-8 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="text-primary" aria-hidden="true" size={28} />
              Guía de Moderación
            </h1>
            <p className="mt-1 text-slate-700 max-w-2xl text-sm font-medium">
              Esta guía profesional asegura una conducción ética y consistente de la sesión de usabilidad.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full border-2 border-primary/20">
            <CheckCircle2 size={18} aria-hidden="true" />
            IHC: Evalúa el sistema, no al usuario
          </div>
        </div>
      </header>

      <div className="p-6 space-y-10">
        <section aria-labelledby="intro-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-75">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
              <MessageSquare size={18} />
            </div>
            <h2 id="intro-heading" className="text-xl font-bold text-slate-900">
              Protocolo de Inicio
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Agradecimiento", desc: "Agradece sinceramente su tiempo y participación voluntaria.", icon: <CheckCircle2 className="text-green-700" size={20} /> },
              { title: "Enfoque del Test", desc: "Explica que evaluamos la interfaz y no sus capacidades personales.", icon: <AlertCircle className="text-primary" size={20} /> },
              { title: "Think Aloud", desc: "Pide expresar pensamientos y dudas en voz alta constantemente.", icon: <HelpCircle className="text-orange-800" size={20} /> },
              { title: "Secuencia", desc: "Lee una tarea a la vez y permite que el usuario explore libremente.", icon: <ArrowRightCircle className="text-blue-800" size={20} /> },
              { title: "Neutralidad", desc: "Evita dar pistas o gestos que influyan en el comportamiento.", icon: <AlertCircle className="text-red-800" size={20} /> }
            ].map((step, index) => (
              <div key={index} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-2 font-bold text-slate-900">
                  <span aria-hidden="true">{step.icon}</span>
                  {step.title}
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="guide-tasks-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
              <BookOpen size={18} />
            </div>
            <h2 id="guide-tasks-heading" className="text-xl font-bold text-slate-900">
              Tareas y Preguntas de Seguimiento
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-16 text-center">ID</th>
                    <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-[35%]">Guion para el participante</th>
                    <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-[35%]">Pregunta de seguimiento</th>
                    <th scope="col" className="px-4 py-4 font-bold text-slate-900">Criterio de éxito</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.tasks.map((task, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-bold text-primary bg-primary/5 text-center">{task.task_label}</td>
                      <td className="px-4 py-4 text-slate-900 leading-relaxed italic font-semibold">
                        {task.scenario || <span className="text-slate-500 italic font-medium">Sin escenario definido.</span>}
                      </td>
                      <td className="px-2 py-4">
                        <Input 
                          id={`followup-${index}`}
                          value={task.follow_up_question || ''}
                          aria-label={`Pregunta de seguimiento para tarea ${task.task_label}`}
                          onChange={(e) => handleTaskChange(index, 'follow_up_question', e.target.value)}
                          className="bg-white border-slate-300 focus:border-primary font-medium text-slate-900 placeholder:text-slate-400" 
                          placeholder="¿Qué esperabas encontrar...?"
                        />
                      </td>
                      <td className="px-4 py-4 text-slate-700 text-xs font-semibold">
                        <div className="flex items-start gap-1">
                          <CheckCircle2 size={14} className="mt-0.5 text-primary shrink-0" aria-hidden="true" />
                          <span>{task.success_criteria || "Sin criterio"}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden divide-y divide-slate-100">
              {data.tasks.map((task, index) => (
                <div key={index} className="p-6 bg-white space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="px-3 py-1 bg-primary text-white font-bold rounded-lg text-xs uppercase tracking-wider">Tarea {task.task_label}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 shadow-inner">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-1.5">Guion Participante</span>
                      <p className="text-sm italic text-slate-900 leading-relaxed font-semibold">{task.scenario || "Sin escenario definido."}</p>
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor={`mobile-followup-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Pregunta de Seguimiento</label>
                      <Input id={`mobile-followup-${index}`} value={task.follow_up_question || ''} onChange={(e) => handleTaskChange(index, 'follow_up_question', e.target.value)} className="h-11 text-sm border-slate-300 font-medium text-slate-900" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="closing-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-200 pb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
              <MessageSquare size={18} />
            </div>
            <h2 id="closing-heading" className="text-xl font-bold text-slate-900">
              Cierre y Entrevista Final
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="closing_easy" className="text-sm font-bold text-slate-800 block">¿Qué fue lo más fácil?</label>
              <textarea id="closing_easy" value={data.plan.closing_easy} onChange={(e) => updatePlan('closing_easy', e.target.value)} className="w-full h-32 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium text-slate-900" placeholder="Anota comentarios positivos..." />
            </div>
            <div className="space-y-2">
              <label htmlFor="closing_confusing" className="text-sm font-bold text-slate-800 block">¿Qué fue lo más confuso?</label>
              <textarea id="closing_confusing" value={data.plan.closing_confusing} onChange={(e) => updatePlan('closing_confusing', e.target.value)} className="w-full h-32 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium text-slate-900" placeholder="Anota puntos de fricción..." />
            </div>
            <div className="space-y-2">
              <label htmlFor="closing_change" className="text-sm font-bold text-slate-800 block">¿Qué cambiarías primero?</label>
              <textarea id="closing_change" value={data.plan.closing_change} onChange={(e) => updatePlan('closing_change', e.target.value)} className="w-full h-32 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium text-slate-900" placeholder="Anota sugerencias del usuario..." />
            </div>
          </div>
        </section>
        
        <NavigationButtons currentStep="guia" />
      </div>
    </div>
  );
}
