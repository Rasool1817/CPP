import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listServiceHistory, createServiceRecord, deleteServiceRecord, listProducts } from '../services/api';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ServiceHistory() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('product_id');
  const [records, setRecords] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    product_id: productId || '',
    service_date: '',
    service_type: 'Repair',
    description: '',
    provider: '',
    cost: '',
    notes: '',
  });

  useEffect(() => {
    Promise.all([
      listServiceHistory(productId),
      listProducts(),
    ]).then(([shRes, pRes]) => {
      setRecords(shRes.data);
      setProducts(pRes.data);
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, [productId]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const { data } = await createServiceRecord(form);
      setRecords([data, ...records]);
      setShowForm(false);
      setForm({ product_id: productId || '', service_date: '', service_type: 'Repair', description: '', provider: '', cost: '', notes: '' });
      toast.success('Service record added');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add record');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this service record?')) return;
    try {
      await deleteServiceRecord(id);
      setRecords(records.filter((r) => r.id !== id));
      toast.success('Record deleted');
    } catch {
      toast.error('Failed to delete');
    }
  }

  function getProductName(pid) {
    const p = products.find((pr) => pr.id === pid);
    return p ? p.name : pid;
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Service History</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Record
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product *</label>
              <select name="product_id" value={form.product_id} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2">
                <option value="">Select a product</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Service Date *</label>
              <input type="date" name="service_date" value={form.service_date} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Service Type *</label>
              <select name="service_type" value={form.service_type} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2">
                <option value="Repair">Repair</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Inspection">Inspection</option>
                <option value="Replacement">Replacement</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Service Provider</label>
              <input name="provider" value={form.provider} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cost</label>
              <input type="number" step="0.01" name="cost" value={form.cost} onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} required rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2" />
          </div>
          <div className="flex justify-end space-x-3">
            <button type="button" onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Add Record</button>
          </div>
        </form>
      )}

      {records.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">No service records yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{r.service_date}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{getProductName(r.product_id)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">{r.service_type}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{r.cost ? `$${r.cost}` : '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-600">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
