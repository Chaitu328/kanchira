// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { toast } from "react-toastify";
// import {
//   getSubSubCategories,
//   getSubSubCategoryById,
//   getSubSubByCategory,
//   createSubSubCategory,
//   updateSubSubCategory,
//   deleteSubSubCategory,
//   getSubCategories,
//   getCategories,
//   uploadImage,
// } from "../../services/superAdminApi";
// import {
//   DataTable,
//   PageHeader,
//   ConfirmModal,
//   Field,
//   Badge,
// } from "../../components/UI";

// // ── helpers ──────────────────────────────────────────────────────
// const extractCats = (res) => (Array.isArray(res.data) ? res.data : []);
// const extractSubCats = (res) =>
//   Array.isArray(res.data?.SubCategories) ? res.data.SubCategories : [];
// const extractSSC = (res) =>
//   Array.isArray(res.data?.subSubCategories) ? res.data.subSubCategories : [];

// async function doUpload(file) {
//   const fd = new FormData();
//   fd.append("file", file);
//   const { data } = await uploadImage(fd);
//   return data.imageUrl;
// }

// // ══════════════════════════════════════════════════════════════════
// // PAGE 1: SuperAdminSubSubCategoryList (Sub-subCategory List)
// // ══════════════════════════════════════════════════════════════════
// export function SuperAdminSubSubCategoryList() {
//   const navigate = useNavigate();
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [deleteId, setDeleteId] = useState(null);

//   const load = async () => {
//     setLoading(true);
//     try {
//       const ssc = await getSubSubCategories();
//       setData(extractSSC(ssc));
//     } catch {
//       toast.error("Failed to load sub-subcategories.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//   }, []);

//   const handleDelete = async () => {
//     try {
//       await deleteSubSubCategory(deleteId);
//       toast.success("Deleted successfully!");
//       load();
//     } catch {
//       toast.error("Delete failed.");
//     } finally {
//       setDeleteId(null);
//     }
//   };

//   const columns = [
//     {
//       key: "image",
//       label: "Image",
//       render: (r) =>
//         r.image ? (
//           <img
//             src={r.image}
//             alt=""
//             className="w-12 h-12 object-cover rounded border"
//           />
//         ) : (
//           "—"
//         ),
//     },
//     {
//       key: "name",
//       label: "Name",
//       searchable: true,
//       render: (r) => <span className="font-medium capitalize">{r.name}</span>,
//     },
//     { key: "slug", label: "Slug", searchable: true },
//     {
//       key: "available",
//       label: "Status",
//       render: (r) => <Badge value={r.available !== false} />,
//     },
//   ];

//   return (
//     <div>
//       <PageHeader
//         title="Sub-subCategory List"
//         buttonLabel="Create Sub-SubCategory"
//         onButtonClick={() => navigate("/superadmin/sub-subcategory/create")}
//       />

//       {loading ? (
//         <div className="flex justify-center py-12">
//           <div
//             className="spinner"
//             style={{
//               width: 40,
//               height: 40,
//               borderTopColor: "#640101",
//               borderColor: "rgba(100,1,1,0.2)",
//               borderWidth: 4,
//             }}
//           />
//         </div>
//       ) : (
//         <div className="kanchira-card">
//           <DataTable
//             columns={columns}
//             data={data}
//             searchPlaceholder="Filter..."
//             actions={(row) => (
//               <>
//                 <button
//                   className="btn-edit btn-icon"
//                   onClick={() =>
//                     navigate("/superadmin/sub-subcategory/update", {
//                       state: { item: row },
//                     })
//                   }
//                 >
//                   <i className="fa fa-pencil text-xs" />
//                 </button>
//                 <button
//                   className="btn-danger btn-icon"
//                   onClick={() => setDeleteId(row._id)}
//                 >
//                   <i className="fa fa-trash text-xs" />
//                 </button>
//               </>
//             )}
//           />
//         </div>
//       )}

//       <ConfirmModal
//         open={!!deleteId}
//         onClose={() => setDeleteId(null)}
//         onConfirm={handleDelete}
//       />
//     </div>
//   );
// }

