import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, LayoutDashboard, ArrowRight } from "lucide-react";

interface SprintBacklogDecisionModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function SprintBacklogDecisionModal({
  open,
  onConfirm,
  onCancel,
}: SprintBacklogDecisionModalProps) {
  return (
    <Dialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <DialogContent className="sm:max-w-md rounded-3xl border-2 border-primary/20 shadow-2xl">
        <DialogHeader className="flex flex-col items-center text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            <Sparkles size={32} />
          </div>
          <DialogTitle className="text-2xl font-bold text-slate-900">
            ¡Test de Usabilidad Finalizado!
          </DialogTitle>
          <DialogDescription className="text-slate-600 font-medium">
            Tus hallazgos han sido consolidados con éxito. ¿Deseas que la IA los transforme en un **Sprint Backlog** accionable ahora mismo?
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-3 py-4">
          <Button
            onClick={onConfirm}
            className="group h-20 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white flex flex-col items-center justify-center gap-1 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-900/20"
          >
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <span className="text-lg font-bold">Generar Backlog Ahora</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <span className="text-[10px] font-medium opacity-70 uppercase tracking-widest">Recomendado para agilidad</span>
          </Button>

          <Button
            variant="outline"
            onClick={onCancel}
            className="h-16 rounded-2xl border-2 border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-3 font-bold transition-all"
          >
            <LayoutDashboard size={20} />
            <span>Ir al Dashboard</span>
          </Button>
        </div>

        <DialogFooter className="sm:justify-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
            Podrás generarlo más tarde desde el detalle del plan
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
