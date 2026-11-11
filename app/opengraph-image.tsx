import { ImageResponse } from "next/og";

export const alt = "Bilan — le bilan de tes clients part tout seul, le 1er du mois";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImageApercu() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#14213D",
          color: "#F6F3EC",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 700 }}>
          Bilan
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: -2,
          }}
        >
          Le bilan de tes clients part tout seul, le 1er du mois.
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#D9480F" }}>
          39 € par mois · 10 clients suivis
        </div>
      </div>
    ),
    size,
  );
}
