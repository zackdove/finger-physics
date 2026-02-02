import * as React from "react";
import { useEffect, useContext, createContext } from "react";
import {
  FilesetResolver,
  HandLandmarker as MPHandLandmarker,
} from "@mediapipe/tasks-vision";
import { suspend, clear } from "suspend-react";

/* ---------------- Context ---------------- */

const HandLandmarkerContext = createContext<MPHandLandmarker | null>(null);

export const useHandLandmarker = () => {
  const ctx = useContext(HandLandmarkerContext);
  if (!ctx) throw new Error("useHandLandmarker must be used inside HandLandmarker");
  return ctx;
};

/* ---------------- Defaults ---------------- */

export const HandLandmarkerDefaults = {
  basePath:
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2-rc2/wasm",
  options: {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
      delegate: "GPU",
    },
    runningMode: "VIDEO",
    numHands: 2,
    outputHandBlendshapes: true,
    outputHandTransformationMatrixes: true,
  },
};

/* ---------------- HandLandmarker Component ---------------- */

export function HandLandmarker({
  basePath = HandLandmarkerDefaults.basePath,
  options = HandLandmarkerDefaults.options,
  children,
}: {
  basePath?: string;
  options?: typeof HandLandmarkerDefaults.options;
  children: React.ReactNode;
}) {
  const opts = JSON.stringify(options);

  const handLandmarker = suspend(async () => {
    const vision = await FilesetResolver.forVisionTasks(basePath);
    return MPHandLandmarker.createFromOptions(vision, options);
  }, [basePath, opts]);

  useEffect(() => {
    return () => {
      handLandmarker?.close();
      clear([basePath, opts]);
    };
  }, [handLandmarker, basePath, opts]);

  return (
    <HandLandmarkerContext.Provider value={handLandmarker}>
      {children}
    </HandLandmarkerContext.Provider>
  );
}
