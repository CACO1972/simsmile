import logo from "@/assets/simsmile-isotipo.png";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-12",
  md: "h-16",
  lg: "h-24",
  xl: "h-32",
};

export const Logo = ({ className = "", size = "md" }: LogoProps) => {
  return (
    <img
      src={logo}
      alt="SimSmile"
      className={`${sizeClasses[size]} w-auto ${className}`}
    />
  );
};
