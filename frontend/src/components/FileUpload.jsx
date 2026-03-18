import { useState } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { uploadFileToS3 } from '../services/api';
import toast from 'react-hot-toast';

const ALLOWED_TYPES = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
const MAX_SIZE_MB = 10;

export default function FileUpload({ warrantyId, onUploadComplete }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file) {
    if (!file) return;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_TYPES.includes(ext)) {
      toast.error('Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`File too large. Maximum size: ${MAX_SIZE_MB} MB`);
      return;
    }

    setUploading(true);
    try {
      const s3Key = await uploadFileToS3(file, warrantyId);
      toast.success('File uploaded successfully');
      if (onUploadComplete) onUploadComplete(s3Key);
    } catch (err) {
      toast.error('Upload failed: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
        dragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
      }`}
    >
      <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        {uploading ? 'Uploading...' : 'Drag & drop a file here, or click to browse'}
      </p>
      <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG, DOC, DOCX up to 10 MB</p>
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        onChange={(e) => handleFile(e.target.files[0])}
        className="hidden"
        id="file-upload"
        disabled={uploading}
      />
      <label
        htmlFor="file-upload"
        className="mt-4 inline-block cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition"
      >
        {uploading ? 'Uploading...' : 'Select File'}
      </label>
    </div>
  );
}
