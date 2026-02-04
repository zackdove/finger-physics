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

export default function BallsRapier({
  count = 40,
  sphereColor,
  sphereSize,
}: {
  count?: number;
  sphereColor: string;
  sphereSize: number;
}) {
  const bodiesRef = useRef<(RapierRigidBody | null)[]>([]);

  const { register, unregister } = useCentralForce();

  // Generate typed instances near origin
  const instances = useMemo<InstancedRigidBodyProps[]>(() => {
    const arr: InstancedRigidBodyProps[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        key: i,
        position: [rfs(40), rfs(40), rfs(40)],
        rotation: [0, 0, 0],
        linearDamping: 0.8,
        angularDamping: 0.8,
      });
    }
    return arr;
  }, [count]);

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

  useEffect(() => {
    const bodies = bodiesRef.current;
    bodies.forEach((body) => {
      if (body) register(body);
    });

    return () => {
      bodies.forEach((body) => {
        if (body) unregister(body);
      });
    };
  }, []); // run once on mount

  return (
    <InstancedRigidBodies
      ref={bodiesRef}
      instances={instances}
      colliders="ball"
    >
      <instancedMesh
        args={[sphereGeo, sphereMat, count]}
        scale={sphereSize}
        castShadow
        receiveShadow
      />
    </InstancedRigidBodies>
  );
}
