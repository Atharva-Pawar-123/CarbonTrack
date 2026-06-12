import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Leaf, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import api from '../services/api';

const RequirementItem = ({ met, text }: { met: boolean; text: string }) => (
  <div className={`flex items-center text-xs ${met ? 'text-green-600' : 'text-neutral-500'}`}>
    {met ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
    {text}
  </div>
);

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const isLengthOk = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLengthOk || !hasUpper || !hasNumber || !hasSpecial) {
      setError('Please ensure your password meets all requirements.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', {
        email,
        password,
        display_name: displayName
      });
      // Registration successful, navigate to login
      navigate('/login');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-neutral-200 p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-secondary/10 p-3 rounded-full mb-3">
            <Leaf className="w-8 h-8 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Create an Account</h1>
          <p className="text-neutral-500 mt-1">Start your carbon reduction journey</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Display Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="text"
                required
                minLength={2}
                maxLength={100}
                className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary bg-neutral-50 text-neutral-900"
                placeholder="Jane Doe"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary bg-neutral-50 text-neutral-900"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-neutral-400" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:ring-secondary focus:border-secondary bg-neutral-50 text-neutral-900"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {/* Password Strength Indicators */}
            <div className="mt-2 grid grid-cols-2 gap-1 bg-neutral-50 p-2 rounded border border-neutral-100">
              <RequirementItem met={isLengthOk} text="At least 8 characters" />
              <RequirementItem met={hasUpper} text="One uppercase letter" />
              <RequirementItem met={hasNumber} text="One digit (0-9)" />
              <RequirementItem met={hasSpecial} text="One special character" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary disabled:opacity-70 transition-colors mt-6"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-secondary hover:text-secondary-600">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
