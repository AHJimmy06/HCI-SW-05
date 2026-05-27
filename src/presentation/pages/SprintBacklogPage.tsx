import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SupabaseTestPlanRepository } from "../../infrastructure/repositories/SupabaseRepositories";
import { generateSprintBacklog } from "../../domain/services/SprintBacklogGenerator";
import type { FullTestPlan, SprintBacklog, BacklogUserStory, BacklogTask } from "../../domain/entities/types";
import {
  Loader2,
  Sparkles,
  Save,
  ArrowLeft,
  LayoutDashboard,
  Plus,
  CheckCircle2,
  Clock,
  Zap,
  Ticket,
  AlertTriangle,
  FileText,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function SprintBacklogPage() {
  const { testPlanId } = useParams<{ testPlanId: string }>();
  const navigate = useNavigate();
  const repo = useMemo(() => new SupabaseTestPlanRepository(), []);

  const [plan, setPlan] = useState<FullTestPlan | null>(null);
  const [backlog, setBacklog] = useState<SprintBacklog | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"stories" | "tasks">("stories");
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (targetPlan: FullTestPlan) => {
    setIsGenerating(true);
    setError(null);
    try {
      const generated = await generateSprintBacklog(targetPlan);
      setBacklog(generated);
      // Auto-save initial generation
      if (testPlanId) {
        await repo.saveSprintBacklog(testPlanId, generated);
      }
    } catch (err) {
      console.error(err);
      setError("Error al generar el backlog con IA. Por favor, reintenta.");
    } finally {
      setIsGenerating(false);
    }
  }, [testPlanId, repo]);

  useEffect(() => {
    if (!testPlanId) return;
    const loadData = async () => {
      setLoading(true);
      try {
        const fullPlan = await repo.getFullPlan(testPlanId);
        setPlan(fullPlan);

        const existingBacklog = await repo.getSprintBacklog(testPlanId);
        if (existingBacklog) {
          setBacklog(existingBacklog);
        } else {
          // Auto-trigger generation if none exists
          handleGenerate(fullPlan);
        }
      } catch (err) {
        console.error(err);
        setError("No se pudo cargar la información del plan.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [testPlanId, repo, handleGenerate]);

  const handleExportMarkdown = () => {
    if (!backlog) return;

    let md = `# Sprint Backlog: ${backlog.sprint_nombre}\n\n`;
    md += `**Objetivo:** ${backlog.objetivo_sprint}\n\n`;
    
    md += `## Historias de Usuario\n\n`;
    backlog.historias_usuario.forEach(us => {
      md += `### [${us.id}] ${us.titulo}\n`;
      md += `**Prioridad:** ${us.prioridad} | **Esfuerzo:** ${us.esfuerzo} | **Tipo:** ${us.tipo}\n\n`;
      md += `${us.descripcion}\n\n`;
      md += `**Criterios de Aceptación:**\n`;
      us.criterio_aceptacion.forEach(ac => {
        md += `- [ ] ${ac}\n`;
      });
      md += `\n---\n\n`;
    });

    md += `## Tareas Técnicas\n\n`;
    md += `| ID | Descripción | Estimado |\n`;
    md += `|----|-------------|----------|\n`;
    backlog.tareas_tecnicas.forEach(t => {
      md += `| ${t.id} | ${t.descripcion} | ${t.estimado_horas}h |\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backlog-${backlog.sprint_nombre.toLowerCase().replace(/\s+/g, '-')}.md`;
    link.click();
  };

  const handleExportPDF = () => {
    if (!backlog) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Sprint Backlog Report", 20, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generado por IHC Intelligence Dashboard · ${new Date().toLocaleDateString()}`, 20, 30);

    // Sprint Info
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(backlog.sprint_nombre, 20, 55);

    doc.setFontSize(12);
    doc.text("Objetivo del Sprint:", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105); // slate-600
    const objectiveLines = doc.splitTextToSize(backlog.objetivo_sprint, pageWidth - 40);
    doc.text(objectiveLines, 20, 72);

    let currentY = 72 + (objectiveLines.length * 7) + 10;

    // User Stories Section
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Historias de Usuario", 20, currentY);
    currentY += 10;

    backlog.historias_usuario.forEach((us) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 20;
      }

      // Story Card logic in PDF
      doc.setFillColor(248, 250, 252); // slate-50
      doc.roundedRect(15, currentY - 5, pageWidth - 30, 45, 3, 3, 'F');
      
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`[${us.id}] ${us.titulo}`, 20, currentY + 5);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Prioridad: ${us.prioridad} | Esfuerzo: ${us.esfuerzo} | Tipo: ${us.tipo}`, 20, currentY + 12);

      doc.setTextColor(51, 65, 85);
      const descLines = doc.splitTextToSize(us.descripcion, pageWidth - 45);
      doc.text(descLines, 20, currentY + 20);

      let acY = currentY + 30 + (descLines.length * 2);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Criterios de Aceptación:", 20, acY);
      doc.setFont("helvetica", "normal");
      
      us.criterio_aceptacion.forEach((ac, index) => {
        const bullet = `• ${ac}`;
        const acLines = doc.splitTextToSize(bullet, pageWidth - 55);
        doc.text(acLines, 25, acY + 5 + (index * 5));
        acY += (acLines.length * 4);
      });

      currentY = acY + 15;
    });

    // Technical Tasks Table
    if (currentY > 200) {
      doc.addPage();
      currentY = 20;
    } else {
      currentY += 10;
    }

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Tareas Técnicas", 20, currentY);
    currentY += 5;

    autoTable(doc, {
      startY: currentY,
      head: [['ID', 'Descripción', 'Estimado']],
      body: backlog.tareas_tecnicas.map(t => [t.id, t.descripcion, `${t.estimado_horas}h`]),
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });

    doc.save(`backlog-${backlog.sprint_nombre.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const handleSave = async () => {
    if (!testPlanId || !backlog) return;
    setIsSaving(true);
    try {
      await repo.saveSprintBacklog(testPlanId, backlog);
    } catch (err) {
      console.error(err);
      setError("Error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const updateStory = (id: string, field: keyof BacklogUserStory, value: string | string[]) => {
    if (!backlog) return;
    const newStories = backlog.historias_usuario.map(s => 
      s.id === id ? { ...s, [field]: value } as BacklogUserStory : s
    );
    setBacklog({ ...backlog, historias_usuario: newStories });
  };

  const updateTask = (id: string, field: keyof BacklogTask, value: string | number) => {
    if (!backlog) return;
    const newTasks = backlog.tareas_tecnicas.map(t => 
      t.id === id ? { ...t, [field]: value } as BacklogTask : t
    );
    setBacklog({ ...backlog, tareas_tecnicas: newTasks });
  };

  const handleAddStory = () => {
    if (!backlog) return;
    const newId = `US${backlog.historias_usuario.length + 1}`;
    const newStory: BacklogUserStory = {
      id: newId,
      titulo: "Nueva Historia de Usuario",
      descripcion: "Como [rol], quiero [acción] para [beneficio]",
      criterio_aceptacion: ["Criterio 1"],
      prioridad: "Media",
      esfuerzo: "1 pt",
      tipo: "feature"
    };
    setBacklog({
      ...backlog,
      historias_usuario: [...backlog.historias_usuario, newStory]
    });
  };

  const handleAddTask = () => {
    if (!backlog) return;
    const newId = `T${backlog.tareas_tecnicas.length + 1}`;
    const newTask: BacklogTask = {
      id: newId,
      descripcion: "Nueva tarea técnica",
      estimado_horas: 1
    };
    setBacklog({
      ...backlog,
      tareas_tecnicas: [...backlog.tareas_tecnicas, newTask]
    });
  };

  const handleRemoveStory = (id: string) => {
    if (!backlog) return;
    setBacklog({
      ...backlog,
      historias_usuario: backlog.historias_usuario.filter(s => s.id !== id)
    });
  };

  const handleRemoveTask = (id: string) => {
    if (!backlog) return;
    setBacklog({
      ...backlog,
      tareas_tecnicas: backlog.tareas_tecnicas.filter(t => t.id !== id)
    });
  };

  const handleRemoveAC = (storyId: string, index: number) => {
    if (!backlog) return;
    const newStories = backlog.historias_usuario.map(s => {
      if (s.id === storyId) {
        const newAC = s.criterio_aceptacion.filter((_, i) => i !== index);
        return { ...s, criterio_aceptacion: newAC };
      }
      return s;
    });
    setBacklog({ ...backlog, historias_usuario: newStories });
  };

  const handleAddAC = (storyId: string) => {
    if (!backlog) return;
    const newStories = backlog.historias_usuario.map(s => {
      if (s.id === storyId) {
        return { ...s, criterio_aceptacion: [...s.criterio_aceptacion, "Nuevo criterio"] };
      }
      return s;
    });
    setBacklog({ ...backlog, historias_usuario: newStories });
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-sm font-bold text-slate-500 animate-pulse uppercase tracking-widest">Cargando Laboratorio de IA...</p>
      </div>
    );
  }

  if (error && !backlog) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="text-center max-w-md p-8 bg-white rounded-3xl border-2 border-slate-200 shadow-xl">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Ops, algo salió mal</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90 rounded-xl">
            Reintentar Carga
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header - Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
              className="rounded-full hover:bg-slate-100"
            >
              <ArrowLeft size={20} />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-black tracking-widest px-2">
                  Sprint Backlog AI
                </Badge>
                <span className="text-slate-300 text-xs">/</span>
                <span className="text-slate-500 text-xs font-bold uppercase tracking-tighter">{plan?.product_name}</span>
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Laboratorio de Historias y Tareas
                {isSaving && <Loader2 size={16} className="animate-spin text-slate-400" />}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => handleGenerate(plan!)}
              disabled={isGenerating}
              className="rounded-xl border-2 border-slate-200 font-bold hover:bg-slate-50 flex items-center gap-2"
            >
              <Sparkles size={16} className={isGenerating ? "animate-spin text-primary" : "text-primary"} />
              Regenerar con IA
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isGenerating}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-900/20 px-6 flex items-center gap-2"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Sprint Context */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-24">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Configuración del Sprint</h3>
            
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 ml-1">Nombre del Sprint</label>
                <Input 
                  value={backlog?.sprint_nombre || ""} 
                  onChange={(e) => setBacklog(b => b ? { ...b, sprint_nombre: e.target.value } : null)}
                  className="rounded-xl border-slate-200 font-bold focus:ring-primary/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 ml-1">Objetivo del Sprint</label>
                <textarea 
                  rows={4}
                  value={backlog?.objetivo_sprint || ""} 
                  onChange={(e) => setBacklog(b => b ? { ...b, objetivo_sprint: e.target.value } : null)}
                  className="w-full rounded-xl border-slate-200 border p-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
                  placeholder="Ej: Mejorar la tasa de éxito en el flujo de registro..."
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
                <Button 
                  variant="ghost" 
                  onClick={handleExportMarkdown}
                  className="justify-start gap-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl font-bold"
                >
                  <FileText size={16} />
                  <span>Exportar Markdown</span>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={handleExportPDF}
                  className="justify-start gap-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl font-bold"
                >
                  <Zap size={16} className="text-amber-500" />
                  <span>Exportar PDF</span>
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate(-1)}
                  className="justify-start gap-2 text-slate-500 hover:text-primary hover:bg-primary/5 rounded-xl font-bold"
                >
                  <LayoutDashboard size={16} />
                  <span>Regresar</span>
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Editor Area */}
        <section className="lg:col-span-3 space-y-6">
          {isGenerating ? (
            <div className="h-[600px] bg-white rounded-3xl border-2 border-dashed border-primary/20 flex flex-col items-center justify-center p-12 text-center">
              <div className="h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 animate-bounce">
                <Sparkles size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Procesando hallazgos...</h2>
              <p className="text-slate-500 font-medium max-w-sm">Nuestra IA está traduciendo tus hallazgos de usabilidad en historias de usuario y tareas técnicas accionables.</p>
              
              <div className="mt-8 w-64 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-[shimmer_2s_infinite] w-full origin-left" />
              </div>
            </div>
          ) : backlog ? (
            <>
              {/* Tabs Selection */}
              <div className="flex items-center gap-1 bg-slate-200/50 p-1.5 rounded-2xl w-max border border-slate-200">
                <button
                  onClick={() => setActiveTab("stories")}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === "stories" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <Ticket size={16} />
                  Historias de Usuario
                  <Badge className="bg-primary/10 text-primary border-none ml-1">{backlog.historias_usuario.length}</Badge>
                </button>
                <button
                  onClick={() => setActiveTab("tasks")}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === "tasks" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <Zap size={16} />
                  Tareas Técnicas
                  <Badge className="bg-slate-400/10 text-slate-500 border-none ml-1">{backlog.tareas_tecnicas.length}</Badge>
                </button>
              </div>

              {/* List Content */}
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === "stories" ? (
                  <>
                    {backlog.historias_usuario.map((story) => (
                      <div 
                        key={story.id} 
                        className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
                      >
                        {/* ... (story content remains same) */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md uppercase tracking-widest">{story.id}</span>
                              <Input 
                                value={story.titulo} 
                                onChange={(e) => updateStory(story.id, "titulo", e.target.value)}
                                className="border-none bg-transparent p-0 h-auto text-lg font-black text-slate-900 focus-visible:ring-0 placeholder:text-slate-300 flex-1"
                                placeholder="Título de la historia..."
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveStory(story.id)}
                                className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Eliminar historia"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                            <textarea 
                              rows={2}
                              value={story.descripcion} 
                              onChange={(e) => updateStory(story.id, "descripcion", e.target.value)}
                              className="w-full border-none bg-transparent p-0 h-auto text-sm font-medium text-slate-600 focus:outline-none resize-none"
                              placeholder="Descripción de la historia..."
                            />
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Select 
                              value={story.prioridad} 
                              onValueChange={(val) => updateStory(story.id, "prioridad", val)}
                            >
                              <SelectTrigger className={`h-8 w-24 rounded-full border-none font-bold text-[10px] uppercase tracking-widest ${
                                story.prioridad === 'Alta' ? 'bg-red-50 text-red-600' : 
                                story.prioridad === 'Media' ? 'bg-amber-50 text-amber-600' : 
                                'bg-blue-50 text-blue-600'
                              }`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Alta">Alta</SelectItem>
                                <SelectItem value="Media">Media</SelectItem>
                                <SelectItem value="Baja">Baja</SelectItem>
                              </SelectContent>
                            </Select>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                              <Clock size={10} />
                              {story.esfuerzo}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-slate-50 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                              <CheckCircle2 size={12} className="text-emerald-500" />
                              Criterios de Aceptación
                            </h4>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleAddAC(story.id)}
                              className="h-6 px-2 text-[10px] font-bold text-primary hover:bg-primary/5 rounded-md"
                            >
                              <Plus size={10} className="mr-1" /> Añadir AC
                            </Button>
                          </div>
                          <div className="space-y-2">
                            {story.criterio_aceptacion.map((ac, acIdx) => (
                              <div key={acIdx} className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-transparent hover:border-slate-200 transition-all group/ac">
                                <div className="h-5 w-5 rounded-md bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400">
                                  {acIdx + 1}
                                </div>
                                <Input 
                                  value={ac}
                                  onChange={(e) => {
                                    const newAC = [...story.criterio_aceptacion];
                                    newAC[acIdx] = e.target.value;
                                    updateStory(story.id, "criterio_aceptacion", newAC);
                                  }}
                                  className="border-none bg-transparent h-6 text-xs font-bold text-slate-700 focus-visible:ring-0 p-0 flex-1"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveAC(story.id, acIdx)}
                                  className="h-6 w-6 opacity-0 group-hover/ac:opacity-100 text-slate-300 hover:text-red-500 transition-all"
                                >
                                  <Trash2 size={12} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      onClick={handleAddStory}
                      className="w-full h-20 border-2 border-dashed border-slate-200 rounded-3xl hover:border-primary/20 hover:bg-primary/5 text-slate-400 hover:text-primary transition-all flex flex-col items-center justify-center gap-1 group"
                    >
                      <Plus className="group-hover:rotate-90 transition-transform" />
                      <span className="text-xs font-bold uppercase tracking-widest">Añadir Historia de Usuario</span>
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {backlog.tareas_tecnicas.map((task) => (
                      <div key={task.id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:border-primary/20 transition-all group relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveTask(task.id)}
                          className="absolute top-4 right-4 h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </Button>
                        <div className="flex items-start justify-between mb-3 pr-8">
                          <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md uppercase tracking-widest">{task.id}</span>
                          <div className="flex items-center gap-1">
                            <Clock size={10} className="text-slate-400" />
                            <Input 
                              type="number"
                              value={task.estimado_horas}
                              onChange={(e) => updateTask(task.id, "estimado_horas", parseInt(e.target.value) || 0)}
                              className="w-12 h-6 p-1 text-[10px] font-bold border-none bg-slate-50 rounded-md focus-visible:ring-0"
                            />
                            <span className="text-[10px] font-bold text-slate-400">h</span>
                          </div>
                        </div>
                        <Input 
                          value={task.descripcion} 
                          onChange={(e) => updateTask(task.id, "descripcion", e.target.value)}
                          className="border-none bg-transparent p-0 h-auto text-sm font-bold text-slate-800 focus-visible:ring-0 w-full"
                        />
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      onClick={handleAddTask}
                      className="h-full min-h-[100px] border-2 border-dashed border-slate-200 rounded-3xl hover:border-primary/20 hover:bg-primary/5 text-slate-400 hover:text-primary transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                      <Plus className="group-hover:rotate-90 transition-transform" />
                      <span className="text-xs font-bold uppercase tracking-widest">Añadir Tarea</span>
                    </Button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-[600px] flex items-center justify-center">
               <p className="text-slate-400 font-bold uppercase tracking-widest">Sin datos de backlog</p>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-auto px-6 py-8 border-t border-slate-200/60 bg-white flex items-center justify-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Laboratorio de Inteligencia de Diseño IHC</p>
      </footer>
    </div>
  );
}
