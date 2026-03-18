import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listProducts, listWarranties } from '../services/api';
import {
  CubeIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalWarranties: 0,
    activeWarranties: 0,
    expiringWarranties: 0,
    expiredWarranties: 0,
  });
  const [recentWarranties, setRecentWarranties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [productsRes, warrantiesRes] = await Promise.all([
          listProducts(),
          listWarranties(),
        ]);
        const products = productsRes.data;
        const warranties = warrantiesRes.data;

        setStats({
          totalProducts: products.length,
          totalWarranties: warranties.length,
          activeWarranties: warranties.filter((w) => w.status === 'active').length,
          expiringWarranties: warranties.filter((w) => w.status === 'expiring').length,
          expiredWarranties: warranties.filter((w) => w.status === 'expired').length,
        });

        const sorted = [...warranties]
          .filter((w) => w.status === 'expiring')
          .sort((a, b) => (a.days_remaining || 0) - (b.days_remaining || 0));
        setRecentWarranties(sorted.slice(0, 5));
      } catch {
        // Silent fail on dashboard load
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: CubeIcon, color: 'bg-blue-500' },
    { label: 'Active Warranties', value: stats.activeWarranties, icon: ShieldCheckIcon, color: 'bg-green-500' },
    { label: 'Expiring Soon', value: stats.expiringWarranties, icon: ExclamationTriangleIcon, color: 'bg-yellow-500' },
    { label: 'Expired', value: stats.expiredWarranties, icon: ExclamationTriangleIcon, color: 'bg-red-500' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}</p>
        </div>
        <Link
          to="/products/add"
          className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Product
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {recentWarranties.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Warranties Expiring Soon</h2>
          <div className="space-y-3">
            {recentWarranties.map((w) => (
              <div key={w.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-medium text-gray-900">{w.provider}</p>
                  <p className="text-sm text-gray-500">Expires: {w.end_date}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {w.days_remaining} days left
                </span>
              </div>
            ))}
          </div>
          <Link
            to="/warranties"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            View all warranties
          </Link>
        </div>
      )}
    </div>
  );
}
