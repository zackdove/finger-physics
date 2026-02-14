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
import {
  useHandLandmarker,
  useHandLandmarkerStatus,
} from "../HandLandmarker/HandLandmarker";
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

const HandTrackerInternal = forwardRef(function HandTrackerInternal(
  {
    videoSrc,
    depth,
    trackedSphereColor,
    trackedSphereSize,
    onReady,
    onCountStart,
    onCountCancel,
    onCountComplete,
    ...props
  }: {
    videoSrc: MediaStream | string;
    depth: number;
    trackedSphereColor: string;
    trackedSphereSize: number;
    onReady: () => void;
    onCountStart?: () => void;
    onCountCancel?: () => void;
    onCountComplete?: () => void;
  },
  ref,
) {
  const handLandmarker = useHandLandmarker();
  const handMarkTrackedTimeRef = useRef<number>(0);

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
    // ITS HERE
    onReady();
    console.log("Started video frame callback");
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
      handMarkTrackedTimeRef,
    }),
    [hands],
  );

  /* -------- Robust tracked time counter -------- */
  useImperativeHandle(ref, () => api, [api]);

  const trackingStartRef = useRef<number | null>(null);
  const visibleSinceRef = useRef<number | null>(null);
  const lastSeenRef = useRef<number | null>(null);
  const isCountingRef = useRef(false);

  const START_DELAY = 1; // seconds of continuous tracking required
  const FLICKER_GRACE = 0.25; // seconds allowed to briefly lose tracking

  const [handMarkTrackedTime, setHandMarkTrackedTime] = useState(0);

  useFrame(() => {
    if (!handMarkTrackedTimeRef) return;

    const now = performance.now() / 1000;
    const isVisible = !!points0;
    const wasCounting = isCountingRef.current;

    if (isVisible) {
      lastSeenRef.current = now;

      if (visibleSinceRef.current === null) {
        visibleSinceRef.current = now;
      }

      const visibleDuration = now - visibleSinceRef.current;

      if (!isCountingRef.current && visibleDuration >= START_DELAY) {
        isCountingRef.current = true;
        trackingStartRef.current = now;
        onCountStart?.();
      }

      if (isCountingRef.current && trackingStartRef.current !== null) {
        const elapsed = now - trackingStartRef.current;
        handMarkTrackedTimeRef.current = elapsed; // Update ref directly
        if (elapsed >= START_DELAY) {
          // complete once
          onCountComplete?.();
          // reset counting so we don't repeatedly call complete
          isCountingRef.current = false;
          trackingStartRef.current = null;
          visibleSinceRef.current = null;
          handMarkTrackedTimeRef.current = START_DELAY;
        }
      }

      return;
    }

    visibleSinceRef.current = null;
    trackingStartRef.current = null;
    isCountingRef.current = false;
    lastSeenRef.current = null;
    handMarkTrackedTimeRef.current = 0;
    if (wasCounting) onCountCancel?.();
  });

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
          trackedSphereColor={trackedSphereColor}
          trackedSphereSize={trackedSphereSize}
        />
      )}

      {points1 && (
        <Handpose
          ref={rightHandRef}
          points={points1}
          side={handedness0 === "Left" ? -1 : 1}
          depth={depth}
          visible
          trackedSphereColor={trackedSphereColor}
          trackedSphereSize={trackedSphereSize}
        />
      )}
    </HandTrackerContext.Provider>
  );
});

export const HandTracker = forwardRef(function HandTracker(
  {
    videoSrc: videoSrcProp,
    depth = 0.15,
    trackedSphereColor,
    trackedSphereSize,
    onReady,
    onCountStart,
    onCountCancel,
    onCountComplete,
  }: {
    videoSrc?: MediaStream | string;
    depth?: number;
    trackedSphereColor: string;
    trackedSphereSize: number;
    onReady: () => void;
    onCountStart?: () => void;
    onCountCancel?: () => void;
    onCountComplete?: () => void;
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
    <HandTrackerInternal
      ref={ref}
      videoSrc={videoSrc}
      depth={depth}
      trackedSphereColor={trackedSphereColor}
      trackedSphereSize={trackedSphereSize}
      onReady={onReady}
      onCountCancel={onCountCancel}
      onCountComplete={onCountComplete}
      onCountStart={onCountStart}
    />
  ) : null;
});
