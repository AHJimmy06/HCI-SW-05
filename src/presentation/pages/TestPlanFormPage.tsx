import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTestPlan } from "../context/useTestPlan";
import { 
  Plus, Trash2, Info, ClipboardList, Users, Settings, 
  AlertCircle, Link as LinkIcon, Clock, Save, Loader2, CheckCircle2 
} from "lucide-react";
import { NavigationButtons } from "../components/layout/NavigationButtons";
import { SupabaseTestPlanRepository, SupabaseTaskRepository } from "../../infrastructure/repositories/SupabaseRepositories";

export function TestPlanFormPage() {
  const { data, updatePlan, updateTasks, addTask, deleteTask, attemptedNext, validationStatus } = useTestPlan();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleTaskChange = (index: number, field: string, value: string) => {
    const newTasks = [...data.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    updateTasks(newTasks);
  };

  const markAsTouched = (id: string) => {
    setTouched(prev => ({ ...prev, [id]: true }));
  };

  const removeRow = (index: number) => {
    deleteTask(index);
  };

  const getFieldError = (id: string, val: string) => {
    const isEmpty = (val || '').trim() === '';
    return (attemptedNext && isEmpty) || (touched[id] && isEmpty);
  };

  const inputClass = (id: string, val: string) => `
    bg-white border-slate-300 focus:border-primary focus:ring-primary/20 transition-all duration-200 
    ${getFieldError(id, val) ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/30' : ''}
  `;

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-8 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="text-primary" aria-hidden="true" size={28} />
              Planificación del Test
            </h1>
            <p className="mt-1 text-slate-700 max-w-2xl text-sm font-medium">
              Configuración de los objetivos, perfil de usuarios y logística general del estudio.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full border-2 border-primary/20">
            <Info size={18} aria-hidden="true" />
            Configuración del Plan
          </div>
        </div>
      </header>

      <div className="p-6 space-y-10">
        {/* SECCIÓN 1: Contexto general */}
        <section aria-labelledby="context-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-75">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
              <Settings size={18} />
            </div>
            <h2 id="context-heading" className="text-xl font-bold text-slate-900">
              1. Contexto general
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="space-y-2">
              <label htmlFor="product_name" className="text-sm font-semibold text-slate-800 block">
                Producto / servicio <span className="text-red-500">*</span>
              </label>
              <Input 
                id="product_name"
                value={data.plan.product_name}
                onChange={(e) => updatePlan('product_name', e.target.value)}
                onBlur={() => markAsTouched('product_name')}
                className={inputClass('product_name', data.plan.product_name)}
                placeholder="Ej. Airbnb, Booking.com" 
              />
              <p className={`text-[10px] font-medium px-1 ${getFieldError('product_name', data.plan.product_name) ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                {getFieldError('product_name', data.plan.product_name) ? "El nombre del producto es obligatorio." : "Nombre oficial de la aplicación o servicio a evaluar."}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="module_name" className="text-sm font-semibold text-slate-800 block">
                Pantalla / módulo <span className="text-red-500">*</span>
              </label>
              <Input 
                id="module_name"
                value={data.plan.module_name}
                onChange={(e) => updatePlan('module_name', e.target.value)}
                onBlur={() => markAsTouched('module_name')}
                className={inputClass('module_name', data.plan.module_name)}
                placeholder="Ej. Checkout, Login, Home" 
              />
              <p className={`text-[10px] font-medium px-1 ${getFieldError('module_name', data.plan.module_name) ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                {getFieldError('module_name', data.plan.module_name) ? "Define qué sección vas a testear." : "Módulo o flujo específico (ej: Proceso de pago)."}
              </p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="objective" className="text-sm font-semibold text-slate-800 block">
                Objetivo del test <span className="text-red-500">*</span>
              </label>
              <Input 
                id="objective"
                value={data.plan.objective}
                onChange={(e) => updatePlan('objective', e.target.value)}
                onBlur={() => markAsTouched('objective')}
                className={inputClass('objective', data.plan.objective)}
                placeholder="Ej. Evaluar la facilidad de reserva..." 
              />
              <p className={`text-[10px] font-medium px-1 ${getFieldError('objective', data.plan.objective) ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                {getFieldError('objective', data.plan.objective) ? "Define el propósito de la investigación." : "La meta principal que persigue este test IHC."}
              </p>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="user_profile" className="text-sm font-semibold text-slate-800 block">
                Perfil de usuarios <span className="text-red-500">*</span>
              </label>
              <Input 
                id="user_profile"
                value={data.plan.user_profile}
                onChange={(e) => updatePlan('user_profile', e.target.value)}
                onBlur={() => markAsTouched('user_profile')}
                className={inputClass('user_profile', data.plan.user_profile)}
                placeholder="Ej. 5 participantes con experiencia media" 
              />
              <p className={`text-[10px] font-medium px-1 ${getFieldError('user_profile', data.plan.user_profile) ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                {getFieldError('user_profile', data.plan.user_profile) ? "Especifica a quién va dirigido el test." : "Edad, experiencia tecnológica y rasgos relevantes del grupo."}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="method" className="text-sm font-semibold text-slate-800 block">
                Método <span className="text-red-500">*</span>
              </label>
              <Input 
                id="method"
                value={data.plan.method}
                onChange={(e) => updatePlan('method', e.target.value)}
                onBlur={() => markAsTouched('method')}
                className={inputClass('method', data.plan.method)}
                placeholder="Ej. Moderada presencial" 
              />
              <p className={`text-[10px] font-medium px-1 ${getFieldError('method', data.plan.method) ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                {getFieldError('method', data.plan.method) ? "Define el método de trabajo." : "Técnica a aplicar (Ej: Guerrilla, Remoto, Laboratorio)."}
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="duration" className="text-sm font-semibold text-slate-800 block">
                Duración estimada <span className="text-red-500">*</span>
              </label>
              <Input 
                id="duration"
                value={data.plan.duration}
                onChange={(e) => updatePlan('duration', e.target.value)}
                onBlur={() => markAsTouched('duration')}
                className={inputClass('duration', data.plan.duration)}
                placeholder="Ej. 10-15 minutos por participante" 
              />
              <p className={`text-[10px] font-medium px-1 ${getFieldError('duration', data.plan.duration) ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                {getFieldError('duration', data.plan.duration) ? "Especificá la duración del test." : "Tiempo proyectado de cada sesión de prueba."}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 block">Fecha de creación (Auto)</label>
                <div className="h-10 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-500 font-medium flex items-center gap-2">
                   <Clock size={14} />
                   {data.test_plan_id ? "Registrada en archivo" : new Date().toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 block">Estado de Misión</label>
                <div className="h-10 px-3 py-2 bg-primary/5 border border-primary/10 rounded-md text-xs text-primary font-bold uppercase tracking-widest flex items-center gap-2">
                   <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                   {data.test_plan_id ? "Editando Plan" : "Nueva Planificación"}
                </div>
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="place_channel" className="text-sm font-semibold text-slate-800 block">
                Lugar / Canal de Comunicación <span className="text-red-500">*</span>
              </label>
              <Input 
                id="place_channel"
                value={data.plan.place_channel}
                onChange={(e) => updatePlan('place_channel', e.target.value)}
                onBlur={() => markAsTouched('place_channel')}
                className={inputClass('place_channel', data.plan.place_channel)}
                placeholder="Ej. Laboratorio IHC, Teams, Remoto" 
              />
              <p className={`text-[10px] font-medium px-1 ${getFieldError('place_channel', data.plan.place_channel) ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                {getFieldError('place_channel', data.plan.place_channel) ? "Define dónde se realizará el test." : "Nombre de la sala física o plataforma virtual."}
              </p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 2: Tareas del test */}
        <section aria-labelledby="tasks-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
                <ClipboardList size={18} />
              </div>
              <h2 id="tasks-heading" className="text-xl font-bold text-slate-900">
                2. Tareas del test
              </h2>
            </div>
            <Button onClick={addTask} variant="outline" className="border-primary text-primary hover:bg-primary/5 font-semibold shadow-sm flex items-center gap-2">
              <Plus size={18} strokeWidth={2.5} />
              Agregar Tarea
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="hidden md:table-header-group">
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-16 text-center">ID</th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900">Escenario <span className="text-red-500">*</span></th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900">Resultado <span className="text-red-500">*</span></th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900">Métrica <span className="text-red-500">*</span></th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900">Criterio <span className="text-red-500">*</span></th>
                  <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-14 text-center">X</th>
                </tr>
              </thead>
              <tbody className="block md:table-row-group divide-y divide-slate-100">
                {data.tasks.map((task, index) => {
                  const scId = `task-scenario-${index}`;
                  const rsId = `task-result-${index}`;
                  const mtId = `task-metric-${index}`;
                  const crId = `task-criteria-${index}`;

                  return (
                    <tr key={index} className="block md:table-row hover:bg-slate-50/50 transition-colors p-4 md:p-0 relative">
                      <td className="block md:table-cell px-4 py-2 font-bold text-primary md:bg-primary/5 md:text-center align-middle">
                        <span className="md:hidden text-[10px] font-black text-slate-400 uppercase block mb-1">ID Tarea</span>
                        <div className="inline-block md:block bg-primary/10 md:bg-transparent px-3 py-1 rounded-full md:rounded-none">
                          {task.task_label}
                        </div>
                        <div className="md:hidden absolute top-4 right-4">
                          <Button variant="ghost" size="icon" onClick={() => removeRow(index)} className="text-slate-400 hover:text-red-600 h-8 w-8"><Trash2 size={18} /></Button>
                        </div>
                      </td>
                      
                      <td className="block md:table-cell px-2 py-2 align-middle mt-4 md:mt-0">
                        <label htmlFor={scId} className="md:hidden text-[10px] font-black text-slate-400 uppercase block mb-1 ml-1">Escenario</label>
                        <Input 
                          id={scId}
                          value={task.scenario}
                          onBlur={() => markAsTouched(scId)}
                          className={inputClass(scId, task.scenario)}
                          onChange={(e) => handleTaskChange(index, 'scenario', e.target.value)}
                          placeholder="Ej: Buscar alojamiento..."
                        />
                      </td>
                      
                      <td className="block md:table-cell px-2 py-2 align-middle">
                        <label htmlFor={rsId} className="md:hidden text-[10px] font-black text-slate-400 uppercase block mb-1 ml-1 mt-2">Resultado esperado</label>
                        <Input 
                          id={rsId}
                          value={task.expected_result}
                          onBlur={() => markAsTouched(rsId)}
                          className={inputClass(rsId, task.expected_result)}
                          onChange={(e) => handleTaskChange(index, 'expected_result', e.target.value)}
                          placeholder="Ej: Aplica filtros..."
                        />
                      </td>
                      
                      <td className="block md:table-cell px-2 py-2 align-middle">
                        <label htmlFor={mtId} className="md:hidden text-[10px] font-black text-slate-400 uppercase block mb-1 ml-1 mt-2">Métrica</label>
                        <Input 
                          id={mtId}
                          value={task.main_metric}
                          onBlur={() => markAsTouched(mtId)}
                          className={inputClass(mtId, task.main_metric)}
                          onChange={(e) => handleTaskChange(index, 'main_metric', e.target.value)}
                          placeholder="Ej: Tiempo y clics"
                        />
                      </td>
                      
                      <td className="block md:table-cell px-2 py-2 align-middle">
                        <label htmlFor={crId} className="md:hidden text-[10px] font-black text-slate-400 uppercase block mb-1 ml-1 mt-2">Criterio de éxito</label>
                        <Input 
                          id={crId}
                          value={task.success_criteria}
                          onBlur={() => markAsTouched(crId)}
                          className={inputClass(crId, task.success_criteria)}
                          onChange={(e) => handleTaskChange(index, 'success_criteria', e.target.value)}
                          placeholder="Ej: Sin ayuda"
                        />
                      </td>
                      
                      <td className="hidden md:table-cell px-2 py-2 text-center align-middle">
                        <Button variant="ghost" size="icon" onClick={() => removeRow(index)} className="text-slate-400 hover:text-red-600"><Trash2 size={18} /></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-400 italic mt-2 px-1">Cada tarea agregada debe estar completa con su escenario, resultado esperado, métrica y criterio de éxito.</p>
        </section>

        {/* SECCIÓN 3: Roles y logística */}
        <section aria-labelledby="logistics-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
              <Users size={18} />
            </div>
            <h2 id="logistics-heading" className="text-xl font-bold text-slate-900">3. Roles y logística</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="space-y-2">
              <label htmlFor="moderator_name" className="text-sm font-semibold text-slate-800 block">Moderador <span className="text-red-500">*</span></label>
              <Input 
                id="moderator_name"
                value={data.plan.moderator_name} 
                onChange={(e) => updatePlan('moderator_name', e.target.value)}
                onBlur={() => markAsTouched('moderator_name')}
                className={inputClass('moderator_name', data.plan.moderator_name)}
                placeholder="Nombre del moderador"
              />
              <p className={`text-[10px] font-medium px-1 ${getFieldError('moderator_name', data.plan.moderator_name) ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                {getFieldError('moderator_name', data.plan.moderator_name) ? "Nombre requerido." : "Persona responsable de guiar al participante."}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="observer_name" className="text-sm font-semibold text-slate-800 block">Observador <span className="text-red-500">*</span></label>
              <Input 
                id="observer_name"
                value={data.plan.observer_name} 
                onChange={(e) => updatePlan('observer_name', e.target.value)}
                onBlur={() => markAsTouched('observer_name')}
                className={inputClass('observer_name', data.plan.observer_name)}
                placeholder="Nombre del observador"
              />
              <p className={`text-[10px] font-medium px-1 ${getFieldError('observer_name', data.plan.observer_name) ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                {getFieldError('observer_name', data.plan.observer_name) ? "Nombre requerido." : "Persona responsable de registrar los hallazgos."}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="tool_prototype" className="text-sm font-semibold text-slate-800 block">Herramienta <span className="text-red-500">*</span></label>
              <Input 
                id="tool_prototype"
                value={data.plan.tool_prototype} 
                onChange={(e) => updatePlan('tool_prototype', e.target.value)}
                onBlur={() => markAsTouched('tool_prototype')}
                className={inputClass('tool_prototype', data.plan.tool_prototype)}
                placeholder="Ej. Figma, App Real"
              />
              <p className={`text-[10px] font-medium px-1 ${getFieldError('tool_prototype', data.plan.tool_prototype) ? 'text-red-600 font-bold' : 'text-slate-500'}`}>
                {getFieldError('tool_prototype', data.plan.tool_prototype) ? "Herramienta requerida." : "Software donde se ejecuta el diseño a evaluar."}
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="link_file" className="text-sm font-semibold text-slate-800 block">Enlace / archivo</label>
              <Input 
                id="link_file"
                value={data.plan.link_file} 
                onChange={(e) => updatePlan('link_file', e.target.value)}
                className="bg-white border-slate-300 focus:border-primary focus:ring-primary/20 transition-all duration-200"
                placeholder="URL o ruta (Opcional)"
              />
              <p className="text-[10px] text-slate-500 italic font-medium px-1">Ubicación directa de la pieza a evaluar.</p>
            </div>
          </div>
        </section>

        {/* SECCIÓN 4: Notas */}
        <section className="animate-in fade-in slide-in-from-left-4 duration-500 delay-300 pb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><ClipboardList size={18} /></div>
            <h2 className="text-xl font-bold text-slate-900">4. Notas del moderador (Opcional)</h2>
          </div>
          <textarea 
            value={data.plan.admin_notes} 
            onChange={(e) => updatePlan('admin_notes', e.target.value)}
            className="w-full min-h-[120px] p-4 bg-white border border-slate-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm font-medium text-slate-900"
            placeholder="Anotaciones libres, protocolo de inicio, técnica Think Aloud..."
          />
          <p className="text-[10px] text-slate-400 italic mt-2 px-1">Este campo no es obligatorio, podés usarlo para notas internas o protocolos de conducción.</p>
        </section>

        <NavigationButtons currentStep="plan" />
      </div>
    </div>
  );
}
