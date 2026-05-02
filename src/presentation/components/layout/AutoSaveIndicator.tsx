import { useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

interface AutoSaveIndicatorProps {
  isDraftSaved: boolean;
  lastSaved: Date | null;
  className?: string;
}

export function AutoSaveIndicator({ isDraftSaved, lastSaved, className = "" }: AutoSaveIndicatorProps) {
  const [showSaved, setShowSaved] = useState(false);

  // Mostrar "Guardado" cuando se guarda
  useEffect(() => {
    if (isDraftSaved && lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isDraftSaved, lastSaved]);

  // Formatear tiempo relativo
  const getTimeLabel = () => {
    if (!lastSaved) return "";

    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Hace un momento";
    if (diffMins < 5) return `Guardado hace ${diffMins} min`;
    return `Guardado a las ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };

  // Estado: guardando (no isDraftSaved)
  if (!isDraftSaved) {
    return (
      <div className={`flex items-center gap-2 text-xs font-medium text-amber-600 ${className}`}>
        <Loader2 size={14} className="animate-spin" />
        <span>Guardando...</span>
      </div>
    );
  }

  // Estado: guardado reciente (mostrar por 3 segundos)
  if (showSaved) {
    return (
      <div className={`flex items-center gap-2 text-xs font-medium text-emerald-600 ${className}`}>
        <CheckCircle2 size={14} />
        <span>Guardado</span>
      </div>
    );
  }

  // Estado: idle con timestamp
  if (lastSaved) {
    return (
      <div className={`flex items-center gap-2 text-xs font-medium text-slate-500 ${className}`}>
        <CheckCircle2 size={14} className="text-slate-400" />
        <span>{getTimeLabel()}</span>
      </div>
    );
  }

  return null;
}
