import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getSubCategories } from '../services/api'

function titleCase(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\b\w/g, (m) => m.toUpperCase())
}

function SubCategoryCard({ subCategory, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        <img
          src={subCategory?.image}
          alt={subCategory?.name || 'Subcategory'}
          className="h-[160px] w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300'
          }}
        />
      </div>
      <div className="p-3 text-left">
        <div className="line-clamp-2 text-sm font-medium" style={{ color: 'var(--maroon)' }}>
          {titleCase(subCategory?.name || '')}
        </div>
      </div>
    </button>
  )
}

export default function SubCategory() {
  const { categoryId } = useParams()
  const navigate = useNavigate()
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!categoryId) {
        setLoading(false)
        setError('Missing categoryId')
        setSubs([])
        return
      }

      setLoading(true)
      setError('')

      try {
        const r = await getSubCategories()
        if (cancelled) return

        const raw = r.data?.SubCategories ?? r.data?.subCategories ?? r.data
        const all = Array.isArray(raw) ? raw : []
        setSubs(all.filter((s) => s.categoryId === categoryId))
      } catch (e) {
        if (cancelled) return
        setError(e?.message || 'Failed to load subcategories')
        setSubs([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [categoryId])

  const goToSubSub = (subId) => {
    localStorage.setItem('subCategoryId', subId)
    navigate('/subsubcategory')
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '"DM Sans","Roboto",sans-serif' }}>
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-6">
        <div className="pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-medium hover:bg-black/5"
            style={{ color: 'var(--maroon)' }}
          >
            Back
          </button>
        </div>

        <div className="mt-6 text-center">
          <h2 className="section-title">Sub Categories</h2>
          <div className="mt-1 text-xs text-black/50">{categoryId || ''}</div>
        </div>

        {error ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="mt-10 flex items-center justify-center gap-3" style={{ color: 'var(--maroon)' }}>
            <div
              className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"
              style={{ borderColor: 'var(--maroon)' }}
            />
            <div className="text-sm font-medium">Loading...</div>
          </div>
        ) : null}

        {!loading && subs.length ? (
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {subs.map((sub) => (
              <SubCategoryCard key={sub?._id} subCategory={sub} onClick={() => goToSubSub(sub?._id)} />
            ))}
          </div>
        ) : null}

        {!loading && !subs.length && !error ? (
          <div className="mt-10 text-center text-sm text-black/60">No subcategories found.</div>
        ) : null}

        <div className="h-10" />
      </div>
    </div>
  )
}
