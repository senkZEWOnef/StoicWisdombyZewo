import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Mail, User, Lock, ArrowRight, Sparkles } from 'lucide-react';

const ModernLogin: React.FC = () => {
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

      const response = await fetch(`http://localhost:5001${endpoint}`, {
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

  return (
    <div className="min-vh-100 d-flex position-relative overflow-hidden" 
         style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      
      {/* Animated background elements */}
      <div className="position-absolute w-100 h-100">
        <div className="position-absolute rounded-circle opacity-25" 
             style={{ 
               width: '200px', 
               height: '200px', 
               background: 'rgba(255,255,255,0.1)', 
               top: '10%', 
               right: '10%',
               animation: 'float 6s ease-in-out infinite'
             }}></div>
        <div className="position-absolute rounded-circle opacity-25" 
             style={{ 
               width: '150px', 
               height: '150px', 
               background: 'rgba(255,255,255,0.05)', 
               bottom: '15%', 
               left: '5%',
               animation: 'float 8s ease-in-out infinite reverse'
             }}></div>
      </div>

      {/* Main content */}
      <div className="container-fluid d-flex align-items-center justify-content-center position-relative">
        <div className="row w-100 justify-content-center">
          
          {/* Left side - Branding */}
          <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center text-white">
            <div className="text-center px-5">
              <div className="mb-4">
                <Sparkles size={80} className="mb-3 opacity-90" />
              </div>
              <h1 className="display-4 fw-bold mb-4">Personal Growth Journal</h1>
              <p className="lead fs-5 opacity-90 mb-4">
                Track your thoughts, capture ideas, write poetry in 5 languages, 
                and embrace stoic wisdom on your journey of self-improvement.
              </p>
              <div className="d-flex justify-content-center gap-4 text-white-50">
                <span>🧘 Mindfulness</span>
                <span>📝 Journaling</span>
                <span>🎯 Goals</span>
                <span>🌱 Growth</span>
              </div>
            </div>
          </div>

          {/* Right side - Login form */}
          <div className="col-lg-6 col-md-8 col-sm-10 d-flex align-items-center justify-content-center">
            <div className="card border-0 shadow-lg" 
                 style={{ 
                   borderRadius: '20px', 
                   backgroundColor: 'rgba(255,255,255,0.95)',
                   backdropFilter: 'blur(20px)',
                   maxWidth: '450px',
                   width: '100%'
                 }}>
              
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <div className="d-flex justify-content-center mb-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center"
                         style={{ width: '60px', height: '60px', background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
                      <Sparkles size={24} className="text-white" />
                    </div>
                  </div>
                  <h3 className="fw-bold text-dark mb-2">
                    {isLogin ? 'Welcome Back' : 'Start Your Journey'}
                  </h3>
                  <p className="text-muted">
                    {isLogin ? 'Continue your personal development journey' : 'Create your personal growth account'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                  {/* Username */}
                  <div className="mb-3">
                    <label className="form-label text-dark fw-medium">Username</label>
                    <div className="input-group">
                      <span className="input-group-text border-0 bg-light">
                        <User size={18} className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-0 bg-light"
                        placeholder="Enter your username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ borderRadius: '0 10px 10px 0' }}
                        required
                      />
                    </div>
                  </div>

                  {/* Email (for register) */}
                  {!isLogin && (
                    <div className="mb-3">
                      <label className="form-label text-dark fw-medium">Email</label>
                      <div className="input-group">
                        <span className="input-group-text border-0 bg-light">
                          <Mail size={18} className="text-muted" />
                        </span>
                        <input
                          type="email"
                          className="form-control border-0 bg-light"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          style={{ borderRadius: '0 10px 10px 0' }}
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div className="mb-4">
                    <label className="form-label text-dark fw-medium">Password</label>
                    <div className="input-group">
                      <span className="input-group-text border-0 bg-light">
                        <Lock size={18} className="text-muted" />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control border-0 bg-light"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ borderRadius: '0' }}
                        required
                      />
                      <button
                        type="button"
                        className="btn bg-light border-0"
                        style={{ borderRadius: '0 10px 10px 0' }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? 
                          <EyeOff size={18} className="text-muted" /> : 
                          <Eye size={18} className="text-muted" />
                        }
                      </button>
                    </div>
                  </div>

                  {/* Error message */}
                  {error && (
                    <div className="alert alert-danger border-0" style={{ borderRadius: '12px' }}>
                      <small>{error}</small>
                    </div>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="btn w-100 text-white fw-medium py-3 mb-4"
                    style={{ 
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      borderRadius: '12px',
                      border: 'none',
                      fontSize: '16px'
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" />
                        {isLogin ? 'Signing In...' : 'Creating Account...'}
                      </>
                    ) : (
                      <>
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight size={18} className="ms-2" />
                      </>
                    )}
                  </button>

                  {/* Switch mode */}
                  <div className="text-center">
                    <span className="text-muted">
                      {isLogin ? "Don't have an account? " : "Already have an account? "}
                    </span>
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none fw-medium"
                      style={{ color: '#667eea' }}
                      onClick={() => setIsLogin(!isLogin)}
                    >
                      {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          
          .input-group-text {
            border-radius: 10px 0 0 10px !important;
          }
          
          .form-control:focus {
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
            border-color: transparent !important;
          }
          
          .btn:hover {
            transform: translateY(-1px);
            transition: all 0.2s ease;
          }
        `
      }} />
    </div>
  );
};

export default ModernLogin;