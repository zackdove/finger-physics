import React, {
  createContext,
  type RefObject,
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
import type {
  HandLandmarkerResult,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import type { RapierRigidBody } from "@react-three/rapier";
import { Handpose } from "../Handpose/Handpose";
import { useHandLandmarker } from "../HandLandmarker/HandLandmarker";
import { useVideoTexture } from "../utils/useVideoTexture";

/* ---------------------------------- */
/* Context */
/* ---------------------------------- */

export type HandTrackerApi = {
  leftHandRef: RefObject<RapierRigidBody | null>;
  rightHandRef: RefObject<RapierRigidBody | null>;
  hands: HandLandmarkerResult | null;
  handMarkTrackedTimeRef: React.MutableRefObject<number>;
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

type HandTrackerInternalProps = {
  videoSrc: MediaStream | string;
  countEnabled: boolean;
  trackedSphereColor: string;
  trackedSphereSize: number;
  onReady: () => void;
  onCountStart?: () => void;
  onCountCancel?: () => void;
  onCountComplete?: () => void;
};

const HandTrackerInternal = forwardRef<
  HandTrackerApi,
  HandTrackerInternalProps
>(function HandTrackerInternal(
  {
    videoSrc,
    countEnabled,
    trackedSphereColor,
    trackedSphereSize,
    onReady,
    onCountStart,
    onCountCancel,
    onCountComplete,
  },
  ref,
) {
  const handLandmarker = useHandLandmarker();
  const handMarkTrackedTimeRef = useRef<number>(0);

  const leftHandRef = useRef<RapierRigidBody | null>(null);
  const rightHandRef = useRef<RapierRigidBody | null>(null);
  const handsRef = useRef<HandLandmarkerResult | null>(null);
  const points0Ref = useRef<NormalizedLandmark[] | undefined>(undefined);
  const points1Ref = useRef<NormalizedLandmark[] | undefined>(undefined);
  const [handView, setHandView] = useState({
    has0: false,
    has1: false,
    handedness0: "Left",
  });

  /* -------- Detection -------- */

  const detect = useCallback(
    (video: HTMLVideoElement, time: number) => {
      if (!handLandmarker) return;
      const result = handLandmarker.detectForVideo(video, time);
      handsRef.current = result;
      points0Ref.current = result.landmarks?.[0];
      points1Ref.current = result.landmarks?.[1];
      const nextHandedness0 =
        result.handedness?.[0]?.[0]?.categoryName ??
        result.handednesses?.[0]?.[0]?.categoryName ??
        "Left";
      const nextHas0 = !!points0Ref.current;
      const nextHas1 = !!points1Ref.current;
      setHandView((prev) => {
        if (
          prev.has0 === nextHas0 &&
          prev.has1 === nextHas1 &&
          prev.handedness0 === nextHandedness0
        ) {
          return prev;
        }
        return {
          has0: nextHas0,
          has1: nextHas1,
          handedness0: nextHandedness0,
        };
      });
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
    onReady();
    return () => video.cancelVideoFrameCallback(handle);
  }, [video, detect]);

  /* -------- Hand data -------- */

  /* -------- API -------- */
  const api = useMemo<HandTrackerApi>(
    () => ({
      leftHandRef,
      rightHandRef,
      hands: handsRef.current,
      handMarkTrackedTimeRef,
    }),
    [handView],
  );

  /* -------- Robust tracked time counter -------- */
  useImperativeHandle(ref, () => api, [api]);

  const trackingStartRef = useRef<number | null>(null);
  const lastSeenRef = useRef<number | null>(null);
  const isCountingRef = useRef(false);
  const completedForCurrentVisibilityRef = useRef(false);

  const START_DELAY = 1; // seconds to hold after first detection
  const FLICKER_GRACE = 0.25; // seconds allowed to briefly lose tracking

  useFrame(() => {
    if (!handMarkTrackedTimeRef) return;

    if (!countEnabled) {
      const wasCounting = isCountingRef.current;
      if (wasCounting) onCountCancel?.();
      trackingStartRef.current = null;
      isCountingRef.current = false;
      lastSeenRef.current = null;
      completedForCurrentVisibilityRef.current = false;
      handMarkTrackedTimeRef.current = 0;
      return;
    }

    const now = performance.now() / 1000;
    const isVisible = !!points0Ref.current;
    const wasCounting = isCountingRef.current;

    if (isVisible) {
      lastSeenRef.current = now;
      if (!isCountingRef.current && !completedForCurrentVisibilityRef.current) {
        isCountingRef.current = true;
        trackingStartRef.current = now;
        onCountStart?.();
      }

      if (isCountingRef.current && trackingStartRef.current !== null) {
        const elapsed = now - trackingStartRef.current;
        handMarkTrackedTimeRef.current = elapsed; // Update ref directly
        if (elapsed >= START_DELAY) {
          onCountComplete?.();
          isCountingRef.current = false;
          completedForCurrentVisibilityRef.current = true;
          trackingStartRef.current = null;
          handMarkTrackedTimeRef.current = START_DELAY;
        }
      }

      return;
    }

    const recentlySeen =
      lastSeenRef.current !== null &&
      now - lastSeenRef.current <= FLICKER_GRACE;
    if (recentlySeen) return;

    if (wasCounting) onCountCancel?.();
    trackingStartRef.current = null;
    isCountingRef.current = false;
    lastSeenRef.current = null;
    completedForCurrentVisibilityRef.current = false;
    handMarkTrackedTimeRef.current = 0;
  });

  /* -------- Render -------- */

  return (
    <HandTrackerContext.Provider value={api}>
      {handView.has0 && (
        <Handpose
          ref={leftHandRef}
          pointsRef={points0Ref}
          side={handView.handedness0 === "Left" ? 1 : -1}
          visible
          trackedSphereColor={trackedSphereColor}
          trackedSphereSize={trackedSphereSize}
        />
      )}

      {handView.has1 && (
        <Handpose
          ref={rightHandRef}
          pointsRef={points1Ref}
          side={handView.handedness0 === "Left" ? 1 : -1}
          visible
          trackedSphereColor={trackedSphereColor}
          trackedSphereSize={trackedSphereSize}
        />
      )}
    </HandTrackerContext.Provider>
  );
});

type HandTrackerProps = {
  videoSrc?: MediaStream | string;
  countEnabled?: boolean;
  trackedSphereColor: string;
  trackedSphereSize: number;
  onReady: () => void;
  onCountStart?: () => void;
  onCountCancel?: () => void;
  onCountComplete?: () => void;
};

export const HandTracker = forwardRef<HandTrackerApi, HandTrackerProps>(
  function HandTracker(
    {
      videoSrc: videoSrcProp,
      countEnabled = true,
      trackedSphereColor,
      trackedSphereSize,
      onReady,
      onCountStart,
      onCountCancel,
      onCountComplete,
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
        countEnabled={countEnabled}
        trackedSphereColor={trackedSphereColor}
        trackedSphereSize={trackedSphereSize}
        onReady={onReady}
        onCountCancel={onCountCancel}
        onCountComplete={onCountComplete}
        onCountStart={onCountStart}
      />
    ) : null;
  },
);
