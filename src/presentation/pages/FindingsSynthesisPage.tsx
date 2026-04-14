import { useState } from "react";
import { Link } from "react-router-dom";
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
  type TaskDraft, 
  type ObservationDraft, 
  type FindingDraft 
} from "@/domain/entities/types";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  Plus,
  Trash2,
  Save,
  ArrowRight,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Gem,
  ShieldAlert
} from "lucide-react";
import { NavigationButtons } from "../components/layout/NavigationButtons";

export function FindingsSynthesisPage() {
  const { data, updateFindings, addFinding, updateTestPlanId } = useTestPlan();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const isDataComplete = () => {
    const hasPlan = (data.plan.product_name || "").trim() !== "" && (data.plan.objective || "").trim() !== "";
    const hasTasks = data.tasks.some((t: TaskDraft) => (t.scenario || "").trim() !== "");
    const hasObservations = data.observations.some((o: ObservationDraft) => (o.participant_name || "").trim() !== "");
    return hasPlan && hasTasks && hasObservations;
  };

  const handleFindingChange = (index: number, field: keyof FindingDraft, value: string) => {
    const newFindings = [...data.findings];
    newFindings[index] = { ...newFindings[index], [field]: value } as FindingDraft;
    updateFindings(newFindings);
  };

  const removeRow = (index: number) => {
    if (data.findings.length > 1) {
      const newFindings = data.findings.filter((_, i) => i !== index);
      updateFindings(newFindings);
    }
  };

  const handleSaveAll = async () => {
    const validPriorities: FindingDraft['priority'][] = ["Baja", "Media", "Alta"];
    const validStatuses: FindingDraft['status'][] = ["Pendiente", "En Progreso", "Resuelto"];
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
        .filter((o: ObservationDraft) => (o.participant_name || "").trim() !== "" || o.task_label)
        .map((o: ObservationDraft) => {
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
          severity: f.severity,
          recommendation: f.recommendation,
          priority: validPriorities.includes(f.priority) ? f.priority : "Media",
          status: validStatuses.includes(f.status) ? f.status : "Pendiente",
        }));

      await findingRepo.saveAll(findingsToSave);
      if (planId) updateTestPlanId(planId);

      setSaveStatus({
        type: "success",
        message: data.test_plan_id ? "¡Prueba actualizada!" : "¡Prueba guardada con éxito!",
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setSaveStatus({
        type: "error",
        message: "Error al guardar: " + errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const canSave = isDataComplete();

  return (
    <div className="flex flex-col min-h-full">
      {saveStatus.message && (
        <div role="status" aria-live="polite" className={`fixed top-24 right-6 z-50 p-6 rounded-3xl shadow-2xl border-2 flex items-center gap-4 max-w-md animate-in slide-in-from-right duration-300 ${saveStatus.type === "success" ? "bg-green-600 border-green-700 text-white" : "bg-red-600 border-red-700 text-white"}`}>
          <div className="h-12 w-12 rounded-full flex items-center justify-center shrink-0 bg-white/20">
            {saveStatus.type === "success" ? <CheckCircle2 size={28} className="text-white" /> : <AlertTriangle size={28} className="text-white" />}
          </div>
          <div>
            <p className="text-sm font-bold">{saveStatus.message}</p>
            {saveStatus.type === "success" && <Link to="/" className="inline-block mt-2 text-xs font-bold underline hover:no-underline">Ir al Dashboard</Link>}
          </div>
          <button onClick={() => setSaveStatus({ type: null, message: null })} className="ml-auto text-white/80 hover:text-white p-2" aria-label="Cerrar">
            <Trash2 size={20} aria-hidden="true" />
          </button>
        </div>
      )}

      <header className="px-6 py-8 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Filter className="text-primary" aria-hidden="true" size={28} />
              El Tamiz (Síntesis)
            </h1>
            <p className="mt-1 text-slate-700 max-w-2xl text-sm font-medium">Proceso de filtrado para separar la arena de los hallazgos críticos y transformar las observaciones en oro.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-red-900 font-semibold bg-red-100 px-4 py-2 rounded-full border-2 border-red-200">
            <Gem size={18} aria-hidden="true" />
            IHC: Separa la arena del oro accionable
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
              <Gem size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Material Valioso (Hallazgos)</h2>
          </div>
          <Button onClick={addFinding} variant="outline" className="border-primary text-primary font-semibold shadow-sm flex items-center gap-2 hover:bg-primary/5">
            <Plus size={18} aria-hidden="true" strokeWidth={2.5} />
            <span className="hidden sm:inline">Nuevo Hallazgo</span>
            <span className="sm:hidden text-xs">Nuevo</span>
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-[20%]">Impureza (Problema)</th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-[25%]">Evidencia de Campo</th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-28 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <ShieldAlert size={14} className="text-slate-400" />
                      Semáforo
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-[25%]">Refinamiento (Recomendación)</th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-28 text-center">Prioridad</th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-12 text-center">X</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.findings.map((finding, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-2 py-3">
                      <Input id={`find-prob-${index}`} value={finding.problem} aria-label={`Problema hallazgo ${index + 1}`} onChange={(e) => handleFindingChange(index, "problem", e.target.value)} className="h-9 text-xs border-slate-200 font-medium text-slate-900" placeholder="Problema..." />
                    </td>
                    <td className="px-2 py-3">
                      <Input id={`find-evid-${index}`} value={finding.evidence} aria-label={`Evidencia hallazgo ${index + 1}`} onChange={(e) => handleFindingChange(index, "evidence", e.target.value)} className="h-9 text-xs border-slate-200 font-medium text-slate-900" placeholder="Evidencia..." />
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Select value={finding.severity} onValueChange={(val) => handleFindingChange(index, "severity", val)}>
                        <SelectTrigger aria-label={`Severidad hallazgo ${index + 1}`} className="h-9 w-24 mx-auto text-xs border-slate-300 font-semibold text-slate-800">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baja">
                            <div className="flex items-center gap-2 text-xs">
                              <div className="h-2 w-2 rounded-full bg-green-600" />
                              Baja
                            </div>
                          </SelectItem>
                          <SelectItem value="Media">
                            <div className="flex items-center gap-2 text-xs">
                              <div className="h-2 w-2 rounded-full bg-yellow-500" />
                              Media
                            </div>
                          </SelectItem>
                          <SelectItem value="Alta">
                            <div className="flex items-center gap-2 text-xs">
                              <div className="h-2 w-2 rounded-full bg-orange-600" />
                              Alta
                            </div>
                          </SelectItem>
                          <SelectItem value="Crítica">
                            <div className="flex items-center gap-2 text-xs">
                              <div className="h-2 w-2 rounded-full bg-red-600" />
                              Crítica
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-3">
                      <Input id={`find-recom-${index}`} value={finding.recommendation} aria-label={`Recomendación hallazgo ${index + 1}`} onChange={(e) => handleFindingChange(index, "recommendation", e.target.value)} className="h-9 text-xs border-primary/30 text-primary font-semibold bg-primary/5 focus:border-primary placeholder:text-primary/40" placeholder="Recomendación..." />
                    </td>
                    <td className="px-2 py-3">
                      <Select value={finding.priority} onValueChange={(val) => handleFindingChange(index, "priority", val)}>
                        <SelectTrigger aria-label={`Prioridad hallazgo ${index + 1}`} className="h-9 w-24 mx-auto text-xs border-slate-300 font-semibold text-slate-800"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baja"><Badge variant="outline" className="text-[10px] uppercase font-bold">Baja</Badge></SelectItem>
                          <SelectItem value="Media"><Badge variant="secondary" className="text-[10px] uppercase font-bold">Media</Badge></SelectItem>
                          <SelectItem value="Alta"><Badge variant="destructive" className="text-[10px] uppercase font-bold">Alta</Badge></SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Button variant="ghost" size="icon" onClick={() => removeRow(index)} className="text-slate-400 hover:text-red-700 transition-colors" aria-label={`Eliminar hallazgo ${index + 1}`}><Trash2 size={16} /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden divide-y divide-slate-100">
            {data.findings.map((finding, index) => (
              <div key={index} className="p-6 bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-sm font-bold text-primary uppercase tracking-wider">Hallazgo #{index + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeRow(index)} className="text-red-700 font-semibold bg-red-50 hover:bg-red-100 transition-colors px-3" aria-label={`Eliminar hallazgo ${index + 1}`}><Trash2 size={18} className="mr-1" aria-hidden="true" /> Eliminar</Button>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label htmlFor={`mobile-find-prob-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Impureza (Problema)</label>
                    <Input id={`mobile-find-prob-${index}`} value={finding.problem} onChange={(e) => handleFindingChange(index, "problem", e.target.value)} className="h-11 text-sm border-slate-300 font-medium text-slate-900" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`mobile-find-recom-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Refinamiento</label>
                    <Input id={`mobile-find-recom-${index}`} value={finding.recommendation} onChange={(e) => handleFindingChange(index, "recommendation", e.target.value)} className="h-11 text-sm border-primary/30 bg-primary/5 font-semibold text-primary" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-10 space-y-10 w-full">
          <div className="max-w-md w-full text-center flex flex-col items-center px-4">
            <p className="text-sm text-slate-700 mb-8 font-medium leading-relaxed">
              Al finalizar el tamizado, toda la información se sincronizará con tu tablero de control central.
            </p>

            <Button
              onClick={handleSaveAll}
              disabled={loading || !canSave}
              className={`w-full py-10 rounded-3xl text-xl font-bold shadow-md transition-all flex items-center justify-center gap-4 ${
                canSave
                  ? "bg-primary hover:bg-primary/90 text-white shadow-primary/20 active:scale-95"
                  : "bg-slate-100 text-slate-500 border border-slate-200 cursor-not-allowed opacity-80"
              }`}
            >
              {loading ? <><Loader2 className="animate-spin" size={32} /><span>Sincronizando...</span></> : <><Save size={32} /><span>GUARDAR RESULTADOS</span></>}
            </Button>
          </div>

          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-4 text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="h-px w-12 bg-slate-300" aria-hidden="true"></span>
              Siguiente Paso Sugerido
              <span className="h-px w-12 bg-slate-300" aria-hidden="true"></span>
            </div>

            <Link
              to="/"
              className="group border-2 border-slate-300 text-slate-700 hover:border-primary hover:text-primary px-8 py-4 rounded-2xl transition-all flex items-center gap-3 font-bold"
            >
              <ArrowRight className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              Ver Dashboard de Resultados
            </Link>
          </div>
        </div>

        <NavigationButtons currentStep="sintesis" />
      </div>
    </div>
  );
}
