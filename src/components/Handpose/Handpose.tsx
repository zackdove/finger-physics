import * as THREE from "three";
import React, {
  forwardRef,
  useRef,
  useEffect,
  useImperativeHandle,
} from "react";
import { useThree } from "@react-three/fiber";

export const Handpose = forwardRef(
  ({ points, side = 1, depth = 0.15, visible = true, ...props }, ref) => {
    const group = useRef();
    const { viewport } = useThree();

    // expose Object3D to parent (HandTracker expects this)
    useImperativeHandle(ref, () => group.current, []);

    useEffect(() => {
      if (!group.current || !points?.length) return;

      // wrist landmark (0)
      const p = points[0];

      // MediaPipe → Three.js space
      const x = (1 - p.x - 0.5) * viewport.width * side;
      const y = (1 - p.y - 0.5) * viewport.height;
      const z = -p.z * viewport.width * depth;

      group.current.position.set(x, y, z);
    }, [points, side, depth, viewport]);

    return (
      <group ref={group} visible={visible} {...props}>
        {/* minimal debug visual */}
        <mesh>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color="lime" />
        </mesh>
      </group>
    );
  },
);

Handpose.displayName = "Handpose";
