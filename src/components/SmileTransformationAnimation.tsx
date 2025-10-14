import transformationVideo from "@/assets/smile-transformation.mp4";
import transformationVideo2 from "@/assets/smile-transformation-2.mp4";

export const SmileTransformationAnimation = () => {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Animated gradient background effects */}
      <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full animate-pulse" />
      <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-accent/30 blur-[60px] rounded-full" />
      <div className="absolute bottom-1/4 left-1/4 w-40 h-40 bg-secondary/20 blur-[70px] rounded-full animate-pulse" />
      
      {/* Video containers - side by side on desktop, stacked on mobile */}
      <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* First video */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/30 backdrop-blur-sm border border-primary/20">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ aspectRatio: '1/1' }}
          >
            <source src={transformationVideo} type="video/mp4" />
            Tu navegador no soporta el video.
          </video>
          
          {/* Overlay gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/10 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Second video */}
        <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-accent/30 backdrop-blur-sm border border-accent/20">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ aspectRatio: '1/1' }}
          >
            <source src={transformationVideo2} type="video/mp4" />
            Tu navegador no soporta el video.
          </video>
          
          {/* Overlay gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/10 via-transparent to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
