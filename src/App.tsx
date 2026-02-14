import { Canvas } from "@react-three/fiber";
import gsap from "gsap";

import { useCallback, useEffect, useRef, useState } from "react";
import { Environment } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import * as THREE from "three";
import { HandLandmarker } from "./components/HandLandmarker/HandLandmarker";
import { HandTracker } from "./components/HandTracker/HandTracker";
import BallsRapier from "./components/Balls";
import { useSceneControls } from "./components/LevaControls/SceneControls";
import {
  ShowHandCTA,
  ShowHandCTAHandle,
} from "./components/ShowHandCTA/ShowHandCTA";
import { LoadScreen } from "./components/LoadScreen/LoadScreen";
import { BlurOverlay } from "./components/BlurOverlay/BlurOverlay";
import { Leva } from "leva";
import { levaTheme } from "./config/levaTheme";

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

  const [isCTAEnabled, setIsCTAEnabled] = useState(false);
  const [hasShownHandCTA, setHasShownHandCTA] = useState(() => {
    if (!persistHandCTA || typeof window === "undefined") return false;
    return window.localStorage.getItem(HAND_CTA_STORAGE_KEY) === "1";
  });

  const showRef = useRef<ShowHandCTAHandle | null>(null);
  const revealCTADelayRef = useRef<gsap.core.Tween | null>(null);
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
      revealCTADelayRef.current?.kill();
    };
  }, []);

  return (
    <>
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
                }
              }}
              onReady={() => setMediaPipeReady(true)}
            />
          </Physics>
        </Canvas>
        <div className="leva-wrapper">
          <Leva
            fill
            theme={levaTheme}
            collapsed
            hideCopyButton
            titleBar={{
              title: "Controls",
              filter: false,
            }}
          />
        </div>
      </HandLandmarker>
      <BlurOverlay visible={mediaPipeReady && !hasShownHandCTA} />
      {canRunCTA && (
        <ShowHandCTA
          ref={showRef}
          onExitComplete={() => {
            markHandCTAShown();
          }}
        />
      )}
      <LoadScreen visible={!mediaPipeReady} onHidden={handleLoadScreenHidden} />
    </>
  );
}
