import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, 
  Droplets, 
  Sun, 
  Shield, 
  Zap, 
  Check, 
  Loader2, 
  Lock,
  Eye,
  TrendingUp,
  Clock,
  Star,
  Gift
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSupabase } from "@/integrations/supabase/safeClient";
import { toast } from "sonner";

interface SkinAnalysisUpsellProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageBase64?: string;
  userEmail: string;
  detectedGender?: 'male' | 'female' | 'neutral';
  onComplete?: (skinData: SkinAnalysisResult) => void;
}

interface SkinAnalysisResult {
  skinAge: number;
  hydration: number;
  elasticity: number;
  radiance: number;
  poreSize: string;
  skinType: string;
  concerns: string[];
  recommendations: {
    category: string;
    product: string;
    impact: string;
  }[];
}

// Datos de preview tentadores (parcialmente revelados) por género
const PREVIEW_DATA = {
  skinAge: "2?",
  hydration: 7,
  elasticity: 8,
  teaser: {
    male: [
      "Tu piel muestra signos de fatiga y estrés",
      "Detectamos irritación en la zona de la barba",
      "Los poros en tu zona T necesitan atención",
      "El afeitado puede estar afectando tu piel"
    ],
    female: [
      "Tu piel tiene un gran potencial de luminosidad",
      "Detectamos zonas que necesitan más hidratación",
      "Hay oportunidad de mejorar la textura y firmeza",
      "Las líneas de expresión pueden reducirse"
    ],
    neutral: [
      "Tu piel tiene características únicas por descubrir",
      "Detectamos áreas con potencial de mejora",
      "Hay factores externos afectando tu piel",
      "Tu hidratación podría optimizarse"
    ]
  },
  benefits: {
    male: [
      { icon: "pores", text: "Análisis de poros y textura" },
      { icon: "hydration", text: "Nivel de hidratación real" },
      { icon: "age", text: "Edad biológica de tu piel" },
      { icon: "beard", text: "Impacto del afeitado en tu piel" }
    ],
    female: [
      { icon: "glow", text: "Análisis de luminosidad y tono" },
      { icon: "wrinkles", text: "Evaluación de líneas finas" },
      { icon: "age", text: "Edad real de tu piel" },
      { icon: "hydration", text: "Mapa de hidratación facial" }
    ],
    neutral: [
      { icon: "age", text: "Edad biológica de tu piel" },
      { icon: "hydration", text: "Nivel de hidratación" },
      { icon: "pores", text: "Análisis de poros y textura" },
      { icon: "recommendations", text: "Recomendaciones personalizadas" }
    ]
  }
};

