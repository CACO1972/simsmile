import simsmileLogo from "@/assets/simsmile-logo.png";

export function LogoCorner() {
  return (
    <div className="fixed top-4 left-4 z-10">
      <img 
        src={simsmileLogo} 
        alt="SimSmile" 
        className="h-12 w-12 opacity-60 hover:opacity-100 transition-opacity" 
      />
    </div>
  );
}
