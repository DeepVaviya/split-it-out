import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, checkHealth } from '../services/api';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('token') || localStorage.getItem('isGuest')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleGuestLogin = () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Guest User', id: 'guest', isGuest: true }));
    localStorage.setItem('isGuest', 'true');
    navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const res = await login({ email: formData.email, password: formData.password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      } else {
        await register(formData);
        setIsLogin(true);
        setError('Account created! Please log in.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-center text-blue-600 dark:text-blue-400">split-it-out</h1>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input type="text" placeholder="Name" className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          )}
          <input type="email" placeholder="Email" className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input type="password" placeholder="Password" className="w-full p-3 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
            value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700">
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-2">
            <button onClick={handleGuestLogin} className="w-full bg-gray-200 dark:bg-gray-700 dark:text-white py-3 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                Continue as Guest
            </button>
            <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 dark:text-blue-400 text-sm hover:underline text-center">
                {isLogin ? 'Need an account? Sign Up' : 'Have an account? Log In'}
            </button>
        </div>
      </div>
    </div>
  );
}