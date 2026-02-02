import { Canvas } from "@react-three/fiber";

import { Suspense, useEffect, useState } from "react";
import { Environment, Loader, Sphere } from "@react-three/drei";
import * as THREE from "three";
import { HandLandmarker } from "./components/HandLandmarker/HandLandmarker";
import { HandTracker } from "./components/HandTracker/HandTracker";

export default function App() {
  return (
    <>
      {/* <Leva /> */}
      <Suspense fallback={<Loader />}>
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
        >
          <ambientLight intensity={0.4} />
          <spotLight
            intensity={1}
            angle={0.2}
            penumbra={1}
            position={[30, 30, 30]}
            castShadow
            shadow-mapSize={[512, 512]}
          />
          <Sphere>
            <meshStandardMaterial />
          </Sphere>
          <Environment
            background={false}
            files={[
              "/images/preller_drive_1k.webp",
              "/images/preller_drive_1k-gainmap.webp",
              "/images/preller_drive_1k.json",
            ]}
            backgroundIntensity={0.2}
          />
          {/* <Physics>
            <HandSphere handPosRef={handPosRef} />
            <Balls count={ballCount} handPosRef={handPosRef} />
          </Physics> */}

          <Suspense fallback={<Loader />}>
            <HandLandmarker>
              <HandTracker />
            </HandLandmarker>
          </Suspense>

          {/* <HandLandmarker> */}
          {/* <Physics gravity={[0, 0, 0]}> */}
          {/* <HandTracker /> */}
          {/* </Physics> */}
          {/* </HandLandmarker> */}
        </Canvas>
      </Suspense>
    </>
  );
}
