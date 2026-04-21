import { useState } from 'react'
import { submitContactForm } from '../services/api'

export function TermsConditionsPage() {
  return (
    <div className="policy-page">
      <h1>Terms &amp; Conditions</h1>
      <p>Last updated: January 2025</p>
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing and using the Kanchira website, you accept and agree to be bound by the terms and provisions of this agreement.</p>
      <h3>2. Use of the Website</h3>
      <p>You may use this website for lawful purposes only. You must not use this website in any way that causes, or may cause, damage to the website or impairment of the availability or accessibility of the website.</p>
      <h3>3. Products and Pricing</h3>
      <p>All prices are in Indian Rupees (INR). We reserve the right to modify prices at any time without prior notice.</p>
      <h3>4. Orders and Payment</h3>
      <p>All orders are subject to availability and confirmation. We accept Cash on Delivery (COD) and online payments.</p>
      <h3>5. Intellectual Property</h3>
      <p>All content on this website is the property of Kanchira and is protected by applicable intellectual property laws.</p>
      <h3>6. Limitation of Liability</h3>
      <p>Kanchira shall not be liable for any indirect or consequential damages arising from use of the website or purchase of products.</p>
      <h3>7. Contact</h3>
      <p>For any queries: kanchira.india@gmail.com | +91 9963353171</p>
    </div>
  )
}

export function ShippingPolicyPage() {
  return (
    <div className="policy-page">
      <h1>Shipping Policy</h1>
      <h3>Delivery Timeframe</h3>
      <p>Orders processed within 1-2 business days. Standard delivery: 5-7 business days. Express delivery: 2-3 business days.</p>
      <h3>Shipping Charges</h3>
      <p>Free shipping on orders above ₹499. A shipping fee of ₹49 is charged for orders below ₹499.</p>
      <h3>Delivery Areas</h3>
      <p>We deliver across India. Check your pincode availability at checkout.</p>
      <h3>Order Tracking</h3>
      <p>Once shipped, you will receive a tracking number via email and SMS.</p>
      <h3>Damaged or Lost Packages</h3>
      <p>Contact us immediately at kanchira.india@gmail.com with your order details and photos.</p>
    </div>
  )
}

export function PrivacyPolicyPage() {
  return (
    <div className="policy-page">
      <h1>Privacy Policy</h1>
      <h3>Information We Collect</h3>
      <p>We collect name, email, phone number, and delivery address when you register or place an order.</p>
      <h3>How We Use Your Information</h3>
      <ul>
        <li>To process and fulfil your orders</li>
        <li>To send order confirmations and updates</li>
        <li>To provide customer support</li>
        <li>To send promotional offers (with your consent)</li>
      </ul>
      <h3>Information Sharing</h3>
      <p>We do not sell your personal data. We share it only with delivery partners and payment processors.</p>
      <h3>Data Security</h3>
      <p>We implement SSL encryption and appropriate security measures to protect your personal information.</p>
      <h3>Your Rights</h3>
      <p>Contact kanchira.india@gmail.com to access, correct, or delete your personal information.</p>
    </div>
  )
}

export function CancellationReturnsPage() {
  return (
    <div className="policy-page">
      <h1>Cancellation &amp; Returns</h1>
      <h3>Order Cancellation</h3>
      <p>Orders can be cancelled within 24 hours of placement. Once shipped, cancellation is not possible.</p>
      <h3>Return Policy</h3>
      <p>We accept returns within 8 days of delivery. Items must be unused, unwashed, and in their original packaging with all tags intact.</p>
      <h3>Non-Returnable Items</h3>
      <ul>
        <li>Items purchased during sale or discount events</li>
        <li>Customized or personalized products</li>
        <li>Items showing signs of use or washing</li>
      </ul>
      <h3>Refund Timeline</h3>
      <p>Refunds are processed within 7-10 business days after we receive the returned item.</p>
    </div>
  )
}

export function ReturnPolicyPage() {
  return (
    <div className="policy-page">
      <h1>Return Policy</h1>
      <h3>8-Day Return Window</h3>
      <p>You have 8 days from delivery to initiate a return for eligible items.</p>
      <h3>Conditions for Return</h3>
      <ul>
        <li>Item must be unworn, unwashed with original tags</li>
        <li>Original packaging should be intact</li>
        <li>Proof of purchase (order ID) is required</li>
      </ul>
      <h3>How to Initiate a Return</h3>
      <p>Contact us via email at kanchira.india@gmail.com or WhatsApp +91 9963353171 with your order details and photos.</p>
      <h3>Defective Items</h3>
      <p>Report defects within 48 hours of delivery with clear photographs for a free replacement or full refund.</p>
    </div>
  )
}

export function HelpCenterPage() {
  const faqs = [
    { q: 'How do I track my order?', a: 'Once shipped, you will receive a tracking number via email and SMS.' },
    { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery (COD) and online payments via UPI, debit/credit cards through PhonePe.' },
    { q: 'How long does delivery take?', a: 'Standard delivery takes 5-7 business days. Express delivery takes 2-3 business days.' },
    { q: 'Can I change my delivery address after placing an order?', a: 'Address changes are only possible within 2 hours of placing the order.' },
    { q: 'How do I return a product?', a: 'Contact our support team within 8 days of delivery with your order ID and reason for return.' },
    { q: 'Are the products authentic?', a: 'Yes! All products sold on Kanchira are 100% genuine and sourced directly from manufacturers.' },
  ]

  return (
    <div className="policy-page">
      <h1>Help Centre</h1>
      <p className="mb-6 text-gray-500">Find answers to the most common questions below.</p>
      <div className="space-y-3">
        {faqs.map((f, i) => (
          <details key={i} className="border border-gray-200 rounded-xl p-4 cursor-pointer">
            <summary className="font-semibold text-sm text-gray-800 list-none">{f.q}</summary>
            <p className="mt-3 text-sm text-gray-600 leading-relaxed">{f.a}</p>
          </details>
        ))}
      </div>
      <div className="mt-8 bg-red-50 border border-red-100 rounded-xl p-6 text-center">
        <h3 className="font-bold text-[#800000] mb-2">Still need help?</h3>
        <p className="text-sm text-gray-600">📞 +91 9963353171</p>
        <p className="text-sm text-gray-600">✉️ kanchira.india@gmail.com</p>
      </div>
    </div>
  )
}

export function ContactUsPage() {
  const [form, setForm] = useState({ name:'', email:'', phone:'', message:'' })
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await submitContactForm(form)
      alert('Message sent! We will get back to you soon.')
      setForm({ name:'', email:'', phone:'', message:'' })
    } catch { alert('Failed to send. Please email us directly at kanchira.india@gmail.com') }
    setSending(false)
  }

  return (
    <div className="policy-page">
      <h1>Contact Us</h1>
      <div className="grid md:grid-cols-2 gap-8 mt-6">
        <div>
          <h3 style={{color:'#800000',fontWeight:600,marginBottom:12}}>Get in Touch</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>📞 +91 9963353171</p>
            <p>✉️ kanchira.india@gmail.com</p>
            <p>📍 No. 27, Venkateswara Nagar Main Road, Near Anna Silks, T. Nagar, Chennai – 600017, Tamil Nadu, India</p>
            <p>🕐 Mon–Sat: 9:00 AM – 7:00 PM</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input className="form-input" placeholder="Your Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
          <input className="form-input" type="email" placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
          <input className="form-input" placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} />
          <textarea className="form-input resize-none" style={{height:112}} placeholder="Your message..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})} required />
          <button className="btn-maroon" type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send Message'}</button>
        </form>
      </div>
    </div>
  )
}
