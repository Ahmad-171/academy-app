export function ToastMsg({ msg, color }) {
  return (
    <div style={{ position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)", background: color, color: "#000", padding: "10px 28px", borderRadius: 20, fontWeight: 800, fontSize: 13, zIndex: 500, boxShadow: `0 4px 20px ${color}66`, whiteSpace: "nowrap" }}>{msg}</div>
  );
}
