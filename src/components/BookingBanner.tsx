import { Calendar, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CLINIC_BOOKING_URL, CLINIC_NAME } from "@/lib/monetization";

interface BookingBannerProps {
  className?: string;
}

export const BookingBanner = ({ className = "" }: BookingBannerProps) => {
  return (
    <div
      className={`relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-primary/30 ${className}`}
    >
      {/* Video background */}
      <video
        src="/booking-intro.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

      {/* Content */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 p-5 md:p-7">
        <div className="text-center md:text-left text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-medium mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            Agenda disponible hoy
          </div>
          <h3 className="text-xl md:text-2xl font-heading font-bold leading-tight">
            Toma tu hora online en {CLINIC_NAME}
          </h3>
          <p className="text-sm md:text-base text-white/80 mt-1">
            Primera evaluación gratuita · 100% online
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="shrink-0 h-12 md:h-14 px-6 md:px-8 bg-white text-primary hover:bg-white/90 font-bold shadow-xl"
        >
          <a href={CLINIC_BOOKING_URL} target="_blank" rel="noopener noreferrer">
            <Calendar className="w-5 h-5 mr-2" />
            Reservar hora online
            <ArrowRight className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </div>
    </div>
  );
};

export default BookingBanner;
