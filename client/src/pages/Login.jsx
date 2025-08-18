import React, { useState, useEffect, useRef, useMemo } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'

const platformStatements = [
  "Connect instantly. Chat securely.",
  "Groups, DMs, media sharing & more.",
  "Your conversations, reimagined.",
  "Welcome to ChatVerse."
]

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [statementIdx, setStatementIdx] = useState(0)
  const [typedText, setTypedText] = useState('')
  const navigate = useNavigate()
  const leftRef = useRef(null)
  const rightRef = useRef(null)

  // NEW: generate once the falling keyword items
  const rainItems = useMemo(() => {
    const words = [
      'Groups','DMs','Media','Calls','Search','Mentions',
      'Files','Links','Reactions','Pinned','Read receipts','Notifications'
    ]
    const arr = []
    const columns = [6, 14, 22, 30, 38, 46, 54, 62, 70, 78, 86, 94] // left%
    for (let i = 0; i < 18; i++) {
      const word = words[i % words.length]
      const left = columns[i % columns.length]
      const duration = 8 + (i % 5) * 1.1  // 8s..12.4s
      const delay = (i % 10) * 0.6        // staggered starts
      const variant = i % 3               // subtle style variants
      arr.push({ word, left, duration, delay, variant, id: `kw-${i}` })
    }
    return arr
  }, [])

  // GSAP entrance
  useEffect(() => {
    gsap.from(leftRef.current, { x: -80, opacity: 0, duration: 1, ease: 'power3.out' })
    gsap.from(rightRef.current, { x: 80, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.1 })
  }, [])

  // Typewriter effect
  useEffect(() => {
    let t
    if (typedText.length < platformStatements[statementIdx].length) {
      t = setTimeout(() => {
        setTypedText(platformStatements[statementIdx].slice(0, typedText.length + 1))
      }, 55)
    } else {
      t = setTimeout(() => {
        setTypedText('')
        setStatementIdx((prev) => (prev + 1) % platformStatements.length)
      }, 1200)
    }
    return () => clearTimeout(t)
  }, [typedText, statementIdx])

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await axios.post(`${import.meta.env.VITE_SERVER_URL}/users/login`, {
        email, username, password
      }, { withCredentials: true })
      navigate('/home')
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen w-full relative grid grid-cols-1 lg:grid-cols-2 overflow-hidden"
      style={{
        background:
          'radial-gradient(1200px 600px at 75% 40%, rgba(0,0,0,0.03), transparent 60%), linear-gradient(#ffffff, #f7f7f8)'
      }}
    >
      {/* center divider */}
      <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-gray-200 to-transparent pointer-events-none" />

      {/* Left: copy + animated keyword rain */}
      <section
        ref={leftRef}
        className="relative overflow-hidden flex items-center justify-center px-10 py-14"
      >
        {/* Subtle dot pattern background */}
        <div
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            WebkitMaskImage:
              'radial-gradient(650px 420px at 35% 50%, rgba(0,0,0,1), rgba(0,0,0,0))',
            maskImage:
              'radial-gradient(650px 420px at 35% 50%, rgba(0,0,0,1), rgba(0,0,0,0))'
          }}
        />

        {/* NEW: corner art (rings + orbiting dots) */}
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] pointer-events-none -z-10 opacity-70">
          <div className="relative w-full h-full">
            <span className="corner-ring ring-1"></span>
            <span className="corner-ring ring-2"></span>
            <span className="corner-ring ring-3"></span>

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
                ${variant === 2 ? 'bg-gray-100 text-gray-600 border-gray-200' : ''}`
              }
              style={{
                left: `${left}%`,
                animationDuration: `${duration}s`,
                animationDelay: `${delay}s`
              }}
            >
              <span className="mr-2 inline-block w-1.5 h-1.5 rounded-full bg-blue-600" />
              {word}
            </span>
          ))}
        </div>

        {/* Live chat preview panel */}
        <div className="absolute left-12 bottom-12 hidden md:block">
          <div className="w-[320px] rounded-2xl border border-gray-200 bg-white/80 backdrop-blur px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-xs font-medium text-gray-600">Live preview</span>
            </div>
            <ul className="flex flex-col gap-2">
              <li className="bubble bubble-1 bubble-in">Hey! Ready to start a group?</li>
              <li className="bubble bubble-2 bubble-out">Sure, invite the team here.</li>
              <li className="bubble bubble-3 bubble-in">Uploading the brief now…</li>
              <li className="bubble bubble-4 bubble-out">Nice. Let’s sync at 5.</li>
            </ul>
          </div>
        </div>

        <div className="max-w-xl w-full">
          <div className="relative mb-14">
            <div className="absolute -top-6 -left-2 animate-float">
              <div className="px-4 py-2 rounded-full bg-gray-100 text-gray-800 border border-gray-200 text-sm font-semibold flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600" /> ChatVerse
              </div>
            </div>
            <div className="absolute -bottom-6 left-24 animate-float2">
              <div className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-sm font-medium flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600" /> Secure & Fast
              </div>
            </div>
            <div className="absolute -bottom-4 right-8 animate-float3">
              <div className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 border border-gray-200 text-sm font-medium flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-blue-600" /> Group Chats
              </div>
            </div>
          </div>

          <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-4">Welcome!</h1>
          <p className="text-2xl font-semibold text-gray-900 mb-3 h-8">
            {typedText}
            <span className="animate-blink text-blue-600">|</span>
          </p>
          <p className="text-base leading-relaxed text-gray-700 max-w-lg">
            ChatVerse is your all‑in‑one platform for secure, real‑time messaging, media sharing, and vibrant communities.
            Join now and experience the future of conversations.
          </p>
        </div>
      </section>

      {/* Right: blended form */}
      <section ref={rightRef} className="relative flex items-center justify-center px-6 lg:px-16 py-14">
        {/* Enhanced animated gradient background */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 form-gradient-bg"
          style={{
            background: 'radial-gradient(800px 400px at 70% 35%, rgba(59,130,246,0.12), rgba(147,51,234,0.06) 50%, transparent 80%)'
          }}
        />
        
        {/* Glassmorphism form container */}
        <div className="form-glass-container w-full max-w-md">
          {/* Floating animated icon */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 floating-icon">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
            </div>
          </div>
          
          <form onSubmit={handleFormSubmit} className="w-full">
          <header className="mb-8 pt-12">
            <h2 className="text-3xl font-bold text-gray-900 platform-text-animated">Sign In</h2>
            <p className="text-sm text-gray-600 mt-2">Welcome back to ChatVerse</p>
          </header>

          {error && (
            <div className="mb-4 w-full p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Username</label>
              <input
                type="text"
                placeholder="Your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white text-gray-900 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 placeholder-gray-400"
                required
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                <span>Remember me</span>
              </label>
              <a href="#" className="hover:underline text-blue-600">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="vibrant-button w-full py-3 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="relative my-2">
              <div className="w-full border-t border-gray-200" />
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-transparent px-2 text-xs text-gray-500">
                Or continue with
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 hover:bg-gray-100"
              >
                <svg className="h-5 w-5 text-gray-600" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 hover:bg-gray-100"
              >
                <svg className="h-5 w-5 text-gray-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12S0 5.446 0 12.073C0 18.062 4.388 23.027 10.125 23.927v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span className="text-sm font-medium">Facebook</span>
              </button>
            </div>

            <p className="text-sm text-gray-700 text-center">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-blue-600 hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </form>
        </div>
      </section>

      {/* Helpers */}
      <style>
        {`
          .animate-blink { animation: blink 1s steps(2, start) infinite; }
          @keyframes blink { to { opacity: 0; } }

          /* Corner art (top-left) */
          .corner-ring{ position:absolute; top:0; left:0; border-radius:9999px; border:1px solid #e5e7eb; }
          .ring-1{ width:520px; height:520px; animation: ringPulse 12s ease-in-out infinite alternate; }
          .ring-2{ width:380px; height:380px; top:70px; left:70px; border-color:#dbeafe; animation: ringPulse 10s ease-in-out infinite alternate 0.6s; }
          .ring-3{ width:250px; height:250px; top:135px; left:135px; animation: ringPulse 8s ease-in-out infinite alternate 1.2s; }
          @keyframes ringPulse{
            from{ transform: rotate(0deg) scale(.98); opacity:.6; }
            to{   transform: rotate(2deg) scale(1.02); opacity:.7; }
          }
          .corner-orbit{ position:absolute; top:160px; left:160px; width:200px; height:200px; border-radius:9999px; animation: orbit 18s linear infinite; }
          @keyframes orbit{ from{ transform: rotate(0deg);} to{ transform: rotate(360deg);} }
          .orbit-dot{ position:absolute; width:10px; height:10px; border-radius:9999px; top:-5px; left:50%; transform:translateX(-50%); }
          .orbit-dot--small{ width:8px; height:8px; top:auto; bottom:-4px; left:78%; }

          /* Falling keywords */
          .word-fall {
            position: absolute;
            top: -12%;
            animation-name: wordFall, swayX;
            animation-timing-function: linear, ease-in-out;
            animation-iteration-count: infinite, infinite;
            /* duration & delay set inline */
          }
          @keyframes wordFall {
            0%   { transform: translateY(-12%); opacity: 0; }
            10%  { opacity: 1; }
            100% { transform: translateY(120%); opacity: 0.35; }
          }
          @keyframes swayX {
            0%,100% { transform: translateY(var(--ty,0)) translateX(0); }
            50%     { transform: translateY(var(--ty,0)) translateX(6px); }
          }

          /* float chips */
          .animate-float { animation: float 3.5s ease-in-out infinite; }
          @keyframes float { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-10px);} }
          .animate-float2 { animation: float2 4.2s ease-in-out infinite; }
          @keyframes float2 { 0%,100% { transform: translateY(0);} 50% { transform: translateY(8px);} }
          .animate-float3 { animation: float3 5s ease-in-out infinite; }
          @keyframes float3 { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-6px);} }

          /* Chat preview bubbles */
          .bubble {
            max-width: 85%;
            padding: 10px 12px;
            border-radius: 14px;
            font-size: 13px;
            line-height: 1.2;
            opacity: 0;
            transform: translateY(8px);
          }
          .bubble-in {
            align-self: flex-start;
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            color: #111827;
          }
          .bubble-out {
            align-self: flex-end;
            background: #111827;
            color: #fff;
          }
          .bubble-1 { animation: bubble 16s linear infinite; }
          .bubble-2 { animation: bubble 16s linear infinite 4s; }
          .bubble-3 { animation: bubble 16s linear infinite 8s; }
          .bubble-4 { animation: bubble 16s linear infinite 12s; }
          @keyframes bubble {
            0%   { opacity: 0; transform: translateY(8px) scale(.98); }
            6%   { opacity: 1; transform: translateY(0) scale(1); }
            24%  { opacity: 1; transform: translateY(0) scale(1); }
            28%  { opacity: 0; transform: translateY(-6px) scale(.98); }
            100% { opacity: 0; transform: translateY(-6px) scale(.98); }
          }

          /* Reduced motion */
          @media (prefers-reduced-motion: reduce) {
            .word-fall, .animate-float, .animate-float2, .animate-float3, .animate-blink, .corner-orbit, .ring-1, .ring-2, .ring-3, .floating-icon, .form-gradient-bg, .platform-text-animated {
              animation: none !important;
            }
          }

          /* NEW: Enhanced UI Effects */
          
          /* Animated gradient background */
          .form-gradient-bg {
            animation: gradientShift 8s ease-in-out infinite;
          }
          @keyframes gradientShift {
            0%, 100% { 
              background: radial-gradient(800px 400px at 70% 35%, rgba(59,130,246,0.12), rgba(147,51,234,0.06) 50%, transparent 80%);
            }
            50% { 
              background: radial-gradient(900px 450px at 75% 40%, rgba(147,51,234,0.15), rgba(59,130,246,0.08) 50%, transparent 85%);
            }
          }

          /* Glassmorphism form container */
          .form-glass-container {
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.3);
            border-radius: 24px;
            padding: 2rem;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            position: relative;
            transition: all 0.3s ease;
          }
          
          .form-glass-container:hover {
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 0 40px rgba(59, 130, 246, 0.2), 0 8px 32px rgba(0, 0, 0, 0.15);
            border: 1px solid rgba(59, 130, 246, 0.3);
          }

          /* Floating animated icon */
          .floating-icon {
            animation: floatIcon 4s ease-in-out infinite;
          }
          @keyframes floatIcon {
            0%, 100% { transform: translateX(-50%) translateY(0px) rotate(0deg); }
            25% { transform: translateX(-50%) translateY(-8px) rotate(1deg); }
            50% { transform: translateX(-50%) translateY(0px) rotate(0deg); }
            75% { transform: translateX(-50%) translateY(-5px) rotate(-1deg); }
          }

          /* Vibrant button with gradient and glow */
          .vibrant-button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
          }
          
          .vibrant-button:hover:not(:disabled) {
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
            box-shadow: 0 6px 25px rgba(102, 126, 234, 0.5), 0 0 30px rgba(118, 75, 162, 0.3);
            transform: translateY(-2px);
          }

          .vibrant-button:active:not(:disabled) {
            transform: translateY(0px);
          }

          /* Platform text animation */
          .platform-text-animated {
            animation: textGlow 3s ease-in-out infinite;
          }
          @keyframes textGlow {
            0%, 100% { text-shadow: 0 0 5px rgba(59, 130, 246, 0.1); }
            50% { text-shadow: 0 0 15px rgba(59, 130, 246, 0.2), 0 0 25px rgba(147, 51, 234, 0.1); }
          }
        `}
      </style>
    </div>
  )
}

export default Login
