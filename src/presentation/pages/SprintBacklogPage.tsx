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
      
      md += `\n**Tareas Técnicas:**\n`;
      md += `| ID | Descripción | Estimado |\n`;
      md += `|----|-------------|----------|\n`;
      us.tareas_tecnicas.forEach(t => {
        md += `| ${t.id} | ${t.descripcion} | ${t.estimado_horas}h |\n`;
      });
      
      md += `\n---\n\n`;
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
      if (currentY > 220) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFillColor(248, 250, 252); // slate-50
      // Calculate story height dynamically
      const storyDescLines = doc.splitTextToSize(us.descripcion, pageWidth - 45);
      const acText = us.criterio_aceptacion.join(" | ");
      const acLines = doc.splitTextToSize(`AC: ${acText}`, pageWidth - 55);
      const storyHeight = 35 + (storyDescLines.length * 5) + (acLines.length * 5);
      
      doc.roundedRect(15, currentY - 5, pageWidth - 30, storyHeight, 3, 3, 'F');
      
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`[${us.id}] ${us.titulo}`, 20, currentY + 5);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`Prioridad: ${us.prioridad} | Esfuerzo: ${us.esfuerzo} | Tipo: ${us.tipo}`, 20, currentY + 12);

      doc.setTextColor(51, 65, 85);
      doc.text(storyDescLines, 20, currentY + 20);

      let acY = currentY + 20 + (storyDescLines.length * 5) + 5;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Criterios de Aceptación:", 20, acY);
      doc.setFont("helvetica", "normal");
      
      us.criterio_aceptacion.forEach((ac, index) => {
        const bullet = `• ${ac}`;
        const bulletLines = doc.splitTextToSize(bullet, pageWidth - 55);
        doc.text(bulletLines, 25, acY + 5 + (index * 5));
        acY += (bulletLines.length * 4);
      });

      // Technical Tasks for this US
      currentY = acY + 10;
      autoTable(doc, {
        startY: currentY,
        head: [['ID', 'Tarea Técnica (Desglose de US)', 'Horas']],
        body: us.tareas_tecnicas.map(t => [t.id, t.descripcion, `${t.estimado_horas}h`]),
        headStyles: { fillColor: [71, 85, 105] }, // slate-600 for sub-tables
        styles: { fontSize: 8 },
        margin: { left: 20, right: 20 },
        theme: 'striped'
      });

      // @ts-ignore
      currentY = doc.lastAutoTable.finalY + 15;
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

  const updateStory = (id: string, field: keyof BacklogUserStory, value: any) => {
    if (!backlog) return;
    const newStories = backlog.historias_usuario.map(s => 
      s.id === id ? { ...s, [field]: value } as BacklogUserStory : s
    );
    setBacklog({ ...backlog, historias_usuario: newStories });
  };

  const updateNestedTask = (storyId: string, taskId: string, field: keyof BacklogTask, value: any) => {
    if (!backlog) return;
    const newStories = backlog.historias_usuario.map(s => {
      if (s.id === storyId) {
        const newTasks = s.tareas_tecnicas.map(t => 
          t.id === taskId ? { ...t, [field]: value } : t
        );
        return { ...s, tareas_tecnicas: newTasks };
      }
      return s;
    });
    setBacklog({ ...backlog, historias_usuario: newStories });
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
      tipo: "feature",
      tareas_tecnicas: [{ id: `T${newId.slice(2)}.1`, descripcion: "Tarea inicial", estimado_horas: 1 }]
    };
    setBacklog({
      ...backlog,
      historias_usuario: [...backlog.historias_usuario, newStory]
    });
  };

  const handleRemoveStory = (id: string) => {
    if (!backlog) return;
    setBacklog({
      ...backlog,
      historias_usuario: backlog.historias_usuario.filter(s => s.id !== id)
    });
  };

  const handleAddNestedTask = (storyId: string) => {
    if (!backlog) return;
    const newStories = backlog.historias_usuario.map(s => {
      if (s.id === storyId) {
        const storyNum = s.id.replace(/\D/g, '');
        const newTaskId = `T${storyNum}.${s.tareas_tecnicas.length + 1}`;
        return {
          ...s,
          tareas_tecnicas: [...s.tareas_tecnicas, { id: newTaskId, descripcion: "Nueva tarea técnica", estimado_horas: 1 }]
        };
      }
      return s;
    });
    setBacklog({ ...backlog, historias_usuario: newStories });
  };

  const handleRemoveNestedTask = (storyId: string, taskId: string) => {
    if (!backlog) return;
    const newStories = backlog.historias_usuario.map(s => {
      if (s.id === storyId) {
        return { ...s, tareas_tecnicas: s.tareas_tecnicas.filter(t => t.id !== taskId) };
      }
      return s;
    });
    setBacklog({ ...backlog, historias_usuario: newStories });
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

  const consolidatedTasks = useMemo(() => {
    if (!backlog) return [];
    return backlog.historias_usuario.flatMap(s => 
      s.tareas_tecnicas.map(t => ({ ...t, parentStoryId: s.id, parentStoryTitle: s.titulo }))
    );
  }, [backlog]);

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
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
              <ArrowLeft size={20} />
            </Button>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-black tracking-widest px-2">
                  Sprint Backlog AI (v2 Nested)
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
              className="rounded-xl border-2 border-slate-200 font-bold"
            >
              <Sparkles size={16} className={isGenerating ? "animate-spin text-primary mr-2" : "text-primary mr-2"} />
              Regenerar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isGenerating}
              className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
              Guardar Cambios
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-24 space-y-5">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Configuración</h3>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Nombre del Sprint</label>
              <Input 
                value={backlog?.sprint_nombre || ""} 
                onChange={(e) => setBacklog(b => b ? { ...b, sprint_nombre: e.target.value } : null)}
                className="rounded-xl border-slate-200 font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600">Objetivo</label>
              <textarea 
                rows={4}
                value={backlog?.objetivo_sprint || ""} 
                onChange={(e) => setBacklog(b => b ? { ...b, objetivo_sprint: e.target.value } : null)}
                className="w-full rounded-xl border-slate-200 border p-3 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Button variant="ghost" onClick={handleExportMarkdown} className="justify-start gap-2 text-slate-500 hover:text-primary font-bold">
                <FileText size={16} /> Exportar Markdown
              </Button>
              <Button variant="ghost" onClick={handleExportPDF} className="justify-start gap-2 text-slate-500 hover:text-primary font-bold">
                <Zap size={16} className="text-amber-500" /> Exportar PDF
              </Button>
              <Button variant="ghost" onClick={() => navigate(-1)} className="justify-start gap-2 text-slate-500 hover:text-primary font-bold">
                <LayoutDashboard size={16} /> Regresar
              </Button>
            </div>
          </div>
        </aside>

        {/* Editor Area */}
        <section className="lg:col-span-3 space-y-6">
          {isGenerating ? (
             <div className="h-[500px] flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="font-bold text-slate-400 uppercase tracking-widest">IA Generando Backlog Anidado...</p>
             </div>
          ) : backlog ? (
            <>
              {/* Tabs */}
              <div className="flex items-center gap-1 bg-slate-200/50 p-1.5 rounded-2xl w-max border border-slate-200">
                <button
                  onClick={() => setActiveTab("stories")}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === "stories" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <Ticket size={16} /> Historias de Usuario
                </button>
                <button
                  onClick={() => setActiveTab("tasks")}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${activeTab === "tasks" ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  <Zap size={16} /> Vista Consolidada (Tareas)
                </button>
              </div>

              {activeTab === "stories" ? (
                <div className="space-y-6">
                  {backlog.historias_usuario.map((story) => (
                    <div key={story.id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">
                      {/* Story Header */}
                      <div className="flex items-start justify-between gap-4 mb-6">
                        <div className="flex-1 space-y-2">
                           <div className="flex items-center gap-3">
                              <Badge className="bg-primary/10 text-primary">{story.id}</Badge>
                              <Input 
                                value={story.titulo} 
                                onChange={(e) => updateStory(story.id, "titulo", e.target.value)}
                                className="border-none p-0 h-auto text-lg font-black text-slate-900 focus-visible:ring-0 flex-1"
                              />
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveStory(story.id)} className="text-slate-300 hover:text-red-500">
                                <Trash2 size={16} />
                              </Button>
                           </div>
                           <textarea 
                             rows={2}
                             value={story.descripcion}
                             onChange={(e) => updateStory(story.id, "descripcion", e.target.value)}
                             className="w-full border-none bg-transparent p-0 text-sm font-medium text-slate-600 focus:outline-none resize-none"
                           />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <Select value={story.prioridad} onValueChange={(val) => updateStory(story.id, "prioridad", val)}>
                              <SelectTrigger className="h-8 w-24 rounded-full border-none font-bold text-[10px] uppercase bg-slate-50">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Alta">Alta</SelectItem>
                                <SelectItem value="Media">Media</SelectItem>
                                <SelectItem value="Baja">Baja</SelectItem>
                              </SelectContent>
                           </Select>
                           <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-500">
                              <Clock size={10} className="mr-1" />
                              {story.tareas_tecnicas.reduce((acc, t) => acc + t.estimado_horas, 0)}h totales
                           </Badge>
                        </div>
                      </div>

                      {/* Acceptance Criteria */}
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <CheckCircle2 size={12} className="text-emerald-500" /> Criterios de Aceptación
                          </h4>
                          <Button variant="ghost" size="sm" onClick={() => handleAddAC(story.id)} className="h-6 text-[10px] font-bold text-primary">
                            <Plus size={10} className="mr-1" /> Añadir AC
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {story.criterio_aceptacion.map((ac, idx) => (
                            <div key={idx} className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-xl group/ac border border-transparent hover:border-slate-100">
                               <Input 
                                 value={ac} 
                                 onChange={(e) => {
                                    const newAC = [...story.criterio_aceptacion];
                                    newAC[idx] = e.target.value;
                                    updateStory(story.id, "criterio_aceptacion", newAC);
                                 }}
                                 className="border-none bg-transparent h-6 text-xs font-medium text-slate-700 p-0 flex-1 focus-visible:ring-0"
                               />
                               <Button variant="ghost" size="icon" onClick={() => handleRemoveAC(story.id, idx)} className="h-6 w-6 opacity-0 group-hover/ac:opacity-100 text-slate-300 hover:text-red-400">
                                  <Trash2 size={12} />
                               </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Nested Technical Tasks */}
                      <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-4">
                         <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                               <Zap size={12} className="text-amber-500" /> Desglose Técnico (Tareas)
                            </h4>
                            <Button size="sm" variant="outline" onClick={() => handleAddNestedTask(story.id)} className="h-7 text-[10px] font-bold bg-white">
                               <Plus size={12} className="mr-1" /> Nueva Tarea
                            </Button>
                         </div>
                         <div className="grid grid-cols-1 gap-3">
                            {story.tareas_tecnicas.map((task) => (
                               <div key={task.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 group/task">
                                  <Badge variant="outline" className="text-[9px] bg-slate-50 border-none font-bold text-slate-400">{task.id}</Badge>
                                  <Input 
                                    value={task.descripcion}
                                    onChange={(e) => updateNestedTask(story.id, task.id, "descripcion", e.target.value)}
                                    className="border-none p-0 h-auto text-xs font-bold text-slate-800 flex-1 focus-visible:ring-0"
                                  />
                                  <div className="flex items-center gap-2">
                                     <Input 
                                       type="number"
                                       value={task.estimado_horas}
                                       onChange={(e) => updateNestedTask(story.id, task.id, "estimado_horas", parseInt(e.target.value) || 0)}
                                       className="w-12 h-7 text-[10px] font-bold text-center bg-slate-50 border-none rounded-md"
                                     />
                                     <span className="text-[10px] font-bold text-slate-400">h</span>
                                     <Button variant="ghost" size="icon" onClick={() => handleRemoveNestedTask(story.id, task.id)} className="h-7 w-7 opacity-0 group-hover/task:opacity-100 text-slate-300 hover:text-red-400">
                                        <Trash2 size={12} />
                                     </Button>
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" onClick={handleAddStory} className="w-full h-20 border-2 border-dashed border-slate-200 rounded-3xl hover:border-primary/20 text-slate-400 hover:text-primary font-bold uppercase tracking-widest gap-2">
                    <Plus /> Añadir Historia de Usuario
                  </Button>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-6">
                   <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
                         <Zap size={32} />
                      </div>
                      <h2 className="text-xl font-black text-slate-900">Vista de Consolidado Técnico</h2>
                      <p className="text-slate-500 text-sm max-w-md mx-auto">Aquí ves todas las tareas desglosadas por la IA para este sprint. La edición se realiza desde cada Historia de Usuario.</p>
                   </div>
                   <div className="grid grid-cols-1 gap-4 text-left">
                      {consolidatedTasks.map((task) => (
                         <div key={task.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group">
                            <div className="flex items-center gap-4">
                               <Badge className="bg-slate-200 text-slate-600 border-none">{task.id}</Badge>
                               <div>
                                  <p className="text-sm font-bold text-slate-800">{task.descripcion}</p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Origen: {task.parentStoryId} - {task.parentStoryTitle}</p>
                               </div>
                            </div>
                            <Badge variant="outline" className="font-bold border-slate-200 text-slate-500">
                               {task.estimado_horas}h
                            </Badge>
                         </div>
                      ))}
                   </div>
                </div>
              )}
            </>
          ) : (
            <div className="h-[400px] flex items-center justify-center">
               <p className="text-slate-400 font-bold uppercase tracking-widest">Sin datos de backlog</p>
            </div>
          )}
        </section>
      </main>

      <footer className="py-8 border-t border-slate-200/60 bg-white flex items-center justify-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Laboratorio de Inteligencia de Diseño IHC</p>
      </footer>
    </div>
  );
}
