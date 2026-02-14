import { useEffect, useRef } from "react";
import gsap from "gsap";

export function BlurOverlay({ visible }: { visible: boolean }) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!overlayRef.current) return;

    tweenRef.current?.kill();

    if (visible) {
      overlayRef.current.style.display = "block";
      tweenRef.current = gsap.to(overlayRef.current, {
        autoAlpha: 1,
        duration: 0.25,
        ease: "power1.out",
      });
      return;
    }

    tweenRef.current = gsap.to(overlayRef.current, {
      autoAlpha: 0,
      duration: 0.25,
      ease: "power1.inOut",
      onComplete: () => {
        if (overlayRef.current) overlayRef.current.style.display = "none";
      },
    });
  }, [visible]);

  useEffect(() => {
    return () => {
      tweenRef.current?.kill();
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        display: "none",
        opacity: 0,
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
        pointerEvents: "none",
      }}
    />
  );
}
