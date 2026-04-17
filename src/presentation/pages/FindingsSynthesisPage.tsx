import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTestPlan } from "../context/useTestPlan";
import {
  SupabaseTestPlanRepository,
  SupabaseTaskRepository,
  SupabaseParticipantRepository,
  SupabaseFindingRepository,
  SupabaseObservationRepository,
} from "../../infrastructure/repositories/SupabaseRepositories";
import { 
  type Observation, 
  type FindingDraft 
} from "@/domain/entities/types";
import {
  Filter,
  Plus,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Gem,
  Activity,
  Zap,
  Clock
} from "lucide-react";
import { NavigationButtons } from "../components/layout/NavigationButtons";

export function FindingsSynthesisPage() {
  const navigate = useNavigate();
  const { data, updateFindings, addFinding, updateTestPlanId, clearDraft, attemptedNext } = useTestPlan();
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const handleFindingChange = (index: number, field: keyof FindingDraft, value: string) => {
    const newFindings = [...data.findings];
    newFindings[index] = { ...newFindings[index], [field]: value } as FindingDraft;
    updateFindings(newFindings);
  };

  const markAsTouched = (id: string) => {
    setTouched(prev => ({ ...prev, [id]: true }));
  };

  const isInvalid = (id: string, val: string | number) => {
    const isFieldEmpty = (val === '' || val === null || val === undefined);
    return (attemptedNext && isFieldEmpty) || (touched[id] && isFieldEmpty);
  };

  const removeRow = (index: number) => {
    if (data.findings.length > 1) {
      const newFindings = data.findings.filter((_, i) => i !== index);
      updateFindings(newFindings);
    }
  };

  const handleSaveAll = async () => {
    if (loading) return;

    setLoading(true);
    setSaveStatus({ type: null, message: null });

    try {
      const planRepo = new SupabaseTestPlanRepository();
      const taskRepo = new SupabaseTaskRepository();
      const participantRepo = new SupabaseParticipantRepository();
      const obsRepo = new SupabaseObservationRepository();
      const findingRepo = new SupabaseFindingRepository();

      let planId = data.test_plan_id;
      if (planId) {
        await planRepo.update(planId, data.plan);
      } else {
        planId = await planRepo.create(data.plan);
      }

      const tasksToSave = data.tasks
        .filter((t) => (t.scenario || "").trim() !== "" || (t.expected_result || "").trim() !== "")
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
      
      await taskRepo.saveAll(tasksToSave);
      const savedTasks = await taskRepo.getByPlanId(planId!);

      const uniqueParticipants = Array.from(
        new Map(
          data.observations
            .filter(o => (o.participant_name || "").trim() !== "")
            .map(o => [o.participant_name.trim(), {
              test_plan_id: planId!,
              name: o.participant_name.trim(),
              profile: o.participant_profile || ""
            }])
        ).values()
      );

      const savedParticipants = await participantRepo.saveAll(uniqueParticipants);
      
      const obsToSave: Partial<Observation>[] = data.observations
        .filter(o => (o.participant_name || "").trim() !== "" || o.task_label)
        .map(o => {
          const participantMatch = savedParticipants.find(p => p.name === o.participant_name.trim());
          const taskMatch = savedTasks.find(st => st.task_label === o.task_label);
          return {
            test_plan_id: planId,
            participant_id: participantMatch?.id || undefined,
            task_id: taskMatch?.id || undefined,
            success: o.success === "Si",
            time_seconds: parseInt(o.time_seconds) || 0,
            errors_count: parseInt(o.errors_count) || 0,
            key_comments: o.key_comments || "",
            detected_problem: o.detected_problem || "",
            severity: o.severity || "Baja",
            proposed_improvement: o.proposed_improvement || "",
          };
        });

      if (obsToSave.length > 0) await obsRepo.saveAll(obsToSave);

      const findingsToSave = data.findings
        .filter((f) => (f.problem || "").trim() !== "")
        .map((f) => ({
          test_plan_id: planId!,
          problem: f.problem,
          evidence: f.evidence,
          frequency: f.frequency,
          severity: f.severity,
          recommendation: f.recommendation,
          priority: f.priority,
          status: f.status,
        }));

      await findingRepo.saveAll(findingsToSave);
      if (planId) updateTestPlanId(planId);

      // Navegamos al dashboard PRIMERO para asegurar que el state llegue
      navigate("/", { 
        replace: true,
        state: { 
          successMessage: "¡Misión IHC completada! Los hallazgos están en el tablero." 
        } 
      });

      // Limpiamos el draft después de un breve delay para no romper la transición
      setTimeout(() => {
        clearDraft();
      }, 500);
    } catch (error: unknown) {
      console.error("Error al guardar:", error);
      setSaveStatus({
        type: "error",
        message: "Error crítico al sincronizar con la base de datos.",
      });
    } finally {
      setLoading(false);
    }
  };

  const isSynthesisValid = data.findings.length > 0 && data.findings.every(f => 
    f.problem.trim() !== '' && 
    f.evidence.trim() !== '' && 
    f.frequency.trim() !== '' && 
    f.recommendation.trim() !== ''
  );

  return (
    <div className="flex flex-col min-h-full">
      {saveStatus.message && (
        <div role="status" className="fixed top-24 right-6 z-[100] p-6 rounded-3xl shadow-2xl border-2 flex items-center gap-4 max-w-md animate-in slide-in-from-top duration-300 bg-red-600 border-red-700 text-white">
          <AlertTriangle size={28} className="shrink-0" />
          <p className="text-sm font-bold">{saveStatus.message}</p>
          <button onClick={() => setSaveStatus({ type: null, message: null })} className="ml-auto p-1 hover:bg-white/20 rounded-full transition-colors">
            <Trash2 size={18} />
          </button>
        </div>
      )}

      <header className="px-6 py-8 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Filter className="text-primary" aria-hidden="true" size={28} />
              Síntesis de Hallazgos
            </h1>
            <p className="mt-1 text-slate-700 max-w-2xl text-sm font-medium">Transformación de observaciones crudas en hallazgos accionables de usabilidad.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-900 font-semibold bg-slate-100 px-4 py-2 rounded-full border-2 border-slate-200 shadow-sm">
            <Gem size={18} className="text-primary" />
            IHC: Consolidación de hallazgos críticos
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Activity size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Bitácora de Hallazgos de Usabilidad</h2>
          </div>
          <Button onClick={addFinding} variant="outline" className="border-primary text-primary font-bold shadow-sm flex items-center gap-2 hover:bg-primary/5 rounded-xl">
            <Plus size={18} strokeWidth={3} />
            Registrar Hallazgo
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          {/* Vista Desktop (Rediseñada a 2 niveles) */}
          <div className="hidden lg:block">
            <div className="bg-slate-50 border-b border-slate-200 flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-widest">
              <div className="w-[30%]">Problema detectado *</div>
              <div className="w-[45%] px-2">Evidencia de Campo *</div>
              <div className="w-[20%] text-center">Frecuencia de ocurrencia *</div>
              <div className="w-12 text-center">X</div>
            </div>

            <div className="divide-y divide-slate-100">
              {data.findings.map((finding, index) => {
                const probId = `find-prob-${index}`;
                const evidId = `find-evid-${index}`;
                const freqId = `find-freq-${index}`;
                const recomId = `find-recom-${index}`;
                const sevId = `find-sev-${index}`;
                const prioId = `find-prio-${index}`;
                const statId = `find-stat-${index}`;

                return (
                  <div key={index} className="hover:bg-slate-50/30 transition-colors group">
                    {/* Nivel 1: Datos Base */}
                    <div className="flex items-start gap-2 p-4 pb-2">
                      <div className="w-[30%]">
                        <Input 
                          id={probId}
                          value={finding.problem} 
                          onBlur={() => markAsTouched(probId)}
                          onChange={(e) => handleFindingChange(index, "problem", e.target.value)} 
                          className={`h-9 text-xs font-bold placeholder:text-slate-300 placeholder:font-normal ${isInvalid(probId, finding.problem) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                          placeholder="Describí el problema detectado..."
                        />
                      </div>
                      <div className="w-[45%] px-2">
                        <Input 
                          id={evidId}
                          value={finding.evidence} 
                          onBlur={() => markAsTouched(evidId)}
                          onChange={(e) => handleFindingChange(index, "evidence", e.target.value)} 
                          className={`h-9 text-xs font-medium placeholder:text-slate-300 placeholder:font-normal ${isInvalid(evidId, finding.evidence) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                          placeholder="Ej: El usuario no vio el botón rojo en la tarea T2..."
                        />
                      </div>
                      <div className="w-[20%]">
                        <Input 
                          id={freqId}
                          value={finding.frequency} 
                          onBlur={() => markAsTouched(freqId)}
                          onChange={(e) => handleFindingChange(index, "frequency", e.target.value)} 
                          className={`h-9 text-xs text-center font-bold placeholder:text-slate-300 placeholder:font-normal ${isInvalid(freqId, finding.frequency) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                          placeholder="Ej: 3 de 5 usuarios"
                        />
                      </div>
                      <div className="w-12 flex justify-center">
                        <Button variant="ghost" size="icon" onClick={() => removeRow(index)} className="text-slate-300 hover:text-red-600 transition-colors">
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>

                    {/* Nivel 2: Recomendación y Metadatos */}
                    <div className="flex items-center gap-4 px-4 pb-4 pt-2 bg-slate-50/50 group-hover:bg-slate-100/50 transition-colors border-t border-slate-100/50">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                          <Zap size={10} />
                          Recomendación IHC *
                        </label>
                        <Input 
                          id={recomId}
                          value={finding.recommendation} 
                          onBlur={() => markAsTouched(recomId)}
                          onChange={(e) => handleFindingChange(index, "recommendation", e.target.value)} 
                          className={`h-9 text-xs border-primary/20 text-primary font-bold bg-primary/5 focus:bg-white shadow-sm placeholder:text-primary/30 placeholder:font-normal ${isInvalid(recomId, finding.recommendation) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                          placeholder="Propuesta técnica para resolver este punto de dolor (Ej: Rediseñar el flujo de pago)"
                        />
                      </div>

                      <div className="flex gap-3 items-end">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Severidad *</label>
                          <Select value={finding.severity} onValueChange={(val) => { handleFindingChange(index, "severity", val); markAsTouched(sevId); }}>
                            <SelectTrigger className={`h-9 w-28 text-xs font-bold border-slate-200 bg-white ${isInvalid(sevId, finding.severity) ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}>
                              <SelectValue placeholder="Severidad" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Baja"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500" />Baja</div></SelectItem>
                              <SelectItem value="Media"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-amber-500" />Media</div></SelectItem>
                              <SelectItem value="Alta"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-orange-500" />Alta</div></SelectItem>
                              <SelectItem value="Crítica"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-red-600" />Crítica</div></SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prioridad *</label>
                          <Select value={finding.priority} onValueChange={(val) => { handleFindingChange(index, "priority", val as any); markAsTouched(prioId); }}>
                            <SelectTrigger className={`h-9 w-28 text-xs font-bold border-slate-200 bg-white ${isInvalid(prioId, finding.priority) ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}>
                              <SelectValue placeholder="Prioridad" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Baja">
                                <div className="flex items-center gap-2">
                                  <div className="h-2.5 w-2.5 rounded-full bg-slate-400" />
                                  <span className="text-slate-600">Baja</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Media">
                                <div className="flex items-center gap-2">
                                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                  <span className="text-amber-700">Media</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Alta">
                                <div className="flex items-center gap-2">
                                  <div className="h-2.5 w-2.5 rounded-full bg-red-600" />
                                  <span className="text-red-700 font-bold">Alta</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Estado *</label>
                          <Select value={finding.status} onValueChange={(val) => { handleFindingChange(index, "status", val as any); markAsTouched(statId); }}>
                            <SelectTrigger className={`h-9 w-36 text-xs font-bold border-slate-200 bg-white ${isInvalid(statId, finding.status) ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}>
                              <SelectValue placeholder="Estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pendiente">
                                <div className="flex items-center gap-2">
                                  <Clock size={12} className="text-slate-400" />
                                  <span className="text-slate-600">Pendiente</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="En Progreso">
                                <div className="flex items-center gap-2">
                                  <Activity size={12} className="text-blue-500" />
                                  <span className="text-blue-700">En Progreso</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="Resuelto">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 size={12} className="text-emerald-500" />
                                  <span className="text-emerald-700 font-bold">Resuelto</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="w-12" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:hidden divide-y divide-slate-100">
            {data.findings.map((finding, index) => (
              <div key={index} className="p-6 bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm font-bold text-primary uppercase tracking-wider">Hallazgo #{index + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeRow(index)} className="text-red-700 font-semibold bg-red-50 hover:bg-red-100 transition-colors px-3">
                    <Trash2 size={18} className="mr-1" /> Eliminar
                  </Button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Problema (Impureza) *</label>
                    <Input 
                      value={finding.problem} 
                      onBlur={() => markAsTouched(`m-prob-${index}`)}
                      onChange={(e) => handleFindingChange(index, "problem", e.target.value)} 
                      className={`h-11 text-sm border-slate-300 ${isInvalid(`m-prob-${index}`, finding.problem) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Evidencia de Campo *</label>
                    <Input 
                      value={finding.evidence} 
                      onBlur={() => markAsTouched(`m-evid-${index}`)}
                      onChange={(e) => handleFindingChange(index, "evidence", e.target.value)} 
                      className={`h-11 text-sm border-slate-300 ${isInvalid(`m-evid-${index}`, finding.evidence) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Frecuencia *</label>
                    <Input 
                      value={finding.frequency} 
                      onBlur={() => markAsTouched(`m-freq-${index}`)}
                      onChange={(e) => handleFindingChange(index, "frequency", e.target.value)} 
                      className={`h-11 text-sm border-slate-300 ${isInvalid(`m-freq-${index}`, finding.frequency) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Severidad *</label>
                      <Select value={finding.severity} onValueChange={(val) => handleFindingChange(index, "severity", val)}>
                        <SelectTrigger className="h-11 text-xs font-bold border-slate-300"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baja">Baja</SelectItem>
                          <SelectItem value="Media">Media</SelectItem>
                          <SelectItem value="Alta">Alta</SelectItem>
                          <SelectItem value="Crítica">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Prioridad *</label>
                      <Select value={finding.priority} onValueChange={(val) => handleFindingChange(index, "priority", val as any)}>
                        <SelectTrigger className="h-11 text-xs font-bold border-slate-300"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baja">Baja</SelectItem>
                          <SelectItem value="Media">Media</SelectItem>
                          <SelectItem value="Alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Recomendación IHC *</label>
                    <Input 
                      value={finding.recommendation} 
                      onBlur={() => markAsTouched(`m-recom-${index}`)}
                      onChange={(e) => handleFindingChange(index, "recommendation", e.target.value)} 
                      className={`h-11 text-sm border-primary/30 bg-primary/5 font-semibold text-primary ${isInvalid(`m-recom-${index}`, finding.recommendation) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-10 space-y-10 w-full">
          <div className="max-w-md w-full text-center flex flex-col items-center px-4">
            <p className="text-sm text-slate-700 mb-8 font-medium leading-relaxed italic">
              "La síntesis es el puente entre el problema del usuario y la solución de negocio."
            </p>

            <Button
              onClick={handleSaveAll}
              disabled={loading || !isSynthesisValid}
              className={`w-full py-10 rounded-3xl text-xl font-bold shadow-xl transition-all flex items-center justify-center gap-4 ${
                isSynthesisValid
                  ? "bg-primary hover:bg-primary/90 text-white shadow-primary/20 active:scale-95"
                  : "bg-slate-100 text-slate-400 border-2 border-slate-200 cursor-not-allowed"
              }`}
            >
              {loading ? <><Loader2 className="animate-spin" size={32} /><span>Guardando resultados...</span></> : <><Save size={32} /><span>FINALIZAR TEST DE USABILIDAD</span></>}
            </Button>
            {!isSynthesisValid && <p className="text-[10px] text-red-600 font-bold uppercase mt-4 tracking-tighter text-center">Completá todos los campos para habilitar la finalización del test.</p>}
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-xs font-black text-slate-400 uppercase tracking-widest">
              <span className="h-px w-8 bg-slate-200"></span>
              Otras acciones
              <span className="h-px w-8 bg-slate-200"></span>
            </div>

            <Link
              to="/"
              className="group border-2 border-slate-200 text-slate-500 hover:border-primary hover:text-primary px-8 py-4 rounded-2xl transition-all flex items-center gap-3 font-bold bg-white"
            >
              <Clock className="group-hover:rotate-12 transition-transform" size={20} />
              Volver al Dashboard (Sin guardar)
            </Link>
          </div>
        </div>

        <NavigationButtons currentStep="synthesis" />
      </div>
    </div>
  );
}
