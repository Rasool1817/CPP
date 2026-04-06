import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listWarranties, listProducts, deleteWarranty, updateWarranty, getDownloadUrl } from '../services/api';
import WarrantyCard from '../components/WarrantyCard';
import DetailModal from '../components/DetailModal';
import { PlusIcon, PencilSquareIcon, TrashIcon, DocumentArrowDownIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Warranties() {
  const [warranties, setWarranties] = useState([]);
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [wRes, pRes] = await Promise.all([listWarranties(), listProducts()]);
      setWarranties(wRes.data);
      setProducts(pRes.data);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this warranty?')) return;
    try {
      await deleteWarranty(id);
      setWarranties(warranties.filter((w) => w.id !== id));
      setSelectedWarranty(null);
      toast.success('Warranty deleted');
    } catch {
      toast.error('Failed to delete warranty');
    }
  }

  function openDetail(warranty) {
    setSelectedWarranty(warranty);
    setEditing(false);
  }

  function startEdit() {
    setEditForm({
      product_id: selectedWarranty.product_id || '',
      provider: selectedWarranty.provider || '',
      start_date: selectedWarranty.start_date || '',
      end_date: selectedWarranty.end_date || '',
      warranty_type: selectedWarranty.warranty_type || 'manufacturer',
      coverage_details: selectedWarranty.coverage_details || '',
      document_key: selectedWarranty.document_key || '',
      notes: selectedWarranty.notes || '',
    });
    setEditing(true);
  }

  async function handleSaveEdit() {
    if (!editForm.provider || !editForm.start_date || !editForm.end_date) {
      toast.error('Provider, start date, and end date are required');
      return;
    }
    setSaving(true);
    try {
      await updateWarranty(selectedWarranty.id, editForm);
      toast.success('Warranty updated');
      setEditing(false);
      setSelectedWarranty(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update warranty');
    } finally {
      setSaving(false);
    }
  }

  function handleEditChange(e) {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  }

  async function handleViewDocument(docKey) {
    try {
      const { data } = await getDownloadUrl(docKey);
      window.open(data.download_url, '_blank');
    } catch {
      toast.error('Failed to get document URL');
    }
  }

  function getProductName(productId) {
    const p = products.find((p) => p.id === productId);
    return p ? `${p.name} (${p.brand})` : productId || '—';
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    expiring: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-800',
  };

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
            <WarrantyCard
              key={warranty.id}
              warranty={warranty}
              onDelete={handleDelete}
              onClick={() => openDetail(warranty)}
            />
          ))}
        </div>
      )}

      {/* Warranty Detail / Edit Dialog */}
      <DetailModal
        isOpen={!!selectedWarranty}
        onClose={() => { setSelectedWarranty(null); setEditing(false); }}
        title={editing ? 'Edit Warranty' : 'Warranty Details'}
      >
        {selectedWarranty && !editing && (
          <div>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedWarranty.provider}</h3>
                  <p className="text-sm text-gray-500">{selectedWarranty.warranty_type || 'manufacturer'} warranty</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[selectedWarranty.status] || 'bg-gray-100 text-gray-800'}`}>
                  {selectedWarranty.status}
                </span>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Product</span>
                  <span className="text-sm font-medium text-gray-900">{getProductName(selectedWarranty.product_id)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Start Date</span>
                  <span className="text-sm font-medium text-gray-900">{selectedWarranty.start_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">End Date</span>
                  <span className="text-sm font-medium text-gray-900">{selectedWarranty.end_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Days Remaining</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedWarranty.days_remaining !== null && selectedWarranty.days_remaining !== undefined
                      ? selectedWarranty.days_remaining >= 0
                        ? `${selectedWarranty.days_remaining} days`
                        : `Expired ${Math.abs(selectedWarranty.days_remaining)} days ago`
                      : '—'}
                  </span>
                </div>
              </div>

              {selectedWarranty.coverage_details && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-1">Coverage Details</p>
                  <p className="text-sm text-gray-700">{selectedWarranty.coverage_details}</p>
                </div>
              )}

              {selectedWarranty.notes && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{selectedWarranty.notes}</p>
                </div>
              )}

              {selectedWarranty.document_key && (
                <div className="border-t pt-3">
                  <button
                    onClick={() => handleViewDocument(selectedWarranty.document_key)}
                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                    View Document
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-5 pt-4 border-t">
              <button
                onClick={startEdit}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm"
              >
                <PencilSquareIcon className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(selectedWarranty.id)}
                className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition text-sm"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        )}

        {selectedWarranty && editing && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product</label>
              <select name="product_id" value={editForm.product_id} onChange={handleEditChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2 text-sm">
                <option value="">Select a product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.brand})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Provider *</label>
              <input name="provider" value={editForm.provider} onChange={handleEditChange} required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Warranty Type</label>
              <select name="warranty_type" value={editForm.warranty_type} onChange={handleEditChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2 text-sm">
                <option value="manufacturer">Manufacturer</option>
                <option value="extended">Extended</option>
                <option value="retailer">Retailer</option>
                <option value="third_party">Third Party</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date *</label>
                <input type="date" name="start_date" value={editForm.start_date} onChange={handleEditChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date *</label>
                <input type="date" name="end_date" value={editForm.end_date} onChange={handleEditChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2 text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Coverage Details</label>
              <textarea name="coverage_details" value={editForm.coverage_details} onChange={handleEditChange} rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2 text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea name="notes" value={editForm.notes} onChange={handleEditChange} rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border px-3 py-2 text-sm" />
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t">
              <button
                onClick={() => setEditing(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition text-sm"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition text-sm"
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}
