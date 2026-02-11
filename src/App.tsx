import { Canvas } from "@react-three/fiber";

import { Suspense, useEffect, useState } from "react";
import { Environment, Loader, Sphere } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";
import * as THREE from "three";
import { HandLandmarker } from "./components/HandLandmarker/HandLandmarker";
import { HandTracker } from "./components/HandTracker/HandTracker";
import BallsRapier from "./components/Balls";
import { MediaPipeLoader } from "./components/MediaPipeLoader";
import { MediaPipeReadySignal } from "./components/MediaPipeReadySignal";
import { useSceneControls } from "./components/LevaControls/SceneControls";

function Ball() {
  return (
    <RigidBody colliders="ball" position={[0, 5, 0]}>
      <Sphere>
        <meshStandardMaterial />
      </Sphere>
    </RigidBody>
  );
}

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

  return (
    <>
      <MediaPipeLoader visible={!mediaPipeReady} />

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

          <HandLandmarker>
            <MediaPipeReadySignal onReady={() => setMediaPipeReady(true)} />
            <HandTracker
              trackedSphereColor={trackedSphereColor}
              trackedSphereSize={trackedSphereSize}
            />
          </HandLandmarker>
        </Physics>
      </Canvas>
    </>
  );
}
