import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', age: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      setError('Name, email and password are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/patient');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="bg-white rounded-2xl p-10 w-full max-w-md shadow-md">
        <h2 className="text-2xl font-semibold mb-1">Create account</h2>
        <p className="text-slate-500 text-sm mb-7">Register as a new patient</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
        )}

        {[
          { key: 'name', label: 'Full Name', type: 'text', placeholder: 'Sarah Johnson' },
          { key: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
          { key: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
          { key: 'phone', label: 'Phone (optional)', type: 'text', placeholder: '+91 98765 43210' },
          { key: 'age', label: 'Age (optional)', type: 'number', placeholder: '25' },
        ].map(({ key, label, type, placeholder }) => (
          <div key={key} className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1.5">{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              value={form[key]}
              onChange={e => update(key, e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border-[1.5px] border-slate-200 text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        ))}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 mt-2"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-center mt-5 text-sm text-slate-500">
          Already have an account?{' '}
          <span onClick={() => navigate('/login')} className="text-blue-600 font-medium cursor-pointer hover:underline">
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};
