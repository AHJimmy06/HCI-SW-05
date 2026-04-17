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
import { useTestPlan } from "../context/useTestPlan";
import { Edit3, Plus, Trash2, Timer, AlertCircle, CheckCircle2, Compass, ShieldAlert } from "lucide-react";
import { NavigationButtons } from "../components/layout/NavigationButtons";

export function ObservationRecordPage() {
  const { data, updateObservations, addObservation, attemptedNext } = useTestPlan();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleObsChange = (index: number, field: string, value: string) => {
    const newObs = [...data.observations];
    let processedValue = value;
    
    // Evitar valores inválidos en métricas numéricas
    if (field === 'time_seconds' && Number(value) < 1) {
      processedValue = "1";
    }
    if (field === 'errors_count' && Number(value) < 0) {
      processedValue = "0";
    }
    
    newObs[index] = { ...newObs[index], [field]: processedValue };
    updateObservations(newObs);
  };

  const markAsTouched = (id: string) => {
    setTouched(prev => ({ ...prev, [id]: true }));
  };

  const removeRow = (index: number) => {
    if (data.observations.length > 1) {
      const newObs = data.observations.filter((_, i) => i !== index);
      updateObservations(newObs);
    }
  };

  const isInvalid = (id: string, val: string | number) => {
    const isFieldEmpty = typeof val === 'number' ? val <= 0 : (val === '' || val === null || val === undefined);
    return (attemptedNext && isFieldEmpty) || (touched[id] && isFieldEmpty);
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-8 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Edit3 className="text-primary" aria-hidden="true" size={28} />
              Registro de Observaciones
            </h1>
            <p className="mt-1 text-slate-700 max-w-2xl text-sm font-medium">
              Captura en tiempo real del desempeño, errores y reacciones de los participantes durante las tareas.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full border-2 border-primary/20">
            <Timer size={18} aria-hidden="true" />
            UX: Evidencia objetiva del uso
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
              <Compass size={18} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Bitácora del Test</h2>
          </div>
          <Button 
            onClick={addObservation} 
            variant="outline"
            className="border-primary text-primary hover:bg-primary/5 font-semibold shadow-sm flex items-center gap-2"
          >
            <Plus size={18} aria-hidden="true" strokeWidth={2.5} />
            <span className="hidden sm:inline">Nuevo Participante</span>
            <span className="sm:hidden text-xs">Agregar</span>
          </Button>
        </div>

        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          {/* Vista Desktop (Rediseñada a 2 niveles) */}
          <div className="hidden lg:block">
            {/* Encabezados Sincronizados */}
            <div className="bg-slate-50 border-b border-slate-200 flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-widest">
              <div className="w-48">Participante / Perfil *</div>
              <div className="w-20 text-center">Tarea *</div>
              <div className="w-24 text-center">¿Éxito? *</div>
              <div className="w-24 text-center">Tiempo (s) *</div>
              <div className="w-20 text-center">Errores *</div>
              <div className="flex-1 px-2">Comentarios clave *</div>
              <div className="w-12 text-center">X</div>
            </div>

            <div className="divide-y divide-slate-100">
              {data.observations.map((obs, index) => {
                const nameId = `obs-name-${index}`;
                const profId = `obs-profile-${index}`;
                const timeId = `obs-time-${index}`;
                const errId = `obs-errors-${index}`;
                const commId = `obs-comments-${index}`;
                const probId = `obs-prob-${index}`;
                const imprId = `obs-impr-${index}`;
                const sevId = `obs-sev-${index}`;
                const taskId = `obs-task-${index}`;

                return (
                  <div key={index} className="hover:bg-slate-50/30 transition-colors group border-b border-slate-100 last:border-0">
                    {/* Nivel 1: Métricas y Comentarios */}
                    <div className="flex items-start gap-2 p-4 pb-2">
                      <div className="w-48 space-y-1">
                        <Input 
                          id={nameId}
                          value={obs.participant_name} 
                          onBlur={() => markAsTouched(nameId)}
                          onChange={(e) => handleObsChange(index, 'participant_name', e.target.value)} 
                          className={`h-9 text-xs font-bold placeholder:text-slate-300 placeholder:font-normal ${isInvalid(nameId, obs.participant_name) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                          placeholder="Nombre del usuario"
                        />
                        <Input 
                          id={profId}
                          value={obs.participant_profile} 
                          onBlur={() => markAsTouched(profId)}
                          onChange={(e) => handleObsChange(index, 'participant_profile', e.target.value)} 
                          className={`h-7 text-[10px] italic border-slate-100 bg-transparent placeholder:text-slate-300 placeholder:font-normal ${isInvalid(profId, obs.participant_profile) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                          placeholder="Ej: Diseñador, 30 años"
                        />
                      </div>
                      
                      <div className="w-20">
                        <Select value={obs.task_label} onValueChange={(val) => { handleObsChange(index, 'task_label', val); markAsTouched(taskId); }}>
                          <SelectTrigger className={`h-9 text-xs font-bold text-primary bg-primary/5 border-primary/20 ${isInvalid(taskId, obs.task_label) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`}>
                            <SelectValue placeholder="Tarea" />
                          </SelectTrigger>
                          <SelectContent>
                            {data.tasks.map((t) => <SelectItem key={t.task_label} value={t.task_label}>{t.task_label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-24">
                        <Select value={obs.success} onValueChange={(val) => handleObsChange(index, 'success', val)}>
                          <SelectTrigger className={`h-9 text-xs font-bold ${obs.success === 'Si' ? 'text-green-800 bg-green-100 border-green-200' : 'text-red-800 bg-red-100 border-red-200'}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Si">SÍ</SelectItem>
                            <SelectItem value="No">NO</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="w-24">
                        <Input 
                          id={timeId}
                          type="number" 
                          value={obs.time_seconds} 
                          onBlur={() => markAsTouched(timeId)}
                          onChange={(e) => handleObsChange(index, 'time_seconds', e.target.value)} 
                          className={`h-9 text-center font-bold placeholder:text-slate-300 placeholder:font-normal ${isInvalid(timeId, Number(obs.time_seconds)) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                        />
                      </div>

                      <div className="w-20">
                        <Input 
                          id={errId}
                          type="number" 
                          value={obs.errors_count} 
                          onBlur={() => markAsTouched(errId)}
                          onChange={(e) => handleObsChange(index, 'errors_count', e.target.value)} 
                          className={`h-9 text-center font-bold placeholder:text-slate-300 placeholder:font-normal ${isInvalid(errId, Number(obs.errors_count)) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                        />
                      </div>

                      <div className="flex-1">
                        <Input 
                          id={commId}
                          value={obs.key_comments} 
                          onBlur={() => markAsTouched(commId)}
                          onChange={(e) => handleObsChange(index, 'key_comments', e.target.value)} 
                          className={`h-9 text-xs placeholder:text-slate-300 placeholder:font-normal ${isInvalid(commId, obs.key_comments) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                          placeholder="Frases, reacciones o dudas del usuario durante la ejecución..."
                        />
                      </div>

                      <div className="w-12 flex justify-center">
                        <Button variant="ghost" size="icon" onClick={() => removeRow(index)} className="text-slate-300 hover:text-red-600 transition-colors">
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>

                    {/* Nivel 2: Hallazgo y Severidad */}
                    <div className="flex items-center gap-6 px-4 pb-4 pt-3 bg-slate-50/50 group-hover:bg-slate-100/50 transition-colors border-t border-slate-100/50">
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                            <AlertCircle size={10} />
                            Problema detectado *
                          </label>
                          <Input 
                            id={probId}
                            value={obs.detected_problem} 
                            onBlur={() => markAsTouched(probId)}
                            onChange={(e) => handleObsChange(index, 'detected_problem', e.target.value)} 
                            className={`h-9 text-xs border-slate-200 focus:bg-white shadow-sm placeholder:text-slate-300 placeholder:font-normal ${isInvalid(probId, obs.detected_problem) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                            placeholder="Describí el obstáculo (Ej: No entiende el icono de menú)"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                            <CheckCircle2 size={10} />
                            Mejora propuesta *
                          </label>
                          <Input 
                            id={imprId}
                            value={obs.proposed_improvement} 
                            onBlur={() => markAsTouched(imprId)}
                            onChange={(e) => handleObsChange(index, 'proposed_improvement', e.target.value)} 
                            className={`h-9 text-xs border-primary/20 text-primary font-bold bg-primary/5 focus:bg-white shadow-sm placeholder:text-primary/30 placeholder:font-normal ${isInvalid(imprId, obs.proposed_improvement) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                            placeholder="Sugerencia técnica inmediata para resolver el punto de dolor..."
                          />
                        </div>
                      </div>

                      <div className="w-56 space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Severidad *</label>
                        <Select value={obs.severity} onValueChange={(val) => { handleObsChange(index, 'severity', val as any); markAsTouched(sevId); }}>
                          <SelectTrigger className={`h-9 text-xs font-bold border-slate-200 bg-white ${isInvalid(sevId, obs.severity) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`}>
                            <SelectValue placeholder="Severidad" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Baja">
                              <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                                <span className="text-emerald-700">Baja</span>
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
                                <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                                <span className="text-orange-700">Alta</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="Crítica">
                              <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-red-600" />
                                <span className="text-red-700 font-bold">Crítica</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-12" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:hidden divide-y divide-slate-100">
            {data.observations.map((obs, index) => (
              <div key={index} className="p-6 bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex flex-col">
                    <span className={`text-base font-bold ${isInvalid(obs.participant_name) ? 'text-red-600' : 'text-slate-900'}`}>
                      {obs.participant_name || `Participante ${index + 1}`}
                      {isInvalid(obs.participant_name) && <span className="ml-1 text-red-500">*</span>}
                    </span>
                    <span className="text-xs text-slate-700 italic font-medium">{obs.participant_profile || "Sin perfil definido"}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeRow(index)} className="text-red-700 h-9 px-3 font-semibold bg-red-50 hover:bg-red-100 transition-colors" aria-label={`Eliminar participante ${index + 1}`}>
                    <Trash2 size={18} className="mr-1" aria-hidden="true" />
                    Quitar
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 col-span-2">
                    <label htmlFor={`mobile-obs-name-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">
                      Nombre Participante <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <Input 
                      id={`mobile-obs-name-${index}`} 
                      value={obs.participant_name} 
                      onBlur={() => markAsTouched(`mobile-obs-name-${index}`)}
                      onChange={(e) => handleObsChange(index, 'participant_name', e.target.value)} 
                      className={`h-11 text-sm border-slate-300 font-medium text-slate-900 ${isInvalid(`mobile-obs-name-${index}`, obs.participant_name) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                      placeholder="Nombre"
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label htmlFor={`mobile-obs-profile-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">
                      Perfil / Ocupación <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <Input 
                      id={`mobile-obs-profile-${index}`} 
                      value={obs.participant_profile} 
                      onBlur={() => markAsTouched(`mobile-obs-profile-${index}`)}
                      onChange={(e) => handleObsChange(index, 'participant_profile', e.target.value)} 
                      className={`h-11 text-sm border-slate-300 font-medium text-slate-900 ${isInvalid(`mobile-obs-profile-${index}`, obs.participant_profile) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                      placeholder="Ej: Hombre, 25 años, Exp. Alta"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`mobile-obs-time-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">
                      Tiempo (s) <span className="text-red-500" aria-hidden="true">*</span>
                    </label>
                    <Input 
                      id={`mobile-obs-time-${index}`} 
                      type="number"
                      value={obs.time_seconds} 
                      onBlur={() => markAsTouched(`mobile-obs-time-${index}`)}
                      onChange={(e) => handleObsChange(index, 'time_seconds', e.target.value)} 
                      className={`h-11 text-sm border-slate-300 font-medium text-slate-900 ${isInvalid(`mobile-obs-time-${index}`, Number(obs.time_seconds)) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`mobile-obs-task-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Tarea <span className="text-red-500">*</span></label>
                    <Select value={obs.task_label} onValueChange={(val) => { handleObsChange(index, 'task_label', val); markAsTouched(`mobile-obs-task-${index}`); }}>
                      <SelectTrigger id={`mobile-obs-task-${index}`} className={`h-11 text-xs font-bold text-primary bg-primary/5 border-primary/20 ${isInvalid(`mobile-obs-task-${index}`, obs.task_label) ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}>
                        <SelectValue placeholder="Tarea" />
                      </SelectTrigger>
                      <SelectContent>
                        {data.tasks.map((task) => (
                          <SelectItem key={task.task_label} value={task.task_label}>
                            Tarea {task.task_label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <label htmlFor={`mobile-obs-success-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">¿Éxito? <span className="text-red-500">*</span></label>
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
                  <label htmlFor={`mobile-obs-problem-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Problema detectado <span className="text-red-500">*</span></label>
                  <Input 
                    id={`mobile-obs-problem-${index}`} 
                    value={obs.detected_problem} 
                    onBlur={() => markAsTouched(`mobile-obs-problem-${index}`)}
                    onChange={(e) => handleObsChange(index, 'detected_problem', e.target.value)} 
                    className={`h-11 text-sm border-slate-300 font-medium text-slate-900 ${isInvalid(`mobile-obs-problem-${index}`, obs.detected_problem) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                    placeholder="¿Qué ocurrió?" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`mobile-obs-comments-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Comentarios clave <span className="text-red-500">*</span></label>
                  <Input 
                    id={`mobile-obs-comments-${index}`} 
                    value={obs.key_comments} 
                    onBlur={() => markAsTouched(`mobile-obs-comments-${index}`)}
                    onChange={(e) => handleObsChange(index, 'key_comments', e.target.value)} 
                    className={`h-11 text-sm border-slate-300 font-medium text-slate-900 ${isInvalid(`mobile-obs-comments-${index}`, obs.key_comments) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                    placeholder="Frases, reacciones..." 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor={`mobile-obs-errors-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Errores <span className="text-red-500">*</span></label>
                    <Input 
                      id={`mobile-obs-errors-${index}`} 
                      type="number" 
                      value={obs.errors_count} 
                      onBlur={() => markAsTouched(`mobile-obs-errors-${index}`)}
                      onChange={(e) => handleObsChange(index, 'errors_count', e.target.value)} 
                      className={`h-11 text-sm border-slate-300 font-medium text-slate-900 ${isInvalid(`mobile-obs-errors-${index}`, Number(obs.errors_count)) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor={`mobile-obs-severity-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Severidad <span className="text-red-500">*</span></label>
                    <Select value={obs.severity} onValueChange={(val) => { handleObsChange(index, 'severity', val); markAsTouched(`mobile-obs-severity-${index}`); }}>
                      <SelectTrigger id={`mobile-obs-severity-${index}`} className={`h-11 text-xs font-bold border-slate-300 ${isInvalid(`mobile-obs-severity-${index}`, obs.severity) ? 'border-red-500 ring-2 ring-red-500/20' : ''}`}>
                        <SelectValue placeholder="Severidad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Baja">Baja</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Crítica">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor={`mobile-obs-suggest-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-widest block">Mejora propuesta <span className="text-red-500">*</span></label>
                  <Input 
                    id={`mobile-obs-suggest-${index}`} 
                    value={obs.proposed_improvement} 
                    onBlur={() => markAsTouched(`mobile-obs-suggest-${index}`)}
                    onChange={(e) => handleObsChange(index, 'proposed_improvement', e.target.value)} 
                    className={`h-11 text-sm border-primary/20 bg-primary/5 font-semibold text-primary ${isInvalid(`mobile-obs-suggest-${index}`, obs.proposed_improvement) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}`} 
                    placeholder="Sugerencia..." 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
          <div className="p-5 rounded-2xl border border-primary/20 bg-blue-50/50 flex gap-4">
            <CheckCircle2 className="text-primary shrink-0" size={24} aria-hidden="true" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Consejo de Observación</h3>
              <p className="text-sm text-slate-700 mt-1.5 font-medium leading-relaxed">Busca patrones. Si varios participantes fallan en lo mismo, es un hallazgo crítico de usabilidad.</p>
            </div>
          </div>
          <div className="p-5 rounded-2xl border border-red-200 bg-red-50/50 flex gap-4">
            <AlertCircle className="text-red-700 shrink-0" size={24} aria-hidden="true" />
            <div>
              <h3 className="font-bold text-red-900 text-sm uppercase tracking-wide">Métricas de Tiempo</h3>
              <p className="text-sm text-red-900 mt-1.5 font-medium leading-relaxed">Lo más valioso no es solo el tiempo, sino entender los puntos de fricción que causan la demora.</p>
            </div>
          </div>
        </div>

        <NavigationButtons currentStep="record" />
      </div>
    </div>
  );
}
