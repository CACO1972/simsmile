interface OrbitalAnimationProps {
  size?: "small" | "large";
}

export const OrbitalAnimation = ({ size = "small" }: OrbitalAnimationProps) => {
  const isLarge = size === "large";
  const containerSize = isLarge ? "w-80 h-80" : "w-64 h-64";
  
  return (
    <div className={`relative ${containerSize}`}>
      {/* SVG for connecting lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
        {/* Animated connecting lines */}
        <line
          x1="50%"
          y1="50%"
          x2="50%"
          y2="0%"
          stroke="url(#gradient1)"
          strokeWidth="2"
          className="animate-[pulse_2s_ease-in-out_infinite]"
          opacity="0.4"
        >
          <animate
            attributeName="x2"
            values="50%;80%;50%"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            values="0%;30%;0%"
            dur="3s"
            repeatCount="indefinite"
          />
        </line>
        
        <line
          x1="50%"
          y1="50%"
          x2="20%"
          y2="80%"
          stroke="url(#gradient2)"
          strokeWidth="2"
          className="animate-[pulse_2s_ease-in-out_infinite_0.5s]"
          opacity="0.4"
        >
          <animate
            attributeName="x2"
            values="20%;10%;20%"
            dur="4s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            values="80%;60%;80%"
            dur="4s"
            repeatCount="indefinite"
          />
        </line>
        
        <line
          x1="50%"
          y1="50%"
          x2="90%"
          y2="70%"
          stroke="url(#gradient3)"
          strokeWidth="2"
          className="animate-[pulse_2s_ease-in-out_infinite_1s]"
          opacity="0.4"
        >
          <animate
            attributeName="x2"
            values="90%;85%;90%"
            dur="5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y2"
            values="70%;80%;70%"
            dur="5s"
            repeatCount="indefinite"
          />
        </line>
        
        {/* Gradients for lines */}
        <defs>
          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3DD6B4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3DD6B4" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FDB913" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FDB913" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E91E84" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#E91E84" stopOpacity="0.2" />
          </linearGradient>
        </defs>
      </svg>

      {/* Orbiting circles - Teal */}
      <div className="absolute inset-0 animate-[spin_3s_linear_infinite]" style={{ zIndex: 2 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#3DD6B4] shadow-[0_0_20px_rgba(61,214,180,0.8)] animate-pulse" />
      </div>
      
      {/* Orbiting circles - Gold */}
      <div className="absolute inset-4 animate-[spin_4s_linear_infinite_reverse]" style={{ zIndex: 2 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#FDB913] shadow-[0_0_20px_rgba(253,185,19,0.8)] animate-pulse" />
      </div>
      
      {/* Orbiting circles - Magenta */}
      <div className="absolute inset-8 animate-[spin_5s_linear_infinite]" style={{ zIndex: 2 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-[#E91E84] shadow-[0_0_20px_rgba(233,30,132,0.8)] animate-pulse" />
      </div>
      
      {/* Additional particles for more complex patterns */}
      <div className="absolute inset-2 animate-[spin_6s_linear_infinite]" style={{ zIndex: 2 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#3DD6B4]/50 animate-pulse" />
      </div>
      
      <div className="absolute inset-6 animate-[spin_7s_linear_infinite_reverse]" style={{ zIndex: 2 }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#FDB913]/50 animate-pulse" />
      </div>
    </div>
  );
};
