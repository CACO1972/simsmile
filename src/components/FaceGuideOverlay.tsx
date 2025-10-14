export default function FaceGuideOverlay() {
  return (
    <svg
      viewBox="0 0 300 400"
      className="w-full h-full"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Óvalo principal para el rostro - más ancho en la parte superior */}
      <ellipse
        cx="150"
        cy="160"
        rx="110"
        ry="145"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeOpacity="0.8"
        fill="none"
        strokeDasharray="8 4"
      />
      
      {/* Zona para la boca - óvalo horizontal más pequeño */}
      <ellipse
        cx="150"
        cy="280"
        rx="70"
        ry="35"
        stroke="hsl(var(--primary))"
        strokeWidth="3"
        strokeOpacity="0.8"
        fill="none"
        strokeDasharray="8 4"
      />
      
      {/* Línea de conexión visual entre rostro y zona de boca */}
      <line
        x1="150"
        y1="305"
        x2="150"
        y2="260"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeOpacity="0.5"
        strokeDasharray="4 4"
      />
      
      {/* Indicador superior */}
      <path
        d="M 150 10 L 150 35"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        strokeOpacity="0.6"
      />
      <circle
        cx="150"
        cy="10"
        r="4"
        fill="hsl(var(--primary))"
        fillOpacity="0.6"
      />
    </svg>
  );
}