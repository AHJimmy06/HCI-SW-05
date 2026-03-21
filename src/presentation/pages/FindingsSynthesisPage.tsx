import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTestPlan } from "../context/TestPlanContext";
import { 
  SupabaseTestPlanRepository, 
  SupabaseTaskRepository, 
  SupabaseFindingRepository,
  SupabaseObservationRepository
} from "../../infrastructure/repositories/SupabaseRepositories";
import { Lightbulb, Plus, Trash2, Save, ArrowRight, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

export function FindingsSynthesisPage() {
  const { data, updateFindings, addFinding, resetData } = useTestPlan();
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null, message: string | null }>({ type: null, message: null });

  // Validación de IHC: Prevenir errores desactivando acciones incompletas
  const isDataComplete = () => {
    const hasPlan = data.plan.product_name.trim() !== "" && data.plan.objective.trim() !== "";
    const hasTasks = data.tasks.some((t: any) => t.scenario.trim() !== "");
    const hasObservations = data.observations.some((o: any) => o.participant_name.trim() !== "");
    return hasPlan && hasTasks && hasObservations;
  };

  const handleFindingChange = (index: number, field: string, value: string) => {
    const newFindings = [...data.findings];
    newFindings[index] = { ...newFindings[index], [field]: value };
    updateFindings(newFindings);
  };

  const removeRow = (index: number) => {
    if (data.findings.length > 1) {
      const newFindings = data.findings.filter((_, i) => i !== index);
      updateFindings(newFindings);
    }
  };

  const handleSaveAll = async () => {
    const validPriorities = ['Baja', 'Media', 'Alta'];
    const validStatuses = ['Pendiente', 'En Progreso', 'Resuelto'];

    setLoading(true);
    try {
      const planRepo = new SupabaseTestPlanRepository();
      const taskRepo = new SupabaseTaskRepository();
      const findingRepo = new SupabaseFindingRepository();
      const obsRepo = new SupabaseObservationRepository();

      const planId = await planRepo.create(data.plan);

      const tasksToSave = data.tasks
        .filter(t => t.scenario || t.expected_result)
        .map((t, index) => ({
          ...t,
          test_plan_id: planId,
          order_index: index
        }));
      if (tasksToSave.length > 0) await taskRepo.saveAll(tasksToSave);

      const obsToSave = data.observations
        .filter(o => o.participant_name || o.task_label)
        .map(o => ({
          test_plan_id: planId,
          success: o.success === 'Si',
          time_seconds: parseInt(o.time_seconds) || 0,
          errors_count: parseInt(o.errors_count) || 0,
          key_comments: o.key_comments,
          detected_problem: o.detected_problem,
          severity: o.severity,
          proposed_improvement: o.proposed_improvement
        }));
      
      if (obsToSave.length > 0) {
        for (const obs of obsToSave) {
          await obsRepo.save(obs);
        }
      }

      const findingsToSave = data.findings
        .filter(f => f.problem.trim() !== "")
        .map(f => ({
          ...f,
          test_plan_id: planId,
          priority: validPriorities.includes(f.priority) ? f.priority : 'Media',
          status: validStatuses.includes(f.status) ? f.status : 'Pendiente'
        }));

      if (findingsToSave.length > 0) {
        for (const finding of findingsToSave) {
          await findingRepo.save(finding);
        }
      }

      setSaveStatus({ type: 'success', message: "¡Prueba de usabilidad guardada con éxito en la base de datos!" });
      setTimeout(() => {
        resetData();
        setSaveStatus({ type: null, message: null });
      }, 3000);
    } catch (error: any) {
      console.error(error);
      setSaveStatus({ type: 'error', message: "Error al guardar: " + error.message });
    } finally {
      setLoading(false);
    }
  };

  const canSave = isDataComplete();

  return (
    <div className="flex flex-col min-h-full">
      {/* Banner de Notificación Profesional (Reemplaza a los alerts feos) */}
      {saveStatus.message && (
        <div className={`fixed top-24 right-6 z-50 animate-in slide-in-from-right duration-300 p-4 rounded-2xl shadow-medium border flex items-center gap-3 max-w-md ${
          saveStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-accent-50 border-accent-200 text-accent-800'
        }`}>
          {saveStatus.type === 'success' ? <CheckCircle2 className="text-green-600" /> : <AlertTriangle className="text-accent-600" />}
          <p className="text-sm font-bold">{saveStatus.message}</p>
        </div>
      )}

      {/* Hero Section */}
      <header className="px-6 py-8 border-b border-surface-100 bg-brand-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-900 flex items-center gap-2">
              <Lightbulb className="text-brand-600" aria-hidden="true" />
              Síntesis y Plan de Mejora
            </h1>
            <p className="mt-1 text-surface-600 max-w-2xl">
              Transforma las observaciones en hallazgos accionables. Prioriza los problemas detectados y define recomendaciones de diseño estratégicas.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-brand-700 font-medium bg-brand-100/50 px-3 py-1.5 rounded-full border border-brand-200">
            <AlertTriangle size={16} />
            HCI Best Practice: Prioriza por severidad y frecuencia
          </div>
        </div>
      </header>

      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
              <Lightbulb size={18} />
            </div>
            <h2 className="text-xl font-bold text-surface-900">Hallazgos Identificados</h2>
          </div>
          <Button 
            onClick={addFinding} 
            variant="outline"
            className="border-brand-200 text-brand-700 hover:bg-brand-50 shadow-soft flex items-center gap-2"
            aria-label="Agregar un nuevo hallazgo"
          >
            <Plus size={18} />
            Agregar Hallazgo
          </Button>
        </div>

        <div className="rounded-xl border border-surface-200 overflow-hidden shadow-soft bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="px-4 py-3 font-semibold text-surface-700 w-[20%]">Problema</th>
                  <th className="px-4 py-3 font-semibold text-surface-700 w-[25%]">Evidencia / Cita</th>
                  <th className="px-4 py-3 font-semibold text-surface-700 w-28 text-center">Severidad</th>
                  <th className="px-4 py-3 font-semibold text-surface-700 w-[25%]">Recomendación</th>
                  <th className="px-4 py-3 font-semibold text-surface-700 w-28 text-center">Prioridad</th>
                  <th className="px-4 py-3 font-semibold text-surface-700 w-28 text-center">Estado</th>
                  <th className="px-4 py-3 font-semibold text-surface-700 w-12 text-center">X</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {data.findings.map((finding, index) => (
                  <tr key={index} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-2 py-3">
                      <Input 
                        value={finding.problem} 
                        aria-label={`Problema hallazgo ${index + 1}`}
                        onChange={(e) => handleFindingChange(index, 'problem', e.target.value)} 
                        className="h-9 text-xs border-surface-200 focus:ring-brand-500" 
                        placeholder="Ej. El botón de pago es invisible"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <Input 
                        value={finding.evidence} 
                        aria-label={`Evidencia hallazgo ${index + 1}`}
                        onChange={(e) => handleFindingChange(index, 'evidence', e.target.value)} 
                        className="h-9 text-xs border-surface-200 focus:ring-brand-500" 
                        placeholder="Ej. 4/5 usuarios no lo vieron..."
                      />
                    </td>
                    <td className="px-2 py-3">
                      <Input 
                        value={finding.severity} 
                        aria-label={`Severidad hallazgo ${index + 1}`}
                        onChange={(e) => handleFindingChange(index, 'severity', e.target.value)} 
                        className="h-9 text-xs border-surface-200 text-center" 
                        placeholder="Alta"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <Input 
                        value={finding.recommendation} 
                        aria-label={`Recomendación hallazgo ${index + 1}`}
                        onChange={(e) => handleFindingChange(index, 'recommendation', e.target.value)} 
                        className="h-9 text-xs border-brand-100 bg-brand-50/20" 
                        placeholder="Ej. Usar color de contraste..."
                      />
                    </td>
                    <td className="px-2 py-3">
                      <Select value={finding.priority} onValueChange={(val) => handleFindingChange(index, 'priority', val)}>
                        <SelectTrigger className="h-9 w-24 mx-auto text-xs border-surface-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baja">Baja</SelectItem>
                          <SelectItem value="Media">Media</SelectItem>
                          <SelectItem value="Alta">Alta</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-3">
                      <Select value={finding.status} onValueChange={(val) => handleFindingChange(index, 'status', val)}>
                        <SelectTrigger className={`h-9 w-24 mx-auto text-[10px] font-bold border-surface-200 ${finding.status === 'Resuelto' ? 'bg-green-50 text-green-700' : finding.status === 'En Progreso' ? 'bg-blue-50 text-blue-700' : 'bg-surface-100 text-surface-600'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pendiente">Pendiente</SelectItem>
                          <SelectItem value="En Progreso">En Progreso</SelectItem>
                          <SelectItem value="Resuelto">Resuelto</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeRow(index)} 
                        className="text-surface-400 hover:text-accent-600 hover:bg-accent-50 transition-colors"
                        aria-label={`Eliminar hallazgo ${index + 1}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-10 space-y-6 w-full">
          <div className="max-w-md w-full text-center flex flex-col items-center">
            <p className="text-sm text-surface-500 mb-8">
              Al guardar, se consolidará el plan de prueba, las observaciones y estos hallazgos en la base de datos de Supabase para su posterior análisis en el Dashboard.
            </p>
            
            <Button 
              onClick={handleSaveAll} 
              disabled={loading || !canSave}
              className={`px-10 py-8 rounded-2xl text-lg font-bold shadow-medium transition-all flex items-center justify-center gap-3 min-w-[280px] ${
                canSave 
                  ? "bg-brand-600 hover:bg-brand-700 text-white hover:scale-[1.02] active:scale-95 shadow-medium" 
                  : "bg-surface-100 text-surface-400 border-surface-200 cursor-not-allowed opacity-60"
              }`}
              aria-live="polite"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin text-current" size={24} />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <Save className="text-current" size={24} />
                  <span>Finalizar y Guardar Todo</span>
                </>
              )}
            </Button>
            {!canSave && (
              <div className="mt-6 p-4 bg-accent-50 border border-accent-100 rounded-xl max-w-sm mx-auto animate-in fade-in zoom-in-95">
                <p className="text-xs text-accent-700 font-bold flex items-center justify-center gap-1 mb-2">
                  <AlertTriangle size={14} />
                  Faltan datos obligatorios:
                </p>
                <ul className="text-[10px] text-accent-600 space-y-1 list-disc pl-5 text-left">
                  {!data.plan.product_name && <li>Nombre del Producto (Vista Plan)</li>}
                  {!data.plan.objective && <li>Objetivo del Test (Vista Plan)</li>}
                  {!data.tasks.some((t:any) => t.scenario.trim() !== "") && <li>Definir al menos una Tarea (Vista Plan)</li>}
                  {!data.observations.some((o:any) => o.participant_name.trim() !== "") && <li>Registrar al menos un Participante (Vista Registro)</li>}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 text-xs font-medium text-surface-400 uppercase tracking-widest">
            <span className="h-px w-8 bg-surface-200"></span>
            Próximo Paso: Ver Dashboard
            <ArrowRight size={12} />
            <span className="h-px w-8 bg-surface-200"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
