import * as THREE from "three";
import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useFrame } from "@react-three/fiber";
import { Handpose } from "../Handpose/Handpose";
import { useHandLandmarker } from "../HandLandmarker/HandLandmarker";
import { useVideoTexture } from "../utils/useVideoTexture";

/* ---------------------------------- */
/* Context */
/* ---------------------------------- */

type HandTrackerApi = {
  leftHandRef: React.RefObject<any>;
  rightHandRef: React.RefObject<any>;
  hands: any;
};

const HandTrackerContext = createContext<HandTrackerApi | null>(null);

export const useHandTracker = () => {
  const ctx = useContext(HandTrackerContext);
  if (!ctx) throw new Error("useHandTracker must be used inside HandTracker");
  return ctx;
};

/* ---------------------------------- */
/* HandTracker */
/* ---------------------------------- */

function HandTrackerInternal({
  videoSrc,
  depth,
  ...props
}: {
  videoSrc: MediaStream | string;
  depth: number;
}) {
  const handLandmarker = useHandLandmarker();

  const leftHandRef = useRef<any>(null);
  const rightHandRef = useRef<any>(null);

  const [hands, setHands] = useState<any>(null);

  /* -------- Detection -------- */

  const detect = useCallback(
    (video: HTMLVideoElement, time: number) => {
      if (!handLandmarker) return;
      const result = handLandmarker.detectForVideo(video, time);
      setHands(result);
    },
    [handLandmarker],
  );

  /* -------- Video handling -------- */

  const texture = useVideoTexture(videoSrc, { start: !!videoSrc });
  const video = texture?.source?.data as HTMLVideoElement | undefined;

  useEffect(() => {
    if (!video || !video.requestVideoFrameCallback) return;

    let handle: number;

    const loop = (time: number) => {
      detect(video, time);
      handle = video.requestVideoFrameCallback(loop);
    };

    handle = video.requestVideoFrameCallback(loop);
    return () => video.cancelVideoFrameCallback(handle);
  }, [video, detect]);

  /* -------- Hand data -------- */

  const points0 = hands?.landmarks?.[0];
  const points1 = hands?.landmarks?.[1];

  const handedness0 = hands?.handednesses?.[0]?.[0]?.categoryName ?? "Left";

  /* -------- API -------- */

  const api = useMemo(
    () => ({
      leftHandRef,
      rightHandRef,
      hands,
    }),
    [hands],
  );

  /* -------- Render -------- */

  return (
    <HandTrackerContext.Provider value={api}>
      {points0 && (
        <Handpose
          ref={leftHandRef}
          points={points0}
          side={handedness0 === "Left" ? 1 : -1}
          depth={depth}
          visible
        />
      )}

      {points1 && (
        <Handpose
          ref={rightHandRef}
          points={points1}
          side={handedness0 === "Left" ? -1 : 1}
          depth={depth}
          visible
        />
      )}
    </HandTrackerContext.Provider>
  );
}

export const HandTracker = forwardRef(function HandTracker(
  {
    videoSrc: videoSrcProp,
    depth = 0.15,
  }: {
    videoSrc?: MediaStream | string;
    depth?: number;
  },
  ref,
) {
  const [videoSrc, setVideoSrc] = useState<MediaStream | string | undefined>(
    videoSrcProp,
  );

  useEffect(() => {
    if (videoSrcProp || !navigator.mediaDevices?.getUserMedia) return;

    let stream: MediaStream;

    navigator.mediaDevices
      .getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      })
      .then((s) => {
        stream = s;
        setVideoSrc(s);
      });

    return () => {
      stream?.getTracks()?.forEach((track) => track.stop());
    };
  }, [videoSrcProp]);

  return videoSrc ? (
    <HandTrackerInternal videoSrc={videoSrc} depth={depth} />
  ) : null;
});
