// إذا رُفع شعار مخصص (src) نعرضه داخل بطاقة بيضاء أنيقة بمقاس مضبوط
// (يناسب الشعارات ذات الخلفية البيضاء أو الشفافة)، وإلا نعرض الشعار
// الافتراضي (SVG).
export function Logo({ size = 64, src }) {
  if (src) {
    return (
      <div style={{
        width: size, height: size, borderRadius: size * 0.22,
        background: "#fff", padding: size * 0.08, boxSizing: "border-box",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 10px #00000033", flexShrink: 0,
      }}>
        <img src={src} alt="logo" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", display: "block" }} />
      </div>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="nzShield" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f3d4a" />
          <stop offset="100%" stopColor="#0a2530" />
        </linearGradient>
        <linearGradient id="nzWave" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0d5a63" />
          <stop offset="100%" stopColor="#1fc7c7" />
        </linearGradient>
      </defs>
      <path d="M50 4 L90 18 V50 C90 74 73 90 50 96 C27 90 10 74 10 50 V18 Z" fill="url(#nzShield)" />
      <circle cx="47" cy="42" r="20" fill="none" stroke="#eafcfc" strokeWidth="2.5" />
      <path d="M47 24v36M31 42h32M35 30l24 24M59 30L35 54" stroke="#eafcfc" strokeWidth="1.6" opacity="0.85" />
      <g fill="none" stroke="url(#nzWave)" strokeWidth="4.5" strokeLinecap="round">
        <path d="M18 62 C34 54 46 70 62 60 C72 54 78 48 84 40" />
        <path d="M14 70 C30 62 44 78 60 68 C70 62 76 56 82 48" opacity="0.85" />
        <path d="M22 78 C36 70 48 84 62 76" opacity="0.7" />
      </g>
    </svg>
  );
}
