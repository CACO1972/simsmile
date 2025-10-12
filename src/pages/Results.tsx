import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSmileAnalysis } from "@/contexts/SmileAnalysisContext";
import { Button } from "@/components/ui/button";
import { Home, HelpCircle, Eye, Maximize2, ChevronLeft, ChevronRight, Menu as MenuIcon, Edit3, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ImageUpload } from "@/components/ia-lab/ImageUpload";

type AnalysisView = 'inter-commissural' | 'dental-midline' | 'smile-width' | 'interdental-proportion' | 'smile-curve' | 'incisal-plane' | 'smile-line' | 'incisal-edge' | 'central-incisor';

const analysisViews = [
  { id: 'smile-width' as const, title: 'Smile Width', number: 1 },
  { id: 'dental-midline' as const, title: 'Dental Midline', number: 2 },
  { id: 'inter-commissural' as const, title: 'Inter-commissural Line', number: 3 },
  { id: 'incisal-plane' as const, title: 'Incisal Plane', number: 4 },
  { id: 'smile-line' as const, title: 'Smile Line', number: 5 },
  { id: 'smile-curve' as const, title: 'Smile Curve', number: 6 },
  { id: 'incisal-edge' as const, title: 'Incisal Edge Position', number: 7 },
  { id: 'central-incisor' as const, title: 'Central Incisor Proportion', number: 8 },
  { id: 'interdental-proportion' as const, title: 'Interdental Width Proportion', number: 9 },
];

