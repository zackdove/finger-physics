import LoadingText from "./LoadingText";

export function Loader({ visible = true }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        top: "0",
        left: "0",
        position: "fixed",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "opacity 0.3s",
        backgroundColor: "red",
        color: "black",
        opacity: visible ? "1" : "0",
      }}
    >
      <LoadingText />
    </div>
  );
}
