import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SupabaseTestPlanRepository } from "../../infrastructure/repositories/SupabaseRepositories";
import type { DashboardMetrics, FullTestPlan, Task, Observation, Finding, Participant } from "../../domain/entities/types";
import { useTestPlan } from "../context/useTestPlan";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, TrendingUp, Clock, AlertOctagon, Users, 
  FileBarChart, Loader2,
  ChevronUp, ClipboardList, FileText,
  Edit, Eye, Plus, Trash2, AlertTriangle, Download, Info,
  Search, Briefcase
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable, { type UserOptions } from "jspdf-autotable";

export function DashboardPage() {
  const navigate = useNavigate();
  const { loadFullPlan, resetData } = useTestPlan();
  const [metrics, setMetrics] = useState<DashboardMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [planDetails, setPlanDetails] = useState<Record<string, FullTestPlan>>({});
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const detailsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expandedPlan && detailsRef.current) {
      const timeoutId = window.requestAnimationFrame(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      return () => window.cancelAnimationFrame(timeoutId);
    }
  }, [expandedPlan]);

  const fetchMetrics = async () => {
    try {
      setError(null);
      const repo = new SupabaseTestPlanRepository();
      const data = await repo.getAllMetrics();
      setMetrics(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error("Error al cargar métricas", err);
      setError(err instanceof Error ? err.message : "Error al conectar con la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const filteredMetrics = useMemo(() => {
    if (!searchTerm.trim()) return metrics;
    return metrics.filter(m => 
      m.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [metrics, searchTerm]);

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

  const generatePDF = async (planId: string) => {
    let details = planDetails[planId];
    
    if (!details) {
      const repo = new SupabaseTestPlanRepository();
      details = await repo.getFullPlan(planId);
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); 
    doc.text("Reporte de Usabilidad", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); 
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 28);
    doc.line(14, 32, pageWidth - 14, 32);

    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235); 
    doc.text("1. Información General", 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Campo', 'Detalle']],
      body: [
        ['Producto', details.product_name || 'N/A'],
        ['Módulo', details.module_name || 'N/A'],
        ['Objetivo', details.objective || 'N/A'],
        ['Perfil Usuario', details.user_profile || 'N/A'],
        ['Fecha Test', details.test_date || 'N/A'],
        ['Moderador', details.moderator_name || 'N/A'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
    });

    if (details.findings && details.findings.length > 0) {
      doc.setFontSize(16);
      const lastTable = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable;
      const finalY = lastTable ? lastTable.finalY : 50;
      doc.text("2. Síntesis de Hallazgos", 14, finalY + 15);
      
      const findingsOptions: UserOptions = {
        startY: finalY + 20,
        head: [['Problema', 'Gravedad', 'Prioridad', 'Recomendación']],
        body: details.findings.map((f: Finding) => [
          f.problem,
          f.severity,
          f.priority,
          f.recommendation
        ]),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] },
      };
      autoTable(doc, findingsOptions);
    }

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Usability Dashboard - Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`Reporte_Usabilidad_${details.product_name || 'Plan'}.pdf`);
  };

  const handleEdit = async (planId: string) => {
    try {
      setLoadingDetails(planId);
      const repo = new SupabaseTestPlanRepository();
      const details = await repo.getFullPlan(planId);
      
      const mappedData = {
        test_plan_id: planId,
        plan: {
          product_name: details.product_name || '',
          module_name: details.module_name || '',
          objective: details.objective || '',
          user_profile: details.user_profile || '',
          method: details.method || '',
          test_date: details.test_date || '',
          place_channel: details.place_channel || '',
          moderator_name: details.moderator_name || '',
          observer_name: details.observer_name || '',
          tool_prototype: details.tool_prototype || '',
          admin_notes: details.admin_notes || '',
          closing_easy: details.closing_easy || '',
          closing_confusing: details.closing_confusing || '',
          closing_change: details.closing_change || '',
        },
        tasks: (details.tasks || []).map((t: Task) => ({
          task_label: t.task_label || '',
          scenario: t.scenario || '',
          expected_result: t.expected_result || '',
          main_metric: t.main_metric || '',
          success_criteria: t.success_criteria || '',
          follow_up_question: t.follow_up_question || ''
        })),
        observations: (details.observations || []).map((o: Observation & { participants?: Participant; tasks?: Task }) => ({
          participant_name: o.participants?.name || '',
          participant_profile: o.participants?.profile || '',
          task_label: o.tasks?.task_label || '',
          success: o.success ? 'Si' : 'No' as 'Si' | 'No',
          time_seconds: o.time_seconds?.toString() || '',
          errors_count: o.errors_count?.toString() || '',
          detected_problem: o.detected_problem || '',
          severity: o.severity || 'Baja',
          proposed_improvement: o.proposed_improvement || ''
        })),
        findings: (details.findings || []).map((f: Finding) => ({
          problem: f.problem || '',
          evidence: f.evidence || '',
          frequency: f.frequency || '',
          severity: f.severity || '',
          recommendation: f.recommendation || '',
          priority: f.priority || 'Media',
          status: f.status || 'Pendiente'
        }))
      };
      
      loadFullPlan(mappedData);
      navigate("/plan");
    } catch (err) {
      console.error("Error al cargar para editar", err);
    } finally {
      setLoadingDetails(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);
    try {
      const repo = new SupabaseTestPlanRepository();
      await repo.delete(deleteConfirm);
      setDeleteConfirm(null);
      await fetchMetrics();
    } catch (err) {
      console.error("Error al eliminar plan", err);
      alert("No se pudo eliminar el plan.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNewPlan = () => {
    resetData();
    navigate("/plan");
  };

  return (
    <div className="flex flex-col min-h-full">
      {deleteConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 text-center">
              <div className="h-16 w-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">¿Eliminar este plan?</h3>
              <p className="text-sm text-slate-700 mb-8 leading-relaxed font-medium">
                Esta acción no se puede deshacer de forma sencilla desde el panel.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => setDeleteConfirm(null)} disabled={isDeleting} className="flex-1 rounded-xl py-6 font-semibold border-slate-300 text-slate-700">
                  Cancelar
                </Button>
                <Button onClick={handleDelete} disabled={isDeleting} className="flex-1 rounded-xl py-6 bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors">
                  {isDeleting ? <Loader2 className="animate-spin" size={18} /> : <Trash2 size={18} aria-hidden="true" />}
                  Sí, eliminar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="px-6 py-8 border-b border-surface-100 bg-slate-50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <LayoutDashboard className="text-primary" aria-hidden="true" size={28} />
              Tablero de Control
            </h1>
            <p className="mt-1 text-slate-700 max-w-2xl font-medium">
              Panel de instrumentos para la visualización global de métricas y KPIs de la misión.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            <div className="relative w-full sm:w-64 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Lupa de Auditoría..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
            </div>
            <Button 
              onClick={handleNewPlan} 
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-6 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center gap-3 active:scale-95"
            >
              <Plus size={20} strokeWidth={2.5} aria-hidden="true" />
              <span className="tracking-wide uppercase">Nueva Misión</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="h-12 w-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Archivo Histórico</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.length} Proyectos</p>
            </div>
          </div>
        </div>

        {loading && metrics.length === 0 ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : error && metrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertOctagon className="text-red-600 mb-4" size={48} aria-hidden="true" />
            <h2 className="text-xl font-semibold text-slate-900">Error de Conexión</h2>
            <p className="text-slate-700 font-medium">{error}</p>
            <Button onClick={fetchMetrics} variant="outline" className="mt-4 border-slate-300">Reintentar</Button>
          </div>
        ) : filteredMetrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white">
            <FileBarChart className="text-slate-400 mb-4" size={48} aria-hidden="true" />
            <h2 className="text-lg font-semibold text-slate-900">{searchTerm ? "No se encontraron resultados" : "Sin datos disponibles"}</h2>
            {!searchTerm && <Button onClick={handleNewPlan} variant="outline" className="mt-4 border-slate-300 font-semibold">Crear mi primer plan</Button>}
          </div>
        ) : (
          filteredMetrics.map((m, idx) => (
            <section 
              key={idx} 
              className="space-y-6 border border-slate-200 p-6 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div className="text-left">
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="h-6 w-1.5 bg-primary rounded-full" aria-hidden="true"></span>
                    {m.product_name || "Plan sin nombre"}
                  </h2>
                  <p className="text-sm text-slate-600 font-semibold">{m.test_date ? new Date(m.test_date).toLocaleDateString() : "Fecha no definida"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => generatePDF(m.test_plan_id)} className="text-blue-700 font-semibold hover:bg-blue-50 border border-blue-100">
                    <Download size={16} aria-hidden="true" />
                    Exportar PDF
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(m.test_plan_id)} disabled={loadingDetails === m.test_plan_id} className="text-slate-700 font-semibold hover:bg-slate-100 border border-slate-200">
                    {loadingDetails === m.test_plan_id ? <Loader2 className="animate-spin" size={16} /> : <Edit size={16} aria-hidden="true" />} 
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(m.test_plan_id)} className="text-red-700 font-semibold hover:bg-red-50 border border-red-100"><Trash2 size={16} aria-hidden="true" /> Eliminar</Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleDetails(m.test_plan_id)} className="text-primary font-bold hover:bg-primary/5">
                    {expandedPlan === m.test_plan_id ? <ChevronUp size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                    {expandedPlan === m.test_plan_id ? "Ocultar" : "Detalles"}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    label: "Tasa de Éxito", 
                    val: `${m.success_rate}%`, 
                    icon: TrendingUp, 
                    color: "text-green-700",
                    desc: "Efectividad (ISO 9241-11): Porcentaje de tareas completadas correctamente por los usuarios." 
                  },
                  { 
                    label: "Eficiencia", 
                    val: `${m.avg_time_seconds}s`, 
                    icon: Clock, 
                    color: "text-blue-700",
                    desc: "Recursos (ISO 9241-11): Tiempo promedio que requiere un usuario para finalizar una tarea." 
                  },
                  { 
                    label: "Fricción", 
                    val: m.total_errors, 
                    icon: AlertOctagon, 
                    color: "text-red-700",
                    desc: "Cantidad total de errores u obstáculos críticos encontrados durante las sesiones." 
                  },
                  { 
                    label: "Muestra", 
                    val: m.total_observations, 
                    icon: Users, 
                    color: "text-slate-900",
                    desc: "Volumen total de observaciones registradas. Determina la validez estadística del test." 
                  }
                ].map((stat, si) => (
                  <div key={si} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col group relative">
                    <div className="flex items-center gap-3 mb-2">
                      <stat.icon size={18} className="text-slate-600" aria-hidden="true" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{stat.label}</span>
                      <div className="ml-auto opacity-40 group-hover:opacity-100 transition-opacity cursor-help" title={stat.desc}>
                        <Info size={14} aria-hidden="true" />
                      </div>
                    </div>
                    <span className={`text-3xl font-bold ${stat.color}`}>{stat.val}</span>
                    <p className="mt-3 text-xs leading-tight text-slate-600 font-medium border-t border-slate-200 pt-3 italic">
                      {stat.desc}
                    </p>
                  </div>
                ))}
              </div>

              {expandedPlan === m.test_plan_id && planDetails[m.test_plan_id] && (
                <div ref={detailsRef} className="mt-6 border-t border-slate-100 pt-8 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
                    <div className="space-y-4">
                      <h3 className="font-semibold border-b border-slate-100 pb-2 flex items-center gap-2 text-slate-900"><FileText size={16} aria-hidden="true"/> Contexto</h3>
                      <dl className="space-y-2 text-sm">
                        <div>
                          <dt className="text-xs font-bold text-slate-600 uppercase tracking-wider">Objetivo</dt>
                          <dd className="text-slate-800 font-medium">{planDetails[m.test_plan_id].objective || "No definido"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold text-slate-600 uppercase tracking-wider">Moderador</dt>
                          <dd className="text-slate-800 font-medium">{planDetails[m.test_plan_id].moderator_name || "No definido"}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="font-semibold border-b border-slate-100 pb-2 flex items-center gap-2 text-slate-900"><ClipboardList size={16} aria-hidden="true"/> Hallazgos Clave</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(planDetails[m.test_plan_id].findings || []).slice(0, 4).map((f: Finding, fi: number) => (
                          <div key={fi} className="p-4 bg-slate-50 rounded-xl text-sm border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-slate-900">{f.problem}</span>
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                f.priority === 'Alta' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                              }`}>{f.priority}</span>
                            </div>
                            <p className="text-slate-700 font-medium leading-relaxed">{f.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          ))
        )}
      </div>
      
      <footer className="mt-auto px-6 py-10 bg-slate-100 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-700 font-semibold max-w-md mx-auto leading-relaxed uppercase tracking-wider">
          KPIs de usabilidad estándar ISO 9241-11
        </p>
      </footer>
    </div>
  );
}