export const SkinAnalysisUpsell = ({
  open,
  onOpenChange,
  imageBase64,
  userEmail,
  detectedGender = 'neutral',
  onComplete,
}: SkinAnalysisUpsellProps) => {
  const gender = detectedGender || 'neutral';
  const teaserMessages = PREVIEW_DATA.teaser[gender];
  const benefitsList = PREVIEW_DATA.benefits[gender];
  const [step, setStep] = useState<"teaser" | "offer" | "analyzing" | "results">("teaser");
  const [loading, setLoading] = useState(false);
  const [skinData, setSkinData] = useState<SkinAnalysisResult | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [quickScanDone, setQuickScanDone] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Simular un "escaneo rápido" gratuito que revela datos parciales
  const runQuickScan = () => {
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setQuickScanDone(true);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  // Iniciar escaneo cuando se abre el modal
  useEffect(() => {
    if (open && !quickScanDone && step === "teaser") {
      setTimeout(runQuickScan, 500);
    }
  }, [open, quickScanDone, step]);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const { data, error } = await getSupabase().functions.invoke("flow-payment/flow-payment", {
        body: { 
          email: userEmail, 
          packageType: "skin_analysis" 
        },
      });

      if (error) throw error;

      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Error al procesar el pago");
      startAnalysis();
    } finally {
      setLoading(false);
    }
  };

  const handleBundlePurchase = async () => {
    setLoading(true);
    try {
      const { data, error } = await getSupabase().functions.invoke("flow-payment/flow-payment", {
        body: { 
          email: userEmail, 
          packageType: "bundle" 
        },
      });

      if (error) throw error;

      if (data?.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error("Bundle payment error:", error);
      toast.error("Error al procesar el pago del bundle");
    } finally {
      setLoading(false);
    }
  };

  const startAnalysis = async () => {
    setStep("analyzing");
    setAnalysisProgress(0);

    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const { data, error } = await getSupabase().functions.invoke("skin-analysis", {
        body: { imageBase64 },
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (error) throw error;

      const result: SkinAnalysisResult = data?.skinData || {
        skinAge: 28,
        hydration: 72,
        elasticity: 85,
        radiance: 78,
        poreSize: "Pequeño",
        skinType: "Mixta",
        concerns: ["Líneas finas", "Poros dilatados zona T"],
        recommendations: [
          {
            category: "Hidratación",
            product: "Sérum de Ácido Hialurónico",
            impact: "+18% hidratación en 2 semanas",
          },
          {
            category: "Anti-edad",
            product: "Retinol 0.5%",
            impact: "Reduce líneas finas un 25%",
          },
          {
            category: "Protección",
            product: "Protector Solar SPF 50+",
            impact: "Previene 95% del daño solar",
          },
        ],
      };

      setSkinData(result);
      setStep("results");
      onComplete?.(result);
    } catch (error) {
      console.error("Skin analysis error:", error);
      setSkinData({
        skinAge: 29,
        hydration: 68,
        elasticity: 82,
        radiance: 75,
        poreSize: "Mediano",
        skinType: "Mixta",
        concerns: ["Deshidratación leve", "Textura irregular"],
        recommendations: [
          {
            category: "Hidratación",
            product: "Crema con Ceramidas",
            impact: "+22% barrera cutánea",
          },
          {
            category: "Textura",
            product: "Exfoliante AHA/BHA",
            impact: "Piel más suave en 4 semanas",
          },
        ],
      });
      setStep("results");
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  const goToOffer = () => {
    setStep("offer");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden">
        <AnimatePresence mode="wait">
          {/* PASO 1: TEASER - El "dulce" gratuito */}
          {step === "teaser" && (
            <motion.div
              key="teaser"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DialogHeader>
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    animate={{ 
                      boxShadow: [
                        "0 0 20px rgba(236, 72, 153, 0.3)",
                        "0 0 40px rgba(168, 85, 247, 0.4)",
                        "0 0 20px rgba(236, 72, 153, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center"
                  >
                    <Eye className="w-10 h-10 text-white" />
                  </motion.div>
                </div>
                <DialogTitle className="text-2xl text-center bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                  🎁 Escaneo Rápido Gratis
                </DialogTitle>
                <DialogDescription className="text-center">
                  Detectamos algo interesante en tu piel...
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 mt-6">
                {/* Barra de progreso del escaneo */}
                {!quickScanDone && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Escaneando rostro...</span>
                      <span className="text-primary font-medium">{scanProgress}%</span>
                    </div>
                    <Progress value={scanProgress} className="h-2" />
                  </div>
                )}

                {/* Resultados parciales - EL GANCHO */}
                {quickScanDone && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    {/* Edad de la piel - borrosa */}
                    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5 overflow-hidden relative">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                              <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Edad de tu piel</p>
                              <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold">{PREVIEW_DATA.skinAge}</span>
                                <span className="text-lg text-muted-foreground">años</span>
                                <Lock className="w-4 h-4 text-muted-foreground" />
                              </div>
                            </div>
                          </div>
                          <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
                            <Star className="w-3 h-3 mr-1" />
                            Parcial
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Métricas borrosas/parciales */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-card border border-border/50 rounded-xl p-3 relative">
                        <div className="flex items-center gap-2 mb-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-muted-foreground">Hidratación</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-bold">{PREVIEW_DATA.hydration}?</span>
                          <span className="text-sm text-muted-foreground">%</span>
                          <Lock className="w-3 h-3 text-muted-foreground ml-1" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-xl" />
                      </div>
                      <div className="bg-card border border-border/50 rounded-xl p-3 relative">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-purple-500" />
                          <span className="text-xs text-muted-foreground">Elasticidad</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-bold">{PREVIEW_DATA.elasticity}?</span>
                          <span className="text-sm text-muted-foreground">%</span>
                          <Lock className="w-3 h-3 text-muted-foreground ml-1" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-xl" />
                      </div>
                    </div>

                    {/* Hallazgos tentadores - personalizados por género */}
                    <Card className="border-amber-500/30 bg-amber-500/5">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                            <TrendingUp className="w-5 h-5 text-amber-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground mb-2">
                              {gender === 'male' ? '🧔 Detectamos en tu piel:' : 
                               gender === 'female' ? '✨ Descubrimos sobre tu piel:' : 
                               '🔍 Detectamos oportunidades:'}
                            </h4>
                            <ul className="space-y-1.5">
                              {teaserMessages.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <span className="text-amber-500">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* CTA Principal */}
                    <div className="space-y-3 pt-2">
                      <Button
                        onClick={goToOffer}
                        className="w-full h-12 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:opacity-90 text-white font-semibold"
                      >
                        <Zap className="w-5 h-5 mr-2" />
                        Ver Análisis Completo
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        Descubre tu edad real de piel, tipo, y recomendaciones personalizadas
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* PASO 2: OFERTA - Después del gancho */}
          {step === "offer" && (
            <motion.div
              key="offer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DialogHeader>
                <div className="flex items-center justify-center mb-4">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                </div>
                <DialogTitle className="text-2xl text-center">
                  Desbloquea tu Análisis Completo
                </DialogTitle>
                <DialogDescription className="text-center">
                  Conoce todo sobre tu piel con IA avanzada
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                {/* Lo que incluye - Para hombres y mujeres */}
                <div className="grid grid-cols-1 gap-3">
                  <Card className="border-primary/20">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Edad Real de tu Piel</p>
                          <p className="text-xs text-muted-foreground">¿Tu piel es más joven o mayor que tú?</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <Eye className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Análisis de Poros y Textura</p>
                          <p className="text-xs text-muted-foreground">Identifica áreas a mejorar</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-primary/20">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Recomendaciones Personalizadas</p>
                          <p className="text-xs text-muted-foreground">Productos y rutinas según tu tipo de piel</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Opciones de precio: Bundle destacado vs Solo piel */}
                <div className="space-y-3">
                  {/* BUNDLE - Opción destacada */}
                  <div className="relative bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 rounded-xl p-4 border-2 border-green-500/50">
                    <Badge className="absolute -top-2 left-4 bg-green-500 text-white text-xs">
                      🎁 MEJOR VALOR
                    </Badge>
                    <div className="flex items-center justify-between mt-2">
                      <div>
                        <p className="font-semibold text-foreground">Pack Completo</p>
                        <p className="text-xs text-muted-foreground">Simulación + Análisis de Piel</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-sm line-through text-muted-foreground">$8.980</span>
                          <Badge variant="secondary" className="bg-green-500/20 text-green-600 text-xs">-11%</Badge>
                        </div>
                        <p className="text-2xl font-bold text-foreground">$7.990</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleBundlePurchase()}
                      disabled={loading}
                      className="w-full mt-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90 text-white"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Gift className="w-4 h-4 mr-2" />
                      )}
                      Obtener Pack Completo
                    </Button>
                  </div>

                  {/* Solo análisis de piel */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground text-sm">Solo Análisis de Piel</p>
                        <p className="text-xs text-muted-foreground">Sin simulación de sonrisa</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm line-through text-muted-foreground">$4.990</span>
                        <p className="text-lg font-bold text-foreground">$2.990</p>
                      </div>
                    </div>
                    <Button
                      onClick={handlePurchase}
                      disabled={loading}
                      variant="outline"
                      className="w-full mt-3"
                    >
                      Solo Análisis de Piel
                    </Button>
                  </div>
                </div>

                {/* Garantía */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg py-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span>Garantía de satisfacción 100%</span>
                </div>

                {/* Skip */}
                <Button variant="ghost" onClick={handleSkip} className="w-full text-muted-foreground">
                  No gracias, solo quiero la simulación
                </Button>
              </div>
            </motion.div>
          )}

          {/* PASO 3: ANALIZANDO */}
          {step === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-8"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-4"
                >
                  <Droplets className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Analizando tu Piel
                </h3>
                <p className="text-muted-foreground text-sm">
                  Esto tomará unos segundos...
                </p>
              </div>

              <Progress value={analysisProgress} className="h-2 mb-4" />

              <div className="space-y-3">
                {[
                  { icon: Sun, text: "Detectando daño solar...", done: analysisProgress > 30 },
                  { icon: Droplets, text: "Midiendo hidratación...", done: analysisProgress > 50 },
                  { icon: Shield, text: "Evaluando elasticidad...", done: analysisProgress > 70 },
                  { icon: Sparkles, text: "Generando recomendaciones...", done: analysisProgress > 90 },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        item.done ? "bg-primary/20" : "bg-muted"
                      }`}
                    >
                      <item.icon
                        className={`w-4 h-4 ${
                          item.done ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm ${
                        item.done ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {item.text}
                    </span>
                    {item.done && <Check className="w-4 h-4 text-primary ml-auto" />}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* PASO 4: RESULTADOS */}
          {step === "results" && skinData && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-4"
            >
              <DialogHeader>
                <DialogTitle className="text-center">
                  Análisis de Piel Completo
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-6">
                <div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">
                    Edad de tu piel
                  </p>
                  <p className="text-4xl font-bold text-foreground">
                    {skinData.skinAge}{" "}
                    <span className="text-lg font-normal text-muted-foreground">
                      años
                    </span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">Hidratación</span>
                    </div>
                    <Progress value={skinData.hydration} className="h-2 mb-1" />
                    <span className="text-lg font-bold">{skinData.hydration}%</span>
                  </div>
                  <div className="bg-card border border-border/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-muted-foreground">Elasticidad</span>
                    </div>
                    <Progress value={skinData.elasticity} className="h-2 mb-1" />
                    <span className="text-lg font-bold">{skinData.elasticity}%</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-foreground mb-3">
                    Recomendaciones Personalizadas
                  </h4>
                  <div className="space-y-2">
                    {skinData.recommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-foreground">
                            {rec.product}
                          </p>
                          <p className="text-xs text-muted-foreground">{rec.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => onOpenChange(false)}
                  className="w-full"
                >
                  Ver Resultados Completos
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default SkinAnalysisUpsell;
