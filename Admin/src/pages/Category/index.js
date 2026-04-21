import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCategories, createCategory, updateCategory, deleteCategory, uploadImage } from '../../services/api';
import { DataTable, PageHeader, ConfirmModal, FormCard, Field, ImageUpload, Badge } from '../../components/UI';

// ── Category List ─────────────────────────────────────────────────
export function CategoryList() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  const load = async () => {
    setLoading(true);
    try { const r = await getCategories(); setData(Array.isArray(r.data) ? r.data : []); }
    catch { toast.error('Failed to load categories.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteId);
      toast.success('Category deleted successfully!');
      load();
    } catch { toast.error('Failed to delete category.'); }
  };

  const columns = [
    { key: 'image', label: 'Image', render: r => r.image ? <img src={r.image} alt="" className="img-preview" /> : <span className="text-gray-300">—</span> },
    { key: 'name', label: 'Name', searchable: true, render: r => <span className="font-medium capitalize">{r.name}</span> },
    { key: 'slug', label: 'Slug', searchable: true },
    { key: 'available', label: 'Available', render: r => <Badge value={r.available} /> },
    { key: 'updatedAt', label: 'Updated On', render: r => r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : '—' },
  ];

  return (
    <div>
      <PageHeader title="Category List" buttonLabel="Create Category" onButtonClick={() => navigate('/dashboard/category/create')} />
      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner" style={{ width: 40, height: 40, borderTopColor: '#640101', borderColor: 'rgba(100,1,1,0.2)', borderWidth: 4 }} /></div>
      ) : (
        <div className="kanchira-card">
          <DataTable
            columns={columns}
            data={data}
            searchPlaceholder="Search categories..."
            actions={row => (
              <>
                <button className="btn-edit btn-icon" onClick={() => navigate('/dashboard/category/update', { state: { item: row } })}><i className="fa fa-pencil text-xs" /></button>
                <button className="btn-danger btn-icon" onClick={() => setDeleteId(row._id)}><i className="fa fa-trash text-xs" /></button>
              </>
            )}
          />
        </div>
      )}
      <ConfirmModal open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
}

// ── Category Create ───────────────────────────────────────────────
export function CategoryCreate() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', slug: '', image: '' });
  const [errors, setErrors] = useState({});
  const [imgLoading, setImgLoading] = useState(false);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 3) e.name = 'Name must be at least 3 characters.';
    if (!form.description || form.description.length < 10) e.description = 'Description must be at least 10 characters.';
    return e;
  };

  const handleImage = async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    setImgLoading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const { data } = await uploadImage(fd);
      setForm(f => ({ ...f, image: data.imageUrl }));
      setPreview(data.imageUrl);
      toast.success('Image uploaded!');
    } catch { toast.error('Image upload failed.'); }
    finally { setImgLoading(false); }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      await createCategory(form);
      toast.success('Category created!');
      navigate('/dashboard/category');
    } catch { toast.error('Failed to create category.'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Create Category" backPath="/dashboard/category" navigate={navigate} />
      <FormCard title="New Category" onSubmit={handleSubmit} onCancel={() => navigate('/dashboard/category')} submitLabel="Create Category" loading={loading}>
        <Field label="Category Name" required error={errors.name}>
          <input className="kanchira-input" placeholder="Enter category name" value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })} />
        </Field>
        <Field label="Description" required error={errors.description}>
          <textarea className="kanchira-input" rows={3} placeholder="Enter description" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
        </Field>
        <Field label="Slug">
          <input className="kanchira-input" placeholder="category-slug" value={form.slug}
            onChange={e => setForm({ ...form, slug: e.target.value })} />
        </Field>
        <ImageUpload preview={preview} onChange={handleImage} loading={imgLoading} />
      </FormCard>
    </div>
  );
}

// ── Category Update ───────────────────────────────────────────────
export function CategoryUpdate() {
  const navigate = useNavigate();
  const location = useLocation();
  const item = location.state?.item;
  const [form, setForm] = useState(item || { name: '', description: '', slug: '', image: '' });
  const [imgLoading, setImgLoading] = useState(false);
  const [preview, setPreview] = useState(item?.image || '');
  const [loading, setLoading] = useState(false);

  const handleImage = async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;
    setImgLoading(true);
    try {
      const fd = new FormData(); fd.append('file', file);
      const { data } = await uploadImage(fd);
      setForm(f => ({ ...f, image: data.imageUrl }));
      setPreview(data.imageUrl);
    } catch { toast.error('Image upload failed.'); }
    finally { setImgLoading(false); }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setLoading(true);
    try {
      await updateCategory(form);
      toast.success('Category updated!');
      navigate('/dashboard/category');
    } catch { toast.error('Failed to update category.'); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <PageHeader title="Update Category" backPath="/dashboard/category" navigate={navigate} />
      <FormCard title="Edit Category" onSubmit={handleSubmit} onCancel={() => navigate('/dashboard/category')} submitLabel="Update Category" loading={loading}>
        <Field label="Category Name" required>
          <input className="kanchira-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Description">
          <textarea className="kanchira-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </Field>
        <Field label="Slug">
          <input className="kanchira-input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
        </Field>
        <ImageUpload preview={preview} onChange={handleImage} loading={imgLoading} label="Update Image" />
      </FormCard>
    </div>
  );
}
