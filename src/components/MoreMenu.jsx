import { useState } from "react";
import { COLORS } from "../constants/colors";

export function MoreMenu({ myTabs, active, setActive }) {
  const [open, setOpen] = useState(false);
  const extraTabs = myTabs.slice(5);

  return (
    <>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 60 }} />
          <div style={{ position: "fixed", bottom: 70, left: 8, background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: "8px", zIndex: 70, minWidth: 160, boxShadow: "0 -4px 20px #00000044" }}>
            {extraTabs.map(t => (
              <button key={t.id} onClick={() => { setActive(t.id); setOpen(false); }}
                style={{ width: "100%", padding: "11px 14px", background: active === t.id ? `${COLORS.accent}18` : "none", border: "none", borderRadius: 10, color: active === t.id ? COLORS.accent : COLORS.textSecondary, display: "flex", alignItems: "center", gap: 10, fontWeight: active === t.id ? 800 : 400, fontSize: 14, cursor: "pointer" }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
      <button onClick={() => setOpen(!open)} style={{ flex: 1, padding: "9px 4px 10px", background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer" }}>
        <span style={{ fontSize: 21 }}>···</span>
        <span style={{ fontSize: 9, fontWeight: 700, color: open ? COLORS.accent : COLORS.textSecondary }}>المزيد</span>
        {open && <div style={{ position: "absolute", bottom: 0, width: 28, height: 2, background: COLORS.accent, borderRadius: "2px 2px 0 0" }} />}
      </button>
    </>
  );
}
