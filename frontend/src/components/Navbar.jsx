import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheckIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const navLinks = [
    { to: '/', label: 'Dashboard' },
    { to: '/products', label: 'Products' },
    { to: '/warranties', label: 'Warranties' },
    { to: '/service-history', label: 'Service History' },
    { to: '/reminders', label: 'Reminders' },
  ];

  return (
    <nav className="bg-indigo-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-8 w-8 text-white" />
              <span className="text-white font-bold text-xl">WarrantyTracker</span>
            </Link>
          </div>

          {user && (
            <div className="hidden md:flex items-center space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  {link.label}
                </Link>
              ))}
              <span className="text-indigo-200 text-sm">{user.name}</span>
              <button
                onClick={handleLogout}
                className="bg-indigo-700 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-800 transition"
              >
                Logout
              </button>
            </div>
          )}

          {user && (
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white">
                {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
              </button>
            </div>
          )}
        </div>
      </div>

      {user && mobileOpen && (
        <div className="md:hidden bg-indigo-700 px-4 pb-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className="block text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm"
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="block w-full text-left text-indigo-100 hover:text-white px-3 py-2 rounded-md text-sm"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
