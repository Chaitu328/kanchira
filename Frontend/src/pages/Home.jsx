import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBanners,
  getCategories,
  getSubCategories,
} from "../services/api";
import DiscountSpin from "../components/DiscountSpin";
import banar2 from "../assets/images/baner2.png";
import banar3 from "../assets/images/baner3.png";
import bannerStating  from "../assets/images/banners_stating.png";
import bannerStating2 from "../assets/images/banners_stating2.png";

// ── Static fallback banners ──────────────────────────────────────────────────
const FALLBACK_BANNERS = [
  { image: bannerStating,  _id: "fb1" },
  { image: bannerStating2, _id: "fb2" },
];

export default function Home() {
  const navigate = useNavigate();
  const subRef   = useRef(null);

  const [banners, setBanners]                       = useState(FALLBACK_BANNERS);
  const [bannerIdx, setBannerIdx]                   = useState(0);
  const [categories, setCategories]                 = useState([]);
  const [subCategories, setSubCategories]           = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [activeCategoryId, setActiveCategoryId]     = useState("");
  const [loading, setLoading]                       = useState(true);
  const [showDiscountSpin, setShowDiscountSpin]      = useState(false);

  // ── Show spin wheel on first visit (once per day) ─────────────────────────
  useEffect(() => {
    const lastSpinTime = localStorage.getItem("discountSpinTime");
    const lastDismissTime = localStorage.getItem("lastSpinPopupDismissedTime");
    const twentyFourHours = 24 * 60 * 60 * 1000;

    const hasSpunToday = lastSpinTime && (Date.now() - Number(lastSpinTime) < twentyFourHours);
    const hasDismissedRecently = lastDismissTime && (Date.now() - Number(lastDismissTime) < twentyFourHours);

    const shouldShow = !hasSpunToday && !hasDismissedRecently;
    if (shouldShow) setShowDiscountSpin(true);
  }, []);

  // ── Fetch data ───────────────────────────────────────────────────────────────
  useEffect(() => {
    getBanners()
      .then((r) => {
        const apiBanners = r.data?.banners || [];
        if (apiBanners.length > 0) {
          // Pre-validate URLs — only use images that actually load
          let resolved = 0;
          const valid  = [];
          const finish = () => {
            if (valid.length > 0) setBanners(valid);
            // else keep FALLBACK_BANNERS
          };
          apiBanners.forEach((b) => {
            const img   = new window.Image();
            img.onload  = () => { valid.push(b); resolved++; if (resolved === apiBanners.length) finish(); };
            img.onerror = () => {          resolved++; if (resolved === apiBanners.length) finish(); };
            img.src = b.image;
          });
        }
      })
      .catch(() => {});

    getCategories()
      .then((r) => { setCategories(r.data || []); setLoading(false); })
      .catch(() => setLoading(false));

    getSubCategories()
      .then((r) => setSubCategories(r.data?.SubCategories || []))
      .catch(() => {});
  }, []);

  // ── Banner auto-slide every 4 s ──────────────────────────────────────────────
  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setBannerIdx((i) => (i + 1) % banners.length), 4000);
    return () => clearInterval(t);
  }, [banners]);

  const onCategoryClick = (cat) => {
    setActiveCategoryId(cat._id);
    if (cat.name.toLowerCase() === "all") {
      setSelectedCategoryId(null);
    } else {
      setSelectedCategoryId(cat._id);
      setTimeout(() => {
        if (subRef.current)
          window.scrollTo({ top: subRef.current.offsetTop - 100, behavior: "smooth" });
      }, 100);
    }
  };

  const getSubsByCat = (id) => subCategories.filter((s) => s.categoryId === id);

  const goToSubSub = (id) => {
    localStorage.setItem("subCategoryId", id);
    navigate("/subsubcategory");
  };

  return (
    <div className="bg-white min-h-screen">

      {/* ── DISCOUNT SPIN ─────────────────────────────────────────────── */}
      {showDiscountSpin && (
        <DiscountSpin
          onClose={() => setShowDiscountSpin(false)}
          onWin={() => setShowDiscountSpin(false)}
        />
      )}

      {/* ── HERO BANNER ───────────────────────────────────────────────────
          paddingTop trick locks height to the image aspect ratio (1312×324 → 24.69%)
          so the container always has real pixels even before the image loads.
      ──────────────────────────────────────────────────────────────────── */}
      <div
        className="w-full relative overflow-hidden"
        style={{ paddingTop: "24.7%", minHeight: "160px", background: "#f5f0ea" }}
      >
        {banners.map((b, i) => (
          <img
            key={b._id || i}
            src={b.image}
            alt={`banner ${i + 1}`}
            onError={(e) => { e.currentTarget.style.display = "none"; }}
            style={{
              position:       "absolute",
              top: 0, left: 0,
              width:          "100%",
              height:         "100%",
              objectFit:      "cover",
              objectPosition: "center top",
              opacity:        i === bannerIdx ? 1 : 0,
              transition:     "opacity 0.8s ease-in-out",
              display:        "block",
            }}
          />
        ))}

        {/* Prev */}
        {banners.length > 1 && (
          <button
            onClick={() => setBannerIdx((i) => (i - 1 + banners.length) % banners.length)}
            aria-label="Previous slide"
            style={{
              position: "absolute", left: "14px", top: "50%",
              transform: "translateY(-50%)", zIndex: 5,
              width: "38px", height: "38px", borderRadius: "50%",
              background: "rgba(139,30,63,0.75)", color: "#fff",
              border: "2px solid rgba(255,255,255,0.5)",
              fontSize: "22px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >‹</button>
        )}

        {/* Next */}
        {banners.length > 1 && (
          <button
            onClick={() => setBannerIdx((i) => (i + 1) % banners.length)}
            aria-label="Next slide"
            style={{
              position: "absolute", right: "14px", top: "50%",
              transform: "translateY(-50%)", zIndex: 5,
              width: "38px", height: "38px", borderRadius: "50%",
              background: "rgba(139,30,63,0.75)", color: "#fff",
              border: "2px solid rgba(255,255,255,0.5)",
              fontSize: "22px", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >›</button>
        )}

        {/* Dots */}
        {banners.length > 1 && (
          <div style={{
            position: "absolute", bottom: "10px", left: "50%",
            transform: "translateX(-50%)", zIndex: 5,
            display: "flex", gap: "8px",
          }}>
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setBannerIdx(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  border: "none", cursor: "pointer", borderRadius: "999px",
                  background: i === bannerIdx ? "#8B1E3F" : "rgba(139,30,63,0.35)",
                  width:  i === bannerIdx ? "26px" : "10px",
                  height: "10px",
                  transition: "all 0.3s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── SECONDARY BANNER ───────────────────────────────────────────── */}
      <img src={banar2} alt="" className="w-full mt-2" />

      {/* ── CATEGORY ───────────────────────────────────────────────────── */}
      <h1 className="text-center text-[30px] font-bold text-[#8B1E3F] bg-[rgba(255,192,203,0.25)] py-4 mt-4">
        CATEGORY
      </h1>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="w-10 h-10 border-4 border-[#8B1E3F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-4 px-4 md:flex-wrap md:justify-center md:gap-6 py-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="text-center flex-shrink-0 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-2 md:p-3"
            >
              <img
                src={cat.image}
                alt={cat.name}
                onClick={() => onCategoryClick(cat)}
                className="cursor-pointer rounded-lg object-cover w-[70px] h-[70px] md:w-[180px] md:h-[220px]"
              />
              <h3 className="text-[11px] md:text-[20px] font-semibold text-[#8B1E3F] mt-2">
                {cat.name}
              </h3>
              <div
                className={`h-[3px] bg-[#8B1E3F] transition-all mx-auto mt-1 rounded-full ${
                  activeCategoryId === cat._id ? "w-full" : "w-0"
                }`}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── SELECTED SUBCATEGORY ───────────────────────────────────────── */}
      {selectedCategoryId && (
        <div ref={subRef} className="mt-6">
          <h2 className="text-center text-[24px] font-bold text-[#8B1E3F] bg-[rgba(255,192,203,0.25)] py-3 mb-4">
            {categories.find((c) => c._id === selectedCategoryId)?.name?.toUpperCase()}
          </h2>
          <div className="flex overflow-x-auto gap-4 pb-4 px-4 md:grid md:grid-cols-4 lg:grid-cols-6 md:overflow-visible md:gap-6 snap-x snap-mandatory">
            {getSubsByCat(selectedCategoryId).map((sub) => (
              <div
                key={sub._id}
                onClick={() => goToSubSub(sub._id)}
                className="text-center cursor-pointer flex-shrink-0 snap-start bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-2 md:p-3 group"
                style={{ minWidth: "100px" }}
              >
                <div className="overflow-hidden rounded-lg">
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="w-full h-[100px] md:h-[220px] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h6 className="text-[#8B1E3F] text-[12px] md:text-[20px] mt-2 font-medium truncate px-1">
                  {sub.name}
                </h6>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CATEGORY-WISE SECTIONS ──────────────────────────────────────── */}
      {categories.map((cat) => {
        const subs = getSubsByCat(cat._id);
        if (!subs.length) return null;
        return (
          <div key={cat._id} className="mt-8">
            <h3 className="text-center text-[24px] font-bold text-[#8B1E3F] bg-[rgba(255,192,203,0.25)] py-3">
              {cat.name?.toUpperCase()}
            </h3>
            <div className="flex overflow-x-auto gap-4 pb-4 px-4 mt-4 md:grid md:grid-cols-4 lg:grid-cols-6 md:overflow-visible md:gap-6 snap-x snap-mandatory">
              {subs.map((sub) => (
                <div
                  key={sub._id}
                  onClick={() => goToSubSub(sub._id)}
                  className="cursor-pointer text-center flex-shrink-0 snap-start bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-2 md:p-3 group"
                  style={{ minWidth: "100px" }}
                >
                  <div className="overflow-hidden rounded-lg">
                    <img
                      src={sub.image}
                      alt={sub.name}
                      className="w-full h-[100px] md:h-[220px] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h6 className="text-[#8B1E3F] text-[12px] md:text-[20px] mt-2 font-medium truncate px-1">
                    {sub.name}
                  </h6>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* ── BOTTOM BANNER ──────────────────────────────────────────────── */}
      <img src={banar3} alt="" className="w-full mt-10" />
    </div>
  );
}
