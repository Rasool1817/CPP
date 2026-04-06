import { Link } from 'react-router-dom';
import { TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

export default function ProductCard({ product, onDelete, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
    >
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
        <span className="text-indigo-600 text-sm font-medium">Click for details</span>
        <div className="flex space-x-2">
          <Link
            to={`/products/edit/${product.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-indigo-600 transition"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </Link>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(product.id); }}
            className="text-gray-400 hover:text-red-600 transition"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
