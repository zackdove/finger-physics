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
      const x = (1 - p.x - 0.5) * viewport.width * side;
      const y = (1 - p.y - 0.5) * viewport.height;
      const z = -p.z * viewport.width * depth;

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
