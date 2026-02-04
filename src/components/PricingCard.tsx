import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingPackage {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  credits: number;
  features: string[];
  popular?: boolean;
  bundle?: boolean;
  icon: React.ReactNode;
  savings?: string;
}

const packages: PricingPackage[] = [
  {
    id: 'basic',
    name: 'Pack Básico',
    price: 5990,
    credits: 3,
    features: [
      '3 simulaciones de sonrisa',
      'Análisis facial con IA',
      'Modelo 3D interactivo',
      'Reporte descargable'
    ],
    icon: <Sparkles className="w-6 h-6" />
  },
  {
    id: 'bundle',
    name: 'Pack Completo',
    price: 7990,
    originalPrice: 8980,
    credits: 3,
    features: [
      '3 simulaciones de sonrisa',
      '✨ Análisis de piel premium',
      'Edad real de tu piel',
      'Mapa de hidratación',
      'Recomendaciones personalizadas',
      'Modelo 3D + Reporte'
    ],
    popular: true,
    bundle: true,
    icon: <Gift className="w-6 h-6" />,
    savings: 'Ahorras $990'
  },
  {
    id: 'premium',
    name: 'Pack Premium',
    price: 9990,
    originalPrice: 14990,
    credits: 10,
    features: [
      '10 simulaciones de sonrisa',
      '✨ Análisis de piel incluido',
      'Comparación antes/después',
      'Modelo 3D con múltiples ángulos',
      'Recomendaciones personalizadas',
      'Soporte prioritario'
    ],
    icon: <Zap className="w-6 h-6" />
  }
];

interface PricingCardProps {
  onSelectPackage: (packageId: string) => void;
  loading?: boolean;
  selectedPackage?: string;
}

export const PricingCard = ({ onSelectPackage, loading, selectedPackage }: PricingCardProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto">
      {packages.map((pkg) => (
        <Card
          key={pkg.id}
          className={cn(
            "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
            pkg.popular
              ? "border-primary shadow-lg shadow-primary/20 scale-105 z-10"
              : "border-border/50 hover:border-primary/50"
          )}
        >
          {pkg.popular && (
            <div className="absolute top-0 right-0 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
              {pkg.bundle ? '🎁 MEJOR VALOR' : 'MÁS POPULAR'}
            </div>
          )}
          
          {pkg.savings && (
            <Badge className="absolute top-0 left-0 bg-green-500 text-white text-xs rounded-br-lg rounded-tl-lg">
              {pkg.savings}
            </Badge>
          )}
          
          <CardHeader className="text-center pb-4">
            <div className={cn(
              "w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-4",
              pkg.popular
                ? "bg-gradient-to-br from-primary to-accent text-white"
                : "bg-primary/10 text-primary"
            )}>
              {pkg.icon}
            </div>
            <CardTitle className="text-xl">{pkg.name}</CardTitle>
            <CardDescription>
              {pkg.credits === 999 ? 'Ilimitado' : `${pkg.credits} simulaciones`}
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center pb-6">
            <div className="mb-6">
              {pkg.originalPrice && (
                <span className="text-muted-foreground line-through text-lg mr-2">
                  {formatPrice(pkg.originalPrice)}
                </span>
              )}
              <span className="text-4xl font-bold text-foreground">
                {formatPrice(pkg.price)}
              </span>
              <span className="text-muted-foreground text-sm"> CLP</span>
            </div>

            <ul className="space-y-3 text-left">
              {pkg.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm">
                  <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter>
            <Button
              onClick={() => onSelectPackage(pkg.id)}
              disabled={loading}
              className={cn(
                "w-full",
                pkg.popular
                  ? "bg-gradient-to-r from-primary to-accent hover:opacity-90"
                  : ""
              )}
              variant={pkg.popular ? "default" : "outline"}
            >
              {loading && selectedPackage === pkg.id ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> Procesando...
                </span>
              ) : (
                'Seleccionar'
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default PricingCard;