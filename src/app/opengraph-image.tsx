import { ImageResponse } from "next/og";

export const alt = "BUBBLEPOPS ZAIBATSU | JOIN THE GUILD";
export const size = { width: 1200, height: 630 };
export const contentType = "image/Avatar_waving.png";

export default async function Image() {
  // We use standard fonts available in Edge Runtime for OG generation
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#000000",
          backgroundImage: "linear-gradient(to bottom, #000000, #0a0a0a)",
          position: "relative",
          fontFamily: "monospace",
        }}
      >
        {/* Background Grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(#00ffff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            opacity: 0.1,
          }}
        />

        {/* Status Bar */}
        <div style={{ display: 'flex', color: '#ff0033', fontSize: 24, marginBottom: 20, letterSpacing: '4px' }}>
          SEASON PURGE IMMINENT
        </div>

        {/* Main Title */}
        <div
          style={{
            color: "#fff",
            fontSize: 100,
            fontWeight: 900,
            textShadow: "4px 4px 0 #00ffff",
            lineHeight: 1,
            marginBottom: 20,
            textTransform: "uppercase",
          }}
        >
          ZAIBATSU
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
           <div style={{ color: "#00ffff", fontSize: 32, letterSpacing: '2px', border: '2px solid #00ffff', padding: '10px 20px' }}>
             50 SEATS ONLY
           </div>
           <div style={{ color: "#666", fontSize: 32 }}>
             //
           </div>
           <div style={{ color: "#ff0033", fontSize: 32, letterSpacing: '2px' }}>
             INNER CIRCLE
           </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 40, color: '#333', fontSize: 18 }}>
          SIGNAL_INJECTION_ENGINE // V1.0
        </div>
      </div>
    ),
    { ...size }
  );
}