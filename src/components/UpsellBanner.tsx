import { Button } from "@/components/ui/button";
import { Gift, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface UpsellBannerProps {
  remainingCredits: number;
  onUpgrade: () => void;
}

export const UpsellBanner = ({ remainingCredits, onUpgrade }: UpsellBannerProps) => {
  if (remainingCredits > 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
    >
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/90 to-accent/90 backdrop-blur-lg rounded-2xl p-4 shadow-2xl border border-white/20">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-pulse" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {remainingCredits === 0 ? (
                <Clock className="w-5 h-5 text-white" />
              ) : (
                <Gift className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h4 className="font-bold text-white">
                {remainingCredits === 0 
                  ? '¡Sin créditos!' 
                  : '¡Última simulación!'}
              </h4>
              <p className="text-white/80 text-sm">
                {remainingCredits === 0
                  ? 'Compra más para continuar'
                  : 'Aprovecha el 33% de descuento'}
              </p>
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-white/60 text-sm line-through">$14.990</span>
                <span className="text-white font-bold text-lg ml-2">$9.990</span>
              </div>
              <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                10 simulaciones
              </span>
            </div>
          </div>

          <Button
            onClick={onUpgrade}
            className="w-full bg-white text-primary hover:bg-white/90 font-semibold group"
          >
            Obtener más créditos
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default UpsellBanner;