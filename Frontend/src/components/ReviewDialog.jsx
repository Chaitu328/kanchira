import { useState } from 'react'
import { addReview } from '../services/api'
import toast from 'react-hot-toast'

export function ReviewDialog({ productId, userId, onClose, onSuccess }) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [text, setText] = useState('')
  const [tags, setTags] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!rating || !text.trim()) { toast.error('Please add rating and review'); return }
    setSubmitting(true)
    try {
      await addReview({
        productId,
        userId,
        rating,
        text,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        images: [],
      })
      toast.success('Review submitted!')
      onSuccess()
    } catch { toast.error('Failed to submit review') }
    setSubmitting(false)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <button className="absolute top-3 right-4 text-2xl text-gray-400" onClick={onClose}>×</button>
        <h3 className="text-lg font-bold mb-4">Write a Review</h3>

        {/* Star rating */}
        <div className="flex gap-2 mb-4">
          {[1,2,3,4,5].map(n => (
            <i
              key={n}
              className={`fa fa-star text-2xl cursor-pointer transition-colors ${n <= (hovered || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(n)}
            />
          ))}
        </div>

        <textarea
          className="form-input mb-3 h-24 resize-none"
          placeholder="Share your experience..."
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <input
          className="form-input mb-4"
          placeholder="Tags (comma separated, e.g. quality, value)"
          value={tags}
          onChange={e => setTags(e.target.value)}
        />
        <button className="btn-maroon" onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </div>
  )
}

export default ReviewDialog

export function ImagePopup({ src, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <img src={src} alt="" className="max-w-full max-h-[90vh] rounded-xl" onClick={e => e.stopPropagation()} />
      <button className="absolute top-4 right-4 text-white text-3xl" onClick={onClose}>×</button>
    </div>
  )
}
