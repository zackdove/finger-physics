import { forwardRef, useImperativeHandle, useEffect, useRef, useState } from "react";
import gsap from "gsap";

export type ShowHandCTAHandle = {
  start: () => void;
  cancel: () => void;
  complete: () => void;
};

type ShowHandCTAProps = {
  onExitComplete?: () => void;
};

type CTAState = "entering" | "idle" | "holding" | "completing" | "hidden";

export const ShowHandCTA = forwardRef<ShowHandCTAHandle, ShowHandCTAProps>(
  function ShowHandCTA({ onExitComplete }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const barRef = useRef<HTMLDivElement | null>(null);
    const checkRef = useRef<HTMLSpanElement | null>(null);
    const stateRef = useRef<CTAState>("entering");
    const pendingStartRef = useRef(false);
    const enterRaf1Ref = useRef<number | null>(null);
    const enterRaf2Ref = useRef<number | null>(null);
    const enterTlRef = useRef<gsap.core.Tween | null>(null);
    const holdTlRef = useRef<gsap.core.Tween | null>(null);
    const completeTlRef = useRef<gsap.core.Timeline | null>(null);
    const [phase, setPhase] = useState<"idle" | "holding" | "complete">("idle");
    const message =
      phase === "idle"
        ? "Please raise a finger to the camera"
        : phase === "holding"
          ? "Hold"
          : "Complete";

    useEffect(() => {
      if (containerRef.current && barRef.current && checkRef.current) {
        gsap.set(containerRef.current, { autoAlpha: 0, display: "block" });
        gsap.set(barRef.current, { width: "0%" });
        gsap.set(checkRef.current, { autoAlpha: 0, scale: 0.8 });
        stateRef.current = "entering";
        enterRaf1Ref.current = window.requestAnimationFrame(() => {
          enterRaf2Ref.current = window.requestAnimationFrame(() => {
            if (!containerRef.current) return;
            enterTlRef.current = gsap.to(containerRef.current, {
              autoAlpha: 1,
              duration: 0.35,
              ease: "power2.out",
              onComplete: () => {
                stateRef.current = "idle";
                if (pendingStartRef.current && barRef.current) {
                  pendingStartRef.current = false;
                  setPhase("holding");
                  stateRef.current = "holding";
                  holdTlRef.current?.kill();
                  gsap.set(barRef.current, { width: "0%" });
                  holdTlRef.current = gsap.to(barRef.current, {
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
        enterTlRef.current?.kill();
        holdTlRef.current?.kill();
        completeTlRef.current?.kill();
      };
    }, []);

    useImperativeHandle(ref, () => ({
      start: () => {
        if (!barRef.current || !containerRef.current || !checkRef.current) return;
        if (stateRef.current === "completing" || stateRef.current === "hidden") return;
        if (stateRef.current === "entering") {
          pendingStartRef.current = true;
          return;
        }
        pendingStartRef.current = false;
        stateRef.current = "holding";
        setPhase("holding");
        containerRef.current.style.display = "block";
        gsap.set(checkRef.current, { autoAlpha: 0, scale: 0.8 });
        gsap.to(containerRef.current, {
          autoAlpha: 1,
          duration: 0.12,
          ease: "power1.out",
        });
        completeTlRef.current?.kill();
        holdTlRef.current?.kill();
        gsap.set(barRef.current, { width: "0%" });
        holdTlRef.current = gsap.to(barRef.current, {
          width: "100%",
          duration: 1,
          ease: "linear",
        });
      },
      cancel: () => {
        pendingStartRef.current = false;
        if (!barRef.current || !containerRef.current || !checkRef.current) return;
        if (stateRef.current === "hidden") return;
        stateRef.current = "idle";
        setPhase("idle");
        holdTlRef.current?.kill();
        completeTlRef.current?.kill();
        gsap.to(barRef.current, {
          width: "0%",
          duration: 0.12,
          ease: "power1.out",
        });
        containerRef.current.style.display = "block";
        gsap.to(containerRef.current, { autoAlpha: 1, duration: 0.08 });
        gsap.set(checkRef.current, { autoAlpha: 0, scale: 0.8 });
      },
      complete: () => {
        if (!containerRef.current || !barRef.current || !checkRef.current) return;
        if (stateRef.current === "hidden" || stateRef.current === "completing") return;
        pendingStartRef.current = false;
        stateRef.current = "completing";
        setPhase("complete");
        holdTlRef.current?.kill();
        completeTlRef.current?.kill();
        gsap.set(barRef.current, { width: "100%" });
        containerRef.current.style.display = "block";
        gsap.set(containerRef.current, { autoAlpha: 1 });
        completeTlRef.current = gsap
          .timeline({
            onComplete: () => {
              if (containerRef.current) containerRef.current.style.display = "none";
              stateRef.current = "hidden";
              onExitComplete?.();
            },
          })
          .fromTo(
            checkRef.current,
            { autoAlpha: 0, scale: 0.7 },
            { autoAlpha: 1, scale: 1, duration: 0.22, ease: "back.out(1.6)" },
          )
          .to({}, { duration: 0.7 })
          .to(containerRef.current, {
            autoAlpha: 0,
            duration: 0.25,
            ease: "power1.inOut",
          });
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
          height: 120,
          display: "block",
          pointerEvents: "none",
          color: "#ff0000",
          opacity: 0,
          zIndex: 9999,
          backgroundColor: "black",
          textTransform: "uppercase",
          padding: 12,
          textAlign: "center",
        }}
      >
        <div
          style={{
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
            height: 100,
          }}
        >
          <span>{message}</span>

          <span
            ref={checkRef}
            style={{
              opacity: 0,
              transform: "scale(0.8)",
              color: "#ff0000",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.25 17.292l-4.5-4.364 1.857-1.858 2.643 2.506 5.643-5.784 1.857 1.857-7.5 7.643z" />
            </svg>
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: 8,
            background: "#222",
            borderRadius: 0,
            overflow: "hidden",
            zIndex: 1500,
          }}
        >
          <div
            ref={barRef}
            style={{ height: "100%", background: "#ff0000", width: "0%" }}
          />
        </div>
      </div>
    );
  },
);
