import { Link } from 'react-router-dom';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

export default function ProductCard({ product, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-500">{product.brand}</p>
        </div>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
          {product.category}
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm text-gray-600">
        {product.model_number && <p>Model: {product.model_number}</p>}
        <p>Purchased: {product.purchase_date}</p>
        {product.purchase_price && <p>Price: ${product.purchase_price}</p>}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <Link
          to={`/products/${product.id}`}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
        >
          View Details
        </Link>
        <div className="flex space-x-2">
          <Link
            to={`/products/edit/${product.id}`}
            className="text-gray-400 hover:text-indigo-600 transition"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </Link>
          <button
            onClick={() => onDelete(product.id)}
            className="text-gray-400 hover:text-red-600 transition"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
