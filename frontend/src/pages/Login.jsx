import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../services/api';
import { useToast } from '../context/ToastContext'; // Import Toast
import { useTheme } from '../context/ThemeContext'; // Import Theme
import { User, Lock, Mail, ArrowRight, Moon, Sun } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { darkMode, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const { data } = await login({ email: formData.email, password: formData.password });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isGuest', 'false');
        addToast(`Welcome back, ${data.user.name}!`); // Replaced alert
        navigate('/dashboard');
      } else {
        await register(formData);
        addToast("Registration successful! Please login."); // Replaced alert
        setIsLogin(true);
      }
    } catch (err) {
      addToast(err.response?.data?.message || "An error occurred", "error"); // Replaced alert
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem('token');
    addToast("Welcome Guest!"); // Replaced alert
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <button 
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition border border-gray-200 dark:border-gray-700"
        title="Toggle theme"
      >
        {darkMode ? <Sun size={24} className="text-yellow-400" /> : <Moon size={24} className="text-gray-700" />}
      </button>
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">Split It Out</h1>
            <p className="text-gray-500 dark:text-gray-400">Simplify your group expenses</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
                <User className="absolute left-3 top-3.5 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Full Name" 
                    className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
          )}
          <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input 
                  type="email" 
                  placeholder="Email Address" 
                  className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
          </div>
          <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input 
                  type="password" 
                  placeholder="Password" 
                  className="w-full pl-10 p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none dark:text-white focus:ring-2 focus:ring-blue-500 transition"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition transform active:scale-95 flex justify-center items-center gap-2">
            {isLogin ? 'Login' : 'Create Account'} <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 font-medium">
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
            </button>
        </div>
        
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-gray-700"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or continue with</span></div>
        </div>

        <button onClick={handleGuestLogin} className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl transition">
            Try as Guest
        </button>
      </div>
    </div>
  );
}