export default function Results() {
  const navigate = useNavigate();
  const { smileImage, simulatedImage, contactSubmitted, setRestImage, setSmileImage } = useSmileAnalysis();
  
  const [mode, setMode] = useState<'analyze' | 'simulate'>('analyze');
  const [currentView, setCurrentView] = useState<AnalysisView>('inter-commissural');
  const [showMenu, setShowMenu] = useState(false);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [uploadRestImage, setUploadRestImage] = useState("");
  const [uploadSmileImage, setUploadSmileImage] = useState("");
  
  // Simulation controls
  const [estheticCLP, setEstheticCLP] = useState(false);
  const [veneer, setVeneer] = useState(false);
  const [bleaching, setBleaching] = useState(false);
  const [showOverlays, setShowOverlays] = useState(true);
  const [redValue, setRedValue] = useState(70);

  const handleFileChange = (type: 'rest' | 'smile') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'rest') {
          setUploadRestImage(result);
        } else {
          setUploadSmileImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyUpload = () => {
    if (uploadRestImage) setRestImage(uploadRestImage);
    if (uploadSmileImage) setSmileImage(uploadSmileImage);
    setShowUploadSheet(false);
    setUploadRestImage("");
    setUploadSmileImage("");
  };

  useEffect(() => {
    if (!contactSubmitted || !smileImage || !simulatedImage) {
      navigate("/captura-reposo");
    }
  }, [contactSubmitted, smileImage, simulatedImage, navigate]);

  const nextView = () => {
    const currentIndex = analysisViews.findIndex(v => v.id === currentView);
    const nextIndex = (currentIndex + 1) % analysisViews.length;
    setCurrentView(analysisViews[nextIndex].id);
  };

  const previousView = () => {
    const currentIndex = analysisViews.findIndex(v => v.id === currentView);
    const previousIndex = (currentIndex - 1 + analysisViews.length) % analysisViews.length;
    setCurrentView(analysisViews[previousIndex].id);
  };

  const getCurrentViewTitle = () => {
    return analysisViews.find(v => v.id === currentView)?.title || '';
  };

  const renderOverlay = (imageUrl: string, isAfter: boolean) => {
    // Simulación del after con los dientes más brillantes
    if (isAfter && simulatedImage) {
      return (
        <div className="absolute inset-0">
          <img src={simulatedImage} className="w-full h-full object-cover" alt="After" />
          {renderAnalysisOverlay()}
        </div>
      );
    }
    
    return (
      <div className="absolute inset-0">
        <img src={imageUrl} className="w-full h-full object-cover" alt="Before" />
        {renderAnalysisOverlay()}
      </div>
    );
  };

  const renderAnalysisOverlay = () => {
    if (mode === 'simulate' && !showOverlays) return null;
    
    const overlayStyle = "absolute pointer-events-none";
    
    switch (currentView) {
      case 'inter-commissural':
        return (
          <svg className={overlayStyle} style={{ width: '100%', height: '100%' }}>
            <line x1="5%" y1="67%" x2="95%" y2="67%" stroke="#00E5FF" strokeWidth="2" />
          </svg>
        );
      
      case 'dental-midline':
        return (
          <>
            <svg className={overlayStyle} style={{ width: '100%', height: '100%' }}>
              <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="#00E5FF" strokeWidth="2" />
            </svg>
            <div className="absolute" style={{ top: '58%', left: '35%', width: '30%', height: '15%' }}>
              <div className="w-full h-full" style={{ 
                background: 'rgba(0, 229, 255, 0.3)',
                borderRadius: '50%'
              }} />
            </div>
          </>
        );
      
      case 'smile-width':
        return (
          <div className="absolute" style={{ top: '58%', left: '35%', width: '30%', height: '15%' }}>
            <div className="w-full h-full" style={{ 
              background: 'rgba(0, 229, 255, 0.3)',
              borderRadius: '50%'
            }} />
          </div>
        );
      
      case 'interdental-proportion':
        return (
          <svg className={overlayStyle} style={{ width: '100%', height: '100%' }}>
            <rect x="35%" y="60%" width="30%" height="12%" fill="none" stroke="#00E5FF" strokeWidth="2" />
            <line x1="40%" y1="60%" x2="40%" y2="72%" stroke="#00E5FF" strokeWidth="1" />
            <line x1="45%" y1="60%" x2="45%" y2="72%" stroke="#00E5FF" strokeWidth="1" />
            <line x1="50%" y1="60%" x2="50%" y2="72%" stroke="#00E5FF" strokeWidth="1" />
            <line x1="55%" y1="60%" x2="55%" y2="72%" stroke="#00E5FF" strokeWidth="1" />
            <line x1="60%" y1="60%" x2="60%" y2="72%" stroke="#00E5FF" strokeWidth="1" />
          </svg>
        );
      
      default:
        return null;
    }
  };

  const renderSimulationOverlays = () => {
    if (!showOverlays) return null;
    
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid overlay (RED) */}
        <svg className="absolute" style={{ width: '100%', height: '100%', opacity: redValue / 100 }}>
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          
          <line x1="20%" y1="0" x2="20%" y2="100%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="40%" y1="0" x2="40%" y2="100%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="60%" y1="0" x2="60%" y2="100%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="80%" y1="0" x2="80%" y2="100%" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
        </svg>
        
        {/* Facial proportions box */}
        <svg className="absolute" style={{ width: '100%', height: '100%' }}>
          <rect x="25%" y="25%" width="50%" height="50%" fill="none" stroke="rgba(0,229,255,0.5)" strokeWidth="2" />
        </svg>
      </div>
    );
  };

  if (!smileImage || !simulatedImage) return null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Navigation */}
      <div className="flex items-center justify-center gap-4 p-4 bg-gray-900/50">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-gray-700 hover:bg-gray-600"
          onClick={() => navigate("/")}
        >
          <Home className="w-5 h-5" />
        </Button>

        <Sheet open={showUploadSheet} onOpenChange={setShowUploadSheet}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-cyan-500 hover:bg-cyan-600"
            >
              <Upload className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-gray-900 border-gray-700 text-white overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-white">Cargar Nueva Foto</SheetTitle>
              <SheetDescription className="text-gray-400">
                Sube fotos nuevas para analizar
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6 space-y-6">
              <ImageUpload
                label="Foto en Reposo"
                imageData={uploadRestImage}
                onFileChange={handleFileChange('rest')}
                onCameraClick={() => {}}
              />
              <ImageUpload
                label="Foto Sonriendo"
                imageData={uploadSmileImage}
                onFileChange={handleFileChange('smile')}
                onCameraClick={() => {}}
              />
              <Button 
                className="w-full bg-cyan-500 hover:bg-cyan-600"
                onClick={handleApplyUpload}
                disabled={!uploadRestImage && !uploadSmileImage}
              >
                Aplicar Fotos
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center bg-gray-800 rounded-full p-1">
          <button
            className={`px-6 py-2 rounded-full transition-all ${
              mode === 'analyze' ? 'bg-transparent text-cyan-400' : 'text-gray-400'
            }`}
            onClick={() => setMode('analyze')}
          >
            Analyze
          </button>
          <button
            className={`px-6 py-2 rounded-full transition-all ${
              mode === 'simulate' ? 'bg-transparent text-cyan-400' : 'text-gray-400'
            }`}
            onClick={() => setMode('simulate')}
          >
            Simulate
          </button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-gray-700 hover:bg-gray-600"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 3l3.057-3 11.943 12-11.943 12-3.057-3 9-9z"/>
          </svg>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-gray-200 hover:bg-gray-300 text-gray-900"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2c-4.97 0-9 4.03-9 9 0 4.17 2.84 7.67 6.69 8.69L12 22l2.31-2.31C18.16 18.67 21 15.17 21 11c0-4.97-4.03-9-9-9zm0 2c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
          </svg>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-gray-200 hover:bg-gray-300 text-gray-900"
        >
          <HelpCircle className="w-5 h-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {/* Comparison View */}
        <div className="relative h-full">
          <div className="absolute inset-0 grid grid-cols-2">
            {/* Before */}
            <div className="relative overflow-hidden">
              {renderOverlay(smileImage, false)}
            </div>
            
            {/* After */}
            <div className="relative overflow-hidden">
              {renderOverlay(smileImage, true)}
            </div>
          </div>

          {/* Center Divider Line */}
          <div className="absolute inset-y-0 left-1/2 w-1 bg-white transform -translate-x-1/2 z-10" />

          {/* Action Buttons (Right side) */}
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex flex-col gap-4 z-20">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-700 hover:bg-gray-600 w-12 h-12"
            >
              <Eye className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-700 hover:bg-gray-600 w-12 h-12"
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Simulation Mode - Toolbar */}
        {mode === 'simulate' && (
          <div className="absolute top-4 left-4 bg-gray-800/90 rounded-lg p-2 flex items-center gap-2">
            <span className="px-3 py-1 bg-gray-700 rounded text-sm">Plan01</span>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="w-8 h-8 bg-gray-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2zm-3 6.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-4z"/>
              </svg>
            </Button>
          </div>
        )}

        {/* Simulation Mode - Side Panel */}
        {mode === 'simulate' && (
          <div className="absolute left-4 top-24 bg-gray-800/90 rounded-lg p-4 space-y-3 w-80">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Before/After</span>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 5v4h4V5H3zm2 2h0zm0 0h0zm-2 8v4h4v-4H3zm0-4v4h4v-4H3zm2 2h0zm4-10v4h4V3h-4zm4 6V5h-2v2h2zm-6 0V5H5v2h2zm6 4v-2h-2v2h2zm0 2v-2h-2v2h2zm-2 2v-2H7v2h2zm4 0v-2h-2v2h2zm4-2v-2h-2v2h2zm0-6V7h-2v2h2zm0 10v-2h-2v2h2z"/>
                </svg>
              </Button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                  <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span className="text-sm">Facial Midline</span>
              </div>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Eye className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h18v2H3V3zm0 4h18v2H3V7zm0 4h18v2H3v-2zm0 4h18v2H3v-2zm0 4h18v2H3v-2z"/>
                </svg>
                <span className="text-sm">Facial Proportion</span>
              </div>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <Eye className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <span className="text-sm">RED</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm bg-gray-700 px-2 py-1 rounded">{redValue}%</span>
                <Button variant="ghost" size="icon" className="w-8 h-8">
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Simulation Mode - Bottom Controls */}
        {mode === 'simulate' && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center gap-6 bg-black/80 px-8 py-4 rounded-full">
            <div className="flex items-center gap-3">
              <span className="text-sm">Esthetic CLP</span>
              <Switch checked={estheticCLP} onCheckedChange={setEstheticCLP} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">Veneer</span>
              <Switch checked={veneer} onCheckedChange={setVeneer} />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">Bleaching</span>
              <Switch checked={bleaching} onCheckedChange={setBleaching} />
            </div>
          </div>
        )}

        {/* Menu Overlay */}
        {showMenu && (
          <div className="absolute left-4 top-1/4 bg-gray-900/95 rounded-lg p-4 w-96 space-y-2 z-30">
            {analysisViews.map((view) => (
              <button
                key={view.id}
                onClick={() => {
                  setCurrentView(view.id);
                  setShowMenu(false);
                }}
                className={`w-full text-left px-4 py-3 rounded transition-colors ${
                  currentView === view.id ? 'text-cyan-400' : 'text-white hover:bg-gray-800'
                }`}
              >
                {view.number}. {view.title}
              </button>
            ))}
          </div>
        )}
        
        {mode === 'simulate' && renderSimulationOverlays()}
      </div>

      {/* Bottom Navigation */}
      <div className="bg-gray-900 p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={previousView}
          className="flex flex-col items-center gap-1 hover:bg-gray-800"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-xs">Previous</span>
        </Button>

        <Button
          variant="ghost"
          onClick={() => setShowMenu(!showMenu)}
          className="flex flex-col items-center gap-1 hover:bg-gray-800"
        >
          <MenuIcon className="w-5 h-5" />
          <span className="text-xs">Menu</span>
        </Button>

        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold">{getCurrentViewTitle()}</h2>
        </div>

        <Button
          variant="ghost"
          className="flex flex-col items-center gap-1 hover:bg-gray-800"
        >
          <Edit3 className="w-5 h-5" />
          <span className="text-xs">Edit</span>
        </Button>

        <Button
          variant="ghost"
          onClick={nextView}
          className="flex flex-col items-center gap-1 hover:bg-gray-800"
        >
          <ChevronRight className="w-5 h-5" />
          <span className="text-xs">Next</span>
        </Button>
      </div>

      {/* Upgrade Banner */}
      <div className="bg-gray-900 p-4 flex items-center justify-center">
        <div className="bg-cyan-400 text-black px-6 py-3 rounded-full flex items-center gap-2 font-bold">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          Upgrade to see analysis results.
        </div>
      </div>
    </div>
  );
}
