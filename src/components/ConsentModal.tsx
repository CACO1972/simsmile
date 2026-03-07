import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Eye, Trash2, Lock, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

interface ConsentModalProps {
  open: boolean;
  onAccept: () => void;
  onReject: () => void;
}

export const ConsentModal = ({ open, onAccept, onReject }: ConsentModalProps) => {
  const [checked, setChecked]     = useState(false);
  const [expanded, setExpanded]   = useState(false);

  const handleAccept = () => {
    if (!checked) return;
    // Guardar consentimiento con timestamp para registro
    localStorage.setItem('simsmile_consent', JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
      version: "1.0",
      law: "Ley 19.628 Chile"
    }));
    onAccept();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onReject(); }}>
      <DialogContent className="max-w-md mx-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold text-left leading-tight">
              Uso de tu imagen facial
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Main points */}
          <div className="space-y-3">
            <InfoRow icon={<Eye className="w-4 h-4 text-primary" />} title="Qué capturamos">
              Tu imagen facial y puntos de referencia biométricos (landmarks) para generar la simulación de sonrisa.
            </InfoRow>
            <InfoRow icon={<Lock className="w-4 h-4 text-primary" />} title="Para qué">
              Exclusivamente para el análisis estético y simulación dental. No se usa para identificación, publicidad ni perfilamiento.
            </InfoRow>
            <InfoRow icon={<Trash2 className="w-4 h-4 text-primary" />} title="Almacenamiento">
              Tu imagen se procesa en tiempo real y <strong>no se almacena de forma permanente</strong> en nuestros servidores sin tu autorización explícita.
            </InfoRow>
          </div>

          {/* Expandable legal detail */}
          <div className="border border-border/50 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm text-muted-foreground hover:bg-muted/30 transition-colors"
            >
              <span className="font-medium">Información legal completa (Ley 19.628)</span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="px-4 pb-4 text-xs text-muted-foreground space-y-2 leading-relaxed border-t border-border/50"
              >
                <p className="pt-3">
                  De conformidad con la <strong>Ley N° 19.628 sobre Protección de la Vida Privada</strong> de la República de Chile y sus modificaciones, SimSmile — operado por <strong>Clínica Miró SpA</strong> (Av. Nueva Providencia 2214 Of. 189, Providencia, Santiago) — informa:
                </p>
                <p>
                  <strong>Responsable del tratamiento:</strong> Clínica Miró SpA · RUT: [RUT Clínica] · contacto@clinicamiro.cl
                </p>
                <p>
                  <strong>Datos tratados:</strong> Imagen facial digitalizada y coordenadas biométricas de referencia (datos sensibles según Art. 2 letra g) de la Ley 19.628).
                </p>
                <p>
                  <strong>Base legal:</strong> Consentimiento explícito del titular (Art. 4 Ley 19.628). Sin este consentimiento no se realiza el procesamiento.
                </p>
                <p>
                  <strong>Finalidad:</strong> Análisis estético facial y simulación digital de tratamientos dentales con fines informativos. No se realizará tratamiento para otras finalidades sin nuevo consentimiento.
                </p>
                <p>
                  <strong>Conservación:</strong> Los datos biométricos se procesan en memoria durante la sesión activa. Las imágenes de simulación generadas se conservan únicamente si el usuario adquiere el reporte (máximo 90 días).
                </p>
                <p>
                  <strong>Destinatarios:</strong> Proveedores tecnológicos bajo acuerdo de confidencialidad (procesamiento de imágenes con IA). No se ceden datos a terceros con fines comerciales.
                </p>
                <p>
                  <strong>Derechos:</strong> Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición escribiendo a contacto@clinicamiro.cl. Tienes derecho a retirar tu consentimiento en cualquier momento sin que ello afecte la licitud del tratamiento previo.
                </p>
                <p>
                  <strong>Autoridad de control:</strong> Consejo para la Transparencia (www.consejotransparencia.cl).
                </p>
              </motion.div>
            )}
          </div>

          {/* Checkbox consent */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                checked
                  ? "bg-primary border-primary"
                  : "border-border group-hover:border-primary/50"
              }`}>
                {checked && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-muted-foreground leading-relaxed">
              He leído y acepto el uso de mi imagen facial para la simulación de sonrisa, conforme a la{" "}
              <strong className="text-foreground">Ley 19.628</strong> de protección de datos personales de Chile.
            </span>
          </label>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <Button
              variant="ghost"
              onClick={onReject}
              className="flex-1 text-muted-foreground"
            >
              No acepto
            </Button>
            <Button
              onClick={handleAccept}
              disabled={!checked}
              className="flex-1 bg-gradient-to-r from-primary to-accent text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Acepto y continuar
            </Button>
          </div>

          <p className="text-[10px] text-muted-foreground/60 text-center">
            Clínica Miró SpA · Av. Nueva Providencia 2214 Of. 189, Providencia · contacto@clinicamiro.cl
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

function InfoRow({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{children}</p>
      </div>
    </div>
  );
}
