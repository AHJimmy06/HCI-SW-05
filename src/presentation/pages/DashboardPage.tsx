import { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { SupabaseTestPlanRepository } from "../../infrastructure/repositories/SupabaseRepositories";
import type { DashboardMetrics, FullTestPlan, Task, Observation, Finding, Participant, FullTestData, ObservationDraft, FindingDraft } from "../../domain/entities/types";
import { useTestPlan } from "../context/useTestPlan";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, TrendingUp, Clock, AlertOctagon, Users, 
  FileBarChart, Loader2,
  ChevronUp, ClipboardList, FileText,
  Edit, Eye, Plus, Trash2, AlertTriangle, Download,
  Search, Briefcase, CheckCircle2, X, ArrowRight
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"executed" | "planned">("executed");

  // Capturar mensaje de éxito de la navegación
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessToast(location.state.successMessage);
      // Limpiar el estado de la URL para que no vuelva a salir al refrescar
      window.history.replaceState({}, document.title);
      
      const timer = setTimeout(() => {
        setSuccessToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

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
      setLoading(true);
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

  const { executedPlans, plannedPlans } = useMemo(() => {
    const filtered = searchTerm.trim() 
      ? metrics.filter(m => m.product_name.toLowerCase().includes(searchTerm.toLowerCase()))
      : metrics;
    
    return {
      executedPlans: filtered.filter(m => m.total_observations > 0),
      plannedPlans: filtered.filter(m => m.total_observations === 0)
    };
  }, [metrics, searchTerm]);

  const displayPlans = activeTab === "executed" ? executedPlans : plannedPlans;

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
    
    // --- CABECERA PREMIUM ---
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE DE USABILIDAD", 14, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`PRODUCTO: ${details.product_name?.toUpperCase() || "N/A"}`, 14, 30);
    doc.text(`FECHA DE AUDITORÍA: ${details.test_date || new Date().toLocaleDateString()}`, pageWidth - 14, 30, { align: 'right' });

    // --- 1. RESUMEN EJECUTIVO (KPIs) ---
    let currentY = 55;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("1. Resumen Ejecutivo (KPIs)", 14, currentY);
    
    // Cálculo de métricas sobre la marcha para precisión
    const totalObs = details.observations?.length || 0;
    const successCount = details.observations?.filter(o => o.success).length || 0;
    const successRate = totalObs > 0 ? Math.round((successCount / totalObs) * 100) : 0;
    const totalErrors = details.observations?.reduce((acc, o) => acc + (o.errors_count || 0), 0) || 0;
    const avgTime = totalObs > 0 ? Math.round(details.observations?.reduce((acc, o) => acc + (o.time_seconds || 0), 0) / totalObs) : 0;

    autoTable(doc, {
      startY: currentY + 5,
      head: [['Métrica IHC', 'Valor', 'Interpretación Estándar ISO 9241-11']],
      body: [
        ['Tasa de Éxito', `${successRate}%`, 'Efectividad: Capacidad de los usuarios para completar las tareas.'],
        ['Tiempo Promedio', `${avgTime}s`, 'Eficiencia: Recursos invertidos para lograr los objetivos.'],
        ['Fricción Total', `${totalErrors} errores`, 'Obstáculos: Problemas de interacción detectados en la muestra.'],
        ['Muestra Cruda', `${totalObs} registros`, 'Validez: Volumen de observaciones que respaldan este reporte.'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontSize: 10 },
      styles: { fontSize: 9, cellPadding: 4 }
    });

    // --- 2. CONTEXTO Y LOGÍSTICA ---
    const lastTable = (doc as any).lastAutoTable;
    currentY = lastTable.finalY + 15;
    
    doc.setFontSize(16);
    doc.text("2. Contexto y Logística", 14, currentY);
    
    autoTable(doc, {
      startY: currentY + 5,
      body: [
        ['Producto / Módulo', `${details.product_name} / ${details.module_name || 'N/A'}`],
        ['Objetivo Principal', details.objective || 'N/A'],
        ['Perfil de Usuario', details.user_profile || 'N/A'],
        ['Metodología', details.method || 'N/A'],
        ['Moderador / Observador', `${details.moderator_name || 'N/A'} / ${details.observer_name || 'N/A'}`],
        ['Herramienta de Test', details.tool_prototype || 'N/A'],
      ],
      theme: 'striped',
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
    });

    // --- 3. MATRIZ DE HALLAZGOS (EL ORO ACCIONABLE) ---
    if (details.findings && details.findings.length > 0) {
      const lastTableContext = (doc as any).lastAutoTable;
      currentY = lastTableContext.finalY + 15;
      
      if (currentY > 240) { doc.addPage(); currentY = 20; }
      
      doc.setFontSize(16);
      doc.text("3. Matriz de Hallazgos Críticos", 14, currentY);
      
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Problema Detectado', 'Severidad', 'Prioridad', 'Recomendación IHC']],
        body: details.findings.map(f => [
          f.problem,
          f.severity,
          f.priority,
          f.recommendation
        ]),
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], fontSize: 10 },
        styles: { fontSize: 8, cellPadding: 3 },
        columnStyles: { 
          0: { cellWidth: 45 },
          1: { cellWidth: 25 },
          2: { cellWidth: 25 },
          3: { cellWidth: 85 }
        }
      });
    }

    // --- 4. CIERRE Y CONCLUSIONES ---
    const lastTableFindings = (doc as any).lastAutoTable;
    currentY = lastTableFindings.finalY + 15;
    
    if (currentY > 220) { doc.addPage(); currentY = 20; }
    
    doc.setFontSize(16);
    doc.text("4. Conclusiones de Cierre", 14, currentY);
    
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Dimensión', 'Feedback del Usuario']],
      body: [
        ['Puntos Positivos (Facilidad)', details.closing_easy || 'No registrado'],
        ['Puntos de Fricción (Confusión)', details.closing_confusing || 'No registrado'],
        ['Propuestas de Cambio', details.closing_change || 'No registrado'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [100, 116, 139] },
      styles: { fontSize: 9, cellPadding: 5 }
    });

    // --- PIE DE PÁGINA ---
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(`Usability Dashboard - Reporte Técnico IHC - Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
    }

    doc.save(`Reporte_IHC_${details.product_name?.replace(/\s+/g, '_') || 'Auditoria'}.pdf`);
  };

  const handleEdit = async (planId: string, targetRoute: string = "/plan") => {
    try {
      setLoadingDetails(planId);
      const repo = new SupabaseTestPlanRepository();
      const details = await repo.getFullPlan(planId);
      
      const mappedData: FullTestData = {
        test_plan_id: planId,
        plan: {
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
        tasks: (details.tasks || []).map((t: Task) => ({
          task_label: t.task_label || '',
          scenario: t.scenario || '',
          expected_result: t.expected_result || '',
          main_metric: t.main_metric || '',
          success_criteria: t.success_criteria || '',
          follow_up_question: t.follow_up_question || ''
        })),
        observations: details.observations && details.observations.length > 0 
          ? details.observations.map((o: Observation & { participants?: Participant; tasks?: Task }): ObservationDraft => ({
              participant_name: o.participants?.name || '',
              participant_profile: o.participants?.profile || '',
              task_label: o.tasks?.task_label || '',
              success: (o.success ? 'Si' : 'No') as 'Si' | 'No',
              time_seconds: o.time_seconds?.toString() || '',
              errors_count: o.errors_count?.toString() || '',
              key_comments: o.key_comments || '',
              detected_problem: o.detected_problem || '',
              severity: o.severity || 'Baja',
              proposed_improvement: o.proposed_improvement || ''
            }))
          : ([{
              participant_name: '',
              participant_profile: '',
              task_label: (details.tasks && details.tasks.length > 0) ? details.tasks[0].task_label : '',
              success: 'Si',
              time_seconds: '1',
              errors_count: '0',
              key_comments: '',
              detected_problem: '',
              severity: 'Baja',
              proposed_improvement: ''
            }] as ObservationDraft[]),
        findings: details.findings && details.findings.length > 0 
          ? details.findings.map((f: Finding): FindingDraft => ({
              problem: f.problem || '',
              evidence: f.evidence || '',
              frequency: f.frequency || '',
              severity: f.severity || '',
              recommendation: f.recommendation || '',
              priority: f.priority || 'Media',
              status: f.status || 'Pendiente'
            }))
          : ([{
              problem: '',
              evidence: '',
              frequency: '',
              severity: 'Baja',
              recommendation: '',
              priority: 'Media',
              status: 'Pendiente'
            }] as FindingDraft[])
      };
      
      loadFullPlan(mappedData);
      navigate(targetRoute);
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
    navigate("/dashboard/plan");
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Alerta de Éxito Persistente (Estilo Unificado IHC) */}
      {successToast && (
        <div 
          role="status" 
          aria-live="polite" 
          className="fixed top-24 right-6 z-[100] w-full max-w-md animate-in slide-in-from-right duration-500"
        >
          <div className="bg-green-600 text-white p-6 rounded-3xl shadow-2xl border-2 border-green-700 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <CheckCircle2 size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">{successToast}</p>
            </div>
            <button 
              onClick={() => setSuccessToast(null)}
              className="text-white/80 hover:text-white p-2 transition-colors"
              aria-label="Cerrar notificación"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

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
              Dashboard Principal
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
              <span className="tracking-wide uppercase">CREAR UN TEST</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
            <button 
              onClick={() => setActiveTab("executed")}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "executed" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <TrendingUp size={16} />
              Misiones Ejecutadas
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === "executed" ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}>
                {executedPlans.length}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab("planned")}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === "planned" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <Clock size={16} />
              Planificadas
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === "planned" ? "bg-primary text-white" : "bg-slate-200 text-slate-500"}`}>
                {plannedPlans.length}
              </span>
            </button>
          </div>
          
          <div className="bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
              <Briefcase size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Archivo</p>
              <p className="text-xl font-bold text-slate-900 leading-tight">{metrics.length} Proyectos</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <AlertOctagon className="text-red-600 mb-4" size={48} aria-hidden="true" />
            <h2 className="text-xl font-semibold text-slate-900">Error de Conexión</h2>
            <p className="text-slate-700 font-medium">{error}</p>
            <Button onClick={fetchMetrics} variant="outline" className="mt-4 border-slate-300">Reintentar</Button>
          </div>
        ) : displayPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white">
            <FileBarChart className="text-slate-400 mb-4" size={48} aria-hidden="true" />
            <h2 className="text-lg font-semibold text-slate-900">{searchTerm ? "No se encontraron resultados para la búsqueda" : activeTab === 'executed' ? "No hay misiones ejecutadas aún" : "No tenés misiones planificadas"}</h2>
            {!searchTerm && activeTab === 'planned' && <Button onClick={handleNewPlan} variant="outline" className="mt-4 border-slate-300 font-semibold">Planificar mi primera misión</Button>}
          </div>
        ) : (
          displayPlans.map((m, idx) => (
            <section 
              key={idx} 
              className={`space-y-6 border p-6 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow ${activeTab === 'planned' ? 'border-dashed border-slate-300' : 'border-slate-200'}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div className="text-left">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                      <span className={`h-6 w-1.5 rounded-full ${activeTab === 'executed' ? 'bg-primary' : 'bg-slate-300'}`} aria-hidden="true"></span>
                      {m.product_name || "Plan sin nombre"}
                    </h2>
                    {activeTab === 'planned' && (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-200">
                        Planificado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 font-semibold">{m.test_date ? new Date(m.test_date).toLocaleDateString() : "Fecha no definida"}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                  {activeTab === 'executed' ? (
                    <Button variant="ghost" size="sm" onClick={() => generatePDF(m.test_plan_id)} className="flex-1 sm:flex-none text-blue-700 font-semibold hover:bg-blue-50 border border-blue-100 min-w-[120px]">
                      <Download size={14} aria-hidden="true" />
                      PDF
                    </Button>
                  ) : (
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={() => handleEdit(m.test_plan_id, "/registro")} 
                      className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold min-w-[140px] shadow-lg shadow-emerald-100"
                    >
                      <ArrowRight size={14} aria-hidden="true" />
                      INICIAR TEST
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(m.test_plan_id)} disabled={loadingDetails === m.test_plan_id} className="flex-1 sm:flex-none text-slate-700 font-semibold hover:bg-slate-100 border border-slate-200 min-w-[100px]">
                    {loadingDetails === m.test_plan_id ? <Loader2 className="animate-spin" size={14} /> : <Edit size={14} aria-hidden="true" />} 
                    Editar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(m.test_plan_id)} className="flex-1 sm:flex-none text-red-700 font-semibold hover:bg-red-50 border border-red-100 min-w-[100px]">
                    <Trash2 size={14} aria-hidden="true" /> Borrar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleDetails(m.test_plan_id)} className="flex-1 sm:flex-none text-primary font-bold hover:bg-primary/5 min-w-[100px]">
                    {expandedPlan === m.test_plan_id ? <ChevronUp size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                    {expandedPlan === m.test_plan_id ? "Ocultar" : "Ver"}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { 
                    label: "Tasa de Éxito", 
                    val: activeTab === 'executed' ? `${m.success_rate}%` : "N/A", 
                    icon: TrendingUp, 
                    color: activeTab === 'executed' ? "text-green-700" : "text-slate-300",
                    desc: "Efectividad (ISO 9241-11): Porcentaje de tareas completadas correctamente por los usuarios." 
                  },
                  { 
                    label: "Eficiencia", 
                    val: activeTab === 'executed' ? `${m.avg_time_seconds}s` : "N/A", 
                    icon: Clock, 
                    color: activeTab === 'executed' ? "text-blue-700" : "text-slate-300",
                    desc: "Recursos (ISO 9241-11): Tiempo promedio que requiere un usuario para finalizar una tarea." 
                  },
                  { 
                    label: "Fricción", 
                    val: activeTab === 'executed' ? m.total_errors : "N/A", 
                    icon: AlertOctagon, 
                    color: activeTab === 'executed' ? "text-red-700" : "text-slate-300",
                    desc: "Cantidad total de errores u obstáculos críticos encontrados durante las sesiones." 
                  },
                  { 
                    label: "Muestra", 
                    val: activeTab === 'executed' ? m.total_observations : "0", 
                    icon: Users, 
                    color: "text-slate-900",
                    desc: "Volumen total de observaciones registradas. Determina la validez estadística del test." 
                  }
                ].map((stat, si) => (
                  <div key={si} className={`p-6 rounded-2xl border shadow-sm flex flex-col group relative ${activeTab === 'executed' ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 opacity-60'}`}>
                    <div className="flex items-center gap-3 mb-2">
                      <stat.icon size={18} className="text-slate-600" aria-hidden="true" />
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">{stat.label}</span>
                    </div>
                    <span className={`text-3xl font-bold ${stat.color}`}>{stat.val}</span>
                    <p className="mt-3 text-[10px] leading-tight text-slate-500 font-medium border-t border-slate-100 pt-3 italic">
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
