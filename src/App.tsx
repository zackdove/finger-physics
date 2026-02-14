import { Canvas } from "@react-three/fiber";

import { Suspense, useEffect, useRef, useState } from "react";
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

export default function App() {
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

  const showRef = useRef<ShowHandCTAHandle | null>(null);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const t = handTrackerRef.current?.handMarkTrackedTimeRef?.current ?? 0;
      const p = Math.min(100, Math.round((t / 1) * 100)); // 1s -> 100%
      setShowHandProgress(p);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <>
      <MediaPipeLoader visible={!mediaPipeReady} />
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
              trackedSphereColor={trackedSphereColor}
              trackedSphereSize={trackedSphereSize}
              onCountStart={() => showRef.current?.start()}
              onCountCancel={() => showRef.current?.cancel()}
              onCountComplete={() => showRef.current?.complete()}
              onReady={() => setMediaPipeReady(true)}
              ref={handTrackerRef}
            />
          </Physics>
        </Canvas>
      </HandLandmarker>
      <ShowHandCTA ref={showRef} />
    </>
  );
}
