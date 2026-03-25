import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useTestPlan } from "../../context/TestPlanContext";

interface NavigationButtonsProps {
  currentStep: 'plan' | 'guia' | 'registro' | 'sintesis';
}

const steps = [
  { id: 'dashboard', path: '/' },
  { id: 'plan', path: '/plan' },
  { id: 'guia', path: '/guia' },
  { id: 'registro', path: '/registro' },
  { id: 'sintesis', path: '/sintesis' },
];

export function NavigationButtons({ currentStep }: NavigationButtonsProps) {
  const navigate = useNavigate();
  const { isStepComplete } = useTestPlan();
  const [showWarning, setShowWarning] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentIndex = steps.findIndex(s => s.id === currentStep);
  const prevStep = steps[currentIndex - 1];
  const nextStep = steps[currentIndex + 1];

  const isCurrentComplete = isStepComplete(currentStep);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 mt-10 border-t border-slate-200">
      <div className="w-full sm:w-auto flex justify-start">
        {prevStep && (
          <Button
            variant="ghost"
            onClick={() => handleNavigation(prevStep.path)}
            className="text-slate-700 hover:text-primary hover:bg-primary/10 flex items-center gap-2 px-6 py-6 rounded-xl transition-all font-semibold"
          >
            <ChevronLeft size={20} aria-hidden="true" />
            <div className="flex flex-col items-start text-left">
              <span className="text-xs uppercase font-bold text-slate-500">Paso Anterior</span>
              <span className="font-bold uppercase tracking-tight">Regresar</span>
            </div>
          </Button>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 w-full sm:w-auto relative">
        {!isCurrentComplete && currentStep !== 'guia' && showWarning && (
          <div 
            role="alert"
            className="absolute -top-14 flex items-center gap-2 text-red-900 bg-red-50 px-4 py-2 rounded-xl border-2 border-red-200 shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <AlertCircle size={16} className="shrink-0 text-red-600" aria-hidden="true" />
            <span className="text-xs font-bold whitespace-nowrap">Completa los campos obligatorios para continuar</span>
          </div>
        )}
        
        {nextStep && (
          <div 
            className="w-full sm:w-auto"
            onMouseEnter={() => !isCurrentComplete && setShowWarning(true)}
            onMouseLeave={() => setShowWarning(false)}
          >
            <Button
              disabled={!isCurrentComplete && currentStep !== 'guia'}
              onClick={() => handleNavigation(nextStep.path)}
              className={`w-full sm:w-auto flex items-center gap-4 px-10 py-8 rounded-2xl transition-all shadow-md group ${
                isCurrentComplete 
                  ? "bg-primary hover:bg-primary/90 text-white font-semibold hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/20" 
                  : "bg-slate-100 text-slate-500 border border-slate-300 cursor-not-allowed opacity-80"
              }`}
            >
              <div className="flex flex-col items-end text-right">
                <span className="text-xs uppercase font-bold opacity-90">Siguiente Paso</span>
                <span className="text-lg font-bold uppercase tracking-tight">Continuar</span>
              </div>
              <div className={`p-2 rounded-lg ${isCurrentComplete ? 'bg-white/20' : 'bg-slate-300'} transition-colors group-hover:translate-x-1`}>
                <ChevronRight size={24} aria-hidden="true" />
              </div>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
