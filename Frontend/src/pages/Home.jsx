import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBanners,
  getCategories,
  getSubCategories,
  getProducts,
} from "../services/api";
import DiscountSpin from "../components/DiscountSpin";
import banar2 from "../assets/images/baner2.png";
import banar3 from "../assets/images/baner3.png";

export default function Home() {
  const navigate = useNavigate();
  const subRef = useRef(null);

  const [banners, setBanners] = useState([]);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDiscountSpin, setShowDiscountSpin] = useState(false);

  // Show spin wheel once per 6 hours
  useEffect(() => {
    const lastShown = localStorage.getItem("discountSpinTime");
    const sixHours = 6 * 60 * 60 * 1000;
    const shouldShow = !lastShown || Date.now() - Number(lastShown) > sixHours;

    if (shouldShow) {
      const timer = setTimeout(() => setShowDiscountSpin(true), 4000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    getBanners().then((r) => setBanners(r.data?.banners || []));

    getCategories().then((r) => {
      setCategories(r.data || []);
      setLoading(false);
    });

    getSubCategories().then((r) =>
      setSubCategories(r.data?.SubCategories || [])
    );

    getProducts().then((r) => {
      const data = r.data?.products || r.data || [];
      setAllProducts(data);
      setFilteredProducts(data);
    });
  }, []);

  // Banner auto slide
  useEffect(() => {
    if (!banners.length) return;
    const t = setInterval(
      () => setBannerIdx((i) => (i + 1) % banners.length),
      3000
    );
    return () => clearInterval(t);
  }, [banners]);

  const onCategoryClick = (cat) => {
    setActiveCategoryId(cat._id);

    if (cat.name.toLowerCase() === "all") {
      setSelectedCategoryId(null);
      setFilteredProducts(allProducts);
    } else {
      setSelectedCategoryId(cat._id);
      const filtered = allProducts.filter((p) => p.categoryId === cat._id);
      setFilteredProducts(filtered);

      setTimeout(() => {
        if (subRef.current) {
          window.scrollTo({
            top: subRef.current.offsetTop - 100,
            behavior: "smooth",
          });
        }
      }, 100);
    }
  };

  const getSubsByCat = (id) =>
    subCategories.filter((s) => s.categoryId === id);

  const goToSubSub = (id) => {
    localStorage.setItem("subCategoryId", id);
    navigate("/subsubcategory");
  };

  const isNew = (p) => {
    if (!p.createdAt) return false;
    return (Date.now() - new Date(p.createdAt).getTime()) / 86400000 <= 7;
  };

  const latestProducts = [...filteredProducts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 12);

  return (
    <div className="bg-white min-h-screen">

      {/* ========= DISCOUNT SPIN POPUP (Home only) ========= */}
      {showDiscountSpin && (
        <DiscountSpin
          onClose={() => setShowDiscountSpin(false)}
          onWin={() => setShowDiscountSpin(false)}
        />
      )}

      {/* ========= BANNER ========= */}
      {banners.length > 0 && (
        <div className="relative">
          {banners.map((b, i) => (
            <img
              key={i}
              src={b.image}
              className={`w-full h-[300px] object-cover ${
                i === bannerIdx ? "block" : "hidden"
              }`}
            />
          ))}
        </div>
      )}

      <img src={banar2} className="w-full mt-2" />

      {/* ========= CATEGORY ========= */}
      <h1 className="text-center text-[30px] font-bold text-[#8B1E3F] bg-[rgba(255,192,203,0.25)] py-4 mt-4">
        CATEGORY
      </h1>

      {loading ? (
        <div className="flex justify-center py-10">Loading...</div>
      ) : (
        <div className="flex overflow-x-auto gap-4 px-4 md:flex-wrap md:justify-center md:gap-6 py-4">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="text-center flex-shrink-0 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-2 md:p-3"
            >
              <img
                src={cat.image}
                onClick={() => onCategoryClick(cat)}
                className="cursor-pointer rounded-lg object-cover w-[70px] h-[70px] md:w-[180px] md:h-[220px]"
              />
              <h3 className="text-[11px] md:text-[26px] font-semibold text-[#8B1E3F] mt-2">
                {cat.name}
              </h3>
              <div
                className={`h-[3px] bg-[#8B1E3F] transition-all mx-auto mt-2 rounded-full ${
                  activeCategoryId === cat._id ? "w-full" : "w-0"
                }`}
              ></div>
            </div>
          ))}
        </div>
      )}

      {/* ========= SUBCATEGORY ========= */}
      {selectedCategoryId && (
        <div ref={subRef} className="mt-6 px-4">
          <h2 className="text-center text-[24px] font-bold text-[#8B1E3F] bg-[rgba(255,192,203,0.25)] py-3 mb-4 rounded-lg">
            {categories.find((c) => c._id === selectedCategoryId)?.name?.toUpperCase()}
          </h2>

          <div className="flex overflow-x-auto gap-4 pb-4 md:grid md:grid-cols-4 lg:grid-cols-6 md:overflow-visible md:gap-6 snap-x snap-mandatory">
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

      {/* ========= LATEST PRODUCTS ========= */}
      <h1 className="text-center text-[30px] font-bold text-[#8B1E3F] bg-[rgba(255,192,203,0.25)] py-4 mt-8">
        Latest Products
      </h1>

      <div className="flex overflow-x-auto gap-4 pb-4 px-4 md:grid md:grid-cols-4 lg:grid-cols-6 md:overflow-visible md:gap-6 snap-x snap-mandatory">
        {latestProducts.map((p) => (
          <div
            key={p._id}
            className="relative text-center cursor-pointer flex-shrink-0 snap-start bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-2 md:p-3 group"
            onClick={() => goToSubSub(p.subcategoryId)}
            style={{ minWidth: "100px" }}
          >
            <div className="overflow-hidden rounded-lg relative">
              <img
                src={p.image}
                className="w-full h-[100px] md:h-[220px] object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
              />
              {isNew(p) && (
                <span className="absolute top-2 left-2 bg-yellow-500 text-white text-[10px] md:text-[12px] px-2 py-1 rounded-full font-semibold shadow-md">
                  New
                </span>
              )}
            </div>
            <h6 className="text-[#8B1E3F] text-[10px] md:text-[18px] mt-2 font-medium truncate px-1">
              {p.name}
            </h6>
          </div>
        ))}
      </div>

      {/* ========= CATEGORY WISE ========= */}
      {categories.map((cat) => {
        const subs = getSubsByCat(cat._id);
        if (!subs.length) return null;

        return (
          <div key={cat._id} className="mt-8">
            <h3 className="text-center text-[24px] font-bold text-[#8B1E3F] bg-[rgba(255,192,203,0.25)] py-3 rounded-lg mx-4">
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

      {/* ========= BOTTOM BANNER ========= */}
      <img src={banar3} className="w-full mt-10" />
    </div>
  );
}