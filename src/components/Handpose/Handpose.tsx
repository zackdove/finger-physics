import { forwardRef, type RefObject, useImperativeHandle, useRef } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody, type RapierRigidBody } from "@react-three/rapier";

type HandposeProps = {
  pointsRef: RefObject<NormalizedLandmark[] | undefined>;
  side?: number;
  visible?: boolean;
  trackedSphereColor: string;
  trackedSphereSize: number;
};

export const Handpose = forwardRef<RapierRigidBody, HandposeProps>(
  function Handpose(
    {
      pointsRef,
      side = 1,
      visible = true,
      trackedSphereColor,
      trackedSphereSize,
    },
    ref,
  ) {
    const group = useRef<RapierRigidBody | null>(null);
    const { viewport } = useThree();

    // expose Object3D to parent (HandTracker expects this)
    useImperativeHandle(ref, () => group.current!, []);

    useFrame(() => {
      const points = pointsRef.current;
      if (!group.current || !points?.length) return;
      const p = points[8];
      const nx = 0.5 - p.x;
      const aspectBoost = Math.min(
        2,
        Math.max(1, viewport.height / viewport.width),
      );
      const x = nx * viewport.width * aspectBoost * side;
      const y = (1 - p.y - 0.5) * viewport.height;
      const z = 0;

      group.current.setNextKinematicTranslation({ x, y, z });
    });

    return (
      <RigidBody type="kinematicPosition" ref={group}>
        <mesh visible={visible}>
          <sphereGeometry args={[trackedSphereSize, 16, 16]} />
          <meshBasicMaterial color={trackedSphereColor} />
        </mesh>
      </RigidBody>
    );
  },
);

Handpose.displayName = "Handpose";
