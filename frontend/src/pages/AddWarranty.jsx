import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createWarranty, listProducts } from '../services/api';
import FileUpload from '../components/FileUpload';
import toast from 'react-hot-toast';

export default function AddWarranty() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_id: searchParams.get('product_id') || '',
    provider: '',
    start_date: '',
    end_date: '',
    warranty_type: 'manufacturer',
    coverage_details: '',
    document_key: '',
    notes: '',
  });

  useEffect(() => {
    listProducts().then(({ data }) => setProducts(data)).catch(() => {});
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await createWarranty(form);
      toast.success('Warranty added');
      navigate('/warranties');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add warranty');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add Warranty</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product *</label>
          <select name="product_id" value={form.product_id} onChange={handleChange} required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2">
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Provider *</label>
            <input name="provider" value={form.provider} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Warranty Type</label>
            <select name="warranty_type" value={form.warranty_type} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2">
              <option value="manufacturer">Manufacturer</option>
              <option value="extended">Extended</option>
              <option value="retailer">Retailer</option>
              <option value="third_party">Third Party</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date *</label>
            <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date *</label>
            <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Coverage Details</label>
          <textarea name="coverage_details" value={form.coverage_details} onChange={handleChange} rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Document</label>
          <FileUpload
            warrantyId={form.product_id || 'temp'}
            onUploadComplete={(key) => setForm({ ...form, document_key: key })}
          />
          {form.document_key && (
            <p className="mt-2 text-sm text-green-600">Document uploaded successfully</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2" />
        </div>

        <div className="flex justify-end space-x-3">
          <button type="button" onClick={() => navigate('/warranties')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition">
            Cancel
          </button>
          <button type="submit" disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition">
            {loading ? 'Adding...' : 'Add Warranty'}
          </button>
        </div>
      </form>
    </div>
  );
}
