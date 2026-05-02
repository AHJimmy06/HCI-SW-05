import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SupabaseTestPlanRepository } from "../../infrastructure/repositories/SupabaseRepositories";
import type { FullTestPlan, Finding, Observation, Task, Participant } from "../../domain/entities/types";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Target, Zap, Shield, BarChart3,
  TrendingUp, Clock, AlertOctagon, Users, FileText,
  ClipboardList, CheckCircle2, XCircle, Loader2,
  User
} from "lucide-react";

export function TestPlanDetailPage() {
  const { testPlanId } = useParams<{ testPlanId: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<FullTestPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!testPlanId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const repo = new SupabaseTestPlanRepository();
        const data = await repo.getFullPlan(testPlanId);
        setPlan(data);
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar el plan de prueba.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [testPlanId]);

  // Calculate metrics from observations
  const observations = plan?.observations || [];
  const totalObs = observations.length;
  const successfulTasks = observations.filter((o: Observation) => o.success).length;
  const successRate = totalObs > 0 ? Math.round((successfulTasks / totalObs) * 100) : 0;
  const avgTime = totalObs > 0
    ? Math.round(observations.reduce((sum: number, o: Observation) => sum + (o.time_seconds || 0), 0) / totalObs)
    : 0;
  const totalErrors = observations.reduce((sum: number, o: Observation) => sum + (o.errors_count || 0), 0);

  // Group observations by task for task-level analysis
  const observationsByTask = observations.reduce((acc: Record<string, Observation[]>, o: Observation) => {
    const tid = o.task_id;
    if (!acc[tid]) acc[tid] = [];
    acc[tid].push(o);
    return acc;
  }, {});

  const tasks: Task[] = plan?.tasks || [];
  const participants: Participant[] = plan?.participants || [];
  const findings: Finding[] = plan?.findings || [];

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error al cargar</h2>
          <p className="text-slate-700 mb-4">{error || "Plan no encontrado."}</p>
          <Button onClick={() => navigate(-1)} className="bg-primary hover:bg-primary/90">
            <ArrowLeft size={14} className="mr-2" /> Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="mt-1 text-slate-500 hover:text-slate-900"
              >
                <ArrowLeft size={16} />
              </Button>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    {plan.module_name || "Módulo no especificado"}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900">{plan.product_name}</h1>
                <p className="text-sm text-slate-600 mt-1">
                  Plan de prueba de usabilidad —{" "}
                  {plan.test_date
                    ? new Date(plan.test_date).toLocaleDateString("es-EC", {
                        year: "numeric", month: "long", day: "numeric"
                      })
                    : "Fecha no definida"}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full border border-primary/20">
              Ejecutado
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* ISO 9241-11 Dimension Headers */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <Target size={12} className="text-primary" aria-hidden="true" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Efectividad</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-amber-600" aria-hidden="true" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Eficiencia</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={12} className="text-red-600" aria-hidden="true" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Conformidad</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 size={12} className="text-slate-600" aria-hidden="true" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Muestra</span>
            </div>
          </div>
        </section>

        {/* Metric Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              label: "Tasa de Éxito",
              val: `${successRate}%`,
              icon: TrendingUp,
              color: "text-green-700",
              bgColor: "bg-green-50 border-green-200",
              isoRef: "ISO 9241-11: Efectividad",
              helpText: `${successfulTasks} de ${totalObs} tareas completadas correctamente`
            },
            {
              label: "Tiempo Prom.",
              val: `${avgTime}s`,
              icon: Clock,
              color: "text-amber-700",
              bgColor: "bg-amber-50 border-amber-200",
              isoRef: "ISO 9241-11: Eficiencia",
              helpText: "Tiempo promedio por tarea observada"
            },
            {
              label: "Errores",
              val: `${totalErrors}`,
              icon: AlertOctagon,
              color: "text-red-700",
              bgColor: "bg-red-50 border-red-200",
              isoRef: "ISO 9241-11: Conformidad",
              helpText: `Total de errores críticos en ${totalObs} observaciones`
            },
            {
              label: "Observaciones",
              val: `${totalObs}`,
              icon: Users,
              color: "text-slate-800",
              bgColor: "bg-slate-100 border-slate-300",
              isoRef: "Validez estadística",
              helpText: `Registros de ${participants.length} participantes y ${tasks.length} tareas`
            }
          ].map((stat, si) => (
            <div
              key={si}
              className={`p-4 rounded-xl border flex flex-col ${stat.bgColor} hover:shadow-md transition-shadow`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{stat.label}</span>
                <stat.icon size={14} className={stat.color} aria-hidden="true" />
              </div>
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.val}</span>
              <p className="mt-1 text-[10px] text-slate-500 leading-snug">{stat.helpText}</p>
              <p className="mt-auto pt-1 text-[8px] text-slate-300 font-medium truncate" aria-hidden="true">
                {stat.isoRef}
              </p>
            </div>
          ))}
        </section>

        {/* Task-level breakdown */}
        {tasks.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <ClipboardList size={16} /> Desglose por Tarea
            </h2>
            <div className="space-y-4">
              {tasks.map((task: Task) => {
                const taskObs = observationsByTask[task.id] || [];
                const taskSuccessRate = taskObs.length > 0
                  ? Math.round((taskObs.filter((o: Observation) => o.success).length / taskObs.length) * 100)
                  : 0;
                const taskAvgTime = taskObs.length > 0
                  ? Math.round(taskObs.reduce((sum: number, o: Observation) => sum + (o.time_seconds || 0), 0) / taskObs.length)
                  : 0;
                return (
                  <div key={task.id} className="border border-slate-100 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{task.task_label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{task.scenario}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        taskSuccessRate >= 80 ? "bg-green-100 text-green-700" :
                        taskSuccessRate >= 50 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {taskSuccessRate}%
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-green-600" />
                        {taskObs.filter((o: Observation) => o.success).length} exitosas
                      </span>
                      <span className="flex items-center gap-1">
                        <XCircle size={12} className="text-red-600" />
                        {taskObs.filter((o: Observation) => !o.success).length} fallidas
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} className="text-amber-600" />
                        {taskAvgTime}s promedio
                      </span>
                      <span className="flex items-center gap-1">
                        <AlertOctagon size={12} className="text-red-500" />
                        {taskObs.reduce((sum: number, o: Observation) => sum + (o.errors_count || 0), 0)} errores
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Two-column layout: Context + Findings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Context */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <FileText size={16} /> Contexto
            </h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs font-bold text-slate-600 uppercase tracking-wider">Objetivo</dt>
                <dd className="text-slate-800 font-medium">{plan.objective || "No definido"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-600 uppercase tracking-wider">Perfil de usuario</dt>
                <dd className="text-slate-800 font-medium">{plan.user_profile || "No definido"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-600 uppercase tracking-wider">Método</dt>
                <dd className="text-slate-800 font-medium">{plan.method || "No definido"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-600 uppercase tracking-wider">Moderador</dt>
                <dd className="text-slate-800 font-medium">{plan.moderator_name || "No definido"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-600 uppercase tracking-wider">Lugar/Canal</dt>
                <dd className="text-slate-800 font-medium">{plan.place_channel || "No definido"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-600 uppercase tracking-wider">Herramienta/Prototipo</dt>
                <dd className="text-slate-800 font-medium">{plan.tool_prototype || "No definido"}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold text-slate-600 uppercase tracking-wider">Duración</dt>
                <dd className="text-slate-800 font-medium">{plan.duration || "No definida"}</dd>
              </div>
            </dl>
          </div>

          {/* Findings */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <ClipboardList size={16} /> Hallazgos ({findings.length})
            </h3>
            {findings.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Sin hallazgos registrados.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {findings.map((f: Finding, fi: number) => (
                  <div key={fi} className="p-4 bg-slate-50 rounded-xl text-sm border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900">{f.problem}</span>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        f.priority === 'Alta' ? 'bg-red-600 text-white' :
                        f.priority === 'Media' ? 'bg-amber-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>{f.priority}</span>
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed mb-2">{f.recommendation}</p>
                    <div className="flex gap-3 text-xs text-slate-500">
                      <span>Frecuencia: {f.frequency}</span>
                      <span>Severidad: {f.severity}</span>
                      <span className={`ml-auto ${
                        f.status === 'Resuelto' ? 'text-green-600' :
                        f.status === 'En Progreso' ? 'text-amber-600' :
                        'text-slate-400'
                      }`}>{f.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Participants */}
        {participants.length > 0 && (
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
              <Users size={16} /> Participantes ({participants.length})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {participants.map((p: Participant) => (
                <div key={p.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User size={14} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-xs text-slate-500 truncate">{p.profile}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-auto px-6 py-8 bg-slate-100 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-700 font-semibold max-w-md mx-auto leading-relaxed uppercase tracking-wider">
          KPIs de usabilidad estándar ISO 9241-11
        </p>
      </footer>
    </div>
  );
}
