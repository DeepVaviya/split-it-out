import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, checkHealth } from '../services/api';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('checking');
  const navigate = useNavigate();

  // Check if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  // Check server health on mount
  useEffect(() => {
    const checkServer = async () => {
      const isHealthy = await checkHealth();
      setServerStatus(isHealthy ? 'online' : 'offline');
    };
    checkServer();
  }, []);

  // Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Client-side validation
    if (isLogin) {
      if (!formData.email.trim() || !formData.password) {
        setError('Email and password are required');
        return;
      }
    } else {
      if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
        setError('All fields are required');
        return;
      }
      if (formData.name.trim().length < 2) {
        setError('Name must be at least 2 characters');
        return;
      }
    }
    
    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Check server status
    if (serverStatus === 'offline') {
      setError('Server is offline. Please make sure the backend is running.');
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        const res = await login({ 
          email: formData.email.trim().toLowerCase(), 
          password: formData.password 
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 500);
      } else {
        await register({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password
        });
        setSuccess('Account created successfully! Please log in now.');
        setFormData({ name: '', email: '', password: '' });
        setTimeout(() => setIsLogin(true), 1500);
      }
    } catch (err) {
      console.error('Auth error:', err);
      
      // Handle different error scenarios
      if (!err.response) {
        setError('Unable to connect to server. Please check if the backend is running on port 5000.');
      } else {
        setError(err.response?.data?.message || err.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({ name: '', email: '', password: '' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-600">FairSplit</h1>
        <p className="text-center text-gray-500 mb-2">Split expenses without the headache.</p>
        
        {/* Server Status Indicator */}
        <div className="text-center mb-6">
          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
            serverStatus === 'online' ? 'bg-green-100 text-green-700' :
            serverStatus === 'offline' ? 'bg-red-100 text-red-700' :
            'bg-yellow-100 text-yellow-700'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              serverStatus === 'online' ? 'bg-green-500' :
              serverStatus === 'offline' ? 'bg-red-500' :
              'bg-yellow-500 animate-pulse'
            }`}></span>
            {serverStatus === 'online' ? 'Server Online' :
             serverStatus === 'offline' ? 'Server Offline' :
             'Checking...'}
          </span>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                placeholder="Your Name"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                disabled={loading}
              />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input 
              type="email" 
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              placeholder="hello@example.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input 
              type="password" 
              className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({...formData, password: e.target.value})}
              disabled={loading}
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
            )}
          </div>

          <button 
            type="submit"
            disabled={loading || serverStatus === 'offline'}
            className={`w-full py-3 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
              loading || serverStatus === 'offline'
                ? 'bg-gray-400 cursor-not-allowed text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? (
              <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
            ) : (
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            onClick={switchMode} 
            disabled={loading}
            className="text-blue-600 font-semibold hover:underline disabled:opacity-50"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>

        {serverStatus === 'offline' && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg text-sm text-yellow-800">
            <p className="font-medium">Server is offline</p>
            <p className="mt-1">Start the backend server with:</p>
            <code className="block mt-1 bg-yellow-100 p-2 rounded text-xs">
              cd backend && npm run dev
            </code>
          </div>
        )}
      </div>
    </div>
  );
}