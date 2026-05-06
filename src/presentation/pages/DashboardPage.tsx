import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { SupabaseTestPlanRepository } from "../../infrastructure/repositories/SupabaseRepositories";
import type { DashboardMetrics, Task, Observation, Finding, Participant, FullTestData, ObservationDraft, FindingDraft } from "../../domain/entities/types";
import { useTestPlan } from "../context/useTestPlan";
import { Button } from "@/components/ui/button";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  LayoutDashboard, TrendingUp, Clock, AlertOctagon, Users,
  FileBarChart, Loader2,
  Edit, Eye, Plus, Trash2, AlertTriangle, Download,
  Search, Briefcase, CheckCircle2, X, ArrowRight, MoreVertical,
  Target, Zap, Shield, BarChart3
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId } = useParams<{ projectId?: string }>();
  const { loadFullPlan, resetData } = useTestPlan();
  const [metrics, setMetrics] = useState<DashboardMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"executed" | "planned">("executed");
  const [pdfPreview, setPdfPreview] = useState<{ url: string; name: string } | null>(null);

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

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const repo = new SupabaseTestPlanRepository();
      const data = await repo.getAllMetrics(projectId);
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
  }, [projectId]);

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

  const generatePDF = async (planId: string) => {
    const repo = new SupabaseTestPlanRepository();
    const details = await repo.getFullPlan(planId);

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // ─── PALETA: Primary blue-based to match platform ───
    const C: Record<string, [number, number, number]> = {
      primary:    [59, 130, 246],
      primaryDk:  [30,  64, 175],
      slate900:   [15,  23,  42],
      slate500:   [100, 116, 139],
      slate200:   [226, 232, 240],
      white:      [255, 255, 255],
      green:      [22,  163,  74],
      amber:      [217, 119,   6],
      red:        [220,  38,  38],
    };

    // ─── 1. CABECERA ───
    const setFill = (rgb: [number, number, number]) => doc.setFillColor(...rgb);
    const setText = (rgb: [number, number, number]) => doc.setTextColor(...rgb);

    // ─── 1. CABECERA ───
    setFill(C.primary);
    doc.rect(0, 0, pageWidth, 52, 'F');

    // Logo text
    setText(C.white);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("REPORTE DE USABILIDAD", 14, 22);

    // Accent line
    doc.setFillColor(...C.white);
    doc.rect(14, 27, 40, 2, 'F');

    // Product + date row
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${details.product_name?.toUpperCase() || "PRODUCTO"}`, 14, 37);
    doc.text(`${details.module_name || ""}`, 14, 43);

    const fecha = details.test_date
      ? new Date(details.test_date).toLocaleDateString("es-EC", { year: "numeric", month: "long", day: "numeric" })
      : new Date().toLocaleDateString("es-EC", { year: "numeric", month: "long", day: "numeric" });
    doc.text(fecha, pageWidth - 14, 37, { align: "right" });
    doc.setFontSize(8);
    doc.setTextColor(200, 220, 255);
    doc.text("FECHA DE TEST", pageWidth - 14, 43, { align: "right" });

    // Method badge
    setFill(C.primaryDk);
    doc.roundedRect(pageWidth - 60, 47, 46, 7, 2, 2, 'F');
    setText(C.white);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text(details.method?.toUpperCase() || "TEST", pageWidth - 37, 52, { align: "center" });

    // ─── 2. KPIs ───
    let currentY = 62;

    // Section title bar
    setFill(C.slate900);
    doc.rect(14, currentY, pageWidth - 28, 1, 'F');
    currentY += 8;

    setText(C.slate900);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("KPIs DE USABILIDAD", 14, currentY);
    currentY += 6;

    setText(C.slate500);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("Métricas calculadas según ISO 9241-11", 14, currentY);
    currentY += 8;

    // Metric cards
    const totalObs = details.observations?.length || 0;
    const successCount = details.observations?.filter(o => o.success).length || 0;
    const successRate = totalObs > 0 ? Math.round((successCount / totalObs) * 100) : 0;
    const totalErrors = details.observations?.reduce((acc, o) => acc + (o.errors_count || 0), 0) || 0;
    const avgTime = totalObs > 0 ? Math.round(details.observations?.reduce((acc, o) => acc + (o.time_seconds || 0), 0) / totalObs) : 0;

    const kpis: { label: string; val: string; sub: string; color: [number,number,number]; bg: [number,number,number] }[] = [
      { label: "TASA DE ÉXITO", val: `${successRate}%`,    sub: "Efectividad — tareas completadas correctamente", color: C.green,   bg: [240, 253, 244] },
      { label: "TIEMPO PROM.",  val: `${avgTime}s`,         sub: "Eficiencia — recursos invertidos promedio",        color: C.amber,   bg: [255, 251, 235] },
      { label: "ERRORES",        val: `${totalErrors}`,      sub: "Conformidad — fricciones críticas detectadas",    color: C.red,     bg: [254, 242, 242] },
      { label: "OBSERVACIONES",  val: `${totalObs}`,         sub: "Validez — volumen de datos registrados",          color: C.primary, bg: [239, 246, 255] },
    ];

    const cardW = (pageWidth - 28 - 12) / 4;
    kpis.forEach((kpi, i) => {
      const x = 14 + i * (cardW + 4);

      setFill(kpi.bg);
      doc.roundedRect(x, currentY, cardW, 28, 3, 3, 'F');

      // Color accent bar at top
      setFill(kpi.color);
      doc.roundedRect(x, currentY, cardW, 3, 3, 3, 'F');
      // Square the bottom of the accent bar
      doc.rect(x, currentY + 1.5, cardW, 1.5, 'F');

      setText(kpi.color);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text(kpi.val, x + 6, currentY + 15);

      setText(C.slate500);
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "bold");
      doc.text(kpi.label, x + 6, currentY + 21);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(6);
      const lines = doc.splitTextToSize(kpi.sub, cardW - 10);
      doc.text(lines, x + 6, currentY + 25);
    });

    currentY += 36;

    // ISO reference strip
    setFill(C.slate200);
    doc.rect(14, currentY, pageWidth - 28, 0.5, 'F');
    currentY += 5;
    setText(C.slate500);
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.text("基准  ISO 9241-11:1998  •  Usabilidad: efectividad, eficiencia y satisfacción en el contexto de uso", 14, currentY);
    currentY += 10;

    // ─── 3. CONTEXTO ───
    if (currentY > 200) { doc.addPage(); currentY = 20; }

    setFill(C.primary);
    doc.rect(14, currentY, 3, 14, 'F');
    setText(C.slate900);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CONTEXTO Y LOGÍSTICA", 22, currentY + 9);
    currentY += 18;

    autoTable(doc, {
      startY: currentY,
      body: [
        ["Producto / Módulo",      `${details.product_name} / ${details.module_name || "N/A"}`],
        ["Objetivo Principal",      details.objective || "N/A"],
        ["Perfil de Usuario",       details.user_profile || "N/A"],
        ["Metodología",             details.method || "N/A"],
        ["Moderador",               details.moderator_name || "N/A"],
        ["Observador",              details.observer_name || "N/A"],
        ["Herramienta / Prototipo", details.tool_prototype || "N/A"],
        ["Lugar / Canal",          details.place_channel || "N/A"],
        ["Duración",                details.duration || "N/A"],
      ],
      theme: "striped",
      styles:       { fontSize: 8.5, cellPadding: 4 },
      columnStyles:  { 0: { fontStyle: "bold", textColor: C.slate900, cellWidth: 46 } },
      bodyStyles:   { textColor: C.slate900 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // ─── 4. HALLAZGOS ───
    if (details.findings && details.findings.length > 0) {
      const lastTable = (doc as any).lastAutoTable;
      currentY = lastTable.finalY + 14;

      if (currentY > 230) { doc.addPage(); currentY = 20; }

      setFill(C.primary);
      doc.rect(14, currentY, 3, 14, 'F');
      setText(C.slate900);
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("HALLAZGOS Y RECOMENDACIONES", 22, currentY + 9);
      currentY += 18;

      const priorityColor: Record<string, number[]> = {
        "Alta":   C.red,
        "Media":  C.amber,
        "Baja":   C.green,
      };
      const severityColor: Record<string, number[]> = {
        "Crítica": C.red,
        "Alta":    [217, 119, 6],
        "Media":   C.amber,
        "Baja":    C.green,
      };

      autoTable(doc, {
        startY: currentY,
        head: [["#", "Problema Detectado", "Severidad", "Prioridad", "Recomendación"]],
        body: details.findings.map((f: Finding, idx: number) => [
          `${idx + 1}`,
          f.problem,
          f.severity || "—",
          f.priority,
          f.recommendation,
        ]),
        theme: "grid",
        headStyles: {
          fillColor: C.slate900,
          textColor: C.white,
          fontSize: 8,
          fontStyle: "bold",
          cellPadding: 5,
        },
        styles:       { fontSize: 8, cellPadding: 4, textColor: C.slate900 },
        columnStyles: {
          0: { cellWidth: 8,  halign: "center", fontStyle: "bold" },
          1: { cellWidth: 44 },
          2: { cellWidth: 24 },
          3: { cellWidth: 20 },
          4: { cellWidth: 70 },
        },
        didParseCell: (data: any) => {
          if (data.section === "body" && data.column.index === 3) {
            const val = data.cell.raw as string;
            const col = priorityColor[val] || C.slate500;
            data.cell.styles.textColor = col;
            data.cell.styles.fontStyle = "bold";
          }
          if (data.section === "body" && data.column.index === 2) {
            const val = data.cell.raw as string;
            const col = severityColor[val] || C.slate500;
            data.cell.styles.textColor = col;
          }
        },
      });
    }

    // ─── 5. CIERRE ───
    const lastT = (doc as any).lastAutoTable;
    currentY = lastT.finalY + 14;

    if (currentY > 220) { doc.addPage(); currentY = 20; }

    setFill(C.primary);
    doc.rect(14, currentY, 3, 14, 'F');
    setText(C.slate900);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("CONCLUSIONES DE CIERRE", 22, currentY + 9);
    currentY += 18;

    autoTable(doc, {
      startY: currentY,
      head: [["Dimensión", "Feedback del Usuario"]],
      body: [
        ["Facilidad — Puntos Positivos",    details.closing_easy      || "No registrado"],
        ["Confusión — Puntos de Fricción",  details.closing_confusing || "No registrado"],
        ["Cambios Propuestos",              details.closing_change    || "No registrado"],
      ],
      theme: "grid",
      headStyles: {
        fillColor: C.primary,
        textColor: C.white,
        fontSize: 8,
        fontStyle: "bold",
        cellPadding: 5,
      },
      styles:       { fontSize: 8.5, cellPadding: 5, textColor: C.slate900 },
      columnStyles: { 0: { fontStyle: "bold", cellWidth: 52 } },
    });

    // ─── PIE DE PÁGINA ───
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      setFill(C.primary);
      doc.rect(0, 280, pageWidth, 1, 'F');
      setText(C.slate500);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.text("Usability Dashboard  •  KPIs estándar ISO 9241-11  •  Página " + i + " de " + pageCount, pageWidth / 2, 287, { align: "center" });
    }

    const fileName = `Reporte_IHC_${details.product_name?.replace(/\s+/g, "_") || "Auditoria"}.pdf`;
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    setPdfPreview({ url, name: fileName });
  };

  const handleEdit = async (planId: string, targetRoute: string = "/plan") => {
    try {
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
    // Clear any stale project context to prevent cross-project pollution
    sessionStorage.removeItem('active_project_id');
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
                <div className="flex items-center gap-3 mt-2 md:mt-0">
                  {/* Primary action: PDF for executed, Start for planned */}
                  {activeTab === 'executed' ? (
                    <Button size="sm" onClick={() => generatePDF(m.test_plan_id)} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 shadow-lg shadow-blue-100">
                      <Download size={14} aria-hidden="true" />
                      PDF
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => handleEdit(m.test_plan_id, "/registro")} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 shadow-lg shadow-emerald-100">
                      <ArrowRight size={14} aria-hidden="true" />
                      INICIAR
                    </Button>
                  )}

                  {/* Secondary actions in dropdown menu (ISO 9241-11: prevent errors, consistent standards) */}
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900">
                        <MoreVertical size={14} aria-hidden="true" />
                        <span className="sr-only">Más acciones</span>
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        sideOffset={5}
                        className="min-w-[160px] bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 animate-in fade-in zoom-in-95 duration-150"
                        align="end"
                      >
                        <DropdownMenu.Item
                          onClick={() => navigate(`/dashboard/test-plan/${m.test_plan_id}`)}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg cursor-pointer outline-none focus:bg-slate-100"
                        >
                          <Eye size={14} />
                          Ver detalles
                        </DropdownMenu.Item>

                        <DropdownMenu.Item
                          onClick={() => handleEdit(m.test_plan_id)}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg cursor-pointer outline-none focus:bg-slate-100"
                        >
                          <Edit size={14} />
                          Editar plan
                        </DropdownMenu.Item>

                        <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />

                        <DropdownMenu.Item
                          onClick={() => setDeleteConfirm(m.test_plan_id)}
                          className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-700 hover:bg-red-50 rounded-lg cursor-pointer outline-none focus:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Eliminar
                        </DropdownMenu.Item>
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                </div>
              </div>
              
              <div className="space-y-3">
                {/* ISO 9241-11 Dimension Headers */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* EFECTIVIDAD */}
                  <div className="flex items-center gap-2">
                    <Target size={12} className="text-primary" aria-hidden="true" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Efectividad</span>
                  </div>
                  {/* EFICIENCIA */}
                  <div className="flex items-center gap-2">
                    <Zap size={12} className="text-amber-600" aria-hidden="true" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Eficiencia</span>
                  </div>
                  {/* CONFORMIDAD */}
                  <div className="flex items-center gap-2">
                    <Shield size={12} className="text-red-600" aria-hidden="true" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Conformidad</span>
                  </div>
                  {/* SEGURIDAD */}
                  <div className="flex items-center gap-2">
                    <BarChart3 size={12} className="text-slate-600" aria-hidden="true" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Muestra</span>
                  </div>
                </div>

                {/* Metric Cards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      label: "Tasa de Éxito",
                      val: activeTab === 'executed' ? `${m.success_rate}%` : "—",
                      icon: TrendingUp,
                      color: activeTab === 'executed' ? "text-green-700" : "text-slate-300",
                      bgColor: activeTab === 'executed' ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-100",
                      isoRef: "ISO 9241-11: Efectividad",
                      helpText: "Porcentaje de tareas completadas correctamente"
                    },
                    {
                      label: "Tiempo Promedio",
                      val: activeTab === 'executed' ? `${m.avg_time_seconds}s` : "—",
                      icon: Clock,
                      color: activeTab === 'executed' ? "text-amber-700" : "text-slate-300",
                      bgColor: activeTab === 'executed' ? "bg-amber-50 border-amber-200" : "bg-slate-50 border-slate-100",
                      isoRef: "ISO 9241-11: Eficiencia",
                      helpText: "Tiempo promedio para completar una tarea"
                    },
                    {
                      label: "Errores",
                      val: activeTab === 'executed' ? `${m.total_errors}` : "—",
                      icon: AlertOctagon,
                      color: activeTab === 'executed' ? "text-red-700" : "text-slate-300",
                      bgColor: activeTab === 'executed' ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-100",
                      isoRef: "ISO 9241-11: Conformidad",
                      helpText: "Total de errores críticos encontrados"
                    },
                    {
                      label: "Observaciones",
                      val: activeTab === 'executed' ? `${m.total_observations}` : "0",
                      icon: Users,
                      color: activeTab === 'executed' ? "text-slate-800" : "text-slate-300",
                      bgColor: activeTab === 'executed' ? "bg-slate-100 border-slate-300" : "bg-slate-50 border-slate-100",
                      isoRef: "Validez estadística",
                      helpText: "Cantidad de registros de observación"
                    }
                  ].map((stat, si) => (
                    <div
                      key={si}
                      title={`${stat.isoRef}: ${stat.helpText}`}
                      className={`p-4 rounded-xl border flex flex-col group ${stat.bgColor} hover:shadow-md transition-shadow cursor-help`}
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
                </div>
              </div>
            </section>
          ))
        )}
      </div>
      
      <footer className="mt-auto px-6 py-10 bg-slate-100 border-t border-slate-200 text-center">
        <p className="text-xs text-slate-700 font-semibold max-w-md mx-auto leading-relaxed uppercase tracking-wider">
          KPIs de usabilidad estándar ISO 9241-11
        </p>
      </footer>

      {/* PDF Preview Dialog */}
      <Dialog open={!!pdfPreview} onOpenChange={(open) => !open && setPdfPreview(null)}>
        <DialogContent className="max-w-4xl w-[90vw] h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <FileBarChart className="text-primary" size={20} />
              <DialogTitle className="text-base font-semibold text-slate-900">
                {pdfPreview?.name || "Vista previa del reporte"}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="flex-1 min-h-0 bg-slate-100">
            {pdfPreview && (
              <iframe
                src={pdfPreview.url}
                className="w-full h-full min-h-[60vh] border-0"
                title="Vista previa del PDF"
              />
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t border-slate-200 shrink-0 flex flex-row items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setPdfPreview(null)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cerrar
            </Button>
            {pdfPreview && (
              <a
                href={pdfPreview.url}
                download={pdfPreview.name}
                className="inline-flex"
              >
                <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                  <Download size={14} className="mr-2" />
                  Descargar PDF
                </Button>
              </a>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
