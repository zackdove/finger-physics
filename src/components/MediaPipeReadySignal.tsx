import { useEffect } from "react";
import { useHandLandmarkerStatus } from "./HandLandmarker/HandLandmarker";

export function MediaPipeReadySignal({ onReady }: { onReady: () => void }) {
  const { ready } = useHandLandmarkerStatus();

  useEffect(() => {
    if (ready) onReady();
  }, [ready, onReady]);

  return null;
}
