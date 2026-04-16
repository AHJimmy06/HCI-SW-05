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
import { Edit3, Plus, Trash2, Timer, AlertCircle, CheckCircle2, Compass, ShieldAlert } from "lucide-react";
import { NavigationButtons } from "../components/layout/NavigationButtons";

export function ObservationRecordPage() {
  const { data, updateObservations, addObservation } = useTestPlan();

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
      <header className="px-6 py-8 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="text-primary" aria-hidden="true" size={28} />
              Bitácora de Campo
            </h1>
            <p className="mt-1 text-slate-700 max-w-2xl text-sm font-medium">
              Diario de notas tomadas en vivo para capturar el desempeño y las reacciones de la tripulación en tiempo real.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full border-2 border-primary/20">
            <Timer size={18} aria-hidden="true" />
            IHC: Registro inmutable de la misión
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
              <Compass size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Registro de Exploración</h2>
          </div>
          <Button 
            onClick={addObservation} 
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5 font-semibold shadow-sm flex items-center gap-2"
          >
            <Plus size={18} aria-hidden="true" strokeWidth={2.5} />
            <span className="hidden sm:inline">Nuevo Tripulante</span>
            <span className="sm:hidden text-xs">Agregar</span>
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-32">Tripulante</th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-16 text-center">M#</th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-24 text-center">Éxito</th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-24 text-center">Tiempo (s)</th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-20 text-center">Turbulencias</th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 min-w-[200px]">Anomalía Detectada</th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-32 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <ShieldAlert size={14} className="text-slate-400" />
                      Semáforo
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-14 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.observations.map((obs, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-2 py-3">
                      <div className="space-y-1">
                        <Input 
                          id={`obs-name-${index}`}
                          value={obs.participant_name} 
                          aria-label={`Nombre del tripulante ${index + 1}`}
                          onChange={(e) => handleObsChange(index, 'participant_name', e.target.value)} 
                          className="h-9 text-xs border-slate-200 focus:border-primary focus:bg-white bg-slate-50 font-medium text-slate-900" 
                          placeholder="Nombre"
                        />
                        <Input 
                          id={`obs-profile-${index}`}
                          value={obs.participant_profile} 
                          aria-label={`Ocupación del tripulante ${index + 1}`}
                          onChange={(e) => handleObsChange(index, 'participant_profile', e.target.value)} 
                          className="h-8 text-xs border-slate-100 text-slate-600 italic bg-transparent font-medium placeholder:text-slate-400" 
                          placeholder="Ocupación"
                        />
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <Select value={obs.task_label} onValueChange={(val) => handleObsChange(index, 'task_label', val)}>
                        <SelectTrigger aria-label={`Maniobra observación ${index + 1}`} className="h-9 w-16 mx-auto text-xs font-bold text-primary bg-primary/5 border-primary/20">
                          <SelectValue placeholder="M#" />
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
                        <SelectTrigger aria-label={`Éxito observación ${index + 1}`} className={`h-9 w-20 mx-auto text-xs font-bold ${obs.success === 'Si' ? 'text-green-800 bg-green-100 border-green-200' : 'text-red-800 bg-red-100 border-red-200'}`}>
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
                        id={`obs-time-${index}`}
                        type="number" 
                        aria-label={`Segundos observación ${index + 1}`}
                        value={obs.time_seconds} 
                        onChange={(e) => handleObsChange(index, 'time_seconds', e.target.value)} 
                        className="h-9 w-20 mx-auto text-center border-slate-200 focus:border-primary font-bold text-slate-900" 
                      />
                    </td>
                    <td className="px-2 py-3">
                      <Input 
                        id={`obs-errors-${index}`}
                        type="number" 
                        aria-label={`Turbulencias observación ${index + 1}`}
                        value={obs.errors_count} 
                        onChange={(e) => handleObsChange(index, 'errors_count', e.target.value)} 
                        className="h-9 w-16 mx-auto text-center border-slate-200 focus:border-primary font-bold text-slate-900" 
                      />
                    </td>
                    <td className="px-2 py-3">
                      <div className="space-y-1">
                        <Input 
                          id={`obs-problem-${index}`}
                          value={obs.detected_problem} 
                          aria-label={`Anomalía detectada ${index + 1}`}
                          onChange={(e) => handleObsChange(index, 'detected_problem', e.target.value)} 
                          className="h-9 text-xs border-slate-200 focus:border-primary focus:bg-white bg-slate-50 font-medium text-slate-900 placeholder:text-slate-500" 
                          placeholder="¿Qué ocurrió?"
                        />
                        <Input 
                          id={`obs-suggest-${index}`}
                          value={obs.proposed_improvement} 
                          aria-label={`Mejora propuesta ${index + 1}`}
                          onChange={(e) => handleObsChange(index, 'proposed_improvement', e.target.value)} 
                          className="h-8 text-xs border-primary/20 text-primary font-bold bg-primary/5 focus:border-primary placeholder:text-primary/50" 
                          placeholder="Sugerencia..."
                        />
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      <Select value={obs.severity} onValueChange={(val) => handleObsChange(index, 'severity', val)}>
                        <SelectTrigger aria-label={`Severidad observación ${index + 1}`} className="h-9 w-28 mx-auto text-xs border-slate-300 font-bold text-slate-800">
                          <SelectValue placeholder="Severidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Baja">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-green-600" />
                              Baja
                            </div>
                          </SelectItem>
                          <SelectItem value="Media">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-yellow-500" />
                              Media
                            </div>
                          </SelectItem>
                          <SelectItem value="Alta">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-orange-600" />
                              Alta
                            </div>
                          </SelectItem>
                          <SelectItem value="Crítica">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-600" />
                              Crítica
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <Button variant="ghost" size="icon" onClick={() => removeRow(index)} className="text-slate-400 hover:text-red-700 h-8 w-8 transition-colors" aria-label={`Eliminar registro ${index + 1}`}>
                        <Trash2 size={18} aria-hidden="true" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="lg:hidden divide-y divide-slate-100">
            {data.observations.map((obs, index) => (
              <div key={index} className="p-6 bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-slate-900">{obs.participant_name || `Tripulante ${index + 1}`}</span>
                    <span className="text-xs text-slate-700 italic font-medium">{obs.participant_profile || "Sin ocupación"}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeRow(index)} className="text-red-700 h-9 px-3 font-semibold bg-red-50 hover:bg-red-100 transition-colors" aria-label={`Eliminar tripulante ${index + 1}`}>
                    <Trash2 size={18} className="mr-1" aria-hidden="true" />
                    Quitar
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor={`mobile-obs-task-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Maniobra Asociada</label>
                    <Select value={obs.task_label} onValueChange={(val) => handleObsChange(index, 'task_label', val)}>
                      <SelectTrigger id={`mobile-obs-task-${index}`} className="h-11 text-xs font-bold text-primary bg-primary/5 border-primary/20">
                        <SelectValue placeholder="M#" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.tasks.map((task) => (
                          <SelectItem key={task.task_label} value={task.task_label}>
                            Maniobra {task.task_label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`mobile-obs-success-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">¿Éxito?</label>
                    <Select value={obs.success} onValueChange={(val) => handleObsChange(index, 'success', val)}>
                      <SelectTrigger id={`mobile-obs-success-${index}`} className={`h-11 text-xs font-bold ${obs.success === 'Si' ? 'text-green-800 bg-green-100 border-green-200' : 'text-red-800 bg-red-100 border-red-200'}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Si">Sí</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`mobile-obs-problem-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Anomalía Detectada</label>
                  <Input id={`mobile-obs-problem-${index}`} value={obs.detected_problem} onChange={(e) => handleObsChange(index, 'detected_problem', e.target.value)} className="h-11 text-sm border-slate-300 font-medium text-slate-900" placeholder="¿Qué ocurrió?" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
          <div className="p-5 rounded-2xl border border-primary/20 bg-blue-50/50 flex gap-4">
            <CheckCircle2 className="text-primary shrink-0" size={24} aria-hidden="true" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Guía del Explorador</h3>
              <p className="text-sm text-slate-700 mt-1.5 font-medium leading-relaxed">Busca patrones. Si tres tripulantes fallan en lo mismo, es un hallazgo crítico de usabilidad.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-red-200 bg-red-50/50 flex gap-4">
            <AlertCircle className="text-red-700 shrink-0" size={24} aria-hidden="true" />
            <div>
              <h3 className="font-bold text-red-900 text-sm uppercase tracking-wide">Cronómetro de Misión</h3>
              <p className="text-sm text-red-900 mt-1.5 font-medium leading-relaxed">Lo más valioso no es el tiempo exacto, sino entender por qué el tripulante se demora.</p>
            </div>
          </div>
        </div>

        <NavigationButtons currentStep="registro" />
      </div>
    </div>
  );
}
