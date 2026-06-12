import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      <nav className="bg-primary text-white p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="text-xl font-bold tracking-wide">
            CarbonTrack
          </Link>
          <div className="space-x-4">
            {user ? (
              <>
                <span className="font-medium mr-4">Hi, {user.display_name}</span>
                <Link to="/dashboard" className="hover:text-secondary-100">Dashboard</Link>
                <Link to="/calculator" className="hover:text-secondary-100">Calculator</Link>
                <Link to="/actions" className="hover:text-secondary-100">Actions</Link>
                <Link to="/goals" className="hover:text-secondary-100">Goals</Link>
                <button onClick={handleLogout} className="ml-4 hover:underline">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-secondary-100">Login</Link>
                <Link to="/register" className="bg-secondary text-primary px-4 py-2 rounded-md font-medium hover:bg-secondary-200">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      
      <main className="container mx-auto p-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
