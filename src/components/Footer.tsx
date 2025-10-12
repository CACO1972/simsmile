import { Facebook, Instagram, Mail, Globe } from "lucide-react";
import { Logo } from "./Logo";

export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo size="sm" className="opacity-50" />
          
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
