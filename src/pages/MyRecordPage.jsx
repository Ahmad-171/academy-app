import { PlayerRecord } from "./PlayerRecord";

export function MyRecordPage({ user }) {
  return <PlayerRecord player={user} title="👤 ملفي" canScan />;
}
