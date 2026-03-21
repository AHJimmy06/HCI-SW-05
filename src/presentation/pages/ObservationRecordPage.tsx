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
import { ClipboardCheck, Plus, Trash2, Timer, AlertCircle, User, CheckCircle2 } from "lucide-react";

export function ObservationRecordPage() {
  const { data, updateObservations, addObservation, addMultipleObservations } = useTestPlan();

  const handleObsChange = (index: number, field: string, value: string) => {
    const newObs = [...data.observations];
    newObs[index] = { ...newObs[index], [field]: value };
    updateObservations(newObs);
  };

  const removeRow = (index: number) => {
    if (data.observations.length > 1) {
      const newObs = data.observations.filter((_, i) => i !== index);
      updateObservations(newObs);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <header className="px-6 py-8 border-b border-surface-100 bg-brand-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-900 flex items-center gap-2">
              <ClipboardCheck className="text-brand-600" aria-hidden="true" />
              Registro de Observaciones
            </h1>
            <p className="mt-1 text-surface-600 max-w-2xl">
              Captura el desempeño de los participantes en tiempo real. Registra métricas cuantitativas y observaciones cualitativas críticas.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-brand-700 font-medium bg-brand-100/50 px-3 py-1.5 rounded-full border border-brand-200">
            <Timer size={16} />
            HCI Best Practice: Registra errores inmediatamente
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
              <User size={18} />
            </div>
            <h2 className="text-xl font-bold text-surface-900">Datos de la Sesión</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-surface-400 uppercase mr-2 hidden sm:inline">Carga rápida:</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => addMultipleObservations(1)}
              className="border-brand-200 text-brand-600 hover:bg-brand-50"
            >
              +1
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => addMultipleObservations(3)}
              className="border-brand-200 text-brand-600 hover:bg-brand-50 mr-4"
            >
              +3
            </Button>
            <Button 
              onClick={addObservation} 
              className="bg-brand-600 hover:bg-brand-700 text-white shadow-soft flex items-center gap-2"
              aria-label="Agregar un nuevo registro de observación"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Nuevo Registro</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-surface-200 overflow-hidden shadow-soft bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="px-4 py-3 font-semibold text-surface-700 w-32">Participante</th>
                  <th className="px-4 py-3 font-semibold text-surface-700 w-16 text-center">T#</th>
                  <th className="px-4 py-3 font-semibold text-surface-700 w-24 text-center">Éxito</th>
                  <th className="px-4 py-3 font-semibold text-surface-700 w-24 text-center">Tiempo (s)</th>
                  <th className="px-4 py-3 font-semibold text-surface-700 w-20 text-center">Errores</th>
                  <th className="px-4 py-3 font-semibold text-surface-700 min-w-[200px]">Problema Detectado</th>
                  <th className="px-4 py-3 font-semibold text-surface-700 w-32 text-center">Severidad</th>
                  <th className="px-4 py-3 font-semibold text-surface-700 w-14 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {data.observations.map((obs, index) => (
                  <tr key={index} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-2 py-3">
                      <div className="space-y-1">
                        <Input 
                          value={obs.participant_name} 
                          aria-label={`Nombre del participante ${index + 1}`}
                          onChange={(e) => handleObsChange(index, 'participant_name', e.target.value)} 
                          className="h-8 text-xs border-surface-200 focus:ring-brand-500" 
                          placeholder="Nombre"
                        />
                        <Input 
                          value={obs.participant_profile} 
                          aria-label={`Perfil del participante ${index + 1}`}
                          onChange={(e) => handleObsChange(index, 'participant_profile', e.target.value)} 
                          className="h-8 text-[10px] border-surface-200 text-surface-500 italic" 
                          placeholder="Perfil/Segmento"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <Select value={obs.task_label} onValueChange={(val) => handleObsChange(index, 'task_label', val)}>
                        <SelectTrigger className="h-8 w-16 mx-auto text-xs font-bold text-brand-700 bg-brand-50/50 border-brand-100">
                          <SelectValue placeholder="T#" />
                        </SelectTrigger>
                        <SelectContent>
                          {data.tasks.map((task) => (
                            <SelectItem key={task.task_label} value={task.task_label}>
                              {task.task_label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Select value={obs.success} onValueChange={(val) => handleObsChange(index, 'success', val)}>
                        <SelectTrigger className={`h-8 w-20 mx-auto text-xs font-medium border-surface-200 ${obs.success === 'Si' ? 'text-green-700 bg-green-50 border-green-200' : 'text-accent-700 bg-accent-50 border-accent-200'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Si">Sí</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-3">
                      <Input 
                        type="number" 
                        value={obs.time_seconds} 
                        aria-label={`Segundos para observación ${index + 1}`}
                        onChange={(e) => handleObsChange(index, 'time_seconds', e.target.value)} 
                        className="h-8 w-20 mx-auto text-center border-surface-200" 
                      />
                    </td>
                    <td className="px-2 py-3">
                      <Input 
                        type="number" 
                        value={obs.errors_count} 
                        aria-label={`Conteo de errores para observación ${index + 1}`}
                        onChange={(e) => handleObsChange(index, 'errors_count', e.target.value)} 
                        className="h-8 w-16 mx-auto text-center border-surface-200" 
                      />
                    </td>
                    <td className="px-2 py-3">
                      <div className="space-y-1">
                        <Input 
                          value={obs.detected_problem} 
                          aria-label={`Problema detectado en observación ${index + 1}`}
                          onChange={(e) => handleObsChange(index, 'detected_problem', e.target.value)} 
                          className="h-8 text-xs border-surface-200 focus:ring-brand-500" 
                          placeholder="Describe el obstáculo..."
                        />
                        <Input 
                          value={obs.proposed_improvement} 
                          aria-label={`Mejora propuesta para observación ${index + 1}`}
                          onChange={(e) => handleObsChange(index, 'proposed_improvement', e.target.value)} 
                          className="h-8 text-[10px] border-surface-100 text-brand-600 bg-brand-50/20" 
                          placeholder="Sugerencia de mejora inmediata..."
                        />
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <Select value={obs.severity} onValueChange={(val) => handleObsChange(index, 'severity', val)}>
                        <SelectTrigger className="h-8 w-28 mx-auto text-xs border-surface-200">
                          <SelectValue placeholder="Severidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baja">Baja</SelectItem>
                          <SelectItem value="Media">Media</SelectItem>
                          <SelectItem value="Alta">Alta</SelectItem>
                          <SelectItem value="Crítica">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeRow(index)} 
                        className="text-surface-400 hover:text-accent-600 hover:bg-accent-50 transition-colors"
                        aria-label={`Eliminar registro ${index + 1}`}
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

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
          <div className="p-4 rounded-xl border border-brand-100 bg-brand-50/30 flex gap-3">
            <CheckCircle2 className="text-brand-600 shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-brand-900 text-sm">Consejo de Observación</h3>
              <p className="text-xs text-surface-600 mt-1">Busca patrones en las dificultades de los participantes. Si tres personas fallan en lo mismo, es un hallazgo crítico.</p>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-accent-100 bg-accent-50/30 flex gap-3">
            <AlertCircle className="text-accent-600 shrink-0" size={20} />
            <div>
              <h3 className="font-bold text-accent-900 text-sm">Métrica de Tiempo</h3>
              <p className="text-xs text-surface-600 mt-1">No te obsesiones con el cronómetro exacto, lo más valioso es entender por qué tardan más de lo esperado.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
