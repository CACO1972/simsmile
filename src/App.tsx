import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SmileAnalysisProvider } from "./contexts/SmileAnalysisContext";
import Landing from "./pages/Landing";
import Instructions from "./pages/Instructions";
import CaptureRest from "./pages/CaptureRest";
import CaptureSmile from "./pages/CaptureSmile";
import Processing from "./pages/Processing";
import Contact from "./pages/Contact";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SmileAnalysisProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/instrucciones" element={<Instructions />} />
            <Route path="/captura-reposo" element={<CaptureRest />} />
            <Route path="/captura-sonrisa" element={<CaptureSmile />} />
            <Route path="/procesando" element={<Processing />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/resultados" element={<Results />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SmileAnalysisProvider>
  </QueryClientProvider>
);

export default App;
