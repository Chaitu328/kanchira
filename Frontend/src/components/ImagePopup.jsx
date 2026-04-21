export default function ImagePopup({ src, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <img src={src} alt="" className="max-w-full max-h-[90vh] rounded-xl object-contain" onClick={e => e.stopPropagation()} />
      <button className="absolute top-4 right-4 text-white text-3xl leading-none" onClick={onClose}>×</button>
    </div>
  )
}
