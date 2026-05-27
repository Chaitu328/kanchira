


import React, { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getSubCategories,
  getSubSubCategories,
  uploadImage,
} from "../../services/api";
import {
  DataTable,
  PageHeader,
  ConfirmModal,
  Field,
  ImageUpload,
} from "../../components/UI";

// ── Color data ───────────────────────────────────────────────────
const ALL_COLORS = [
  { name: "Red", hex: "#E53E3E" }, { name: "Crimson", hex: "#DC143C" },
  { name: "Maroon", hex: "#800000" }, { name: "Rose", hex: "#FF007F" },
  { name: "Pink", hex: "#FFC0CB" }, { name: "Hot Pink", hex: "#FF69B4" },
  { name: "Deep Pink", hex: "#FF1493" }, { name: "Orange", hex: "#FF7F00" },
  { name: "Dark Orange", hex: "#FF8C00" }, { name: "Coral", hex: "#FF6347" },
  { name: "Salmon", hex: "#FA8072" }, { name: "Gold", hex: "#FFD700" },
  { name: "Yellow", hex: "#eab806" }, { name: "Khaki", hex: "#F0E68C" },
  { name: "Lime", hex: "#00FF00" }, { name: "Green", hex: "#008000" },
  { name: "Emerald", hex: "#50C878" }, { name: "Teal", hex: "#008080" },
  { name: "Cyan", hex: "#00FFFF" }, { name: "Sky Blue", hex: "#87CEEB" },
  { name: "Steel Blue", hex: "#4682B4" }, { name: "Blue", hex: "#0000FF" },
  { name: "Royal Blue", hex: "#4169E1" }, { name: "Navy", hex: "#000080" },
  { name: "Indigo", hex: "#4B0082" }, { name: "Violet", hex: "#EE82EE" },
  { name: "Purple", hex: "#800080" }, { name: "Plum", hex: "#DDA0DD" },
  { name: "Lavender", hex: "#E6E6FA" }, { name: "Magenta", hex: "#FF00FF" },
  { name: "Brown", hex: "#A52A2A" }, { name: "Sienna", hex: "#A0522D" },
  { name: "Tan", hex: "#D2B48C" }, { name: "Beige", hex: "#F5F5DC" },
  { name: "White", hex: "#FFFFFF" }, { name: "Silver", hex: "#C0C0C0" },
  { name: "Gray", hex: "#808080" }, { name: "Charcoal", hex: "#36454F" },
  { name: "Black", hex: "#000000" }, { name: "Ivory", hex: "#FFFFF0" },
  { name: "Mint", hex: "#98FF98" }, { name: "Turquoise", hex: "#40E0D0" },
  { name: "Olive", hex: "#808000" }, { name: "Peach", hex: "#FFDAB9" },
  { name: "Mauve", hex: "#E0B0FF" }, { name: "Mustard", hex: "#FFDB58" },
  { name: "Wine", hex: "#722F37" }, { name: "Rust", hex: "#B7410E" },
];

// ── Color helpers ────────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}
function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) =>
        Math.min(255, Math.max(0, Math.round(x))).toString(16).padStart(2, "0")
      )
      .join("")
  );
}
function buildShades(hex) {
  const [r, g, b] = hexToRgb(hex);
  return [
    { label: "50",   color: rgbToHex(r + (255 - r) * 0.92, g + (255 - g) * 0.92, b + (255 - b) * 0.92) },
    { label: "100",  color: rgbToHex(r + (255 - r) * 0.80, g + (255 - g) * 0.80, b + (255 - b) * 0.80) },
    { label: "200",  color: rgbToHex(r + (255 - r) * 0.65, g + (255 - g) * 0.65, b + (255 - b) * 0.65) },
    { label: "300",  color: rgbToHex(r + (255 - r) * 0.50, g + (255 - g) * 0.50, b + (255 - b) * 0.50) },
    { label: "400",  color: rgbToHex(r + (255 - r) * 0.35, g + (255 - g) * 0.35, b + (255 - b) * 0.35) },
    { label: "Base", color: hex },
    { label: "600",  color: rgbToHex(r * 0.85, g * 0.85, b * 0.85) },
    { label: "700",  color: rgbToHex(r * 0.70, g * 0.70, b * 0.70) },
    { label: "800",  color: rgbToHex(r * 0.50, g * 0.50, b * 0.50) },
    { label: "900",  color: rgbToHex(r * 0.30, g * 0.30, b * 0.30) },
  ];
}

