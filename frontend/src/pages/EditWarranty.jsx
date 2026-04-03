import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getWarranty, updateWarranty, listProducts, getDownloadUrl } from '../services/api';
import FileUpload from '../components/FileUpload';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function EditWarranty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product_id: '',
    provider: '',
    start_date: '',
    end_date: '',
    warranty_type: 'manufacturer',
    coverage_details: '',
    document_key: '',
    notes: '',
  });

  useEffect(() => {
    Promise.all([getWarranty(id), listProducts()])
      .then(([wRes, pRes]) => {
        const w = wRes.data;
        setForm({
          product_id: w.product_id || '',
          provider: w.provider || '',
          start_date: w.start_date || '',
          end_date: w.end_date || '',
          warranty_type: w.warranty_type || 'manufacturer',
          coverage_details: w.coverage_details || '',
          document_key: w.document_key || '',
          notes: w.notes || '',
        });
        setProducts(pRes.data);
      })
      .catch(() => {
        toast.error('Failed to load warranty');
        navigate('/warranties');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateWarranty(id, form);
      toast.success('Warranty updated');
      navigate('/warranties');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update warranty');
    } finally {
      setSaving(false);
    }
  }

  async function handleViewDocument() {
    try {
      const { data } = await getDownloadUrl(form.document_key);
      window.open(data.download_url, '_blank');
    } catch {
      toast.error('Failed to get document URL');
    }
  }

  function getDocumentFileName() {
    if (!form.document_key) return '';
    return form.document_key.split('/').pop();
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Warranty</h1>
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
          {form.document_key && (
            <div className="flex items-center justify-between border rounded-lg p-4 bg-gray-50 mb-3">
              <div className="flex items-center space-x-3">
                <DocumentArrowDownIcon className="h-8 w-8 text-indigo-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{getDocumentFileName()}</p>
                  <p className="text-xs text-green-600">Document attached</p>
                </div>
              </div>
              <button type="button" onClick={handleViewDocument}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                View / Download
              </button>
            </div>
          )}
          <FileUpload
            warrantyId={form.product_id || 'temp'}
            onUploadComplete={(key) => setForm({ ...form, document_key: key })}
            existingFileName=""
          />
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
          <button type="submit" disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 transition">
            {saving ? 'Saving...' : 'Update Warranty'}
          </button>
        </div>
      </form>
    </div>
  );
}
