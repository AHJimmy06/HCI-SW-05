import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTestPlan } from "../context/TestPlanContext";
import { Plus, Trash2, Info, LayoutDashboard, ClipboardList, Users, Settings } from "lucide-react";

export function TestPlanFormPage() {
  const { data, updatePlan, updateTasks, addTask } = useTestPlan();

  const handleTaskChange = (index: number, field: string, value: string) => {
    const newTasks = [...data.tasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    updateTasks(newTasks);
  };

  const removeRow = (index: number) => {
    if (data.tasks.length > 1) {
      const newTasks = data.tasks.filter((_, i) => i !== index);
      updateTasks(newTasks);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <header className="px-6 py-8 border-b border-surface-100 bg-brand-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-900 flex items-center gap-2">
              <LayoutDashboard className="text-brand-600" aria-hidden="true" />
              Plan de Prueba de Usabilidad
            </h1>
            <p className="mt-1 text-surface-600 max-w-2xl">
              Define el contexto, los objetivos y las tareas para tu sesión de evaluación. Un buen plan garantiza resultados accionables.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-brand-700 font-medium bg-brand-100/50 px-3 py-1.5 rounded-full border border-brand-200">
            <Info size={16} />
            HCI Best Practice: Define objetivos SMART
          </div>
        </div>
      </header>

      <div className="p-6 space-y-10">
        {/* Sección 1: Contexto General */}
        <section aria-labelledby="context-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-75">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
              <Settings size={18} />
            </div>
            <h2 id="context-heading" className="text-xl font-bold text-surface-900">
              1. Contexto General
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-50/50 p-6 rounded-xl border border-surface-200">
            <div className="space-y-2">
              <label htmlFor="product_name" className="text-sm font-semibold text-surface-700">Producto / Servicio</label>
              <Input 
                id="product_name"
                value={data.plan.product_name}
                onChange={(e) => updatePlan('product_name', e.target.value)}
                className="bg-white border-surface-300 focus:ring-brand-500" 
                placeholder="Ej. Aplicación de Banca Móvil" 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="module_name" className="text-sm font-semibold text-surface-700">Pantalla / Módulo</label>
              <Input 
                id="module_name"
                value={data.plan.module_name}
                onChange={(e) => updatePlan('module_name', e.target.value)}
                className="bg-white border-surface-300 focus:ring-brand-500" 
                placeholder="Ej. Módulo de transferencias" 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="objective" className="text-sm font-semibold text-surface-700">Objetivo del test</label>
              <Input 
                id="objective"
                value={data.plan.objective}
                onChange={(e) => updatePlan('objective', e.target.value)}
                className="bg-white border-surface-300 focus:ring-brand-500" 
                placeholder="Ej. Evaluar la facilidad para agregar un nuevo beneficiario" 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="user_profile" className="text-sm font-semibold text-surface-700">Perfil de Usuarios</label>
              <Input 
                id="user_profile"
                value={data.plan.user_profile}
                onChange={(e) => updatePlan('user_profile', e.target.value)}
                className="bg-white border-surface-300 focus:ring-brand-500" 
                placeholder="Ej. Usuarios de 18-35 años, con experiencia básica en apps" 
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="method" className="text-sm font-semibold text-surface-700">Método</label>
              <Input 
                id="method"
                value={data.plan.method}
                onChange={(e) => updatePlan('method', e.target.value)}
                className="bg-white border-surface-300 focus:ring-brand-500" 
                placeholder="Presencial / Remoto" 
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="test_date" className="text-sm font-semibold text-surface-700">Fecha</label>
              <Input 
                id="test_date"
                type="date" 
                min={new Date().toISOString().split('T')[0]}
                value={data.plan.test_date}
                onChange={(e) => updatePlan('test_date', e.target.value)}
                className="bg-white border-surface-300 focus:ring-brand-500" 
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label htmlFor="place_channel" className="text-sm font-semibold text-surface-700">Lugar / Canal</label>
              <Input 
                id="place_channel"
                value={data.plan.place_channel}
                onChange={(e) => updatePlan('place_channel', e.target.value)}
                className="bg-white border-surface-300 focus:ring-brand-500" 
                placeholder="Ej. Zoom, Teams, Laboratorio" 
              />
            </div>
          </div>
        </section>

        {/* Sección 2: Tareas del test */}
        <section aria-labelledby="tasks-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-150">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
                <ClipboardList size={18} />
              </div>
              <h2 id="tasks-heading" className="text-xl font-bold text-surface-900">
                2. Tareas del test
              </h2>
            </div>
            <Button 
              onClick={addTask} 
              variant="outline"
              className="border-brand-200 text-brand-700 hover:bg-brand-50 shadow-soft flex items-center gap-2"
              aria-label="Agregar una nueva tarea al test"
            >
              <Plus size={18} />
              Agregar Tarea
            </Button>
          </div>

          <div className="rounded-xl border border-surface-200 overflow-hidden shadow-soft bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-200">
                    <th className="px-4 py-3 font-semibold text-surface-700 w-16">ID</th>
                    <th className="px-4 py-3 font-semibold text-surface-700">Escenario / Tarea</th>
                    <th className="px-4 py-3 font-semibold text-surface-700">Resultado esperado</th>
                    <th className="px-4 py-3 font-semibold text-surface-700">Métrica Principal</th>
                    <th className="px-4 py-3 font-semibold text-surface-700">Criterio de Éxito</th>
                    <th className="px-4 py-3 font-semibold text-surface-700 w-14 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {data.tasks.map((task, index) => (
                    <tr key={index} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-4 py-2 font-bold text-brand-700 bg-brand-50/30 text-center">{task.task_label}</td>
                      <td className="px-2 py-2">
                        <Input 
                          value={task.scenario}
                          aria-label={`Escenario para tarea ${task.task_label}`}
                          onChange={(e) => handleTaskChange(index, 'scenario', e.target.value)}
                          className="border-transparent hover:border-surface-300 focus:border-brand-500 focus:bg-white bg-transparent transition-all" 
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input 
                          value={task.expected_result}
                          aria-label={`Resultado esperado para tarea ${task.task_label}`}
                          onChange={(e) => handleTaskChange(index, 'expected_result', e.target.value)}
                          className="border-transparent hover:border-surface-300 focus:border-brand-500 focus:bg-white bg-transparent transition-all" 
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input 
                          value={task.main_metric}
                          aria-label={`Métrica para tarea ${task.task_label}`}
                          onChange={(e) => handleTaskChange(index, 'main_metric', e.target.value)}
                          className="border-transparent hover:border-surface-300 focus:border-brand-500 focus:bg-white bg-transparent transition-all" 
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input 
                          value={task.success_criteria}
                          aria-label={`Criterio de éxito para tarea ${task.task_label}`}
                          onChange={(e) => handleTaskChange(index, 'success_criteria', e.target.value)}
                          className="border-transparent hover:border-surface-300 focus:border-brand-500 focus:bg-white bg-transparent transition-all" 
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => removeRow(index)} 
                          className="text-surface-400 hover:text-accent-600 hover:bg-accent-50 transition-colors"
                          aria-label={`Eliminar tarea ${task.task_label}`}
                        >
                          <Trash2 size={18} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Sección 3: Roles y Logística */}
        <section aria-labelledby="logistics-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
              <Users size={18} />
            </div>
            <h2 id="logistics-heading" className="text-xl font-bold text-surface-900">
              3. Roles y Logística
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label htmlFor="moderator_name" className="text-sm font-semibold text-surface-700">Moderador</label>
              <Input 
                id="moderator_name"
                value={data.plan.moderator_name}
                onChange={(e) => updatePlan('moderator_name', e.target.value)}
                className="bg-white border-surface-300 focus:ring-brand-500 shadow-soft" 
                placeholder="Nombre del moderador"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="observer_name" className="text-sm font-semibold text-surface-700">Observador</label>
              <Input 
                id="observer_name"
                value={data.plan.observer_name}
                onChange={(e) => updatePlan('observer_name', e.target.value)}
                className="bg-white border-surface-300 focus:ring-brand-500 shadow-soft" 
                placeholder="Nombre del observador"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="tool_prototype" className="text-sm font-semibold text-surface-700">Herramienta / Prototipo</label>
              <Input 
                id="tool_prototype"
                value={data.plan.tool_prototype}
                onChange={(e) => updatePlan('tool_prototype', e.target.value)}
                className="bg-white border-surface-300 focus:ring-brand-500 shadow-soft" 
                placeholder="Figma, Adobe XD, URL..."
              />
            </div>
          </div>
        </section>

        {/* Sección 4: Notas */}
        <section aria-labelledby="notes-heading" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-300 pb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-8 w-8 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600">
              <ClipboardList size={18} />
            </div>
            <h2 id="notes-heading" className="text-xl font-bold text-surface-900">
              4. Notas Adicionales
            </h2>
          </div>
          <div className="relative group">
            <textarea 
              id="admin_notes"
              value={data.plan.admin_notes}
              onChange={(e) => updatePlan('admin_notes', e.target.value)}
              className="w-full min-h-[160px] p-4 bg-white border border-surface-200 rounded-xl shadow-soft focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all text-surface-800"
              placeholder="Escribe aquí consideraciones logísticas, incentivos o notas de seguimiento..."
              aria-label="Notas adicionales del administrador"
            />
            <div className="absolute bottom-3 right-3 text-surface-400 opacity-0 group-focus-within:opacity-100 transition-opacity">
              <Info size={16} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
