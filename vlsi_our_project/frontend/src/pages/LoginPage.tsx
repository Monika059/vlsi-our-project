import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { useAuth } from '../contexts/AuthContext'
import { Cpu, Sparkles, Shield, Zap, BookOpen, Code2 } from 'lucide-react'

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) || 'http://localhost:5000'

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      login(credentialResponse.credential)
      navigate('/dashboard')
    }
  }

  const handleGoogleError = () => {
    console.error('Google Login Failed')
  }

  const handleGitHubLogin = () => {
    const normalizedBackend = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl
    window.location.href = `${normalizedBackend}/api/auth/github`
  }

  const handleFacebookLogin = () => {
    const normalizedBackend = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl
    window.location.href = `${normalizedBackend}/api/auth/facebook`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding and Features */}
        <div className="text-white space-y-8 px-4">
          {/* Logo and Title */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Cpu size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                  AI-powered VLSI Design Assistant
                </h1>
                <p className="text-gray-400 text-sm mt-1">Your Personal Mentor for Verilog & Digital Design</p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-6">Empower Your VLSI Learning Journey</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-4 bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
                <div className="bg-primary-500/20 p-2 rounded-lg">
                  <Sparkles className="text-primary-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">AI-Powered Analysis</h3>
                  <p className="text-gray-400 text-sm">Real-time error detection and intelligent code suggestions</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Zap className="text-purple-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Smart Debugging</h3>
                  <p className="text-gray-400 text-sm">Step-by-step fixes with educational explanations</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Code2 className="text-green-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Waveform Visualization</h3>
                  <p className="text-gray-400 text-sm">Interactive simulation and signal analysis</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700">
                <div className="bg-amber-500/20 p-2 rounded-lg">
                  <BookOpen className="text-amber-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Educational Guidance</h3>
                  <p className="text-gray-400 text-sm">Context-aware learning resources and best practices</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-700">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-400">100+</div>
              <div className="text-sm text-gray-400">Templates</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">AI</div>
              <div className="text-sm text-gray-400">Powered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">24/7</div>
              <div className="text-sm text-gray-400">Available</div>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700 p-8">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full mb-4">
                  <Shield className="text-white" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400">Sign in to continue your VLSI learning journey</p>
              </div>

              {/* Social Login Options */}
              <div className="space-y-6">
                {/* Google Login */}
                <div className="flex flex-col items-center gap-4">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="filled_black"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    width="100%"
                  />
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-slate-800 text-gray-400">Or continue with</span>
                  </div>
                </div>

                {/* Other Social Login Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  {/* GitHub Login */}
                  <button
                    onClick={handleGitHubLogin}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors group"
                    title="Sign in with GitHub"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {/* Facebook Login */}
                  <button
                    onClick={handleFacebookLogin}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-[#1877F2] hover:bg-[#166FE5] border border-[#1877F2] rounded-lg transition-colors group"
                    title="Sign in with Facebook"
                  >
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>

                  {/* Microsoft Login */}
                  <button
                    onClick={() => alert('Microsoft login coming soon!')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg transition-colors group"
                    title="Sign in with Microsoft"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M0 0h11v11H0z"/>
                      <path fill="#81bc06" d="M12 0h11v11H12z"/>
                      <path fill="#05a6f0" d="M0 12h11v11H0z"/>
                      <path fill="#ffba08" d="M12 12h11v11H12z"/>
                    </svg>
                  </button>
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-slate-800 text-gray-400">Secure Authentication</span>
                  </div>
                </div>

                {/* Info */}
                <div className="bg-primary-900/20 border border-primary-700/50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="text-primary-400 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-gray-300">
                      <p className="font-semibold text-primary-400 mb-1">Secure Google Authentication</p>
                      <p className="text-gray-400">
                        Your data is protected with industry-standard OAuth 2.0 security. We never store your password.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="space-y-2 pt-4">
                  <p className="text-sm font-semibold text-gray-300">What you'll get:</p>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                      Real-time Verilog code analysis
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                      AI-powered debugging assistance
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                      Interactive waveform visualization
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                      Educational resources & templates
                    </li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-slate-700 text-center">
                <p className="text-xs text-gray-500">
                  By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Built for ECE students by{' '}
                <span className="text-primary-400 font-semibold">Hack Nova</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
