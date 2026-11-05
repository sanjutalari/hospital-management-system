import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'DOCTOR') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* Left Panel */}
      <div className="bg-[#0f2544] flex flex-col justify-center px-16 text-white">
        <h1 className="font-serif text-5xl leading-tight mb-4">
          Modern<br /><em className="text-blue-400 not-italic">Healthcare</em><br />Management
        </h1>
        <p className="text-slate-400 text-base leading-relaxed max-w-xs">
          A unified platform connecting patients and doctors for seamless, compassionate care.
        </p>
        <div className="mt-12 flex flex-col gap-4">
          {['Real-time doctor–patient chat', 'Appointment scheduling & tracking', 'Digital prescriptions & medical records', 'Secure PDF report storage'].map(f => (
            <div key={f} className="flex items-center gap-3 text-slate-300 text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex items-center justify-center bg-slate-50 p-10">
        <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-md">
          <h2 className="text-2xl font-semibold mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to your HMS account</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Email</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="mb-5">
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading || !email.trim() || !password}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>

          <p className="text-center mt-5 text-sm text-slate-500">
            New patient?{' '}
            <span
              onClick={() => navigate('/register')}
              className="text-blue-600 font-medium cursor-pointer hover:underline"
            >
              Create account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
