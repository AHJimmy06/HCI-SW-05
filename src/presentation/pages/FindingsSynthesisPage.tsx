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
import { Lightbulb, Plus, Trash2, Save, ArrowRight, Loader2 } from "lucide-react";

export function FindingsSynthesisPage() {
  const { data, updateFindings, addFinding, resetData } = useTestPlan();
  const [loading, setLoading] = useState(false);

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

      alert("¡Todos los datos se han guardado correctamente!");
      resetData();
    } catch (error: any) {
      console.error(error);
      alert("Error al guardar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <header className="px-6 py-8 border-b border-surface-100 bg-brand-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-brand-900 flex items-center gap-2">
              <Lightbulb className="text-brand-600" aria-hidden="true" />
              Síntesis y Plan de Mejora
            </h1>
            <p className="mt-1 text-surface-600 max-w-2xl text-sm">
              Transforma las observaciones en hallazgos accionables. Prioriza los problemas y define recomendaciones de diseño.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             <Button 
                onClick={addFinding} 
                variant="outline"
                className="border-brand-200 text-brand-700 hover:bg-brand-50 shadow-sm hidden sm:flex items-center gap-2"
              >
                <Plus size={18} />
                Hallazgo
              </Button>

              <Button 
                onClick={handleSaveAll} 
                disabled={loading}
                className="bg-brand-100 hover:bg-brand-200 text-black px-6 py-5 rounded-xl font-bold shadow-soft border border-brand-300 transition-all hover:shadow-medium active:scale-95 disabled:opacity-50 flex items-center justify-center min-w-[140px]"
              >
                {loading ? (
                  <Loader2 className="animate-spin mr-2 text-black" size={18} />
                ) : (
                  <Save className="mr-2 text-black" size={18} />
                )}
                <span className="text-black font-bold">
                  {loading ? "Guardando..." : "Guardar Todo"}
                </span>
              </Button>
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

        <div className="flex flex-col items-center py-10 space-y-6">
          <div className="max-w-md text-center">
            <p className="text-sm text-surface-500 mb-6">
              Al guardar, se consolidará el plan de prueba, las observaciones y estos hallazgos en la base de datos de Supabase para su posterior análisis en el Dashboard.
            </p>
            <Button 
              onClick={handleSaveAll} 
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-700 text-white px-10 py-6 rounded-2xl text-lg font-bold shadow-medium transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:scale-100"
              aria-live="polite"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin" size={20} />
                  Sincronizando...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={20} />
                  Finalizar y Guardar Todo
                </span>
              )}
            </Button>
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