// // ══════════════════════════════════════════════════════════════════
// // PAGE 2: SuperAdminSubSubCategoryCreate (Create Sub-SubCategory)
// // ══════════════════════════════════════════════════════════════════
// export function SuperAdminSubSubCategoryCreate() {
//   const navigate = useNavigate();
//   const [categories, setCategories] = useState([]);
//   const [subCategories, setSubCategories] = useState([]);
//   const [filteredSubCats, setFilteredSubCats] = useState([]);
//   const [form, setForm] = useState({
//     name: "",
//     slug: "",
//     categoryId: "",
//     subCategoryId: "",
//     image: "",
//     available: true,
//     sortOrder: 0,
//   });
//   const [imagePreview, setImagePreview] = useState("");
//   const [imageLoading, setImageLoading] = useState(false);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const loadData = async () => {
//       try {
//         const [cats, subCats] = await Promise.all([
//           getCategories(),
//           getSubCategories(),
//         ]);
//         const cList = extractCats(cats);
//         const scList = extractSubCats(subCats);
//         setCategories(cList);
//         setSubCategories(scList);
//       } catch {}
//     };
//     loadData();
//   }, []);

//   const handleCatChange = (catId) => {
//     setForm((f) => ({ ...f, categoryId: catId, subCategoryId: "" }));
//     setFilteredSubCats(subCategories.filter((sc) => sc.categoryId === catId));
//   };

//   const handleImageUpload = async (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setImageLoading(true);
//     try {
//       const url = await doUpload(file);
//       setForm((f) => ({ ...f, image: url }));
//       setImagePreview(url);
//     } catch {
//       toast.error("Image upload failed.");
//     } finally {
//       setImageLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.name.trim()) {
//       toast.error("Name is required");
//       return;
//     }
//     if (!form.categoryId) {
//       toast.error("Please select a category");
//       return;
//     }
//     if (!form.subCategoryId) {
//       toast.error("Please select a sub-category");
//       return;
//     }
//     setLoading(true);
//     try {
//       await createSubSubCategory(form);
//       toast.success("Sub-subcategory created!");
//       navigate("/superadmin/sub-subcategory");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to create.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <PageHeader
//         title="Create Sub-SubCategory"
//         backPath="/superadmin/sub-subcategory"
//         navigate={navigate}
//       />
//       <div className="kanchira-card max-w-9xl">
//         <div className="dark-form-header">Create Sub-Sub Category</div>
//         <form onSubmit={handleSubmit} className="p-6 space-y-5">
//           {/* Row 1: Select Category + Sub-Category */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Field label="Select Category" required>
//               <select
//                 className="kanchira-input"
//                 value={form.categoryId}
//                 onChange={(e) => handleCatChange(e.target.value)}
//               >
//                 <option value="">Select category</option>
//                 {categories.map((c) => (
//                   <option key={c._id} value={c._id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//             </Field>
//             <Field label="Select Sub-Category" required>
//               <select
//                 className="kanchira-input"
//                 value={form.subCategoryId}
//                 onChange={(e) =>
//                   setForm({ ...form, subCategoryId: e.target.value })
//                 }
//                 disabled={!form.categoryId}
//               >
//                 <option value="">Select sub-category</option>
//                 {filteredSubCats.map((sc) => (
//                   <option key={sc._id} value={sc._id}>
//                     {sc.name}
//                   </option>
//                 ))}
//               </select>
//             </Field>
//           </div>

//           {/* Row 2: Name + Slug */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Field label="Sub-Subcategory Name" required>
//               <input
//                 className="kanchira-input"
//                 placeholder="Enter name"
//                 value={form.name}
//                 onChange={(e) =>
//                   setForm({
//                     ...form,
//                     name: e.target.value,
//                     slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
//                   })
//                 }
//               />
//             </Field>
//             <Field label="Slug">
//               <input
//                 className="kanchira-input"
//                 placeholder="sub-subcategory-slug"
//                 value={form.slug}
//                 onChange={(e) => setForm({ ...form, slug: e.target.value })}
//               />
//             </Field>
//           </div>

//           {/* Available checkbox */}
//           <div className="flex items-center gap-2">
//             <input
//               type="checkbox"
//               id="available"
//               checked={form.available}
//               onChange={(e) =>
//                 setForm({ ...form, available: e.target.checked })
//               }
//               className="w-4 h-4 accent-red-800"
//             />
//             <label
//               htmlFor="available"
//               className="text-sm font-medium text-gray-700"
//             >
//               Available
//             </label>
//           </div>

