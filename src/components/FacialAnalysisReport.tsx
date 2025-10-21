import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FacialAnalysisData {
  // Face Horizontal Ratio (tercios faciales)
  horizontal_ratio?: {
    upper: number;     // % tercio superior
    middle: number;    // % tercio medio
    lower: number;     // % tercio inferior
  };
  
  // Face Vertical Ratio (quintos faciales)
  vertical_ratio?: {
    sections: number[]; // 5 valores en %
  };
  
  // Eye metrics
  eye_distance?: {
    category: 'narrow' | 'balanced' | 'wide';
  };
  eye_width?: {
    category: 'narrow' | 'balanced' | 'wide';
  };
  
  // Nose metrics
  nose_aspect_ratio?: {
    ratio: number; // 1:X
    category: 'wide' | 'balanced' | 'narrow';
  };
  
  nose_to_mouth_ratio?: {
    ratio: number; // 1:X
  };
  
  // Mouth metrics
  nose_to_chin_ratio?: {
    ratio: number; // 1:X
    lower_face_category: 'short' | 'balanced' | 'long';
  };
  
  lip_ratio?: {
    ratio: number; // 1:X (upper:lower)
    category: 'full_upper' | 'balanced' | 'full_lower';
  };
}

interface FacialAnalysisReportProps {
  data: FacialAnalysisData;
  imageUrl: string;
}

