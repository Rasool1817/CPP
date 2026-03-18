import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listProducts, deleteProduct } from '../services/api';
import ProductCard from '../components/ProductCard';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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
            <ProductCard key={product.id} product={product} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
