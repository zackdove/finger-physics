import React, {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";

export type ShowHandCTAHandle = {
  start: () => void;
  cancel: () => void;
  complete: () => void;
};

export const ShowHandCTA = forwardRef<ShowHandCTAHandle, {}>(
  function ShowHandCTA(_props, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const barRef = useRef<HTMLDivElement | null>(null);
    const checkRef = useRef<HTMLSpanElement | null>(null);
    const isEnteringRef = useRef(true);
    const pendingStartRef = useRef(false);
    const enterRaf1Ref = useRef<number | null>(null);
    const enterRaf2Ref = useRef<number | null>(null);
    const tlRef = useRef<gsap.core.Tween | null>(null);
    const hideTimeoutRef = useRef<number | null>(null);
    const [phase, setPhase] = useState<"idle" | "holding" | "complete">("idle");
    const message =
      phase === "idle"
        ? "Please raise a hand to the camera"
        : phase === "holding"
          ? "Hold"
          : "Complete";

    useEffect(() => {
      if (containerRef.current) {
        gsap.set(containerRef.current, { autoAlpha: 0 });
        enterRaf1Ref.current = window.requestAnimationFrame(() => {
          enterRaf2Ref.current = window.requestAnimationFrame(() => {
            if (!containerRef.current) return;
            gsap.to(containerRef.current, {
              autoAlpha: 1,
              duration: 0.35,
              ease: "power2.out",
              onComplete: () => {
                isEnteringRef.current = false;
                if (pendingStartRef.current && barRef.current && containerRef.current) {
                  pendingStartRef.current = false;
                  tlRef.current?.kill();
                  gsap.set(barRef.current, { width: "0%" });
                  tlRef.current = gsap.to(barRef.current, {
                    width: "100%",
                    duration: 1,
                    ease: "linear",
                  });
                }
              },
            });
          });
        });
      }

      return () => {
        if (enterRaf1Ref.current !== null) {
          window.cancelAnimationFrame(enterRaf1Ref.current);
        }
        if (enterRaf2Ref.current !== null) {
          window.cancelAnimationFrame(enterRaf2Ref.current);
        }
        if (hideTimeoutRef.current !== null) {
          window.clearTimeout(hideTimeoutRef.current);
        }
      };
    }, []);

    useImperativeHandle(ref, () => ({
      start: () => {
        if (!barRef.current || !containerRef.current) return;
        if (hideTimeoutRef.current !== null) {
          window.clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        setPhase("holding");
        containerRef.current.style.display = "block";
        if (checkRef.current)
          gsap.set(checkRef.current, { autoAlpha: 0, scale: 0.8 });
        if (isEnteringRef.current) {
          pendingStartRef.current = true;
          return;
        }
        pendingStartRef.current = false;
        gsap.to(containerRef.current, {
          autoAlpha: 1,
          duration: 0.12,
          ease: "power1.out",
        });
        tlRef.current?.kill();
        gsap.set(barRef.current, { width: "0%" });
        tlRef.current = gsap.to(barRef.current, {
          width: "100%",
          duration: 1,
          ease: "linear",
        });
      },
      cancel: () => {
        if (hideTimeoutRef.current !== null) {
          window.clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        setPhase("idle");
        tlRef.current?.kill();
        if (barRef.current)
          gsap.to(barRef.current, {
            width: "0%",
            duration: 0.12,
            ease: "power1.out",
          });
        if (containerRef.current) {
          containerRef.current.style.display = "block";
          gsap.to(containerRef.current, { autoAlpha: 1, duration: 0.08 });
        }
        if (checkRef.current)
          gsap.set(checkRef.current, { autoAlpha: 0, scale: 0.8 });
      },
      complete: () => {
        if (!containerRef.current) return;
        if (hideTimeoutRef.current !== null) {
          window.clearTimeout(hideTimeoutRef.current);
          hideTimeoutRef.current = null;
        }
        tlRef.current?.kill();
        if (barRef.current) gsap.set(barRef.current, { width: "100%" });
        setPhase("complete");
        if (checkRef.current) {
          gsap.fromTo(
            checkRef.current,
            { autoAlpha: 0, scale: 0.7 },
            { autoAlpha: 1, scale: 1, duration: 0.22, ease: "back.out(1.6)" },
          );
        }
        containerRef.current.style.display = "block";
        gsap.set(containerRef.current, { autoAlpha: 1 });
        hideTimeoutRef.current = window.setTimeout(() => {
          if (!containerRef.current) return;
          gsap.to(containerRef.current, {
            autoAlpha: 0,

            duration: 0.25,
            ease: "power1.inOut",
            onComplete: () => {
              if (containerRef.current)
                containerRef.current.style.display = "none";
            },
          });
          hideTimeoutRef.current = null;
        }, 700);
      },
    }));

    return (
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 220,
          display: "block",
          pointerEvents: "none",
          opacity: 0,
          zIndex: 9999,
        }}
      >
        <div
          style={{
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>{message}</span>
          <span
            ref={checkRef}
            style={{
              opacity: 0,
              transform: "scale(0.8)",
              color: "#22c55e",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            ✓
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: 8,
            background: "#222",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            ref={barRef}
            style={{ height: "100%", background: "#4ade80", width: "0%" }}
          />
        </div>
      </div>
    );
  },
);
