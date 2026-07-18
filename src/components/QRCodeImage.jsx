import { useEffect, useState } from "react";
import QRCode from "qrcode";

// بادئة رموز الحضور. الباركود اليومي يعرضه المدير واللاعبون يمسحونه.
export const ATT_PREFIX = "NZ-ATT:";
// باركود اليوم: يشفّر الإجراء (حضور/انصراف) + التاريخ + توكن اليوم
export const dailyAttValue = (action, date, token) => `${ATT_PREFIX}${action}:${date}:${token}`;

// رمز اللاعب: يعرضه اللاعب على جواله والمدرب يمسحه لتسجيل حضوره/انصرافه.
export const PLAYER_PREFIX = "NZ-PLAYER:";
export const playerCodeValue = (id) => `${PLAYER_PREFIX}${id}`;

export function QRCodeImage({ value, size = 200 }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(value, { width: size, margin: 1 }).then(url => { if (alive) setDataUrl(url); });
    return () => { alive = false; };
  }, [value, size]);

  if (!dataUrl) return <div style={{ width: size, height: size }} />;
  return <img src={dataUrl} alt="QR" width={size} height={size} style={{ borderRadius: 10, display: "block" }} />;
}
