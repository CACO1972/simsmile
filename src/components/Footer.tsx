import { Facebook, Instagram, Mail, Globe } from "lucide-react";
import simsmileLogo from "@/assets/simsmile-logo-white-bg.png";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-4 md:py-6 mt-0">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-3">
            <img src={simsmileLogo} alt="SimSmile" className="h-16 md:h-20 w-auto" />
            <p className="text-xs text-muted-foreground text-center md:text-left max-w-xs">
              © 2025 Dr. Carlos Montoya. Todos los derechos reservados.
              <br />
              IP y Patent Pending
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="mailto:contacto@simsmile.com"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="h-5 w-5" />
            </a>
            <a
              href="https://www.simsmile.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <Globe className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
