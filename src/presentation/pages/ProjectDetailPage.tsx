import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../infrastructure/config/supabase";
import { SupabaseTestPlanRepository } from "../../infrastructure/repositories/SupabaseRepositories";
import type { Project } from "../../domain/entities/collaboration";
import type { DashboardMetrics } from "../../domain/entities/types";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Plus,
  Loader2,
  ArrowLeft,
  TrendingUp,
  Clock,
  AlertOctagon,
  Users,
  Edit,
  Eye
} from "lucide-react";

export function ProjectDetailPage() {
  const { orgId, projectId } = useParams<{ orgId: string; projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"executed" | "planned">("executed");

  const fetchData = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const planRepo = new SupabaseTestPlanRepository();

      const { data: projData } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (!projData) {
        navigate(`/organizations/${orgId}`);
        return;
      }
      setProject(projData);

      const allMetrics = await planRepo.getAllMetrics();
      const filtered = allMetrics.filter(m => m.test_plan_id && (m as any).project_id === projectId);
      setMetrics(filtered);
    } catch (err) {
      console.error("Error fetching project data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleEdit = async (planId: string) => {
    sessionStorage.setItem('active_project_id', projectId || '');
    const planRepo = new SupabaseTestPlanRepository();
    const details = await planRepo.getFullPlan(planId);
    // Load into context and navigate
    const { useTestPlan } = await import("../context/useTestPlan");
    const { loadFullPlan } = useTestPlan();
    loadFullPlan({
      test_plan_id: planId,
      plan: {
        project_id: projectId,
        product_name: details.product_name || '',
        module_name: details.module_name || '',
        objective: details.objective || '',
        user_profile: details.user_profile || '',
        method: details.method || '',
        test_date: details.test_date || '',
        duration: details.duration || '',
        place_channel: details.place_channel || '',
        link_file: details.link_file || '',
        moderator_name: details.moderator_name || '',
        observer_name: details.observer_name || '',
        tool_prototype: details.tool_prototype || '',
        admin_notes: details.admin_notes || '',
        closing_easy: details.closing_easy || '',
        closing_confusing: details.closing_confusing || '',
        closing_change: details.closing_change || '',
      },
      tasks: details.tasks?.map(t => ({
        task_label: t.task_label || '',
        scenario: t.scenario || '',
        expected_result: t.expected_result || '',
        main_metric: t.main_metric || '',
        success_criteria: t.success_criteria || '',
        follow_up_question: t.follow_up_question || ''
      })) || [],
      observations: [],
      findings: []
    });
    navigate("/dashboard/plan");
  };

  const handleNewPlan = () => {
    sessionStorage.setItem('active_project_id', projectId || '');
    navigate(`/dashboard/plan?project=${projectId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="flex flex-col min-h-full">
      <header className="px-6 py-8 border-b border-surface-100 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <button
              onClick={() => navigate(`/organizations/${orgId}`)}
              className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors mb-2 font-medium"
            >
              <ArrowLeft size={18} /> Volver a la organización
            </button>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FolderKanban className="text-primary" size={28} />
              {project.name}
            </h1>
            <p className="mt-1 text-slate-700 font-medium">
              Proyecto · Creado el {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          <Button
            onClick={handleNewPlan}
            className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-6 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center gap-3"
          >
            <Plus size={20} strokeWidth={2.5} />
            <span className="tracking-wide">NUEVO TEST</span>
          </Button>
        </div>
      </header>

      <div className="p-6 space-y-8">
        {metrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white">
            <FolderKanban className="text-slate-400 mb-4" size={48} />
            <h2 className="text-lg font-semibold text-slate-900">No hay tests en este proyecto</h2>
            <p className="text-slate-700 font-medium mt-2">Creá tu primer test de usabilidad para este proyecto.</p>
            <Button onClick={handleNewPlan} variant="outline" className="mt-4 border-slate-300 font-semibold">
              <Plus size={18} /> Crear test
            </Button>
          </div>
        ) : (
          <>
            <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
              <button
                onClick={() => setActiveTab("executed")}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "executed" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                <TrendingUp size={16} />
                Ejecutados
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === "executed" ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}>
                  {metrics.filter(m => m.total_observations > 0).length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab("planned")}
                className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "planned" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`
              }>
                <Clock size={16} />
                Planificados
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === "planned" ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}>
                  {metrics.filter(m => m.total_observations === 0).length}
                </span>
              </button>
            </div>

            <div className="space-y-6">
              {metrics
                .filter(m => activeTab === "executed" ? m.total_observations > 0 : m.total_observations === 0)
                .map((m) => (
                  <section key={m.test_plan_id} className={`border p-6 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow ${activeTab === 'planned' ? 'border-dashed border-slate-300' : 'border-slate-200'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                      <div className="text-left">
                        <div className="flex items-center gap-3">
                          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                            <span className={`h-6 w-1.5 rounded-full ${activeTab === 'executed' ? 'bg-primary' : 'bg-slate-300'}`} />
                            {m.product_name}
                          </h2>
                        </div>
                        <p className="text-sm text-slate-600 font-semibold">{m.test_date ? new Date(m.test_date).toLocaleDateString() : "Fecha no definida"}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(m.test_plan_id)}
                          className="flex-1 sm:flex-none text-slate-700 font-semibold hover:bg-slate-100 border border-slate-200 min-w-[100px]"
                        >
                          <Edit size={14} />
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {/* TODO: expand details */}}
                          className="flex-1 sm:flex-none text-primary font-bold hover:bg-primary/5 min-w-[100px]"
                        >
                          <Eye size={14} />
                          Ver
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                      {[
                        { label: "Tasa de Éxito", val: activeTab === 'executed' ? `${m.success_rate}%` : "N/A", icon: TrendingUp, color: activeTab === 'executed' ? "text-green-700" : "text-slate-300" },
                        { label: "Eficiencia", val: activeTab === 'executed' ? `${m.avg_time_seconds}s` : "N/A", icon: Clock, color: activeTab === 'executed' ? "text-blue-700" : "text-slate-300" },
                        { label: "Fricción", val: activeTab === 'executed' ? m.total_errors : "N/A", icon: AlertOctagon, color: activeTab === 'executed' ? "text-red-700" : "text-slate-300" },
                        { label: "Muestra", val: activeTab === 'executed' ? m.total_observations : "0", icon: Users, color: "text-slate-900" }
                      ].map((stat, si) => (
                        <div key={si} className={`p-4 rounded-xl border shadow-sm flex flex-col ${activeTab === 'executed' ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 opacity-60'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <stat.icon size={14} className="text-slate-600" />
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{stat.label}</span>
                          </div>
                          <span className={`text-2xl font-bold ${stat.color}`}>{stat.val}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
