import { useEffect, useState } from "react";
import { SupabaseTestPlanRepository } from "../../infrastructure/repositories/SupabaseRepositories";
import type { DashboardMetrics } from "../../domain/entities/types";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, TrendingUp, Clock, AlertOctagon, Users, 
  FileBarChart, Loader2, Info, ArrowUpRight, CheckCircle2,
  ChevronDown, ChevronUp, ClipboardList, Lightbulb, FileText 
} from "lucide-react";

export function ReportsPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [planDetails, setPlanDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setError(null);
        const repo = new SupabaseTestPlanRepository();
        const data = await repo.getAllMetrics();
        setMetrics(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Error al cargar métricas", err);
        setError(err.message || "Error al conectar con la base de datos.");
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const toggleDetails = async (planId: string) => {
    if (expandedPlan === planId) {
      setExpandedPlan(null);
      return;
    }

    if (!planDetails[planId]) {
      setLoadingDetails(planId);
      try {
        const repo = new SupabaseTestPlanRepository();
        const details = await repo.getFullPlan(planId);
        setPlanDetails(prev => ({ ...prev, [planId]: details }));
      } catch (err) {
        console.error("Error al cargar detalles del plan", err);
      } finally {
        setLoadingDetails(null);
      }
    }
    setExpandedPlan(planId);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-10 animate-in fade-in duration-500">
        <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
        <p className="text-surface-600 font-medium">Analizando datos de usabilidad...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 p-10 text-center animate-in fade-in duration-500">
        <div className="h-16 w-16 bg-accent-50 rounded-full flex items-center justify-center text-accent-600 mb-2">
          <AlertOctagon size={32} />
        </div>
        <h2 className="text-xl font-bold text-surface-900">Error de Conexión</h2>
        <p className="text-surface-600 max-w-md">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="mt-4 border-surface-200"
        >
          Reintentar cargar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Section */}
      <header className="px-6 py-8 border-b border-surface-100 bg-brand-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-brand-900 flex items-center gap-2">
              <BarChart3 className="text-brand-600" aria-hidden="true" />
              Dashboard de Resultados
            </h1>
            <p className="mt-1 text-surface-600 max-w-2xl">
              Visualiza los KPIs clave de tus pruebas de usabilidad. Toma decisiones basadas en datos empíricos de rendimiento y satisfacción.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-brand-700 font-medium bg-brand-100/50 px-3 py-1.5 rounded-full border border-brand-200">
            <TrendingUp size={16} />
            HCI Best Practice: Visualiza tendencias, no solo números
          </div>
        </div>
      </header>

      <div className="p-6 space-y-12">
        {metrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center border-2 border-dashed border-surface-200 rounded-2xl bg-surface-50/50 animate-in zoom-in-95 duration-500">
            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-soft mb-4">
              <FileBarChart className="text-surface-300" size={32} />
            </div>
            <h2 className="text-lg font-bold text-surface-900 mb-2">Sin datos disponibles</h2>
            <p className="text-sm text-surface-500 max-w-sm">
              Aún no hay pruebas finalizadas en la base de datos. Completa un flujo de "Plan → Registro → Síntesis" para ver resultados aquí.
            </p>
          </div>
        ) : (
          metrics.map((m, idx) => (
            <section 
              key={idx} 
              aria-labelledby={`report-title-${idx}`}
              className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <div className="flex items-center justify-between border-b border-surface-100 pb-4">
                <h2 id={`report-title-${idx}`} className="text-lg font-bold text-surface-800 flex items-center gap-2">
                  <span className="h-6 w-1 bg-brand-500 rounded-full"></span>
                  Prueba ID: <span className="font-mono text-brand-600 uppercase text-base">{(m.test_plan_id || 'N/A').slice(0, 8)}</span>
                </h2>
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => toggleDetails(m.test_plan_id)}
                    className="text-brand-600 hover:bg-brand-50 font-bold flex items-center gap-2"
                  >
                    {loadingDetails === m.test_plan_id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : expandedPlan === m.test_plan_id ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                    {expandedPlan === m.test_plan_id ? "Ocultar Formulario" : "Ver Formulario Lleno"}
                  </Button>
                  <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-surface-500 bg-surface-100 px-2 py-1 rounded">
                    <ArrowUpRight size={12} />
                    ACTUALIZADO HOY
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Tasa de Éxito */}
                <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-soft hover:shadow-medium transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <CheckCircle2 size={64} />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                      <TrendingUp size={20} />
                    </div>
                    <span className="text-sm font-bold text-surface-500 uppercase tracking-wider">Tasa de Éxito</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-4xl font-black ${m.success_rate >= 70 ? 'text-green-600' : 'text-accent-600'}`}>
                      {m.success_rate}%
                    </span>
                    <div className="mt-4 w-full bg-surface-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 ${m.success_rate >= 70 ? 'bg-green-500' : 'bg-accent-500'}`} 
                        style={{ width: `${m.success_rate}%` }}
                      ></div>
                    </div>
                    <p className="mt-3 text-[10px] text-surface-400 font-medium flex items-center gap-1">
                      <Info size={10} />
                      Porcentaje de tareas completadas sin ayuda
                    </p>
                  </div>
                </div>

                {/* Tiempo Promedio */}
                <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-soft hover:shadow-medium transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Clock size={64} />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                      <Clock size={20} />
                    </div>
                    <span className="text-sm font-bold text-surface-500 uppercase tracking-wider">Eficiencia</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-blue-600">{m.avg_time_seconds}</span>
                      <span className="text-lg font-bold text-blue-400 italic">seg</span>
                    </div>
                    <p className="mt-4 text-[10px] text-surface-400 font-medium">Tiempo promedio invertido por tarea</p>
                    <div className="mt-4 flex gap-1">
                       {[1,2,3,4,5,6].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= 4 ? 'bg-blue-400' : 'bg-surface-100'}`}></div>)}
                    </div>
                  </div>
                </div>

                {/* Total Errores */}
                <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-soft hover:shadow-medium transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <AlertOctagon size={64} />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-accent-50 flex items-center justify-center text-accent-600">
                      <AlertOctagon size={20} />
                    </div>
                    <span className="text-sm font-bold text-surface-500 uppercase tracking-wider">Fricción</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-accent-600">{m.total_errors}</span>
                    <p className="mt-1 text-sm font-bold text-accent-900/40 uppercase">Errores Totales</p>
                    <p className="mt-4 text-[10px] text-surface-400 font-medium leading-tight">
                      Número total de errores cometidos por los participantes
                    </p>
                  </div>
                </div>

                {/* Muestra (Total Observaciones) */}
                <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-soft hover:shadow-medium transition-all group overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Users size={64} />
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-surface-100 flex items-center justify-center text-surface-600">
                      <Users size={20} />
                    </div>
                    <span className="text-sm font-bold text-surface-500 uppercase tracking-wider">Muestra</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-4xl font-black text-surface-800">{m.total_observations}</span>
                    <p className="mt-1 text-sm font-bold text-surface-900/40 uppercase">Tareas Evaluadas</p>
                    <p className="mt-4 text-[10px] text-surface-400 font-medium">Volumen de datos procesados</p>
                    <div className="mt-4 flex -space-x-2">
                      {[1,2,3].map(i => <div key={i} className="h-6 w-6 rounded-full border-2 border-white bg-surface-200"></div>)}
                      <div className="h-6 w-6 rounded-full border-2 border-white bg-brand-100 flex items-center justify-center text-[8px] font-bold text-brand-600">+{m.total_observations}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalle del Formulario (Expandible) */}
              {expandedPlan === m.test_plan_id && planDetails[m.test_plan_id] && (
                <div className="mt-6 border-t border-surface-100 pt-8 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    {/* Columna 1: Contexto */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-2 font-bold text-surface-900 border-b border-surface-100 pb-2">
                        <FileText className="text-brand-500" size={18} />
                        <h3>Contexto General</h3>
                      </div>
                      <dl className="grid grid-cols-1 gap-4 text-sm">
                        {[
                          { label: "Producto", value: planDetails[m.test_plan_id].product_name },
                          { label: "Módulo", value: planDetails[m.test_plan_id].module_name },
                          { label: "Objetivo", value: planDetails[m.test_plan_id].objective },
                          { label: "Perfil", value: planDetails[m.test_plan_id].user_profile },
                          { label: "Moderador", value: planDetails[m.test_plan_id].moderator_name },
                          { label: "Observador", value: planDetails[m.test_plan_id].observer_name }
                        ].map((item, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            <dt className="text-xs font-bold text-surface-400 uppercase tracking-wider">{item.label}</dt>
                            <dd className="text-surface-700 font-medium">{item.value || "No especificado"}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    {/* Columna 2: Tareas */}
                    <div className="lg:col-span-2 space-y-6">
                      <div className="flex items-center gap-2 font-bold text-surface-900 border-b border-surface-100 pb-2">
                        <ClipboardList className="text-brand-500" size={18} />
                        <h3>Tareas Definidas</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {planDetails[m.test_plan_id].tasks.map((task: any, i: number) => (
                          <div key={i} className="p-4 rounded-xl border border-surface-100 bg-surface-50/50">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="h-6 w-6 rounded bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center">
                                {task.task_label}
                              </span>
                              <h4 className="text-xs font-bold text-surface-900 uppercase">Escenario</h4>
                            </div>
                            <p className="text-sm text-surface-600 italic mb-3">"{task.scenario}"</p>
                            <div className="grid grid-cols-2 gap-4 text-[10px]">
                              <div>
                                <span className="block font-bold text-surface-400 uppercase mb-1">Métrica</span>
                                <span className="text-surface-700">{task.main_metric || "-"}</span>
                              </div>
                              <div>
                                <span className="block font-bold text-surface-400 uppercase mb-1">Éxito</span>
                                <span className="text-surface-700">{task.success_criteria || "-"}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Hallazgos */}
                      <div className="mt-8 space-y-6">
                        <div className="flex items-center gap-2 font-bold text-surface-900 border-b border-surface-100 pb-2">
                          <Lightbulb className="text-brand-500" size={18} />
                          <h3>Hallazgos y Recomendaciones</h3>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-surface-200">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-surface-50 border-b border-surface-200">
                              <tr>
                                <th className="px-4 py-2 font-bold text-surface-700">Problema</th>
                                <th className="px-4 py-2 font-bold text-surface-700 text-center">Prioridad</th>
                                <th className="px-4 py-2 font-bold text-surface-700">Recomendación</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100 bg-white">
                              {planDetails[m.test_plan_id].findings.map((f: any, i: number) => (
                                <tr key={i}>
                                  <td className="px-4 py-3 text-surface-800 font-medium">{f.problem}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      f.priority === 'Alta' ? 'bg-accent-100 text-accent-700' : 
                                      f.priority === 'Media' ? 'bg-brand-100 text-brand-700' : 
                                      'bg-surface-100 text-surface-600'
                                    }`}>
                                      {f.priority}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-surface-600">{f.recommendation}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          ))
        )}
      </div>
      
      <footer className="mt-auto px-6 py-10 bg-surface-50 border-t border-surface-200 text-center">
        <p className="text-xs text-surface-400 font-medium max-w-md mx-auto leading-relaxed">
          Este reporte se genera automáticamente a partir de las observaciones registradas. Los KPIs de usabilidad siguen el estándar ISO 9241-11 para medir Efectividad y Eficiencia.
        </p>
      </footer>
    </div>
  );
}
