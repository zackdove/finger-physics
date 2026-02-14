import { Canvas } from "@react-three/fiber";
import gsap from "gsap";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Environment, Loader, Sphere } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { HandLandmarker } from "./components/HandLandmarker/HandLandmarker";
import {
  HandTracker,
  HandTrackerApi,
} from "./components/HandTracker/HandTracker";
import BallsRapier from "./components/Balls";
import { MediaPipeLoader } from "./components/MediaPipeLoader";
import { MediaPipeReadySignal } from "./components/MediaPipeReadySignal";
import { useSceneControls } from "./components/LevaControls/SceneControls";
import {
  ShowHandCTA,
  ShowHandCTAHandle,
} from "./components/ShowHandCTA/ShowHandCTA";
import { LoadScreen } from "./components/LoadScreen/LoadScreen";
import { BlurOverlay } from "./components/BlurOverlay/BlurOverlay";

export default function App() {
  const HAND_CTA_STORAGE_KEY = "hand_cta_shown";
  const queryPersistValue =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("handCtaPersist")
      : null;
  const envPersistEnabled =
    String(import.meta.env.VITE_PERSIST_HAND_CTA ?? "true") === "true";
  const persistHandCTA =
    queryPersistValue === "0"
      ? false
      : queryPersistValue === "1"
        ? true
        : envPersistEnabled;

  const [mediaPipeReady, setMediaPipeReady] = useState(false);
  const {
    backgroundColor,
    sphereColor,
    sphereSize,
    sphereCount,
    trackedSphereColor,
    trackedSphereSize,
    forceStrength,
    forceDamping,
    forceOrbitSpeed,
  } = useSceneControls();

  const handTrackerRef = useRef<HandTrackerApi | null>(null);
  const [showHandProgress, setShowHandProgress] = useState(0);
  const [isCTAEnabled, setIsCTAEnabled] = useState(false);
  const [hasShownHandCTA, setHasShownHandCTA] = useState(() => {
    if (!persistHandCTA || typeof window === "undefined") return false;
    return window.localStorage.getItem(HAND_CTA_STORAGE_KEY) === "1";
  });

  const showRef = useRef<ShowHandCTAHandle | null>(null);
  const completeHideTimeoutRef = useRef<number | null>(null);
  const blurHideTimeoutRef = useRef<number | null>(null);
  const revealCTADelayRef = useRef<gsap.core.Tween | null>(null);
  const [isBlurVisible, setIsBlurVisible] = useState(false);
  const canRunCTA = isCTAEnabled && !hasShownHandCTA;
  const handleLoadScreenHidden = useCallback(() => {
    revealCTADelayRef.current?.kill();
    revealCTADelayRef.current = gsap.delayedCall(0.5, () => {
      setIsCTAEnabled(true);
      revealCTADelayRef.current = null;
    });
  }, []);
  const markHandCTAShown = () => {
    setHasShownHandCTA(true);
    if (persistHandCTA && typeof window !== "undefined") {
      window.localStorage.setItem(HAND_CTA_STORAGE_KEY, "1");
    }
  };

  useEffect(() => {
    return () => {
      if (completeHideTimeoutRef.current !== null) {
        window.clearTimeout(completeHideTimeoutRef.current);
      }
      if (blurHideTimeoutRef.current !== null) {
        window.clearTimeout(blurHideTimeoutRef.current);
      }
      revealCTADelayRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (!mediaPipeReady) return;
    if (hasShownHandCTA) return;
    setIsBlurVisible(true);
  }, [mediaPipeReady, hasShownHandCTA]);

  return (
    <>
      {/* <MediaPipeLoader visible={!mediaPipeReady} /> */}
      <HandLandmarker>
        <Canvas
          camera={{
            position: new THREE.Vector3(0, 0, 20),
            fov: 35,
            near: 1,
            far: 40,
          }}
          style={{
            width: "100%",
            position: "fixed",
            height: "100%",
            top: "0",
            left: "0",
          }}
          gl={{ antialias: true }}
          onCreated={({ gl }) => {
            gl.setClearColor(new THREE.Color(backgroundColor));
          }}
        >
          <color attach="background" args={[backgroundColor]} />
          <ambientLight intensity={0.4} />
          <spotLight
            intensity={1}
            angle={0.2}
            penumbra={1}
            position={[30, 30, 30]}
            castShadow
            shadow-mapSize={[512, 512]}
          />

          <Environment
            background={false}
            files={[
              "/images/preller_drive_1k.webp",
              "/images/preller_drive_1k-gainmap.webp",
              "/images/preller_drive_1k.json",
            ]}
            backgroundIntensity={0.2}
          />

          <Physics gravity={[0, 0, 0]}>
            <BallsRapier
              sphereColor={sphereColor}
              sphereSize={sphereSize}
              sphereCount={sphereCount}
              forceStrength={forceStrength}
              forceDamping={forceDamping}
              forceOrbitSpeed={forceOrbitSpeed}
            />

            <HandTracker
              countEnabled={canRunCTA}
              trackedSphereColor={trackedSphereColor}
              trackedSphereSize={trackedSphereSize}
              onCountStart={() => {
                if (canRunCTA) showRef.current?.start();
              }}
              onCountCancel={() => {
                if (canRunCTA) showRef.current?.cancel();
              }}
              onCountComplete={() => {
                if (canRunCTA) {
                  showRef.current?.complete();
                  if (blurHideTimeoutRef.current !== null) {
                    window.clearTimeout(blurHideTimeoutRef.current);
                  }
                  blurHideTimeoutRef.current = window.setTimeout(() => {
                    setIsBlurVisible(false);
                    blurHideTimeoutRef.current = null;
                  }, 700);
                  if (completeHideTimeoutRef.current !== null) {
                    window.clearTimeout(completeHideTimeoutRef.current);
                  }
                  completeHideTimeoutRef.current = window.setTimeout(() => {
                    markHandCTAShown();
                    completeHideTimeoutRef.current = null;
                  }, 1100);
                }
              }}
              onReady={() => setMediaPipeReady(true)}
              ref={handTrackerRef}
            />
          </Physics>
        </Canvas>
      </HandLandmarker>
      <BlurOverlay visible={isBlurVisible} />
      {canRunCTA && <ShowHandCTA ref={showRef} />}
      <LoadScreen
        visible={!mediaPipeReady}
        onHidden={handleLoadScreenHidden}
      />
    </>
  );
}
