import { useState } from "react";
import { supabase } from "../../infrastructure/config/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Loader2, 
  LayoutDashboard,
  Gem,
  AlertCircle
} from "lucide-react";

export function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      setError(err.message || "Error al autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Modal de Éxito */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200">
            <div className="p-8 text-center space-y-6">
              <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Mail size={40} className="animate-bounce" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">¡Revisá tu Email!</h3>
                <p className="text-sm font-semibold text-slate-600 leading-relaxed">
                  Enviamos un enlace de confirmación a <span className="text-primary">{email}</span>. Verificá tu bandeja de entrada para activar tu cuenta de investigador.
                </p>
              </div>
              <Button 
                onClick={() => {
                  setShowSuccessModal(false);
                  setMode("login");
                }}
                className="w-full py-6 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-lg active:scale-95"
              >
                ENTENDIDO, VOLVER AL LOGIN
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center space-y-4">
          <div className="mx-auto h-20 w-20 bg-primary rounded-3xl flex items-center justify-center shadow-xl shadow-primary/20 rotate-3">
            <LayoutDashboard className="text-white" size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
              Usability <span className="text-primary">Dashboard</span>
            </h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">
              Consola de Auditoría IHC
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <ShieldCheck size={120} className="text-slate-900" />
          </div>

          <form onSubmit={handleAuth} className="space-y-6 relative z-10">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                   <Mail size={12} /> Email de Investigador
                </label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investigador@dominio.com"
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                   <Lock size={12} /> Contraseña
                </label>
                <Input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all font-medium"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in slide-in-from-top-2">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-xs font-bold leading-tight">{error}</p>
              </div>
            )}

            <Button 
              disabled={loading}
              className="w-full py-7 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 text-lg"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                mode === "login" ? "INICIAR SESIÓN" : "CREAR CUENTA"
              )}
            </Button>

            <div className="pt-4 border-t border-slate-100 text-center">
              <button 
                type="button"
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-xs font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest"
              >
                {mode === "login" ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Ingresa"}
              </button>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-400 bg-slate-100/50 py-3 rounded-full border border-slate-200/50">
          <Gem size={14} className="text-primary" />
          IHC: Entorno de Datos Protegido
        </div>
      </div>
    </div>
  );
}
