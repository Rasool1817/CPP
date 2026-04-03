import { useNavigate } from 'react-router-dom';
import { TrashIcon, PencilSquareIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { getDownloadUrl } from '../services/api';
import toast from 'react-hot-toast';

const statusColors = {
  active: 'bg-green-100 text-green-800',
  expiring: 'bg-yellow-100 text-yellow-800',
  expired: 'bg-red-100 text-red-800',
  unknown: 'bg-gray-100 text-gray-800',
};

export default function WarrantyCard({ warranty, onDelete }) {
  const navigate = useNavigate();
  const statusClass = statusColors[warranty.status] || statusColors.unknown;

  async function handleViewDocument(e) {
    e.stopPropagation();
    try {
      const { data } = await getDownloadUrl(warranty.document_key);
      window.open(data.download_url, '_blank');
    } catch {
      toast.error('Failed to get document URL');
    }
  }

  return (
    <div
      onClick={() => navigate(`/warranties/edit/${warranty.id}`)}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition cursor-pointer"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{warranty.provider}</h3>
          <p className="text-sm text-gray-500">{warranty.warranty_type || 'manufacturer'} warranty</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass}`}>
          {warranty.status}
        </span>
      </div>

      <div className="mt-4 space-y-1 text-sm text-gray-600">
        <p>Start: {warranty.start_date}</p>
        <p>End: {warranty.end_date}</p>
        {warranty.days_remaining !== null && warranty.days_remaining !== undefined && (
          <p className="font-medium">
            {warranty.days_remaining >= 0
              ? `${warranty.days_remaining} days remaining`
              : `Expired ${Math.abs(warranty.days_remaining)} days ago`}
          </p>
        )}
        {warranty.coverage_details && (
          <p className="mt-2">Coverage: {warranty.coverage_details}</p>
        )}
      </div>

      {warranty.document_key && (
        <div className="mt-3">
          <button
            onClick={handleViewDocument}
            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800"
          >
            <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
            View Document
          </button>
        </div>
      )}

      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={(e) => { e.stopPropagation(); navigate(`/warranties/edit/${warranty.id}`); }}
          className="text-gray-400 hover:text-indigo-600 transition"
          title="Edit warranty"
        >
          <PencilSquareIcon className="h-5 w-5" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(warranty.id); }}
          className="text-gray-400 hover:text-red-600 transition"
          title="Delete warranty"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
