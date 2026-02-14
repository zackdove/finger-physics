import type { VideoTexture } from "three";

type UseVideoTextureOptions = {
  unsuspend?: string;
  start?: boolean;
  crossOrigin?: string;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
};

export function useVideoTexture(
  src: MediaStream | string,
  props?: UseVideoTextureOptions & Record<string, unknown>,
): VideoTexture;
