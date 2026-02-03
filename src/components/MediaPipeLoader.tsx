export function MediaPipeLoader({ visible }: { visible: boolean }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(10px)",
        color: "white",
        zIndex: 20,
        fontFamily: "system-ui, sans-serif",
        transition: "opacity 0.5s ease",
        opacity: visible ? 1 : 0,
        pointerEvents: "none",
      }}
    >
      <div>Initialising hand tracking…</div>
    </div>
  );
}
