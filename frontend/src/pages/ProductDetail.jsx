import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, deleteProduct, listWarranties, listServiceHistory } from '../services/api';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [warranties, setWarranties] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [prodRes, warRes, shRes] = await Promise.all([
          getProduct(id),
          listWarranties(),
          listServiceHistory(id),
        ]);
        setProduct(prodRes.data);
        setWarranties(warRes.data.filter((w) => w.product_id === id));
        setServiceHistory(shRes.data);
      } catch {
        toast.error('Failed to load product');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, navigate]);

  async function handleDelete() {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      navigate('/products');
    } catch {
      toast.error('Failed to delete');
    }
  }

  if (loading || !product) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    expiring: 'bg-yellow-100 text-yellow-800',
    expired: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-gray-500">{product.brand} - {product.category}</p>
        </div>
        <div className="flex space-x-2">
          <Link to={`/products/edit/${id}`}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            <PencilSquareIcon className="h-4 w-4 mr-1" /> Edit
          </Link>
          <button onClick={handleDelete}
            className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-red-700 hover:bg-red-50">
            <TrashIcon className="h-4 w-4 mr-1" /> Delete
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Product Details</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Model:</span> <span className="ml-2">{product.model_number || 'N/A'}</span></div>
          <div><span className="text-gray-500">Serial:</span> <span className="ml-2">{product.serial_number || 'N/A'}</span></div>
          <div><span className="text-gray-500">Purchased:</span> <span className="ml-2">{product.purchase_date}</span></div>
          <div><span className="text-gray-500">Price:</span> <span className="ml-2">{product.purchase_price ? `$${product.purchase_price}` : 'N/A'}</span></div>
          <div><span className="text-gray-500">Retailer:</span> <span className="ml-2">{product.retailer || 'N/A'}</span></div>
        </div>
        {product.notes && <p className="mt-4 text-sm text-gray-600">{product.notes}</p>}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Warranties ({warranties.length})</h2>
          <Link to={`/warranties/add?product_id=${id}`}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            + Add Warranty
          </Link>
        </div>
        {warranties.length === 0 ? (
          <p className="text-gray-500 text-sm">No warranties registered</p>
        ) : (
          <div className="space-y-3">
            {warranties.map((w) => (
              <div key={w.id} className="flex justify-between items-center border-b pb-3">
                <div>
                  <p className="font-medium">{w.provider}</p>
                  <p className="text-sm text-gray-500">{w.start_date} to {w.end_date}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[w.status] || 'bg-gray-100 text-gray-800'}`}>
                  {w.status} {w.days_remaining >= 0 ? `(${w.days_remaining}d)` : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Service History ({serviceHistory.length})</h2>
          <Link to={`/service-history?product_id=${id}`}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            View All
          </Link>
        </div>
        {serviceHistory.length === 0 ? (
          <p className="text-gray-500 text-sm">No service records</p>
        ) : (
          <div className="space-y-3">
            {serviceHistory.slice(0, 5).map((s) => (
              <div key={s.id} className="border-b pb-3">
                <div className="flex justify-between">
                  <p className="font-medium">{s.service_type}</p>
                  <p className="text-sm text-gray-500">{s.service_date}</p>
                </div>
                <p className="text-sm text-gray-600">{s.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
