import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getSubCategories } from '../services/api'

export default function Footer() {
  const { logoUrl, brandName, brandData } = useApp()
  const [subCategories, setSubCategories] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getSubCategories().then(r => {
      const all = r.data?.SubCategories || r.data || []
      const shuffled = [...all].sort(() => 0.5 - Math.random()).slice(0, 15)
      setSubCategories(shuffled)
    }).catch(() => { })
  }, [])

  const goToSubSub = (id) => {
    localStorage.setItem('subCategoryId', id)
    navigate('/subsubcategory')
  }

  return (
    <footer className="bg-white px-4 sm:px-6 md:px-10 py-10">

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10 text-center sm:text-left">

        {/* BRAND */}
        <div>
          {logoUrl && (
            <img
              src={logoUrl}
              alt={brandName}
              className="max-h-14 mb-4 mx-auto sm:mx-0"
            />
          )}

          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Elegance in Every Drape,<br />
            Comfort in Every Stitch.
          </p>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <img
              src="../../assets/images/original.png"
              alt=""
              className="w-10 h-10"
              onError={e => e.target.style.display = 'none'}
            />
            <span className="text-xs text-gray-600 leading-tight">
              ORIGINAL PRODUCTS guarantee
            </span>
          </div>
        </div>

        {/* CUSTOMER */}
        <div>
          <h4 className="font-semibold mb-4 text-gray-800">Customer Policies</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/termsConditions" className="hover:text-[#800000]">T&C</Link></li>
            <li><Link to="/shipping" className="hover:text-[#800000]">Shipping</Link></li>
            <li><Link to="/privacy_policy" className="hover:text-[#800000]">Privacy</Link></li>
            <li><Link to="/cancellationsrefound" className="hover:text-[#800000]">Cancellation</Link></li>
            <li><Link to="/return-policy" className="hover:text-[#800000]">Returns</Link></li>
          </ul>
        </div>

        {/* SHOPPING */}
        <div>
          <h4 className="font-semibold mb-4 text-gray-800">Online Shopping</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-[#800000]">Women</a></li>
            <li><a href="#" className="hover:text-[#800000]">Kids Boys</a></li>
            <li>
              <a href="#" className="hover:text-[#800000]">
                Kids Girls
                <span className="ml-2 text-xs bg-[#800000] text-white px-2 py-0.5 rounded">
                  New
                </span>
              </a>
            </li>
          </ul>
        </div>

        {/* SUPPORT */}
        <div>
          <h4 className="font-semibold mb-4 text-gray-800">Support</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/help-content" className="hover:text-[#800000]">Help Centre</Link></li>
            <li><Link to="/contactus" className="hover:text-[#800000]">Contact Us</Link></li>
          </ul>
        </div>
      </div>

      {/* POPULAR */}
      {subCategories.length > 0 && (
        <div className="border-t pt-5 mb-6">
          <h5 className="font-semibold mb-3 text-center sm:text-left">Popular Searches</h5>

          <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-sm">
            {subCategories.map((item, i) => (
              <span key={item._id} className="flex items-center">
                <span
                  className="cursor-pointer hover:text-black text-gray-600"
                  onClick={() => goToSubSub(item._id)}
                >
                  {item.name}
                </span>
                {i < subCategories.length - 1 && (
                  <span className="mx-2 text-gray-300">|</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CONTACT */}
      <div className="border-t pt-5 mb-6 text-center sm:text-left text-sm text-gray-600 leading-6">
        <h5 className="font-semibold mb-2 text-gray-800">Registered Address</h5>

        {brandName} Clothing Store<br />
        Plot No. 249 & 250, Sardar Patel Nagar<br />
        Near JNTU, Kukatpally<br />
        Hyderabad, Medchal Malkajgiri<br />
        Telangana - 500085<br />
        📞 {brandData?.phoneNumber || '+91 9963353171'}<br />
        ✉️ {brandData?.email || 'support@kanchira.com'}
      </div>

      {/* ABOUT */}
      <div className="border-t pt-5 mb-6 text-sm text-gray-600 text-center sm:text-left">
        <h5 className="font-semibold mb-2 uppercase text-gray-800">
          {brandName} Shopping
        </h5>

        <p>
          Your destination for elegant and affordable clothing.
        </p>
      </div>

      {/* BOTTOM */}
      <div className="border-t pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
        <p>© {brandName}. All rights reserved.</p>

        <div className="flex gap-4 text-lg">
          <i className="fa fa-facebook-square cursor-pointer hover:text-[#800000]" />
          <i className="fa fa-instagram cursor-pointer hover:text-[#800000]" />
          <i className="fa fa-twitter-square cursor-pointer hover:text-[#800000]" />
        </div>
      </div>

    </footer>
  )
}