import * as THREE from "three";
import React, {
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { useThree } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";

export const Handpose = forwardRef(
  (
    {
      points,
      side = 1,
      depth = 0.15,
      visible = true,
      trackedSphereColor,
      trackedSphereSize,
      ...props
    },
    ref,
  ) => {
    const group = useRef();
    const { viewport } = useThree();

    // expose Object3D to parent (HandTracker expects this)
    useImperativeHandle(ref, () => group.current, []);

    useEffect(() => {
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
    }, [points, side, depth, viewport]);

    return (
      <RigidBody type="kinematicPosition" ref={group} visible={visible}>
        <mesh>
          <sphereGeometry args={[trackedSphereSize, 16, 16]} />
          <meshBasicMaterial color={trackedSphereColor} />
        </mesh>
      </RigidBody>
    );
  },
);

Handpose.displayName = "Handpose";
