import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTestPlan } from "../context/useTestPlan";
import { 
  BookOpen, MessageSquare, CheckCircle2, AlertCircle, 
  HelpCircle, ArrowRightCircle, Settings, Save, Loader2,
  ChevronLeft, ChevronRight, X, Clock
} from "lucide-react";
import { SupabaseTestPlanRepository, SupabaseTaskRepository } from "../../infrastructure/repositories/SupabaseRepositories";

export function ModeratorGuidePage() {
  const navigate = useNavigate();
  const { data, updateTasks, updatePlan, attemptedNext, validationStatus, updateTestPlanId, clearDraft, setAttemptedNext } = useTestPlan();
  const [isSaving, setIsSaving] = useState(false);
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [tentativeMode, setTentativeDateMode] = useState(false);
  const [tentativeDate, setTentativeDate] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleTaskChange = (index: number, field: string, value: string) => {
    const newTasks = [...data.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    updateTasks(newTasks);
  };

  const markAsTouched = (id: string) => {
    setTouched(prev => ({ ...prev, [id]: true }));
  };

  const getFieldError = (id: string, val: string) => {
    const isEmpty = (val || '').trim() === '';
    return (attemptedNext && isEmpty) || (touched[id] && isEmpty);
  };

  const inputClass = (id: string, val: string) => `
    bg-white border-slate-300 focus:border-primary focus:ring-primary/20 transition-all duration-200 
    ${getFieldError(id, val) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}
  `;

  const handleStartNow = () => {
    updatePlan('test_date', new Date().toISOString().split('T')[0]);
    navigate("/registro");
  };

  const handleNextStep = () => {
    if (validationStatus.guide.isValid) {
      setShowTransitionModal(true);
      setShowWarning(false);
    } else {
      setAttemptedNext(true);
      setShowWarning(true);
    }
  };

  const handleSaveAndExit = async () => {
    if (!validationStatus.plan.isValid) return;

    setIsSaving(true);
    try {
      const planRepo = new SupabaseTestPlanRepository();
      const taskRepo = new SupabaseTaskRepository();

      let planId = data.test_plan_id;
      const planToSave = { ...data.plan };
      if (tentativeDate) {
        planToSave.test_date = tentativeDate;
      }

      if (planId) {
        await planRepo.update(planId, planToSave);
      } else {
        planId = await planRepo.create(planToSave);
        updateTestPlanId(planId!);
      }

      const tasksToSave = data.tasks
        .filter(t => (t.scenario || '').trim() !== '')
        .map((t, index) => ({
          test_plan_id: planId!,
          task_label: t.task_label,
          scenario: t.scenario,
          expected_result: t.expected_result,
          main_metric: t.main_metric,
          success_criteria: t.success_criteria,
          follow_up_question: t.follow_up_question,
          order_index: index,
        }));

      if (tasksToSave.length > 0) {
        await taskRepo.saveAll(tasksToSave);
      }

      setShowTransitionModal(false);
      clearDraft();
      
      setTimeout(() => {
        navigate("/", { 
          replace: true,
          state: { successMessage: tentativeDate 
            ? `Plan archivado para el ${new Date(tentativeDate).toLocaleDateString()}.` 
            : "¡Planificación lista! Misión guardada en el archivo." } 
        });
      }, 100);

    } catch (error: any) {
      console.error("❌ ERROR AL ARCHIVAR:", error);
      alert("Hubo un problema al guardar en la base de datos.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full relative">
      {/* Modal de Transición */}
      {showTransitionModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="relative p-8 text-center">
              <button 
                onClick={() => {
                   setShowTransitionModal(false);
                   setTentativeDateMode(false);
                }}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} />
              </div>
              
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Planificación Lista</h3>
              <p className="text-slate-600 font-medium mb-8 leading-relaxed">
                {tentativeMode 
                  ? "¿Para cuándo deseás programar la aplicación del test?" 
                  : "¿Deseás comenzar con el registro de observaciones en este momento?"}
              </p>
              
              <div className="flex flex-col gap-4">
                {!tentativeMode ? (
                  <>
                    <Button 
                      onClick={handleStartNow}
                      className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-8 rounded-2xl text-lg shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
                    >
                      <ArrowRightCircle size={24} />
                      ¡SÍ, EMPEZAR AHORA!
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setTentativeDateMode(true)}
                      className="w-full border-slate-200 text-slate-600 hover:bg-slate-50 font-bold py-6 rounded-2xl"
                    >
                      NO, GUARDAR PARA DESPUÉS
                    </Button>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-2 text-left">
                       <label className="text-xs font-black uppercase text-slate-500 ml-1">Fecha tentativa</label>
                       <Input 
                         type="date"
                         min={new Date().toISOString().split('T')[0]}
                         value={tentativeDate}
                         onChange={(e) => setTentativeDate(e.target.value)}
                         className="h-14 text-lg font-bold border-primary/30 text-primary focus:border-primary focus:ring-primary/20"
                       />
                    </div>
                    <div className="flex gap-3">
                       <Button variant="ghost" onClick={() => setTentativeDateMode(false)} className="flex-1 text-slate-500 font-bold">CANCELAR</Button>
                       <Button 
                         onClick={handleSaveAndExit}
                         disabled={isSaving || !tentativeDate}
                         className={`flex-[2] font-bold py-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 ${
                           isSaving ? "bg-slate-100 text-slate-400" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200"
                         }`}
                       >
                         {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                         {isSaving ? "PROCESANDO..." : "PROGRAMAR Y ARCHIVAR"}
                       </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="px-6 py-8 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="text-primary" size={28} />
              Guía de Moderación
            </h1>
            <p className="mt-1 text-slate-700 max-w-2xl text-sm font-medium">
              Instrucciones y protocolo para asegurar una conducción ética y exitosa del test.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full border-2 border-primary/20">
            <CheckCircle2 size={18} />
            UX: Evaluamos el sistema, no al usuario
          </div>
        </div>
      </header>

      <div className="p-6 space-y-10">
        <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Producto</span>
              <p className="text-sm font-semibold text-slate-900">{data.plan.product_name || 'No definido'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Método</span>
              <p className="text-sm font-semibold text-slate-900">{data.plan.method || 'No definido'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fecha</span>
              <p className="text-sm font-semibold text-slate-900">{data.plan.test_date || 'No definida'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Duración</span>
              <p className="text-sm font-semibold text-slate-900">{data.plan.duration || 'No definida'}</p>
            </div>
        </section>

        <section className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><MessageSquare size={18} /></div>
            <h2 className="text-xl font-bold text-slate-900">2. Protocolo de Inicio</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Protocolo de inicio", desc: "Evaluar la página, no la capacidad del usuario." },
              { title: "Técnica \"Think Aloud\"", desc: "Pedir que piense en voz alta." },
              { title: "No intervención", desc: "No dar pistas ni ayudar (máx 2 min de bloqueo)." },
              { title: "Entorno controlado", desc: "Mismo navegador y conexión." }
            ].map((step, i) => (
              <div key={i} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <p className="font-bold text-slate-900 text-sm mb-2">{step.title}</p>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><BookOpen size={18} /></div>
            <h2 className="text-xl font-bold text-slate-900">3. Guion y Tareas del Test</h2>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="hidden md:table-header-group">
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-4 font-bold text-slate-900 w-16 text-center">ID</th>
                  <th className="px-4 py-4 font-bold text-slate-900 w-[30%]">Escenario y Detalles</th>
                  <th className="px-4 py-4 font-bold text-slate-900 w-[65%]">Consulta de Seguimiento <span className="text-red-500">*</span></th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group divide-y divide-slate-100">
                {data.tasks.map((task, index) => {
                  const fieldId = `followup-${index}`;
                  return (
                    <tr key={index} className="block md:table-row hover:bg-slate-50/50 transition-colors p-4 md:p-0">
                      {/* Columna ID */}
                      <td className="block md:table-cell px-4 py-6 md:text-center md:bg-primary/5 align-top">
                        <span className="md:hidden font-bold text-[10px] text-slate-400 uppercase block mb-1">ID Tarea</span>
                        <div className="inline-block md:block font-bold text-primary bg-primary/10 md:bg-transparent px-3 py-1 md:p-0 rounded-full md:rounded-none">
                          {task.task_label}
                        </div>
                      </td>
                      
                      {/* Columna Escenario y Detalles */}
                      <td className="block md:table-cell px-4 py-6 align-top border-t border-slate-50 md:border-none mt-4 md:mt-0">
                        <span className="md:hidden font-bold text-[10px] text-slate-400 uppercase block mb-1">Escenario / Tarea</span>
                        <div className="space-y-4">
                          <p className="italic font-bold text-slate-900 leading-relaxed text-base">
                            {task.scenario || 'No definido'}
                          </p>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                            <p><span className="font-black uppercase text-slate-400">Resultado:</span> <span className="font-semibold">{task.expected_result || "N/A"}</span></p>
                            <p><span className="font-black uppercase text-slate-400">Métrica:</span> <span className="font-semibold">{task.main_metric || "N/A"}</span></p>
                            <p><span className="font-black uppercase text-slate-400">Criterio:</span> <span className="font-semibold">{task.success_criteria || "Sin criterio"}</span></p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Columna Consulta de Seguimiento */}
                      <td className="block md:table-cell px-4 py-6 align-top">
                        <span className="md:hidden font-bold text-[10px] text-slate-400 uppercase block mb-2">Consulta de seguimiento *</span>
                        <div className="space-y-2">
                          <Input 
                            id={fieldId}
                            value={task.follow_up_question || ''} 
                            onChange={(e) => handleTaskChange(index, 'follow_up_question', e.target.value)}
                            onBlur={() => markAsTouched(fieldId)}
                            className={`h-12 text-base font-medium shadow-sm ${inputClass(fieldId, task.follow_up_question || '')}`}
                            placeholder="Ej: ¿Qué esperabas encontrar en este paso?" 
                          />
                          <p className={`text-[10px] font-medium px-1 ${getFieldError(fieldId, task.follow_up_question || '') ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                             {getFieldError(fieldId, task.follow_up_question || '') ? "La consulta es obligatoria para el protocolo." : "Pregunta para el usuario al finalizar la tarea."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><MessageSquare size={18} /></div>
            <h2 className="text-xl font-bold text-slate-900">4. Cierre y Feedback Final (Entrevista)</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-10">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-widest">¿Qué resultó fácil? <span className="text-red-500">*</span></label>
              <textarea 
                value={data.plan.closing_easy} 
                onChange={(e) => updatePlan('closing_easy', e.target.value)}
                onBlur={() => markAsTouched('closing_easy')}
                className={`w-full h-24 p-3 bg-white border border-slate-200 rounded-xl text-sm transition-all font-medium ${getFieldError('closing_easy', data.plan.closing_easy) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`}
                placeholder="Anota comentarios positivos..."
              />
              <p className={`text-[10px] px-1 font-medium ${getFieldError('closing_easy', data.plan.closing_easy) ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                 {getFieldError('closing_easy', data.plan.closing_easy) ? "Este campo es obligatorio." : "Aciertos del sistema."}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-widest">¿Qué resultó confuso? <span className="text-red-500">*</span></label>
              <textarea 
                value={data.plan.closing_confusing} 
                onChange={(e) => updatePlan('closing_confusing', e.target.value)}
                onBlur={() => markAsTouched('closing_confusing')}
                className={`w-full h-24 p-3 bg-white border border-slate-200 rounded-xl text-sm transition-all font-medium ${getFieldError('closing_confusing', data.plan.closing_confusing) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`}
                placeholder="Anota puntos de fricción..."
              />
              <p className={`text-[10px] px-1 font-medium ${getFieldError('closing_confusing', data.plan.closing_confusing) ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                 {getFieldError('closing_confusing', data.plan.closing_confusing) ? "Este campo es obligatorio." : "Dudas del usuario."}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-widest">¿Qué cambiaría? <span className="text-red-500">*</span></label>
              <textarea 
                value={data.plan.closing_change} 
                onChange={(e) => updatePlan('closing_change', e.target.value)}
                onBlur={() => markAsTouched('closing_change')}
                className={`w-full h-24 p-3 bg-white border border-slate-200 rounded-xl text-sm transition-all font-medium ${getFieldError('closing_change', data.plan.closing_change) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`}
                placeholder="Anota sugerencias del usuario..."
              />
              <p className={`text-[10px] px-1 font-medium ${getFieldError('closing_change', data.plan.closing_change) ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                 {getFieldError('closing_change', data.plan.closing_change) ? "Este campo es obligatorio." : "Mejoras propuestas."}
              </p>
            </div>
          </div>
        </section>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 border-t border-slate-200 relative">
          {showWarning && !validationStatus.guide.isValid && (
            <div role="alert" className="absolute -top-16 right-0 flex flex-col items-center gap-1 text-red-900 bg-red-50 px-4 py-3 rounded-xl border-2 border-red-200 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300 z-50">
               <div className="flex items-center gap-2"><AlertCircle size={16} className="text-red-600" /><span className="text-xs font-black uppercase">Faltan Datos</span></div>
               <p className="text-[10px] font-bold text-red-700">Completá todo el guion de seguimiento y la entrevista.</p>
            </div>
          )}

          <Button variant="ghost" onClick={() => navigate("/plan")} className="flex items-center gap-2 px-6 py-6 rounded-xl font-semibold hover:bg-slate-100 transition-all text-slate-700">
            <ChevronLeft size={20} />
            <div className="flex flex-col items-start"><span className="text-xs uppercase font-bold text-slate-500">Regresar</span><span className="font-bold uppercase text-slate-900">Planificación</span></div>
          </Button>

          <Button
            onClick={handleNextStep}
            className={`w-full sm:w-auto flex items-center gap-4 px-10 py-8 rounded-2xl transition-all shadow-md group ${
              validationStatus.guide.isValid ? "bg-primary text-white hover:bg-primary/90" : "bg-slate-200 text-slate-400 border-2 border-slate-300 cursor-not-allowed"
            }`}
          >
            <div className="flex flex-col items-end">
              <span className="text-xs uppercase font-bold opacity-90">Siguiente</span>
              <span className="text-lg font-bold uppercase tracking-tight">Finalizar Guía</span>
            </div>
            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