// Componente de barra de posición visual
const PositionBar = ({ 
  value, 
  labels 
}: { 
  value: 'left' | 'center' | 'right';
  labels: [string, string, string];
}) => {
  const position = value === 'left' ? 0 : value === 'center' ? 50 : 100;
  
  return (
    <div className="space-y-2">
      <div className="relative h-2 bg-muted rounded-full">
        <div className="absolute inset-0 flex">
          <div className="flex-1" />
          <div className="flex-1" />
          <div className="flex-1" />
        </div>
        <div 
          className="absolute top-0 h-2 bg-primary rounded-full transition-all"
          style={{ 
            left: `${Math.max(0, position - 10)}%`,
            width: '20%'
          }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{labels[0]}</span>
        <span>{labels[1]}</span>
        <span>{labels[2]}</span>
      </div>
    </div>
  );
};

// Componente de sección de análisis
const AnalysisSection = ({
  title,
  ratio,
  imageUrl,
  children
}: {
  title: string;
  ratio: string;
  imageUrl: string;
  children?: React.ReactNode;
}) => {
  return (
    <Card className="bg-background border-border p-6">
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      
      <div className="space-y-4">
        <div className="bg-muted/30 rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-1">Your Ratio</p>
          <p className="text-3xl font-bold text-primary">{ratio}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative aspect-square rounded-lg overflow-hidden border-2 border-border">
            <img 
              src={imageUrl} 
              alt="Your analysis"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Your Ratio {ratio}
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg p-4">
            <div className="text-6xl mb-2">φ</div>
            <p className="text-sm font-medium mb-4">Golden Ratio Reference</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">View</Button>
              <Button variant="outline" size="sm" className="text-primary">Golden Ratio</Button>
            </div>
          </div>
        </div>

        {children}
      </div>
    </Card>
  );
};

export const FacialAnalysisReport = ({ 
  data, 
  imageUrl 
}: FacialAnalysisReportProps) => {
  // Calcular categorías para las barras
  const getUpperSectionCategory = (): 'left' | 'center' | 'right' => {
    const upper = data.horizontal_ratio?.upper || 33;
    if (upper < 30) return 'left';
    if (upper > 36) return 'right';
    return 'center';
  };

  const getMiddleSectionCategory = (): 'left' | 'center' | 'right' => {
    const middle = data.horizontal_ratio?.middle || 33;
    if (middle < 30) return 'left';
    if (middle > 36) return 'right';
    return 'center';
  };

  const getLowerSectionCategory = (): 'left' | 'center' | 'right' => {
    const lower = data.horizontal_ratio?.lower || 33;
    if (lower < 30) return 'left';
    if (lower > 36) return 'right';
    return 'center';
  };

  const getEyeDistanceCategory = (): 'left' | 'center' | 'right' => {
    const cat = data.eye_distance?.category || 'balanced';
    if (cat === 'narrow') return 'left';
    if (cat === 'wide') return 'right';
    return 'center';
  };

  const getEyeWidthCategory = (): 'left' | 'center' | 'right' => {
    const cat = data.eye_width?.category || 'balanced';
    if (cat === 'narrow') return 'left';
    if (cat === 'wide') return 'right';
    return 'center';
  };

  const getNoseCategory = (): 'left' | 'center' | 'right' => {
    const cat = data.nose_aspect_ratio?.category || 'balanced';
    if (cat === 'wide') return 'left';
    if (cat === 'narrow') return 'right';
    return 'center';
  };

  const getLowerFaceCategory = (): 'left' | 'center' | 'right' => {
    const cat = data.nose_to_chin_ratio?.lower_face_category || 'balanced';
    if (cat === 'short') return 'left';
    if (cat === 'long') return 'right';
    return 'center';
  };

  const getLipCategory = (): 'left' | 'center' | 'right' => {
    const cat = data.lip_ratio?.category || 'balanced';
    if (cat === 'full_upper') return 'left';
    if (cat === 'full_lower') return 'right';
    return 'center';
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Face Horizontal Ratio */}
      <AnalysisSection
        title="Face Horizontal Ratio"
        ratio={`${data.horizontal_ratio?.upper || 33}% : ${data.horizontal_ratio?.middle || 33}% : ${data.horizontal_ratio?.lower || 34}%`}
        imageUrl={imageUrl}
      >
        <Card className="bg-muted/20 p-4 space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Your Upper Section</p>
            <PositionBar 
              value={getUpperSectionCategory()}
              labels={['Short', 'Balanced', 'Long']}
            />
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Your Middle Section</p>
            <PositionBar 
              value={getMiddleSectionCategory()}
              labels={['Short', 'Balanced', 'Long']}
            />
          </div>
          
          <div>
            <p className="text-sm font-medium mb-2">Your Lower Section</p>
            <PositionBar 
              value={getLowerSectionCategory()}
              labels={['Short', 'Balanced', 'Long']}
            />
          </div>
        </Card>
      </AnalysisSection>

      {/* Face Vertical Ratio */}
      {data.vertical_ratio?.sections && (
        <AnalysisSection
          title="Face Vertical Ratio"
          ratio={data.vertical_ratio.sections.map(v => `${v}%`).join(' : ')}
          imageUrl={imageUrl}
        >
          <Card className="bg-muted/20 p-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Your Eye Distance</p>
              <PositionBar 
                value={getEyeDistanceCategory()}
                labels={['Narrow', 'Balanced', 'Wide']}
              />
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Your Eye Width</p>
              <PositionBar 
                value={getEyeWidthCategory()}
                labels={['Narrow', 'Balanced', 'Wide']}
              />
            </div>
          </Card>
        </AnalysisSection>
      )}

      {/* Nose Aspect Ratio */}
      {data.nose_aspect_ratio && (
        <AnalysisSection
          title="Nose Aspect Ratio"
          ratio={`1 : ${data.nose_aspect_ratio.ratio.toFixed(3)}`}
          imageUrl={imageUrl}
        >
          <Card className="bg-muted/20 p-4">
            <p className="text-sm font-medium mb-2">Your Nose</p>
            <PositionBar 
              value={getNoseCategory()}
              labels={['Wide', 'Balanced', 'Narrow']}
            />
          </Card>
        </AnalysisSection>
      )}

      {/* Nose Width to Mouth Width */}
      {data.nose_to_mouth_ratio && (
        <AnalysisSection
          title="Nose Width to Mouth Width"
          ratio={`1 : ${data.nose_to_mouth_ratio.ratio.toFixed(2)}`}
          imageUrl={imageUrl}
        >
          <div className="text-sm text-muted-foreground">
            Relationship between nose width and mouth width
          </div>
        </AnalysisSection>
      )}

      {/* Nose to Lip to Chin */}
      {data.nose_to_chin_ratio && (
        <AnalysisSection
          title="Nose to Lip to Chin"
          ratio={`1 : ${data.nose_to_chin_ratio.ratio.toFixed(2)}`}
          imageUrl={imageUrl}
        >
          <Card className="bg-muted/20 p-4">
            <p className="text-sm font-medium mb-2">Your Lower Face</p>
            <PositionBar 
              value={getLowerFaceCategory()}
              labels={['Short', 'Balanced', 'Long']}
            />
          </Card>
        </AnalysisSection>
      )}

      {/* Upper Lip to Lower Lip */}
      <div className="bg-pink-50 dark:bg-pink-950/20 rounded-t-2xl p-6 -mb-6">
        <h3 className="text-2xl font-bold mb-6">Mouth</h3>
        
        {data.lip_ratio && (
          <AnalysisSection
            title="Upper Lip to Lower Lip"
            ratio={`1 : ${data.lip_ratio.ratio.toFixed(3)}`}
            imageUrl={imageUrl}
          >
            <Card className="bg-muted/20 p-4">
              <p className="text-sm font-medium mb-2">Your Lips</p>
              <PositionBar 
                value={getLipCategory()}
                labels={['Full Upper', 'Balanced', 'Full Lower']}
              />
            </Card>
          </AnalysisSection>
        )}
      </div>

      {/* CTAs */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 flex gap-4 z-50">
        <Button variant="outline" className="flex-1" size="lg">
          START OVER
        </Button>
        <Button className="flex-1 bg-primary" size="lg">
          CONTACT SALES
        </Button>
      </div>
    </div>
  );
};
