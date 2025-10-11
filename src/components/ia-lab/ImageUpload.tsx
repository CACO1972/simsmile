import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  label: string;
  imageData: string;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCameraClick: () => void;
}

export function ImageUpload({ label, imageData, onFileChange, onCameraClick }: ImageUploadProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCameraClick}
          className="flex-1"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Capturar con Cámara
        </Button>
      </div>
      <input 
        type="file" 
        accept="image/*" 
        onChange={onFileChange}
        className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 cursor-pointer"
      />
      {imageData && (
        <div className="rounded-xl overflow-hidden border border-border bg-muted/30">
          <img src={imageData} alt={label} className="w-full h-64 object-contain" />
        </div>
      )}
    </div>
  );
}
