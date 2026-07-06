import { COLORS } from "../constants/colors";
import { PlayerRecord } from "./PlayerRecord";

export function MyChildPage({ user, users }) {
  const child = users.find(u => u.id === user.childId);

  if (!child) return (
    <div style={{ padding: "60px 24px", textAlign: "center", color: COLORS.textSecondary }}>
      <div style={{ fontSize: 44, marginBottom: 12 }}>👨‍👦</div>
      <div>لا يوجد لاعب مرتبط بحسابك — تواصل مع الإدارة لربط ملف ولدك</div>
    </div>
  );

  return <PlayerRecord player={child} title="👨‍👦 ملف ولدي" />;
}
