import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  ClipboardList, 
  TrendingUp, 
  Users, 
  ShieldCheck, 
  Zap,
  ArrowRight,
  Gem,
  BookOpen,
  BarChart3
} from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: ClipboardList,
      title: "Planificación Estructurada",
      description: "Definí escenarios, métricas y criterios de éxito para cada sesión de evaluación."
    },
    {
      icon: Users,
      title: "Registro de Observaciones",
      description: "Capturá tiempos, errores y comentarios de los participantes en tiempo real."
    },
    {
      icon: TrendingUp,
      title: "Métricas ISO 9241-11",
      description: "Calculá efectividad, eficiencia y satisfacción siguiendo estándares internacionales."
    },
    {
      icon: BarChart3,
      title: "Síntesis de Hallazgos",
      description: "Transformá observaciones crudas en hallazgos accionables con severidad y prioridad."
    },
    {
      icon: ShieldCheck,
      title: "Datos Protegidos",
      description: "Autenticación segura y almacenamiento en la nube con Supabase."
    },
    {
      icon: Zap,
      title: "Auto-guardado",
      description: "Tu progreso se guarda automáticamente. Nunca perdés datos."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="px-6 py-6 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <LayoutDashboard className="text-white" size={22} />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight">Usability</span>
              <span className="text-lg font-black text-primary tracking-tight">Dashboard</span>
            </div>
          </div>
          <Button 
            onClick={() => navigate("/login")}
            className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-5 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            Iniciar Sesión
            <ArrowRight size={18} />
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-accent/30 to-primary/20" />
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          
          <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left: Content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
                  <BookOpen size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Metodología IHC</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Evaluaciones de <br />
                  <span className="text-primary">usabilidad</span> guiadas <br />
                  por datos
                </h1>
                
                <p className="text-lg md:text-xl text-slate-600 font-medium leading-relaxed max-w-xl">
                  Plataforma profesional para planificar, ejecutar y documentar tests de usabilidad 
                  siguiendo estándares ISO 9241-11. Optimizá la experiencia de tus productos digitales.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => navigate("/login")}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-7 rounded-2xl text-lg shadow-xl shadow-primary/20 transition-all active:scale-95 group"
                  >
                    Comenzar Ahora
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <div className="flex items-center gap-3 px-6 py-4 bg-slate-100 rounded-2xl border border-slate-200">
                    <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <ShieldCheck size={20} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Entorno Seguro</p>
                      <p className="text-sm font-semibold text-slate-900">Datos encriptados</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl transform rotate-3" />
                <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl p-8 space-y-6">
                  {/* Mock Dashboard Preview */}
                  <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-emerald-400" />
                    <span className="ml-2 text-xs font-bold text-slate-400 uppercase tracking-widest">Dashboard Preview</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-emerald-600" />
                        <span className="text-xs font-bold text-slate-500 uppercase">Efectividad</span>
                      </div>
                      <p className="text-2xl font-black text-slate-900">92%</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} className="text-amber-600" />
                        <span className="text-xs font-bold text-slate-500 uppercase">Eficiencia</span>
                      </div>
                      <p className="text-2xl font-black text-slate-900">4.2s</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">Hallazgos Críticos</span>
                      <span className="text-xs font-bold text-primary">3 nuevos</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-primary/20 rounded-full w-full" />
                      <div className="h-2 bg-primary/20 rounded-full w-3/4" />
                      <div className="h-2 bg-primary/20 rounded-full w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-white border-y border-slate-200/60 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                Todo lo que necesitás para tu investigación
              </h2>
              <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">
                Un flujo de trabajo completo: desde la planificación hasta la síntesis de resultados, 
                todo en una sola plataforma.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div 
                  key={index}
                  className="group p-6 bg-slate-50 rounded-2xl border border-slate-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
                >
                  <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon size={24} className="text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-6">
            <div className="relative bg-slate-900 rounded-3xl overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary" />
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
              
              <div className="relative p-12 md:p-16 text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 px-4 py-2 rounded-full mb-6">
                  <Gem size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Plataforma IHC</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4">
                  Preparado para comenzar?
                </h2>
                <p className="text-lg text-slate-300 font-medium max-w-xl mx-auto mb-8">
                  Creá tu cuenta gratis y empezá a planificar tu primera evaluación de usabilidad en minutos.
                </p>
                <Button 
                  onClick={() => navigate("/login")}
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-10 py-7 rounded-2xl text-lg shadow-xl transition-all active:scale-95"
                >
                  Comenzar Ahora
                  <ArrowRight size={20} />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <LayoutDashboard size={16} className="text-primary" />
              </div>
              <span className="text-sm font-semibold text-slate-600">Usability Dashboard</span>
            </div>
            <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
              <span>Plataforma de evaluación heurística IHC</span>
              <span className="hidden md:inline">•</span>
              <span>Estándares ISO 9241-11</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <ShieldCheck size={14} />
              <span>Datos protegidos</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}