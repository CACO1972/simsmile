// MediaPipe Face Landmarker types
export interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export interface FaceLandmarkerResult {
  faceLandmarks: Landmark[][];
  faceBlendshapes?: unknown[];
  facialTransformationMatrixes?: unknown[];
}

export interface ImageSource {
  width: number;
  height: number;
}

export interface MediaPipeError extends Error {
  name: string;
  message: string;
}
