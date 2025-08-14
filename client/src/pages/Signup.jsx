import React, { useMemo, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { validateAlphabeticString } from '../helper/stringCheck';

function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [coverImg, setCoverImg] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverImgPreview, setCoverImgPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'avatar') {
        setAvatar(file);
        setAvatarPreview(URL.createObjectURL(file));
      } else if (type === 'coverImg') {
        setCoverImg(file);
        setCoverImgPreview(URL.createObjectURL(file));
      }
    }
  };

  const handleFormSubmit = async(e) => {
    e.preventDefault();
    setIsLoading(true);
    const validName = validateAlphabeticString(formData.fullName, { allowSpaces: true });
    if (!validName.isValid) {
      setError(validName.error);
      setIsLoading(false);
      return;
    }
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!avatar) {
      setError('Avatar image is required');
      setIsLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('username', formData.username);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('avatar', avatar);
      if (coverImg) {
        formDataToSend.append('coverImg', coverImg);
      }

      const res = await axios.post(`${import.meta.env.VITE_SERVER_URL}/users/register`, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      console.log(res);
      navigate('/login');
    } catch (error) {
      console.log(error);
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  // Falling keyword chips (match Login)
  const rainItems = useMemo(() => {
    const words = ['Create', 'Profile', 'Avatar', 'Username', 'Groups', 'DMs', 'Media', 'Reactions', 'Files', 'Links', 'Mentions', 'Notifications']
    const arr = []
    const columns = [6, 14, 22, 30, 38, 46, 54, 62, 70, 78, 86, 94]
    for (let i = 0; i < 18; i++) {
      const word = words[i % words.length]
      const left = columns[i % columns.length]
      const duration = 8 + (i % 5) * 1.1
      const delay = (i % 10) * 0.6
      const variant = i % 3
      arr.push({ word, left, duration, delay, variant, id: `kw-${i}` })
    }
    return arr
  }, [])

  return (
    <div
      className="h-screen w-full relative grid grid-cols-1 lg:grid-cols-2 overflow-hidden"
      style={{
        background: 'radial-gradient(1200px 600px at 75% 40%, rgba(0,0,0,0.03), transparent 60%), linear-gradient(#ffffff, #f7f7f8)'
      }}
    >
      {/* Middle divider (match Login) */}
      <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent pointer-events-none" />

      {/* Left: copy + animated keyword rain */}
      <section className="relative h-full overflow-hidden flex items-center justify-center px-10 py-10">
        {/* Subtle dot pattern background */}
        <div
          className="absolute inset-0 -z-20 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            WebkitMaskImage: 'radial-gradient(650px 420px at 35% 50%, rgba(0,0,0,1), rgba(0,0,0,0))',
            maskImage: 'radial-gradient(650px 420px at 35% 50%, rgba(0,0,0,1), rgba(0,0,0,0))'
          }}
        />

        {/* Corner art (rings + orbiting dots) */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] pointer-events-none z-0 opacity-90">
          <div className="relative w-full h-full">
            <span className="corner-ring corner-ring-a"></span>
            <span className="corner-ring corner-ring-b"></span>
            <span className="corner-ring corner-ring-c"></span>
            <span className="corner-orbit">
              <span className="orbit-dot bg-blue-600"></span>
              <span className="orbit-dot orbit-dot--small bg-gray-400"></span>
            </span>
          </div>
        </div>

        {/* Falling keywords layer */}
        <div className="absolute inset-0 pointer-events-none select-none">
          {rainItems.map(({ id, word, left, duration, delay, variant }) => (
            <span
              key={id}
              className={`word-fall inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-medium
                ${variant === 0 ? 'bg-white text-gray-800 border-gray-200' : ''}
                ${variant === 1 ? 'bg-gray-50 text-gray-700 border-gray-200' : ''}
                ${variant === 2 ? 'bg-gray-100 text-gray-600 border-gray-200' : ''}`}
              style={{ left: `${left}%`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
            >
              <span className="mr-2 inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />
              {word}
            </span>
          ))}
        </div>

        {/* Live chat preview panel (match Login) */}
        <div className="absolute left-12 bottom-12 hidden md:block">
          <div className="w-[320px] rounded-2xl border border-gray-200 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-gray-600">Live preview</span>
            </div>
            <ul className="flex flex-col gap-2">
              <li className="bubble bubble-1 bubble-in">Welcome! Set your profile.</li>
              <li className="bubble bubble-2 bubble-out">Pick a unique username.</li>
              <li className="bubble bubble-3 bubble-in">Upload an avatar.</li>
              <li className="bubble bubble-4 bubble-out">You’re good to go!</li>
            </ul>
          </div>
        </div>

        <div className="max-w-xl w-full">
          <div className="relative mb-10">
            <div className="absolute -top-6 -left-2 animate-float">
              <div className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 border border-gray-200 text-sm font-semibold flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600" /> ChatVerse
              </div>
            </div>
            <div className="absolute -bottom-6 left-24 animate-float2">
              <div className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-sm font-medium flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600" /> Create Profile
              </div>
            </div>
            <div className="absolute -bottom-4 right-8 animate-float3">
              <div className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-sm font-medium flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600" /> Start Messaging
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-3">Create your account</h1>
          <p className="text-base leading-relaxed text-gray-700 max-w-lg">
            Set your avatar, choose a username, and join secure, real‑time conversations.
          </p>
        </div>
      </section>

      {/* Right: Signup form */}
      <section className="relative h-full overflow-hidden flex items-center justify-center px-6 lg:px-16 py-10">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ background: 'radial-gradient(500px 300px at 70% 35%, rgba(59,130,246,0.06), transparent 70%)' }}
        />
        <div className="w-full max-w-md">
          <header className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Sign up</h2>
            <p className="text-sm text-gray-600">It takes less than a minute.</p>
          </header>

          {error && (
            <div className="mb-4 w-full p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Avatar</label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden border">
                  {avatarPreview ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" /> : null}
                </div>
                <label className="px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-sm font-medium text-gray-800 cursor-pointer hover:bg-gray-200">
                  Upload
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" required />
                </label>
              </div>
            </div>

            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Full name</label>
              <input
                type="text"
                name="fullName"
                placeholder="Your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Username</label>
              <input
                type="text"
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@email.com"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400"
                required
              />
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400"
                  required
                />
              </div>
            </div>

            {/* Cover image (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Cover image (optional)</label>
              <div className="flex items-center gap-3">
                <label className="px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-sm font-medium text-gray-800 cursor-pointer hover:bg-gray-200">
                  Upload
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'coverImg')} className="hidden" />
                </label>
                {coverImgPreview && (
                  <button
                    type="button"
                    onClick={() => { setCoverImg(null); setCoverImgPreview(null); }}
                    className="px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-sm hover:bg-gray-200"
                  >
                    Remove
                  </button>
                )}
              </div>
              {coverImgPreview && (
                <div className="mt-3 h-20 rounded-lg overflow-hidden border">
                  <img src={coverImgPreview} alt="cover" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 text-blue-600 border-gray-300 rounded" required />
              <span className="text-sm text-gray-600">I agree to the Terms and Privacy Policy</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-black text-white font-semibold hover:bg-neutral-800 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>

            <p className="text-sm text-gray-700 text-center">
              Already have an account?{' '}
              <button type="button" onClick={() => navigate('/login')} className="font-semibold text-blue-600 hover:underline">
                Sign in here
              </button>
            </p>
          </form>
        </div>
      </section>

      {/* Helpers (match Login animations) */}
      <style>
        {`
          /* Corner art (top-left) */
          .corner-ring{ position:absolute; top:0; left:0; border-radius:9999px; border:1px solid #e5e7eb; }
          .corner-ring-a{ width:520px; height:520px; animation: ringPulse 12s ease-in-out infinite alternate; }
          .corner-ring-b{ width:380px; height:380px; top:70px; left:70px; border-color:#dbeafe; animation: ringPulse 10s ease-in-out infinite alternate 0.6s; }
          .corner-ring-c{ width:250px; height:250px; top:135px; left:135px; border-color:#e5e7eb; animation: ringPulse 8s ease-in-out infinite alternate 1.2s; }
          @keyframes ringPulse{ from{ transform: rotate(0deg) scale(.98); opacity:.7; } to{ transform: rotate(2deg) scale(1.02); opacity:1; } }
          .corner-orbit{ position:absolute; top:160px; left:160px; width:200px; height:200px; border-radius:9999px; animation: orbit 18s linear infinite; }
          @keyframes orbit{ from{ transform: rotate(0deg);} to{ transform: rotate(360deg);} }
          .orbit-dot{ position:absolute; width:10px; height:10px; border-radius:9999px; top:-5px; left:50%; transform:translateX(-50%); }
          .orbit-dot--small{ width:8px; height:8px; top:auto; bottom:-4px; left:78%; }

          /* Falling keywords */
          .word-fall { position: absolute; top: -12%; animation-name: wordFall, swayX; animation-timing-function: linear, ease-in-out; animation-iteration-count: infinite, infinite; }
          @keyframes wordFall { 0%{ transform: translateY(-12%); opacity:0;} 10%{opacity:1;} 100%{ transform: translateY(120%); opacity:.35;} }
          @keyframes swayX { 0%,100%{ transform: translateY(var(--ty,0)) translateX(0);} 50%{ transform: translateY(var(--ty,0)) translateX(6px);} }

          /* float chips */
          .animate-float { animation: float 3.5s ease-in-out infinite; }
          @keyframes float { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-10px);} }
          .animate-float2 { animation: float2 4.2s ease-in-out infinite; }
          @keyframes float2 { 0%,100% { transform: translateY(0);} 50% { transform: translateY(8px);} }
          .animate-float3 { animation: float3 5s ease-in-out infinite; }
          @keyframes float3 { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-6px);} }

          /* Chat preview bubbles */
          .bubble { max-width:85%; padding:10px 12px; border-radius:14px; font-size:13px; line-height:1.2; opacity:0; transform: translateY(8px); }
          .bubble-in { align-self:flex-start; background:#f3f4f6; border:1px solid #e5e7eb; color:#111827; }
          .bubble-out { align-self:flex-end; background:#111827; color:#fff; }
          .bubble-1 { animation: bubble 16s linear infinite; }
          .bubble-2 { animation: bubble 16s linear infinite 4s; }
          .bubble-3 { animation: bubble 16s linear infinite 8s; }
          .bubble-4 { animation: bubble 16s linear infinite 12s; }
          @keyframes bubble { 0%{opacity:0; transform: translateY(8px) scale(.98);} 6%{opacity:1; transform: translateY(0) scale(1);} 24%{opacity:1;} 28%{opacity:0; transform: translateY(-6px) scale(.98);} 100%{opacity:0;} }

          /* Reduced motion */
          @media (prefers-reduced-motion: reduce) {
            .word-fall, .animate-float, .animate-float2, .animate-float3, .corner-orbit, .corner-ring-a, .corner-ring-b, .corner-ring-c {
              animation: none !important;
            }
          }
        `}
      </style>
    </div>
  )
}

export default Signup
