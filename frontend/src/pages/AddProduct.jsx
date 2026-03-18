import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProduct } from '../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Electronics', 'Appliances', 'Furniture', 'Automotive',
  'Sports & Outdoors', 'Tools', 'Clothing', 'Other',
];

export default function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: 'Electronics',
    model_number: '',
    serial_number: '',
    purchase_date: '',
    purchase_price: '',
    retailer: '',
    notes: '',
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await createProduct(form);
      toast.success('Product added successfully');
      navigate('/products');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to add product';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Product</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name *</label>
            <input
              name="name" value={form.name} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Brand *</label>
            <input
              name="brand" value={form.brand} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Category *</label>
            <select
              name="category" value={form.category} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
            >
              {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Purchase Date *</label>
            <input
              type="date" name="purchase_date" value={form.purchase_date} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Model Number</label>
            <input
              name="model_number" value={form.model_number} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Serial Number</label>
            <input
              name="serial_number" value={form.serial_number} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
            <input
              type="number" step="0.01" name="purchase_price" value={form.purchase_price} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Retailer</label>
            <input
              name="retailer" value={form.retailer} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            name="notes" value={form.notes} onChange={handleChange} rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            type="button" onClick={() => navigate('/products')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit" disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? 'Adding...' : 'Add Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
