"use client";

import { useFrame } from "@react-three/fiber";
import {
  InstancedRigidBodies,
  RapierRigidBody,
  InstancedRigidBodyProps,
} from "@react-three/rapier";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";
import { useCentralForce } from "./ForceManager";

const rfs = THREE.MathUtils.randFloatSpread;
const MAX_COUNT = 500;

export default function BallsRapier({
  count = 40,
  sphereColor,
  sphereSize,
  sphereCount,
  forceStrength,
  forceDamping,
  forceOrbitSpeed,
}: {
  count?: number;
  sphereColor: string;
  sphereSize: number;
  sphereCount: number;
  forceStrength: number;
  forceDamping: number;
  forceOrbitSpeed: number;
}) {
  const bodiesRef = useRef<(RapierRigidBody | null)[]>([]);

  const { register, unregister, setActiveCount, setParams } = useCentralForce();

  useEffect(() => {
    setActiveCount(count);
  }, [count]);

  useEffect(() => {
    setParams({ forceStrength, forceDamping, forceOrbitSpeed });
  }, [forceStrength, forceDamping, forceOrbitSpeed]);

  // Generate typed instances near origin
  const instances = useMemo<InstancedRigidBodyProps[]>(() => {
    return Array.from({ length: MAX_COUNT }, (_, i) => ({
      key: i,
      position: [9999, 9999, 9999], // parked
      rotation: [0, 0, 0],
      linearDamping: 0.8,
      angularDamping: 0.8,
    }));
  }, []);

  const activeCountRef = useRef(count);

  useEffect(() => {
    activeCountRef.current = count;
  }, [count]);

  useEffect(() => {
    activeCountRef.current = sphereCount;
    setActiveCount(sphereCount);

    const bodies = bodiesRef.current;

    bodies.forEach((body, i) => {
      if (!body) return;

      if (i < sphereCount) {
        // ACTIVATE
        body.wakeUp();
        body.setTranslation(
          {
            x: rfs(40),
            y: rfs(40),
            z: rfs(40),
          },
          true,
        );
        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
      } else {
        // DEACTIVATE
        body.setLinvel({ x: 0, y: 0, z: 0 }, true);
        body.setTranslation({ x: 9999, y: 9999, z: 9999 }, true);
      }
    });
  }, [sphereCount]);

  useEffect(() => {
    bodiesRef.current.forEach((body) => {
      if (body) register(body);
    });

    return () => {
      bodiesRef.current.forEach((body) => {
        if (body) unregister(body);
      });
    };
  }, []);

  // Texture + material
  const [zGothicTexture] = useTexture(["/textures/zGothic.jpeg"]);
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 32, 32), []);

  const sphereMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        roughness: 0,
        map: zGothicTexture,
        envMapIntensity: 1,
      }),
    [zGothicTexture],
  );

  useEffect(() => {
    sphereMat.color.set(sphereColor);
  }, [sphereColor, sphereMat]);

  return (
    <InstancedRigidBodies
      ref={bodiesRef}
      instances={instances}
      colliders="ball"
    >
      <instancedMesh
        args={[sphereGeo, sphereMat, MAX_COUNT]}
        scale={sphereSize}
        castShadow
        receiveShadow
      />
    </InstancedRigidBodies>
  );
}
