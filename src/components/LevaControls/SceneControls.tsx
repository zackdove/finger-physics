import { button, useControls } from "leva";

export const useSceneControls = () => {
  const controls = useControls("Scene", {
    backgroundColor: {
      value: "#ff0000", // A dark gray for the background
      label: "Background Color",
    },
    sphereColor: {
      value: "#ff0000", // Red for the general spheres
      label: "Sphere Color",
    },
    sphereSize: {
      value: 1, // Default size for general spheres
      min: 0.1,
      max: 5,
      step: 0.1,
      label: "Sphere Size",
    },
    sphereCount: {
      value: 30,
      min: 1,
      max: 500,
      step: 1,
      label: "Sphere Count",
    },
    trackedSphereColor: {
      value: "#000000", // Lime green for the tracked sphere
      label: "Tracked Sphere Color",
    },
    trackedSphereSize: {
      value: 1, // Smaller default size for the tracked sphere
      min: 0.05,
      max: 5,
      step: 0.05,
      label: "Tracked Sphere Size",
    },
    forceStrength: { value: 3, min: 0, max: 20, label: "Force Strength" },
    forceDamping: { value: 0.25, min: 0, max: 2, label: "Force Damping" },
    forceOrbitSpeed: { value: 1, min: 0, max: 5, label: "Orbit Speed" },
    note: {
      label: "About",
      value:
        "Show your index finger to interact with the scene. Built using MediaPipe Handpose and R3F.",
      editable: false,
    },
    GitHub: button(() => {
      window.open(
        "https://github.com/zackdove/hand-physics",
        "_blank",
        "noopener,noreferrer",
      );
    }),
  });

  return controls;
};
