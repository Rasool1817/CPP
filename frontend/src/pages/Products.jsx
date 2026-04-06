import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listProducts, deleteProduct } from '../services/api';
import ProductCard from '../components/ProductCard';
import DetailModal from '../components/DetailModal';
import { PlusIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const { data } = await listProducts();
      setProducts(data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      setSelectedProduct(null);
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
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
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <Link
          to="/products/add"
          className="inline-flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">No products yet</p>
          <Link
            to="/products/add"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Add your first product
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onDelete={handleDelete}
              onClick={() => setSelectedProduct(product)}
            />
          ))}
        </div>
      )}

      {/* Product Detail Dialog */}
      <DetailModal
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        title="Product Details"
      >
        {selectedProduct && (
          <div>
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedProduct.name}</h3>
                  <p className="text-sm text-gray-500">{selectedProduct.brand}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  {selectedProduct.category}
                </span>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Model Number</span>
                  <span className="text-sm font-medium text-gray-900">{selectedProduct.model_number || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Serial Number</span>
                  <span className="text-sm font-medium text-gray-900">{selectedProduct.serial_number || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Purchase Date</span>
                  <span className="text-sm font-medium text-gray-900">{selectedProduct.purchase_date || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Purchase Price</span>
                  <span className="text-sm font-medium text-gray-900">{selectedProduct.purchase_price ? `$${selectedProduct.purchase_price}` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Retailer</span>
                  <span className="text-sm font-medium text-gray-900">{selectedProduct.retailer || '—'}</span>
                </div>
              </div>

              {selectedProduct.notes && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-gray-700">{selectedProduct.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-5 pt-4 border-t">
              <button
                onClick={() => { setSelectedProduct(null); navigate(`/products/edit/${selectedProduct.id}`); }}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition text-sm"
              >
                <PencilSquareIcon className="h-4 w-4 mr-1" />
                Edit
              </button>
              <button
                onClick={() => handleDelete(selectedProduct.id)}
                className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition text-sm"
              >
                <TrashIcon className="h-4 w-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        )}
      </DetailModal>
    </div>
  );
}
