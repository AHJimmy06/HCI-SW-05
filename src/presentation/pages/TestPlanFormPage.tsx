import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTestPlan } from "../context/useTestPlan";
import { Plus, Trash2, Info, ClipboardList, Users, Settings } from "lucide-react";
import { NavigationButtons } from "../components/layout/NavigationButtons";

export function TestPlanFormPage() {
  const { data, updatePlan, updateTasks, addTask, deleteTask } = useTestPlan();

  const handleTaskChange = (index: number, field: string, value: string) => {
    const newTasks = [...data.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    updateTasks(newTasks);
  };

  const removeRow = (index: number) => {
    deleteTask(index);
  };

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-8 border-b border-slate-200 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="text-primary" aria-hidden="true" size={28} />
              Plan de Vuelo
            </h1>
            <p className="mt-1 text-slate-700 max-w-2xl text-sm font-medium">
              Preparación detallada de la ruta, objetivos y logística previa al despegue de la misión.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary font-semibold bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Info size={18} aria-hidden="true" />
            Checklist de Pre-vuelo
          </div>
        </div>
      </header>

      <div className="p-6 space-y-10">
        <section aria-labelledby="context-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-75">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
              <Settings size={18} />
            </div>
            <h2 id="context-heading" className="text-xl font-bold text-slate-900">
              1. Coordenadas de Misión
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="space-y-2">
              <label htmlFor="product_name" className="text-sm font-semibold text-slate-800 block">Producto / Nave</label>
              <Input 
                id="product_name"
                value={data.plan.product_name}
                onChange={(e) => updatePlan('product_name', e.target.value)}
                className="bg-white border-slate-300 focus:border-primary focus:ring-primary/20" 
                placeholder="Ej. Aplicación de Banca Móvil" 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="module_name" className="text-sm font-semibold text-slate-800 block">Módulo / Compartimento</label>
              <Input 
                id="module_name"
                value={data.plan.module_name}
                onChange={(e) => updatePlan('module_name', e.target.value)}
                className="bg-white border-slate-300 focus:border-primary focus:ring-primary/20" 
                placeholder="Ej. Módulo de transferencias" 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="objective" className="text-sm font-semibold text-slate-800 block">Objetivo de la Misión</label>
              <Input 
                id="objective"
                value={data.plan.objective}
                onChange={(e) => updatePlan('objective', e.target.value)}
                className="bg-white border-slate-300 focus:border-primary focus:ring-primary/20" 
                placeholder="Ej. Evaluar la facilidad para agregar un nuevo beneficiario" 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="user_profile" className="text-sm font-semibold text-slate-800 block">Perfil de la Tripulación (Usuario)</label>
              <Input 
                id="user_profile"
                value={data.plan.user_profile}
                onChange={(e) => updatePlan('user_profile', e.target.value)}
                className="bg-white border-slate-300 focus:border-primary focus:ring-primary/20" 
                placeholder="Ej. Usuarios de 18-35 años" 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="method" className="text-sm font-semibold text-slate-800 block">Método de Navegación</label>
              <Input 
                id="method"
                value={data.plan.method}
                onChange={(e) => updatePlan('method', e.target.value)}
                className="bg-white border-slate-300 focus:border-primary focus:ring-primary/20" 
                placeholder="Presencial / Remoto" 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="test_date" className="text-sm font-semibold text-slate-800 block">Fecha de Lanzamiento</label>
              <Input 
                id="test_date"
                type="date" 
                value={data.plan.test_date}
                onChange={(e) => updatePlan('test_date', e.target.value)}
                className="bg-white border-slate-300 focus:border-primary focus:ring-primary/20" 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="place_channel" className="text-sm font-semibold text-slate-800 block">Canal de Comunicación</label>
              <Input 
                id="place_channel"
                value={data.plan.place_channel}
                onChange={(e) => updatePlan('place_channel', e.target.value)}
                className="bg-white border-slate-300 focus:border-primary focus:ring-primary/20" 
                placeholder="Ej. Zoom, Teams, Laboratorio" 
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="tasks-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
                <ClipboardList size={18} />
              </div>
              <h2 id="tasks-heading" className="text-xl font-bold text-slate-900">
                2. Hoja de Ruta (Tareas)
              </h2>
            </div>
            <Button 
              onClick={addTask} 
              variant="outline"
              className="border-primary text-primary hover:bg-primary/5 font-semibold shadow-sm flex items-center gap-2"
            >
              <Plus size={18} aria-hidden="true" strokeWidth={2.5} />
              Agregar Maniobra
            </Button>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-white">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-16">ID</th>
                    <th scope="col" className="px-4 py-4 font-bold text-slate-900">Escenario de Misión</th>
                    <th scope="col" className="px-4 py-4 font-bold text-slate-900">Objetivo Esperado</th>
                    <th scope="col" className="px-4 py-4 font-bold text-slate-900 w-14 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.tasks.map((task, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-2 font-bold text-primary bg-primary/5 text-center">{task.task_label}</td>
                      <td className="px-2 py-2">
                        <Input 
                          id={`task-scenario-${index}`}
                          value={task.scenario}
                          aria-label={`Escenario para tarea ${task.task_label}`}
                          onChange={(e) => handleTaskChange(index, 'scenario', e.target.value)}
                          className="border-slate-200 focus:border-primary focus:bg-white bg-slate-50 h-9 text-xs font-medium text-slate-900" 
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input 
                          id={`task-result-${index}`}
                          value={task.expected_result}
                          aria-label={`Resultado esperado para tarea ${task.task_label}`}
                          onChange={(e) => handleTaskChange(index, 'expected_result', e.target.value)}
                          className="border-slate-200 focus:border-primary focus:bg-white bg-slate-50 h-9 text-xs font-medium text-slate-900" 
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeRow(index)} 
                          className="text-slate-400 hover:text-red-600 h-8 w-8 transition-colors"
                          aria-label={`Eliminar tarea ${task.task_label}`}
                        >
                          <Trash2 size={18} aria-hidden="true" />
                        </Button>
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
                    <Button variant="ghost" size="sm" onClick={() => removeRow(index)} className="text-red-600 font-semibold h-8 px-2 hover:bg-red-50 transition-colors">
                      <Trash2 size={16} className="mr-1" aria-hidden="true" />
                      Eliminar
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor={`mobile-scenario-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-wider">Escenario de Misión</label>
                      <Input id={`mobile-scenario-${index}`} value={task.scenario} onChange={(e) => handleTaskChange(index, 'scenario', e.target.value)} className="h-11 text-sm border-slate-300 font-medium text-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor={`mobile-result-${index}`} className="text-xs font-bold text-slate-700 uppercase tracking-wider">Objetivo Esperado</label>
                      <Input id={`mobile-result-${index}`} value={task.expected_result} onChange={(e) => handleTaskChange(index, 'expected_result', e.target.value)} className="h-11 text-sm border-slate-300 font-medium text-slate-900" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="logistics-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
              <Users size={18} />
            </div>
            <h2 id="logistics-heading" className="text-xl font-bold text-slate-900">
              3. Tripulación y Equipamiento
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="space-y-2">
              <label htmlFor="moderator_name" className="text-sm font-semibold text-slate-800 block">Capitán (Moderador)</label>
              <Input 
                id="moderator_name"
                value={data.plan.moderator_name}
                onChange={(e) => updatePlan('moderator_name', e.target.value)}
                className="bg-white border-slate-300 focus:border-primary font-medium text-slate-900" 
                placeholder="Nombre del capitán"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="observer_name" className="text-sm font-semibold text-slate-800 block">Navegante (Observador)</label>
              <Input 
                id="observer_name"
                value={data.plan.observer_name}
                onChange={(e) => updatePlan('observer_name', e.target.value)}
                className="bg-white border-slate-300 focus:border-primary font-medium text-slate-900" 
                placeholder="Nombre del navegante"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tool_prototype" className="text-sm font-semibold text-slate-800 block">Equipo / Prototipo</label>
              <Input 
                id="tool_prototype"
                value={data.plan.tool_prototype}
                onChange={(e) => updatePlan('tool_prototype', e.target.value)}
                className="bg-white border-slate-300 focus:border-primary font-medium text-slate-900" 
                placeholder="URL del prototipo"
              />
            </div>
          </div>
        </section>

        <section aria-labelledby="notes-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-300 pb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary" aria-hidden="true">
              <ClipboardList size={18} />
            </div>
            <h2 id="notes-heading" className="text-xl font-bold text-slate-900">
              4. Observaciones de Base
            </h2>
          </div>
          <div className="space-y-2">
            <label htmlFor="admin_notes" className="text-sm font-semibold text-slate-800 block">Notas del administrador</label>
            <textarea 
              id="admin_notes"
              value={data.plan.admin_notes}
              onChange={(e) => updatePlan('admin_notes', e.target.value)}
              className="w-full min-h-[160px] p-4 bg-white border border-slate-300 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all text-slate-900 font-medium"
              placeholder="Escribe aquí consideraciones logísticas..."
            />
          </div>
        </section>

        <NavigationButtons currentStep="plan" />
      </div>
    </div>
  );
}
