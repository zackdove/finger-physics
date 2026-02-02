import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { RapierRigidBody } from "@react-three/rapier";

const targetVel = new THREE.Vector3();
const deltaVel = new THREE.Vector3();

export function useCentralForce(strength = 3, damping = 0.25) {
  const bodies = useRef<Set<RapierRigidBody>>(new Set());

  function register(body: RapierRigidBody) {
    bodies.current.add(body);
  }

  function unregister(body: RapierRigidBody) {
    bodies.current.delete(body);
  }

  useFrame((_, delta) => {
    bodies.current.forEach((body) => {
      const pos = body.translation();
      const vel = body.linvel();

      // --- Linear pull toward center ---
      targetVel.set(-pos.x, -pos.y, -pos.z).multiplyScalar(strength);
      deltaVel
        .set(targetVel.x - vel.x, targetVel.y - vel.y, targetVel.z - vel.z)
        .multiplyScalar(delta / (delta + damping));

      // --- Apply central pull ---
      body.setLinvel(
        {
          x: vel.x + deltaVel.x,
          y: vel.y + deltaVel.y,
          z: vel.z + deltaVel.z,
        },
        true,
      );

      // --- Orbit around center ---
      const orbitSpeed = 1; // adjust for faster/slower rotation
      const angle = orbitSpeed * delta;

      // Simple Y-axis rotation around origin
      const x = pos.x * Math.cos(angle) - pos.z * Math.sin(angle);
      const z = pos.x * Math.sin(angle) + pos.z * Math.cos(angle);

      body.setTranslation({ x, y: pos.y, z }, true);
    });
  });

  return { register, unregister };
}
