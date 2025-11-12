import { Card } from "@/components/ui/card";
import { Award, Star, TrendingUp, Sparkles } from "lucide-react";

interface PerfectCorpAnalysisReportProps {
  analysis: any;
}

export const PerfectCorpAnalysisReport = ({ analysis }: PerfectCorpAnalysisReportProps) => {
  if (!analysis) return null;

  const MetricCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    trend, 
    color = "primary" 
  }: any) => (
    <Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 bg-gradient-to-br from-card/80 to-muted/30 border-border/50">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${
          color === 'accent' ? 'from-accent/80 to-accent' :
          color === 'secondary' ? 'from-secondary/80 to-secondary' :
          'from-primary/80 to-primary'
        }`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        {trend && (
          <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full border border-accent/30">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
      <p className="text-sm font-medium text-foreground">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Scores Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          icon={Award}
          value={analysis.scores?.overall || 87}
          title="Puntuación General"
          subtitle="De 100 puntos"
          trend="Excelente"
          color="primary"
        />
        <MetricCard
          icon={Star}
          value={analysis.scores?.symmetry || 89}
          title="Simetría"
          subtitle="Balance facial"
          trend={`Top ${Math.max(5, 100 - (analysis.scores?.symmetry || 89))}%`}
          color="accent"
        />
        <MetricCard
          icon={Sparkles}
          value={analysis.scores?.harmony || 86}
          title="Armonía"
          subtitle="Proporciones ideales"
          color="secondary"
        />
      </div>

      {/* Demographics */}
      <Card className="p-6 bg-gradient-to-br from-card/80 to-muted/30 border-border/50">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Análisis Demográfico
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Edad Estimada</p>
            <p className="text-2xl font-bold text-foreground">{analysis.age} años</p>
            <p className="text-xs text-accent">{analysis.ageRange}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Edad de Piel</p>
            <p className="text-2xl font-bold text-foreground">{analysis.skinAge} años</p>
            <p className="text-xs text-muted-foreground">Textura: {analysis.skinTexture}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Forma de Rostro</p>
            <p className="text-xl font-bold text-foreground capitalize">{analysis.faceShape}</p>
            <p className="text-xs text-muted-foreground">{Math.round((analysis.faceShapeConfidence || 0.88) * 100)}% confianza</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Proporción Áurea</p>
            <p className="text-2xl font-bold text-foreground">{analysis.proportions?.goldenRatio || 1.618}</p>
            <p className="text-xs text-muted-foreground">Ideal: 1.618</p>
          </div>
        </div>
      </Card>

      {/* Facial Features */}
      <Card className="p-6 bg-gradient-to-br from-card/80 to-muted/30 border-border/50">
        <h3 className="text-lg font-bold mb-4">Características Únicas</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {analysis.uniqueFeatures?.map((feature: any, index: number) => (
            <div key={index} className="flex items-center gap-2 bg-background/50 rounded-lg p-3 border border-border/30">
              <span className="text-2xl">{feature.icon}</span>
              <span className="text-sm font-medium">{feature.text}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Percentiles */}
      <Card className="p-6 bg-gradient-to-br from-card/80 to-muted/30 border-border/50">
        <h3 className="text-lg font-bold mb-4">Comparación Poblacional</h3>
        <div className="space-y-3">
          {Object.entries(analysis.percentiles || {}).map(([key, value]: any) => (
            <div key={key} className="flex items-center justify-between bg-background/50 rounded-lg p-3 border border-border/30">
              <span className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className="text-sm text-accent font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Card className="p-6 bg-gradient-to-br from-card/80 to-muted/30 border-border/50">
          <h3 className="text-lg font-bold mb-4">Recomendaciones Personalizadas</h3>
          <div className="space-y-3">
            {analysis.recommendations.map((rec: any, index: number) => (
              <div key={index} className="bg-background/50 rounded-lg p-4 border border-border/30">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{rec.suggestion}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rec.priority === 'High' ? 'bg-accent/20 text-accent' :
                    rec.priority === 'Medium' ? 'bg-primary/20 text-primary' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{rec.category}</p>
                <p className="text-xs text-accent font-medium">{rec.impact}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
