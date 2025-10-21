import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, User, Lock, ArrowRight, Sparkles, Brain, Heart, Lightbulb, Target } from 'lucide-react';

const PremiumLogin: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin 
        ? { username, password }
        : { username, email, password };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.token, data.user);
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { 
      icon: Brain, 
      label: 'AI-Powered Mood Tracking', 
      desc: 'Get personalized Stoic wisdom based on your daily emotions and mental state',
      highlight: 'Personalized Insights'
    },
    { 
      icon: Heart, 
      label: 'Smart Journal System', 
      desc: 'Capture thoughts with intelligent prompts and emotional analysis',
      highlight: 'Voice-to-Text Ready'
    },
    { 
      icon: Lightbulb, 
      label: 'Creative Ideas Hub', 
      desc: 'Organize thoughts, poetry, and creative projects with smart categorization',
      highlight: 'Multi-Language Support'
    },
    { 
      icon: Target, 
      label: 'Complete Wellness Tracking', 
      desc: '800+ exercises, nutrition database, WHOOP-style metrics & goal setting',
      highlight: 'Real Exercise Database'
    }
  ];

  const stats = [
    { number: '800+', label: 'Exercise Database' },
    { number: '50K+', label: 'Food Items' },
    { number: '100+', label: 'Stoic Quotes' },
    { number: '24/7', label: 'Data Sync' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative w-full max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left side - Enhanced Marketing */}
        <div className="hidden lg:block space-y-8 text-white">
          {/* Hero Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center relative">
                <Sparkles className="w-8 h-8 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full animate-pulse flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Eudaimon
                </h1>
                <p className="text-purple-300 text-lg font-medium">The Ultimate Personal Growth Platform</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white leading-tight">
                Transform Every Day Into A 
                <span className="text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text"> Breakthrough</span>
              </h2>
              <p className="text-white/80 text-xl leading-relaxed">
                Join thousands who've revolutionized their wellness journey with our AI-powered platform combining 
                <span className="text-purple-300 font-semibold"> ancient wisdom </span> 
                and 
                <span className="text-pink-300 font-semibold"> cutting-edge technology</span>.
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur border border-white/20">
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Features */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-white/90 mb-4">🚀 What Makes Us Different</h3>
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="group rounded-2xl bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-xl border border-white/20 p-5 hover:from-purple-500/10 hover:to-pink-500/10 hover:border-purple-400/30 transition-all duration-300 hover-lift">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-bold text-white group-hover:text-purple-200 transition-colors">{feature.label}</h4>
                          <span className="px-2 py-1 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-full font-medium">
                            {feature.highlight}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed group-hover:text-white/80 transition-colors">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Social Proof & CTA */}
          <div className="space-y-4">
            <div className="rounded-2xl bg-gradient-to-r from-emerald-600/20 to-blue-600/20 backdrop-blur-xl border border-emerald-400/30 p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                      {i}
                    </div>
                  ))}
                </div>
                <div className="text-emerald-400 font-semibold">2,847+ Active Users</div>
              </div>
              <blockquote className="text-white/90 italic text-lg leading-relaxed">
                "This app transformed my daily routine. The nutrition tracking with real food database and workout builder are game-changers!"
              </blockquote>
              <footer className="text-emerald-300 text-sm mt-3 font-medium">— Sarah M., Premium User</footer>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-400/30">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-white/80 text-sm">Free 30-day trial • No credit card required</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full max-w-md mx-auto lg:max-w-lg">
          <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 lg:p-10 shadow-2xl hover-lift">
            
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Eudaimon</h1>
              <p className="text-white/60">Your personal growth journey</p>
            </div>

            {/* Form header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Start Your Journey'}
              </h2>
              <p className="text-white/70">
                {isLogin 
                  ? 'Continue your path to wisdom and growth' 
                  : 'Begin your transformation today'
                }
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Username */}
              <div>
                <label className="block text-white font-medium mb-2">Username</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-white/40" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email (for register) */}
              {!isLogin && (
                <div>
                  <label className="block text-white font-medium mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-white/40" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-white font-medium mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-white/40" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-white/5 rounded-r-xl transition-colors"
                  >
                    {showPassword ? 
                      <EyeOff className="w-5 h-5 text-white/40" /> : 
                      <Eye className="w-5 h-5 text-white/40" />
                    }
                  </button>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl">
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-3 hover-lift"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {isLogin ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Switch mode */}
              <div className="text-center pt-4">
                <span className="text-white/70">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                  }}
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </div>
            </form>
          </div>

          {/* Footer message */}
          <div className="text-center mt-8 text-white/60">
            <p className="text-sm">
              Secure authentication • Privacy focused • Local data storage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumLogin;