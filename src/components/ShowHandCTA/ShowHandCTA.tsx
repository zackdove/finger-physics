import React, { forwardRef, useImperativeHandle, useRef } from "react";
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
    const tlRef = useRef<gsap.core.Tween | null>(null);

    useImperativeHandle(ref, () => ({
      start: () => {
        if (!barRef.current || !containerRef.current) return;
        containerRef.current.style.display = "block";
        // kill any existing tween, reset width then animate
        tlRef.current?.kill();
        gsap.set(barRef.current, { width: "0%" });
        tlRef.current = gsap.to(barRef.current, {
          width: "100%",
          duration: 1,
          ease: "linear",
          onComplete: () => {
            // optionally hide after brief delay
            gsap.to(containerRef.current!, {
              autoAlpha: 0,
              duration: 0.2,
              delay: 0.08,
            });
          },
        });
      },
      cancel: () => {
        // cancel and reset
        tlRef.current?.kill();
        if (barRef.current)
          gsap.to(barRef.current, {
            width: "0%",
            duration: 0.12,
            ease: "power1.out",
          });
        if (containerRef.current)
          gsap.to(containerRef.current, { autoAlpha: 1, duration: 0.08 });
      },
      complete: () => {
        // ensure full, then hide
        tlRef.current?.kill();
        if (barRef.current) gsap.set(barRef.current, { width: "100%" });
        if (containerRef.current)
          gsap.to(containerRef.current, {
            autoAlpha: 0,
            duration: 0.2,
            delay: 0.08,
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
          display: "block",
          opacity: 1,
        }}
      >
        <div style={{ marginBottom: 8 }}>Hold for 1s</div>
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
