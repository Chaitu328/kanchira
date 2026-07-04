import { useEffect, useRef, useState, useCallback } from "react";
import arrowImg from "../assets/images/arrow_2-removebg-preview.png";

// ── Segments — exactly matching Image 2 ─────────────────────────────────────
const SEGMENTS = [
  { pct: "40%", value: 40 },
  { pct: "45%", value: 45 },
  { pct: "50%", value: 50 },
  { pct: "10%", value: 10 },
  { pct: "15%", value: 15 },
  { pct: "20%", value: 20 },
  { pct: "25%", value: 25 },
  { pct: "30%", value: 30 },
  { pct: "35%", value: 35 },
];

const N      = SEGMENTS.length;
const SLICE  = (2 * Math.PI) / N;

// Alternating light yellow / darker yellow — exactly like Image 2
const COLORS = ["#FFF8C6", "#FFE47A"];

const SIZE    = 360;
const R       = 158;
const INNER_R = 50;
const CX      = SIZE / 2;
const CY      = SIZE / 2;

export default function DiscountSpin({ onClose, onWin }) {
  const canvasRef  = useRef(null);
  const angleRef   = useRef(0);
  const hasSpunRef = useRef(false);
  const rafRef     = useRef(null);

  const [spinning,  setSpinning]  = useState(false);
  const [wonValue,  setWonValue]  = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  // ── Draw wheel ─────────────────────────────────────────────────────────────
  const draw = useCallback((angle = 0, isSpinning = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, SIZE, SIZE);

    ctx.save();
    ctx.translate(CX, CY);

    // Outer gold ring
    ctx.beginPath();
    ctx.arc(0, 0, R + 8, 0, 2 * Math.PI);
    ctx.strokeStyle = "#F5C400";
    ctx.lineWidth   = 10;
    ctx.stroke();

    // Segments
    ctx.rotate(angle);
    for (let i = 0; i < N; i++) {
      const s = i * SLICE;
      const e = s + SLICE;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, s, e);
      ctx.closePath();
      ctx.fillStyle   = COLORS[i % 2];
      ctx.fill();
      ctx.strokeStyle = "#D4A800";
      ctx.lineWidth   = 1.5;
      ctx.stroke();

      // Text — rotated to read outward from centre (matching Image 2 orientation)
      const mid = s + SLICE / 2;
      const tx  = Math.cos(mid) * R * 0.68;
      const ty  = Math.sin(mid) * R * 0.68;
      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(mid + Math.PI / 2);
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle    = "#CC0000";
      ctx.font         = "bold 15px Arial, sans-serif";
      ctx.fillText(SEGMENTS[i].pct, 0, -7);
      ctx.font         = "bold 12px Arial, sans-serif";
      ctx.fillText("OFF",           0,  8);
      ctx.restore();
    }

    // Centre hub — golden gradient, "SPIN" text
    ctx.rotate(-angle); // undo rotation so hub stays fixed
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, INNER_R);
    grad.addColorStop(0, "#FFE94D");
    grad.addColorStop(1, "#EDAC00");
    ctx.beginPath();
    ctx.arc(0, 0, INNER_R, 0, 2 * Math.PI);
    ctx.fillStyle   = grad;
    ctx.fill();
    ctx.strokeStyle = "#C89000";
    ctx.lineWidth   = 3;
    ctx.stroke();
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle    = "#8B0000";
    ctx.font         = "bold 18px Arial, sans-serif";
    ctx.fillText(isSpinning ? "..." : "SPIN", 0, 0);

    ctx.restore();
  }, []);

  // ── Mount: draw immediately via rAF so canvas is guaranteed in DOM ─────────
  useEffect(() => {
    let id;
    const tryDraw = () => {
      if (canvasRef.current) {
        draw(angleRef.current, false);
      } else {
        id = requestAnimationFrame(tryDraw);
      }
    };
    id = requestAnimationFrame(tryDraw);
    return () => cancelAnimationFrame(id);
  }, [draw]);

  // ── Spin ───────────────────────────────────────────────────────────────────
  const spin = () => {
    if (spinning || hasSpunRef.current) return;

    // Award lower values (10–25%) more often
    const allowed = [10, 15, 20, 25];
    const pool    = SEGMENTS
      .map((s, i) => (allowed.includes(s.value) ? i : null))
      .filter((i) => i !== null);
    const winIdx  = pool[Math.floor(Math.random() * pool.length)];

    // The arrow sits at the TOP of the canvas which is at angle = -π/2 in canvas coords.
    // We want the CENTRE of winIdx's segment to stop there.
    const segMid  = winIdx * SLICE + SLICE / 2;
    const pointer = -Math.PI / 2;
    const cur     = ((angleRef.current % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const target  = ((pointer - segMid) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const delta   = ((target - cur) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    const startA  = angleRef.current;
    const finalA  = startA + 7 * 2 * Math.PI + delta;
    const dur     = 5200;
    const t0      = performance.now();
    const ease    = (t) => (t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2);

    setSpinning(true);
    hasSpunRef.current = true;

    const animate = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      angleRef.current = startA + (finalA - startA) * ease(t);
      draw(angleRef.current, t < 1);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setWonValue(SEGMENTS[winIdx].value);
        setShowPopup(true);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const handleContinue = () => {
    if (wonValue !== null) {
      const discountObj = { value: wonValue, label: `${wonValue}% OFF`, type: "percentage" };
      localStorage.setItem(
        "checkout_spin_discount",
        JSON.stringify(discountObj),
      );
      localStorage.setItem(
        "won_spin_discount",
        JSON.stringify(discountObj),
      );
      localStorage.setItem("discountSpinTime", Date.now().toString());
      if (onWin) onWin(wonValue);
    }
    setShowPopup(false);
    if (onClose) onClose();
  };

  const handleClose = () => {
    localStorage.setItem("lastSpinPopupDismissedTime", Date.now().toString());
    if (onClose) onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, zIndex: 9040,
          background: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 9050,
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: "none",
      }}>
        <div style={{
          pointerEvents: "auto",
          display: "flex", flexDirection: "column", alignItems: "center",
          position: "relative",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #8B0000 0%, #4B0082 100%)",
            borderRadius: "16px 16px 0 0",
            padding: "14px 36px 16px",
            textAlign: "center",
            border: "2px solid #FFD700",
            borderBottom: "none",
            minWidth: "320px",
          }}>
            <p style={{
              fontSize: "12px", fontWeight: 700, letterSpacing: "0.12em",
              textTransform: "uppercase", color: "#FFD700", margin: 0,
            }}>
              🎁 WELCOME! SPIN &amp; WIN
            </p>
            <p style={{
              fontSize: "20px", fontWeight: 900, color: "#fff",
              margin: "2px 0 0",
            }}>
              Your Exclusive Discount
            </p>
          </div>

          {/* Wheel body */}
          <div style={{
            background: "linear-gradient(180deg, #1A0030 0%, #0A001A 100%)",
            border: "2px solid #FFD700",
            borderTop: "none",
            borderRadius: "0 0 16px 16px",
            padding: "20px 24px 28px",
            display: "flex", flexDirection: "column", alignItems: "center",
            position: "relative",
            minWidth: "320px",
          }}>

            {/* Close button */}
            <button
              onClick={handleClose}
              aria-label="Close"
              style={{
                position: "absolute", top: "10px", right: "10px",
                width: "34px", height: "34px", borderRadius: "50%",
                border: "2px solid #FFD700",
                background: "rgba(75,0,130,0.7)",
                color: "#FFD700", fontSize: "16px", fontWeight: "bold",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 10,
              }}
            >✕</button>

            {/* Hint */}
            <p style={{
              color: "#FFD700", fontSize: "13px", fontWeight: 600,
              margin: "0 0 6px", letterSpacing: "0.04em",
            }}>
              Tap the wheel to spin!
            </p>

            {/* Arrow image + Canvas stacked */}
            <div style={{ position: "relative", display: "inline-block" }}>
              {/* Red curved arrow — positioned above wheel pointing down to top edge */}
              <img
                src={arrowImg}
                alt="pointer"
                style={{
                  position: "absolute",
                  width:  "72px",
                  height: "72px",
                  top:    "-30px",
                  left:   "50%",
                  transform: "translateX(-50%) rotate(180deg)",
                  zIndex: 5,
                  pointerEvents: "none",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))",
                }}
              />

              {/* Wheel canvas */}
              <canvas
                ref={canvasRef}
                width={SIZE}
                height={SIZE}
                onClick={spin}
                style={{
                  display: "block",
                  maxWidth: "85vw",
                  maxHeight: "85vw",
                  cursor: spinning || hasSpunRef.current ? "not-allowed" : "pointer",
                }}
              />
            </div>

            {/* SPIN NOW button */}
            {!hasSpunRef.current && (
              <button
                onClick={spin}
                style={{
                  marginTop: "18px",
                  padding: "11px 44px",
                  background: "linear-gradient(90deg, #8B0000, #4B0082)",
                  color: "#FFD700",
                  border: "2px solid #FFD700",
                  borderRadius: "30px",
                  fontSize: "15px", fontWeight: 800,
                  cursor: "pointer", letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                🎡 SPIN NOW!
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Win popup */}
      {showPopup && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9060,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: "rgba(0,0,0,0.65)",
        }}>
          <div style={{
            background: "#FFFBEB",
            padding: "32px 28px",
            borderRadius: "16px",
            textAlign: "center",
            width: "300px",
            border: "4px solid #F5C400",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>🎉</div>
            <h2 style={{ color: "#B91C1C", fontSize: "22px", fontWeight: 700, margin: "0 0 4px" }}>
              You Won!
            </h2>
            <p style={{
              color: "#7F1D1D", fontSize: "42px", fontWeight: 900, margin: "12px 0",
            }}>
              {wonValue}% OFF
            </p>
            <p style={{ color: "#555", fontSize: "13px", marginBottom: "20px" }}>
              Your discount is saved! Apply it at checkout.
            </p>
            <button
              onClick={handleContinue}
              style={{
                width: "100%", padding: "12px",
                borderRadius: "12px", border: "none",
                background: "#8B0000", color: "#FFE047",
                fontSize: "16px", fontWeight: 700, cursor: "pointer",
              }}
            >
              🛒 Shop Now
            </button>
          </div>
        </div>
      )}
    </>
  );
}
