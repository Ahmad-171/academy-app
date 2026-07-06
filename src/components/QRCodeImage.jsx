import { useEffect, useState } from "react";
import QRCode from "qrcode";

// رمز الحضور المشفّر داخل باركود اللاعب. يُقرأ بنفس البادئة عند المسح.
export const ATT_PREFIX = "NZ-ATT:";
export const attendanceToken = (playerId) => `${ATT_PREFIX}${playerId}`;

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