//           {/* Image upload */}
//           <div>
//             <Field label="Upload Image">
//               <input
//                 type="file"
//                 accept="image/*"
//                 className="kanchira-input py-1.5"
//                 onChange={handleImageUpload}
//                 disabled={imageLoading}
//               />
//             </Field>
//             {imageLoading && (
//               <p className="text-xs text-gray-400 mt-1">Uploading...</p>
//             )}
//             {imagePreview && (
//               <div className="mt-2">
//                 <p className="text-xs text-gray-400 mb-1">Image Preview</p>
//                 <img
//                   src={imagePreview}
//                   alt="preview"
//                   className="w-24 h-24 object-cover rounded-lg border"
//                 />
//               </div>
//             )}
//           </div>

//           {/* Sort Order */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Field label="Sort Order">
//               <input
//                 type="number"
//                 className="kanchira-input"
//                 min={0}
//                 value={form.sortOrder}
//                 onChange={(e) =>
//                   setForm({ ...form, sortOrder: Number(e.target.value) })
//                 }
//               />
//             </Field>
//           </div>

//           {/* Buttons */}
//           <div className="flex gap-3 justify-end pt-2">
//             <button
//               type="button"
//               className="btn-secondary"
//               onClick={() => navigate("/superadmin/sub-subcategory")}
//             >
//               Back
//             </button>
//             <button type="submit" className="btn-primary" disabled={loading}>
//               {loading ? "Creating..." : "Create Sub-Subcategory"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// // ══════════════════════════════════════════════════════════════════
// // DEFAULT EXPORT
// // ══════════════════════════════════════════════════════════════════
// export default SuperAdminSubSubCategoryList;

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  getSuperAdminSubSubCategories as getSubSubCategories,
  getSuperAdminSubSubCategoryById as getSubSubCategoryById,
  getSuperAdminSubSubByCategory as getSubSubByCategory,
  createSuperAdminSubSubCategory as createSubSubCategory,
  updateSuperAdminSubSubCategory,
  deleteSuperAdminSubSubCategory as deleteSubSubCategory,
  getSuperAdminSubCategories as getSubCategories,
  getSuperAdminCategories as getCategories,
  superAdminUploadImage as uploadImage,
} from "../../services/superAdminApi";
import {
  DataTable,
  PageHeader,
  ConfirmModal,
  Field,
  Badge,
} from "../../components/UI";

// ── helpers ──────────────────────────────────────────────────────
const extractCats = (res) => (Array.isArray(res.data) ? res.data : []);
const extractSubCats = (res) =>
  Array.isArray(res.data?.SubCategories) ? res.data.SubCategories : [];
const extractSSC = (res) =>
  Array.isArray(res.data?.subSubCategories) ? res.data.subSubCategories : [];

async function doUpload(file) {
  const fd = new FormData();
  fd.append("file", file);
  const { data } = await uploadImage(fd);
  return data.imageUrl;
}

