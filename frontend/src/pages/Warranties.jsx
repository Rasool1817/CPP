import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listWarranties, deleteWarranty } from '../services/api';
import WarrantyCard from '../components/WarrantyCard';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Warranties() {
  const [warranties, setWarranties] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWarranties();
  }, []);

  async function loadWarranties() {
    try {
      const { data } = await listWarranties();
      setWarranties(data);
    } catch {
      toast.error('Failed to load warranties');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this warranty?')) return;
    try {
      await deleteWarranty(id);
      setWarranties(warranties.filter((w) => w.id !== id));
      toast.success('Warranty deleted');
    } catch {
      toast.error('Failed to delete warranty');
    }
  }

  const filtered = filter === 'all' ? warranties : warranties.filter((w) => w.status === filter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Warranties</h1>
        <Link
          to="/warranties/add"
          className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Warranty
        </Link>
      </div>

      <div className="flex space-x-2 mb-6">
        {['all', 'active', 'expiring', 'expired'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">No warranties found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((warranty) => (
            <WarrantyCard key={warranty.id} warranty={warranty} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
