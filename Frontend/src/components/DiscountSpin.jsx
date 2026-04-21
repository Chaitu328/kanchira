import { useEffect, useRef, useState } from "react";

const DiscountSpin = ({ onClose, onWin }) => {
  const canvasRef = useRef(null);
  const [spinning, setSpinning] = useState(false);
  const [popup, setPopup] = useState("");
  const [wonValue, setWonValue] = useState(null);
  const currentAngleRef = useRef(0);
  const hasSpunRef = useRef(false);

  const segments = [
    { label: "5% OFF",  value: 5  },
    { label: "10% OFF", value: 10 },
    { label: "15% OFF", value: 15 },
    { label: "20% OFF", value: 20 },
    { label: "25% OFF", value: 25 },
    { label: "30% OFF", value: 30 },
    { label: "35% OFF", value: 35 },
    { label: "40% OFF", value: 40 },
    { label: "45% OFF", value: 45 },
    { label: "50% OFF", value: 50 },
  ];

  const n = segments.length;
  const GAP_DEG = 1;
  const gapRad = (GAP_DEG * Math.PI) / 180;
  const sliceAngle = (2 * Math.PI - n * gapRad) / n;
  const colors = ["#fff3c4", "#ffe08a"];
  const R = 155, innerR = 48, cx = 170, cy = 170;

  function getSegmentStart(i) {
    return i * (sliceAngle + gapRad);
  }

  function drawWheel(offsetAngle = 0, isSpinning = false) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(offsetAngle);

    for (let i = 0; i < n; i++) {
      const seg = segments[i];
      const startA = getSegmentStart(i);
      const endA = startA + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, startA, endA);
      ctx.closePath();
      ctx.fillStyle = colors[i % 2];
      ctx.fill();
      ctx.strokeStyle = "#d4a800";
      ctx.lineWidth = 2;
      ctx.stroke();

      const midA = startA + sliceAngle / 2;
      const textR = R * 0.68;
      const tx = Math.cos(midA) * textR;
      const ty = Math.sin(midA) * textR;

      ctx.save();
      ctx.translate(tx, ty);
      ctx.rotate(midA + Math.PI / 1);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = "bold 13px sans-serif";
      ctx.fillStyle = "#8b0000";
      ctx.fillText(seg.label, 0, 0);
      ctx.restore();
    }

    // Outer ring
    ctx.beginPath();
    ctx.arc(0, 0, R + 2, 0, 2 * Math.PI);
    ctx.strokeStyle = "#f5c400";
    ctx.lineWidth = 10;
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(0, 0, innerR, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffd700";
    ctx.fill();
    ctx.strokeStyle = "#e0a800";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.font = "bold 15px sans-serif";
    ctx.fillStyle = "#8b0000";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(isSpinning ? "..." : "SPIN", 0, 0);

    ctx.restore();

    // Pointer triangle
    
ctx.save();
ctx.translate(cx, cy - R - 10);

ctx.beginPath();
ctx.moveTo(0, 0);
ctx.lineTo(-50.5, -15);
ctx.lineTo(50.5, -15);

ctx.closePath();
ctx.fillStyle = "#e53935";
ctx.fill();

ctx.restore();
  }

  useEffect(() => {
    drawWheel(currentAngleRef.current, false);
  }, []);

  const spinWheel = () => {
    if (spinning || hasSpunRef.current) return;

    // Only these values can be won
    const allowedValues = [10, 15, 20, 25];
    const allowedIndexes = segments
      .map((s, i) => (allowedValues.includes(s.value) ? i : null))
      .filter((i) => i !== null);

    const winIdx =
      allowedIndexes[Math.floor(Math.random() * allowedIndexes.length)];

    const segMidAngle = getSegmentStart(winIdx) + sliceAngle / 2;
    const pointerAngle = -Math.PI / 2;
    const spins = 6 * 2 * Math.PI;

    const currentNorm =
      ((currentAngleRef.current % (2 * Math.PI)) + 2 * Math.PI) %
      (2 * Math.PI);
    const targetAngle = pointerAngle - segMidAngle;
    let delta =
      ((targetAngle - currentNorm) % (2 * Math.PI) + 2 * Math.PI) %
      (2 * Math.PI);

    const startAngle = currentAngleRef.current;
    const finalAngle = startAngle + spins + delta;
    const duration = 4500;
    const startTime = performance.now();

    function ease(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    setSpinning(true);
    hasSpunRef.current = true;

    function animate(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      currentAngleRef.current =
        startAngle + (finalAngle - startAngle) * ease(t);
      drawWheel(currentAngleRef.current, t < 1);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        setWonValue(segments[winIdx].value);
        setPopup(`${segments[winIdx].value}% OFF`);
      }
    }

    requestAnimationFrame(animate);
  };

  const handleContinue = () => {
    if (wonValue !== null) {
      const discountData = {
        value: wonValue,
        label: `${wonValue}% OFF`,
        type: "percentage",
      };
      localStorage.setItem(
        "checkout_spin_discount",
        JSON.stringify(discountData)
      );
      localStorage.setItem("discountSpinTime", Date.now().toString());
      if (onWin) onWin(wonValue);
    }
    setPopup("");
    if (onClose) onClose();
  };

  const handleClose = () => {
    localStorage.setItem("discountSpinTime", Date.now().toString());
    if (onClose) onClose();
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={handleClose}
      />

      {/* MAIN */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="relative pointer-events-auto flex flex-col items-center">

          {/* CLOSE BUTTON */}
          <button
            onClick={handleClose}
            className="absolute -top-10 right-0 text-white text-2xl font-bold z-30 bg-black/40 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black/60"
          >
            ✕
          </button>

          {/* CANVAS WHEEL */}
          <canvas
            ref={canvasRef}
            width={340}
            height={340}
            onClick={spinWheel}
            style={{
              cursor:
                spinning || hasSpunRef.current ? "not-allowed" : "pointer",
            }}
          />
        </div>
      </div>

      {/* RESULT POPUP */}
      {popup && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black/50">
          <div className="bg-yellow-100 p-8 rounded-2xl text-center w-[320px] shadow-2xl border-4 border-yellow-400">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-red-600 mb-1">You Won!</h2>
            <p className="text-3xl font-extrabold text-[#800000] my-3">
              {popup}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Your discount is saved! Apply it in Cart or at Checkout.
            </p>
            <button
              onClick={handleContinue}
              className="mt-2 bg-red-600 text-yellow-300 px-6 py-3 rounded-xl w-full font-bold text-lg hover:bg-red-700 transition-colors"
            >
              🛒 Shop Now
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DiscountSpin;