import { useControls } from "leva";

export const useSceneControls = () => {
  const controls = useControls("Scene", {
    backgroundColor: {
      value: "#121212", // A dark gray for the background
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
      value: "#00ff00", // Lime green for the tracked sphere
      label: "Tracked Sphere Color",
    },
    trackedSphereSize: {
      value: 0.2, // Smaller default size for the tracked sphere
      min: 0.05,
      max: 1,
      step: 0.05,
      label: "Tracked Sphere Size",
    },
  });

  return controls;
};
