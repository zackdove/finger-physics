import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";

const targetVel = new THREE.Vector3();
const deltaVel = new THREE.Vector3();

export function useCentralForce() {
  const bodies = useRef<Set<RapierRigidBody>>(new Set());
  const activeCountRef = useRef(0);

  const params = useRef({
    forceStrength: 3,
    forceDamping: 0.25,
    forceOrbitSpeed: 1,
  });

  function setParams(p: Partial<typeof params.current>) {
    Object.assign(params.current, p);
  }

  function register(body: RapierRigidBody) {
    bodies.current.add(body);
  }

  function unregister(body: RapierRigidBody) {
    bodies.current.delete(body);
  }

  function setActiveCount(n: number) {
    activeCountRef.current = n;
  }

  useFrame((_, delta) => {
    let i = 0;

    bodies.current.forEach((body) => {
      if (i++ >= activeCountRef.current) return;

      const { forceStrength, forceDamping, forceOrbitSpeed } = params.current;

      const pos = body.translation();
      const vel = body.linvel();

      targetVel.set(-pos.x, -pos.y, -pos.z).multiplyScalar(forceStrength);
      deltaVel
        .set(targetVel.x - vel.x, targetVel.y - vel.y, targetVel.z - vel.z)
        .multiplyScalar(delta / (delta + forceDamping));

      body.setLinvel(
        {
          x: vel.x + deltaVel.x,
          y: vel.y + deltaVel.y,
          z: vel.z + deltaVel.z,
        },
        true,
      );

      const angle = forceOrbitSpeed * delta;
      const x = pos.x * Math.cos(angle) - pos.z * Math.sin(angle);
      const z = pos.x * Math.sin(angle) + pos.z * Math.cos(angle);

      body.setTranslation({ x, y: pos.y, z }, true);
    });
  });

  return { register, unregister, setActiveCount, setParams };
}
