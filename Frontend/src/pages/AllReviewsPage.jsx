import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getReview } from '../services/api'
import ImagePopup from '../components/ImagePopup'

export default function AllReviewsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [popupImg, setPopupImg] = useState(null)

  useEffect(() => {
    getReview(id)
      .then(r => { setReviews(r.data?.reviews || r.data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 max-w-3xl mx-auto">
      <button className="text-[#800000] text-sm mb-4 flex items-center gap-1" onClick={() => navigate(-1)}>
        <i className="fa fa-arrow-left" /> Back
      </button>
      <h1 className="text-xl font-bold mb-2">Customer Reviews</h1>
      {reviews.length > 0 && (
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl font-bold">{avg}</span>
          <div>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(n => (
                <i key={n} className={`fa fa-star text-sm ${n <= Math.round(avg) ? 'text-yellow-400' : 'text-gray-300'}`} />
              ))}
            </div>
            <p className="text-xs text-gray-500">{reviews.length} reviews</p>
          </div>
        </div>
      )}
      {loading ? (
        <div className="spinner-loader" />
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 text-center py-10">No reviews yet</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#800000] text-white flex items-center justify-center text-sm font-bold">
                  {(r.userId?.name || 'U')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{r.userId?.name || 'Customer'}</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(n => (
                      <i key={n} className={`fa fa-star text-xs ${n <= r.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-700 mb-2">{r.text}</p>
              {r.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {r.tags.map((t, j) => <span key={j} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{t}</span>)}
                </div>
              )}
              {r.images?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {r.images.map((img, j) => (
                    <img key={j} src={img} alt="" className="w-16 h-16 rounded-lg object-cover cursor-pointer"
                      onClick={() => setPopupImg(img)} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {popupImg && <ImagePopup src={popupImg} onClose={() => setPopupImg(null)} />}
    </div>
  )
}