// ══════════════════════════════════════════════════════════════════
// PAGE 1: SuperAdminSubSubCategoryList (Sub-subCategory List)
// ══════════════════════════════════════════════════════════════════
export function SuperAdminSubSubCategoryList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const ssc = await getSubSubCategories();
      setData(extractSSC(ssc));
    } catch {
      toast.error("Failed to load sub-subcategories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteSubSubCategory(deleteId);
      toast.success("Deleted successfully!");
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
          <img
            src={r.image}
            alt=""
            className="w-12 h-12 object-cover rounded border"
          />
        ) : (
          "—"
        ),
    },
    {
      key: "name",
      label: "Name",
      searchable: true,
      render: (r) => <span className="font-medium capitalize">{r.name}</span>,
    },
    { key: "slug", label: "Slug", searchable: true },
    {
      key: "available",
      label: "Status",
      render: (r) => <Badge value={r.available !== false} />,
    },
  ];

  return (
    <div>
      <PageHeader
        title="Sub-subCategory List"
        buttonLabel="Create Sub-SubCategory"
        onButtonClick={() => navigate("/superadmin/sub-subcategory/create")}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <div
            className="spinner"
            style={{
              width: 40,
              height: 40,
              borderTopColor: "#640101",
              borderColor: "rgba(100,1,1,0.2)",
              borderWidth: 4,
            }}
          />
        </div>
      ) : (
        <div className="kanchira-card">
          <DataTable
            columns={columns}
            data={data}
            searchPlaceholder="Filter..."
            actions={(row) => (
              <>
                <button
                  className="btn-edit btn-icon"
                  onClick={() =>
                    navigate("/superadmin/sub-subcategory/update", {
                      state: { item: row },
                    })
                  }
                >
                  <i className="fa fa-pencil text-xs" />
                </button>
                <button
                  className="btn-danger btn-icon"
                  onClick={() => setDeleteId(row._id)}
                >
                  <i className="fa fa-trash text-xs" />
                </button>
              </>
            )}
          />
        </div>
      )}

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE 2: SuperAdminSubSubCategoryCreate (Create Sub-SubCategory)
// ══════════════════════════════════════════════════════════════════
export function SuperAdminSubSubCategoryCreate() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCats, setFilteredSubCats] = useState([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    categoryId: "",
    subCategoryId: "",
    image: "",
    available: true,
    sortOrder: 0,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, subCats] = await Promise.all([
          getCategories(),
          getSubCategories(),
        ]);
        const cList = extractCats(cats);
        const scList = extractSubCats(subCats);
        setCategories(cList);
        setSubCategories(scList);
      } catch {}
    };
    loadData();
  }, []);

  const handleCatChange = (catId) => {
    setForm((f) => ({ ...f, categoryId: catId, subCategoryId: "" }));
    setFilteredSubCats(subCategories.filter((sc) => sc.categoryId === catId));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageLoading(true);
    try {
      const url = await doUpload(file);
      setForm((f) => ({ ...f, image: url }));
      setImagePreview(url);
    } catch {
      toast.error("Image upload failed.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!form.categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!form.subCategoryId) {
      toast.error("Please select a sub-category");
      return;
    }
    setLoading(true);
    try {
      await createSubSubCategory(form);
      toast.success("Sub-subcategory created!");
      navigate("/superadmin/sub-subcategory");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Sub-SubCategory"
        backPath="/superadmin/sub-subcategory"
        navigate={navigate}
      />
      <div className="kanchira-card max-w-9xl">
        <div className="dark-form-header">Create Sub-Sub Category</div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Select Category + Sub-Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Select Category" required>
              <select
                className="kanchira-input"
                value={form.categoryId}
                onChange={(e) => handleCatChange(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Select Sub-Category" required>
              <select
                className="kanchira-input"
                value={form.subCategoryId}
                onChange={(e) =>
                  setForm({ ...form, subCategoryId: e.target.value })
                }
                disabled={!form.categoryId}
              >
                <option value="">Select sub-category</option>
                {filteredSubCats.map((sc) => (
                  <option key={sc._id} value={sc._id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Row 2: Name + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Sub-Subcategory Name" required>
              <input
                className="kanchira-input"
                placeholder="Enter name"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
              />
            </Field>
            <Field label="Slug">
              <input
                className="kanchira-input"
                placeholder="sub-subcategory-slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </Field>
          </div>

          {/* Available checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={form.available}
              onChange={(e) =>
                setForm({ ...form, available: e.target.checked })
              }
              className="w-4 h-4 accent-red-800"
            />
            <label
              htmlFor="available"
              className="text-sm font-medium text-gray-700"
            >
              Available
            </label>
          </div>

          {/* Image upload */}
          <div>
            <Field label="Upload Image">
              <input
                type="file"
                accept="image/*"
                className="kanchira-input py-1.5"
                onChange={handleImageUpload}
                disabled={imageLoading}
              />
            </Field>
            {imageLoading && (
              <p className="text-xs text-gray-400 mt-1">Uploading...</p>
            )}
            {imagePreview && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1">Image Preview</p>
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Sort Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Sort Order">
              <input
                type="number"
                className="kanchira-input"
                min={0}
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
              />
            </Field>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/superadmin/sub-subcategory")}
            >
              Back
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Sub-Subcategory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// PAGE 3: SuperAdminSubSubCategoryUpdate (Update Sub-SubCategory)
// ══════════════════════════════════════════════════════════════════
export function SuperAdminSubSubCategoryUpdate() {
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;

  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [filteredSubCats, setFilteredSubCats] = useState([]);
  const [form, setForm] = useState(
    item || {
      _id: "",
      name: "",
      slug: "",
      categoryId: "",
      subCategoryId: "",
      image: "",
      available: true,
      sortOrder: 0,
    },
  );
  const [imagePreview, setImagePreview] = useState(item?.image || "");
  const [imageLoading, setImageLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, subCats] = await Promise.all([
          getCategories(),
          getSubCategories(),
        ]);
        const cList = extractCats(cats);
        const scList = extractSubCats(subCats);
        setCategories(cList);
        setSubCategories(scList);
        if (item?.categoryId) {
          setFilteredSubCats(
            scList.filter((sc) => sc.categoryId === item.categoryId),
          );
        }
      } catch {}
    };
    loadData();
  }, []);

  const handleCatChange = (catId) => {
    setForm((f) => ({ ...f, categoryId: catId, subCategoryId: "" }));
    setFilteredSubCats(subCategories.filter((sc) => sc.categoryId === catId));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageLoading(true);
    try {
      const url = await doUpload(file);
      setForm((f) => ({ ...f, image: url }));
      setImagePreview(url);
    } catch {
      toast.error("Image upload failed.");
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form._id) {
      toast.error("Sub-subcategory ID is missing. Cannot update.");
      return;
    }
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setLoading(true);
    try {
      await updateSuperAdminSubSubCategory(form._id, form);
      toast.success("Sub-subcategory updated!");
      navigate("/superadmin/sub-subcategory");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update.");
    } finally {
      setLoading(false);
    }
  };

  if (!item && !form._id) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-4">No sub-subcategory data found.</p>
        <button
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white border-0 cursor-pointer"
          style={{ backgroundColor: "#640101" }}
          onClick={() => navigate("/superadmin/sub-subcategory")}
        >
          ← Back to Sub-subCategories
        </button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Update Sub-SubCategory"
        backPath="/superadmin/sub-subcategory"
        navigate={navigate}
      />
      <div className="kanchira-card max-w-9xl">
        <div className="dark-form-header">Update Sub-Sub Category</div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Row 1: Select Category + Sub-Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Select Category">
              <select
                className="kanchira-input"
                value={form.categoryId || ""}
                onChange={(e) => handleCatChange(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Select Sub-Category">
              <select
                className="kanchira-input"
                value={form.subCategoryId || ""}
                onChange={(e) =>
                  setForm({ ...form, subCategoryId: e.target.value })
                }
                disabled={!form.categoryId}
              >
                <option value="">Select sub-category</option>
                {filteredSubCats.map((sc) => (
                  <option key={sc._id} value={sc._id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {/* Row 2: Name + Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Sub-Subcategory Name">
              <input
                className="kanchira-input"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Slug">
              <input
                className="kanchira-input"
                value={form.slug || ""}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </Field>
          </div>

          {/* Available checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={form.available !== false}
              onChange={(e) =>
                setForm({ ...form, available: e.target.checked })
              }
              className="w-4 h-4 accent-red-800"
            />
            <label
              htmlFor="available"
              className="text-sm font-medium text-gray-700"
            >
              Available
            </label>
          </div>

          {/* Image upload */}
          <div>
            <Field label="Upload Image">
              <input
                type="file"
                accept="image/*"
                className="kanchira-input py-1.5"
                onChange={handleImageUpload}
                disabled={imageLoading}
              />
            </Field>
            {imageLoading && (
              <p className="text-xs text-gray-400 mt-1">Uploading...</p>
            )}
            {imagePreview && (
              <div className="mt-2">
                <p className="text-xs text-gray-400 mb-1">Image Preview</p>
                <img
                  src={imagePreview}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Sort Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Sort Order">
              <input
                type="number"
                className="kanchira-input"
                min={0}
                value={form.sortOrder ?? 0}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
              />
            </Field>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate("/superadmin/sub-subcategory")}
            >
              Back
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Updating..." : "Update Sub-Subcategory"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ══════════════════════════════════════════════════════════════════
export default SuperAdminSubSubCategoryList;
