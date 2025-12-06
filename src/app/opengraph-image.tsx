import { ImageResponse } from "next/og";

// Force Node.js runtime for stability on Windows
export const runtime = "nodejs";

export const alt = "t7sen | Cyber Developer";
export const size = { width: 1280, height: 640 };
export const contentType = "image/png";

export default async function Image() {
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
          backgroundColor: "#050505",
          backgroundImage:
            "linear-gradient(#151515 1px, transparent 1px), linear-gradient(90deg, #151515 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          fontFamily: "monospace",
          position: "relative",
        }}
      >
        {/* Glow Center */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "500px",
            height: "500px",
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#1a1a1a",
            padding: "10px 24px",
            borderRadius: "100px",
            border: "1px solid #333",
            marginBottom: "40px",
            boxShadow: "0 0 20px rgba(0,255,157,0.1)",
            gap: "12px", // Space between dot and text
          }}
        >
          {/* THE FIX: CSS Circle instead of Unicode Character */}
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "#00ff9d",
              boxShadow: "0 0 10px #00ff9d",
            }}
          />

          <div
            style={{
              color: "#00ff9d",
              fontSize: 18,
              textTransform: "uppercase",
              letterSpacing: "4px",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            System Online
          </div>
        </div>

        {/* Main Title */}
        <div
          style={{
            color: "white",
            fontSize: 96,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-4px",
            marginBottom: "20px",
            textShadow: "0 0 60px rgba(255,255,255,0.2)",
            display: "flex",
          }}
        >
          t7sen.com
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: "#888",
            fontSize: 36,
            letterSpacing: "-1px",
            textAlign: "center",
          }}
        >
          Software Architect // Developer
        </div>
      </div>
    ),
    { ...size }
  );
}
