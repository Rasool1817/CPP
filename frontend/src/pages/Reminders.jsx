import { useState, useEffect } from 'react';
import { listWarranties, listProducts } from '../services/api';
import { BellAlertIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Reminders() {
  const [warranties, setWarranties] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listWarranties(), listProducts()])
      .then(([wRes, pRes]) => {
        setWarranties(wRes.data);
        setProducts(pRes.data);
      })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  function getProductName(pid) {
    const p = products.find((pr) => pr.id === pid);
    return p ? p.name : 'Unknown Product';
  }

  const expiring = warranties
    .filter((w) => w.status === 'expiring')
    .sort((a, b) => (a.days_remaining || 0) - (b.days_remaining || 0));

  const expired = warranties
    .filter((w) => w.status === 'expired')
    .sort((a, b) => (a.days_remaining || 0) - (b.days_remaining || 0));

  const active = warranties
    .filter((w) => w.status === 'active')
    .sort((a, b) => (a.days_remaining || 0) - (b.days_remaining || 0));

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Warranty Reminders</h1>
      <p className="text-gray-600 mb-8">
        Warranties expiring within 30 days are flagged automatically via CloudWatch scheduled events.
      </p>

      {expiring.length > 0 && (
        <div className="mb-8">
          <h2 className="flex items-center text-lg font-semibold text-yellow-700 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
            Expiring Soon ({expiring.length})
          </h2>
          <div className="space-y-3">
            {expiring.map((w) => (
              <div key={w.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{getProductName(w.product_id)}</p>
                  <p className="text-sm text-gray-600">Provider: {w.provider} | Expires: {w.end_date}</p>
                </div>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  {w.days_remaining} days left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {expired.length > 0 && (
        <div className="mb-8">
          <h2 className="flex items-center text-lg font-semibold text-red-700 mb-4">
            <BellAlertIcon className="h-6 w-6 mr-2" />
            Expired ({expired.length})
          </h2>
          <div className="space-y-3">
            {expired.map((w) => (
              <div key={w.id} className="bg-red-50 border border-red-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{getProductName(w.product_id)}</p>
                  <p className="text-sm text-gray-600">Provider: {w.provider} | Expired: {w.end_date}</p>
                </div>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  Expired {Math.abs(w.days_remaining)} days ago
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {active.length > 0 && (
        <div>
          <h2 className="flex items-center text-lg font-semibold text-green-700 mb-4">
            <CheckCircleIcon className="h-6 w-6 mr-2" />
            Active ({active.length})
          </h2>
          <div className="space-y-3">
            {active.map((w) => (
              <div key={w.id} className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{getProductName(w.product_id)}</p>
                  <p className="text-sm text-gray-600">Provider: {w.provider} | Expires: {w.end_date}</p>
                </div>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {w.days_remaining} days left
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {warranties.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">No warranties to display</p>
        </div>
      )}
    </div>
  );
}
