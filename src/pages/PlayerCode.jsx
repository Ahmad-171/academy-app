import { COLORS } from "../constants/colors";
import { QRCodeImage, playerCodeValue } from "../components/QRCodeImage";

// رمز حضور اللاعب — يعرضه اللاعب على جواله ليمسحه المدرب/الإداري
// بجهازه ويسجّل حضوره أو انصرافه. الرمز ثابت خاص باللاعب.
export function PlayerCode({ player, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#000000cc", zIndex: 200 }} />
      <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: COLORS.cardBg, border: `1px solid ${COLORS.border}`, borderRadius: 20, padding: 22, width: "min(94vw,380px)", zIndex: 201 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.textPrimary }}>🎫 رمز حضوري</div>
          <button onClick={onClose} style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, color: COLORS.textSecondary, borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 16, lineHeight: 1.7 }}>
          اعرض هذا الرمز للمدرب/الإداري ليمسحه بجهازه ويسجّل حضورك أو انصرافك.
        </div>

        <div style={{ background: "#fff", padding: 16, borderRadius: 16, display: "flex", justifyContent: "center" }}>
          <QRCodeImage value={playerCodeValue(player.id)} size={230} />
        </div>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: COLORS.textPrimary }}>{player.name}</div>
          {player.membership_no != null && <div style={{ fontSize: 12, color: COLORS.accent, fontWeight: 700, marginTop: 3 }}>🎫 رقم العضوية: {player.membership_no}</div>}
        </div>
      </div>
    </>
  );
}
