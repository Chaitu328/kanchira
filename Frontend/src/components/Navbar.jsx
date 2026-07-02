
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import {
  getCategories,
  getSubCategories,
  getSub_SubCategoryById,
} from "../services/api";
import toast from "react-hot-toast";
import Profile from "../pages/Profile";



export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout, cartCount, wishlist, logoUrl, setLoginModalOpen } =
    useApp();

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [megaMenuCatId, setMegaMenuCatId] = useState(null);
  const [megaData, setMegaData] = useState([]);
  const [megaLoading, setMegaLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showChips, setShowChips] = useState(false);
  const [slugs, setSlugs] = useState([]);
  const [filteredSlugs, setFilteredSlugs] = useState([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(null);
  const [mobileSubOpen, setMobileSubOpen] = useState(null);
  const [mobileSubData, setMobileSubData] = useState({});
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);  // ADDED THIS LINE
  const megaTimer = useRef(null);
  const searchRef = useRef(null);
  const [selectedSubSubId, setSelectedSubSubId] = useState(null);
  const [subSubCats, setSubSubCats] = useState([]);

  useEffect(() => {
    getCategories()
      .then((r) => {
        const cats = Array.isArray(r.data)
          ? r.data
          : (r.data?.categories ?? r.data?.data ?? []);
        setCategories(cats);
      })
      .catch(() => {});
    getSubCategories()
      .then((r) => {
        const raw = r.data?.SubCategories ?? r.data?.subCategories ?? r.data;
        const subs = Array.isArray(raw) ? raw : [];
        setSubCategories(subs);
        const s = subs.map((sub) => ({
          slug: sub.name,
          _id: sub._id,
          categoryId: sub.categoryId,
        }));
        setSlugs(s);
        setFilteredSlugs(s);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setShowChips(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const openMegaMenu = (catId) => {
    clearTimeout(megaTimer.current);
    if (megaMenuCatId === catId) return;
    setMegaMenuCatId(catId);
    setMegaData([]);
    setMegaLoading(true);
    const subs = subCategories.filter((s) => s.categoryId === catId);
    Promise.all(
      subs.map((sub) =>
        getSub_SubCategoryById(sub._id)
          .then((r) => {
            // AFTER (matches backend response key)
            const raw =
              r.data?.sub_SubCategories ??
              r.data?.Sub_SubCategories ??
              r.data?.subSubCategories ??
              r.data;
            return {
              id: sub._id,
              title: sub.name,
              subSubCategories: Array.isArray(raw) ? raw : [],
            };
          })
          .catch(() => ({
            id: sub._id,
            title: sub.name,
            subSubCategories: [],
          })),
      ),
    ).then((data) => {
      setMegaData(data);
      setMegaLoading(false);
    });
  };

  const closeMegaMenu = () => {
    megaTimer.current = setTimeout(() => {
      setMegaMenuCatId(null);
      setMegaData([]);
    }, 150);
  };

  const filterSlugs = (val) => {
    setSearchTerm(val);
    setShowChips(true);
    if (!val.trim()) {
      setFilteredSlugs(slugs);
      return;
    }
    setFilteredSlugs(
      slugs.filter((s) => s.slug.toLowerCase().includes(val.toLowerCase())),
    );
  };

  const goToSubSub = (subCatId) => {
    localStorage.setItem("subCategoryId", subCatId);
    navigate("/subsubcategory");
    setMegaMenuCatId(null);
    setMobileOpen(false);
    setShowChips(false);
    setSearchTerm("");
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/");
  };

  const expandMobileSub = async (subId) => {
    if (mobileSubOpen === subId) {
      setMobileSubOpen(null);
      return;
    }
    setMobileSubOpen(subId);
    if (!mobileSubData[subId]) {
      try {
        const r = await getSub_SubCategoryById(subId);
        const raw =
          r.data?.sub_SubCategories ??
          r.data?.Sub_SubCategories ??
          r.data?.subSubCategories ??
          r.data;
        setMobileSubData((p) => ({
          ...p,
          [subId]: Array.isArray(raw) ? raw : [],
        }));
      } catch {
        setMobileSubData((p) => ({ ...p, [subId]: [] }));
      }
    }
  };

  const isWishlistEmpty = wishlist.length === 0;
  const activeCatName = categories.find((c) => c._id === megaMenuCatId)?.name;

  return (
    <div className="sticky top-0 z-50">
      {/* Topbar (matches app navbar) */}
      <div className="bg-[#800000] px-2 py-[1px]">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-[10px] text-white border-2 border-[#c69a3b] rounded-[40px] px-4 py-[3px] ml-2 md:ml-[25px]">
            Launching Soon
          </span>
          <button type="button" className="inline-flex items-center gap-2 bg-white rounded-[30px] px-4 py-1 text-[12px] font-medium text-[#800000] hover:opacity-90">
            Download <i className="fa fa-download" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative bg-white border-b border-gray-200 shadow-[rgba(0,0,0,0.24)_0px_3px_8px]" onMouseLeave={closeMegaMenu}>
        {/* Desktop Navbar */}
        <nav className="hidden lg:flex items-center justify-between px-[30px]">
          <Link to="/" className="flex-shrink-0 py-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Kanchira Logo" className="w-20 h-[60px] object-contain" />
            ) : (
              <span className="text-lg font-semibold text-[#800000]">Kanchira</span>
            )}
          </Link>

          {/* <ul className="list-none flex items-center gap-[25px] m-0 p-0 cursor-pointer">
            {categories.slice(0,5).map((cat) => (
              <li key={cat._id} onMouseEnter={() => openMegaMenu(cat._id)} onMouseLeave={closeMegaMenu}>
                <span
                  className={[
                    'relative pb-1 text-[20px] font-medium text-[#333333] capitalize select-none',
                    "after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#800000] after:transition-[width] after:duration-300",
                    'hover:after:w-full',
                    megaMenuCatId === cat._id ? 'text-[#800000] after:w-full' : '',
                  ].join(' ')}
                >
                  {cat.name}
                </span>
              </li>
            ))}
          </ul> */}

          <ul className="list-none flex items-center gap-[25px] m-0 p-0 cursor-pointer">
  {categories
    .filter((cat) => 
      ['men', 'women', 'girls', 'boys'].includes(cat.name.toLowerCase())
    )
    .sort((a, b) => {
      const order = ['men', 'women', 'girls', 'boys'];
      return order.indexOf(a.name.toLowerCase()) - order.indexOf(b.name.toLowerCase());
    })
    .map((cat) => (
      <li key={cat._id} onMouseEnter={() => openMegaMenu(cat._id)} onMouseLeave={closeMegaMenu}>
        <span
          className={[
            'relative pb-1 text-[20px] font-medium text-[#333333] capitalize select-none',
            "after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[2px] after:w-0 after:bg-[#800000] after:transition-[width] after:duration-300",
            'hover:after:w-full',
            megaMenuCatId === cat._id ? 'text-[#800000] after:w-full' : '',
          ].join(' ')}
        >
          {cat.name}
        </span>
      </li>
    ))}
</ul>

          {/* Search */}
          <div
            ref={searchRef}
            className="relative inline-block w-1/2 top-[10px]"
            onMouseEnter={() => setShowChips(true)}
            onMouseLeave={() => setShowChips(false)}
          >
            <div className="p-[10px] w-full">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-[5px] px-4 py-2 text-sm outline-none focus:border-[#800000]"
                value={searchTerm}
                onChange={(e) => filterSlugs(e.target.value)}
                placeholder="Search ..."
              />
            </div>

            {showChips && filteredSlugs.length > 0 && (
              <div className="absolute top-[80%] left-0 mt-1 bg-white rounded-[10px] p-[10px] flex flex-wrap shadow-[0_2px_10px_rgba(0,0,0,0.1)] z-50">
                {filteredSlugs.slice(0, 20).map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    className="bg-transparent border border-[#800000] px-3 py-1 m-1 rounded-[25px] text-[14px] whitespace-nowrap cursor-pointer transition text-[#800000] hover:bg-[#800000] hover:text-white"
                    onClick={() => goToSubSub(item._id)}
                  >
                    {item.slug}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4 text-[18px] cursor-pointer">
            <i
              className={isWishlistEmpty ? 'fa fa-heart-o' : 'fa fa-heart text-red-600'}
              aria-hidden="true"
              onClick={() => navigate('/wishlist')}
              style={{ cursor: 'pointer' }}
            />

            {user ? (
              <div className="relative flex items-center gap-2 group">
                <span className="text-[14px] font-normal capitalize">Hi {user.name?.split(' ')[0]}</span>
                <i className="fa fa-sign-out text-[#333333]" aria-hidden="true" />

                <div className="hidden group-hover:block absolute top-full right-0 bg-white border border-gray-200 rounded shadow-md min-w-[140px] z-50">
                  <div className="px-4 py-2 text-sm flex items-center gap-2 hover:bg-[#cc09091f] cursor-pointer" onClick={handleLogout}>
                    <i className="fa fa-sign-out" aria-hidden="true" /> Logout
                  </div>
                  <div className="px-4 py-2 text-sm flex items-center gap-2 hover:bg-[#cc09091f] cursor-pointer" onClick={() => navigate('/profile')}>
                    <i className="fa fa-user-o" aria-hidden="true" /> Profile
                  </div>
                </div>
              </div>
            ) : (
              <i className="fa fa-user-o text-[#333333]" aria-hidden="true" onClick={() => setLoginModalOpen(true)} style={{ cursor: 'pointer' }} />
            )}

            <button type="button" className="relative" onClick={() => navigate('/cart')} aria-label="Cart">
              <i className="fa fa-shopping-cart text-[#333333]" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-[#800000] border border-[#800000] rounded-full text-[10px] px-1.5 leading-4">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Navbar */}
        <nav className="flex lg:hidden items-center justify-between px-4 py-2 bg-gray-50">
          <Link to="/" className="flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="Kanchira Logo" className="h-10 object-contain" />
            ) : (
              <span className="font-semibold text-[#800000]">Kanchira</span>
            )}
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="relative text-[22px] p-2 flex items-center justify-center"
              onClick={() => navigate('/cart')}
              aria-label="Cart"
            >
              <i className="fa fa-shopping-cart text-[#333333]" aria-hidden="true" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#800000] text-white rounded-full text-[9px] w-5 h-5 flex items-center justify-center border border-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className="bg-[#c29c3e] px-[10px] py-2 border-0 rounded-[4px] flex flex-col justify-between h-[35px] w-[50px]"
              aria-label="Open menu"
              onClick={() => {
                setMobileUserMenuOpen(false)
                setMobileOpen(true)
              }}
            >
              <span className="block h-[3px] w-full bg-white rounded-[2px]" />
              <span className="block h-[3px] w-full bg-white rounded-[2px]" />
              <span className="block h-[3px] w-full bg-white rounded-[2px]" />
            </button>
          </div>
        </nav>

        {/* Mega Menu */}
        {megaMenuCatId && (
          <div
            className="hidden lg:block absolute left-[80px] top-full w-[90%] bg-white p-[20px_50px] shadow-[0_4px_10px_rgba(0,0,0,0.1)] z-40 rounded-[2px]"
            onMouseEnter={() => clearTimeout(megaTimer.current)}
            onMouseLeave={closeMegaMenu}
          >
            {megaLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : megaData.length === 0 ? (
              <p className="text-sm text-gray-500">No subcategories available.</p>
            ) : (
              <div className="flex justify-between flex-wrap gap-4">
                {megaData.map((sub) => (
                  <div key={sub.id} className="flex-1 min-w-[150px] px-[15px]">
                    <span className="block font-medium text-[15px] text-[#800000] mt-[30px] capitalize">
                      {sub.title}
                    </span>
                    <ul className="mt-2 space-y-1.5">
                      {Array.isArray(sub.subSubCategories) && sub.subSubCategories.length > 0 ? (
                        sub.subSubCategories.map((ss) => (
                          <li key={ss._id || ss.id || ss.name || ss.title}>
                            <button
                              type="button"
                              className="text-[14px] text-[#555555] hover:text-[#800000] capitalize text-left"
                              onClick={() => goToSubSub(sub.id)}
                            >
                              {ss.title || ss.name}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li>
                          <button
                            type="button"
                            className="text-[14px] text-[#555555] hover:text-[#800000] capitalize text-left"
                            onClick={() => goToSubSub(sub.id)}
                          >
                            {sub.title}
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setMobileUserMenuOpen(false)
              setMobileOpen(false)
            }}
          />

          <div className="absolute left-0 top-0 h-[700px] w-[300px] bg-white shadow-2xl 
           max-[580px]:top-0 max-[580px]:h-[500px]">
            <div className="relative h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-sm font-semibold text-[#333333]">Menu</span>
                <button
                  type="button"
                  onClick={() => {
                    setMobileUserMenuOpen(false)
                    setMobileOpen(false)
                  }}
                  className="text-gray-500 hover:text-gray-800 p-1"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Category tree */}
              <div className="flex-1 overflow-y-auto px-4 py-3 pb-[80px]">
              <ul className="space-y-2">
  {categories
    .filter((cat) => 
      ['men', 'women', 'girls', 'boys'].includes(cat.name.toLowerCase())
    )
    .sort((a, b) => {
      const order = ['men', 'women', 'girls', 'boys'];
      return order.indexOf(a.name.toLowerCase()) - order.indexOf(b.name.toLowerCase());
    })
    .map((cat) => (
      <li key={cat._id}>
        <button
          type="button"
          className="w-full text-left font-semibold text-[16px] text-[#333333] py-1 capitalize"
          onClick={() => {
            setMobileCatOpen(mobileCatOpen === cat._id ? null : cat._id)
            setMobileSubOpen(null)
          }}
        >
          {cat.name}
        </button>

        {mobileCatOpen === cat._id && (
          <div className="mt-2 ml-3 space-y-2">
            {subCategories
              .filter((s) => s.categoryId === cat._id)
              .map((sub) => (
                <div key={sub._id}>
                  <button
                    type="button"
                    className="w-full text-left font-semibold text-[14px] text-[#555555] py-1 pl-2 border-l-4 border-gray-200 bg-gray-50 capitalize"
                    onClick={() => expandMobileSub(sub._id)}
                  >
                    {sub.name}
                  </button>

                  {mobileSubOpen === sub._id && (
                    <div className="mt-1 ml-3">
                      <ul className="space-y-1">
                        {(mobileSubData[sub._id] || []).length > 0 ? (
                          mobileSubData[sub._id].map((ss) => (
                            <li key={ss._id || ss.id || ss.name || ss.title}>
                              <button
                                type="button"
                                onClick={() => goToSubSub(sub._id)}
                                className="w-full text-left text-[13px] text-[#666666] py-0.5 pl-3 capitalize hover:text-[#800000]"
                              >
                                {ss.title || ss.name}
                              </button>
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-gray-400 pl-3 py-1">Loading...</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </li>
    ))}
</ul>
              </div>

              {/* Bottom icons (like app offcanvas) */}
              <div className="absolute bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3">
                {user ? (
                  <div className="relative">
                    <button
                      type="button"
                      className="text-sm text-[#333333] font-medium"
                      onClick={() => setMobileUserMenuOpen((v) => !v)}
                    >
                      Hi {user.name?.split(' ')[0] ?? 'User'}
                    </button>
                    {mobileUserMenuOpen && (
                      <div className="absolute bottom-full left-0 mb-2 w-40 bg-white border border-gray-200 rounded shadow-md overflow-hidden">
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[#cc09091f]"
                          onClick={() => {
                            navigate('/profile')
                            setMobileUserMenuOpen(false)
                            setMobileOpen(false)
                          }}
                        >
                          Profile
                        </button>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-[#cc09091f]"
                          onClick={() => {
                            handleLogout()
                            setMobileUserMenuOpen(false)
                            setMobileOpen(false)
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="text-[20px] text-[#333333]"
                    aria-label="Login"
                    onClick={() => {
                      setLoginModalOpen(true)
                      setMobileOpen(false)
                    }}
                  >
                    <i className="fa fa-user-o" aria-hidden="true" />
                  </button>
                )}

                <button
                  type="button"
                  className="relative text-[20px] text-[#333333]"
                  aria-label="Cart"
                  onClick={() => {
                    navigate('/cart')
                    setMobileOpen(false)
                  }}
                >
                  <i className="fa fa-shopping-cart" aria-hidden="true" />
                  {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] px-1.5 rounded-full leading-4">{cartCount}</span>}
                </button>

                <button
                  type="button"
                  className="text-[20px]"
                  aria-label="Wishlist"
                  onClick={() => {
                    navigate('/wishlist')
                    setMobileOpen(false)
                  }}
                >
                  <i className={isWishlistEmpty ? 'fa fa-heart-o text-[#333333]' : 'fa fa-heart text-red-600'} aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}