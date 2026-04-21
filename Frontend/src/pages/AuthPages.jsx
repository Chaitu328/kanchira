import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { sentOtp, sentVerifyOtp, setPassword } from '../services/api'
import toast from 'react-hot-toast'

export function ForgetPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (e) => {
    e.preventDefault()
    if (!email) { toast.error('Enter your email'); return }
    setLoading(true)
    try {
      await sentOtp({ email })
      localStorage.setItem('forgot_email', email)
      toast.success('OTP sent to your email!')
      navigate('/password-verify-password')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send OTP')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-2">Forgot Password</h2>
        <p className="text-sm text-gray-500 text-center mb-6">Enter your registered email to receive OTP</p>
        <form onSubmit={handleSend} className="flex flex-col gap-4">
          <input
            className="form-input"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <button className="btn-maroon" type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
          <button type="button" className="text-sm text-center text-[#800000] hover:underline"
            onClick={() => navigate(-1)}>
            Back to Login
          </button>
        </form>
      </div>
    </div>
  )
}

export function PasswordVerifyPage() {
  const navigate = useNavigate()
  const [otp, setOtp] = useState('')
  const [password, setPasswordVal] = useState('')
  const [confirm, setConfirm] = useState('')
  const [step, setStep] = useState(1) // 1=verify OTP, 2=set password
  const [loading, setLoading] = useState(false)
  const email = localStorage.getItem('forgot_email') || ''

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    if (!otp) { toast.error('Enter OTP'); return }
    setLoading(true)
    try {
      await sentVerifyOtp({ email, otp })
      toast.success('OTP verified!')
      setStep(2)
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Invalid OTP')
    }
    setLoading(false)
  }

  const handleSetPassword = async (e) => {
    e.preventDefault()
    if (!password || password !== confirm) { toast.error('Passwords do not match'); return }
    setLoading(true)
    try {
      await setPassword({ email, password, confirmPassword: confirm })
      toast.success('Password updated successfully!')
      navigate('/home')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-2">Verify OTP</h2>
            <p className="text-sm text-gray-500 text-center mb-6">OTP sent to {email}</p>
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
              <input className="form-input" placeholder="Enter OTP" value={otp} onChange={e => setOtp(e.target.value)} />
              <button className="btn-maroon" type="submit" disabled={loading}>{loading ? 'Verifying...' : 'Verify OTP'}</button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-2">Set New Password</h2>
            <form onSubmit={handleSetPassword} className="flex flex-col gap-4 mt-4">
              <input className="form-input" type="password" placeholder="New Password" value={password} onChange={e => setPasswordVal(e.target.value)} />
              <input className="form-input" type="password" placeholder="Confirm Password" value={confirm} onChange={e => setConfirm(e.target.value)} />
              <button className="btn-maroon" type="submit" disabled={loading}>{loading ? 'Updating...' : 'Update Password'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export function RegisterPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Please use the Login button in the navbar to register</p>
        <button className="btn-maroon w-40" onClick={() => navigate('/')}>Go Home</button>
      </div>
    </div>
  )
}
