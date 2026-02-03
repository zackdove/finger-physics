import * as React from "react";
import { useEffect, useContext, createContext, useState } from "react";
import {
  FilesetResolver,
  HandLandmarker as MPHandLandmarker,
} from "@mediapipe/tasks-vision";

/* ---------------- Types ---------------- */

type HandLandmarkerState = {
  landmarker: MPHandLandmarker | null;
  ready: boolean;
};

/* ---------------- Context ---------------- */

const HandLandmarkerContext = createContext<HandLandmarkerState | null>(null);

export const useHandLandmarker = () => {
  const ctx = useContext(HandLandmarkerContext);
  if (!ctx || !ctx.landmarker) throw new Error("HandLandmarker not ready");
  return ctx.landmarker;
};

export const useHandLandmarkerStatus = () => {
  const ctx = useContext(HandLandmarkerContext);
  if (!ctx)
    throw new Error(
      "useHandLandmarkerStatus must be used inside HandLandmarker",
    );
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

/* ---------------- Component ---------------- */

export function HandLandmarker({
  basePath = HandLandmarkerDefaults.basePath,
  options = HandLandmarkerDefaults.options,
  children,
}: {
  basePath?: string;
  options?: typeof HandLandmarkerDefaults.options;
  children: React.ReactNode;
}) {
  const [state, setState] = useState<HandLandmarkerState>({
    landmarker: null,
    ready: false,
  });

  useEffect(() => {
    let active = true;
    let instance: MPHandLandmarker | null = null;

    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(basePath);
        instance = await MPHandLandmarker.createFromOptions(vision, options);

        if (!active) return;

        setState({
          landmarker: instance,
          ready: true,
        });
      } catch (err) {
        console.error("Failed to load HandLandmarker", err);
      }
    })();

    return () => {
      active = false;
      instance?.close();
    };
  }, [basePath, JSON.stringify(options)]);

  return (
    <HandLandmarkerContext.Provider value={state}>
      {state.ready ? children : null}
    </HandLandmarkerContext.Provider>
  );
}