// ── ColorPicker component ────────────────────────────────────────
function ColorPicker({ vi, variant, onFieldChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(variant.color || "");
  const dropdownRef = useRef(null);

  const filtered = query
    ? ALL_COLORS.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_COLORS;

  const isValidHex = /^#([0-9A-Fa-f]{6})$/.test(variant.colorCode);
  const shades = isValidHex ? buildShades(variant.colorCode) : [];

  useEffect(() => {
    const close = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  // Keep query in sync if variant.color changes from outside
  useEffect(() => {
    setQuery(variant.color || "");
  }, [variant.color]);

  const selectColor = (c) => {
    setQuery(c.name);
    onFieldChange(vi, "color", c.name);
    onFieldChange(vi, "colorCode", c.hex);
    setOpen(false);
  };

  const selectShade = (hex) => {
    onFieldChange(vi, "colorCode", hex);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Color Name with Dropdown */}
        <Field label="Color Name">
          <div style={{ position: "relative" }} ref={dropdownRef}>
            <input
              className="kanchira-input"
              placeholder="e.g. Maroon"
              value={query}
              autoComplete="off"
              onChange={(e) => {
                setQuery(e.target.value);
                onFieldChange(vi, "color", e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
            />
            {open && filtered.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 8,
                  zIndex: 100,
                  maxHeight: 220,
                  overflowY: "auto",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                }}
              >
                {filtered.map((c) => (
                  <div
                    key={c.name}
                    onMouseDown={() => selectColor(c)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                    className="hover:bg-gray-50"
                  >
                    <span
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 4,
                        flexShrink: 0,
                        background: c.hex,
                        border: "1px solid rgba(0,0,0,0.08)",
                      }}
                    />
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Field>

        {/* Color Code */}
        <Field label="Color Code (hex)">
          <div className="flex gap-2 items-center">
            <input
              className="kanchira-input flex-1"
              placeholder="#8B0000"
              value={variant.colorCode}
              onChange={(e) => onFieldChange(vi, "colorCode", e.target.value)}
            />
            {isValidHex && (
              <span
                className="w-8 h-8 rounded-md border flex-shrink-0"
                style={{ backgroundColor: variant.colorCode }}
              />
            )}
          </div>
        </Field>
      </div>

      {/* Shade swatches */}
      {shades.length > 0 && (
        <div className="mb-4">
          <p style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>
            Shades — click to use
          </p>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {shades.map((s) => (
              <div
                key={s.label}
                onClick={() => selectShade(s.color)}
                title={s.color}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 6,
                    background: s.color,
                    border: "1px solid rgba(0,0,0,0.10)",
                    transition: "transform 0.1s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.15)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                />
                <span style={{ fontSize: 10, color: "#aaa" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Response extractors ──────────────────────────────────────────
const extractProducts = (res) =>
  Array.isArray(res.data?.products) ? res.data.products : [];
const extractCats = (res) => (Array.isArray(res.data) ? res.data : []);
const extractSubCats = (res) =>
  Array.isArray(res.data?.SubCategories) ? res.data.SubCategories : [];
const extractSSC = (res) =>
  Array.isArray(res.data?.subSubCategories) ? res.data.subSubCategories : [];

// ── Constants ────────────────────────────────────────────────────
const TAG_OPTIONS = ["OrganicCotton", "Designer", "Premium", "Budget", "None"];
const SPECIALITY = [
  "Handloom", "OrganicCotton", "Designer", "Premium",
  "Budget", "Electronics", "None",
];
const SIZE_OPTIONS = [
  "XS", "S", "M", "L", "XL", "XXL", "Free Size", "One Size", "None",
];

// ── Helpers ──────────────────────────────────────────────────────
const emptySize = () => ({
  size: "",
  price: "",
  stock: 0,
  left: 0,
  sku: "",
  discountPercentage: 0,
  finalPrice: "",
  isAvailable: true,
});

const emptyVariant = () => ({
  color: "",
  colorCode: "",
  images: [],
  sizes: [emptySize()],
});

// ══════════════════════════════════════════════════════════════════
// ProductList
// ══════════════════════════════════════════════════════════════════
export function ProductList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [cats, setCats] = useState([]);
  const [subSubCats, setSubSubCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);
  const [viewProduct, setViewProduct] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [p, c, ssc] = await Promise.all([
        getProducts(),
        getCategories(),
        getSubSubCategories(),
      ]);
      setData(extractProducts(p));
      setCats(extractCats(c));
      setSubSubCats(extractSSC(ssc));
    } catch {
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const getCatName = (id) => cats.find((c) => c._id === id)?.name || "—";
  const getSscName = (id) => subSubCats.find((s) => s._id === id)?.name || "—";

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteId);
      toast.success("Product deleted!");
      load();
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeleteId(null);
    }
  };

  const columns = [
    {
      key: "image",
      label: "Image",
      render: (r) =>
        r.image ? (
          <img src={r.image} alt="" className="w-14 h-14 object-cover rounded-lg border" />
        ) : r.variants?.[0]?.images?.[0]?.url ? (
          <img src={r.variants[0].images[0].url} alt="" className="w-14 h-14 object-cover rounded-lg border" />
        ) : ("—"),
    },
    {
      key: "name", label: "Name", searchable: true,
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    { key: "brand", label: "Brand", value: (r) => r.brand || "—" },
    { key: "categoryId", label: "Category", value: (r) => getCatName(r.categoryId) },
    { key: "subsubcategoryId", label: "Sub-Sub Cat", value: (r) => getSscName(r.subsubcategoryId) },
    {
      key: "variants", label: "Variants",
      render: (r) => (
        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium">
          {r.variants?.length || 0} color{r.variants?.length !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      key: "price", label: "Price (from)",
      render: (r) => {
        const prices = r.variants
          ?.flatMap((v) => v.sizes?.map((s) => s.price))
          .filter(Boolean);
        return prices?.length ? `₹${Math.min(...prices).toLocaleString()}` : "—";
      },
    },
    {
      key: "available", label: "Status",
      render: (r) => (
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
          {r.available ? "Active" : "Inactive"}
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Product List"
        buttonLabel="Create Product"
        onButtonClick={() => navigate("/dashboard/products/create")}
      />
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="spinner" style={{ width: 40, height: 40, borderTopColor: "#640101", borderColor: "rgba(100,1,1,0.2)", borderWidth: 4 }} />
        </div>
      ) : (
        <div className="kanchira-card">
          <DataTable
            columns={columns}
            data={data}
            searchPlaceholder="Search products..."
            actions={(row) => (
              <>
                <button className="btn-icon bg-blue-500 hover:bg-blue-600" onClick={() => setViewProduct(row)}>
                  <i className="fa fa-eye text-xs" />
                </button>
                <button className="btn-edit btn-icon" onClick={() => navigate("/dashboard/products/update", { state: { item: row } })}>
                  <i className="fa fa-pencil text-xs" />
                </button>
                <button className="btn-danger btn-icon" onClick={() => setDeleteId(row._id)}>
                  <i className="fa fa-trash text-xs" />
                </button>
              </>
            )}
          />
        </div>
      )}

      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />

      {/* View Modal */}
      {viewProduct && (
        <div className="modal-overlay" onClick={() => setViewProduct(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-lg" style={{ color: "#640101" }}>Product Details</h2>
              <button className="border-0 bg-transparent cursor-pointer text-gray-400 hover:text-gray-600 text-xl" onClick={() => setViewProduct(null)}>✕</button>
            </div>
            <div className="p-5 space-y-4">
              {viewProduct.image && (
                <img src={viewProduct.image} alt="" className="w-full h-48 object-contain rounded-xl bg-gray-50" />
              )}
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Name", viewProduct.name],
                  ["Brand", viewProduct.brand],
                  ["Slug", viewProduct.slug],
                  ["Category", getCatName(viewProduct.categoryId)],
                  ["Sub-SubCat", getSscName(viewProduct.subsubcategoryId)],
                  ["Discount %", viewProduct.discountPercentage ? `${viewProduct.discountPercentage}%` : "—"],
                  ["Speciality", viewProduct.speciality],
                  ["Tags", Array.isArray(viewProduct.tags) ? viewProduct.tags.join(", ") : viewProduct.tags],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 font-medium uppercase">{k}</p>
                    <p className="text-sm font-medium text-gray-700 mt-0.5">{v || "—"}</p>
                  </div>
                ))}
              </div>
              {viewProduct.description && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase mb-1">Description</p>
                  <p className="text-sm text-gray-700">{viewProduct.description}</p>
                </div>
              )}
              {Array.isArray(viewProduct.variants) && viewProduct.variants.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Variants</p>
                  {viewProduct.variants.map((v, i) => (
                    <div key={i} className="border rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-3 mb-3">
                        {v.colorCode && (
                          <span className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ backgroundColor: v.colorCode }} />
                        )}
                        <span className="font-medium text-sm">{v.color || "—"}</span>
                        {v.colorCode && <span className="text-xs text-gray-400">{v.colorCode}</span>}
                      </div>
                      {Array.isArray(v.images) && v.images.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Images</p>
                          <div className="flex gap-2 flex-wrap">
                            {v.images.map((img, j) => (
                              <div key={j} className="text-center">
                                <img src={img.url} alt={img.alt} className="w-16 h-16 object-cover rounded-lg border" />
                                {img.alt && <p className="text-xs text-gray-400 mt-0.5">{img.alt}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {Array.isArray(v.sizes) && v.sizes.length > 0 && (
                        <div className="overflow-x-auto">
                          <p className="text-xs text-gray-400 uppercase font-medium mb-1">Sizes</p>
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-gray-100">
                                {["Size", "Price", "Stock", "Left", "SKU", "Discount %", "Final Price", "Available"].map((h) => (
                                  <th key={h} className="border border-gray-200 px-2 py-1 text-left font-medium text-gray-600">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {v.sizes.map((s, j) => (
                                <tr key={j} className="even:bg-gray-50">
                                  <td className="border border-gray-200 px-2 py-1 font-medium">{s.size}</td>
                                  <td className="border border-gray-200 px-2 py-1">₹{s.price?.toLocaleString()}</td>
                                  <td className="border border-gray-200 px-2 py-1">{s.stock ?? 0}</td>
                                  <td className="border border-gray-200 px-2 py-1">{s.left ?? 0}</td>
                                  <td className="border border-gray-200 px-2 py-1 font-mono">{s.sku || "—"}</td>
                                  <td className="border border-gray-200 px-2 py-1">{s.discountPercentage ?? 0}%</td>
                                  <td className="border border-gray-200 px-2 py-1">₹{s.finalPrice?.toLocaleString() || "—"}</td>
                                  <td className="border border-gray-200 px-2 py-1">
                                    <span className={`px-1.5 py-0.5 rounded-full ${s.isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                      {s.isAvailable ? "Yes" : "No"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ProductCreate
// ══════════════════════════════════════════════════════════════════
export function ProductCreate() {
  const navigate = useNavigate();
  const [cats, setCats] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [subSubCats, setSubSubCats] = useState([]);
  const [filteredSubCats, setFilteredSubCats] = useState([]);
  const [filteredSubSubCats, setFilteredSubSubCats] = useState([]);
  const [mainImgLoading, setMainImgLoading] = useState(false);
  const [mainPreview, setMainPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", description: "", categoryId: "", subcategoryId: "",
    subsubcategoryId: "", brand: "", speciality: "", slug: "", image: "",
    metaTitle: "", metaDescription: "", discountPercentage: 0, url: "",
    tags: [], variants: [emptyVariant()],
  });

  useEffect(() => {
    Promise.all([getCategories(), getSubCategories(), getSubSubCategories()])
      .then(([c, sc, ssc]) => {
        setCats(extractCats(c));
        setSubCats(extractSubCats(sc));
        setSubSubCats(extractSSC(ssc));
      })
      .catch(() => {});
  }, []);

  const handleCatChange = (id) => {
    setForm((f) => ({ ...f, categoryId: id, subcategoryId: "", subsubcategoryId: "" }));
    setFilteredSubCats(subCats.filter((s) => s.categoryId === id));
    setFilteredSubSubCats([]);
  };
  const handleSubCatChange = (id) => {
    setForm((f) => ({ ...f, subcategoryId: id, subsubcategoryId: "" }));
    setFilteredSubSubCats(subSubCats.filter((s) => s.subCategoryId === id));
  };

  const handleMainImage = async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    setMainImgLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await uploadImage(fd);
      setForm((f) => ({ ...f, image: data.imageUrl }));
      setMainPreview(data.imageUrl);
    } catch {
      toast.error("Upload failed.");
    } finally {
      setMainImgLoading(false);
    }
  };

  const toggleTag = (tag) =>
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }));

  const updateVariantField = (vi, field, val) => {
    const v = [...form.variants];
    v[vi] = { ...v[vi], [field]: val };
    setForm({ ...form, variants: v });
  };
  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] }));
  const removeVariant = (vi) => setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== vi) }));

  const uploadVariantImage = async (vi, file, alt) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await uploadImage(fd);
      const v = [...form.variants];
      v[vi].images = [...v[vi].images, { url: data.imageUrl, alt: alt || "" }];
      setForm({ ...form, variants: v });
    } catch {
      toast.error("Variant image upload failed.");
    }
  };
  const removeVariantImage = (vi, imgIdx) => {
    const v = [...form.variants];
    v[vi].images = v[vi].images.filter((_, i) => i !== imgIdx);
    setForm({ ...form, variants: v });
  };
  const updateVariantImageAlt = (vi, imgIdx, alt) => {
    const v = [...form.variants];
    v[vi].images[imgIdx] = { ...v[vi].images[imgIdx], alt };
    setForm({ ...form, variants: v });
  };

  const updateSize = (vi, si, field, val) => {
    const v = [...form.variants];
    const sizes = [...v[vi].sizes];
    sizes[si] = { ...sizes[si], [field]: val };
    if (field === "price" || field === "discountPercentage") {
      const price = field === "price" ? Number(val) : Number(sizes[si].price);
      const disc = field === "discountPercentage" ? Number(val) : Number(sizes[si].discountPercentage);
      sizes[si].finalPrice = price - (price * disc) / 100;
    }
    v[vi] = { ...v[vi], sizes };
    setForm({ ...form, variants: v });
  };
  const addSize = (vi) => {
    const v = [...form.variants];
    v[vi].sizes = [...v[vi].sizes, emptySize()];
    setForm({ ...form, variants: v });
  };
  const removeSize = (vi, si) => {
    const v = [...form.variants];
    v[vi].sizes = v[vi].sizes.filter((_, i) => i !== si);
    setForm({ ...form, variants: v });
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!form.name || !form.brand || !form.slug || !form.categoryId) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await createProduct(form);
      toast.success("Product created!");
      navigate("/dashboard/products");
    } catch {
      toast.error("Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Create Product" backPath="/dashboard/products" navigate={navigate} />
      <div className="kanchira-card max-w-9xl">
        <h2 className="text-lg font-semibold mb-5" style={{ color: "#640101" }}>New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product Name" required>
              <input
                className="kanchira-input" placeholder="Name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              />
            </Field>
            <Field label="Brand" required>
              <input className="kanchira-input" placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </Field>
            <Field label="Description" required>
              <textarea className="kanchira-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="space-y-4">
              <Field label="Category" required>
                <select className="kanchira-input" value={form.categoryId} onChange={(e) => handleCatChange(e.target.value)}>
                  <option value="">Select Category</option>
                  {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Sub-Category">
                <select className="kanchira-input" value={form.subcategoryId} onChange={(e) => handleSubCatChange(e.target.value)}>
                  <option value="">Select Sub-Cat</option>
                  {filteredSubCats.map((sc) => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
                </select>
              </Field>
              <Field label="Sub-SubCategory">
                <select className="kanchira-input" value={form.subsubcategoryId} onChange={(e) => setForm({ ...form, subsubcategoryId: e.target.value })}>
                  <option value="">Select Sub-Sub-Cat</option>
                  {filteredSubSubCats.map((ssc) => <option key={ssc._id} value={ssc._id}>{ssc.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Speciality">
              <select className="kanchira-input" value={form.speciality} onChange={(e) => setForm({ ...form, speciality: e.target.value })}>
                <option value="">Select</option>
                {SPECIALITY.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Slug" required>
              <input className="kanchira-input" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </Field>
            <Field label="Discount %">
              <input type="number" className="kanchira-input" min={0} max={100} value={form.discountPercentage} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} />
            </Field>
            <Field label="Product URL">
              <input className="kanchira-input" placeholder="https://..." value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </Field>
            <Field label="Meta Title">
              <input className="kanchira-input" value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
            </Field>
            <Field label="Meta Description">
              <input className="kanchira-input" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
            </Field>
          </div>

          <Field label="Tags (select multiple)">
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button key={tag} type="button"
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${form.tags.includes(tag) ? "text-white border-transparent" : "bg-white border-gray-300 text-gray-600 hover:border-yellow-500"}`}
                  style={form.tags.includes(tag) ? { backgroundColor: "#640101" } : {}}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </Field>

          <ImageUpload preview={mainPreview} onChange={handleMainImage} loading={mainImgLoading} label="Main Image" />

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-gray-700">Variants</p>
              <button type="button" className="btn-gold flex items-center gap-1 text-xs" onClick={addVariant}>
                <i className="fa fa-plus" /> Add Variant
              </button>
            </div>
            {form.variants.map((variant, vi) => (
              <VariantBlock
                key={vi} variant={variant} vi={vi} total={form.variants.length}
                onFieldChange={updateVariantField} onRemove={removeVariant}
                onUploadImage={uploadVariantImage} onRemoveImage={removeVariantImage}
                onUpdateImageAlt={updateVariantImageAlt} onAddSize={addSize}
                onRemoveSize={removeSize} onSizeChange={updateSize}
              />
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-secondary" onClick={() => navigate("/dashboard/products")}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Creating..." : "Create Product"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── VariantBlock sub-component ────────────────────────────────────
function VariantBlock({
  variant, vi, total, onFieldChange, onRemove,
  onUploadImage, onRemoveImage, onUpdateImageAlt,
  onAddSize, onRemoveSize, onSizeChange,
}) {
  const [imgUploading, setImgUploading] = useState(false);

  const handleVariantImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImgUploading(true);
    await onUploadImage(vi, file, "");
    setImgUploading(false);
    e.target.value = "";
  };

  return (
    <div className="border border-gray-200 rounded-xl p-4 mb-4 bg-gray-50/40">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-sm" style={{ color: "#640101" }}>Variant {vi + 1}</span>
        {total > 1 && (
          <button type="button" className="text-red-500 hover:text-red-700 text-sm border-0 bg-transparent cursor-pointer" onClick={() => onRemove(vi)}>
            <i className="fa fa-times" /> Remove
          </button>
        )}
      </div>

      {/* ✅ ColorPicker component — all color logic lives here */}
      <ColorPicker vi={vi} variant={variant} onFieldChange={onFieldChange} />

      {/* Variant Images */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 font-medium mb-2">Variant Images</p>
        <div className="space-y-2">
          {variant.images.map((img, imgIdx) => (
            <div key={imgIdx} className="flex items-center gap-2 bg-white border rounded-lg p-2">
              <img src={img.url} alt={img.alt} className="w-12 h-12 object-cover rounded-md border flex-shrink-0" />
              <input
                className="kanchira-input flex-1 text-xs" placeholder="Alt text (e.g. Dress)"
                value={img.alt} onChange={(e) => onUpdateImageAlt(vi, imgIdx, e.target.value)}
              />
              <button type="button" className="text-red-500 hover:text-red-700 border-0 bg-transparent cursor-pointer flex-shrink-0" onClick={() => onRemoveImage(vi, imgIdx)}>
                <i className="fa fa-trash text-xs" />
              </button>
            </div>
          ))}
        </div>
        <label className="mt-2 flex items-center gap-2 cursor-pointer w-fit">
          <span className="btn-gold text-xs px-3 py-1.5">{imgUploading ? "Uploading..." : "+ Add Image"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleVariantImageFile} disabled={imgUploading} />
        </label>
      </div>

      {/* Sizes */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-2">Sizes</p>
        {variant.sizes.map((size, si) => (
          <SizeRow
            key={si} size={size} si={si} total={variant.sizes.length}
            onChange={(field, val) => onSizeChange(vi, si, field, val)}
            onRemove={() => onRemoveSize(vi, si)}
          />
        ))}
        <button type="button" className="text-xs text-yellow-700 hover:underline border-0 bg-transparent cursor-pointer mt-1" onClick={() => onAddSize(vi)}>
          + Add Size
        </button>
      </div>
    </div>
  );
}

// ── SizeRow sub-component ─────────────────────────────────────────
function SizeRow({ size, si, total, onChange, onRemove }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2">
        <Field label="Size">
          <select className="kanchira-input" value={size.size} onChange={(e) => onChange("size", e.target.value)}>
            <option value="">Select</option>
            {SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Price (₹)">
          <input type="number" className="kanchira-input" placeholder="0" min={0} value={size.price} onChange={(e) => onChange("price", e.target.value)} />
        </Field>
        <Field label="Stock">
          <input type="number" className="kanchira-input" placeholder="0" min={0} value={size.stock} onChange={(e) => onChange("stock", e.target.value)} />
        </Field>
        <Field label="Left">
          <input type="number" className="kanchira-input" placeholder="0" min={0} value={size.left} onChange={(e) => onChange("left", e.target.value)} />
        </Field>
        <Field label="Discount %">
          <input type="number" className="kanchira-input" placeholder="0" min={0} max={100} value={size.discountPercentage} onChange={(e) => onChange("discountPercentage", e.target.value)} />
        </Field>
        <Field label="Final Price (₹)">
          <input type="number" className="kanchira-input" placeholder="auto" value={size.finalPrice} onChange={(e) => onChange("finalPrice", e.target.value)} />
        </Field>
        <Field label="SKU">
          <input className="kanchira-input font-mono" placeholder="auto-generated" value={size.sku} onChange={(e) => onChange("sku", e.target.value)} />
        </Field>
        <Field label="Available">
          <select className="kanchira-input" value={size.isAvailable ? "true" : "false"} onChange={(e) => onChange("isAvailable", e.target.value === "true")}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </Field>
      </div>
      {total > 1 && (
        <button type="button" className="text-red-400 hover:text-red-600 text-xs border-0 bg-transparent cursor-pointer" onClick={onRemove}>
          <i className="fa fa-minus-circle" /> Remove Size
        </button>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// ProductUpdate
// ══════════════════════════════════════════════════════════════════
export function ProductUpdate() {
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;

  const normaliseItem = (raw) => {
    if (!raw) return {};
    return {
      ...raw,
      variants: (raw.variants || []).map((v) => ({
        color: v.color || "",
        colorCode: v.colorCode || "",
        images: (v.images || []).map((img) => ({ url: img.url || img, alt: img.alt || "" })),
        sizes: (v.sizes || []).map((s) => ({
          size: s.size || "", price: s.price ?? "", stock: s.stock ?? 0,
          left: s.left ?? 0, sku: s.sku || "", discountPercentage: s.discountPercentage ?? 0,
          finalPrice: s.finalPrice ?? "", isAvailable: s.isAvailable ?? true,
        })),
      })),
    };
  };

  const [form, setForm] = useState(normaliseItem(item));
  const [cats, setCats] = useState([]);
  const [subCats, setSubCats] = useState([]);
  const [subSubCats, setSubSubCats] = useState([]);
  const [filteredSubCats, setFilteredSubCats] = useState([]);
  const [filteredSubSubCats, setFilteredSubSubCats] = useState([]);
  const [mainImgLoading, setMainImgLoading] = useState(false);
  const [mainPreview, setMainPreview] = useState(item?.image || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getCategories(), getSubCategories(), getSubSubCategories()])
      .then(([c, sc, ssc]) => {
        const cList = extractCats(c);
        const scList = extractSubCats(sc);
        const sscList = extractSSC(ssc);
        setCats(cList);
        setSubCats(scList);
        setSubSubCats(sscList);
        if (item?.categoryId) setFilteredSubCats(scList.filter((s) => s.categoryId === item.categoryId));
        if (item?.subcategoryId) setFilteredSubSubCats(sscList.filter((s) => s.subCategoryId === item.subcategoryId));
      })
      .catch(() => {});
  }, []);

  const handleCatChange = (id) => {
    setForm((f) => ({ ...f, categoryId: id, subcategoryId: "", subsubcategoryId: "" }));
    setFilteredSubCats(subCats.filter((s) => s.categoryId === id));
    setFilteredSubSubCats([]);
  };
  const handleSubCatChange = (id) => {
    setForm((f) => ({ ...f, subcategoryId: id, subsubcategoryId: "" }));
    setFilteredSubSubCats(subSubCats.filter((s) => s.subCategoryId === id));
  };

  const handleMainImage = async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    setMainImgLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await uploadImage(fd);
      setForm((f) => ({ ...f, image: data.imageUrl }));
      setMainPreview(data.imageUrl);
    } catch {
      toast.error("Upload failed.");
    } finally {
      setMainImgLoading(false);
    }
  };

  const toggleTag = (tag) =>
    setForm((f) => ({
      ...f,
      tags: (f.tags || []).includes(tag) ? f.tags.filter((t) => t !== tag) : [...(f.tags || []), tag],
    }));

  const updateVariantField = (vi, field, val) => {
    const v = [...form.variants];
    v[vi] = { ...v[vi], [field]: val };
    setForm({ ...form, variants: v });
  };
  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, emptyVariant()] }));
  const removeVariant = (vi) => setForm((f) => ({ ...f, variants: f.variants.filter((_, i) => i !== vi) }));

  const uploadVariantImage = async (vi, file, alt) => {
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await uploadImage(fd);
      const v = [...form.variants];
      v[vi].images = [...v[vi].images, { url: data.imageUrl, alt: alt || "" }];
      setForm({ ...form, variants: v });
    } catch {
      toast.error("Upload failed.");
    }
  };
  const removeVariantImage = (vi, imgIdx) => {
    const v = [...form.variants];
    v[vi].images = v[vi].images.filter((_, i) => i !== imgIdx);
    setForm({ ...form, variants: v });
  };
  const updateVariantImageAlt = (vi, imgIdx, alt) => {
    const v = [...form.variants];
    v[vi].images[imgIdx] = { ...v[vi].images[imgIdx], alt };
    setForm({ ...form, variants: v });
  };

  const updateSize = (vi, si, field, val) => {
    const v = [...form.variants];
    const sizes = [...v[vi].sizes];
    sizes[si] = { ...sizes[si], [field]: val };
    if (field === "price" || field === "discountPercentage") {
      const price = field === "price" ? Number(val) : Number(sizes[si].price);
      const disc = field === "discountPercentage" ? Number(val) : Number(sizes[si].discountPercentage);
      sizes[si].finalPrice = price - (price * disc) / 100;
    }
    v[vi] = { ...v[vi], sizes };
    setForm({ ...form, variants: v });
  };
  const addSize = (vi) => {
    const v = [...form.variants];
    v[vi].sizes = [...v[vi].sizes, emptySize()];
    setForm({ ...form, variants: v });
  };
  const removeSize = (vi, si) => {
    const v = [...form.variants];
    v[vi].sizes = v[vi].sizes.filter((_, i) => i !== si);
    setForm({ ...form, variants: v });
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      await updateProduct(form);
      toast.success("Product updated!");
      navigate("/dashboard/products");
    } catch {
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  if (!item) {
    return (
      <div className="p-8 text-center text-gray-500">
        No product data found.{" "}
        <button className="text-red-700 underline" onClick={() => navigate("/dashboard/products")}>Go back</button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Update Product" backPath="/dashboard/products" navigate={navigate} />
      <div className="kanchira-card max-w-9xl">
        <h2 className="text-lg font-semibold mb-5" style={{ color: "#640101" }}>Edit Product</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Product Name">
              <input className="kanchira-input" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Brand">
              <input className="kanchira-input" value={form.brand || ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
            </Field>
            <Field label="Description">
              <textarea className="kanchira-input" rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="space-y-4">
              <Field label="Category">
                <select className="kanchira-input" value={form.categoryId || ""} onChange={(e) => handleCatChange(e.target.value)}>
                  <option value="">Select Category</option>
                  {cats.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </Field>
              <Field label="Sub-Category">
                <select className="kanchira-input" value={form.subcategoryId || ""} onChange={(e) => handleSubCatChange(e.target.value)}>
                  <option value="">Select Sub-Cat</option>
                  {filteredSubCats.map((sc) => <option key={sc._id} value={sc._id}>{sc.name}</option>)}
                </select>
              </Field>
              <Field label="Sub-SubCategory">
                <select className="kanchira-input" value={form.subsubcategoryId || ""} onChange={(e) => setForm({ ...form, subsubcategoryId: e.target.value })}>
                  <option value="">Select Sub-Sub-Cat</option>
                  {filteredSubSubCats.map((ssc) => <option key={ssc._id} value={ssc._id}>{ssc.name}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Speciality">
              <select className="kanchira-input" value={form.speciality || ""} onChange={(e) => setForm({ ...form, speciality: e.target.value })}>
                <option value="">Select</option>
                {SPECIALITY.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Slug">
              <input className="kanchira-input" value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </Field>
            <Field label="Discount %">
              <input type="number" className="kanchira-input" min={0} max={100} value={form.discountPercentage || 0} onChange={(e) => setForm({ ...form, discountPercentage: e.target.value })} />
            </Field>
            <Field label="Product URL">
              <input className="kanchira-input" value={form.url || ""} onChange={(e) => setForm({ ...form, url: e.target.value })} />
            </Field>
            <Field label="Meta Title">
              <input className="kanchira-input" value={form.metaTitle || ""} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} />
            </Field>
            <Field label="Meta Description">
              <input className="kanchira-input" value={form.metaDescription || ""} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
            </Field>
          </div>

          <Field label="Tags (select multiple)">
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map((tag) => (
                <button key={tag} type="button"
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition cursor-pointer ${(form.tags || []).includes(tag) ? "text-white border-transparent" : "bg-white border-gray-300 text-gray-600 hover:border-yellow-500"}`}
                  style={(form.tags || []).includes(tag) ? { backgroundColor: "#640101" } : {}}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </Field>

          <ImageUpload preview={mainPreview} onChange={handleMainImage} loading={mainImgLoading} label="Main Image" />

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-gray-700">Variants</p>
              <button type="button" className="btn-gold flex items-center gap-1 text-xs" onClick={addVariant}>
                <i className="fa fa-plus" /> Add Variant
              </button>
            </div>
            {(form.variants || []).map((variant, vi) => (
              <VariantBlock
                key={vi} variant={variant} vi={vi} total={form.variants.length}
                onFieldChange={updateVariantField} onRemove={removeVariant}
                onUploadImage={uploadVariantImage} onRemoveImage={removeVariantImage}
                onUpdateImageAlt={updateVariantImageAlt} onAddSize={addSize}
                onRemoveSize={removeSize} onSizeChange={updateSize}
              />
            ))}
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" className="btn-secondary" onClick={() => navigate("/dashboard/products")}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? "Updating..." : "Update Product"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}